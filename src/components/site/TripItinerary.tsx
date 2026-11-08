"use client";

import { useState } from "react";
import { ChevronDown, Mountain, Utensils, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TripDay } from "@/types";

export default function TripItinerary({ days }: { days: TripDay[] }) {
  const [open, setOpen] = useState<number | null>(days[0]?.id ?? null);

  return (
    <div className="space-y-2.5">
      {days.map((day) => {
        const isOpen = open === day.id;
        return (
          <div key={day.id} className={cn("overflow-hidden rounded-2xl border bg-white transition", isOpen ? "border-brand-200 shadow-soft" : "border-line")}>
            <button
              onClick={() => setOpen(isOpen ? null : day.id)}
              className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
              aria-expanded={isOpen}
            >
              <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold", isOpen ? "bg-forest text-white" : "bg-brand-50 text-forest")}>
                {day.day_number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-semibold text-ink">{day.title}</span>
                <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted">
                  {day.altitude && <span className="inline-flex items-center gap-1"><Mountain className="h-3 w-3 text-brand-500" /> {day.altitude}</span>}
                  {day.accommodation && <span className="inline-flex items-center gap-1"><BedDouble className="h-3 w-3 text-brand-500" /> {day.accommodation}</span>}
                  {day.meals && <span className="inline-flex items-center gap-1"><Utensils className="h-3 w-3 text-brand-500" /> {day.meals}</span>}
                </span>
              </span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted transition", isOpen && "rotate-180 text-forest")} />
            </button>
            {isOpen && day.description && (
              <p className="border-t border-line/70 px-4 py-3.5 pl-[66px] text-[12.5px] leading-relaxed text-body/80">{day.description}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
