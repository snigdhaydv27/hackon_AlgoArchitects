"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth";
import { Leaf, Coins, Zap, ShieldCheck, ArrowRight, ArrowDownToLine, ShoppingCart } from "lucide-react";

export default function CreditsProgramPage() {
  const { user } = useAuth();
  
  const getStartedHref = user ? "/" : "/login";
  const getStartedText = user ? "Go to Dashboard" : "Log In to Get Started";

  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Section */}
      <section className="bg-[#131A22] text-white py-16 px-4 border-b-8 border-[#FF9900]">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#FF9900]/20 text-[#FF9900] px-3 py-1 rounded-full text-sm font-bold mb-6 border border-[#FF9900]/30">
              <Coins className="size-4" />
              ReLoop Rewards
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              Turn your unused items into ReLoop Credits.
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed">
              The official currency of the circular economy. Earn credits by selling, accurately grading, and hosting lockers. Spend them on refurbished tech or cash them out instantly.
            </p>
            <Link 
              href={getStartedHref}
              className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-8 py-3 font-bold text-[15px] transition-colors shadow-sm"
            >
              {getStartedText}
              <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="md:w-1/2 w-full h-[300px] md:h-[450px] relative">
            <Image 
              src="/images/credits_hero.png" 
              alt="ReLoop Digital Wallet" 
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* How it Works Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0F1111] mb-4">How the Program Works</h2>
            <p className="text-[#565959] text-lg max-w-2xl mx-auto">
              ReLoop Credits are designed to reward sustainable behavior at every step of the circular commerce journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            
            {/* Earning Column */}
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-[#D5D9D9]">
              <div className="flex items-center gap-3 mb-8 border-b border-[#D5D9D9] pb-4">
                <div className="w-12 h-12 rounded-full bg-[#EBF8F4] flex items-center justify-center">
                  <ArrowDownToLine className="size-6 text-[#008296]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F1111]">How to Earn</h3>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <ShieldCheck className="size-6 text-[#FF9900]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Accurate AI Grading Bonus</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      If the item you sell matches its AI-generated Product Health Card perfectly when the buyer receives it, you earn a <strong>5% Credit Bonus</strong> on the sale price.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <Zap className="size-6 text-[#FF9900]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Locker Hosting Income</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      Retail partners earn ReLoop Credits (equivalent to ₹15) for every successful package pickup from their Kirana or retail locker.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <Leaf className="size-6 text-[#FF9900]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Carbon Savings Reward</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      For every 10kg of CO2 emissions you offset by purchasing refurbished items instead of new ones, you receive a flat Green Credit drop in your wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Spending Column */}
            <div className="bg-[#F8F9FA] rounded-2xl p-8 border border-[#D5D9D9]">
              <div className="flex items-center gap-3 mb-8 border-b border-[#D5D9D9] pb-4">
                <div className="w-12 h-12 rounded-full bg-[#FFF3E0] flex items-center justify-center">
                  <ShoppingCart className="size-6 text-[#FF9900]" />
                </div>
                <h3 className="text-2xl font-bold text-[#0F1111]">How to Spend</h3>
              </div>

              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <Coins className="size-6 text-[#008296]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Buy Certified Refurbished</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      Use your credits to pay for items on the ReLoop store. 1 ReLoop Credit = ₹1. Apply your balance at checkout for instant discounts on electronics, shoes, and clothes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <ArrowRight className="size-6 text-[#008296]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Cash Out to Bank</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      Link your bank account via UPI to instantly transfer your ReLoop Credits into real currency. Withdrawals are processed within 24 hours with zero hidden fees.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="shrink-0 mt-1">
                    <Leaf className="size-6 text-[#008296]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1 text-[#0F1111]">Donate to Green Initiatives</h4>
                    <p className="text-[#565959] text-sm leading-relaxed">
                      Convert your credits into direct donations for ReLoop's partnered environmental NGOs. Track exactly how many trees were planted with your credits.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="py-20 px-4 bg-[#232F3E] text-white text-center border-t border-[#D5D9D9]">
        <div className="mx-auto max-w-[800px]">
          <h2 className="text-3xl font-bold mb-6">Ready to join the circular economy?</h2>
          <p className="text-lg text-slate-300 mb-10">
            Every unused item in your house is trapped value. Start earning ReLoop Credits today and help us reduce e-commerce waste.
          </p>
          <Link 
            href={getStartedHref}
            className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-12 py-4 font-bold text-lg transition-colors shadow-sm"
          >
            {getStartedText}
          </Link>
        </div>
      </section>

    </div>
  );
}
