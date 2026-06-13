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
 images: ["/products/sparx-shoes.jpg"],
 description: "Lightweight running shoes with breathable mesh upper",
 variants: { sizes: ["6", "7", "8", "9", "10"], colors: ["black", "blue"] },
 weightGrams: 700,
 },
 {
 title: "Philips Avent Baby Monitor",
 category: "baby",
 brand: "Philips",
 originalPrice: 4500,
 images: ["/products/baby-monitor.jpg"],
 description: "Audio baby monitor with nightlight",

variants: { sizes: [], colors: ["white"] },
 weightGrams: 600,
 },
 {
 title: "Cotton Kurta Set",
 category: "apparel",
 brand: "FabIndia",
 originalPrice: 799,
 images: ["/products/kurta.jpg"],
 description: "Hand-block printed cotton kurta",
 variants: { sizes: ["S", "M", "L", "XL"], colors: ["indigo", "ivory"] },
 weightGrams: 400,
 },
 {
 title: "Stainless Steel Water Bottle",
 category: "home",
 brand: "Milton",
 originalPrice: 449,
 images: ["/products/bottle.jpg"],
 description: "1L insulated stainless steel bottle",
 variants: { sizes: [], colors: ["silver", "blue", "black"] },
 weightGrams: 350,
 },
 {
 title: "Kids' Trekking Sandals",
 category: "footwear",
 brand: "Liberty",
 originalPrice: 549,
 images: ["/products/kids-sandals.jpg"],
 description: "Sturdy outdoor sandals for kids",
 variants: { sizes: ["1", "2", "3", "4", "5"], colors: ["brown", "black"] },
 weightGrams: 450,
 },
 {
 title: "Bluetooth Earbuds",
 category: "electronics",
 brand: "Boat",
 originalPrice: 799,
 images: ["/products/earbuds.jpg"],
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
 products: Array<{ _id: mongoose.Types.ObjectId; title: string; originalPrice: number; category: string }>;
 small: { _id: mongoose.Types.ObjectId; location: { coordinates: number[] } };
}) {
 // Pre-populate some prior returns so admin dashboard is non-empty.
 const r1 = await ReturnModel.create({
 productId: opts.products[2]._id,
 sellerId: opts.small._id,
 images: ["/products/kurta.jpg"],
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
 images: ["/products/bottle.jpg"],
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
 images: ["/products/earbuds.jpg"],
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
 images: ["/products/kurta.jpg"],
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
 const buyers = users.filter((u) => u.role === "buyer");

 console.log("[seed] seeding prior demo activity...");
 await seedDemoActivity({
 buyers: buyers.map((b) => ({ _id: b._id })),
 lockers: lockers.map((l) => ({ _id: l._id, location: l.location })),
 products: products.map((p) => ({
 _id: p._id,
 title: p.title,
 originalPrice: p.originalPrice,
 category: p.category,
 })),
 small: { _id: small._id, location: small.location! },
 });

 console.log(`[seed] done. ${users.length} users, ${lockers.length} lockers, ${products.length} products.`);
 await mongoose.connection.close();
}

main().catch((e) => {
 console.error(e);
 process.exit(1);
});

