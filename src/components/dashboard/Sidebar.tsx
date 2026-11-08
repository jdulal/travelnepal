"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, LayoutDashboard, Luggage, MessagesSquare, Settings, Sparkles, Wallet, Wand2 } from "lucide-react";
import Logo from "@/components/site/Logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "My bookings", icon: Luggage },
  { href: "/dashboard/saved", label: "Saved trips", icon: Heart },
  { href: "/dashboard/plans", label: "AI plans", icon: Sparkles },
  { href: "/dashboard/planner", label: "New plan", icon: Wand2 },
  { href: "/dashboard/conversations", label: "Assistant chats", icon: MessagesSquare },
  { href: "/dashboard/expenses", label: "Expenses & scans", icon: Wallet },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell, badge: true },
  { href: "/dashboard/settings", label: "Account settings", icon: Settings },
];

export default function Sidebar({ unread = 0 }: { unread?: number }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 lg:block">
      <div className="sticky top-6">
        <div className="px-2"><Logo /></div>
        <nav className="mt-6 space-y-0.5">
          {items.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
                  active ? "bg-white text-forest shadow-soft ring-1 ring-line" : "text-body/70 hover:bg-white/70 hover:text-forest"
                )}
              >
                <item.icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-muted")} />
                <span className="flex-1">{item.label}</span>
                {item.badge && unread > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-brand-500 px-1.5 text-[9.5px] font-bold text-white">{unread}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 rounded-2xl bg-forest p-4 text-white">
          <Sparkles className="h-4 w-4 text-brand-200" />
          <p className="mt-2 text-[12.5px] font-semibold">Plan your next trip</p>
          <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">Build a day-by-day itinerary in seconds, then book a guide.</p>
          <Link href="/dashboard/planner" className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-forest hover:bg-brand-50">Open planner</Link>
        </div>
      </div>
    </aside>
  );
}
