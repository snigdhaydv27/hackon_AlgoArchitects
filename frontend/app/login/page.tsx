"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { User, ShieldCheck, Briefcase, ShoppingBag, Mail, Lock, Loader2 } from "lucide-react";

interface Persona {
  id: string;
  name: string;
  role: string;
  tagline?: string;
  address?: string;
}

type Mode = "personas" | "signin" | "signup" | "confirm" | "forgot" | "reset";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [list, setList] = useState<Persona[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect already logged-in users to their home page
  useEffect(() => {
    if (!authLoading && user) {
      const dest = user.role === "admin" ? "/admin" : user.role === "buyer" ? "/buyer/nearby" : "/seller/return/new";
      router.replace(dest);
    }
  }, [user, authLoading, router]);

  // Try to load personas — if 403, we're in production mode
  useEffect(() => {
    api<Persona[]>("/auth/personas")
      .then((personas) => {
        setList(personas);
        setMode("personas"); // demo mode
      })
      .catch(() => {
        setMode("signin"); // production mode
      });
  }, []);

  // If already logged in, show nothing while redirecting
  if (authLoading || user) {
    return <div className="p-8 text-slate-500">Loading...</div>;
  }

  // --- DEMO MODE: Persona picker ---
  async function pickPersona(p: Persona) {
    setLoading(p.id);
    try {
      const u = await login(p.id);
      const dest = u.role === "admin" ? "/admin" : u.role === "buyer" ? "/buyer/nearby" : "/seller/return/new";
      router.push(dest);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(null);
    }
  }

  // --- PRODUCTION MODE ---
  if (mode === "personas" && list.length > 0) {
    return <PersonaPicker list={list} loading={loading} error={error} onPick={pickPersona} />;
  }

  return <AuthForm mode={mode} setMode={setMode} />;
}

// ============================================================
// Production Auth Form
// ============================================================
function AuthForm({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"seller" | "buyer" | "small_seller">("seller");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { loginWithToken } = useAuth();
  const router = useRouter();

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api<{ token: string; user: any }>("/auth/signin", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      loginWithToken(resp.token, resp.user);
      const dest = resp.user.role === "admin" ? "/admin" : resp.user.role === "buyer" ? "/buyer/nearby" : "/seller/return/new";
      router.push(dest);
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api<{ message: string; confirmed: boolean }>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name, role }),
      });
      setMessage(resp.message);
      if (!resp.confirmed) {
        setMode("confirm");
      } else {
        setMode("signin");
      }
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/auth/confirm", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      });
      setMessage("Email verified! You can sign in now.");
      setMode("signin");
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(resp.message);
      setMode("reset");
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const resp = await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, code, newPassword: password }),
      });
      setMessage(resp.message);
      setPassword("");
      setCode("");
      setMode("signin");
    } catch (e: any) {
      setError(e.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-bold text-center">
        {mode === "signin" ? "Sign in to Amazon" : mode === "signup" ? "Create your account" : mode === "forgot" ? "Forgot password" : mode === "reset" ? "Reset password" : "Verify your email"}
      </h1>
      <p className="text-slate-600 text-center mt-2">
        {mode === "signin"
          ? "Enter your email and password"
          : mode === "signup"
          ? "Join as a seller or buyer"
          : mode === "forgot"
          ? "Enter your email to receive a reset code"
          : mode === "reset"
          ? "Enter the code and your new password"
          : "Enter the 6-digit code sent to your email"}
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-sm text-rose-700">{error}</div>
      )}
      {message && (
        <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700">{message}</div>
      )}

      {mode === "signin" && (
        <form onSubmit={handleSignIn} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="••••••••" />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="button" onClick={() => { setMode("forgot"); setError(null); setMessage(null); }}
              className="text-sm text-brand-600 font-medium hover:underline">
              Forgot password?
            </button>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Sign in
          </button>
          <p className="text-sm text-center text-slate-600">
            Don&apos;t have an account?{" "}
            <button type="button" onClick={() => { setMode("signup"); setError(null); setMessage(null); }} className="text-brand-600 font-medium">
              Sign up
            </button>
          </p>
        </form>
      )}

      {mode === "signup" && (
        <form onSubmit={handleSignUp} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Full name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">I am a...</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["seller", "buyer", "small_seller"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={"rounded-lg border px-3 py-2 text-sm transition " +
                    (role === r ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold" : "border-slate-300 text-slate-600")}>
                  {r === "small_seller" ? "Seller (biz)" : r === "seller" ? "Seller" : "Buyer"}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Create account
          </button>
          <p className="text-sm text-center text-slate-600">
            Already have an account?{" "}
            <button type="button" onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className="text-brand-600 font-medium">
              Sign in
            </button>
          </p>
        </form>
      )}

      {mode === "confirm" && (
        <form onSubmit={handleConfirm} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Verification code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-center text-2xl tracking-widest" placeholder="123456" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Verify email
          </button>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={handleForgotPassword} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="you@example.com" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Send reset code
          </button>
          <p className="text-sm text-center text-slate-600">
            Remember your password?{" "}
            <button type="button" onClick={() => { setMode("signin"); setError(null); setMessage(null); }} className="text-brand-600 font-medium">
              Sign in
            </button>
          </p>
        </form>
      )}

      {mode === "reset" && (
        <form onSubmit={handleResetPassword} className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Reset code</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value)} required
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-300 text-sm text-center text-2xl tracking-widest" placeholder="123456" />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">New password</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-2.5 size-4 text-slate-400" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-slate-300 text-sm" placeholder="Min 8 characters" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            Reset password
          </button>
          <p className="text-sm text-center text-slate-600">
            <button type="button" onClick={() => { setMode("forgot"); setError(null); setMessage(null); }} className="text-brand-600 font-medium">
              Resend code
            </button>
          </p>
        </form>
      )}
    </div>
  );
}

// ============================================================
// Demo Persona Picker (unchanged)
// ============================================================
function PersonaPicker({ list, loading, error, onPick }: {
  list: Persona[]; loading: string | null; error: string | null; onPick: (p: Persona) => void;
}) {
  const grouped: Record<string, Persona[]> = {};
  for (const p of list) (grouped[p.role] ??= []).push(p);
  const order = ["seller", "small_seller", "buyer", "admin"];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Pick a demo persona</h1>
      <p className="text-slate-600 mt-2">Demo mode — one click, you&apos;re in.</p>
      {error && <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-4 text-rose-700">{error}</div>}
      <div className="mt-8 space-y-8">
        {order.map((role) =>
          grouped[role]?.length ? (
            <div key={role}>
              <h2 className="font-semibold text-slate-700 mb-3 capitalize">{labelFor(role)}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {grouped[role].map((p) => (
                  <button key={p.id} onClick={() => onPick(p)} disabled={loading !== null}
                    className="card p-5 text-left hover:border-brand-400 hover:shadow-md transition disabled:opacity-50">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                        {iconFor(role)}
                      </div>
                      <div>
                        <div className="font-semibold">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.address}</div>
                      </div>
                    </div>
                    {p.tagline && <p className="text-sm text-slate-600 mt-3">{p.tagline}</p>}
                    <div className="mt-3 text-xs text-brand-700 font-medium">
                      {loading === p.id ? "Logging in..." : "Login as " + p.name.split(" ")[0]} →
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}

function iconFor(role: string) {
  if (role === "admin") return <ShieldCheck className="size-5" />;
  if (role === "buyer") return <ShoppingBag className="size-5" />;
  if (role === "small_seller") return <Briefcase className="size-5" />;
  return <User className="size-5" />;
}
function labelFor(role: string) {
  if (role === "small_seller") return "Small Seller";
  if (role === "seller") return "Sellers (consumers)";
  if (role === "buyer") return "Verified Buyers";
  return "Admin";
}
