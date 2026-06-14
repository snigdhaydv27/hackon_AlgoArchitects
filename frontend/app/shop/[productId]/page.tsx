"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { RoleGuard } from "@/components/RoleGuard";
import { AlertTriangle, Sparkles, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  category: string;
  brand?: string;
  originalPrice: number;
  description?: string;
  variants: { sizes: string[]; colors: string[] };
}

interface PreventionResp {
  warning: boolean;
  recommendedVariant?: string;
  message?: string;
  sampleSize?: number;
  confidence?: number;
}

export default function ProductPage() {
  const params = useParams<{ productId: string }>();
  const { user } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [size, setSize] = useState<string>("");
  const [warning, setWarning] = useState<PreventionResp | null>(null);
  const [checking, setChecking] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!params.productId) return;
    api<Product>(`/products/${params.productId}`).then((p) => {
      setProduct(p);
      const first = p.variants.sizes[0] ?? "";
      setSize(first);
    });
  }, [params.productId]);

  // AUTO-FIRE prevention check whenever size changes (no manual button click).
  useEffect(() => {
    if (!product || !size) return;
    let cancelled = false;
    setChecking(true);
    setWarning(null);
    api<PreventionResp>("/prevention/check", {
      method: "POST",
      body: JSON.stringify({ productId: product._id, variant: size }),
    })
      .then((r) => {
        if (!cancelled) setWarning(r);
      })
      .catch(() => {
        // ignore — likely not logged in
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product, size]);

  if (!product) return <div className="p-8 text-slate-500">Loading...</div>;

  return (
    <RoleGuard allowed={["buyer", "admin"]}>
    <div className="mx-auto max-w-5xl px-4 py-10 grid gap-8 lg:grid-cols-2">
      <div className="card aspect-square bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-slate-400">
        Product image
      </div>
      <div>
        <div className="text-xs text-slate-500 uppercase">{product.brand}</div>
        <h1 className="text-3xl font-bold mt-1">{product.title}</h1>
        <div className="text-3xl font-bold text-slate-900 mt-3">₹{product.originalPrice}</div>
        <p className="mt-4 text-slate-600">{product.description}</p>

        {product.variants.sizes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-slate-700">Size</div>
              {checking && (
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Loader2 className="size-3 animate-spin" />
                  Auto-checking your fit...
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {product.variants.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={
                    "px-4 py-2 rounded-lg border text-sm transition " +
                    (size === s
                      ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold"
                      : "border-slate-300 text-slate-700 hover:border-brand-300")
                  }
                >
                  {s}
                </button>
              ))}
            </div>
            {user?.profile?.footLengthMm && (
              <div className="mt-3 text-xs text-slate-500">
                Your foot profile: {user.profile.footLengthMm}mm — Amazon auto-checks this against return data.
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={async () => {
              if (!product) return;
              await addToCart(product._id, size);
              setAdded(true);
              setTimeout(() => setAdded(false), 3000);
            }}
            disabled={cartLoading}
            className="btn-primary"
          >
            {cartLoading ? <Loader2 className="size-4 animate-spin" /> : null}
            {added ? "✓ Added to cart" : "Add to cart"}
          </button>
          {added && (
            <a href="/cart" className="flex items-center gap-1 text-sm text-brand-600 hover:underline font-medium">
              <CheckCircle2 className="size-4" /> View cart
            </a>
          )}
        </div>

        {warning && warning.warning && (
          <div className="mt-6 card p-5 border-amber-300 bg-amber-50">
            <div className="flex items-center gap-2 text-amber-700 font-semibold">
              <AlertTriangle className="size-5" />
              Amazon Prevention Alert (auto-fired)
            </div>
            <p className="mt-3 text-sm text-amber-800">{warning.message}</p>
            <div className="mt-3 text-xs text-amber-700">
              Sample size: {warning.sampleSize} · Confidence: {Math.round((warning.confidence ?? 0) * 100)}%
            </div>
            {warning.recommendedVariant && (
              <button
                onClick={() => {
                  const rec = warning.recommendedVariant!;
                  // Reward avoiding a likely return before it happens (non-blocking).
                  api("/prevention/accept", {
                    method: "POST",
                    body: JSON.stringify({ productId: product._id }),
                  }).catch(() => {});
                  setSize(rec);
                }}
                className="btn-primary mt-4 text-sm"
              >
                Switch to Size {warning.recommendedVariant} & earn green credits
              </button>
            )}
            <div className="mt-4 text-xs text-slate-600 border-t border-amber-200 pt-3">
              <ShieldCheck className="size-3 inline mr-1 text-emerald-600" />
              The most circular outcome is the return that never starts. Auto-prevention removes the click.
            </div>
          </div>
        )}

        {warning && !warning.warning && size && (
          <div className="mt-6 card p-5 border-emerald-200 bg-emerald-50 text-sm text-emerald-700">
            <ShieldCheck className="inline size-4 mr-1" />
            <Sparkles className="inline size-4 mr-1" />
            Auto-checked: no mismatch detected for Size {size} against your profile. Good to go.
          </div>
        )}
      </div>
    </div>
    </RoleGuard>
  );
}
