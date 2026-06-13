
// Estimate logistics cost in INR given weight + distance.
// Rough India shipping economics: ₹40 base + ₹4/km + ₹0.05/g over 500g.
export function estimateLogisticsCost(distanceKm: number, weightGrams = 500): number {
 const base = 40;
 const perKm = 4 * Math.max(distanceKm, 1);
 const weightSurcharge = Math.max(0, weightGrams - 500) * 0.05;
 return Math.round(base + perKm + weightSurcharge);
}

export function pickFinalPrice(min: number, max: number): number {
 return Math.round((min + max) / 2);
}

