import "./global.css";
import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import  { ChatBot } from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "ReLoop — Every return finds its next best owner",
  description:
    "AI-powered circular commerce. Grade, route, and re-home long-tail returns hyperlocally. Built for ₹200–₹800 products.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Nav />
          <main className="pt-24 flex-grow">{children}</main>
                 <ChatBot />
          <Footer />
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
