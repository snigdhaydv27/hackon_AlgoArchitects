import { Router } from "express";
import { UserModel } from "../models/User.js";
import { signToken, requireAuth, requireDemoMode } from "../middleware/mockAuth.js";
import { reverseGeocode, forwardGeocode } from "../services/geocode.js";
import { validateBody, schemas } from "../middleware/validate.js";
import { isCognitoConfigured, signUp, confirmSignUp, signIn, getUserFromAccessToken, forgotPassword, confirmForgotPassword } from "../services/cognito.js";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { z } from "zod";

const router = Router();

// ============================================================
// DEMO MODE: Persona-based login (no password)
// ============================================================
router.get("/personas", requireDemoMode(), async (_req, res) => {
  const users = await UserModel.find({}).lean();
  res.json(
    users.map((u) => ({
      id: String(u._id),
      name: u.name,
      role: u.role,
      tagline: u.tagline,
      avatar: u.avatar,
      address: u.address,
    }))
  );
});

router.post("/login", requireDemoMode(), async (req, res) => {
  const { personaId } = req.body ?? {};
  if (!personaId) {
    res.status(400).json({ error: "personaId required" });
    return;
  }
  const user = await UserModel.findById(personaId).lean();
  if (!user) {
    res.status(404).json({ error: "Persona not found" });
    return;
  }
  const token = signToken({
    id: String(user._id),
    role: user.role as "seller" | "buyer" | "admin" | "small_seller",
    name: user.name,
  });
  res.json({ token, user: serializeUser(user) });
});

// ============================================================
// PRODUCTION MODE: Cognito-based auth (email + password)
// ============================================================

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(1),
  role: z.enum(["seller", "buyer", "small_seller"]),
  address: z.string().optional(),
});

const confirmSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
});

const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// POST /api/auth/signup — Create account (production only)
router.post("/signup", validateBody(signupSchema), async (req, res, next) => {
  if (env.isDemo) {
    res.status(403).json({ error: "Signup is disabled in demo mode. Use persona login." });
    return;
  }
  if (!isCognitoConfigured()) {
    res.status(503).json({ error: "Auth provider not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID." });
    return;
  }
  try {
    const { email, password, name, role, address } = req.body;
    const cognitoResult = await signUp(email, password, name);

    // Create user in our DB
    const user = await UserModel.create({
      name,
      role,
      email,
      cognitoSub: cognitoResult.userSub,
      address: address ?? "",
      location: { type: "Point", coordinates: [77.5946, 12.9716] }, // default Bangalore
      verified: false,
    });

    logger.info({ email, role, userId: user._id }, "User signed up");
    res.status(201).json({
      message: cognitoResult.confirmed
        ? "Account created. You can log in now."
        : "Account created. Check your email for a verification code.",
      confirmed: cognitoResult.confirmed,
      userId: String(user._id),
    });
  } catch (e: any) {
    if (e.name === "UsernameExistsException") {
      res.status(409).json({ error: "An account with this email already exists." });
      return;
    }
    if (e.name === "InvalidPasswordException") {
      res.status(400).json({ error: e.message ?? "Password does not meet requirements. Use 8+ chars with uppercase, lowercase, number, and special character." });
      return;
    }
    if (e.name === "InvalidParameterException") {
      res.status(400).json({ error: e.message ?? "Invalid input." });
      return;
    }
    next(e);
  }
});

// POST /api/auth/confirm — Verify email with code (production only)
router.post("/confirm", validateBody(confirmSchema), async (req, res, next) => {
  if (!isCognitoConfigured()) {
    res.status(503).json({ error: "Auth provider not configured." });
    return;
  }
  try {
    const { email, code } = req.body;
    await confirmSignUp(email, code);
    await UserModel.updateOne({ email }, { verified: true });
    res.json({ message: "Email verified. You can log in now." });
  } catch (e: any) {
    if (e.name === "CodeMismatchException") {
      res.status(400).json({ error: "Invalid verification code." });
      return;
    }
    next(e);
  }
});

// POST /api/auth/signin — Login with email + password (production only)
router.post("/signin", validateBody(signinSchema), async (req, res, next) => {
  if (env.isDemo) {
    res.status(403).json({ error: "Use /api/auth/login with persona ID in demo mode." });
    return;
  }
  if (!isCognitoConfigured()) {
    res.status(503).json({ error: "Auth provider not configured." });
    return;
  }
  try {
    const { email, password } = req.body;
    const tokens = await signIn(email, password);

    // Get Cognito user info
    const cognitoUser = await getUserFromAccessToken(tokens.accessToken);

    // Find or fail in our DB
    const user = await UserModel.findOne({ email }).lean();
    if (!user) {
      res.status(404).json({ error: "Account not found in ReLoop database. Please sign up first." });
      return;
    }

    // Issue our own JWT (includes role, used by all other endpoints)
    const reloopToken = signToken({
      id: String(user._id),
      role: user.role as "seller" | "buyer" | "admin" | "small_seller",
      name: user.name,
    });

    logger.info({ email, role: user.role }, "User signed in");
    res.json({
      token: reloopToken,
      user: serializeUser(user),
      cognito: { accessToken: tokens.accessToken, expiresIn: tokens.expiresIn },
    });
  } catch (e: any) {
    if (e.name === "NotAuthorizedException") {
      res.status(401).json({ error: "Incorrect email or password." });
      return;
    }
    if (e.name === "UserNotConfirmedException") {
      res.status(403).json({ error: "Please verify your email first. Check your inbox for the code." });
      return;
    }
    next(e);
  }
});

// ============================================================
// PRODUCTION MODE: Forgot Password flow
// ============================================================

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// POST /api/auth/forgot-password — Send reset code to email
router.post("/forgot-password", validateBody(forgotPasswordSchema), async (req, res, next) => {
  if (env.isDemo) {
    res.status(403).json({ error: "Password reset is not available in demo mode." });
    return;
  }
  if (!isCognitoConfigured()) {
    res.status(503).json({ error: "Auth provider not configured." });
    return;
  }
  try {
    const { email } = req.body;
    await forgotPassword(email);
    // Always return success to prevent email enumeration
    res.json({ message: "If an account with that email exists, a reset code has been sent." });
  } catch (e: any) {
    if (e.name === "UserNotFoundException") {
      // Don't reveal whether the user exists
      res.json({ message: "If an account with that email exists, a reset code has been sent." });
      return;
    }
    if (e.name === "LimitExceededException") {
      res.status(429).json({ error: "Too many attempts. Please wait before trying again." });
      return;
    }
    next(e);
  }
});

// POST /api/auth/reset-password — Confirm new password with code
router.post("/reset-password", validateBody(resetPasswordSchema), async (req, res, next) => {
  if (env.isDemo) {
    res.status(403).json({ error: "Password reset is not available in demo mode." });
    return;
  }
  if (!isCognitoConfigured()) {
    res.status(503).json({ error: "Auth provider not configured." });
    return;
  }
  try {
    const { email, code, newPassword } = req.body;
    await confirmForgotPassword(email, code, newPassword);
    res.json({ message: "Password reset successful. You can now sign in with your new password." });
  } catch (e: any) {
    if (e.name === "CodeMismatchException") {
      res.status(400).json({ error: "Invalid or expired reset code." });
      return;
    }
    if (e.name === "ExpiredCodeException") {
      res.status(400).json({ error: "Reset code has expired. Please request a new one." });
      return;
    }
    if (e.name === "InvalidPasswordException") {
      res.status(400).json({ error: e.message ?? "Password does not meet requirements." });
      return;
    }
    next(e);
  }
});

// ============================================================
// SHARED (both modes): /me and /me/location
// ============================================================
router.get("/me", requireAuth, async (req, res) => {
  const u = await UserModel.findById(req.user!.id).lean();
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(serializeUser(u));
});

// ============================================================
// Seller Razorpay settings
// ============================================================
router.get("/me/payment-settings", requireAuth, async (req, res) => {
  if (req.user!.role !== "seller" && req.user!.role !== "small_seller") {
    res.status(403).json({ error: "Only sellers can access payment settings" });
    return;
  }
  const u = await UserModel.findById(req.user!.id).lean();
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    razorpayKeyId: (u as any).razorpayKeyId || "",
    configured: Boolean((u as any).razorpayKeyId && (u as any).razorpayKeySecret),
  });
});

router.put("/me/payment-settings", requireAuth, async (req, res) => {
  if (req.user!.role !== "seller" && req.user!.role !== "small_seller") {
    res.status(403).json({ error: "Only sellers can update payment settings" });
    return;
  }
  const { razorpayKeyId, razorpayKeySecret } = req.body ?? {};
  if (!razorpayKeyId) {
    res.status(400).json({ error: "razorpayKeyId is required" });
    return;
  }
  if (!razorpayKeyId.startsWith("rzp_")) {
    res.status(400).json({ error: "Invalid Razorpay Key ID format. It should start with 'rzp_'" });
    return;
  }

  const updateFields: Record<string, string> = { razorpayKeyId };
  // Only update secret if provided (allows keeping existing)
  if (razorpayKeySecret) {
    updateFields.razorpayKeySecret = razorpayKeySecret;
  }

  await UserModel.findByIdAndUpdate(req.user!.id, updateFields);

  res.json({ ok: true, message: "Payment settings saved successfully" });
});

router.put("/me/location", requireAuth, async (req, res) => {
  const { lat, lng, address } = req.body ?? {};
  let coords: [number, number] | null = null;
  let resolvedAddress = "";

  if (typeof lat === "number" && typeof lng === "number") {
    coords = [lng, lat];
    const geo = await reverseGeocode(lat, lng);
    resolvedAddress = geo?.display ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } else if (typeof address === "string" && address.trim().length > 2) {
    const geo = await forwardGeocode(address);
    if (!geo) {
      res.status(400).json({ error: "Could not geocode that address" });
      return;
    }
    coords = [geo.lng, geo.lat];
    resolvedAddress = geo.display;
  } else {
    res.status(400).json({ error: "Provide lat+lng or address" });
    return;
  }

  const updated = await UserModel.findByIdAndUpdate(
    req.user!.id,
    { location: { type: "Point", coordinates: coords }, address: resolvedAddress },
    { new: true }
  ).lean();

  if (!updated) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(serializeUser(updated));
});

// ============================================================
function serializeUser(u: Record<string, unknown> & { _id: unknown }) {
  return {
    id: String(u._id),
    name: u.name,
    role: u.role,
    avatar: u.avatar,
    address: u.address,
    location: u.location,
    profile: u.profile,
    interests: u.interests,
  };
}

export default router;
