import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock,
  MapPin,
  Mountain,
  ShieldCheck,
  Star,
  Users,
  Wallet,
  X,
} from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import SaveButton from "@/components/site/SaveButton";
import TripItinerary from "@/components/site/TripItinerary";
import TripCard from "@/components/site/TripCard";
import ReviewForm from "@/components/site/ReviewForm";
import FaqAccordion from "@/components/site/FaqAccordion";
import { getFaqs, getSavedTripIds, getTripBySlug } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { categoryLabel, difficultyLabel, npr, priceOf, seatsLeft, shortDate, usd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getTripBySlug(slug);
  if (!data) return { title: "Trip not found" };
  return {
    title: data.trip.title,
    description: data.trip.summary ?? undefined,
    openGraph: {
      title: data.trip.title,
      description: data.trip.summary ?? undefined,
      images: data.trip.hero_image ? [data.trip.hero_image] : undefined,
    },
  };
}

export default async function TripDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, session, faqs] = await Promise.all([getTripBySlug(slug), getSession(), getFaqs()]);
  if (!data) notFound();

  const { trip, days, departures, reviews, related } = data;
  const saved = session ? await getSavedTripIds(session.id) : [];
  const price = priceOf(trip);
  const gallery = (trip.gallery ?? []).filter(Boolean);
  const tripFaqs = faqs.filter((f) => f.category === "trip" || f.category === "booking").slice(0, 5);
  const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : Number(trip.rating);

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="shell flex items-center gap-1.5 overflow-hidden py-3 text-[11.5px] text-muted">
          <Link href="/" className="hover:text-forest">Home</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <Link href="/tours" className="hover:text-forest">Tours</Link>
          <ChevronRight className="h-3 w-3 shrink-0" />
          <span className="truncate font-medium text-ink">{trip.title}</span>
        </div>
      </div>

      <section className="shell pt-5">
        <div className="grid gap-2.5 lg:grid-cols-[2fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-3xl lg:aspect-auto lg:min-h-[380px]">
            <SmartImage src={gallery[0] ?? trip.hero_image} alt={trip.title} fill priority sizes="(max-width: 1024px) 100vw, 66vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/50 via-transparent to-transparent" />
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-forest">{categoryLabel(trip.category)}</span>
              <span className="rounded-full bg-forest/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">{difficultyLabel(trip.difficulty)}</span>
            </div>
            <div className="absolute right-4 top-4"><SaveButton tripId={trip.id} initialSaved={saved.includes(trip.id)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-1">
            {[gallery[1] ?? "/images/hero/hero.jpg", gallery[2] ?? "/images/destinations/nepal-hills.jpg"].map((src, i) => (
              <div key={`${src}-${i}`} className="relative aspect-[16/10] overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[184px]">
                <SmartImage src={src} alt={`${trip.title} view ${i + 2}`} fill sizes="33vw" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11.5px] text-muted">
              <span className="inline-flex items-center gap-1 font-semibold text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {Number(avg).toFixed(1)}
                <span className="font-normal text-muted">({trip.review_count} reviews)</span>
              </span>
              <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-brand-500" /> {trip.destination_name ?? "Nepal"}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-brand-500" /> {trip.duration_days} days</span>
              <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand-500" /> Max {trip.group_size}</span>
              {trip.max_altitude ? <span className="inline-flex items-center gap-1"><Mountain className="h-3.5 w-3.5 text-brand-500" /> {trip.max_altitude.toLocaleString()} m</span> : null}
            </div>

            <h1 className="mt-2 text-[30px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[38px]">{trip.title}</h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-body/75">{trip.summary}</p>

            {trip.highlights && trip.highlights.length > 0 && (
              <div className="mt-6 grid gap-2 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2">
                {trip.highlights.map((h) => (
                  <p key={h} className="flex items-start gap-2 text-[12.5px] text-body/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" /> {h}</p>
                ))}
              </div>
            )}

            <section className="mt-9">
              <h2 className="section-title">Overview</h2>
              <div className="prose-nepal mt-3 text-[13.5px] text-body/80" dangerouslySetInnerHTML={{ __html: trip.description ?? "" }} />
            </section>

            <section className="mt-9">
              <div className="flex items-end justify-between gap-3">
                <h2 className="section-title">Day-by-day itinerary</h2>
                <span className="text-[11.5px] text-muted">{days.length} days · {trip.departure_city} start</span>
              </div>
              <div className="mt-4"><TripItinerary days={days} /></div>
            </section>

            <section className="mt-9 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><BadgeCheck className="h-4 w-4 text-brand-600" /> What&apos;s included</h2>
                <ul className="mt-3 space-y-2">
                  {(trip.inclusions ?? []).map((x) => <li key={x} className="flex gap-2 text-[12.5px] text-body/80"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> {x}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink"><X className="h-4 w-4 text-red-400" /> Not included</h2>
                <ul className="mt-3 space-y-2">
                  {(trip.exclusions ?? []).map((x) => <li key={x} className="flex gap-2 text-[12.5px] text-body/80"><X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" /> {x}</li>)}
                </ul>
              </div>
            </section>

            {trip.permit_info && (
              <section className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
                <h2 className="text-[14px] font-semibold text-forest">Permits &amp; paperwork</h2>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-body/75">{trip.permit_info}</p>
              </section>
            )}

            <section className="mt-9">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <h2 className="section-title">Traveller reviews</h2>
                <span className="flex items-center gap-1 text-[12px] text-muted"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {Number(avg).toFixed(1)} average · {reviews.length} shown</span>
              </div>
              <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
                <div className="space-y-3">
                  {reviews.length === 0 && <p className="rounded-2xl border border-dashed border-line p-6 text-center text-[13px] text-muted">No reviews yet — be the first after your trip.</p>}
                  {reviews.map((r) => (
                    <article key={r.id} className="rounded-2xl border border-line bg-white p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-[10px] font-bold text-white">{r.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</span>
                          <div>
                            <p className="text-[12.5px] font-semibold text-ink">{r.name}</p>
                            <p className="text-[10px] text-muted">{shortDate(r.created_at)}</p>
                          </div>
                        </div>
                        <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < r.rating ? "h-3 w-3 fill-amber-400 text-amber-400" : "h-3 w-3 text-line"} />)}</span>
                      </div>
                      {r.title && <p className="mt-2.5 text-[13px] font-semibold text-ink">{r.title}</p>}
                      <p className="mt-1 text-[12.5px] leading-relaxed text-body/75">{r.body}</p>
                    </article>
                  ))}
                </div>
                <ReviewForm tripId={trip.id} signedIn={Boolean(session)} />
              </div>
            </section>

            {tripFaqs.length > 0 && (
              <section className="mt-9">
                <h2 className="section-title">Before you go</h2>
                <div className="mt-4"><FaqAccordion items={tripFaqs} /></div>
              </section>
            )}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted">From, per person</p>
                  <p className="text-[26px] font-bold leading-none text-forest">{npr(price)}</p>
                  <p className="mt-1 text-[10.5px] text-muted">{usd(price)}</p>
                </div>
                {trip.sale_price && <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">Save {npr(Number(trip.price) - price)}</span>}
              </div>

              <form action={`/tours/${trip.slug}/book`} method="get" className="mt-4 space-y-3">
                <div>
                  <label className="label" htmlFor="departure">Choose a departure</label>
                  <select id="departure" name="departure" className="field" defaultValue={departures[0]?.id ?? ""}>
                    {departures.length === 0 && <option value="">Custom dates</option>}
                    {departures.map((d) => (
                      <option key={d.id} value={d.id} disabled={seatsLeft(d) === 0}>
                        {shortDate(d.start_date)} — {shortDate(d.end_date)} · {seatsLeft(d) === 0 ? "Full" : `${seatsLeft(d)} seats`}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="travelers">Travellers</label>
                  <select id="travelers" name="travelers" className="field" defaultValue="2">
                    {Array.from({ length: Math.min(trip.group_size, 12) }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "traveller" : "travellers"}</option>)}
                  </select>
                </div>
                <button type="submit" className="btn-primary w-full">Book this trip</button>
                <Link href="/contact" className="btn-outline w-full">Ask a question</Link>
              </form>

              <div className="mt-4 space-y-2 border-t border-line pt-4 text-[11px] text-muted">
                <p className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Free cancellation up to 30 days before departure</p>
                <p className="flex items-center gap-2"><Wallet className="h-3.5 w-3.5 text-brand-600" /> Pay 20% now, balance 15 days before</p>
                <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-brand-600" /> Small groups, licensed local guides</p>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-mist/70 p-5">
              <h2 className="text-[13px] font-semibold text-ink">Trip facts</h2>
              <dl className="mt-3 space-y-2.5 text-[11.5px]">
                {[
                  ["Best season", trip.best_season ?? "Mar–May, Sep–Nov"],
                  ["Difficulty", difficultyLabel(trip.difficulty)],
                  ["Group size", `Max ${trip.group_size}`],
                  ["Trip type", categoryLabel(trip.category)],
                  ["Start / finish", trip.departure_city],
                  ["Altitude", trip.max_altitude ? `${trip.max_altitude.toLocaleString()} m` : "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-3">
                    <dt className="text-muted">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-3xl bg-forest p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">Need help deciding?</p>
              <p className="mt-1.5 text-[14px] font-semibold">Talk to a local expert</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-white/65">We reply within one business day, and can tailor this trip to your dates and fitness.</p>
              <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-200 hover:text-white">
                Start a conversation <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="shell py-14">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">You might also like</p>
              <h2 className="section-title mt-1">Similar journeys</h2>
            </div>
            <Link href="/tours" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-forest">All trips <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((t) => <TripCard key={t.id} trip={t} saved={saved.includes(t.id)} />)}
          </div>
        </section>
      )}
    </>
  );
}
