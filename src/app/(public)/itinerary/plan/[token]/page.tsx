import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, ChevronRight, Headset, ShieldCheck } from "lucide-react";
import PlanView from "@/components/site/PlanView";
import SmartImage from "@/components/site/SmartImage";
import { getPlanByToken, getTrips } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { npr, priceOf } from "@/lib/utils";
import type { PlanData } from "@/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const plan = await getPlanByToken(token);
  if (!plan) return { title: "Saved itinerary" };
  return {
    title: plan.title,
    description: `${plan.days}-day Nepal itinerary for ${plan.destination ?? "Nepal"}. Saved with Nepal Travel.`,
  };
}

export default async function SavedPlanPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const [plan, session] = await Promise.all([getPlanByToken(token), getSession()]);
  if (!plan || !plan.data) notFound();

  const data = plan.data as PlanData;
  const matching = await getTrips({ q: plan.destination ?? undefined, limit: 3 });
  const isOwner = Boolean(session && plan.user_id === session.id);

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="shell flex items-center gap-1.5 py-3 text-[11.5px] text-muted">
          <Link href="/" className="hover:text-forest">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/itinerary" className="hover:text-forest">Itinerary planner</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-ink">{plan.title}</span>
        </div>
      </div>

      <section className="shell grid gap-8 py-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0">
          <PlanView plan={data} token={token} source={plan.source} />
          {isOwner && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 px-4 py-3 text-[12px] text-forest">
              <span>This plan belongs to your account and is saved in your dashboard.</span>
              <Link href="/dashboard/plans" className="inline-flex items-center gap-1 font-semibold text-brand-700 hover:text-forest">
                Manage my plans <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="relative h-32">
              <SmartImage src="/images/hero/hero.jpg" alt="Nepal trekking" fill sizes="320px" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">Make it real</p>
                <h2 className="text-[16px] font-semibold">Travel with local guides</h2>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <p className="text-[12px] leading-relaxed text-body/75">
                We&apos;ll match your plan to a licensed guide, private vehicle and hand-picked teahouses — with 24/7 support on the trail.
              </p>
              <Link href="/contact" className="btn-primary btn-sm w-full"><Headset className="h-4 w-4" /> Request a quote</Link>
              <Link href="/tours" className="btn-outline btn-sm w-full">Browse guided trips</Link>
              <div className="flex items-start gap-2 rounded-xl bg-mist p-3 text-[10.5px] text-muted">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                No payment needed to plan. You only pay when you confirm a departure.
              </div>
            </div>
          </div>

          {matching.length > 0 && (
            <div className="rounded-3xl border border-line bg-white p-4 shadow-card">
              <h2 className="text-[13px] font-semibold text-ink">Trips that match this plan</h2>
              <ul className="mt-3 space-y-3">
                {matching.map((trip) => (
                  <li key={trip.id}>
                    <Link href={`/tours/${trip.slug}`} className="group flex items-center gap-3">
                      <span className="relative h-12 w-14 shrink-0 overflow-hidden rounded-xl">
                        <SmartImage src={trip.hero_image} alt={trip.title} fill sizes="56px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-semibold text-ink group-hover:text-brand-600">{trip.title}</span>
                        <span className="mt-0.5 flex items-center gap-2 text-[10px] text-muted">
                          <span className="inline-flex items-center gap-0.5"><CalendarDays className="h-3 w-3" /> {trip.duration_days}d</span>
                          <span className="font-semibold text-forest">{npr(priceOf(trip))}</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
