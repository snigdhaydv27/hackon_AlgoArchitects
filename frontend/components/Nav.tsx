"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth, AuthUser } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { Recycle, LogOut, MapPin, ChevronDown, User, X, Crosshair, Loader2, Leaf } from "lucide-react";
import { BuyerInbox } from "./BuyerInbox";
import { BarChart3, Map, ShoppingBag, Package, Sparkles, RotateCcw } from "lucide-react";

export function Nav() {
  const { user, logout } = useAuth();
  const links = navLinks(user?.role);
  const showInbox = user?.role === "buyer" || user?.role === "seller" || user?.role === "small_seller" || user?.role === "locker";

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Location picker state
  const [locationOpen, setLocationOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-[#131921] text-white">
        {/* Top Header Bar (Level 1) */}
        <div className="mx-auto max-w-7xl flex h-14 items-center justify-between px-4 gap-4">
          {/* Logo */}
          <Link href="/" className="flex flex-col items-start select-none mr-2 group p-1 border border-transparent hover:border-white rounded transition-all">
            <div className="flex items-center gap-1.5 font-black text-xl tracking-tight text-white leading-none">
              <span>ReLoop</span>
              <Recycle className="size-4 text-[#ff9900]" />
            </div>
            {/* Orange Smile Curve Under Logo */}
            <div className="w-16 h-1 bg-[#ff9900] rounded-b-md transform translate-x-2 -mt-0.5" style={{ borderRadius: '0 0 100% 100%' }}></div>
          </Link>

          {/* Deliver To Pin Widget — Functional */}
          <div className="hidden sm:block relative">
            <button
              onClick={() => setLocationOpen(!locationOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 border border-transparent hover:border-white rounded cursor-pointer select-none text-xs bg-transparent text-white outline-none"
            >
              <MapPin className="size-4 text-white mt-1" />
              <div className="flex flex-col leading-none text-left">
                <span className="text-[#ccc] text-[10px]">Deliver to</span>
                <span className="font-bold text-white mt-0.5 max-w-[120px] truncate">
                  {user?.address ? user.address.split(",")[0] : "Update location"}
                </span>
              </div>
            </button>
            {locationOpen && <LocationPicker onClose={() => setLocationOpen(false)} />}
          </div>



          {/* Account and Notifications */}
          <div className="flex items-center gap-3 text-xs">
            {/* Sign In & Account Links */}
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex flex-col px-2 py-1.5 border border-transparent hover:border-white rounded select-none cursor-pointer leading-none">
                  <span className="text-[#ccc] text-[10px]">Hello, {user.name}</span>
                  <span className="font-bold text-white flex items-center gap-0.5 mt-0.5">
                    {user.role} <ChevronDown className="size-3 text-[#ccc]" />
                  </span>
                </div>
              </div>
            ) : (
              <Link href="/login" className="flex flex-col px-2 py-1.5 border border-transparent hover:border-white rounded leading-none">
                <span className="text-[#ccc] text-[10px]">Hello, sign in</span>
                <span className="font-bold text-white mt-0.5">Account & Lists</span>
              </Link>
            )}

            {/* Notifications Inbox */}
            {showInbox && (
              <div className="relative border border-transparent hover:border-white rounded p-1">
                <BuyerInbox />
              </div>
            )}

            {/* Green Credits for buyers */}
            {user && user.role === "buyer" && (
              <Link href="/credits" className="hidden sm:flex items-center gap-1.5 px-2 py-1.5 border border-transparent hover:border-white rounded">
                <Leaf className="size-4 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">{user.greenCredits ?? 0}</span>
              </Link>
            )}

            {/* Cart Icon */}
            {user && user.role === "buyer" && (
              <Link href="/cart" className="relative flex flex-col items-center px-2 py-1 border border-transparent hover:border-white rounded">
                <ShoppingBag className="size-5" />
                <CartBadge />
              </Link>
            )}
          </div>
        </div>

        {/* Secondary Sub-Header Bar (Level 2) */}
        <div className="bg-[#232f3e] text-slate-200">
          <div className="mx-auto max-w-7xl flex h-9 items-center justify-between px-4 text-xs font-semibold select-none">
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto scrollbar-none py-1">
              {/* Menu icon - Click opens sidebar drawer */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="flex items-center gap-1 hover:text-white cursor-pointer px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap bg-transparent text-slate-200 border-none outline-none font-semibold text-xs"
              >
                <span className="text-sm">☰</span> All
              </button>

              {/* Dynamic links based on user role */}
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="flex items-center gap-1 hover:text-white px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap"
                >
                  <l.icon className="size-3.5" />
                  {l.label}
                </Link>
              ))}

              {/* Static standard links */}
              {user?.role !== "admin" && (
                <Link href="/help" className="hover:text-white px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap">
                  Customer Service
                </Link>
              )}
            </div>

            {user && (
              <button
                onClick={logout}
                className="flex items-center gap-1 hover:text-[#ff9900] px-2 py-1 border border-transparent hover:border-white rounded whitespace-nowrap cursor-pointer transition-colors text-xs font-semibold"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Slide-out Sidebar Drawer Menu (Amazon style) */}
      {sidebarOpen && (
        <>
          {/* Dark overlay backdrop */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-50 transition-opacity duration-300 cursor-pointer backdrop-blur-xxs"
          />

          {/* Sidebar Drawer panel */}
          <div className="fixed inset-y-0 left-0 w-80 bg-white z-50 text-slate-800 shadow-2xl flex flex-col animate-slide-in-left duration-300 font-sans">
            {/* Drawer Header (Sign In info) */}
            <div className="bg-[#232f3e] text-white py-3.5 px-6 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-slate-200/25 flex items-center justify-center">
                <User className="size-4 text-white" />
              </div>
              <div className="text-sm font-bold truncate flex-1">
                Hello, {user ? user.name : "Sign In"}
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Scrollable Links Content */}
            <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
              {/* Profile Portal Section */}
              <div>
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3 font-mono">
                  Your Account Portals
                </h4>
                <div className="space-y-3.5 text-xs text-slate-600 font-medium">
                  {user ? (
                    <>
                      <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none">Logged In</p>
                        <p className="text-slate-800 font-black mt-1 leading-none">{user.name}</p>
                        <p className="text-slate-500 text-xxs mt-1.5 leading-none">Role: {user.role}</p>
                      </div>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setSidebarOpen(false)}
                      className="block p-3 border border-dashed border-[#ff9900] bg-orange-50 hover:bg-orange-100 rounded-lg text-center font-bold text-[#b12704] transition-all"
                    >
                      🔒 Access Login Center
                    </Link>
                  )}
                </div>
              </div>

              {/* Departments Section */}
              {user?.role !== "admin" && (
              <div>
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3 font-mono">
                  Reloop Departments
                </h4>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  {user?.role === "buyer" && (
                    <li>
                      <Link
                        href="/shop"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                      >
                        🛒 Certified Refurbished Shop
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link
                      href="/sustainability"
                      onClick={() => setSidebarOpen(false)}
                      className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                    >
                      🌿 Sustainability & Eco Impact
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/hyperlocal"
                      onClick={() => setSidebarOpen(false)}
                      className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                    >
                      📦 Hyperlocal Locker Network
                    </Link>
                  </li>
                </ul>
              </div>
              )}

              {/* Returns Operations Section */}
              <div>
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3 font-mono">
                  {user?.role === "admin" ? "Admin" : "Circular Utilities"}
                </h4>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  {(user?.role === "seller" || user?.role === "small_seller") && (
                    <>
                      <li>
                        <Link
                          href="/seller/return/new"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📥 Create New Return
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/seller/dashboard"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📊 Seller Return Console
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/seller/resells"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          🔄 Pending Resells
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/seller/payment-settings"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          💳 Payment Settings
                        </Link>
                      </li>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <li>
                      <Link
                        href="/admin"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                      >
                        💼 Admin Operations Center
                      </Link>
                    </li>
                  )}
                  {user?.role === "locker" && (
                    <>
                      <li>
                        <Link
                          href="/locker/dashboard"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📦 My Locker Dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/locker/assignments"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📋 Assigned Items
                        </Link>
                      </li>
                    </>
                  )}
                  {user?.role === "buyer" && (
                    <li>
                      <Link
                        href="/buyer/orders"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                      >
                        🛍️ My Orders & Returns
                      </Link>
                    </li>
                  )}
                  {user?.role === "buyer" && (
                    <li>
                      <Link
                        href="/buyer/nearby"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                      >
                        🗺️ Nearby Listings
                      </Link>
                    </li>
                  )}
                  {user?.role === "buyer" && (
                    <li>
                      <Link
                        href="/buyer/recommended"
                        onClick={() => setSidebarOpen(false)}
                        className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                      >
                        ✨ Recommended for You
                      </Link>
                    </li>
                  )}
                </ul>
              </div>

              {/* Account & Settings */}
              {user?.role !== "admin" && (
              <div>
                <h4 className="text-slate-900 font-bold text-xs uppercase tracking-wider mb-3 font-mono">
                  Account & Settings
                </h4>
                <ul className="space-y-3.5 text-xs text-slate-600 font-medium">
                  <li>
                    <Link
                      href="/account/profile"
                      onClick={() => setSidebarOpen(false)}
                      className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                    >
                      🔒 Login & Security
                    </Link>
                  </li>
                  {user?.role !== "locker" && (
                    <>
                      <li>
                        <Link
                          href="/account/addresses"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📍 Your Addresses
                        </Link>
                      </li>

                    </>
                  )}
                  {user?.role === "buyer" && (
                    <>
                      <li>
                        <Link
                          href="/orders"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          📦 Your Orders & Returns
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/credits"
                          onClick={() => setSidebarOpen(false)}
                          className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                        >
                          🌿 ReLoop Cash/Credits
                        </Link>
                      </li>
                    </>
                  )}
                  <li>
                    <Link
                      href="/help"
                      onClick={() => setSidebarOpen(false)}
                      className="hover:text-slate-900 flex items-center gap-2 hover:bg-slate-50 p-1 rounded"
                    >
                      💬 Help & Customer Service
                    </Link>
                  </li>
                  {user && (
                    <li>
                      <button
                        onClick={() => {
                          setSidebarOpen(false);
                          logout();
                        }}
                        className="w-full text-left text-rose-600 hover:text-rose-700 font-bold flex items-center gap-2 hover:bg-slate-50 p-1 rounded cursor-pointer bg-transparent border-none outline-none"
                      >
                        🚪 Sign Out of ReLoop
                      </button>
                    </li>
                  )}
                </ul>
              </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

function CartBadge() {
  const { itemCount } = useCart();
  if (itemCount === 0) return null;
  return (
    <span className="absolute -top-1 -right-1 bg-[#ff9900] text-[#0F1111] text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
      {itemCount}
    </span>
  );
}

function LocationPicker({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [address, setAddress] = useState("");
  const [working, setWorking] = useState<"gps" | "address" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  async function useGps() {
    setError(null);
    setSuccess(null);
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    setWorking("gps");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await api<AuthUser>("/auth/me/location", {
            method: "PUT",
            body: JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          });
          setSuccess(r.address || "Location updated");
          setTimeout(() => window.location.reload(), 1000);
        } catch (e) { setError(String(e)); }
        finally { setWorking(null); }
      },
      (err) => { setError(`Permission denied: ${err.message}`); setWorking(null); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function useAddress() {
    if (!address.trim()) return;
    setError(null); setSuccess(null); setWorking("address");
    try {
      const r = await api<AuthUser>("/auth/me/location", {
        method: "PUT",
        body: JSON.stringify({ address }),
      });
      setSuccess(r.address || "Location updated");
      setTimeout(() => window.location.reload(), 1000);
    } catch (e) { setError(String(e)); }
    finally { setWorking(null); }
  }

  return (
    <div ref={ref} className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-2xl border border-slate-200 z-50 p-4 text-slate-800">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
          <MapPin className="size-4 text-emerald-600" />
          Choose your location
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-transparent border-none">
          <X className="size-4" />
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">Delivery options and item availability depend on your location.</p>
      {user?.address && (
        <div className="mb-3 p-2 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600">
          <span className="font-medium text-slate-700">Current:</span> {user.address}
        </div>
      )}
      <button onClick={useGps} disabled={working !== null} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm py-2.5 px-4 rounded-lg transition disabled:opacity-50 mb-3">
        {working === "gps" ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
        Use my current location
      </button>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] text-slate-400 uppercase">or type address</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>
      <div className="flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && useAddress()}
          placeholder="e.g. Koramangala, Bangalore"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <button onClick={useAddress} disabled={working !== null || !address.trim()} className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-medium text-sm px-4 py-2 rounded-lg transition disabled:opacity-50">
          {working === "address" ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <div className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded p-2">{error}</div>}
      {success && <div className="mt-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded p-2">✓ {success}</div>}
      {!user && (
        <div className="mt-3 text-center">
          <Link href="/login" onClick={onClose} className="text-xs text-blue-600 hover:underline font-medium">Sign in to save your location</Link>
        </div>
      )}
    </div>
  );
}

function navLinks(role?: string) {
  if (!role) return [];
  if (role === "admin") {
    return [{ href: "/admin", label: "Dashboard", icon: BarChart3 }];
  }
  if (role === "buyer") {
    return [
      { href: "/buyer/orders", label: "Orders", icon: ShoppingBag },
      { href: "/buyer/nearby", label: "Nearby", icon: Map },
      { href: "/buyer/recommended", label: "For You", icon: Sparkles },
      { href: "/shop", label: "Shop", icon: ShoppingBag },
    ];
  }
  if (role === "locker") {
    return [
      { href: "/locker/dashboard", label: "My Locker", icon: Package },
      { href: "/locker/assignments", label: "Assignments", icon: BarChart3 },
    ];
  }
  return [
    { href: "/seller/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/seller/return/new", label: "Sell Now", icon: Package },
    { href: "/seller/resells", label: "Resells", icon: RotateCcw },
  ];
}
