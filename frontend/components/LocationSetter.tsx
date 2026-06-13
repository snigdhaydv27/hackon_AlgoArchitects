"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth, AuthUser } from "@/lib/auth";
import { MapPin, Loader2, Crosshair } from "lucide-react";

export function LocationSetter() {
  const { user } = useAuth();
  const [working, setWorking] = useState<"gps" | "address" | null>(null);
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [updated, setUpdated] = useState<AuthUser | null>(null);

  async function useGps() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Browser doesn't support geolocation");
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
          setUpdated(r);
          setTimeout(() => window.location.reload(), 800);
        } catch (e) {
          setError(String(e));
        } finally {
          setWorking(null);
        }
      },
      (err) => {
        setError(`Permission denied: ${err.message}`);
        setWorking(null);
      },
      { enableHighAccuracy: false, timeout: 10000 }
    );
  }

  async function useAddress() {
    if (!address.trim()) return;
    setError(null);
    setWorking("address");
    try {
      const r = await api<AuthUser>("/auth/me/location", {
        method: "PUT",
        body: JSON.stringify({ address }),
      });
      setUpdated(r);
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      setError(String(e));
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <MapPin className="size-4 text-brand-600" />
        Set your location
      </div>
      <div className="text-xs text-slate-500 mt-1">
        Current: {user?.address ?? "(not set)"}
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={useGps}
          disabled={working !== null}
          className="btn-secondary text-xs flex-1"
        >
          {working === "gps" ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Crosshair className="size-3" />
          )}
          Use my current location
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g. HSR Layout, Bangalore"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          onClick={useAddress}
          disabled={working !== null || !address.trim()}
          className="btn-primary text-xs"
        >
          {working === "address" ? <Loader2 className="size-3 animate-spin" /> : "Set"}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">
          {error}
        </div>
      )}
      {updated && (
        <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded p-2">
          Updated to: {updated.address}
        </div>
      )}
    </div>
  );
}
