"use client";

import { useActionState } from "react";
import { AlertCircle, CalendarPlus, CheckCircle2 } from "lucide-react";
import { saveDepartureAction, bulkImportDeparturesAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";

type TripOption = { id: number; title: string };

export type DepartureValues = {
  id: number;
  trip_id: number;
  trip_title: string;
  start_date: string;
  end_date: string;
  seats_total: number;
  price: string | null;
  status: string;
};

export function DepartureForm({ trips, defaultTripId, departure }: { trips: TripOption[]; defaultTripId?: number; departure?: DepartureValues }) {
  const [state, action] = useActionState<AdminState, FormData>(saveDepartureAction, {});
  const editing = Boolean(departure);

  return (
    <form action={action} className={editing ? "mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3" : "admin-card p-5"}>
      {departure && <input type="hidden" name="id" value={departure.id} />}
      {!editing && (
        <>
          <h3 className="text-[13px] font-bold text-slate-900">Schedule a departure</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Fixed-date groups travellers can book directly.</p>
        </>
      )}

      {state.error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        {departure ? (
          <div className="sm:col-span-2">
            <p className="text-[11px] font-semibold text-slate-500">{departure.trip_title}</p>
            <input type="hidden" name="trip_id" value={departure.trip_id} />
          </div>
        ) : (
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="trip_id">Trip</label>
            <select id="trip_id" name="trip_id" required defaultValue={defaultTripId ?? ""} className="admin-input">
              <option value="">Choose a trip…</option>
              {trips.map((t) => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="admin-label" htmlFor="start_date">Start date</label>
          <input id="start_date" name="start_date" type="date" required defaultValue={departure?.start_date ?? ""} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="end_date">End date</label>
          <input id="end_date" name="end_date" type="date" required defaultValue={departure?.end_date ?? ""} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="seats_total">Seats</label>
          <input id="seats_total" name="seats_total" type="number" min={1} max={50} defaultValue={departure?.seats_total ?? 12} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="price">Override price (optional)</label>
          <input id="price" name="price" type="number" min={0} step="0.01" defaultValue={departure?.price ?? ""} placeholder="Uses trip price" className="admin-input" />
        </div>
        {editing && (
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={departure?.status ?? "open"} className="admin-input">
              <option value="open">Open</option>
              <option value="full">Full</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <SubmitButton className={editing ? "w-full" : "w-full"}>
            <CalendarPlus className="h-3.5 w-3.5" /> {editing ? "Save departure" : "Add departure"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}

export function BulkImportForm({ trips, defaultTripId }: { trips: TripOption[]; defaultTripId?: number }) {
  const [state, action] = useActionState<AdminState, FormData>(bulkImportDeparturesAction, {});

  return (
    <details className="admin-card p-5">
      <summary className="cursor-pointer text-[13px] font-bold text-slate-900">Bulk import departures</summary>
      <p className="mt-1 text-[11px] text-slate-400">One row per departure: <code className="rounded bg-slate-100 px-1">start-date,end-date,seats,price</code></p>
      <form action={action} className="mt-3 space-y-2.5">
        {state.error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">{state.error}</p>}
        {state.ok && <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">{state.message}</p>}
        <select name="trip_id" required defaultValue={defaultTripId ?? ""} className="admin-input">
          <option value="">Choose a trip…</option>
          {trips.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
        <textarea
          name="rows"
          rows={5}
          required
          placeholder={"2026-12-05,2026-12-18,12,185000\n2026-12-19,2027-01-01,12,185000"}
          className="admin-input resize-y font-mono text-[11px]"
        />
        <SubmitButton className="w-full">Import rows</SubmitButton>
      </form>
    </details>
  );
}
