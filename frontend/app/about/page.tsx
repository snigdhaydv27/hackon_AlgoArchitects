import Link from "next/link";
import Image from "next/image";
import { 
  Users, 
  MapPin, 
  Recycle, 
  ShieldCheck,
  TrendingUp,
  Brain
} from "lucide-react";

export default function AboutUsPage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Banner Area - Amazon Corporate Style */}
      <section className="bg-[#232F3E] text-white py-20 px-4 sm:px-8 border-b-8 border-[#FF9900] relative overflow-hidden">
        <div className="mx-auto max-w-7xl relative z-10 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
            About ReLoop
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 leading-relaxed max-w-4xl">
            We are building the intelligent bridge for circular commerce. By leveraging advanced vision AI and hyperlocal networks, we ensure every returned or unused product finds its next best owner.
          </p>
        </div>
      </section>

      {/* Hero Image Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-8 -mt-12 relative z-20 mb-16">
        <div className="aspect-[21/9] w-full rounded-lg overflow-hidden shadow-2xl border-4 border-white">
          <Image 
            src="/images/about_us_hero.png" 
            alt="ReLoop Modern Logistics and AI Hub" 
            fill
            className="object-cover"
          />
        </div>
      </section>

      {/* Our Mission Section */}
      <section className="py-16 px-4 sm:px-8 bg-white border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-6">Our Mission</h2>
          <p className="text-lg text-[#565959] leading-relaxed mb-6">
            The traditional e-commerce returns system is broken for long-tail products (₹200 to ₹800). A returned ₹500 pair of shoes often incurs a 600km warehouse trip, costing more to re-list than it's worth, leading to liquidation and massive environmental waste.
          </p>
          <p className="text-lg text-[#565959] leading-relaxed font-bold">
            ReLoop is here to change that. We turn a 100% loss into a profitable, sustainable operation for every stakeholder in the chain.
          </p>
        </div>
      </section>

      {/* By the Numbers / Stats Section */}
      <section className="py-16 px-4 sm:px-8 bg-[#F8F9FA] border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-2xl font-bold text-[#0F1111] mb-10 text-center">ReLoop at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-[#D5D9D9]">
            <div className="text-center md:px-4 pt-6 md:pt-0">
              <div className="text-4xl font-bold text-[#007185] mb-2">&lt; 2s</div>
              <div className="text-sm font-bold text-[#0F1111]">AI Assessment Time</div>
              <p className="text-xs text-[#565959] mt-2">Instant grading and defect detection via vision AI.</p>
            </div>
            <div className="text-center md:px-4 pt-6 md:pt-0">
              <div className="text-4xl font-bold text-[#007185] mb-2">20 km</div>
              <div className="text-sm font-bold text-[#0F1111]">Neighbor First Radius</div>
              <p className="text-xs text-[#565959] mt-2">Hyperlocal routing connects verified local buyers and sellers.</p>
            </div>
            <div className="text-center md:px-4 pt-6 md:pt-0">
              <div className="text-4xl font-bold text-[#007185] mb-2">100%</div>
              <div className="text-sm font-bold text-[#0F1111]">Logistics Saved</div>
              <p className="text-xs text-[#565959] mt-2">Skipping the traditional warehouse entirely.</p>
            </div>
            <div className="text-center md:px-4 pt-6 md:pt-0">
              <div className="text-4xl font-bold text-[#007185] mb-2">₹350+</div>
              <div className="text-sm font-bold text-[#0F1111]">Average Value Reclaimed</div>
              <p className="text-xs text-[#565959] mt-2">Net value reclaimed per long-tail return item.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles Grid */}
      <section className="py-20 px-4 sm:px-8 bg-white">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-12 text-center">Our Core Innovations</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-[#D5D9D9] p-8 rounded shadow-sm hover:shadow-md transition-shadow">
              <Brain className="size-10 text-[#007185] mb-6" />
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">AI Grading</h3>
              <p className="text-[#565959] text-sm leading-relaxed mb-4">
                Instant condition assessment through image and video analysis. No manual inspection needed. Items are graded (A/B/C/D) and dynamically priced based on local market data.
              </p>
            </div>

            <div className="bg-white border border-[#D5D9D9] p-8 rounded shadow-sm hover:shadow-md transition-shadow">
              <MapPin className="size-10 text-[#007185] mb-6" />
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">Hyperlocal Lockers</h3>
              <p className="text-[#565959] text-sm leading-relaxed mb-4">
                We've established a vast network of secure neighborhood Kirana lockers. Sellers drop off items, and buyers pick them up via a secure QR code scan. Zero doorstep visits.
              </p>
            </div>

            <div className="bg-white border border-[#D5D9D9] p-8 rounded shadow-sm hover:shadow-md transition-shadow">
              <ShieldCheck className="size-10 text-[#007185] mb-6" />
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">Immutable Trust Layer</h3>
              <p className="text-[#565959] text-sm leading-relaxed mb-4">
                Every processed item generates a verified Product Health Card. It shows exactly what defects exist, what the AI summary is, and confirms the condition so buyers can trust what they purchase.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-8 bg-[#EBF8F4] border-t border-[#D5D9D9]">
        <div className="mx-auto max-w-3xl text-center">
           <h2 className="text-2xl font-bold text-[#0F1111] mb-4">Join the Circular Economy</h2>
           <p className="text-[#565959] mb-8">
             Discover how ReLoop is preventing returns and re-homing products in your neighborhood.
           </p>
           <div className="flex justify-center gap-4 flex-wrap">
             <Link href="/shop" className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#111] border border-[#FCD200] rounded-full px-8 py-3 font-semibold transition-colors">
               Explore Certified Shop
             </Link>
             <Link href="/sustainability" className="bg-white hover:bg-[#F3F3F3] text-[#007185] border border-[#D5D9D9] rounded-full px-8 py-3 font-semibold transition-colors shadow-sm">
               View Sustainability Impact
             </Link>
           </div>
        </div>
      </section>

    </div>
  );
}
