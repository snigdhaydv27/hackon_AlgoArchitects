import "./global.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/lib/toast";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import  { ChatBot } from "@/components/ChatBot";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReLoop — Every return finds its next best owner",
  description:
    "AI-powered circular commerce. Grade, route, and re-home long-tail returns hyperlocally.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Toaster position="top-right" toastOptions={{ duration: 4000, style: { fontSize: '14px' } }} />
              <Nav />
              <main className="pt-24 flex-grow">{children}</main>
              <ChatBot />
              <Footer />
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      </body>
    </html>
  );
}
