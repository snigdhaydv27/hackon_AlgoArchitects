import Link from "next/link";
import Image from "next/image";
import { 
  MapPin, 
  Box, 
  Zap, 
  ShieldCheck, 
  ChevronRight
} from "lucide-react";

const FEATURES = [
  {
    icon: MapPin,
    title: "Neighbor First Routing",
    desc: "Connects verified local buyers within a 20km radius. Skips the traditional warehouse entirely to save on carbon footprint and logistics costs.",
  },
  {
    icon: Box,
    title: "Secure Kirana Lockers",
    desc: "Drop off items at a local, trusted neighborhood locker. The buyer picks it up conveniently via a secure QR code scan.",
  },
  {
    icon: Zap,
    title: "Instant AI Assessment",
    desc: "AI instantly assesses condition, removing the need for manual inspection and enabling immediate resale listings.",
  },
  {
    icon: ShieldCheck,
    title: "Product Health Card",
    desc: "Provides a verified, immutable health card for every product, ensuring trust and transparency without haggling or doorstep visits.",
  }
];

export default function HyperlocalPage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Banner Area - Amazon Logistics Style */}
      <section className="bg-[#232F3E] text-white py-16 px-4 sm:px-8 border-b-8 border-[#FF9900]">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
              The Intelligent Bridge <br />
              <span className="text-[#FF9900]">for Local Communities</span>
            </h1>
            <p className="text-lg text-slate-300 mb-8 leading-relaxed max-w-2xl">
              Connecting unused products with nearby demand. By leveraging local networks and AI, we eliminate the need for 600km warehouse roundtrips for items right in your neighborhood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/buyer/nearby" className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#111] border border-[#FCD200] rounded-sm px-6 py-3 font-semibold text-center transition-colors inline-flex items-center justify-center">
                <MapPin className="size-5 mr-2" />
                View Nearby Lockers
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
             <div className="aspect-[16/9] relative rounded overflow-hidden shadow-2xl border border-slate-700">
                <Image 
                  src="/images/hyperlocal_network.png" 
                  alt="Hyperlocal Locker Network" 
                  fill
                  className="object-cover"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Info section Amazon style */}
      <section className="py-16 px-4 sm:px-8 bg-white border-b border-[#D5D9D9]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-6">How the Hyperlocal Network Works</h2>
          <p className="text-lg text-[#565959] mb-10">
            A completely digital, trust-first approach to local peer-to-peer commerce integrated right into the Amazon ecosystem.
          </p>
        </div>
        
        <div className="mx-auto max-w-7xl grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-[#EBF8F4] flex items-center justify-center text-[#007185] mb-4">
                <feature.icon className="size-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0F1111] mb-2">{feature.title}</h3>
              <p className="text-[#565959] text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Amazon Style */}
      <section className="py-16 px-4 sm:px-8 bg-[#F8F9FA]">
        <div className="mx-auto max-w-3xl bg-white border border-[#D5D9D9] rounded p-8 text-center shadow-sm">
           <h2 className="text-2xl font-bold text-[#0F1111] mb-4">Ready to give products a second chance?</h2>
           <p className="text-[#565959] mb-8">
             Join the Amazon network today. Whether you're returning an item or looking for a certified deal nearby, the intelligent bridge is here.
           </p>
           <Link href="/login" className="bg-transparent text-[#007185] border border-[#D5D9D9] hover:bg-[#F3F3F3] rounded px-8 py-2 font-semibold transition-colors inline-block">
             Sign in to get started
           </Link>
        </div>
      </section>

    </div>
  );
}
