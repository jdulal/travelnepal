"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Heart, LayoutDashboard, Luggage, MessagesSquare, Settings, Sparkles, Wallet, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: Luggage },
  { href: "/dashboard/saved", label: "Saved", icon: Heart },
  { href: "/dashboard/plans", label: "Plans", icon: Sparkles },
  { href: "/dashboard/planner", label: "Planner", icon: Wand2 },
  { href: "/dashboard/conversations", label: "Chats", icon: MessagesSquare },
  { href: "/dashboard/expenses", label: "Expenses", icon: Wallet },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function MobileDashNav() {
  const pathname = usePathname();
  return (
    <div className="-mx-4 mb-5 overflow-x-auto px-4 lg:hidden">
      <div className="flex gap-1.5">
        {items.map((item) => {
          const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11.5px] font-semibold",
                active ? "border-forest bg-forest text-white" : "border-line bg-white text-body/70"
              )}
            >
              <item.icon className="h-3.5 w-3.5" /> {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
