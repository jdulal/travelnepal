"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DestinationCard from "./DestinationCard";
import type { Destination } from "@/types";

export default function DestinationRow({ destinations }: { destinations: Destination[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button onClick={() => scroll(-1)} aria-label="Scroll left" className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-forest transition hover:border-forest">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => scroll(1)} aria-label="Scroll right" className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-forest transition hover:border-forest">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div ref={ref} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {destinations.map((d) => (
          <div key={d.id} className="w-[240px] shrink-0 snap-start sm:w-[270px]">
            <DestinationCard destination={d} tall />
          </div>
        ))}
      </div>
    </div>
  );
}
