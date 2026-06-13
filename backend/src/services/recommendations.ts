import { ListingModel } from "../models/Listing.js";
import { ProductModel } from "../models/Product.js";
import { haversineKm } from "../utils/distance.js";

interface UserDoc {
  _id: unknown;
  interests?: string[] | null;
  location?: { coordinates: number[] } | null;
  profile?: { brand?: string | null; preferredSize?: string | null } | null;
}

interface ScoredListing {
  _id: string;
  title: string;
  grade: string;
  priceFinal: number;
  summary?: string;
  images: string[];
  distanceKm: number;
  lockerId: { name: string; address: string } | null;
  status: string;
  category: string;
  brand?: string;
  originalPrice: number;
  savingsPercent: number;
  score: number;
  reasons: string[];
}

const GRADE_SCORE: Record<string, number> = { A: 40, B: 30, C: 15, D: 5 };

/**
 * Personalized recommendation engine.
 * Scoring formula:
 *   +40  if listing category matches a buyer interest
 *   +20  if listing brand matches buyer preferred brand
 *   +15  if buyer has previously bought items in this category (purchase history)
 *   +10-40 grade bonus (A=40, B=30, C=15, D=5)
 *   +0-20  proximity bonus (closer = more points, linear decay over 50km)
 *   +10  savings bonus (items with >40% savings)
 *
 * Returns top 20 scored listings within 50km, sorted by score descending.
 */
export async function getRecommendations(user: UserDoc): Promise<ScoredListing[]> {
  const userCoords = user.location?.coordinates as [number, number] | undefined;
  if (!userCoords) return [];

  const interests = user.interests ?? [];
  const preferredBrand = user.profile?.brand ?? "";

  // Get buyer's purchase history (completed/paid listings) to learn category preferences
  const pastPurchases = await ListingModel.find({
    buyerId: user._id,
    status: { $in: ["PAID", "COMPLETE"] },
  })
    .populate("productId", "category")
    .lean();

  const purchasedCategories = new Set<string>();
  for (const p of pastPurchases) {
    const prod = p.productId as unknown as { category?: string };
    if (prod?.category) purchasedCategories.add(prod.category);
  }

  // Fetch all LIVE listings within 50km with product populated
  const listings = await ListingModel.find({
    status: "LIVE",
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: userCoords },
        $maxDistance: 50_000, // 50km
      },
    },
  })
    .populate("lockerId", "name address")
    .populate("productId", "category brand originalPrice")
    .lean();

  // Score each listing
  const scored: ScoredListing[] = listings.map((listing) => {
    const product = listing.productId as unknown as {
      category?: string;
      brand?: string;
      originalPrice?: number;
    };
    const category = product?.category ?? "";
    const brand = product?.brand ?? "";
    const originalPrice = product?.originalPrice ?? listing.priceFinal * 2;
    const distanceKm = haversineKm(
      userCoords,
      listing.location!.coordinates as [number, number]
    );
    const savingsPercent = Math.round(
      ((originalPrice - listing.priceFinal) / originalPrice) * 100
    );

    let score = 0;
    const reasons: string[] = [];

    // Interest match
    if (interests.length > 0 && interests.includes(category)) {
      score += 40;
      reasons.push(`Matches your interest in ${category}`);
    }

    // Brand match
    if (preferredBrand && brand.toLowerCase() === preferredBrand.toLowerCase()) {
      score += 20;
      reasons.push(`Your preferred brand: ${brand}`);
    }

    // Purchase history match
    if (purchasedCategories.has(category)) {
      score += 15;
      reasons.push(`You've bought ${category} before`);
    }

    // Grade bonus
    const gradeScore = GRADE_SCORE[listing.grade] ?? 10;
    score += gradeScore;
    if (listing.grade === "A" || listing.grade === "B") {
      reasons.push(`Grade ${listing.grade}: ${listing.grade === "A" ? "Like new" : "Lightly used"}`);
    }

    // Proximity bonus (max 20 points, linear decay over 50km)
    const proximityScore = Math.max(0, 20 - (distanceKm / 50) * 20);
    score += Math.round(proximityScore);
    if (distanceKm <= 5) {
      reasons.push(`Very close to you (${distanceKm.toFixed(1)} km)`);
    }

    // Savings bonus
    if (savingsPercent > 40) {
      score += 10;
      reasons.push(`${savingsPercent}% savings vs new`);
    }

    const locker = listing.lockerId as unknown as { name: string; address: string } | null;

    return {
      _id: String(listing._id),
      title: listing.title,
      grade: listing.grade,
      priceFinal: listing.priceFinal,
      summary: listing.summary ?? undefined,
      images: listing.images ?? [],
      distanceKm: Math.round(distanceKm * 100) / 100,
      lockerId: locker,
      status: listing.status,
      category,
      brand,
      originalPrice,
      savingsPercent,
      score,
      reasons,
    };
  });

  // Sort by score descending, take top 20
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 20);
}
