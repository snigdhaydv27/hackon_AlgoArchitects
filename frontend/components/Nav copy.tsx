"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { Recycle, Package, Map, ShoppingBag, BarChart3, LogOut } from "lucide-react";
import { BuyerInbox } from "./BuyerInbox";

export function Nav() {
 const { user, logout } = useAuth();
 const links = navLinks(user?.role);
 const showInbox = user?.role === "buyer" || user?.role === "seller" || user?.role === "small_seller";

 return (
 <nav className="fixed top-0 inset-x-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
 <div className="mx-auto max-w-7xl flex h-16 items-center justify-between px-4">
 <Link href="/" className="flex items-center gap-2 text-brand-700 font-bold">
 <Recycle className="size-6" />
 <span className="text-lg">ReLoop</span>
 <span className="hidden sm:inline text-xs text-slate-500 font-normal ml-2">
 Every return finds its next best owner
 </span>
 </Link>
 <div className="flex items-center gap-1">
 {links.map((l) => (
 <Link
 key={l.href}
 href={l.href}
 className="hidden md:inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
 >
 <l.icon className="size-4" />
 {l.label}
 </Link>
 ))}
 {showInbox && <BuyerInbox />}
 {user ? (
 <div className="flex items-center gap-2 ml-2">
 <span className="hidden sm:inline text-sm text-slate-600">
 {user.name} <span className="text-xs text-slate-400">· {user.role}</span>
 </span>
 <button onClick​={logout} className="btn-ghost text-sm">
 <LogOut className="size-4" />
 </button>
 </div>
 ) : (
 <Link href="/login" className="btn-primary text-sm">
 Login
 </Link>
 )}
 </div>
 </div>
 </nav>
 );
}

function navLinks(role?: string) {
 if (!role) return [];
 if (role === "admin") {
 return [{ href: "/admin", label: "Dashboard", icon: BarChart3 }];
 }
 if (role === "buyer") {
 return [
 { href: "/buyer/nearby", label: "Nearby", icon: Map },
 { href: "/shop", label: "Shop", icon: ShoppingBag },
 ];
 }
 return [
 { href: "/seller/return/new", label: "New Return", icon: Package },
 { href: "/seller/dashboard", label: "My Returns", icon: BarChart3 },
 ];
}