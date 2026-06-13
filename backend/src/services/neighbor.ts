

import { UserModel } from "../models/User.js";
import { LockerModel } from "../models/Locker.js";
import { haversineKm } from "../utils/distance.js";

export interface NeighborMatch {
 buyersNearby: Array<{
 _id: string;
 name: string;
 distanceKm: number;
 interests: string[];
 avatar?: string;
 }>;
 nearestLocker: {
 _id: string;
 name: string;
 address: string;
 distanceKm: number;
 coordinates: [number, number];
 partnerType: string;
 } | null;
}

const RADIUS_METERS = 20_000; // 20km per spec

export async function findNeighborMatches(
 sellerLocation: [number, number],
 category?: string
): Promise<NeighborMatch> {
 // Verified buyers within 20km, optionally filtered by category interest
 const buyerFilter: Record<string, unknown> = {
 role: "buyer",
 verified: true,
 location: {
 $near: {
 $geometry: { type: "Point", coordinates: sellerLocation },
 $maxDistance: RADIUS_METERS,
 },
 },
 };
 if (category) buyerFilter.interests = { $in: [category] };

 const buyers = await UserModel.find(buyerFilter).limit(10).lean();
 const buyersNearby = buyers.map((b) => ({
 _id: String(b._id),
 name: b.name,
 distanceKm: round2(
 haversineKm(sellerLocation, b.location!.coordinates as [number, number])
 ),
 interests: b.interests ?? [],
 avatar: b.avatar ?? undefined,
 }));

 // Nearest locker (any partner type) within 5km — kirana network
 const lockers = await LockerModel.find({
 location: {
 $near: {
 $geometry: { type: "Point", coordinates: sellerLocation },
 $maxDistance: 8_000,
 },
 },
 })
 .limit(1)
 .lean();
 const lockerDoc = lockers[0];
 const nearestLocker = lockerDoc
 ? {
 _id: String(lockerDoc._id),
 name: lockerDoc.name,
 address: lockerDoc.address,
 partnerType: lockerDoc.partnerType ?? "kirana",
 coordinates: lockerDoc.location!.coordinates as [number, number],
 distanceKm: round2(
 haversineKm(sellerLocation, lockerDoc.location!.coordinates as [number, number])
 ),
 }
 : null;

 return { buyersNearby, nearestLocker };
}

export async function listNearbyListings(
 buyerLocation: [number, number],
 maxKm = 25
) {
 const { ListingModel } = await import("../models/Listing.js");
 const docs = await ListingModel.find({
 status: "LIVE",
 location: {
 $near: {
 $geometry: { type: "Point", coordinates: buyerLocation },
 $maxDistance: maxKm * 1000,
 },
 },
 })
 .populate("lockerId")
 .lean();
 return docs.map((d) => ({
 ...d,
 distanceKm: round2(haversineKm(buyerLocation, d.location!.coordinates as [number, number])),
 }));
}

function round2(n: number) {
 return Math.round(n * 100) / 100;
}

