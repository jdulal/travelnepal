import type { Metadata } from "next";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminDepartures, getAllTripsForSelect } from "@/lib/admin";
import { deleteDepartureAction } from "@/app/actions/admin";
import { BulkImportForm, DepartureForm } from "@/components/admin/DepartureForms";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { EmptyState, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import { npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Departures", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminDeparturesPage({ searchParams }: { searchParams: Promise<{ trip?: string }> }) {
  await requireAdmin();
  const { trip } = await searchParams;
  const tripFilter = Number(trip) || 0;
  const [all, trips] = await Promise.all([getAdminDepartures(), getAllTripsForSelect()]);
  const departures = tripFilter ? all.filter((d) => d.trip_id === tripFilter) : all;
  const selected = trips.find((t) => t.id === tripFilter);

  return (
    <div>
      <PageHeader
        title="Departures"
        description="Fixed-date groups with live seat availability. Bookings automatically update seats and full status."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/admin/departures" className={`rounded-full px-3 py-1.5 text-[11.5px] font-semibold ring-1 ${tripFilter ? "bg-white text-slate-600 ring-slate-200" : "bg-forest text-white ring-forest"}`}>
          All trips
        </Link>
        <form action="/admin/departures" className="flex items-center gap-2">
          <select name="trip" defaultValue={tripFilter || ""} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-600">
            <option value="">Filter by trip…</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
          <button type="submit" className="admin-btn-ghost py-2 text-[12px]">Apply</button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2.5 lg:col-span-2">
          {departures.length === 0 && (
            <EmptyState title="No departures scheduled" description={selected ? `Add the first departure for ${selected.title}.` : "Schedule fixed-date groups so travellers can book a specific start date."} />
          )}
          {departures.map((d) => {
            const left = Math.max(d.seats_total - d.seats_booked, 0);
            const pct = Math.min((d.seats_booked / Math.max(d.seats_total, 1)) * 100, 100);
            return (
              <div key={d.id} className="admin-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/trips/${d.trip_id}`} className="block max-w-[360px] truncate text-[13px] font-bold text-slate-800 hover:text-forest">
                      {d.trip_title}
                    </Link>
                    <p className="mt-1 text-[11.5px] text-slate-500">
                      {shortDate(d.start_date)} → {shortDate(d.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={d.status} />
                    <span className="text-[12px] font-semibold text-slate-700">{npr(d.price ?? 0)}</span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(pct, 2)}%` }} />
                  </div>
                  <span className="text-[10.5px] text-slate-400">
                    {d.seats_booked}/{d.seats_total} booked · {left} left · {d.booking_count} bookings
                  </span>
                </div>

                <details className="mt-2">
                  <summary className="cursor-pointer text-[11px] font-semibold text-brand-600 hover:text-forest">Edit departure</summary>
                  <DepartureForm
                    trips={trips}
                    departure={{
                      id: d.id,
                      trip_id: d.trip_id,
                      trip_title: d.trip_title,
                      start_date: d.start_date,
                      end_date: d.end_date,
                      seats_total: d.seats_total,
                      price: d.price,
                      status: d.status,
                    }}
                  />
                  <form action={deleteDepartureAction} className="mt-2 flex justify-end">
                    <input type="hidden" name="id" value={d.id} />
                    <ConfirmSubmit
                      message="Delete this departure? Existing bookings will lose their departure date."
                      className="border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete departure
                    </ConfirmSubmit>
                  </form>
                </details>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          <DepartureForm trips={trips} defaultTripId={tripFilter || undefined} />
          <BulkImportForm trips={trips} defaultTripId={tripFilter || undefined} />
        </div>
      </div>
    </div>
  );
}
