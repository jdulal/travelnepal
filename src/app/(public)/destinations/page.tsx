import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Compass, MapPin, Mountain } from "lucide-react";
import DestinationCard from "@/components/site/DestinationCard";
import TripCard from "@/components/site/TripCard";
import SmartImage from "@/components/site/SmartImage";
import { getDestinations, getSavedTripIds, getTrips } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Destinations",
  description: "Explore Nepal by region — Everest and Khumbu, Annapurna, Pokhara, Kathmandu Valley, Chitwan, Mustang, Lumbini and the eastern tea hills.",
};

export default async function DestinationsPage() {
  const [destinations, trips, session] = await Promise.all([getDestinations(), getTrips(), getSession()]);
  const saved = session ? await getSavedTripIds(session.id) : [];
  const counts = trips.reduce<Record<string, number>>((acc, t) => {
    if (t.destination_slug) acc[t.destination_slug] = (acc[t.destination_slug] ?? 0) + 1;
    return acc;
  }, {});
  const featured = destinations.find((d) => d.featured) ?? destinations[0];
  const regions = Array.from(new Set(destinations.map((d) => d.region)));

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src={featured?.hero_image ?? "/images/hero/hero.jpg"} alt="Nepal landscape" fill priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/95 via-forest-deep/75 to-forest/30" />
        </div>
        <div className="shell relative py-14 text-white sm:py-20">
          <div className="flex items-center gap-1.5 text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Destinations</span>
          </div>
          <p className="hero-script mt-5 text-[21px] text-brand-200">From 60 m to 8,848 m</p>
          <h1 className="mt-2 max-w-2xl text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[50px]">One country, a lifetime of places</h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/70">
            Snow peaks, medieval cities, rhino grasslands and tea-covered hills — all within a day&apos;s drive of each other. Pick a region and we&apos;ll build the route.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {regions.map((r) => <span key={r} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur">{r}</span>)}
          </div>
        </div>
      </section>

      <section className="shell py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{destinations.length} destinations</p>
            <h2 className="section-title mt-1">Where will you go?</h2>
          </div>
          <Link href="/tours" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-forest">Browse by trip <Compass className="h-4 w-4" /></Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {destinations.map((d) => (
            <div key={d.id} className="space-y-1.5">
              <DestinationCard destination={d} tall />
              <div className="flex items-center justify-between px-1 text-[10.5px] text-muted">
                <span className="inline-flex items-center gap-1"><Mountain className="h-3 w-3 text-brand-500" /> {d.altitude ?? "—"}</span>
                <span className="font-medium text-forest">{counts[d.slug] ?? 0} {counts[d.slug] === 1 ? "trip" : "trips"}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {featured && (
        <section className="shell pb-12">
          <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-card">
            <div className="grid lg:grid-cols-[1.1fr_1fr]">
              <div className="relative min-h-[260px]">
                <SmartImage src={featured.thumbnail ?? featured.hero_image} alt={featured.name} fill sizes="(max-width: 1024px) 100vw, 55vw" />
              </div>
              <div className="p-6 sm:p-8">
                <p className="eyebrow inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Featured region · {featured.region}</p>
                <h2 className="mt-2 text-[26px] font-semibold leading-tight text-ink">{featured.name}</h2>
                <p className="mt-2 text-[13px] leading-relaxed text-body/75">{featured.summary}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[11.5px]">
                  <div className="rounded-xl bg-mist p-3"><p className="text-muted">Best season</p><p className="mt-0.5 font-semibold text-ink">{featured.best_season ?? "Mar–May, Sep–Nov"}</p></div>
                  <div className="rounded-xl bg-mist p-3"><p className="text-muted">Altitude</p><p className="mt-0.5 font-semibold text-ink">{featured.altitude ?? "Varies"}</p></div>
                </div>
                <Link href={`/destinations/${featured.slug}`} className="btn-primary btn-sm mt-4">Explore {featured.name}</Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="shell pb-16">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Most popular right now</p>
            <h2 className="section-title mt-1">Featured journeys</h2>
          </div>
          <Link href="/tours" className="text-[13px] font-semibold text-brand-600 hover:text-forest">See all</Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.filter((t) => t.featured).slice(0, 3).map((t) => <TripCard key={t.id} trip={t} saved={saved.includes(t.id)} />)}
        </div>
      </section>
    </>
  );
}
