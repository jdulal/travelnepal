import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MapPinned, ShieldCheck, Sparkles, Star, Wallet } from "lucide-react";
import ItineraryPlanner from "@/components/site/ItineraryPlanner";
import TripCard from "@/components/site/TripCard";
import SmartImage from "@/components/site/SmartImage";
import { getDestinations, getTrips } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "AI Itinerary Planner",
  description:
    "Build a day-by-day Nepal itinerary in seconds. Tell us your destination, dates, group and budget — we plan the mornings, meals, stays and costs.",
};

const starters = [
  "Everest Base Camp",
  "Annapurna Circuit",
  "Pokhara",
  "Kathmandu Valley",
  "Chitwan National Park",
  "Upper Mustang",
  "Bandipur",
  "Ilam tea hills",
];

export default async function ItineraryPage() {
  const [destinations, session, trips] = await Promise.all([
    getDestinations(),
    getSession(),
    getTrips({ featuredOnly: true, limit: 3 }),
  ]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <SmartImage src="/images/hero/hero.jpg" alt="Himalayan trail at sunrise" fill priority sizes="100vw" className="object-[50%_35%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/95 via-forest/85 to-forest/40" />
        <div className="shell relative py-14 text-white sm:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-brand-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> AI Itinerary Planner
            </span>
            <h1 className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
              Your perfect Nepal trip,
              <br />
              planned in <span className="hero-script text-brand-300">seconds.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/75">
              Give us a destination, how many days you have and your budget. We&apos;ll build a realistic day-by-day plan with local
              routes, meals, stays and honest cost estimates — then a real person can refine it.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] text-white/80">
              {[
                [Clock, "Ready in ~5 seconds"],
                [MapPinned, "Routes built from real trips"],
                [Wallet, "Transparent cost estimates"],
                [ShieldCheck, "No payment to plan"],
              ].map(([Icon, label]) => (
                <span key={String(label)} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-brand-300" /> {label as string}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="shell -mt-8 pb-4">
        <div className="rounded-3xl border border-line bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Popular starting points</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {starters.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-forest">
                <Star className="h-3 w-3 text-brand-500" /> {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-8">
        <ItineraryPlanner destinations={destinations.map((d) => ({ name: d.name }))} loggedIn={Boolean(session)} />
      </section>

      <section className="shell pb-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Rather follow a proven route?</p>
            <h2 className="section-title mt-1">Turn your plan into a guided trip</h2>
          </div>
          <Link href="/tours" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-forest">
            Browse all trips <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </>
  );
}
