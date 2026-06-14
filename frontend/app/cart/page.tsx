"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { RoleGuard } from "@/components/RoleGuard";
import { Trash2, Minus, Plus, ShoppingBag, MapPin, Loader2, CreditCard, CheckCircle2 } from "lucide-react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function CartPage() {
  const { user } = useAuth();
  const { cart, itemCount, totalAmount, removeItem, updateQuantity, refresh } = useCart();
  const router = useRouter();

  const [step, setStep] = useState<"cart" | "address" | "payment">("cart");
  const [address, setAddress] = useState(user?.address || "");
  const [processing, setProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    if (!address.trim()) {
      setError("Please enter a delivery address");
      return;
    }
    setError(null);
    setProcessing(true);

    try {
      const res = await api<{
        order: { _id: string; totalAmount: number; status: string };
        razorpayOrder: { id: string; amount: number; currency: string };
        keyId: string;
      }>("/cart/checkout", {
        method: "POST",
        body: JSON.stringify({ shippingAddress: address }),
      });

      // Load Razorpay SDK if not already loaded
      if (!window.Razorpay) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Razorpay"));
          document.body.appendChild(script);
        });
      }

      // Open Razorpay checkout
      const rzp = new window.Razorpay!({
        key: res.keyId,
        amount: res.razorpayOrder.amount,
        currency: res.razorpayOrder.currency,
        order_id: res.razorpayOrder.id,
        name: "ReLoop",
        description: `Order — ${itemCount} item${itemCount > 1 ? "s" : ""}`,
        prefill: { name: user?.name ?? "" },
        theme: { color: "#1eb877" },
        handler: async (resp: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await api("/cart/verify-payment", {
              method: "POST",
              body: JSON.stringify({
                orderId: res.order._id,
                ...resp,
              }),
            });
            setOrderSuccess(true);
            await refresh();
          } catch (e) {
            setError(String(e));
          }
        },
      });
      rzp.open();
    } catch (e) {
      setError(String(e));
    } finally {
      setProcessing(false);
    }
  }

  if (orderSuccess) {
    return (
      <RoleGuard allowed={["buyer", "admin"]}>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="size-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Order Placed!</h1>
          <p className="text-slate-600 mt-2">
            Your order has been confirmed and will be delivered to your address.
          </p>
          <p className="text-sm text-slate-500 mt-1">Delivering to: {address}</p>
          <div className="mt-6 flex gap-3 justify-center">
            <button onClick={() => router.push("/shop")} className="btn-primary">Continue Shopping</button>
            <button onClick={() => router.push("/buyer/nearby")} className="btn-secondary">Browse Nearby</button>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowed={["buyer", "admin"]}>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        {(!cart || cart.items.length === 0) ? (
          <div className="mt-10 card p-8 text-center text-slate-500">
            <ShoppingBag className="size-10 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-700">Your cart is empty</p>
            <p className="text-sm mt-1">Browse the shop to add items</p>
            <button onClick={() => router.push("/shop")} className="btn-primary mt-4">Go to Shop</button>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item._id} className="card p-4 flex gap-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                    {item.productId?.images?.[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.productId.images[0]} alt={item.productId.title} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <ShoppingBag className="size-6 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{item.productId?.title}</div>
                    <div className="text-xs text-slate-500">
                      {item.productId?.brand} · {item.productId?.category}
                      {item.variant && ` · Size ${item.variant}`}
                    </div>
                    <div className="text-lg font-bold text-slate-900 mt-1">₹{item.productId?.originalPrice}</div>
                    <div className="mt-2 flex items-center gap-3">
                      <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-1 rounded border border-slate-300 hover:bg-slate-50 disabled:opacity-30">
                        <Minus className="size-3" />
                      </button>
                      <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="p-1 rounded border border-slate-300 hover:bg-slate-50">
                        <Plus className="size-3" />
                      </button>
                      <button onClick={() => removeItem(item._id)} className="ml-auto text-rose-500 hover:text-rose-700 text-xs font-medium flex items-center gap-1">
                        <Trash2 className="size-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary + Address + Checkout */}
            <div className="space-y-4">
              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-3">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Items ({itemCount})</span>
                    <span className="font-medium">₹{totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Delivery</span>
                    <span className="text-emerald-600 font-medium">FREE</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Delivered to your doorstep by the platform</p>
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-700">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="card p-5">
                <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <MapPin className="size-4 text-brand-600" />
                  Delivery Address
                </h3>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter your full delivery address (house no., street, city, pincode)..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <p className="text-xs text-slate-500 mt-1">Standard delivery by the platform. Estimated 3-5 business days.</p>
              </div>

              {error && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">{error}</div>
              )}

              <button
                onClick={handleCheckout}
                disabled={processing || !address.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold text-sm py-3 px-4 rounded-lg transition disabled:opacity-50"
              >
                {processing ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                Place Order — ₹{totalAmount}
              </button>
              <p className="text-xs text-slate-500 text-center">
                Secure payment via Razorpay. Free delivery to your address. ReLoop&apos;s AI prevention helps you pick the right size to avoid returns.
              </p>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}
