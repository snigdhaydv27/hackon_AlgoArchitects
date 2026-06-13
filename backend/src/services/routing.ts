

import { RouteType } from "../models/Return.js";
import { estimateLogisticsCost } from "../utils/pricing.js";

export interface RoutingInput {
 grade: "A" | "B" | "C" | "D";
 suggestedPrice: number; // pick midpoint of band
 hasLocalBuyers: boolean; // any verified buyer ≤20km
 estimatedDistanceKm?: number; // distance to nearest warehouse for logistics estimate
 weightGrams?: number;
 category?: string;
}

export interface RoutingDecision {
 route: RouteType;
 reason: string;
 estimatedRecovery: number;
 logisticsCost: number;
 netRecovery: number;
}

const WAREHOUSE_DEFAULT_DISTANCE_KM = 600; // Priya's example: 600km

export function decideRoute(input: RoutingInput): RoutingDecision {
 const distance = input.estimatedDistanceKm ?? WAREHOUSE_DEFAULT_DISTANCE_KM;
 const logistics = estimateLogisticsCost(distance, input.weightGrams ?? 500);
 const value = input.suggestedPrice;

 // A/B grades — try Neighbor First, fall back to Renewed
 if (input.grade === "A" || input.grade === "B") {
 if (input.hasLocalBuyers) {
 return {
 route: "NEIGHBOR_FIRST",
 reason: `Grade ${input.grade} item with verified buyers nearby. Skip warehouse — zero logistics cost.`,
 estimatedRecovery: value,
 logisticsCost: 0,
 netRecovery: value,
 };
 }
 if (logistics < value) {
 return {
 route: "RENEWED",
 reason: `Grade ${input.grade} item, no local buyers. Route to platform Renewed listing.`,
 estimatedRecovery: value,
 logisticsCost: logistics,
 netRecovery: value - logistics,
 };
 }
 // logistics > value even at A/B — shouldn't usually happen but cover it
 return {
 route: "DONATE",
 reason: `Grade ${input.grade} but logistics ₹${logistics} > value ₹${value}. Donate to NGO.`,
 estimatedRecovery: 0,
 logisticsCost: 0,
 netRecovery: 0,
 };
 }

 // Grade C — refurbish if value > ₹300, else donate
 if (input.grade === "C") {
 if (value > 300 && logistics < value) {
 return {
 route: "REFURBISH",
 reason: `Grade C with recoverable value ₹${value} > ₹300. Route to refurbish partner.`,
 estimatedRecovery: Math.round(value * 1.4),
 logisticsCost: logistics,
 netRecovery: Math.round(value * 1.4) - logistics,
 };
 }
 return {
 route: "DONATE",
 reason: `Grade C with low recoverable value. Route to NGO partner — better outcome than landfill.`,
 estimatedRecovery: 0,
 logisticsCost: 0,
 netRecovery: 0,
 };
 }

 // Grade D — recycle (or donate if NGO-acceptable)
 return {
 route: "RECYCLE",
 reason: `Grade D — heavy wear/damage. Routed to certified e-waste/textile recycler. Never liquidated blindly.`,
 estimatedRecovery: 0,
 logisticsCost: 0,
 netRecovery: 0,
 };
}

