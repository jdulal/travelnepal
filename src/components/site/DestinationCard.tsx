import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import SmartImage from "./SmartImage";
import type { Destination } from "@/types";

export default function DestinationCard({ destination, tall = false }: { destination: Destination; tall?: boolean }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={`group relative block overflow-hidden rounded-3xl ${tall ? "aspect-[3/4]" : "aspect-[4/3]"}`}
    >
      <SmartImage
        src={destination.thumbnail || destination.hero_image}
        alt={destination.name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="transition duration-700 group-hover:scale-105"
      />
      <span className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 via-forest-deep/10 to-transparent" />
      <span className="absolute inset-x-0 bottom-0 p-4 text-white">
        <span className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-brand-200">
          <MapPin className="h-3 w-3" /> {destination.region}
        </span>
        <span className="flex items-end justify-between gap-2">
          <span>
            <span className="block text-[18px] font-semibold leading-tight">{destination.name}</span>
            <span className="mt-0.5 block text-[11px] text-white/70">{destination.tagline}</span>
          </span>
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition group-hover:bg-brand-500">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </span>
      </span>
    </Link>
  );
}
