"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import { LocationSetter } from "@/components/LocationSetter";
import { ImageSlider } from "@/components/ImageSlider";
import { MapPin, ShieldCheck } from "lucide-react";

interface Listing {
 _id: string;
 title: string;
 grade: "A" | "B" | "C" | "D";
 priceFinal: number;
 summary?: string;
 images: string[];
 distanceKm: number;
 lockerId: { name: string; address: string };
 status: string;
}

export default function NearbyListings() {
 const { user, loading } = useAuth();
 const [list, setList] = useState<Listing[]>([]);
 const [error, setError] = useState<string | null>(null);

 useEffect(() => {
 if (loading) return;
 if (!user) return;
 api<Listing[]>("/listings/nearby")
 .then(setList)
 .catch((e) => setError(String(e)));
 }, [user, loading]);

 if (loading) return <div className="p-8 text-slate-500">Loading...</div>;
 if (!user) {
 return (
 <RoleGuard allowed={["buyer", "admin"]}>
 <div />
 </RoleGuard>
 );
 }

 return (
 <RoleGuard allowed={["buyer", "admin"]}>
 <div className="mx-auto max-w-6xl px-4 py-10">
 <div className="flex items-center gap-2 text-sm text-slate-500">
 <MapPin className="size-4" />
 Showing listings within 25 km of {user.address}
 </div>
 <h1 className="mt-2 text-3xl font-bold">Verified items near you</h1>
 <p className="text-slate-600">
 Each item is AI-graded, fixed-price, and pickup-ready at a locker. Zero strangers.
 </p>

 <div className="mt-5 max-w-md">
 <LocationSetter />
 </div>

 {error && (
 <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-rose-700">
 {error}
 </div>
 )}

 {list.length === 0 && !error && (
 <div className="mt-10 card p-8 text-center text-slate-500">
 No listings within 25 km yet. Try generating a return as a seller — that will create one nearby.
 </div>
 )}

 <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
 {list.map((l) => (
 <Link
 key={l._id}
 href={`/buyer/reserve/${l._id}`}
 className="card overflow-hidden hover:shadow-md hover:border-brand-300 transition"
 >
 <div className="relative aspect-video bg-slate-100">
 <ImageSlider images={l.images || []} alt={l.title} className="w-full h-full" />
 <div className="absolute top-3 left-3">
 <GradeBadge grade={l.grade} size="sm" />
 </div>
 <div className="absolute top-3 right-3 pill bg-white/90 text-emerald-700">
 <ShieldCheck className="size-3" />
 Verified
 </div>
 </div>
 <div className="p-4">
 <div className="font-semibold text-slate-900">{l.title}</div>
 <div className="text-xs text-slate-500 line-clamp-2 mt-1">{l.summary}</div>
 <div className="mt-3 flex items-baseline justify-between">
 <div className="text-2xl font-bold text-brand-700">₹{l.priceFinal}</div>
 <div className="text-xs text-slate-500">{l.distanceKm} km · {l.lockerId?.name}</div>
 </div>
 </div>
 </Link>
 ))}
 </div>
 </div>
 </RoleGuard>
 );
}