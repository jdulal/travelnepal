import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Compass, Filter, Search, SlidersHorizontal, X } from "lucide-react";
import TripCard from "@/components/site/TripCard";
import { getDestinations, getSavedTripIds, getTrips, type TripFilters } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { categoryLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Treks & Tours",
  description:
    "Browse every Nepal trekking route, cultural tour, wildlife safari and adventure trip offered by Nepal Travel — filter by destination, difficulty, duration and budget.",
};

type Params = {
  q?: string;
  category?: string;
  difficulty?: string;
  destination?: string;
  duration?: string;
  maxPrice?: string;
  sort?: string;
};

const categories = ["trekking", "tour", "cultural", "wildlife", "adventure", "wellness", "honeymoon"];
const difficulties = ["easy", "moderate", "challenging", "strenuous"];
const durations: Record<string, { minDays?: number; maxDays?: number; label: string }> = {
  short: { maxDays: 4, label: "1–4 days" },
  medium: { minDays: 5, maxDays: 8, label: "5–8 days" },
  long: { minDays: 9, maxDays: 14, label: "9–14 days" },
  expedition: { minDays: 15, label: "15+ days" },
};
const budgets = [50000, 100000, 150000, 250000];

function buildHref(current: Params, patch: Partial<Params>) {
  const next = { ...current, ...patch };
  const params = new URLSearchParams();
  Object.entries(next).forEach(([k, v]) => {
    if (v) params.set(k, String(v));
  });
  const qs = params.toString();
  return `/tours${qs ? `?${qs}` : ""}`;
}

export default async function ToursPage({ searchParams }: { searchParams: Promise<Params> }) {
  const sp = await searchParams;
  const duration = sp.duration ? durations[sp.duration] : undefined;

  const filters: TripFilters = {
    q: sp.q,
    category: categories.includes(sp.category ?? "") ? sp.category : undefined,
    difficulty: difficulties.includes(sp.difficulty ?? "") ? sp.difficulty : undefined,
    destination: sp.destination,
    minDays: duration?.minDays,
    maxDays: duration?.maxDays,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    sort: sp.sort,
  };

  const [trips, destinations, session] = await Promise.all([getTrips(filters), getDestinations(), getSession()]);
  const saved = session ? await getSavedTripIds(session.id) : [];
  const activeCount = [sp.q, sp.category, sp.difficulty, sp.destination, sp.duration, sp.maxPrice].filter(Boolean).length;
  const destinationName = destinations.find((d) => d.slug === sp.destination)?.name;

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep text-white">
        <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_20%_20%,#63ab45_0,transparent_45%),radial-gradient(circle_at_80%_30%,#0e7a4f_0,transparent_40%)]" />
        <div className="shell relative py-10 sm:py-14">
          <div className="flex items-center gap-1.5 text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Treks &amp; tours</span>
          </div>
          <p className="hero-script mt-5 text-[20px] text-brand-200">Find your kind of Nepal</p>
          <h1 className="mt-2 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[46px]">
            {destinationName ? `Trips in ${destinationName}` : "Every route, one place"}
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/70">
            {trips.length} {trips.length === 1 ? "journey" : "journeys"} across the Himalaya, mid-hills and Terai — each led by licensed local guides.
          </p>
        </div>
      </section>

      <div className="shell -mt-6 pb-16">
        <form action="/tours" method="get" className="rounded-3xl border border-line bg-white p-4 shadow-card">
          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
            <label className="flex items-center gap-2 rounded-2xl border border-line bg-mist/60 px-3.5 py-2.5">
              <Search className="h-4 w-4 shrink-0 text-brand-500" />
              <input name="q" defaultValue={sp.q} placeholder="Search treks, places, themes…" className="w-full bg-transparent text-[13px] text-ink placeholder:text-muted" aria-label="Search trips" />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5">
              <Compass className="h-4 w-4 shrink-0 text-brand-500" />
              <select name="category" defaultValue={sp.category ?? ""} className="w-full bg-transparent text-[13px] text-ink" aria-label="Category">
                <option value="">All trip types</option>
                {categories.map((c) => <option key={c} value={c}>{categoryLabel(c)}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5">
              <SlidersHorizontal className="h-4 w-4 shrink-0 text-brand-500" />
              <select name="difficulty" defaultValue={sp.difficulty ?? ""} className="w-full bg-transparent text-[13px] text-ink" aria-label="Difficulty">
                <option value="">Any difficulty</option>
                {difficulties.map((d) => <option key={d} value={d}>{d[0].toUpperCase() + d.slice(1)}</option>)}
              </select>
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-line px-3.5 py-2.5">
              <Filter className="h-4 w-4 shrink-0 text-brand-500" />
              <select name="destination" defaultValue={sp.destination ?? ""} className="w-full bg-transparent text-[13px] text-ink" aria-label="Destination">
                <option value="">All destinations</option>
                {destinations.map((d) => <option key={d.id} value={d.slug}>{d.name}</option>)}
              </select>
            </label>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary flex-1 lg:flex-none">Show trips</button>
              <select name="sort" defaultValue={sp.sort ?? ""} className="rounded-2xl border border-line bg-white px-2 text-[12px] text-ink" aria-label="Sort">
                <option value="">Best match</option>
                <option value="price-asc">Price ↑</option>
                <option value="price-desc">Price ↓</option>
                <option value="duration">Duration</option>
                <option value="rating">Rating</option>
                <option value="newest">Newest</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3 text-[11.5px]">
            <span className="font-semibold text-muted">Duration:</span>
            <Link href={buildHref(sp, { duration: undefined })} className={`chip ${!sp.duration ? "chip-active" : ""}`}>Any</Link>
            {Object.entries(durations).map(([key, d]) => (
              <Link key={key} href={buildHref(sp, { duration: key })} className={`chip ${sp.duration === key ? "chip-active" : ""}`}>{d.label}</Link>
            ))}
            <span className="ml-2 hidden font-semibold text-muted sm:inline">Budget:</span>
            {budgets.map((b) => (
              <Link key={b} href={buildHref(sp, { maxPrice: String(b) })} className={`chip hidden sm:inline-flex ${sp.maxPrice === String(b) ? "chip-active" : ""}`}>
                Under {Math.round(b / 1000)}k
              </Link>
            ))}
          </div>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13px] text-muted">
            <span className="font-semibold text-ink">{trips.length}</span> {trips.length === 1 ? "trip" : "trips"}
            {sp.q ? <> for <span className="font-semibold text-ink">&ldquo;{sp.q}&rdquo;</span></> : null}
          </p>
          {activeCount > 0 && (
            <Link href="/tours" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11.5px] font-medium text-muted hover:text-forest">
              <X className="h-3 w-3" /> Clear {activeCount} {activeCount === 1 ? "filter" : "filters"}
            </Link>
          )}
        </div>

        {trips.length > 0 ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => <TripCard key={trip.id} trip={trip} saved={saved.includes(trip.id)} />)}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-line bg-white p-12 text-center">
            <Compass className="mx-auto h-9 w-9 text-brand-400" />
            <h2 className="mt-3 text-[18px] font-semibold text-ink">No trips match those filters</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted">Try removing a filter, or tell our team what you have in mind and we&apos;ll build it privately for you.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Link href="/tours" className="btn-primary btn-sm">View all trips</Link>
              <Link href="/contact" className="btn-outline btn-sm">Plan a custom trip</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
