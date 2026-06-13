"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CreditCard, CheckCircle2, Loader2, Eye, EyeOff, AlertTriangle } from "lucide-react";

export function PaymentSettings() {
  const [keyId, setKeyId] = useState("");
  const [keySecret, setKeySecret] = useState("");
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    api<{ razorpayKeyId: string; configured: boolean }>("/auth/me/payment-settings")
      .then((data) => {
        setKeyId(data.razorpayKeyId || "");
        setConfigured(data.configured);
      })
      .catch(() => {
        // If the call fails (not a seller, etc.), just show empty form
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      await api("/auth/me/payment-settings", {
        method: "PUT",
        body: JSON.stringify({ razorpayKeyId: keyId, razorpayKeySecret: keySecret }),
      });
      setMessage({ type: "success", text: "Payment settings saved! Buyers will now pay directly to your Razorpay account." });
      setConfigured(true);
      setKeySecret("");
    } catch (err) {
      setMessage({ type: "error", text: String(err) });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-[#d5d9d9] rounded-md shadow-sm p-6 flex items-center gap-2 text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        Loading payment settings...
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#d5d9d9] rounded-md shadow-sm p-6">
      <div className="flex items-center gap-2 mb-1">
        <CreditCard className="size-5 text-emerald-600" />
        <h3 className="font-bold text-lg text-slate-900">Payment Settings</h3>
        {configured && (
          <span className="ml-auto flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
            <CheckCircle2 className="size-3" />
            Connected
          </span>
        )}
      </div>

      {!configured && (
        <div className="flex items-start gap-2 mt-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            You must connect your Razorpay account to receive payments from buyers. Without this, buyers cannot pay for your listed items.
          </p>
        </div>
      )}

      <p className="text-sm text-slate-600 mb-4">
        Add your Razorpay Key ID and Secret so buyers pay directly into your account. Get your keys from{" "}
        <a
          href="https://dashboard.razorpay.com/app/keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-600 underline font-medium"
        >
          Razorpay Dashboard → API Keys
        </a>.
      </p>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Razorpay Key ID
          </label>
          <input
            type="text"
            value={keyId}
            onChange={(e) => setKeyId(e.target.value)}
            placeholder="rzp_live_XXXXXXXXXXXXXXX or rzp_test_XXXXXXXXXXXXXXX"
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Razorpay Key Secret
          </label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={keySecret}
              onChange={(e) => setKeySecret(e.target.value)}
              placeholder={configured ? "••••••••••••••••••••" : "Enter your key secret"}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              required={!configured}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {configured && (
            <p className="text-xs text-slate-500 mt-1">
              Leave blank to keep your existing secret. Enter a new value to update.
            </p>
          )}
        </div>

        {message && (
          <div
            className={`text-sm rounded-lg p-3 border ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <button
          type="submit"
          disabled={saving || !keyId}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
          {configured ? "Update Payment Settings" : "Connect Razorpay Account"}
        </button>
      </form>
    </div>
  );
}
