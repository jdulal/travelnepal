import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations } from "@/lib/admin";
import TripForm from "@/components/admin/TripForm";

export const metadata: Metadata = { title: "New trip", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewTripPage() {
  await requireAdmin();
  const destinations = await getAdminDestinations();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Create a trip</h2>
        <p className="mt-1 text-[12.5px] text-slate-500">Start with the essentials. You can add the day-by-day itinerary and departures after saving.</p>
      </div>
      <TripForm destinations={destinations} />
    </div>
  );
}
