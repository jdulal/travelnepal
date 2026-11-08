import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import TripCard from "@/components/site/TripCard";
import { requireUser } from "@/lib/guards";
import { getSavedTrips } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Saved trips" };

export default async function SavedPage() {
  const session = await requireUser("/dashboard/saved");
  const trips = await getSavedTrips(session.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your shortlist</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Saved trips</h1>
          <p className="mt-1 text-[12.5px] text-muted">Tap the heart on any card to remove it from this list.</p>
        </div>
        <span className="rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted">{trips.length} saved</span>
      </div>

      {trips.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <Heart className="mx-auto h-9 w-9 text-brand-400" />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">Nothing saved yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">Save treks and tours you like and they&apos;ll stay here for when you&apos;re ready.</p>
          <Link href="/tours" className="btn-primary btn-sm mt-4">Explore trips</Link>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {trips.map((t) => <TripCard key={t.id} trip={t} saved />)}
        </div>
      )}
    </div>
  );
}
