import Link from "next/link";
import { Clock, MapPin, Star, ArrowUpRight } from "lucide-react";
import SmartImage from "./SmartImage";
import SaveButton from "./SaveButton";
import { categoryLabel, npr, priceOf } from "@/lib/utils";
import type { Trip } from "@/types";

export default function TripCard({ trip, saved = false, compact = false }: { trip: Trip; saved?: boolean; compact?: boolean }) {
  const price = priceOf(trip);
  const sale = trip.sale_price ? Number(trip.sale_price) : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className={`relative ${compact ? "aspect-[5/4]" : "aspect-[4/3]"} overflow-hidden`}>
        <Link href={`/tours/${trip.slug}`} className="absolute inset-0" aria-label={trip.title}>
          <SmartImage src={trip.hero_image} alt={trip.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 bg-gradient-to-t from-forest-deep/75 via-forest-deep/5 to-transparent" />
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="pointer-events-auto inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-forest backdrop-blur">
            {categoryLabel(trip.category)}
          </span>
          <SaveButton tripId={trip.id} initialSaved={saved} />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-3.5 text-white">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-medium backdrop-blur-md">
            <Clock className="h-3 w-3" /> {trip.duration_days} days
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium">
            <MapPin className="h-3 w-3 text-brand-300" /> {trip.destination_name || "Nepal"}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-1 text-[11px] font-semibold text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {Number(trip.rating).toFixed(1)}
          <span className="font-normal text-muted">({trip.review_count} reviews)</span>
        </div>
        <h3 className="text-[18px] font-semibold leading-snug text-ink">
          <Link href={`/tours/${trip.slug}`} className="hover:text-forest">{trip.title}</Link>
        </h3>
        {!compact && <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{trip.summary}</p>}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3.5">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-muted">From</p>
            <p className="flex items-baseline gap-1.5 text-[16px] font-bold text-forest">
              {npr(price)}
              {sale && <span className="text-[11px] font-normal text-muted line-through">{npr(trip.price)}</span>}
            </p>
          </div>
          <Link href={`/tours/${trip.slug}`} className="grid h-9 w-9 place-items-center rounded-full border border-line text-forest transition group-hover:border-forest group-hover:bg-forest group-hover:text-white" aria-label={`View ${trip.title}`}>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
