"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarCheck,
  CalendarDays,
  Compass,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  Map,
  Menu,
  MessagesSquare,
  Mountain,
  Newspaper,
  Settings,
  ShieldCheck,
  Star,
  Ticket,
  Users,
  X,
} from "lucide-react";
import Logo from "@/components/site/Logo";
import { signOutAction } from "@/app/actions/auth";
import { cn, initials } from "@/lib/utils";

type AdminUser = { name: string; email: string } | null;

const groups = [
  {
    label: "Operations",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/trips", label: "Trips", icon: Mountain },
      { href: "/admin/departures", label: "Departures", icon: CalendarDays },
      { href: "/admin/destinations", label: "Destinations", icon: Map },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/users", label: "Customers", icon: Users },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/community", label: "Community", icon: MessagesSquare },
      { href: "/admin/inquiries", label: "Inquiries", icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", icon: Newspaper },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/stories", label: "Stories", icon: FileText },
      { href: "/admin/coupons", label: "Coupons", icon: Ticket },
      { href: "/admin/content", label: "FAQs & testimonials", icon: Compass },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/activity", label: "Activity log", icon: Activity },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const titles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/bookings": "Bookings",
  "/admin/trips": "Trips",
  "/admin/departures": "Departures",
  "/admin/destinations": "Destinations",
  "/admin/users": "Customers",
  "/admin/reviews": "Reviews",
  "/admin/community": "Community",
  "/admin/inquiries": "Inquiries",
  "/admin/newsletter": "Newsletter",
  "/admin/stories": "Stories",
  "/admin/coupons": "Coupons",
  "/admin/content": "FAQs & testimonials",
  "/admin/activity": "Activity log",
  "/admin/settings": "Settings",
};

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  const activeLabel =
    Object.entries(titles)
      .filter(([href]) => isActive(pathname, href))
      .sort((a, b) => b[0].length - a[0].length)[0]?.[1] ?? "Admin";

  const nav = (
    <nav className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
          <div className="mt-1.5 space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                    active
                      ? "bg-brand-50 text-forest ring-1 ring-brand-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-forest"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", active ? "text-brand-600" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-admin">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
          <Logo />
          <span className="rounded-md bg-forest px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Admin</span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-5">{nav}</div>
        <div className="border-t border-slate-100 p-3">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            <Compass className="h-3.5 w-3.5" /> View public site
          </Link>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" aria-label="Close menu" className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
              <div className="flex items-center gap-2">
                <Logo />
                <span className="rounded-md bg-forest px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Admin</span>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-5">{nav}</div>
            <div className="border-t border-slate-100 p-3">
              <Link href="/" className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">
                <Compass className="h-3.5 w-3.5" /> View public site
              </Link>
            </div>
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-600 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Nepal Travel admin</p>
            <h1 className="truncate text-[15px] font-bold text-slate-900">{activeLabel}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[11px] font-semibold text-forest ring-1 ring-brand-200 sm:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Administrator
            </span>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 py-1 pl-1 pr-1 sm:pr-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[9.5px] font-bold text-white">
                {initials(user?.name ?? "Admin")}
              </span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-semibold leading-tight text-slate-900">{user?.name ?? "Administrator"}</span>
                <span className="block text-[9px] text-slate-400">{user?.email ?? "admin"}</span>
              </span>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:border-red-200 hover:text-red-600"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
