"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, CalendarDays, Search, Compass } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (duration === "short") params.set("maxDays", "4");
    if (duration === "medium") { params.set("minDays", "5"); params.set("maxDays", "8"); }
    if (duration === "long") { params.set("minDays", "9"); params.set("maxDays", "14"); }
    if (duration === "expedition") params.set("minDays", "15");
    router.push(`/tours${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <form onSubmit={submit} className="mt-7 max-w-3xl">
      <div className="flex flex-col gap-2 rounded-3xl border border-white/80 bg-white/95 p-2 shadow-[0_20px_50px_-20px_rgba(6,58,39,.35)] backdrop-blur sm:flex-row sm:items-center sm:rounded-full">
        <label className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:rounded-full">
          <MapPin className="h-5 w-5 shrink-0 text-brand-500" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Destination</span>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Where in Nepal?"
              className="w-full bg-transparent text-[14px] font-medium text-ink placeholder:font-normal placeholder:text-muted/70"
              aria-label="Destination"
            />
          </span>
        </label>
        <span className="hidden h-8 w-px bg-line sm:block" />
        <label className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:w-[170px] sm:rounded-full">
          <Compass className="h-5 w-5 shrink-0 text-brand-500" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Trip type</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full appearance-none bg-transparent text-[14px] font-medium text-ink" aria-label="Trip type">
              <option value="">All trips</option>
              <option value="trekking">Trekking</option>
              <option value="tour">Local tours</option>
              <option value="cultural">Cultural</option>
              <option value="wildlife">Wildlife</option>
              <option value="adventure">Adventure</option>
            </select>
          </span>
        </label>
        <span className="hidden h-8 w-px bg-line sm:block" />
        <label className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:w-[150px] sm:rounded-full">
          <CalendarDays className="h-5 w-5 shrink-0 text-brand-500" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Duration</span>
            <select value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full appearance-none bg-transparent text-[14px] font-medium text-ink" aria-label="Duration">
              <option value="">Any length</option>
              <option value="short">1–4 days</option>
              <option value="medium">5–8 days</option>
              <option value="long">9–14 days</option>
              <option value="expedition">15+ days</option>
            </select>
          </span>
        </label>
        <button type="submit" className="btn-primary h-[52px] shrink-0 px-6 sm:rounded-full" aria-label="Search trips">
          <Search className="h-5 w-5" /> <span className="sm:hidden">Search trips</span>
        </button>
      </div>
    </form>
  );
}
