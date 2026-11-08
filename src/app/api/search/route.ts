import { NextRequest, NextResponse } from "next/server";
import { getDestinations, getTrips } from "@/lib/queries";

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  if (q.length < 1) return NextResponse.json({ trips: [], destinations: [] });

  const [trips, destinations] = await Promise.all([getTrips({ q, limit: 6 }), getDestinations()]);
  const needle = q.toLowerCase();

  return NextResponse.json({
    trips: trips.map((t) => ({
      title: t.title,
      slug: t.slug,
      destination_name: t.destination_name || "Nepal",
      duration_days: t.duration_days,
    })),
    destinations: destinations
      .filter((d) => d.name.toLowerCase().includes(needle) || d.region.toLowerCase().includes(needle))
      .slice(0, 4)
      .map((d) => ({ name: d.name, slug: d.slug, region: d.region })),
  });
}
