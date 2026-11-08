import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Compass, HeartHandshake, Leaf, MapPin, Mountain, ShieldCheck, Users } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import { getDestinations, getHomeStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "About us",
  description: "Nepal Travel is a Kathmandu-based team of guides, planners and mountain people building honest, low-impact journeys across Nepal.",
};

const values = [
  { icon: HeartHandshake, title: "Local first", body: "Every trip is led by Nepali guides and stays in family-run teahouses and lodges. Money stays in the mountains." },
  { icon: ShieldCheck, title: "Safety without drama", body: "Acclimatisation days, oxygen, pulse oximeters and insurance-checked crews — because getting home matters more than summit photos." },
  { icon: Leaf, title: "Low-impact by default", body: "Small groups, refillable water, no single-use plastic on the trail and porter loads capped at 15 kg." },
  { icon: Compass, title: "Honest advice", body: "If a route is wrong for your fitness or season, we'll say so — and suggest one that fits." },
];

const team = [
  { name: "Pemba Sherpa", role: "Head of trekking", initials: "PS", tone: "#004f32" },
  { name: "Anisha Shrestha", role: "Trip designer", initials: "AS", tone: "#63ab45" },
  { name: "Bikash Thapa", role: "Wildlife & Terai lead", initials: "BT", tone: "#8a6d3b" },
  { name: "Sunita Rai", role: "Guest experience", initials: "SR", tone: "#2f6f8f" },
];

export default async function AboutPage() {
  const [stats, destinations] = await Promise.all([getHomeStats(), getDestinations()]);

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src={destinations[0]?.hero_image ?? "/images/hero/hero.jpg"} alt="Nepal mountains" fill priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-deep/95 via-forest-deep/75 to-forest/30" />
        </div>
        <div className="shell relative py-16 text-white sm:py-24">
          <p className="hero-script text-[22px] text-brand-200">Born here. Still exploring.</p>
          <h1 className="mt-2 max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[52px]">
            We&apos;re mountain people,<br className="hidden sm:block" /> not a booking engine.
          </h1>
          <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-white/70">
            Nepal Travel was started in Kathmandu by guides who were tired of watching visitors rushed up the wrong trail in the wrong season. We build trips the way we&apos;d plan them for family.
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <Link href="/tours" className="btn-primary">Browse trips <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white backdrop-blur hover:bg-white/20">Meet the team</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="shell grid grid-cols-2 divide-x divide-line py-7 sm:grid-cols-4">
          {[
            [stats.travellers.toLocaleString() + "+", "Travellers hosted"],
            [stats.trips.toString(), "Curated routes"],
            [stats.destinations.toString(), "Destinations"],
            ["4.9/5", "Average rating"],
          ].map(([value, label]) => (
            <div key={label} className="px-3 text-center">
              <p className="text-[24px] font-bold tracking-tight text-forest sm:text-[28px]">{value}</p>
              <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.1em] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="shell py-12">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <div>
            <p className="eyebrow">How we work</p>
            <h2 className="section-title mt-1">Small groups. Real people. No shortcuts.</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-body/80">
              We cap departures at twelve, pay porters properly and build in the acclimatisation days that make high treks safe. Our office in Thamel is staffed by the same guides who lead the routes — so the advice you get before booking is the same advice you get at 4,500 m.
            </p>
            <p className="mt-3 text-[13.5px] leading-relaxed text-body/80">
              We also believe planning should be fast. That&apos;s why we built an AI planner trained on our own routes, seasons and cost data — so you can sketch a trip in seconds, then refine it with a human.
            </p>
            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {values.slice(0, 2).map((v) => (
                <div key={v.title} className="rounded-2xl bg-mist p-4">
                  <v.icon className="h-4 w-4 text-brand-600" />
                  <p className="mt-2 text-[13px] font-semibold text-ink">{v.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <SmartImage src="/images/hero/hero.jpg" alt="Guides on a Nepal trail" fill sizes="(max-width: 1024px) 100vw, 50vw" />
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="shell">
          <div className="max-w-xl">
            <p className="eyebrow">What we stand for</p>
            <h2 className="section-title mt-1">Four things we won&apos;t compromise</h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-3xl border border-line bg-white p-5">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600"><v.icon className="h-5 w-5" /></span>
                <h3 className="mt-3 text-[14px] font-semibold text-ink">{v.title}</h3>
                <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <p className="eyebrow">The people</p>
            <h2 className="section-title mt-1">You&apos;ll know who you&apos;re travelling with</h2>
            <p className="mt-3 text-[13px] leading-relaxed text-body/75">Our core team has spent a combined 60+ years on Nepal&apos;s trails, in its national parks and in its teahouses. They&apos;re the ones answering your emails.</p>
            <div className="mt-4 space-y-2 text-[12px] text-body/80">
              <p className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand-600" /> Government-licensed trekking agency</p>
              <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" /> Kathmandu office, Thamel Marg</p>
              <p className="flex items-center gap-2"><Users className="h-4 w-4 text-brand-600" /> 40+ licensed guides and porters</p>
              <p className="flex items-center gap-2"><Mountain className="h-4 w-4 text-brand-600" /> Routes from 1,000 m to 5,545 m</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {team.map((m) => (
              <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5">
                <span className="grid h-11 w-11 place-items-center rounded-full text-[12px] font-bold text-white" style={{ background: m.tone }}>{m.initials}</span>
                <div>
                  <p className="text-[13px] font-semibold text-ink">{m.name}</p>
                  <p className="text-[10.5px] text-muted">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="shell pb-16">
        <div className="rounded-[2rem] bg-brand-500 px-6 py-10 text-white sm:px-10">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-lg">
              <h2 className="text-[24px] font-semibold leading-tight">Ready when you are</h2>
              <p className="mt-1.5 text-[13px] text-white/85">Tell us your dates. We&apos;ll suggest the right route, the right season and the right budget.</p>
            </div>
            <Link href="/contact" className="rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-forest hover:bg-brand-50">Start planning</Link>
          </div>
        </div>
      </section>
    </>
  );
}
