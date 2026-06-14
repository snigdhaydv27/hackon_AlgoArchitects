"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";

interface Product {
  _id: string;
  title: string;
  category: string;
  brand?: string;
  originalPrice: number;
  images: string[];
  variants: { sizes: string[]; colors: string[] };
}

export default function Shop() {
  const [list, setList] = useState<Product[]>([]);

  useEffect(() => {
    api<Product[]>("/products").then(setList);
  }, []);

  return (
    <RoleGuard allowed={["buyer", "admin"]}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-3xl font-bold">Shop new (with prevention)</h1>
        <p className="text-slate-600">
          New product purchase flow with ReLoop&apos;s pre-purchase AI warning. Try Sparx Running Shoes — the prevention layer triggers there.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Link
              key={p._id}
              href={`/shop/${p._id}`}
              className="card overflow-hidden hover:border-brand-300 hover:shadow-md transition"
            >
              <div className="aspect-video bg-slate-100" />
              <div className="p-4">
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-slate-500">{p.brand} · {p.category}</div>
                <div className="text-xl font-bold text-slate-900 mt-2">₹{p.originalPrice}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </RoleGuard>
  );
}
