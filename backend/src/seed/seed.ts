import { connectDb } from "../config/db.js";
import { UserModel } from "../models/User.js";
import { LockerModel } from "../models/Locker.js";
import { ProductModel } from "../models/Product.js";
import { PreventionStatModel } from "../models/PreventionStat.js";
import { ReturnModel } from "../models/Return.js";
import { ListingModel } from "../models/Listing.js";
import mongoose from "mongoose";

// Bangalore neighborhoods, real coords [lng, lat]
const COORDS = {
 koramangala: [77.6245, 12.9352] as [number, number],
 hsrLayout: [77.6478, 12.9116] as [number, number],
 indiranagar: [77.6412, 12.9716] as [number, number],
 jayanagar: [77.5832, 12.9304] as [number, number],
 whitefield: [77.7499, 12.9698] as [number, number],
 marathahalli: [77.6974, 12.9569] as [number, number],
 btm: [77.6101, 12.9166] as [number, number],
 banashankari: [77.5566, 12.9255] as [number, number],
 electronicCity: [77.6603, 12.8456] as [number, number],
 sarjapur: [77.6868, 12.8987] as [number, number],
};

async function clear() {
 await Promise.all([
 UserModel.deleteMany({}),
 LockerModel.deleteMany({}),
 ProductModel.deleteMany({}),
 PreventionStatModel.deleteMany({}),
 ReturnModel.deleteMany({}),
 ListingModel.deleteMany({}),
 ]);
}

async function seedLockers() {
 const lockers = [
 {
 name: "Sharma Kirana & ReLoop Locker",
 address: "5th Block, Koramangala",
 partnerType: "kirana",
 location: { type: "Point", coordinates: COORDS.koramangala },
 capacity: 24,
 hours: "7 AM – 11 PM",
 contact: "+91 98xxxx2451",
 },
 {
 name: "Daily Needs Mart",
 address: "27th Main, HSR Layout",
 partnerType: "kirana",
 location: { type: "Point", coordinates: COORDS.hsrLayout },
 capacity: 20,
 hours: "8 AM – 10 PM",
 },
 {
 name: "Indiranagar Locker Hub",
 address: "100 Ft Road, Indiranagar",
 partnerType: "standalone",
 location: { type: "Point", coordinates: COORDS.indiranagar },
 capacity: 40,
 },
 {
 name: "Patel Provision Stores",
 address: "4th Block, Jayanagar",
 partnerType: "kirana",
 location: { type: "Point", coordinates: COORDS.jayanagar },
 capacity: 18,
 },
 {
 name: "Whitefield Mall Pickup Point",
 address: "Phoenix Marketcity, Whitefield",
 partnerType: "store",
 location: { type: "Point", coordinates: COORDS.whitefield },
 capacity: 60,
 },
 {
 name: "Marathahalli Bus Stop Locker",
 address: "ORR Junction, Marathahalli",
 partnerType: "standalone",
 location: { type: "Point", coordinates: COORDS.marathahalli },
 capacity: 30,
 },
 {
 name: "BTM SuperMart",
 address: "16th Main, BTM Layout",
 partnerType: "store",
 location: { type: "Point", coordinates: COORDS.btm },
 capacity: 25,
 },
 {
 name: "Banashankari Daily Store",
 address: "2nd Stage, Banashankari",
 partnerType: "kirana",
 location: { type: "Point", coordinates: COORDS.banashankari },
 capacity: 16,
 },
 ];
 return LockerModel.insertMany(lockers);
}

async function seedUsers() {
 const users = [
 {
 name: "Priya Sharma",
 role: "seller",
 email: "priya@demo.reloop.in",
 avatar: "/avatars/priya.png",
 tagline: "Returned ₹500 shoes — too tight after one walk",
 address: "5th Block, Koramangala, Bangalore",
 location: { type: "Point", coordinates: COORDS.koramangala },
 interests: ["footwear"],
 profile: { footLengthMm: 235, preferredSize: "7", brand: "Sparx" },
 verified: true,
 greenCredits: 90,
 },
 {
 name: "Rahul Mehta",
 role: "seller",
 email: "rahul@demo.reloop.in",
 avatar: "/avatars/rahul.png",
 tagline: "Has a working baby monitor — won't sell on classifieds",
 address: "27th Main, HSR Layout, Bangalore",
 location: { type: "Point", coordinates: COORDS.hsrLayout },
 interests: ["baby", "electronics"],
 verified: true,
 },
 {
 name: "Anjali Crafts",
 role: "small_seller",
 email: "anjali@demo.reloop.in",
 avatar: "/avatars/anjali.png",
 tagline: "200 returns/month — needs AI, not better logistics",
 address: "Indiranagar, Bangalore",
 location: { type: "Point", coordinates: COORDS.indiranagar },
 interests: ["apparel", "footwear", "home"],
 verified: true,
 greenCredits: 120,
 },
 // Verified buyers — 8 of them spread across the city
 {
 name: "Neha Iyer",
 role: "buyer",
 email: "neha@demo.reloop.in",
 avatar: "/avatars/neha.png",
 tagline: "Looking for kids' shoes & home items",
 address: "HSR Layout, Bangalore",
 location: { type: "Point", coordinates: COORDS.hsrLayout },
 interests: ["footwear", "kids", "home"],
 profile: { footLengthMm: 250, preferredSize: "8" },
 verified: true,
 greenCredits: 200,
 },
 {
 name: "Karthik R",
 role: "buyer",
 email: "karthik@demo.reloop.in",
 avatar: "/avatars/karthik.png",
 tagline: "New parent — needs baby gear",
 address: "Jayanagar, Bangalore",
 location: { type: "Point", coordinates: COORDS.jayanagar },
 interests: ["baby", "electronics"],
 verified: true,
 greenCredits: 150,
 },
 {
 name: "Meera Pillai",
 role: "buyer",
 email: "meera@demo.reloop.in",
 avatar: "/avatars/meera.png",
 tagline: "Fashion finds at half price",
 address: "Indiranagar, Bangalore",
 location: { type: "Point", coordinates: COORDS.indiranagar },
 interests: ["apparel", "footwear"],
 profile: { footLengthMm: 240, preferredSize: "7" },
 verified: true,
 },
 {

name: "Arjun Reddy",
 role: "buyer",
 email: "arjun@demo.reloop.in",
 avatar: "/avatars/arjun.png",
 tagline: "Bargain hunter, electronics enthusiast",
 address: "Marathahalli, Bangalore",
 location: { type: "Point", coordinates: COORDS.marathahalli },
 interests: ["electronics", "home"],
 verified: true,
 },
 {
 name: "Divya Suresh",
 role: "buyer",
 email: "divya@demo.reloop.in",
 avatar: "/avatars/divya.png",
 tagline: "First-time mom",
 address: "BTM Layout, Bangalore",
 location: { type: "Point", coordinates: COORDS.btm },
 interests: ["baby", "kids"],
 verified: true,
 },
 {
 name: "Aditya Kumar",
 role: "buyer",
 email: "aditya@demo.reloop.in",
 avatar: "/avatars/aditya.png",
 tagline: "Sustainable shopper",
 address: "Banashankari, Bangalore",
 location: { type: "Point", coordinates: COORDS.banashankari },
 interests: ["apparel", "footwear", "home"],
 verified: true,
 },
 {
 name: "Pooja Nair",
 role: "buyer",
 email: "pooja@demo.reloop.in",
 avatar: "/avatars/pooja.png",
 tagline: "College student — looks for deals",
 address: "Whitefield, Bangalore",
 location: { type: "Point", coordinates: COORDS.whitefield },
 interests: ["apparel", "books"],
 verified: true,
 },
 {
 name: "Ravi Krishnan",
 role: "buyer",
 email: "ravi@demo.reloop.in",
 avatar: "/avatars/ravi.png",
 tagline: "Refurbished gadgets only",
 address: "Sarjapur Road, Bangalore",
 location: { type: "Point", coordinates: COORDS.sarjapur },
 interests: ["electronics", "home"],
 verified: true,
 },
 {
 name: "Admin (ReLoop Ops)",
 role: "admin",
 email: "admin@demo.reloop.in",
 avatar: "/avatars/admin.png",
 tagline: "Platform operations dashboard",
 address: "ReLoop HQ, Bangalore",
 location: { type: "Point", coordinates: COORDS.indiranagar },
 verified: true,
 },
 {
 name: "Sharma Ji (Locker Partner)",
 role: "locker",
 email: "sharma@demo.reloop.in",
 avatar: "/avatars/sharma.png",
 tagline: "Kirana store owner — ReLoop locker partner in Koramangala",
 address: "5th Block, Koramangala, Bangalore",
 location: { type: "Point", coordinates: COORDS.koramangala },
 verified: true,
 greenCredits: 150,
 },
 ];
 return UserModel.insertMany(users);
}

async function seedProducts() {
 const products = [
 {
 title: "Sparx Running Shoes",
 category: "footwear",
 brand: "Sparx",
 originalPrice: 599,
 images: [
 "/static/uploads/1781449706073-9dd860915e56.png",
 "/static/uploads/1781449706087-affcd99e4544.png",
 "/static/uploads/1781449706131-ea5c322564f2.png",
 "/static/uploads/1781449706139-0a4a4303c6cf.png",
 "/static/uploads/1781449706148-6a2e3c9c0933.png",
 "/static/uploads/1781449706153-a20348c095f4.png",
 ],
 description: "Lightweight running shoes with breathable mesh upper",
 variants: { sizes: ["6", "7", "8", "9", "10"], colors: ["black", "blue"] },
 weightGrams: 700,
 },
 {
 title: "Philips Avent Baby Monitor",
 category: "baby",
 brand: "Philips",
 originalPrice: 4500,
 images: [
 "/static/uploads/1781449933958-763519635a8c.png",
 "/static/uploads/1781449934032-0d795c21d936.png",
 "/static/uploads/1781449934036-ee5fd3471297.png",
 "/static/uploads/1781449934045-823fb6a691f2.png",
 "/static/uploads/1781449934059-1d170ab69cd6.png",
 "/static/uploads/1781449934064-0cd32066e765.png",
 ],
 description: "Audio baby monitor with nightlight",
 variants: { sizes: [], colors: ["white"] },
 weightGrams: 600,
 },
 {
 title: "Cotton Kurta Set",
 category: "apparel",
 brand: "FabIndia",
 originalPrice: 799,
 images: [
 "/static/uploads/1781450358965-1f0a0ade39dd.png",
 "/static/uploads/1781450358979-cf3f737fcebf.png",
 "/static/uploads/1781450358992-7f92ce5c5ca0.png",
 "/static/uploads/1781450359002-ea68e6c99209.png",
 "/static/uploads/1781450359024-6ec5b2eb90fb.png",
 "/static/uploads/1781450359043-81e237843082.png",
 ],
 description: "Hand-block printed cotton kurta",
 variants: { sizes: ["S", "M", "L", "XL"], colors: ["indigo", "ivory"] },
 weightGrams: 400,
 },
 {
 title: "Stainless Steel Water Bottle",
 category: "home",
 brand: "Milton",
 originalPrice: 449,
 images: [
 "/static/uploads/1781450463820-8d9db2ee312d.png",
 "/static/uploads/1781450463825-8032e300782f.png",
 "/static/uploads/1781450463828-e45c5cd0ac7a.png",
 "/static/uploads/1781450463829-39de177ee973.png",
 "/static/uploads/1781450463831-6d378a8dcd8f.png",
 "/static/uploads/1781450463833-c40aea89def2.png",
 ],
 description: "1L insulated stainless steel bottle",
 variants: { sizes: [], colors: ["silver", "blue", "black"] },
 weightGrams: 350,
 },
 {
 title: "Kids' Trekking Sandals",
 category: "footwear",
 brand: "Liberty",
 originalPrice: 549,
 images: [
 "/static/uploads/1781450682761-3d6e388813d1.png",
 "/static/uploads/1781450682768-358466663f2f.png",
 "/static/uploads/1781450682770-bc7597a30978.png",
 "/static/uploads/1781450682778-9354c61077e1.png",
 "/static/uploads/1781450682780-4a3283584401.png",
 "/static/uploads/1781450682782-998159711798.png",
 ],
 description: "Sturdy outdoor sandals for kids",
 variants: { sizes: ["1", "2", "3", "4", "5"], colors: ["brown", "black"] },
 weightGrams: 450,
 },
 {
 title: "Bluetooth Earbuds",
 category: "electronics",
 brand: "Boat",
 originalPrice: 799,
 images: [
 "/static/uploads/1781450735529-be3821d3f6a0.png",
 "/static/uploads/1781450735535-132eb0d8f2f4.png",
 "/static/uploads/1781450735537-5d669ea990dd.png",
 "/static/uploads/1781450735538-51eedd069460.png",
 "/static/uploads/1781450735545-16db89493264.png",
 "/static/uploads/1781450735547-4562af9f7a17.png",
 ],
 description: "Wireless earbuds with charging case",
 variants: { sizes: [], colors: ["black", "white"] },
 weightGrams: 80,
 },
 ];
 return ProductModel.insertMany(products);
}

async function seedPreventionStats(products: Array<{ _id: mongoose.Types.ObjectId; title: string }>) {
 const sparx = products.find((p) => p.title.includes("Sparx"));
 const sandals = products.find((p) => p.title.includes("Kids"));
 if (!sparx || !sandals) return;

 await PreventionStatModel.insertMany([
 {
 productId: sparx._id,
 profileSegment: "footLengthMm:230-240",
 variantPreference: "8",
 sampleSize: 847,
 confidence: 0.91,
 rationale: "Sparx runs half-size small; 87% of users with 230-240mm feet returned Size 7 and rebought Size 8",
 },
 {
 productId: sparx._id,
 profileSegment: "footLengthMm:240-250",
 variantPreference: "8",
 sampleSize: 612,
 confidence: 0.88,
 },
 {
 productId: sparx._id,
 profileSegment: "footLengthMm:250-260",
 variantPreference: "9",
 sampleSize: 434,
 confidence: 0.85,
 },
 {
 productId: sandals._id,
 profileSegment: "footLengthMm:160-170",
 variantPreference: "3",
 sampleSize: 256,
 confidence: 0.82,
 },
 ]);
}

async function seedDemoActivity(opts: {
 buyers: Array<{ _id: mongoose.Types.ObjectId }>;
 lockers: Array<{ _id: mongoose.Types.ObjectId; location: { coordinates: number[] } }>;
 products: Array<{ _id: mongoose.Types.ObjectId; title: string; originalPrice: number; category: string; images?: string[] }>;
 sellers: Array<{ _id: mongoose.Types.ObjectId; location: { coordinates: number[] } }>;
 small: { _id: mongoose.Types.ObjectId; location: { coordinates: number[] } };
}) {
 // Pre-populate some prior returns so admin dashboard is non-empty.
 await ReturnModel.create({
 productId: opts.products[2]._id,
 sellerId: opts.small._id,
 images: opts.products[2].images || [],
 aiGrade: "B",
 aiSummary: "Lightly worn cotton kurta. Minor cosmetic mark on cuff.",
 defects: ["Small ink mark on cuff"],
 confidence: 0.86,
 priceBand: { min: 400, max: 560 },
 route: "NEIGHBOR_FIRST",
 routeReason: "Local buyers found within 8km",
 estimatedRecovery: 480,
 logisticsCost: 0,
 sellerLocation: opts.small.location,
 status: "COMPLETE",
 refundAmount: 799,
 sellerRefundIssued: true,
 });

 await ReturnModel.create({
 productId: opts.products[3]._id,
 sellerId: opts.small._id,
 images: opts.products[3].images || [],
 aiGrade: "A",
 aiSummary: "Brand new water bottle, original packaging intact.",
 defects: [],
 confidence: 0.94,
 priceBand: { min: 320, max: 380 },
 route: "RENEWED",
 routeReason: "Grade A, no local buyers in category",
 estimatedRecovery: 350,
 logisticsCost: 80,
 sellerLocation: opts.small.location,
 status: "LISTED",
 refundAmount: 449,
 sellerRefundIssued: true,
 });

 await ReturnModel.create({
 productId: opts.products[5]._id,
 sellerId: opts.small._id,
 images: opts.products[5].images || [],
 aiGrade: "C",
 aiSummary: "Used earbuds, scratches on case, working condition.",
 defects: ["Scuffed charging case", "Slight wear on tips"],
 confidence: 0.78,
 priceBand: { min: 280, max: 380 },
 route: "REFURBISH",
 routeReason: "Grade C with recoverable value > ₹300",
 estimatedRecovery: 460,
 logisticsCost: 95,
 sellerLocation: opts.small.location,
 status: "ROUTED",
 refundAmount: 799,
 sellerRefundIssued: true,
 });

 await ReturnModel.create({
 productId: opts.products[2]._id,
 sellerId: opts.small._id,
 images: opts.products[2].images || [],
 aiGrade: "D",
 aiSummary: "Heavily damaged — torn seam, faded color.",
 defects: ["Torn seam", "Faded fabric", "Stains"],
 confidence: 0.81,
 priceBand: { min: 0, max: 50 },
 route: "RECYCLE",
 routeReason: "Grade D — routed to certified textile recycler",
 estimatedRecovery: 0,
 logisticsCost: 0,
 sellerLocation: opts.small.location,
 status: "RECYCLED",
 refundAmount: 799,
 sellerRefundIssued: true,
 });

 // ===================================================================
 // PENDING RESELL RETURNS — items returned by buyers, assigned to sellers
 // ===================================================================
 // Simulate: buyer Neha returned Sparx shoes back to seller Priya
 await ReturnModel.create({
 productId: opts.products[0]._id,
 sellerId: opts.buyers[0]._id, // Neha (buyer who returned)
 originalSellerId: opts.sellers[0]._id, // Priya (original seller)
 images: opts.products[0].images || [],
 aiGrade: "B",
 aiSummary: "Returned shoes — slightly used, minor sole wear. Good for resale.",
 defects: ["Minor sole wear on heel"],
 confidence: 0.88,
 priceBand: { min: 350, max: 480 },
 route: "NEIGHBOR_FIRST",
 routeReason: "Local buyers found within 8km",
 estimatedRecovery: 400,
 logisticsCost: 0,
 sellerLocation: opts.sellers[0].location,
 status: "ROUTED",
 refundAmount: 599,
 sellerRefundIssued: true,
 resellStatus: "PENDING_RESELL",
 });

 // Simulate: buyer Karthik returned baby monitor back to seller Priya
 await ReturnModel.create({
 productId: opts.products[1]._id,
 sellerId: opts.buyers[1]._id, // Karthik (buyer who returned)
 originalSellerId: opts.sellers[0]._id, // Priya (original seller)
 images: opts.products[1].images || [],
 aiGrade: "A",
 aiSummary: "Returned baby monitor — barely used, fully functional with packaging.",
 defects: [],
 confidence: 0.93,
 priceBand: { min: 3200, max: 3800 },
 route: "RENEWED",
 routeReason: "Grade A, high value item",
 estimatedRecovery: 3500,
 logisticsCost: 0,
 sellerLocation: opts.sellers[0].location,
 status: "ROUTED",
 refundAmount: 4500,
 sellerRefundIssued: true,
 resellStatus: "PENDING_RESELL",
 });

 // Simulate: buyer returned earbuds to small seller Anjali
 await ReturnModel.create({
 productId: opts.products[5]._id,
 sellerId: opts.buyers[2]._id, // Meera (buyer who returned)
 originalSellerId: opts.small._id, // Anjali (small seller)
 images: opts.products[5].images || [],
 aiGrade: "B",
 aiSummary: "Returned earbuds — working perfectly, light cosmetic marks on case.",
 defects: ["Light scratch on case"],
 confidence: 0.85,
 priceBand: { min: 450, max: 600 },
 route: "NEIGHBOR_FIRST",
 routeReason: "Local buyers found within 8km",
 estimatedRecovery: 520,
 logisticsCost: 0,
 sellerLocation: opts.small.location,
 status: "ROUTED",
 refundAmount: 799,
 sellerRefundIssued: true,
 resellStatus: "PENDING_RESELL",
 });

 console.log("[seed] created 3 PENDING_RESELL returns for sellers");

 // ===================================================================
 // BUYER ORDERS — so buyers can test the return flow
 // ===================================================================
 const { OrderModel } = await import("../models/Order.js");
 await OrderModel.deleteMany({});

 // Neha bought Sparx shoes from Priya
 await OrderModel.create({
 userId: opts.buyers[0]._id, // Neha
 items: [
 { productId: opts.products[0]._id, title: "Sparx Running Shoes", variant: "Size 7 - Black", price: 599, quantity: 1 },
 ],
 totalAmount: 599,
 shippingAddress: "HSR Layout, Bangalore",
 status: "DELIVERED",
 paymentRef: "DEMO_PAY_001",
 });

 // Neha also bought a water bottle — delivered
 await OrderModel.create({
 userId: opts.buyers[0]._id, // Neha
 items: [
 { productId: opts.products[3]._id, title: "Stainless Steel Water Bottle", variant: "Silver", price: 449, quantity: 1 },
 ],
 totalAmount: 449,
 shippingAddress: "HSR Layout, Bangalore",
 status: "DELIVERED",
 paymentRef: "DEMO_PAY_002",
 });

 // Karthik bought baby monitor from Priya — delivered
 await OrderModel.create({
 userId: opts.buyers[1]._id, // Karthik
 items: [
 { productId: opts.products[1]._id, title: "Philips Avent Baby Monitor", variant: "White", price: 4500, quantity: 1 },
 ],
 totalAmount: 4500,
 shippingAddress: "Jayanagar, Bangalore",
 status: "DELIVERED",
 paymentRef: "DEMO_PAY_003",
 });

 // Meera bought earbuds + kurta from Anjali — delivered
 await OrderModel.create({
 userId: opts.buyers[2]._id, // Meera
 items: [
 { productId: opts.products[5]._id, title: "Bluetooth Earbuds", variant: "Black", price: 799, quantity: 1 },
 { productId: opts.products[2]._id, title: "Cotton Kurta Set", variant: "M - Indigo", price: 799, quantity: 1 },
 ],
 totalAmount: 1598,
 shippingAddress: "Indiranagar, Bangalore",
 status: "DELIVERED",
 paymentRef: "DEMO_PAY_004",
 });

 // Neha has a pending order (not yet delivered)
 await OrderModel.create({
 userId: opts.buyers[0]._id, // Neha
 items: [
 { productId: opts.products[4]._id, title: "Kids' Trekking Sandals", variant: "Size 3 - Brown", price: 549, quantity: 1 },
 ],
 totalAmount: 549,
 shippingAddress: "HSR Layout, Bangalore",
 status: "SHIPPED",
 paymentRef: "DEMO_PAY_005",
 });

 console.log("[seed] created 5 demo orders for buyers");

 // ===================================================================
 // LIVE LISTINGS — these power the personalized recommendations engine
 // ===================================================================
 const { generatePickupCode, makeQrDataUrl } = await import("../utils/qrcode.js");

 const demoListings = [
  // Footwear — Grade A (appeals to Neha, Meera, Aditya)
  {
   product: opts.products[0], // Sparx Running Shoes
   seller: opts.sellers[0],
   locker: opts.lockers[0], // Koramangala
   grade: "A" as const,
   priceFinal: 420,
   summary: "Like-new running shoes. Worn once indoors, sole immaculate.",
   defects: [],
   images: ["/static/uploads/1781450769661-a3e56b4d82ea.png", "/static/uploads/1781450769671-a331179c2b4f.png", "/static/uploads/1781450769673-1f530418f765.png", "/static/uploads/1781450769678-218ecbe8cf71.png", "/static/uploads/1781450769683-0ed900f2265d.png", "/static/uploads/1781450769691-b5d424f22a61.png"],
  },
  // Footwear — Grade B (Kids sandals)
  {
   product: opts.products[4], // Kids Trekking Sandals
   seller: opts.sellers[1],
   locker: opts.lockers[1], // HSR
   grade: "B" as const,
   priceFinal: 349,
   summary: "Lightly used kids sandals. Minor scuff on toe. Perfect for outdoor play.",
   defects: ["Small scuff on toe cap"],
   images: ["/static/uploads/1781455790453-7199877b4c3c.png", "/static/uploads/1781455790501-5f6195c01470.png", "/static/uploads/1781455790502-3b45f39e824f.png", "/static/uploads/1781455790506-59af06ac2dbf.png", "/static/uploads/1781455790509-43b6a9afa4ec.png", "/static/uploads/1781455790510-2fd3fa5031cd.png"],
  },
  // Baby — Grade A (appeals to Karthik, Divya)
  {
   product: opts.products[1], // Philips Baby Monitor
   seller: opts.sellers[0],
   locker: opts.lockers[3], // Jayanagar
   grade: "A" as const,
   priceFinal: 3200,
   summary: "Unused baby monitor, original packaging. Gift duplicate — never powered on.",
   defects: [],
   images: ["/static/uploads/1781456020372-1816a29418ac.png", "/static/uploads/1781456020380-5b9f372e5d31.png", "/static/uploads/1781456020380-83cb9c6fee1c.png", "/static/uploads/1781456020380-d1e5dbd6e276.png", "/static/uploads/1781456020381-13aa199c3dbb.png", "/static/uploads/1781456020382-10d90af6a4be.png"],
  },
  // Apparel — Grade B (appeals to Meera, Pooja, Aditya)
  {
   product: opts.products[2], // Cotton Kurta Set
   seller: opts.small,
   locker: opts.lockers[2], // Indiranagar
   grade: "B" as const,
   priceFinal: 499,
   summary: "Beautiful hand-block print kurta. Worn twice, washed once. Like new.",
   defects: ["Faint fold crease from storage"],
   images: ["/static/uploads/1781456059862-1b3b7f4dd4d7.png", "/static/uploads/1781456059871-f2bc22902889.png", "/static/uploads/1781456059872-2467a6b6aada.png", "/static/uploads/1781456059872-ed4aa2aaf973.png", "/static/uploads/1781456059873-8e9886a976ff.png", "/static/uploads/1781456059875-da370752a07b.jpg"],
  },
  // Home — Grade A (appeals to Neha, Arjun, Ravi, Aditya)
  {
   product: opts.products[3], // Steel Water Bottle
   seller: opts.small,
   locker: opts.lockers[5], // Marathahalli
   grade: "A" as const,
   priceFinal: 320,
   summary: "Brand new Milton bottle. Unused — got two as gifts.",
   defects: [],
   images: ["/static/uploads/1781456074748-b1c4bee70da0.png", "/static/uploads/1781456074752-2954e946e0d7.jpg", "/static/uploads/1781456074752-48a205953e69.png", "/static/uploads/1781456074752-748895c12c35.png", "/static/uploads/1781456074752-f517c8a7f190.png", "/static/uploads/1781456074753-d90e5db79bd6.png"],
  },
  // Electronics — Grade B (appeals to Arjun, Ravi, Karthik)
  {
   product: opts.products[5], // Bluetooth Earbuds
   seller: opts.sellers[1],
   locker: opts.lockers[4], // Whitefield
   grade: "B" as const,
   priceFinal: 520,
   summary: "Boat earbuds in great condition. Charging case has minor scratch. Sound perfect.",
   defects: ["Light scratch on charging case lid"],
   images: ["/static/uploads/1781456089571-af039fe7c37d.png", "/static/uploads/1781456089575-03ae016f37c7.png", "/static/uploads/1781456089575-b13f77494076.jpg", "/static/uploads/1781456089575-c91ba6ede76a.png", "/static/uploads/1781456089576-775137488f93.png", "/static/uploads/1781456089576-c818de38db56.png"],
  },
  // Apparel — Grade A (appeals to Meera, Pooja)
  {
   product: opts.products[2], // Cotton Kurta
   seller: opts.sellers[0],
   locker: opts.lockers[6], // BTM
   grade: "A" as const,
   priceFinal: 580,
   summary: "Unworn kurta with tags intact. Ordered wrong size, never returned in time.",
   defects: [],
   images: ["/static/uploads/1781456120376-ada0b8304ca2.png", "/static/uploads/1781456120379-ce9571fcbaa2.jpg", "/static/uploads/1781456120379-f76c5c0488ef.png", "/static/uploads/1781456120380-4ff15e5cfdbe.png", "/static/uploads/1781456120380-52804626d4c4.png", "/static/uploads/1781456120380-ac758af79db9.png"],
  },
  // Electronics — Grade A (appeals to Arjun, Ravi)
  {
   product: opts.products[5], // Earbuds
   seller: opts.small,
   locker: opts.lockers[7], // Banashankari
   grade: "A" as const,
   priceFinal: 599,
   summary: "Sealed Boat Airdopes. Opened box to check contents, never used.",
   defects: [],
   images: ["/static/uploads/1781456135832-85047eb0d63a.png", "/static/uploads/1781456135836-f3e5a73a0900.png", "/static/uploads/1781456135837-41eeebaaf000.png", "/static/uploads/1781456135837-8d690600cd22.png", "/static/uploads/1781456135837-e340976f0d9e.jpg", "/static/uploads/1781456135838-26ba2c136c54.png"],
  },
  // Footwear — Grade B (appeals to Neha, Meera, Aditya)
  {
   product: opts.products[0], // Sparx shoes
   seller: opts.sellers[1],
   locker: opts.lockers[1], // HSR
   grade: "B" as const,
   priceFinal: 380,
   summary: "Good condition Sparx shoes. Used for 2 weeks. Clean sole, slight crease on toe.",
   defects: ["Slight crease on toe box", "Minor sole wear"],
   images: ["/static/uploads/1781456160050-4ee17796501c.png", "/static/uploads/1781456160058-b1c26a671a95.png", "/static/uploads/1781456160058-cba81c77eda0.png", "/static/uploads/1781456160058-fef7d61061f6.png", "/static/uploads/1781456160059-fa2b924155b8.png", "/static/uploads/1781456160060-7841b766f2d0.png"],
  },
  // Home — Grade B (appeals to Neha, Arjun, Aditya)
  {
   product: opts.products[3], // Water bottle
   seller: opts.sellers[0],
   locker: opts.lockers[0], // Koramangala
   grade: "B" as const,
   priceFinal: 280,
   summary: "Used water bottle, minor dent near base. Insulation works perfectly.",
   defects: ["Small dent on base"],
   images: ["/static/uploads/1781456221721-6e1b60765890.png", "/static/uploads/1781456221734-b84cd64efa4a.png", "/static/uploads/1781456221735-f7aed0bbbd1b.png", "/static/uploads/1781456221736-0fca41fdccf3.png", "/static/uploads/1781456221737-64cd58f398a5.png", "/static/uploads/1781456221738-0013df413640.png"],
  },
 ];

 for (const item of demoListings) {
  const code = generatePickupCode();
  const qr = await makeQrDataUrl(JSON.stringify({ code, listingDemo: true }));
  const lockerCoords = item.locker.location.coordinates as [number, number];
  const listingImages = item.images || item.product.images || ["/products/placeholder.jpg"];

  const ret = await ReturnModel.create({
   productId: item.product._id,
   sellerId: item.seller._id,
   images: listingImages,
   aiGrade: item.grade,
   aiSummary: item.summary,
   defects: item.defects,
   confidence: item.grade === "A" ? 0.95 : 0.87,
   priceBand: { min: item.priceFinal - 50, max: item.priceFinal + 80 },
   route: "NEIGHBOR_FIRST",
   routeReason: "Local buyers found within 8km",
   estimatedRecovery: item.priceFinal,
   logisticsCost: 0,
   sellerLocation: item.seller.location,
   status: "LISTED",
   refundAmount: item.product.originalPrice,
   sellerRefundIssued: true,
  });

  await ListingModel.create({
   returnId: ret._id,
   productId: item.product._id,
   sellerId: item.seller._id,
   lockerId: item.locker._id,
   priceFinal: item.priceFinal,
   title: item.product.title,
   grade: item.grade,
   images: listingImages,
   summary: item.summary,
   defects: item.defects,
   location: { type: "Point", coordinates: lockerCoords },
   status: "LIVE",
   pickupCode: code,
   qrDataUrl: qr,
   expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 2 weeks
  });
 }

 console.log(`[seed] created ${demoListings.length} LIVE listings for recommendations`);
}

async function main() {
 await connectDb();
 console.log("[seed] clearing collections...");
 await clear();

 console.log("[seed] inserting lockers...");
 const lockers = await seedLockers();

 console.log("[seed] inserting users...");
 const users = await seedUsers();

 console.log("[seed] inserting products...");
 const products = await seedProducts();

 console.log("[seed] inserting prevention stats...");
 await seedPreventionStats(products);

 const small = users.find((u) => u.role === "small_seller")!;
 const sellers = users.filter((u) => u.role === "seller" || u.role === "small_seller");
 const buyers = users.filter((u) => u.role === "buyer");
 const lockerPartner = users.find((u) => u.role === "locker")!;

 // Link the first locker (Sharma Kirana) to the locker partner user
 if (lockerPartner && lockers.length > 0) {
 await LockerModel.findByIdAndUpdate(lockers[0]._id, { userId: lockerPartner._id });
 console.log(`[seed] linked locker "${lockers[0].name}" to user "${lockerPartner.name}"`);
 }

 // Assign products to sellers so returns can track originalSellerId
 // Products 0,1,4 -> Priya (seller), Products 2,3,5 -> Anjali (small_seller)
 const priya = sellers.find((s) => s._id.toString() === users.find((u) => u.name === "Priya Sharma")?._id.toString());
 if (priya) {
 await ProductModel.updateMany({ _id: { $in: [products[0]._id, products[1]._id, products[4]._id] } }, { sellerId: priya._id });
 }
 await ProductModel.updateMany({ _id: { $in: [products[2]._id, products[3]._id, products[5]._id] } }, { sellerId: small._id });
 console.log("[seed] assigned sellerId to products");

 console.log("[seed] seeding demo activity + LIVE listings...");
 await seedDemoActivity({
 buyers: buyers.map((b) => ({ _id: b._id })),
 lockers: lockers.map((l) => ({ _id: l._id, location: l.location })),
 products: products.map((p) => ({
 _id: p._id,
 title: p.title,
 originalPrice: p.originalPrice,
 category: p.category,
 images: p.images,
 })),
 sellers: sellers.map((s) => ({ _id: s._id, location: s.location! })),
 small: { _id: small._id, location: small.location! },
 });

 console.log(`[seed] done. ${users.length} users, ${lockers.length} lockers, ${products.length} products.`);
 await mongoose.connection.close();
}

main().catch((e) => {
 console.error(e);
 process.exit(1);
});

