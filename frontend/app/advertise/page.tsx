import Link from "next/link";
import Image from "next/image";
import { TrendingUp, Target, BarChart2, Zap } from "lucide-react";

export default function AdvertisePage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Section */}
      <section className="bg-[#232F3E] text-white overflow-hidden border-b-8 border-[#FF9900]">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row items-center justify-between">
          <div className="p-8 md:p-12 md:w-1/2 relative z-10">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Reach more local buyers with ReLoop Ads
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              Put your certified refurbished and second-hand products in front of thousands of eco-conscious customers actively shopping in your 20km radius.
            </p>
            <div className="flex gap-4">
              <Link 
                href="/login" 
                className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-8 py-3 font-bold text-[15px] transition-colors shadow-sm"
              >
                Register to Advertise
              </Link>
              <Link 
                href="/seller/return/new" 
                className="inline-block bg-transparent hover:bg-slate-800 text-white border border-white rounded-full px-8 py-3 font-bold text-[15px] transition-colors"
              >
                List a New Item
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 p-4 w-full h-[300px] md:h-[450px] relative">
            <Image 
              src="/images/advertise_hero.png" 
              alt="Seller viewing analytics" 
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Stats/Metrics Strip */}
      <section className="bg-slate-100 border-b border-[#D5D9D9] py-8 px-4">
        <div className="mx-auto max-w-[1000px] flex justify-around items-center flex-wrap gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-[#0F1111]">3.5x</div>
            <div className="text-sm text-[#565959] uppercase font-bold tracking-widest mt-1">More Views</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#0F1111]">20km</div>
            <div className="text-sm text-[#565959] uppercase font-bold tracking-widest mt-1">Targeting Radius</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-[#0F1111]">₹0</div>
            <div className="text-sm text-[#565959] uppercase font-bold tracking-widest mt-1">Upfront Fees</div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-12 text-center">How ReLoop Ads Work</h2>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <Target className="size-8 text-[#008296]" />
              </div>
              <h3 className="font-bold text-lg mb-2">1. Choose your product</h3>
              <p className="text-sm text-[#565959]">Select any AI-graded product you've already listed on the ReLoop platform.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <Zap className="size-8 text-[#008296]" />
              </div>
              <h3 className="font-bold text-lg mb-2">2. Set your budget</h3>
              <p className="text-sm text-[#565959]">Decide how much you want to spend per day. There are no minimum commitments.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <TrendingUp className="size-8 text-[#008296]" />
              </div>
              <h3 className="font-bold text-lg mb-2">3. Reach local buyers</h3>
              <p className="text-sm text-[#565959]">Your ad appears in highly visible placements when local buyers search for similar items.</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <BarChart2 className="size-8 text-[#008296]" />
              </div>
              <h3 className="font-bold text-lg mb-2">4. Pay for clicks</h3>
              <p className="text-sm text-[#565959]">You only pay when a buyer actually clicks your ad to view the Product Health Card.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Advertise Section */}
      <section className="py-16 px-4 bg-[#F8F9FA] border-t border-[#D5D9D9]">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-10 text-center">Why advertise with us?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border border-[#D5D9D9] p-8 shadow-sm rounded flex gap-6">
              <div className="shrink-0 mt-1">
                 <div className="w-3 h-3 rounded-full bg-[#008296]"></div>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1111] text-lg mb-2">Hyperlocal Precision</h3>
                <p className="text-[#565959] text-sm leading-relaxed">
                  Unlike traditional ads, ReLoop Ads only target buyers who are physically within a 20km radius of your designated drop-off Kirana locker. You never waste ad spend on buyers who are too far away to complete the transaction.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#D5D9D9] p-8 shadow-sm rounded flex gap-6">
              <div className="shrink-0 mt-1">
                 <div className="w-3 h-3 rounded-full bg-[#008296]"></div>
              </div>
              <div>
                <h3 className="font-bold text-[#0F1111] text-lg mb-2">Build Green Credibility</h3>
                <p className="text-[#565959] text-sm leading-relaxed">
                  Ads on ReLoop feature your product's AI-generated Health Card and Carbon Savings score. Buyers are more likely to click when they see the exact environmental impact of purchasing your second-hand item.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/login" 
              className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-12 py-3 font-bold text-lg transition-colors shadow-sm"
            >
              Start Advertising
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
