"use client";

import { useState } from "react";
import { useAuth, AuthUser } from "@/lib/auth";
import { api } from "@/lib/api";
import { RoleGuard } from "@/components/RoleGuard";
import { MapPin, Crosshair, Loader2, CheckCircle2, Plus, Pencil } from "lucide-react";

export default function AddressesPage() {
  const { user } = useAuth();
  const isSeller = user?.role === "seller" || user?.role === "small_seller";

  const [address, setAddress] = useState(user?.address || "");
  const [editing, setEditing] = useState(false);
  const [working, setWorking] = useState<"gps" | "address" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function useGps() {
    setError(null);
    setSuccess(null);
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      return;
    }
    setWorking("gps");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await api<AuthUser>("/auth/me/location", {
            method: "PUT",
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          setAddress(r.address || "");
          setSuccess("Location updated successfully");
          setEditing(false);
          setTimeout(() => window.location.reload(), 1500);
        } catch (e) {
          setError(String(e));
        } finally {
          setWorking(null);
        }
      },
      (err) => {
        setError(`Location access denied: ${err.message}`);
        setWorking(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function saveAddress() {
    if (!address.trim()) {
      setError("Address cannot be empty");
      return;
    }
    setError(null);
    setSuccess(null);
    setWorking("address");
    try {
      const r = await api<AuthUser>("/auth/me/location", {
        method: "PUT",
        body: JSON.stringify({ address }),
      });
      setAddress(r.address || "");
      setSuccess("Address saved successfully");
      setEditing(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) {
      setError(String(e));
    } finally {
      setWorking(null);
    }
  }

  return (
    <RoleGuard allowed={["buyer", "seller", "small_seller", "admin"]}>
      <div className="bg-white min-h-screen font-sans text-[#0F1111]">
        <div className="mx-auto max-w-3xl p-4 py-8">
          <h1 className="text-3xl font-normal mb-2">Your Addresses</h1>
          <p className="text-sm text-[#565959] mb-6">
            {isSeller
              ? "Your address is used to find nearby buyers and assign the closest smart locker for drop-off."
              : "Your address determines which listings appear nearby and where orders are delivered."}
          </p>

          {/* Current Address Card */}
          <div className="border border-[#D5D9D9] rounded-lg p-5 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="size-4 text-[#008296]" />
                  <span className="font-bold text-sm">
                    {isSeller ? "Seller Location" : "Default Delivery Address"}
                  </span>
                </div>
                {user?.address ? (
                  <p className="text-sm text-[#0F1111] mt-1">{user.address}</p>
                ) : (
                  <p className="text-sm text-[#565959] mt-1 italic">No address set yet</p>
                )}
                {user?.location?.coordinates && (
                  <p className="text-xs text-[#565959] mt-1">
                    Coordinates: {user.location.coordinates[1].toFixed(4)}, {user.location.coordinates[0].toFixed(4)}
                  </p>
                )}
              </div>
              <button
                onClick={() => setEditing(!editing)}
                className="text-[#007185] text-sm hover:text-[#C7511F] hover:underline flex items-center gap-1"
              >
                <Pencil className="size-3" />
                {editing ? "Cancel" : "Change"}
              </button>
            </div>
          </div>

          {/* Edit Section */}
          {editing && (
            <div className="border border-[#e77600] rounded-lg p-5 bg-[#FFF8E7] mb-6">
              <h3 className="font-bold text-sm mb-4">
                {user?.address ? "Update your address" : "Add your address"}
              </h3>

              {/* GPS Button */}
              <button
                onClick={useGps}
                disabled={working !== null}
                className="w-full flex items-center justify-center gap-2 bg-white border border-[#D5D9D9] hover:bg-[#F7FAFA] text-[#0F1111] font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50 mb-4 shadow-sm"
              >
                {working === "gps" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Crosshair className="size-4 text-[#008296]" />
                )}
                Use my current location (GPS)
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[#D5D9D9]" />
                <span className="text-xs text-[#565959]">Or enter manually</span>
                <div className="flex-1 h-px bg-[#D5D9D9]" />
              </div>

              {/* Manual Address Input */}
              <div className="space-y-3">
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={isSeller
                    ? "Enter your shop/warehouse address (e.g. 5th Block, Koramangala, Bangalore 560034)"
                    : "Enter full delivery address (house no., street, landmark, city, pincode)"
                  }
                  className="w-full border border-[#888C8C] rounded px-3 py-2.5 text-sm h-24 resize-none focus:border-[#e77600] focus:shadow-[0_0_3px_2px_rgba(228,121,17,0.5)] outline-none transition-all"
                />
                <button
                  onClick={saveAddress}
                  disabled={working !== null || !address.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-[#0F1111] font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {working === "address" ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                  Save Address
                </button>
              </div>
            </div>
          )}

          {/* Add new address button (when not editing) */}
          {!editing && !user?.address && (
            <button
              onClick={() => setEditing(true)}
              className="w-full border-2 border-dashed border-[#D5D9D9] rounded-lg p-6 flex flex-col items-center justify-center gap-2 text-[#565959] hover:border-[#008296] hover:text-[#008296] transition"
            >
              <Plus className="size-8" />
              <span className="text-sm font-medium">Add your address</span>
            </button>
          )}

          {/* Info cards */}
          {error && (
            <div className="mt-4 rounded-lg bg-[#FCF4F4] border border-[#D13212] p-3 text-sm text-[#D13212]">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 rounded-lg bg-[#F0FFF4] border border-[#067D62] p-3 text-sm text-[#067D62] flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              {success}
            </div>
          )}

          {/* Role-specific info */}
          <div className="mt-8 border border-[#D5D9D9] rounded-lg p-5 bg-[#F7F8F8]">
            <h3 className="font-bold text-sm mb-2">
              {isSeller ? "Why your address matters (Seller)" : "Why your address matters (Buyer)"}
            </h3>
            {isSeller ? (
              <ul className="text-sm text-[#565959] space-y-2">
                <li>📍 Nearby buyers are matched based on your location (within 20km)</li>
                <li>🏪 The closest smart locker is assigned for item drop-off</li>
                <li>🚚 Routing AI uses your location to decide NEIGHBOR_FIRST vs RENEWED vs ship-to-warehouse</li>
                <li>💡 Accurate address = better matches = faster sales = higher recovery</li>
              </ul>
            ) : (
              <ul className="text-sm text-[#565959] space-y-2">
                <li>📍 "Nearby" listings are filtered by your location (within 25km)</li>
                <li>🏪 Smart lockers closest to you are shown for pickup</li>
                <li>📦 New product orders from the Shop are delivered to this address</li>
                <li>✨ Personalized recommendations consider items available near you</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
