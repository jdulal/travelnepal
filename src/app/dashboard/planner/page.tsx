import type { Metadata } from "next";
import ItineraryPlanner from "@/components/site/ItineraryPlanner";
import { requireUser } from "@/lib/guards";
import { getDestinations } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Itinerary planner" };

export default async function DashboardPlannerPage() {
  await requireUser("/dashboard/planner");
  const destinations = await getDestinations();

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">AI itinerary builder</p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Plan a new trip</h1>
        <p className="mt-1 max-w-xl text-[12.5px] text-muted">Set your destination, days, group and budget style. Plans are saved automatically and get a private link you can share.</p>
      </div>
      <ItineraryPlanner destinations={destinations.map((d) => ({ name: d.name }))} loggedIn />
    </div>
  );
}
