"use client";

import { RoleGuard } from "@/components/RoleGuard";
import { RecommendedListings } from "@/components/RecommendedListings";
import { Sparkles } from "lucide-react";

export default function RecommendedPage() {
  return (
    <RoleGuard allowed={["buyer"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Sparkles className="size-4 text-amber-500" />
          AI-powered personalized picks based on your interests &amp; purchase history
        </div>
        <h1 className="mt-2 text-3xl font-bold">Recommended for You</h1>
        <p className="text-slate-600">
          Certified refurbished items matched to your preferences, graded by AI, and available at nearby lockers.
        </p>
        <div className="mt-8">
          <RecommendedListings />
        </div>
      </div>
    </RoleGuard>
  );
}
