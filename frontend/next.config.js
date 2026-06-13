
/** @type {import('next').NextConfig} */
const nextConfig = {
 reactStrictMode: true,
 images: {
 remotePatterns: [
 { protocol: "http", hostname: "localhost" },
 { protocol: "https", hostname: "**.amazonaws.com" },
 ],
 },
 async rewrites() {
 return [
 {
 source: "/api/:path*",
 destination: `${process.env.BACKEND_URL || "http://localhost:8080"}/api/:path*`,
 },
 {
 source: "/static/:path*",
 destination: `${process.env.BACKEND_URL || "http://localhost:8080"}/static/:path*`,
 },
 ];
 },
};
module.exports = nextConfig;

