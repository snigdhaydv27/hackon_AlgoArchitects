import type { Metadata } from "next";
import "./global.css";
import { AuthProvider } from "@/lib/auth";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "ReLoop — Circular Commerce, Reimagined",
  description:
    "Every returned, unused, or outgrown product finds its next best owner.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
