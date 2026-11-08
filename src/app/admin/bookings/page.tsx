import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminBookings } from "@/lib/admin";
import { PageHeader, StatusPill, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import { cn, npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Bookings", robots: { index: false } };
export const dynamic = "force-dynamic";

const statuses = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  await requireAdmin();
  const params = await searchParams;
  const status = statuses.includes((params.status ?? "all") as (typeof statuses)[number]) ? params.status : undefined;
  const q = params.q?.trim() || undefined;
  const bookings = await getAdminBookings({ status: status === "all" ? undefined : status, q });

  const href = (next: { status?: string; q?: string }) => {
    const sp = new URLSearchParams();
    const s = next.status ?? status;
    const query = next.q ?? q;
    if (s && s !== "all") sp.set("status", s);
    if (query) sp.set("q", query);
    return `/admin/bookings${sp.toString() ? `?${sp}` : ""}`;
  };

  return (
    <div>
      <PageHeader
        title="Bookings"
        description="Every reservation across all trips and departures. Open a booking to confirm, mark payments or leave a note for the traveller."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {statuses.map((s) => (
            <Link
              key={s}
              href={href({ status: s })}
              className={cn(
                "rounded-full px-3 py-1.5 text-[11.5px] font-semibold capitalize ring-1 transition",
                (status ?? "all") === s
                  ? "bg-forest text-white ring-forest"
                  : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
              )}
            >
              {s === "all" ? "All bookings" : s}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <form action="/admin/bookings" className="flex items-center gap-2">
            {status && status !== "all" && <input type="hidden" name="status" value={status} />}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                name="q"
                defaultValue={q}
                placeholder="Reference, name, email or trip"
                className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              />
            </div>
            <button type="submit" className="admin-btn-ghost py-2 text-[12px]">Search</button>
          </form>
          <a
            href={`/admin/export/bookings${status && status !== "all" ? `?status=${status}` : ""}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" /> CSV
          </a>
        </div>
      </div>

      <TableWrap>
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <Th>Reference</Th>
            <Th>Traveller</Th>
            <Th>Trip & date</Th>
            <Th>Travellers</Th>
            <Th>Total</Th>
            <Th>Payment</Th>
            <Th>Status</Th>
            <Th>Booked</Th>
            <Th className="text-right">Open</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bookings.length === 0 && (
            <tr>
              <Td colSpan={9} className="py-10 text-center text-slate-400">No bookings match these filters.</Td>
            </tr>
          )}
          {bookings.map((b) => (
            <tr key={b.id} className="transition hover:bg-slate-50/70">
              <Td>
                <Link href={`/admin/bookings/${b.id}`} className="font-bold text-forest hover:underline">{b.reference}</Link>
              </Td>
              <Td>
                <span className="block font-semibold text-slate-700">{b.full_name}</span>
                <span className="block text-[10.5px] text-slate-400">{b.email}</span>
              </Td>
              <Td>
                <span className="block max-w-[210px] truncate font-medium text-slate-600">{b.trip_title}</span>
                <span className="block text-[10.5px] text-slate-400">{shortDate(b.start_date)}</span>
              </Td>
              <Td>{b.travelers}</Td>
              <Td className="font-semibold text-slate-700">{npr(b.total)}</Td>
              <Td><StatusPill status={b.payment_status} /></Td>
              <Td><StatusPill status={b.status} /></Td>
              <Td className="whitespace-nowrap text-slate-400">{shortDate(b.created_at)}</Td>
              <Td className="text-right">
                <Link href={`/admin/bookings/${b.id}`} className="text-[11.5px] font-bold text-brand-600 hover:text-forest">Manage</Link>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
