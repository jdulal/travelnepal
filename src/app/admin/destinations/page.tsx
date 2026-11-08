import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Pencil, Plus, Star } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations } from "@/lib/admin";
import { Banner, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import SmartImage from "@/components/site/SmartImage";

export const metadata: Metadata = { title: "Destinations", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminDestinationsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const destinations = await getAdminDestinations();

  return (
    <div>
      <PageHeader
        title="Destinations"
        description="The regions travellers can explore. Destinations power the homepage, filters and destination landing pages."
        action={{ href: "/admin/destinations/new", label: "Add destination", icon: Plus }}
      />

      {saved && <Banner kind="success">Destination saved.</Banner>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.length === 0 && (
          <p className="admin-card col-span-full py-12 text-center text-[12px] text-slate-400">No destinations yet.</p>
        )}
        {destinations.map((d) => (
          <div key={d.id} className="admin-card overflow-hidden">
            <div className="relative h-28 w-full bg-slate-100">
              <SmartImage src={d.thumbnail ?? d.hero_image} alt={d.name} fill sizes="(max-width:768px) 100vw, 33vw" />
              <div className="absolute left-2 top-2 flex gap-1.5">
                <StatusPill status={d.status} />
                {Boolean(d.featured) && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-600 ring-1 ring-amber-200">
                    <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" /> Featured
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-slate-800">{d.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                    <MapPin className="h-3 w-3" /> {d.region}
                  </p>
                </div>
                <Link href={`/admin/destinations/${d.id}`} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-forest" aria-label={`Edit ${d.name}`}>
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </div>
              <p className="mt-2 line-clamp-2 min-h-[32px] text-[11.5px] leading-relaxed text-slate-500">{d.summary ?? d.tagline ?? "No description yet."}</p>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
                <span>{d.trip_count} trips</span>
                <Link href={`/destinations/${d.slug}`} className="font-semibold text-brand-600 hover:text-forest">View page →</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
