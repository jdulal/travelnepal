"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, Loader2, Wand2, MapPin, AlertCircle, ArrowRight } from "lucide-react";
import PlanView from "./PlanView";
import { cn } from "@/lib/utils";
import type { PlanData } from "@/types";

const interestOptions = ["Trekking", "Culture", "Wildlife", "Food", "Adventure", "Wellness", "Photography", "Relaxation"];

export default function ItineraryPlanner({ destinations, loggedIn }: { destinations: { name: string }[]; loggedIn: boolean }) {
  const [destination, setDestination] = useState("Pokhara & Annapurna foothills");
  const [days, setDays] = useState(5);
  const [travelers, setTravelers] = useState(2);
  const [budget, setBudget] = useState("mid");
  const [interests, setInterests] = useState<string[]>(["Trekking", "Culture"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ plan: PlanData; token: string; source: string } | null>(null);

  const toggle = (i: string) => setInterests((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));

  const generate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/ai/itinerary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, days, travelers, budgetTier: budget, interests }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not generate a plan.");
      setResult(data);
      setTimeout(() => document.getElementById("plan-result")?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[380px_1fr] lg:items-start">
      <form onSubmit={generate} className="rounded-3xl border border-line bg-white p-5 shadow-card lg:sticky lg:top-28">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Wand2 className="h-5 w-5" /></span>
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Build your itinerary</h2>
            <p className="text-[11px] text-muted">Takes about 5 seconds</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="destination">Where do you want to go?</label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-500" />
              <input
                id="destination"
                list="destination-list"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Everest, Pokhara, Chitwan"
                className="field pl-10"
                required
              />
              <datalist id="destination-list">
                {destinations.map((d) => <option key={d.name} value={d.name} />)}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="days">Days</label>
              <select id="days" value={days} onChange={(e) => setDays(Number(e.target.value))} className="field">
                {Array.from({ length: 21 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "day" : "days"}</option>)}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="travelers">Travellers</label>
              <select id="travelers" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="field">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} {n === 1 ? "person" : "people"}</option>)}
              </select>
            </div>
          </div>

          <div>
            <span className="label">Budget style</span>
            <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-mist p-1">
              {[["budget", "Budget"], ["mid", "Comfort"], ["luxury", "Luxury"]].map(([value, label]) => (
                <button key={value} type="button" onClick={() => setBudget(value)} className={cn("rounded-xl py-2 text-[12px] font-semibold transition", budget === value ? "bg-white text-forest shadow-soft" : "text-muted hover:text-forest")}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="label">Interests <span className="font-normal text-muted">(choose any)</span></span>
            <div className="flex flex-wrap gap-1.5">
              {interestOptions.map((i) => (
                <button key={i} type="button" onClick={() => toggle(i)} className={cn("chip text-[11px]", interests.includes(i) && "chip-active")}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Crafting your plan…</> : <><Sparkles className="h-4 w-4" /> Generate itinerary</>}
          </button>
          <p className="text-center text-[10px] leading-relaxed text-muted">
            {loggedIn ? "Plans are saved to your dashboard automatically." : <>Plans get a shareable link. <Link href="/sign-in" className="font-semibold text-brand-600">Sign in</Link> to keep them.</>}
          </p>
        </div>
      </form>

      <div id="plan-result" className="min-w-0">
        {result ? (
          <div className="space-y-4">
            <PlanView plan={result.plan} token={result.token} source={result.source} />
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3 text-[12px] text-muted">
              <span>Plan saved. Share it with your group or come back any time.</span>
              <Link href={`/itinerary/plan/${result.token}`} className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-forest">
                Open saved plan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-line bg-white">
            <div className="relative h-56 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero/hero.jpg" alt="Himalayan trail" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/80 to-transparent" />
              <div className="absolute bottom-5 left-6 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-200">Your plan, in seconds</p>
                <h2 className="text-[24px] font-semibold">Tell us your dates. We'll do the rest.</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Set your trip", "Destination, days, group and budget style."],
                  ["2", "Get a real plan", "Day-by-day mornings, afternoons, meals and stays."],
                  ["3", "Make it real", "Save it, share it, or book a matching guided trip."],
                ].map(([n, title, body]) => (
                  <div key={n} className="rounded-2xl bg-mist p-4">
                    <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{n}</span>
                    <p className="mt-2.5 text-[13px] font-semibold text-ink">{title}</p>
                    <p className="mt-1 text-[11.5px] leading-relaxed text-muted">{body}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-5 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-brand-500" />
                <p className="mt-2 text-[13px] font-medium text-forest">Your itinerary will appear here</p>
                <p className="mt-1 text-[11px] text-muted">Built from our routes, seasons and real local costs — then editable with our team.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
