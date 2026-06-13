// Free reverse-geocoding via OpenStreetMap Nominatim. Rate-limited but fine for hackathon.

export interface GeocodeResult {
  display: string;
  city?: string;
  country?: string;
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`;
    const r = await fetch(url, {
      headers: { "User-Agent": "ReLoop/1.0 (hackathon demo)" },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { display_name?: string; address?: Record<string, string> };
    return {
      display: j.display_name ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      city: j.address?.city ?? j.address?.town ?? j.address?.village,
      country: j.address?.country,
    };
  } catch {
    return null;
  }
}

export async function forwardGeocode(query: string): Promise<{ lat: number; lng: number; display: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      query
    )}&limit=1`;
    const r = await fetch(url, {
      headers: { "User-Agent": "ReLoop/1.0 (hackathon demo)" },
    });
    if (!r.ok) return null;
    const arr = (await r.json()) as Array<{ lat: string; lon: string; display_name: string }>;
    const hit = arr[0];
    if (!hit) return null;
    return { lat: Number(hit.lat), lng: Number(hit.lon), display: hit.display_name };
  } catch {
    return null;
  }
}
