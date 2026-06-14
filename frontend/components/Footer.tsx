"use client";

import Link from "next/link";
import { Recycle } from "lucide-react";

export function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full text-slate-300 font-sans mt-auto">
      {/* Back to Top Button */}
      <button
        onClick={handleScrollToTop}
        className="w-full py-4 bg-[#37475a] hover:bg-[#47576a] text-center text-xs font-medium text-white transition-colors cursor-pointer"
      >
        Back to top
      </button>

      {/* Main Footer Directory */}
      <div className="bg-[#232f3e] py-12 px-4 border-b border-[#37475a]">
        <div className="mx-auto max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Get to Know Us</h4>
            <ul className="space-y-2.5 text-xs text-[#ddd] hover:underline-child">
              <li><Link href="/about" className="hover:underline">About ReLoop</Link></li>
              <li><Link href="/sustainability" className="hover:underline">Sustainability Impact</Link></li>
              <li><Link href="/hyperlocal" className="hover:underline">HyperLocal Network</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Connect with Us</h4>
            <ul className="space-y-2.5 text-xs text-[#ddd]">
              <li><Link href="https://www.facebook.com/AmazonIN" className="hover:underline">Facebook</Link></li>
              <li><Link href="https://x.com/AmazonIN" className="hover:underline">Twitter / X</Link></li>
              <li><Link href="https://www.instagram.com/amazondotin" className="hover:underline">Instagram</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Make Money with Us</h4>
            <ul className="space-y-2.5 text-xs text-[#ddd] hover:underline-child">
              <li><Link href="/seller/return/new" className="hover:underline">Sell Refurbished Items</Link></li>
              <li><Link href="/locker-partner" className="hover:underline">Become a Locker Partner</Link></li>
              <li><Link href="/credit_UI" className="hover:underline">ReLoop Cash/Credits program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-4">Let Us Help You</h4>
            <ul className="space-y-2.5 text-xs text-[#ddd] hover:underline-child">
              <li><Link href="/shop" className="hover:underline">Certified Shop Program</Link></li>
              <li><Link href="/insights" className="hover:underline">Return Prevention Insights</Link></li>
              <li><Link href="/account" className="hover:underline">Your Account</Link></li>
              <li><Link href="/help" className="hover:underline">Help & Support</Link></li>
            </ul>
          </div>
        </div>

        {/* Global Selectors Row */}
        <div className="mx-auto max-w-5xl flex flex-wrap items-center justify-center gap-6 pt-10 mt-10 border-t border-[#37475a] text-xs">
          <Link href="/" className="flex items-center gap-2 text-white font-bold mr-4">
            <Recycle className="size-5 text-[#ff9900]" />
            <span className="text-sm">ReLoop</span>
          </Link>
          <div className="border border-slate-500 rounded px-3 py-1 bg-[#232f3e] text-slate-300 flex items-center gap-1.5 cursor-pointer hover:border-slate-300">
            <span>🌐</span> English
          </div>
          <div className="border border-slate-500 rounded px-3 py-1 bg-[#232f3e] text-slate-300 flex items-center gap-1.5 cursor-pointer hover:border-slate-300">
            <span>🇮🇳</span> India
          </div>
        </div>
      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="bg-[#131921] py-8 px-4 text-center text-xxs text-slate-400 space-y-4">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link href="/" className="hover:underline">Conditions of Use</Link>
          <Link href="/" className="hover:underline">Privacy Notice</Link>
          <Link href="/" className="hover:underline">Interest-Based Ads</Link>
          <span className="text-slate-600">|</span>
          <span>© 2026-2027 ReLoop.inc or its affiliates. All rights reserved.</span>
        </div>
        <p className="max-w-2xl mx-auto text-[10px] text-slate-500 leading-normal">
          ReLoop is a carbon-neutral shopping service. Standard logistics parameters are processed under deep verification models in compliance with circular economy guidelines.
        </p>
      </div>
    </footer>
  );
}
