import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Check, ChevronRight, Footprints, HeartPulse, Mountain, ShieldCheck, Snowflake, Sun, Users } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import TripCard from "@/components/site/TripCard";
import FaqAccordion from "@/components/site/FaqAccordion";
import { getFaqs, getSavedTripIds, getTrips } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Trekking in Nepal",
  description:
    "Everest Base Camp, Annapurna Circuit, Langtang, Manaslu and more. Licensed guides, small groups, acclimatisation-first itineraries and honest advice for every fitness level.",
};

const levels = [
  { name: "Easy", desc: "Short hill walks and village trails. 3–6 days, under 3,000 m, 3–4 hours walking a day.", tone: "bg-emerald-50 text-emerald-700" },
  { name: "Moderate", desc: "Classic teahouse treks like Ghorepani and Annapurna Base Camp. 5–10 days, up to 4,200 m.", tone: "bg-brand-50 text-brand-700" },
  { name: "Challenging", desc: "High passes and long days — Everest Base Camp, Langtang, Manaslu. 10–16 days, up to 5,500 m.", tone: "bg-amber-50 text-amber-700" },
  { name: "Strenuous", desc: "Remote expeditions and 5,000 m+ passes. Requires prior trekking fitness and flexibility.", tone: "bg-rose-50 text-rose-700" },
];

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const seasonScore = [3, 3, 4, 5, 5, 2, 1, 2, 5, 5, 4, 3];

export default async function TrekkingPage() {
  const [trips, session, faqs] = await Promise.all([getTrips({ category: "trekking" }), getSession(), getFaqs()]);
  const saved = session ? await getSavedTripIds(session.id) : [];
  const trekFaqs = faqs.filter((f) => f.category === "trek" || f.category === "trip").slice(0, 6);
  const hero = trips[0];

  return (
    <>
      <section className="relative overflow-hidden bg-forest-deep text-white">
        <div className="absolute inset-0">
          <SmartImage src={hero?.hero_image ?? "/images/hero/hero.jpg"} alt="Trekking in Nepal" fill priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep via-forest-deep/80 to-forest/30" />
        </div>
        <div className="shell relative py-14 sm:py-20">
          <div className="flex items-center gap-1.5 text-[11.5px] text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Trekking</span>
          </div>
          <p className="hero-script mt-5 text-[22px] text-brand-200">Walk among giants</p>
          <h1 className="mt-2 max-w-3xl text-[38px] font-semibold leading-[1.04] tracking-[-0.03em] sm:text-[54px]">
            Nepal&apos;s greatest trails,<br className="hidden sm:block" /> done right.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/70">
            Acclimatisation-first itineraries, licensed Sherpa guides and small groups. From a three-day ridge walk to the foot of Everest — we&apos;ll match the trail to your fitness.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link href="/tours?category=trekking" className="btn-primary">Browse treks <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/itinerary" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur hover:bg-white/20">Plan with AI</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[11.5px] text-white/75">
            {[[Mountain, "Up to 5,545 m"], [Users, "Max 12 trekkers"], [ShieldCheck, "Oxygen & first aid"], [CalendarDays, "Mar–May · Sep–Nov"]].map(([Icon, label]) => (
              <span key={String(label)} className="inline-flex items-center gap-1.5"><Icon className="h-4 w-4 text-brand-300" /> {label as string}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">Find your level</p>
            <h2 className="section-title mt-1">Not every trek has to hurt</h2>
            <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-body/75">
              Grade is about daily hours, altitude and trail surface — not how tough you think you are. If you can walk 4–5 hours with a day pack, there&apos;s a Himalayan trail with your name on it.
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {levels.map((l) => (
                <div key={l.name} className="rounded-2xl border border-line bg-white p-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${l.tone}`}>{l.name}</span>
                  <p className="mt-2 text-[11.5px] leading-relaxed text-body/75">{l.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Best time to trek</p>
                <h2 className="mt-1 text-[18px] font-semibold text-ink">Season at a glance</h2>
              </div>
              <div className="flex gap-3 text-[10px] text-muted">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-500" /> Prime</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-brand-200" /> Shoulder</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {months.map((m, i) => (
                <div key={m} className="text-center">
                  <div className={`h-16 rounded-xl ${seasonScore[i] === 5 ? "bg-brand-500" : seasonScore[i] === 4 ? "bg-brand-300" : seasonScore[i] === 3 ? "bg-brand-100" : "bg-mist"}`} />
                  <p className="mt-1 text-[10px] text-muted">{m}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2 text-[11.5px] text-body/75">
              <p className="flex gap-2"><Sun className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> Spring: rhododendrons, stable weather, busiest trails.</p>
              <p className="flex gap-2"><Snowflake className="mt-0.5 h-3.5 w-3.5 shrink-0 text-sky-500" /> Winter: clear views, cold nights, quiet teahouses below 4,000 m.</p>
              <p className="flex gap-2"><HeartPulse className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> Monsoon: lush, leeches and clouds — good for lower cultural walks.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="shell pb-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">{trips.length} treks</p>
            <h2 className="section-title mt-1">Pick your trailhead</h2>
          </div>
          <Link href="/tours?category=trekking" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-forest">Filter treks <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {trips.map((t) => <TripCard key={t.id} trip={t} saved={saved.includes(t.id)} />)}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="shell grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div className="rounded-3xl bg-forest p-6 text-white">
            <Footprints className="h-6 w-6 text-brand-300" />
            <h2 className="mt-3 text-[22px] font-semibold leading-tight">Our trekking promise</h2>
            <ul className="mt-4 space-y-2.5">
              {[
                "Extra acclimatisation days on every high-altitude route",
                "Pulse oximeter and oxygen carried by every guide",
                "Porter loads capped at 15 kg — fair, insured crews",
                "No hidden permit or TIMS charges",
                "Free date changes up to 30 days before departure",
              ].map((x) => (
                <li key={x} className="flex gap-2 text-[12px] leading-relaxed text-white/80"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" /> {x}</li>
              ))}
            </ul>
            <Link href="/about" className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-200 hover:text-white">How we work <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div>
            <p className="eyebrow">Trekking questions</p>
            <h2 className="section-title mt-1">Straight answers</h2>
            <div className="mt-4"><FaqAccordion items={trekFaqs} /></div>
          </div>
        </div>
      </section>

      <section className="shell py-12">
        <div className="relative overflow-hidden rounded-[2rem] bg-brand-500 px-6 py-10 text-white sm:px-10">
          <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/15 blur-xl" />
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-lg">
              <h2 className="text-[24px] font-semibold leading-tight">Not sure which trek fits?</h2>
              <p className="mt-1.5 text-[13px] text-white/85">Answer four questions and our planner will suggest a route, or ask a local guide who has walked them all.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href="/itinerary" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-forest hover:bg-brand-50">Try the AI planner</Link>
              <Link href="/contact" className="rounded-full border border-white/40 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-white/10">Ask a guide</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
