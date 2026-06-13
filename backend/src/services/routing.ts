import { RouteType } from "../models/Return.js";
import { estimateLogisticsCost } from "../utils/pricing.js";

export interface RoutingInput {
 grade: "A" | "B" | "C" | "D";
 suggestedPrice: number; // resale price (from AI grading)
 originalPrice: number; // what the customer was refunded
 hasLocalBuyers: boolean; // any verified buyer ≤20km
 estimatedDistanceKm?: number; // distance to nearest warehouse
 weightGrams?: number;
 category?: string;
}

export interface RoutingDecision {
 route: RouteType;
 reason: string;
 estimatedRecovery: number; // what the platform expects to recover
 logisticsCost: number; // shipping cost if applicable
 netRecovery: number; // recovery minus logistics
 platformLoss: number; // refund paid - net recovery (what the platform still loses)
}

const WAREHOUSE_DEFAULT_DISTANCE_KM = 600;

/**
 * AI Routing Engine
 *
 * Economics: The seller/platform already refunded the customer (full loss).
 * This engine decides the smartest route to RECOVER maximum value from the
 * returned item, minimizing net loss.
 *
 * Decision tree:
 * 1. Grade A/B → can resell. Prefer local (zero logistics) over shipping.
 *    - If logistics cost > resale value → don't ship, sell locally or donate.
 * 2. Grade C → refurbish first, then resell at higher value.
 *    - Only if refurbished value - logistics > 0 (net positive).
 * 3. Grade D → no resale value. Donate or recycle (zero recovery but sustainable).
 */
export function decideRoute(input: RoutingInput): RoutingDecision {
 const distance = input.estimatedDistanceKm ?? WAREHOUSE_DEFAULT_DISTANCE_KM;
 const logistics = estimateLogisticsCost(distance, input.weightGrams ?? 500);
 const resaleValue = input.suggestedPrice;
 const refundPaid = input.originalPrice;

 // Grade A/B — item is in good condition, can be resold directly
 if (input.grade === "A" || input.grade === "B") {
  // Best case: sell to nearby buyer (zero logistics = maximum recovery)
  if (input.hasLocalBuyers) {
   return {
    route: "NEIGHBOR_FIRST",
    reason: `Grade ${input.grade} item with verified local buyers. Sell locally — zero logistics, maximum recovery.`,
    estimatedRecovery: resaleValue,
    logisticsCost: 0,
    netRecovery: resaleValue,
    platformLoss: refundPaid - resaleValue,
   };
  }

  // Can ship to warehouse/renewed listing if logistics makes economic sense
  if (logistics < resaleValue) {
   return {
    route: "RENEWED",
    reason: `Grade ${input.grade} item, no local buyers. Ship to Renewed marketplace — logistics ₹${logistics} < recovery ₹${resaleValue}.`,
    estimatedRecovery: resaleValue,
    logisticsCost: logistics,
    netRecovery: resaleValue - logistics,
    platformLoss: refundPaid - (resaleValue - logistics),
   };
  }

  // Logistics cost exceeds resale value — DON'T ship. Donate instead.
  return {
   route: "DONATE",
   reason: `Grade ${input.grade} but logistics ₹${logistics} exceeds resale value ₹${resaleValue}. Shipping is uneconomical — donate to local NGO instead. Zero recovery but zero additional loss.`,
   estimatedRecovery: 0,
   logisticsCost: 0,
   netRecovery: 0,
   platformLoss: refundPaid,
  };
 }

 // Grade C — item needs refurbishment before resale
 if (input.grade === "C") {
  // Refurbish can increase value by ~40-60%
  const refurbishedValue = Math.round(resaleValue * 1.5);
  const refurbishCost = Math.round(resaleValue * 0.2); // 20% of current value
  const netAfterRefurbish = refurbishedValue - logistics - refurbishCost;

  if (netAfterRefurbish > 0 && logistics < refurbishedValue) {
   return {
    route: "REFURBISH",
    reason: `Grade C — refurbish to increase value from ₹${resaleValue} to ~₹${refurbishedValue}. Net recovery ₹${netAfterRefurbish} after logistics + refurb cost.`,
    estimatedRecovery: refurbishedValue,
    logisticsCost: logistics + refurbishCost,
    netRecovery: netAfterRefurbish,
    platformLoss: refundPaid - netAfterRefurbish,
   };
  }

  // Not worth refurbishing — donate
  return {
   route: "DONATE",
   reason: `Grade C but refurbish economics don't work (logistics ₹${logistics} + refurb cost too high vs value ₹${resaleValue}). Donate to NGO — sustainable outcome.`,
   estimatedRecovery: 0,
   logisticsCost: 0,
   netRecovery: 0,
   platformLoss: refundPaid,
  };
 }

 // Grade D — no resale value. Route to responsible disposal.
 return {
  route: "RECYCLE",
  reason: `Grade D — heavy wear/damage. No resale value. Routed to certified recycler — never liquidated blindly. Platform absorbs full loss but ensures sustainable disposal.`,
  estimatedRecovery: 0,
  logisticsCost: 0,
  netRecovery: 0,
  platformLoss: refundPaid,
 };
}
