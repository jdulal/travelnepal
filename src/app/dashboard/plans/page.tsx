import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Sparkles, Trash2, Users, Wallet } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { getPlans } from "@/lib/queries";
import { deletePlanAction } from "@/app/actions/dashboard";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "AI plans" };

export default async function PlansPage() {
  const session = await requireUser("/dashboard/plans");
  const plans = await getPlans(session.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Saved itineraries</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">AI plans</h1>
          <p className="mt-1 text-[12.5px] text-muted">Every plan you generate is saved here with a private share link.</p>
        </div>
        <Link href="/dashboard/planner" className="btn-primary btn-sm"><Sparkles className="h-4 w-4" /> New plan</Link>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <Sparkles className="mx-auto h-9 w-9 text-brand-400" />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">No plans yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">Tell the planner where you want to go and it will draft a day-by-day route with costs.</p>
          <Link href="/dashboard/planner" className="btn-primary btn-sm mt-4">Build my first plan</Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((p) => (
            <article key={p.id} className="flex flex-col rounded-3xl border border-line bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${p.source === "ai" ? "bg-brand-50 text-forest" : "bg-mist text-muted"}`}>
                  {p.source === "ai" ? "AI generated" : "Expert pattern"}
                </span>
                <span className="text-[10px] text-muted">{shortDate(p.created_at)}</span>
              </div>
              <h2 className="mt-2 text-[17px] font-semibold leading-snug text-ink">{p.title}</h2>
              <div className="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-[10.5px] text-muted">
                <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-brand-500" /> {p.destination ?? "Nepal"}</span>
                <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3 text-brand-500" /> {p.days} days</span>
                <span className="inline-flex items-center gap-1"><Users className="h-3 w-3 text-brand-500" /> {p.travelers}</span>
                <span className="inline-flex items-center gap-1 capitalize"><Wallet className="h-3 w-3 text-brand-500" /> {p.budget_tier}</span>
              </div>
              <div className="mt-auto flex items-center gap-2 pt-4">
                <Link href={`/itinerary/plan/${p.token}`} className="btn-primary btn-sm">Open plan <ArrowRight className="h-3.5 w-3.5" /></Link>
                <form action={deletePlanAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="btn-ghost btn-sm text-red-600 hover:bg-red-50" aria-label="Delete plan"><Trash2 className="h-3.5 w-3.5" /> Delete</button>
                </form>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
