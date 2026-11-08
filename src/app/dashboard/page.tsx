import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCheck,
  Compass,
  Heart,
  Luggage,
  MapPin,
  Plus,
  Sparkles,
  Wallet,
  Wand2,
} from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import { requireUser } from "@/lib/guards";
import { getExpenses, getNotifications, getPlans, getSavedTrips, getUserBookings } from "@/lib/queries";
import { markNotificationsReadAction } from "@/app/actions/dashboard";
import { npr, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview" };

const statusTone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-brand-50 text-forest",
  completed: "bg-sky-50 text-sky-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function DashboardPage() {
  const session = await requireUser();
  const [bookings, saved, plans, notifications, expenses] = await Promise.all([
    getUserBookings(session.id),
    getSavedTrips(session.id),
    getPlans(session.id),
    getNotifications(session.id),
    getExpenses(session.id),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = bookings
    .filter((b) => b.start_date && new Date(b.start_date) >= today && b.status !== "cancelled")
    .sort((a, b) => String(a.start_date).localeCompare(String(b.start_date)));
  const nextTrip = upcoming[0];
  const spent = bookings.filter((b) => b.payment_status === "paid").reduce((sum, b) => sum + Number(b.total), 0);
  const expenseTotal = expenses.byCategory.reduce((sum, e) => sum + Number(e.total), 0);
  const unread = notifications.filter((n) => !n.read_at).length;

  const stats = [
    { label: "Upcoming trips", value: upcoming.length, icon: CalendarDays, href: "/dashboard/bookings" },
    { label: "Saved trips", value: saved.length, icon: Heart, href: "/dashboard/saved" },
    { label: "AI plans", value: plans.length, icon: Sparkles, href: "/dashboard/plans" },
    { label: "Trip spend", value: npr(spent), icon: Wallet, href: "/dashboard/bookings" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Namaste, {session.name.split(" ")[0]}</h1>
          <p className="mt-1 text-[12.5px] text-muted">Here&apos;s your travel at a glance — plans, bookings and what&apos;s next.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/planner" className="btn-outline btn-sm"><Wand2 className="h-4 w-4" /> New plan</Link>
          <Link href="/tours" className="btn-primary btn-sm"><Compass className="h-4 w-4" /> Browse trips</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:border-brand-200">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600"><s.icon className="h-4 w-4" /></span>
            <p className="mt-2.5 truncate text-[18px] font-bold text-ink">{s.value}</p>
            <p className="text-[10.5px] uppercase tracking-wide text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr] xl:items-start">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
              <h2 className="text-[14px] font-semibold text-ink">Next adventure</h2>
              <Link href="/dashboard/bookings" className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-brand-600 hover:text-forest">All bookings <ArrowRight className="h-3.5 w-3.5" /></Link>
            </div>
            {nextTrip ? (
              <div className="grid sm:grid-cols-[200px_1fr]">
                <div className="relative min-h-[160px]">
                  <SmartImage src={nextTrip.trip_image} alt={nextTrip.trip_title ?? "Trip"} fill sizes="200px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/60 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${statusTone[nextTrip.status]}`}>{nextTrip.status}</span>
                    <span className="font-mono text-[10px] text-muted">{nextTrip.reference}</span>
                  </div>
                  <h3 className="mt-2 text-[17px] font-semibold text-ink">{nextTrip.trip_title}</h3>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-muted">
                    <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-brand-500" /> {shortDate(nextTrip.start_date)}</span>
                    <span>{nextTrip.travelers} travellers</span>
                    <span className="font-semibold text-forest">{npr(Number(nextTrip.total))}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href={`/booking/${nextTrip.reference}`} className="btn-primary btn-sm">View booking</Link>
                    {nextTrip.payment_status === "unpaid" && <Link href={`/checkout/${nextTrip.reference}`} className="btn-outline btn-sm">Complete payment</Link>}
                    {nextTrip.trip_slug && <Link href={`/tours/${nextTrip.trip_slug}`} className="btn-ghost btn-sm">Trip details</Link>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-5 py-10 text-center">
                <Compass className="mx-auto h-8 w-8 text-brand-400" />
                <p className="mt-2 text-[14px] font-semibold text-ink">No upcoming trips yet</p>
                <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">Your next adventure is one click away — browse curated treks or sketch a plan with AI.</p>
                <div className="mt-4 flex justify-center gap-2">
                  <Link href="/tours" className="btn-primary btn-sm">Find a trip</Link>
                  <Link href="/dashboard/planner" className="btn-outline btn-sm">Plan with AI</Link>
                </div>
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
              <h2 className="text-[14px] font-semibold text-ink">Recent bookings</h2>
              <span className="text-[10.5px] text-muted">{bookings.length} total</span>
            </div>
            {bookings.length === 0 ? (
              <p className="px-5 py-8 text-center text-[12px] text-muted">No bookings yet.</p>
            ) : (
              <div className="divide-y divide-line">
                {bookings.slice(0, 4).map((b) => (
                  <Link key={b.id} href={`/booking/${b.reference}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-mist/50">
                    <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg"><SmartImage src={b.trip_image} alt={b.trip_title ?? ""} fill sizes="56px" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12.5px] font-semibold text-ink">{b.trip_title}</span>
                      <span className="block text-[10.5px] text-muted">{shortDate(b.start_date)} · {b.travelers} travellers · {b.reference}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase ${statusTone[b.status]}`}>{b.status}</span>
                    <span className="hidden shrink-0 text-[11.5px] font-semibold text-forest sm:block">{npr(Number(b.total))}</span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-3xl border border-line bg-white shadow-card">
            <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-ink"><Bell className="h-4 w-4 text-brand-500" /> Notifications {unread > 0 && <span className="rounded-full bg-brand-500 px-1.5 text-[9px] font-bold text-white">{unread}</span>}</h2>
              {unread > 0 && (
                <form action={markNotificationsReadAction}>
                  <button type="submit" className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-600 hover:text-forest"><CheckCheck className="h-3.5 w-3.5" /> Mark all read</button>
                </form>
              )}
            </div>
            <div className="divide-y divide-line">
              {notifications.length === 0 && <p className="px-5 py-8 text-center text-[12px] text-muted">Nothing new right now.</p>}
              {notifications.slice(0, 5).map((n) => (
                <Link key={n.id} href={n.link ?? "/dashboard"} className="block px-5 py-3 hover:bg-mist/50">
                  <p className="flex items-center gap-2 text-[12px] font-semibold text-ink">
                    {!n.read_at && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />} {n.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted">{n.message}</p>
                  <p className="mt-1 text-[9.5px] text-muted/80">{shortDate(n.created_at)}</p>
                </Link>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[14px] font-semibold text-ink">On-trip spending</h2>
              <Link href="/dashboard/expenses" className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-brand-600"><Plus className="h-3 w-3" /> Add</Link>
            </div>
            <p className="mt-2 text-[22px] font-bold text-forest">{npr(expenseTotal)}</p>
            <p className="text-[10.5px] text-muted">Logged across {expenses.items.length} expenses</p>
            <div className="mt-3 space-y-1.5">
              {expenses.byCategory.slice(0, 4).map((c) => (
                <div key={c.category} className="flex items-center justify-between gap-2 text-[11px]">
                  <span className="capitalize text-muted">{c.category}</span>
                  <span className="font-medium text-ink">{npr(Number(c.total))}</span>
                </div>
              ))}
              {expenses.byCategory.length === 0 && <p className="text-[11px] text-muted">No expenses logged yet. Add one or scan a receipt.</p>}
            </div>
            <Link href="/dashboard/expenses" className="btn-outline btn-sm mt-3 w-full">Open expense tracker</Link>
          </section>

          <section className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[14px] font-semibold text-ink">Saved for later</h2>
              <Link href="/dashboard/saved" className="text-[10.5px] font-semibold text-brand-600">View all</Link>
            </div>
            <div className="mt-3 space-y-2.5">
              {saved.slice(0, 3).map((t) => (
                <Link key={t.id} href={`/tours/${t.slug}`} className="flex items-center gap-2.5">
                  <span className="relative h-9 w-12 shrink-0 overflow-hidden rounded-lg"><SmartImage src={t.hero_image} alt={t.title} fill sizes="48px" /></span>
                  <span className="min-w-0">
                    <span className="block truncate text-[11.5px] font-semibold text-ink">{t.title}</span>
                    <span className="block text-[9.5px] text-muted">{t.duration_days} days · {npr(Number(t.sale_price ?? t.price))}</span>
                  </span>
                </Link>
              ))}
              {saved.length === 0 && <p className="text-[11px] text-muted">Tap the heart on any trip to save it here.</p>}
            </div>
          </section>

          {plans.length > 0 && (
            <Link href="/dashboard/plans" className="flex items-center gap-3 rounded-3xl border border-line bg-white p-4 shadow-card transition hover:border-brand-200">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600"><Sparkles className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-ink">{plans.length} AI {plans.length === 1 ? "itinerary" : "itineraries"}</span>
                <span className="block text-[10.5px] text-muted">Your latest: {plans[0].title}</span>
              </span>
              <ArrowRight className="h-4 w-4 text-muted" />
            </Link>
          )}
        </div>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Luggage, title: "Bookings & payments", body: "Receipts, status and cancellation.", href: "/dashboard/bookings" },
          { icon: MapPin, title: "Plan a custom route", body: "AI planner, saved and shareable.", href: "/dashboard/planner" },
          { icon: Wallet, title: "Track trip money", body: "Expenses, receipts and nutrition scans.", href: "/dashboard/expenses" },
        ].map((x) => (
          <Link key={x.title} href={x.href} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-brand-200">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-mist text-forest"><x.icon className="h-4 w-4" /></span>
            <span>
              <span className="block text-[12.5px] font-semibold text-ink">{x.title}</span>
              <span className="block text-[10.5px] text-muted">{x.body}</span>
            </span>
          </Link>
        ))}
      </section>
    </div>
  );
}
