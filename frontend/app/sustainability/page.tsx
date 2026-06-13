import Link from "next/link";
import Image from "next/image";
import { 
  Leaf, 
  Recycle, 
  Brain, 
  Award, 
  Users, 
  TrendingDown,
  ChevronRight
} from "lucide-react";

const IMAGINE_POINTS = [
  {
    icon: Brain,
    title: "AI-Driven Routing",
    desc: "AI deciding whether an item should be resold, refurbished, donated, recycled, or exchanged in milliseconds.",
  },
  {
    icon: Award,
    title: "Smart Quality Grading",
    desc: "Smart quality grading through image/video analysis. Instant condition assessment without manual inspection.",
  },
  {
    icon: Recycle,
    title: "Green Credits",
    desc: "Sustainable incentives and 'green credits' for customers who choose to participate in circular commerce.",
  },
  {
    icon: Users,
    title: "Trusted Peer-to-Peer",
    desc: "Easy peer-to-peer resale inside Amazon's trusted ecosystem. Connect with verified local buyers.",
  },
  {
    icon: TrendingDown,
    title: "Predictive Prevention",
    desc: "Predictive return prevention before a purchase is even made, saving costs and environmental impact.",
  }
];

export default function SustainabilityPage() {
  return (
    <div className="bg-white font-sans text-[#0F1111]">
      
      {/* Hero Banner Area - Amazon Sustainability Style */}
      <section className="bg-[#EBF8F4] border-b border-[#D5D9D9] py-12 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-[#007185] font-bold text-sm uppercase tracking-wider mb-4">
              <Leaf className="size-5" />
              <span>Amazon Second Life Commerce</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6 text-[#0F1111]">
              AI-Powered Returns & Sustainable Resale
            </h1>
            <p className="text-lg text-[#565959] mb-8 leading-relaxed max-w-2xl">
              Millions of products bought online are returned, underused, or discarded despite being perfectly usable. Returns are expensive for customers, sellers, and the planet. Customers also struggle to trust refurbished or second-hand products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/shop" className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] border border-[#FCD200] rounded-full px-6 py-3 font-semibold text-center transition-colors inline-flex items-center justify-center">
                Explore Certified Refurbished
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full relative">
             <div className="aspect-[4/3] relative rounded-lg overflow-hidden border border-[#D5D9D9] shadow-sm">
                <Image 
                  src="/images/sustainability_hero.png" 
                  alt="Sustainable Circular Economy" 
                  fill
                  className="object-cover"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Quote / Vision Section */}
      <section className="py-16 px-4 sm:px-8 border-b border-[#D5D9D9] bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-[#0F1111]">
            "What if Amazon could create an intelligent ecosystem where returned or unused products automatically find their next best owner?"
          </h2>
          <p className="text-[#007185] font-semibold text-lg flex items-center justify-center gap-1 cursor-pointer hover:underline">
            Read about our vision <ChevronRight className="size-4 mt-0.5" />
          </p>
        </div>
      </section>

      {/* Grid Features - Amazon Style Cards */}
      <section className="py-16 px-4 sm:px-8 bg-[#F8F9FA]">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-[#0F1111] mb-10 text-center">
            Imagine a Smarter Ecosystem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMAGINE_POINTS.map((p, i) => (
              <div key={p.title} className="bg-white border border-[#D5D9D9] p-6 rounded shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 text-[#007185]">
                  <p.icon className="size-8" />
                </div>
                <h3 className="text-xl font-bold text-[#0F1111] mb-2">{p.title}</h3>
                <p className="text-[#565959] text-sm leading-relaxed">{p.desc}</p>
                <div className="mt-4">
                  <Link href="#" className="text-[#007185] text-sm hover:underline hover:text-[#C45500] font-medium">
                    Learn more
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
    </div>
  );
}
