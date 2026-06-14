import Link from "next/link";
import Image from "next/image";
import { BrainCircuit, LineChart, ShieldAlert, CheckSquare } from "lucide-react";

export default function ReturnPreventionInsightsPage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Section */}
      <section className="bg-[#232F3E] text-white overflow-hidden border-b-8 border-[#FF9900]">
        <div className="mx-auto max-w-[1200px] flex flex-col md:flex-row items-center justify-between">
          <div className="p-8 md:p-12 md:w-1/2 relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#008296]/20 text-[#008296] px-3 py-1 rounded-full text-sm font-bold mb-6 border border-[#008296]/30">
              <LineChart className="size-4" />
              ReLoop Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Stopping Returns Before They Happen.
            </h1>
            <p className="text-lg text-slate-300 mb-8">
              The most sustainable return is the one that never occurs. ReLoop uses advanced vision AI and predictive data modeling to ensure you buy exactly what you expect, the first time.
            </p>
            <Link 
              href="/shop" 
              className="inline-block bg-[#FF9900] hover:bg-[#F3A847] text-[#111] border border-[#A88734] rounded-full px-8 py-3 font-bold text-[15px] transition-colors shadow-sm"
            >
              Explore AI-Verified Shop
            </Link>
          </div>
          <div className="md:w-1/2 p-4 w-full h-[300px] md:h-[450px] relative">
            <Image 
              src="/images/insights_hero.png" 
              alt="Predictive AI Dashboard" 
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-20 px-4 bg-white">
        <div className="mx-auto max-w-[1000px]">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0F1111] mb-4">How We Prevent E-Commerce Waste</h2>
            <p className="text-[#565959] text-lg max-w-2xl mx-auto">
              Our closed-loop system is built on transparency. By eliminating the blind spots of online shopping, we drastically reduce buyer's remorse and subsequent returns.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            
            {/* Feature 1 */}
            <div className="bg-[#F8F9FA] rounded-xl p-8 border border-[#D5D9D9] shadow-sm">
              <div className="w-14 h-14 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <BrainCircuit className="size-7 text-[#008296]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">AI Defect Highlighting</h3>
              <p className="text-[#565959] leading-relaxed">
                Our vision AI scans every refurbished item uploaded by sellers. It automatically detects and highlights scratches, dents, or signs of wear. You see the exact flaws before you purchase, eliminating the "not as described" return reason completely.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F8F9FA] rounded-xl p-8 border border-[#D5D9D9] shadow-sm">
              <div className="w-14 h-14 bg-[#FFF3E0] rounded-full flex items-center justify-center mb-6">
                <ShieldAlert className="size-7 text-[#FF9900]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">Predictive Fit Warnings</h3>
              <p className="text-[#565959] leading-relaxed">
                Using aggregated return data, our algorithm flags items that run unusually small or large. If an item has a high historic return rate for sizing, we display a proactive warning right on the product page.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F8F9FA] rounded-xl p-8 border border-[#D5D9D9] shadow-sm">
              <div className="w-14 h-14 bg-[#F0F2F2] rounded-full flex items-center justify-center mb-6">
                <CheckSquare className="size-7 text-[#565959]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">The Product Health Card</h3>
              <p className="text-[#565959] leading-relaxed">
                Every product listed on ReLoop comes with an immutable Health Card. This standardized certificate guarantees the item's condition (Grade A/B/C/D) and provides a clear breakdown of its functionality. No surprises, no haggling.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F8F9FA] rounded-xl p-8 border border-[#D5D9D9] shadow-sm">
              <div className="w-14 h-14 bg-[#EBF8F4] rounded-full flex items-center justify-center mb-6">
                <LineChart className="size-7 text-[#008296]" />
              </div>
              <h3 className="text-xl font-bold text-[#0F1111] mb-3">Seller Reliability Score</h3>
              <p className="text-[#565959] leading-relaxed">
                We track the correlation between a seller's item descriptions and our AI's grading. Sellers who consistently provide accurate descriptions earn a higher Trust Score, guiding buyers to reliable partners.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Impact Stat Banner */}
      <section className="bg-[#008296] text-white py-16 px-4">
        <div className="mx-auto max-w-[800px] text-center">
          <div className="text-5xl font-bold mb-4">40%</div>
          <h2 className="text-2xl font-bold mb-6">Reduction in Local Returns</h2>
          <p className="text-lg text-slate-200">
            Thanks to ReLoop's predictive insights and transparent AI grading, our hyperlocal network experiences significantly lower return rates compared to traditional e-commerce platforms. 
          </p>
        </div>
      </section>

    </div>
  );
}
