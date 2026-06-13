import { NotificationModel } from "../models/Notification.js";
import { UserModel } from "../models/User.js";
import { haversineKm } from "../utils/distance.js";

interface ListingLite {
  _id: unknown;
  title: string;
  priceFinal: number;
  grade: string;
  location: { coordinates: number[] };
}

// When a Neighbor First listing goes LIVE, push a notification to every
// verified buyer within 20km whose interests match the product category.
export async function notifyNearbyBuyers(opts: {
  listing: ListingLite;
  category?: string;
  radiusKm?: number;
}): Promise<number> {
  const radius = opts.radiusKm ?? 20;
  const coords = opts.listing.location.coordinates as [number, number];

  const filter: Record<string, unknown> = {
    role: "buyer",
    verified: true,
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: coords },
        $maxDistance: radius * 1000,
      },
    },
  };
  if (opts.category) filter.interests = { $in: [opts.category] };

  const buyers = await UserModel.find(filter).limit(50).lean();

  if (buyers.length === 0) return 0;

  const docs = buyers.map((b) => ({
    userId: b._id,
    title: `New ${opts.listing.grade}-grade item near you`,
    body: `${opts.listing.title} — ₹${opts.listing.priceFinal} · ${
      Math.round(haversineKm(coords, b.location!.coordinates as [number, number]) * 10) / 10
    } km`,
    listingId: opts.listing._id,
    kind: "NEIGHBOR_LISTING" as const,
    distanceKm: haversineKm(coords, b.location!.coordinates as [number, number]),
  }));

  await NotificationModel.insertMany(docs);
  return docs.length;
}
