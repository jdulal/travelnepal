"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, CalendarRange, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/tours", label: "Tours", icon: Map },
  { href: "/itinerary", label: "Plan", icon: CalendarRange, center: true },
  { href: "/community", label: "Community", icon: Users },
];

export default function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      <div className="mx-auto flex max-w-md items-end justify-between px-3 py-2">
        {items.slice(0, 2).map((item) => (
          <Item key={item.href} {...item} active={item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)} />
        ))}

        <Link href="/itinerary" className="-mt-7 grid h-14 w-14 place-items-center rounded-full bg-brand-500 text-white shadow-[0_10px_24px_-8px_rgba(99,171,69,.9)] ring-4 ring-white" aria-label="Plan a trip">
          <CalendarRange className="h-6 w-6" />
        </Link>

        {items.slice(2, 4).map((item) => (
          <Item key={item.href} {...item} active={pathname.startsWith(item.href)} />
        ))}

        <button
          onClick={() => window.dispatchEvent(new CustomEvent("nt:open-ai"))}
          className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium text-forest"
          aria-label="Open AI assistant"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-50 text-brand-600">
            <Sparkles className="h-4 w-4" />
          </span>
          AI
        </button>
      </div>
    </nav>
  );
}

function Item({ href, label, icon: Icon, active }: { href: string; label: string; icon: typeof Home; active: boolean }) {
  return (
    <Link
      href={href}
      className={cn("flex min-w-[52px] flex-col items-center gap-0.5 rounded-xl px-2 py-1 text-[10px] font-medium", active ? "text-forest" : "text-muted")}
    >
      <Icon className={cn("h-5 w-5", active && "text-brand-600")} strokeWidth={active ? 2.4 : 1.8} />
      {label}
    </Link>
  );
}
