"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Heart, LayoutDashboard, LogOut, Settings, ShoppingBag, Sparkles, UserRound } from "lucide-react";
import { signOutAction } from "@/app/actions/auth";
import { cn, initials } from "@/lib/utils";

type User = { name: string; email: string; role: "user" | "admin" } | null;

export default function AccountMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-1">
        <Link href="/sign-in" className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 hover:text-forest" aria-label="Sign in">
          <UserRound className="h-[19px] w-[19px]" />
        </Link>
        <Link href="/sign-up" className="btn-dark btn-sm hidden xl:inline-flex">Sign up</Link>
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2 transition hover:bg-brand-50"
        aria-expanded={open}
        aria-label="Account menu"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">
          {initials(user.name)}
        </span>
        <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-float">
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
            <p className="truncate text-xs text-muted">{user.email}</p>
            {user.role === "admin" && (
              <span className="mt-1.5 inline-flex rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest">Administrator</span>
            )}
          </div>
          <div className="py-1">
            {user.role === "admin" && (
              <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-body hover:bg-mist">
                <Sparkles className="h-4 w-4 text-brand-500" /> Admin console
              </Link>
            )}
            <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-body hover:bg-mist">
              <LayoutDashboard className="h-4 w-4 text-brand-500" /> Dashboard
            </Link>
            <Link href="/dashboard/bookings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-body hover:bg-mist">
              <ShoppingBag className="h-4 w-4 text-brand-500" /> My bookings
            </Link>
            <Link href="/dashboard/saved" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-body hover:bg-mist">
              <Heart className="h-4 w-4 text-brand-500" /> Saved trips
            </Link>
            <Link href="/dashboard/settings" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-body hover:bg-mist">
              <Settings className="h-4 w-4 text-brand-500" /> Account settings
            </Link>
          </div>
          <form action={signOutAction} className="border-t border-line pt-1">
            <button className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
