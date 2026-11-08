"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/trekking", label: "Trekking" },
  { href: "/itinerary", label: "Itinerary" },
  { href: "/stories", label: "Stories" },
  { href: "/community", label: "Community" },
];

export default function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <>
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              "relative rounded-full px-3 py-2 text-[14px] font-medium transition lg:px-3.5",
              active ? "text-forest" : "text-body/80 hover:text-forest"
            )}
          >
            {l.label}
            {active && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand-500" />}
          </Link>
        );
      })}
    </>
  );
}
