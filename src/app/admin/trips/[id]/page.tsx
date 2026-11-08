import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Plus, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations, getAdminTrip } from "@/lib/admin";
import { deleteTripAction } from "@/app/actions/admin";
import TripForm from "@/components/admin/TripForm";
import ItineraryEditor from "@/components/admin/ItineraryEditor";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { Banner, StatusPill } from "@/components/admin/AdminUI";
import { npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Edit trip", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const { saved, created } = await searchParams;
  const [data, destinations] = await Promise.all([getAdminTrip(Number(id)), getAdminDestinations()]);
  if (!data) notFound();
  const { trip, days, departures } = data;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400">Trip #{trip.id}</p>
          <h2 className="mt-1 flex items-center gap-2 text-[22px] font-bold tracking-tight text-slate-900">
            {trip.title} <StatusPill status={trip.status} />
          </h2>
        </div>
        <Link href={`/admin/departures?trip=${trip.id}`} className="admin-btn-ghost text-[12px]">
          <CalendarDays className="h-3.5 w-3.5" /> Manage departures
        </Link>
      </div>

      {saved && <Banner kind="success">Trip saved successfully.</Banner>}
      {created && <Banner kind="success">Trip created. Add your itinerary and departures below.</Banner>}

      <TripForm trip={trip} destinations={destinations} />

      <ItineraryEditor tripId={trip.id} days={days} />

      <div className="admin-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div>
            <h3 className="text-[13px] font-bold text-slate-900">Departures</h3>
            <p className="text-[11px] text-slate-400">{departures.length} scheduled · seats update automatically with bookings</p>
          </div>
          <Link href={`/admin/departures?trip=${trip.id}`} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[11.5px] font-semibold text-slate-600 hover:bg-slate-50">
            <Plus className="h-3.5 w-3.5" /> Add
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead className="bg-slate-50/60 text-left">
              <tr>
                <th className="px-5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Start</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">End</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Seats</th>
                <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Price</th>
                <th className="px-5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departures.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-6 text-center text-[12px] text-slate-400">No departures scheduled yet.</td></tr>
              )}
              {departures.map((d) => (
                <tr key={d.id} className="text-[12px] text-slate-600">
                  <td className="px-5 py-2.5 font-semibold">{shortDate(d.start_date)}</td>
                  <td className="px-3 py-2.5">{shortDate(d.end_date)}</td>
                  <td className="px-3 py-2.5">{d.seats_booked}/{d.seats_total}</td>
                  <td className="px-3 py-2.5">{npr(d.price ?? trip.price)}</td>
                  <td className="px-5 py-2.5"><StatusPill status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="admin-card flex flex-wrap items-center justify-between gap-3 border-rose-100 p-4">
        <div>
          <p className="text-[12.5px] font-bold text-rose-600">Delete this trip</p>
          <p className="text-[11px] text-slate-400">Trips with bookings cannot be deleted — unpublish them instead.</p>
        </div>
        <form action={deleteTripAction}>
          <input type="hidden" name="id" value={trip.id} />
          <ConfirmSubmit
            message={`Delete "${trip.title}"? This removes the itinerary and departures permanently.`}
            className="border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete trip
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
