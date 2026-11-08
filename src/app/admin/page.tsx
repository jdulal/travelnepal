import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Compass,
  Mail,
  Mountain,
  Star,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminActivity, getAdminBookings, getAdminStats } from "@/lib/admin";
import RevenueChart from "@/components/admin/RevenueChart";
import { StatCard, StatusPill, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import { dateTime, npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Admin overview", robots: { index: false } };
export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  pending: "bg-amber-400",
  confirmed: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

export default async function AdminOverviewPage() {
  await requireAdmin();
  const [stats, bookings, activity] = await Promise.all([getAdminStats(), getAdminBookings(), getAdminActivity()]);
  const recentBookings = bookings.slice(0, 6);
  const totalStatus = stats.bookingsByStatus.reduce((sum, s) => sum + s.count, 0) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Good to see you</h2>
          <p className="mt-1 text-[12.5px] text-slate-500">A live snapshot of bookings, revenue and what needs your attention today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/trips/new" className="admin-btn text-[12px]">
            <Mountain className="h-3.5 w-3.5" /> New trip
          </Link>
          <Link href="/admin/departures" className="admin-btn-ghost text-[12px]">
            <CalendarDays className="h-3.5 w-3.5" /> Departures
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Paid revenue" value={npr(stats.revenue)} hint="All confirmed payments" icon={CircleDollarSign} tone="forest" />
        <StatCard label="Bookings" value={stats.bookings} hint={`${stats.pending} awaiting confirmation`} icon={CalendarCheck} tone="brand" />
        <StatCard label="Travellers" value={stats.travellers} hint="Across active bookings" icon={Users} tone="blue" />
        <StatCard label="Published trips" value={stats.trips} hint="In the public catalogue" icon={Mountain} tone="forest" />
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Customers" value={stats.users} hint="Registered travellers" icon={Users} tone="brand" />
        <StatCard label="Reviews to moderate" value={stats.reviewsPending} hint="Pending approval" icon={Star} tone="amber" />
        <StatCard label="New inquiries" value={stats.inquiriesNew} hint="Unanswered messages" icon={Mail} tone="rose" />
        <StatCard label="Pending bookings" value={stats.pending} hint="Need a status update" icon={Clock3} tone="amber" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="admin-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[13.5px] font-bold text-slate-900">Revenue</h3>
              <p className="text-[11px] text-slate-400">Paid bookings, last 6 months</p>
            </div>
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10.5px] font-bold text-forest ring-1 ring-brand-200">
              {npr(stats.revenue)} total
            </span>
          </div>
          <RevenueChart data={stats.revenueByMonth} />
        </div>

        <div className="admin-card p-5">
          <h3 className="text-[13.5px] font-bold text-slate-900">Booking pipeline</h3>
          <p className="text-[11px] text-slate-400">Where every booking stands right now</p>
          <div className="mt-5 space-y-3.5">
            {stats.bookingsByStatus.length === 0 && <p className="text-[12px] text-slate-400">No bookings yet.</p>}
            {stats.bookingsByStatus.map((s) => (
              <div key={s.status}>
                <div className="flex items-center justify-between text-[11.5px]">
                  <span className="font-semibold capitalize text-slate-600">{s.status}</span>
                  <span className="text-slate-400">{s.count}</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${statusColors[s.status] ?? "bg-slate-400"}`} style={{ width: `${Math.max((s.count / totalStatus) * 100, 4)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-4">
            <h3 className="text-[13.5px] font-bold text-slate-900">Top trips</h3>
            <div className="mt-3 space-y-3">
              {stats.topTrips.length === 0 && <p className="text-[12px] text-slate-400">No sales yet.</p>}
              {stats.topTrips.map((t, i) => (
                <div key={t.title} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md bg-slate-100 text-[10px] font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11.5px] font-semibold text-slate-700">{t.title}</p>
                    <p className="text-[10px] text-slate-400">{t.bookings} bookings · {npr(t.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[13.5px] font-bold text-slate-900">Latest bookings</h3>
            <Link href="/admin/bookings" className="link-arrow text-[11.5px]">View all <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <TableWrap>
            <thead className="border-b border-slate-100 bg-slate-50/60">
              <tr>
                <Th>Reference</Th>
                <Th>Traveller</Th>
                <Th>Trip</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentBookings.length === 0 && (
                <tr><Td className="py-8 text-center text-slate-400">No bookings yet.</Td></tr>
              )}
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60">
                  <Td>
                    <Link href={`/admin/bookings/${b.id}`} className="font-bold text-forest hover:underline">{b.reference}</Link>
                  </Td>
                  <Td>
                    <span className="block font-semibold text-slate-700">{b.full_name}</span>
                    <span className="block text-[10.5px] text-slate-400">{b.email}</span>
                  </Td>
                  <Td className="max-w-[180px] truncate">{b.trip_title}</Td>
                  <Td className="font-semibold text-slate-700">{npr(b.total)}</Td>
                  <Td><StatusPill status={b.status} /></Td>
                  <Td className="whitespace-nowrap text-slate-400">{shortDate(b.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        </div>

        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="text-[13.5px] font-bold text-slate-900">Activity</h3>
            <Link href="/admin/activity" className="link-arrow text-[11.5px]">Log <ArrowUpRight className="h-3 w-3" /></Link>
          </div>
          <div className="admin-card divide-y divide-slate-100">
            {activity.length === 0 && <p className="px-4 py-8 text-center text-[12px] text-slate-400">No activity recorded yet.</p>}
            {activity.slice(0, 7).map((a) => (
              <div key={a.id} className="flex gap-2.5 px-4 py-3">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                <div className="min-w-0">
                  <p className="text-[11.5px] leading-snug text-slate-600">{a.details ?? `${a.action} ${a.entity ?? ""}`}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    {a.name ?? "System"} · {dateTime(a.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-forest p-4 text-white">
            <Compass className="h-4 w-4 text-brand-200" />
            <p className="mt-2 text-[12.5px] font-semibold">Open the traveller site</p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-white/60">Check how your trips, stories and plans look to customers.</p>
            <Link href="/" className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-[10.5px] font-bold text-forest hover:bg-brand-50">
              Visit nepaltravel.com
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
