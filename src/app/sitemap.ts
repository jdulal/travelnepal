import type { MetadataRoute } from "next";
import { getDestinations, getStories, getTrips } from "@/lib/queries";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [trips, destinations, stories] = await Promise.all([
    getTrips({ limit: 200 }),
    getDestinations(),
    getStories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tours`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/trekking`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/destinations`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/stories`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/itinerary`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/community`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms-condition`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookie-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...staticPages,
    ...trips.map((trip) => ({
      url: `${base}/tours/${trip.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...destinations.map((destination) => ({
      url: `${base}/destinations/${destination.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...stories.map((story) => ({
      url: `${base}/stories/${story.slug}`,
      lastModified: story.published_at ? new Date(story.published_at) : undefined,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
