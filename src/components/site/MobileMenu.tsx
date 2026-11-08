"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, Mail, CalendarRange, LayoutDashboard } from "lucide-react";
import NavLinks from "./NavLinks";
import Logo from "./Logo";
import type { SessionUser } from "@/types";

export default function MobileMenu({ user, phone, email }: { user: SessionUser | null; phone: string; email: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-forest-deep/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white p-5 shadow-float">
            <div className="flex items-center justify-between">
              <Logo />
              <button onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-full bg-mist" aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1 border-b border-line pb-6">
              <NavLinks onNavigate={() => setOpen(false)} />
            </nav>

            <div className="mt-6 space-y-2">
              <Link href="/itinerary" onClick={() => setOpen(false)} className="btn-primary w-full">
                <CalendarRange className="h-4 w-4" /> Build my itinerary
              </Link>
              {user ? (
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"} onClick={() => setOpen(false)} className="btn-outline w-full">
                  <LayoutDashboard className="h-4 w-4" /> {user.role === "admin" ? "Admin console" : "My dashboard"}
                </Link>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/sign-in" onClick={() => setOpen(false)} className="btn-outline">Sign in</Link>
                  <Link href="/sign-up" onClick={() => setOpen(false)} className="btn-dark">Sign up</Link>
                </div>
              )}
            </div>

            <div className="mt-auto space-y-3 rounded-2xl bg-mist p-4 text-sm text-body">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Talk to a local expert</p>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-2.5 hover:text-forest"><Phone className="h-4 w-4 text-brand-500" /> {phone}</a>
              <a href={`mailto:${email}`} className="flex items-center gap-2.5 hover:text-forest"><Mail className="h-4 w-4 text-brand-500" /> {email}</a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
