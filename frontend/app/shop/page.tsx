"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { GradeBadge } from "@/components/GradeBadge";
import { Recycle, ShoppingBag, MapPin, Sparkles, Leaf } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  category: string;
  brand?: string;
  originalPrice: number;
  images: string[];
  variants: { sizes: string[]; colors: string[] };
}

interface ShopListing {
  _id: string;
  title: string;
  grade: string;
  priceFinal: number;
  originalPrice: number;
  savingsPercent: number;
  summary?: string;
  images: string[];
  category: string;
  brand: string;
  locker: { name: string; address: string } | null;
  status: string;
  createdAt: string;
  isReturnedItem: boolean;
}

type Tab = "new" | "returned";

export default function Shop() {
  const [tab, setTab] = useState<Tab>("new");
  const [products, setProducts] = useState<Product[]>([]);
  const [returnedItems, setReturnedItems] = useState<ShopListing[]>([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingReturned, setLoadingReturned] = useState(true);

  useEffect(() => {
    api<Product[]>("/products")
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoadingNew(false));
    api<{ items: ShopListing[] }>("/listings/shop")
      .then((r) => setReturnedItems(r.items))
      .catch(() => setReturnedItems([]))
      .finally(() => setLoadingReturned(false));
  }, []);

  return (
    <RoleGuard allowed={["buyer", "admin"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Shop</h1>
        <p className="text-slate-600">
          Browse new products or discover returned items verified by AI — save money and reduce waste.
        </p>

        {/* Tab Switcher */}
        <div className="mt-6 flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          <TabBtn active={tab === "new"} onClick={() => setTab("new")}>
            <ShoppingBag className="size-4" />
            New Items ({products.length})
          </TabBtn>
          <TabBtn active={tab === "returned"} onClick={() => setTab("returned")}>
            <Recycle className="size-4" />
            Returned Items ({returnedItems.length})
          </TabBtn>
        </div>

        {/* NEW ITEMS TAB */}
        {tab === "new" && (
          <>
            {loadingNew ? (
              <div className="mt-8 text-center text-slate-500">Loading...</div>
            ) : products.length === 0 ? (
              <div className="mt-10 text-center py-16">
                <ShoppingBag className="size-12 text-slate-300 mx-auto" />
                <p className="mt-4 text-slate-500 text-lg">No products available</p>
              </div>
            ) : (
              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Link
                    key={p._id}
                    href={`/shop/${p._id}`}
                    className="card overflow-hidden hover:border-brand-300 hover:shadow-md transition"
                  >
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="size-8 text-slate-300" />
                      )}
                    </div>
                    <div className="p-4">
                      <div className="font-semibold">{p.title}</div>
                      <div className="text-xs text-slate-500">{p.brand} · {p.category}</div>
                      <div className="text-xl font-bold text-slate-900 mt-2">₹{p.originalPrice}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* RETURNED ITEMS TAB */}
        {tab === "returned" && (
          <>
            {/* Info banner */}
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
              <Leaf className="size-4 shrink-0" />
              <span>
                These items were returned and verified by AI. Each purchase diverts an item from landfill and earns you Green Credits.
              </span>
            </div>

            {loadingReturned ? (
              <div className="mt-8 text-center text-slate-500">Loading...</div>
            ) : returnedItems.length === 0 ? (
              <div className="mt-10 text-center py-16">
                <Recycle className="size-12 text-slate-300 mx-auto" />
                <p className="mt-4 text-slate-500 text-lg">No returned items available yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  When sellers list returned items for resale, they will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {returnedItems.map((item) => (
                  <Link
                    key={item._id}
                    href={`/buyer/reserve/${item._id}`}
                    className="card overflow-hidden hover:border-emerald-300 hover:shadow-md transition group"
                  >
                    {/* Image */}
                    <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden relative">
                      {item.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <Recycle className="size-8 text-slate-300" />
                      )}
                      {/* Grade badge overlay */}
                      <div className="absolute top-2 right-2">
                        <GradeBadge grade={item.grade as any} size="sm" />
                      </div>
                      {/* Savings badge */}
                      {item.savingsPercent > 0 && (
                        <div className="absolute top-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {item.savingsPercent}% OFF
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] bg-amber-100 text-amber-700 font-medium px-1.5 py-0.5 rounded">
                          AI Verified
                        </span>
                        <Sparkles className="size-3 text-amber-500" />
                      </div>
                      <div className="font-semibold mt-1.5 text-sm group-hover:text-emerald-700 transition">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {item.brand} · {item.category}
                      </div>
                      {item.summary && (
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.summary}</p>
                      )}
                      {/* Price */}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900">₹{item.priceFinal}</span>
                        <span className="text-sm text-slate-400 line-through">₹{item.originalPrice}</span>
                      </div>
                      {/* Locker info */}
                      {item.locker && (
                        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="size-3" />
                          <span className="truncate">{item.locker.name}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </RoleGuard>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer flex items-center gap-1.5 ${
        active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}
