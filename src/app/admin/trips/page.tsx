import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Pencil, Plus, Star } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminTrips } from "@/lib/admin";
import { toggleTripStatusAction } from "@/app/actions/admin";
import { Banner, PageHeader, StatusPill, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import SmartImage from "@/components/site/SmartImage";
import { categoryLabel, difficultyLabel, npr } from "@/lib/utils";

export const metadata: Metadata = { title: "Trips", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminTripsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdmin();
  const { error } = await searchParams;
  const trips = await getAdminTrips();

  return (
    <div>
      <PageHeader
        title="Trips"
        description="Your full catalogue of treks, tours and adventures. Publish, feature and edit itineraries, pricing and permits."
        action={{ href: "/admin/trips/new", label: "Add trip", icon: Plus }}
      />

      {error === "has-bookings" && (
        <Banner kind="error">This trip cannot be deleted because travellers have booked it. Unpublish it instead.</Banner>
      )}

      <TableWrap>
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <Th>Trip</Th>
            <Th>Category</Th>
            <Th>Destination</Th>
            <Th>Days</Th>
            <Th>Difficulty</Th>
            <Th>Price</Th>
            <Th>Bookings</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {trips.length === 0 && (
            <tr><Td colSpan={9} className="py-12 text-center text-slate-400">No trips yet. Create your first trip.</Td></tr>
          )}
          {trips.map((t) => (
            <tr key={t.id} className="transition hover:bg-slate-50/70">
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <SmartImage src={t.hero_image} alt={t.title} fill sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/trips/${t.id}`} className="flex items-center gap-1.5 font-semibold text-slate-800 hover:text-forest">
                      <span className="max-w-[220px] truncate">{t.title}</span>
                      {Boolean(t.featured) && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                    </Link>
                    <span className="block text-[10.5px] text-slate-400">/{t.slug} · {t.rating} ({t.review_count})</span>
                  </div>
                </div>
              </Td>
              <Td className="capitalize">{categoryLabel(t.category)}</Td>
              <Td>{t.destination_name ?? "—"}</Td>
              <Td>{t.duration_days}d <span className="text-[10px] text-slate-400">({t.day_count} listed)</span></Td>
              <Td><StatusPill status={t.difficulty} /></Td>
              <Td>
                <span className="font-semibold text-slate-700">{npr(t.sale_price ?? t.price)}</span>
                {t.sale_price && <span className="ml-1 block text-[10px] text-slate-400 line-through">{npr(t.price)}</span>}
              </Td>
              <Td>{t.booking_count}</Td>
              <Td><StatusPill status={t.status} /></Td>
              <Td>
                <div className="flex items-center justify-end gap-1.5">
                  <Link href={`/tours/${t.slug}`} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-forest" aria-label="View trip">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/admin/trips/${t.id}`} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-forest" aria-label="Edit trip">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <form action={toggleTripStatusAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="status" value={t.status} />
                    <button
                      type="submit"
                      className="rounded-lg border border-slate-200 px-2 py-1 text-[10.5px] font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      {t.status === "published" ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
