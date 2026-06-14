import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, TrendingUp, Users, ShieldCheck, MapPin } from "lucide-react";

export default function LockerPartnerPage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Section */}
      <section className="bg-white border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row items-center justify-between">
          <div className="p-8 md:p-12 md:w-1/2">
            <h1 className="text-4xl md:text-5xl font-normal leading-tight mb-4 text-[#0F1111]">
              <span className="font-bold">ZERO installation fee</span> for your new ReLoop Smart Locker
            </h1>
            <p className="text-lg text-[#565959] mb-8">
              Register with a valid GSTIN and an active bank account to become a ReLoop Locker Partner and increase your daily footfall.
            </p>
            <Link 
              href="/login" 
              className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-10 py-3 font-bold text-lg transition-colors shadow-sm"
            >
              Become a Partner
            </Link>
          </div>
          <div className="md:w-1/2 p-4 w-full h-[300px] md:h-[450px] relative">
            <Image 
              src="/images/locker_partner_hero.png" 
              alt="Retail Store Owner with ReLoop Locker" 
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Highlights / Fee Structure */}
      <section className="bg-[#232F3E] text-white py-12 px-4">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-3xl font-bold text-center mb-10">Locker Partner Highlights</h2>
          
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 divide-y md:divide-y-0 md:divide-x divide-slate-600">
            <div className="flex flex-col items-center text-center px-6">
              <div className="w-20 h-20 bg-[#FF9900] rounded-full flex items-center justify-center mb-4 border-4 border-white border-dashed text-xl font-bold text-[#111] shadow-[0_0_15px_rgba(255,153,0,0.5)]">
                Zero
              </div>
              <h3 className="font-bold text-lg">Zero Installation Fee</h3>
              <p className="text-slate-300 text-sm mt-1">(Standard 10-slot locker)</p>
            </div>
            
            <div className="flex flex-col items-center text-center px-6 pt-8 md:pt-0">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <MapPin className="size-16 text-[#FF9900]" />
              </div>
              <h3 className="font-bold text-lg">Earn ₹15 per package</h3>
              <p className="text-slate-300 text-sm mt-1">(Flat rate for every successful pickup)</p>
            </div>

            <div className="flex flex-col items-center text-center px-6 pt-8 md:pt-0">
              <div className="w-20 h-20 flex items-center justify-center mb-4">
                <Users className="size-16 text-[#FF9900]" />
              </div>
              <h3 className="font-bold text-lg">20% more footfall</h3>
              <p className="text-slate-300 text-sm mt-1">(Average increase in store walk-ins)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 px-4 bg-[#F8F9FA] border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-10 text-center">How to become a ReLoop Partner?</h2>
          
          <div className="bg-white border border-[#008296] rounded-xl p-8 shadow-sm">
            <div className="grid md:grid-cols-2 gap-10">
              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#EBF8F4] flex items-center justify-center border-2 border-[#008296]">
                  <span className="text-[#008296] font-bold text-xl">1</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0F1111] text-lg mb-1">STEP 1: Register your store</h3>
                  <p className="text-[#565959] text-sm leading-relaxed">
                    Register on ReLoop with GST/PAN details, an active bank account, and your store address.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#EBF8F4] flex items-center justify-center border-2 border-[#008296]">
                  <span className="text-[#008296] font-bold text-xl">2</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0F1111] text-lg mb-1">STEP 2: Choose locker size</h3>
                  <p className="text-[#565959] text-sm leading-relaxed">
                    Choose the storage footprint that fits your store (Small, Medium, Large). We install it within 48 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#EBF8F4] flex items-center justify-center border-2 border-[#008296]">
                  <span className="text-[#008296] font-bold text-xl">3</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0F1111] text-lg mb-1">STEP 3: Receive items</h3>
                  <p className="text-[#565959] text-sm leading-relaxed">
                    Local sellers drop off their AI-verified refurbished items securely using their QR codes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-16 h-16 shrink-0 rounded-full bg-[#EBF8F4] flex items-center justify-center border-2 border-[#008296]">
                  <span className="text-[#008296] font-bold text-xl">4</span>
                </div>
                <div>
                  <h3 className="font-bold text-[#0F1111] text-lg mb-1">STEP 4: Complete pickups & get paid</h3>
                  <p className="text-[#565959] text-sm leading-relaxed">
                    Local buyers pick up items using their QR codes. You get paid per successful package transaction directly to your bank account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Become a Partner */}
      <section className="py-16 px-4 bg-white">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-10 text-center">Why become a partner on ReLoop?</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-[#D5D9D9] p-8 shadow-[0_2px_5px_rgba(15,17,17,0.15)] rounded">
              <h3 className="font-bold text-[#0F1111] text-xl mb-4 border-b-2 border-[#008296] pb-2 inline-block">Local Footfall</h3>
              <p className="text-[#565959] text-sm leading-relaxed">
                Reach hundreds of eco-conscious buyers in your neighborhood. Buyers picking up packages often buy daily essentials from your store.
              </p>
            </div>
            
            <div className="bg-white border border-[#D5D9D9] p-8 shadow-[0_2px_5px_rgba(15,17,17,0.15)] rounded">
              <h3 className="font-bold text-[#0F1111] text-xl mb-4 border-b-2 border-[#008296] pb-2 inline-block">Zero Investment</h3>
              <p className="text-[#565959] text-sm leading-relaxed">
                We provide and maintain the smart locker hardware entirely free of cost. You only provide 2 square feet of floor space.
              </p>
            </div>

            <div className="bg-white border border-[#D5D9D9] p-8 shadow-[0_2px_5px_rgba(15,17,17,0.15)] rounded">
              <h3 className="font-bold text-[#0F1111] text-xl mb-4 border-b-2 border-[#008296] pb-2 inline-block">Unbeatable Reach</h3>
              <p className="text-[#565959] text-sm leading-relaxed">
                Become the central node of sustainability for your entire 20km radius. Be recognized as a Green Tech partner.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/login" 
              className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-10 py-3 font-bold text-lg transition-colors shadow-sm"
            >
              Become a Partner
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 bg-[#F8F9FA] border-t border-[#D5D9D9]">
        <div className="mx-auto max-w-[1000px]">
          <h2 className="text-2xl font-bold text-[#0F1111] mb-12 text-center">Here's what our Retail Partners are saying:</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF9900] mb-4 relative shrink-0">
                 <img src="https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=400&q=80" alt="Partner" className="w-full h-full object-cover" />
              </div>
              <p className="text-[#008296] font-bold text-xs uppercase tracking-widest mb-2">TECHFIX ELECTRONICS</p>
              <p className="text-2xl text-[#008296] font-serif leading-none mb-2">"</p>
              <p className="text-lg text-[#0F1111] italic mb-4">
                Since installing the ReLoop locker, our daily walk-ins have increased by 30%. People pick up their refurbished laptops and phones, and many end up asking us for accessories or repair services. It's a win-win.
              </p>
              <p className="font-bold text-[#0F1111] text-sm">Amit Patel</p>
              <p className="text-[#565959] text-xs">Owner, TechFix Electronics</p>
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left md:mt-16">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#FF9900] mb-4 relative shrink-0">
                 <img src="https://images.unsplash.com/photo-1542644265-27a1c6e1eb52?w=400&q=80" alt="Partner" className="w-full h-full object-cover" />
              </div>
              <p className="text-[#008296] font-bold text-xs uppercase tracking-widest mb-2">STYLE BOUTIQUE</p>
              <p className="text-2xl text-[#008296] font-serif leading-none mb-2">"</p>
              <p className="text-lg text-[#0F1111] italic mb-4">
                The setup was completely free. We just provided a small corner space. Now we earn a steady passive income from clothes and shoes being dropped off, and we get more fashion-conscious customers browsing our aisles.
              </p>
              <p className="font-bold text-[#0F1111] text-sm">Sneha Gupta</p>
              <p className="text-[#565959] text-xs">Owner, Style Boutique</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
