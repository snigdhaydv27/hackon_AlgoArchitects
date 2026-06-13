"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { GradeBadge } from "@/components/GradeBadge";
import { Sparkles, ShieldCheck, MapPin, Tag, Loader2 } from "lucide-react";

interface RecommendedListing {
  _id: string;
  title: string;
  grade: "A" | "B" | "C" | "D";
  priceFinal: number;
  summary?: string;
  images: string[];
  distanceKm: number;
  lockerId: { name: string; address: string } | null;
  category: string;
  brand?: string;
  originalPrice: number;
  savingsPercent: number;
  score: number;
  reasons: string[];
}

export function RecommendedListings() {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<RecommendedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    api<RecommendedListing[]>("/listings/recommended")
      .then(setListings)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 py-8">
        <Loader2 className="size-4 animate-spin" />
        Finding personalized recommendations...
      </div>
    );
  }

  if (!user) return null;

  if (listings.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-500">
        <Sparkles className="size-6 mx-auto mb-2 text-slate-400" />
        <p className="text-sm">
          No personalized recommendations yet. As more items get listed near you, we&apos;ll match them to your interests.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="size-5 text-amber-500" />
        <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
        <span className="ml-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2.5 py-0.5 font-medium">
          AI Personalized
        </span>
      </div>
      <p className="text-sm text-slate-600">
        Based on your interests ({user.interests?.join(", ") || "all categories"}), purchase history, and location.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <Link
            key={listing._id}
            href={`/buyer/reserve/${listing._id}`}
            className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-md hover:border-emerald-300 transition group"
          >
            {/* Image */}
            <div className="relative aspect-video bg-slate-100">
              {listing.images[0] && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute top-2 left-2">
                <GradeBadge grade={listing.grade} size="sm" />
              </div>
              <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 rounded-full px-2 py-0.5 text-xs text-emerald-700 font-medium">
                <ShieldCheck className="size-3" />
                Verified
              </div>
              {listing.savingsPercent > 0 && (
                <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-rose-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  <Tag className="size-3" />
                  {listing.savingsPercent}% off
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition">
                {listing.title}
              </div>
              {listing.brand && (
                <div className="text-xs text-slate-500 mt-0.5">{listing.brand} · {listing.category}</div>
              )}
              <div className="text-xs text-slate-500 line-clamp-2 mt-1">{listing.summary}</div>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-bold text-emerald-700">₹{listing.priceFinal}</span>
                {listing.originalPrice > listing.priceFinal && (
                  <span className="text-sm text-slate-400 line-through">₹{listing.originalPrice}</span>
                )}
              </div>

              {/* Location */}
              <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="size-3" />
                {listing.distanceKm} km · {listing.lockerId?.name ?? "Locker"}
              </div>

              {/* Recommendation reasons */}
              {listing.reasons.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {listing.reasons.slice(0, 2).map((reason, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 rounded px-1.5 py-0.5"
                    >
                      {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
