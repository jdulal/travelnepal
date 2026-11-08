import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Compass, MapPin, Mountain, Sparkles, Sun } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import TripCard from "@/components/site/TripCard";
import DestinationCard from "@/components/site/DestinationCard";
import { getDestinationBySlug, getDestinations, getSavedTripIds } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getDestinationBySlug(slug);
  if (!data) return { title: "Destination not found" };
  return {
    title: data.destination.name,
    description: data.destination.summary ?? undefined,
    openGraph: { title: data.destination.name, images: data.destination.hero_image ? [data.destination.hero_image] : undefined },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, all, session] = await Promise.all([getDestinationBySlug(slug), getDestinations(), getSession()]);
  if (!data) notFound();
  const { destination, trips } = data;
  const saved = session ? await getSavedTripIds(session.id) : [];
  const others = all.filter((d) => d.id !== destination.id).slice(0, 4);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src={destination.hero_image ?? destination.thumbnail} alt={destination.name} fill priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/15" />
        </div>
        <div className="shell relative flex min-h-[420px] flex-col justify-end pb-10 pt-24 text-white">
          <div className="flex items-center gap-1.5 text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/destinations" className="hover:text-white">Destinations</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">{destination.name}</span>
          </div>
          <p className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-100 backdrop-blur">
            <MapPin className="h-3 w-3" /> {destination.region}{destination.province ? ` · ${destination.province}` : ""}
          </p>
          <h1 className="mt-3 max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">{destination.name}</h1>
          <p className="mt-2 max-w-2xl text-[14px] text-white/75">{destination.tagline}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-[11px]">
            {destination.altitude && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><Mountain className="h-3.5 w-3.5 text-brand-300" /> {destination.altitude}</span>}
            {destination.best_season && <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><Sun className="h-3.5 w-3.5 text-brand-300" /> {destination.best_season}</span>}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><Compass className="h-3.5 w-3.5 text-brand-300" /> {trips.length} curated {trips.length === 1 ? "trip" : "trips"}</span>
          </div>
        </div>
      </section>

      <section className="shell grid gap-8 py-10 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="min-w-0">
          <h2 className="section-title">Why go to {destination.name}</h2>
          <div className="prose-nepal mt-3 text-[13.5px] text-body/80" dangerouslySetInnerHTML={{ __html: destination.description ?? `<p>${destination.summary ?? ""}</p>` }} />

          <div className="mt-8">
            <div className="flex items-end justify-between gap-3">
              <h2 className="section-title">Trips in {destination.name}</h2>
              <Link href={`/tours?destination=${destination.slug}`} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand-600 hover:text-forest">Filter all <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {trips.length > 0 ? (
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                {trips.map((t) => <TripCard key={t.id} trip={t} saved={saved.includes(t.id)} />)}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-line bg-white p-8 text-center">
                <p className="text-[13px] text-muted">No scheduled trips here yet — but we build private journeys to {destination.name} year-round.</p>
                <Link href="/contact" className="btn-primary btn-sm mt-4">Plan a private trip</Link>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <Sparkles className="h-5 w-5 text-brand-500" />
            <h2 className="mt-2 text-[15px] font-semibold text-ink">Build a trip around {destination.name}</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">Tell us your dates and pace — our AI planner drafts a day-by-day route you can refine with a local expert.</p>
            <Link href="/itinerary" className="btn-primary btn-sm mt-3 w-full">Open AI planner</Link>
            <Link href="/contact" className="btn-outline btn-sm mt-2 w-full">Talk to an expert</Link>
          </div>
          <div className="rounded-3xl border border-line bg-mist/60 p-5">
            <h2 className="text-[13px] font-semibold text-ink">Good to know</h2>
            <dl className="mt-3 space-y-2 text-[11.5px]">
              <div className="flex justify-between gap-2"><dt className="text-muted">Region</dt><dd className="font-medium text-ink">{destination.region}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">Province</dt><dd className="text-right font-medium text-ink">{destination.province ?? "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">Altitude</dt><dd className="font-medium text-ink">{destination.altitude ?? "—"}</dd></div>
              <div className="flex justify-between gap-2"><dt className="text-muted">Best season</dt><dd className="text-right font-medium text-ink">{destination.best_season ?? "—"}</dd></div>
            </dl>
          </div>
        </aside>
      </section>

      <section className="shell pb-16">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Keep exploring</p>
            <h2 className="section-title mt-1">More of Nepal</h2>
          </div>
          <Link href="/destinations" className="text-[13px] font-semibold text-brand-600 hover:text-forest">All destinations</Link>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-4">
          {others.map((d) => <DestinationCard key={d.id} destination={d} />)}
        </div>
      </section>
    </>
  );
}
