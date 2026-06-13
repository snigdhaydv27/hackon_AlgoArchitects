import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "reloop-platform",
  description: "Next.js starter for Reloop Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}