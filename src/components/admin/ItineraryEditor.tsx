"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CheckCircle2, GripVertical, Plus, Trash2 } from "lucide-react";
import { saveTripDaysAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { TripDay } from "@/types";

type Row = {
  key: string;
  title: string;
  description: string;
  accommodation: string;
  meals: string;
  altitude: string;
};

let seq = 0;
const nextKey = () => `day-${++seq}`;

export default function ItineraryEditor({ tripId, days }: { tripId: number; days: TripDay[] }) {
  const [state, action] = useActionState<AdminState, FormData>(saveTripDaysAction, {});
  const [rows, setRows] = useState<Row[]>(() =>
    days.map((d) => ({
      key: nextKey(),
      title: d.title,
      description: d.description ?? "",
      accommodation: d.accommodation ?? "",
      meals: d.meals ?? "",
      altitude: d.altitude ?? "",
    }))
  );

  const update = (index: number, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const move = (index: number, direction: -1 | 1) => {
    setRows((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <form action={action} className="admin-card p-5">
      <input type="hidden" name="trip_id" value={tripId} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[13px] font-bold text-slate-900">Day-by-day itinerary</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Shown as an accordion on the public trip page. Days are numbered in the order below.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            setRows((prev) => [...prev, { key: nextKey(), title: "", description: "", accommodation: "", meals: "", altitude: "" }])
          }
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11.5px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Plus className="h-3.5 w-3.5" /> Add day
        </button>
      </div>

      {state.error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {rows.length === 0 && (
          <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-[12px] text-slate-400">
            No days yet. Add the first day of this journey.
          </p>
        )}
        {rows.map((row, i) => (
          <div key={row.key} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5">
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-slate-300" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-brand-600">Day {i + 1}</span>
              <div className="ml-auto flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-white disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 hover:bg-white disabled:opacity-30">↓</button>
                <button type="button" onClick={() => setRows((prev) => prev.filter((_, idx) => idx !== i))} className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600" aria-label={`Remove day ${i + 1}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
              <input
                name="day_title"
                value={row.title}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder="Day title — e.g. Fly to Lukla and trek to Phakding"
                className="admin-input sm:col-span-2"
              />
              <textarea
                name="day_description"
                value={row.description}
                onChange={(e) => update(i, { description: e.target.value })}
                rows={2}
                placeholder="What happens today"
                className="admin-input resize-none sm:col-span-2"
              />
              <input name="day_accommodation" value={row.accommodation} onChange={(e) => update(i, { accommodation: e.target.value })} placeholder="Accommodation — teahouse" className="admin-input" />
              <input name="day_meals" value={row.meals} onChange={(e) => update(i, { meals: e.target.value })} placeholder="Meals — B, L, D" className="admin-input" />
              <input name="day_altitude" value={row.altitude} onChange={(e) => update(i, { altitude: e.target.value })} placeholder="Altitude — 2,610 m" className="admin-input" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[10.5px] text-slate-400">{rows.length} day{rows.length === 1 ? "" : "s"} · empty titles are skipped</p>
        <SubmitButton>Save itinerary</SubmitButton>
      </div>
    </form>
  );
}
