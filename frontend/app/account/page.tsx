"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Package, ShieldAlert, MapPin, CreditCard, Gift } from "lucide-react";

export default function AccountPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="p-8 text-center text-slate-500">Redirecting to login...</div>;

  const isSeller = user.role === "seller" || user.role === "small_seller";

    const cards = [
    {
      title: "Login & security",
      description: "Edit login, name, avatar, and tagline",
      icon: <ShieldAlert className="size-8 text-[#008296] stroke-[1.5]" />,
      href: "/account/profile",
      show: true,
    },
    {
      title: "Your Addresses",
      description: "Edit addresses and delivery preferences",
      icon: <MapPin className="size-8 text-[#008296] stroke-[1.5]" />,
      href: "/account/addresses",
      show: user.role !== "admin",
    },
    {
      title: "Payment options",
      description: "Edit or add payment methods and Razorpay config",
      icon: <CreditCard className="size-8 text-[#008296] stroke-[1.5]" />,
      href: isSeller ? "/seller/payment-settings" : "/account/profile",
      show: user.role !== "admin",
    },
    {
      title: "Your Orders & Returns",
      description: "Track, return, or buy things again",
      icon: <Package className="size-8 text-[#008296] stroke-[1.5]" />,
      href: "/orders",
      show: user.role !== "admin" && user.role !== "locker" && !isSeller,
    },
    {
      title: "ReLoop Cash/Credits",
      description: "View your balance and transaction history",
      icon: <Gift className="size-8 text-[#008296] stroke-[1.5]" />,
      href: "/credits",
      show: user.role !== "admin" && !isSeller,
    },
  ].filter((c) => c.show);

  return (
    <div className="bg-white min-h-screen font-sans text-[#0F1111]">
      <div className="mx-auto max-w-[1000px] p-4 py-8">
        <h1 className="text-3xl font-normal mb-8">Your Account</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card, i) => (
            <Link 
              key={i} 
              href={card.href}
              className="border border-[#D5D9D9] rounded-lg p-4 flex gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="shrink-0 pt-1">
                {card.icon}
              </div>
              <div>
                <h2 className="text-lg font-normal mb-1">{card.title}</h2>
                <p className="text-sm text-[#565959] leading-snug">{card.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
