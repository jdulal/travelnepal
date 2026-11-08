"use client";

import Link from "next/link";
import { CalendarDays, Check, Copy, Printer, Sparkles, Users, Wallet, MapPin, Utensils, BedDouble } from "lucide-react";
import { useState } from "react";
import { npr } from "@/lib/utils";
import type { PlanData } from "@/types";

export default function PlanView({ plan, token, source, shareable = true }: { plan: PlanData; token?: string; source?: string; shareable?: boolean }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!token) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/itinerary/plan/${token}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-line bg-white shadow-card">
      <div className="relative overflow-hidden bg-forest p-6 text-white sm:p-8">
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-brand-400/20 blur-2xl" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">
              <Sparkles className="h-3 w-3" /> {source === "ai" ? "AI-generated plan" : "Expert-pattern plan"}
            </span>
            <h2 className="mt-3 text-[26px] font-semibold leading-tight text-white sm:text-[32px]">{plan.title}</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-white/70">{plan.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1"><CalendarDays className="h-3 w-3" /> {plan.days} days</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1"><Users className="h-3 w-3" /> {plan.travelers} travellers</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1"><Wallet className="h-3 w-3" /> {plan.budget_tier} budget</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1"><MapPin className="h-3 w-3" /> {plan.destination}</span>
            </div>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-right backdrop-blur">
            <p className="text-[10px] uppercase tracking-wide text-white/60">Estimated total</p>
            <p className="text-[22px] font-bold text-white">{npr(plan.totals.group)}</p>
            <p className="text-[10px] text-white/60">{npr(plan.totals.per_person)} per person</p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-line">
          {plan.itinerary.map((day) => (
            <li key={day.day} className="relative flex gap-4">
              <span className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-brand-200 bg-brand-50 text-[12px] font-bold text-forest">
                {day.day}
              </span>
              <div className="min-w-0 flex-1 rounded-2xl border border-line bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-[15px] font-semibold text-ink">{day.title}</h3>
                  <span className="text-[11px] font-semibold text-brand-600">{npr(day.cost)}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {[["Morning", day.morning], ["Afternoon", day.afternoon], ["Evening", day.evening]].map(([label, text]) => (
                    <div key={label} className="rounded-xl bg-mist/70 p-2.5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">{label}</p>
                      <p className="mt-1 text-[11.5px] leading-relaxed text-body/80">{text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10.5px] text-muted">
                  <span className="inline-flex items-center gap-1"><Utensils className="h-3 w-3 text-brand-500" /> {day.meals.join(", ") || "—"}</span>
                  <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3 text-brand-500" /> {day.stay}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>

        {plan.tips?.length > 0 && (
          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/60 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-forest">Good to know</p>
            <ul className="mt-2 space-y-1.5">
              {plan.tips.map((tip) => (
                <li key={tip} className="flex gap-2 text-[12px] text-body/80"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> {tip}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-2.5 border-t border-line pt-5">
          <Link href={`/tours?q=${encodeURIComponent(plan.destination)}`} className="btn-primary btn-sm">Find matching trips</Link>
          <Link href="/contact" className="btn-outline btn-sm">Ask a local expert</Link>
          <button onClick={() => window.print()} className="btn-ghost btn-sm"><Printer className="h-4 w-4" /> Print / PDF</button>
          {shareable && token && (
            <button onClick={copy} className="btn-ghost btn-sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Link copied" : "Share plan"}
            </button>
          )}
          <span className="ml-auto text-[10px] text-muted">Estimate only · final quote confirmed by our team</span>
        </div>
      </div>
    </div>
  );
}
