import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarDays, Download, Luggage, ReceiptText, Users } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import { requireUser } from "@/lib/guards";
import { getUserBookings } from "@/lib/queries";
import { cancelBookingAction } from "@/app/actions/booking";
import { npr, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My bookings" };

const tone: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-brand-50 text-forest ring-brand-200",
  completed: "bg-sky-50 text-sky-700 ring-sky-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
};

const filters = [
  ["all", "All"],
  ["upcoming", "Upcoming"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
] as const;

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const session = await requireUser("/dashboard/bookings");
  const [sp, bookings] = await Promise.all([searchParams, getUserBookings(session.id)]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filter = sp.status ?? "all";
  const list = bookings.filter((b) => {
    if (filter === "upcoming") return b.status !== "cancelled" && b.status !== "completed" && (!b.start_date || new Date(b.start_date) >= today);
    if (filter === "completed") return b.status === "completed";
    if (filter === "cancelled") return b.status === "cancelled";
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Trips you&apos;ve booked</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">My bookings</h1>
          <p className="mt-1 text-[12.5px] text-muted">Payments, dates and documents — all in one place.</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {filters.map(([value, label]) => (
            <Link key={value} href={`/dashboard/bookings${value === "all" ? "" : `?status=${value}`}`} className={`chip ${filter === value ? "chip-active" : ""}`}>{label}</Link>
          ))}
        </div>
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <Luggage className="mx-auto h-9 w-9 text-brand-400" />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">No bookings in this view</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">When you book a trip it will appear here with payments, documents and trip details.</p>
          <Link href="/tours" className="btn-primary btn-sm mt-4">Browse trips</Link>
        </div>
      ) : (
        <div className="space-y-3.5">
          {list.map((b) => (
            <article key={b.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
              <div className="grid sm:grid-cols-[190px_1fr]">
                <div className="relative min-h-[140px] sm:min-h-full">
                  <SmartImage src={b.trip_image} alt={b.trip_title ?? "Trip"} fill sizes="(max-width: 640px) 100vw, 190px" />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ring-1 ${tone[b.status]}`}>{b.status}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wide ${b.payment_status === "paid" ? "bg-brand-50 text-forest" : "bg-mist text-muted"}`}>{b.payment_status}</span>
                        <span className="font-mono text-[10px] text-muted">{b.reference}</span>
                      </div>
                      <h2 className="mt-1.5 text-[17px] font-semibold text-ink">
                        {b.trip_slug ? <Link href={`/tours/${b.trip_slug}`} className="hover:text-forest">{b.trip_title}</Link> : b.trip_title}
                      </h2>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted">
                        <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5 text-brand-500" /> {shortDate(b.start_date)}</span>
                        <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5 text-brand-500" /> {b.travelers} travellers</span>
                        <span className="inline-flex items-center gap-1"><ReceiptText className="h-3.5 w-3.5 text-brand-500" /> Total {npr(Number(b.total))}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted">Booked</p>
                      <p className="text-[11.5px] font-medium text-ink">{shortDate(b.created_at)}</p>
                    </div>
                  </div>

                  {b.addons && b.addons.length > 0 && (
                    <p className="mt-2 text-[10.5px] text-muted">Extras: {b.addons.map((a) => a.name).join(", ")}</p>
                  )}

                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    <Link href={`/booking/${b.reference}`} className="btn-primary btn-sm">View details <ArrowRight className="h-3.5 w-3.5" /></Link>
                    {b.payment_status === "unpaid" && b.status === "pending" && (
                      <Link href={`/checkout/${b.reference}`} className="btn-outline btn-sm">Pay now</Link>
                    )}
                    {b.status !== "cancelled" && b.status !== "completed" && b.payment_status === "unpaid" && (
                      <form action={cancelBookingAction}>
                        <input type="hidden" name="reference" value={b.reference} />
                        <button type="submit" className="btn-ghost btn-sm text-red-600 hover:bg-red-50">Cancel booking</button>
                      </form>
                    )}
                    {b.payment_status === "paid" && (
                      <Link href={`/booking/${b.reference}`} className="btn-ghost btn-sm"><Download className="h-3.5 w-3.5" /> Receipt</Link>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="rounded-2xl border border-line bg-white p-4 text-[11px] leading-relaxed text-muted">
        Need to change dates or transfer a booking? Paid bookings can&apos;t be cancelled instantly — <Link href="/contact" className="font-semibold text-brand-600">contact our team</Link> and we&apos;ll handle it personally. Free cancellation applies up to 30 days before departure.
      </p>
    </div>
  );
}
