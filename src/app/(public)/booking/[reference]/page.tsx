import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CheckCircle2, Clock, Download, Headset, MapPin, Users, Wallet } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import PrintButton from "@/components/site/PrintButton";
import { getBookingByReference } from "@/lib/queries";
import { npr, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your booking",
  robots: { index: false, follow: false },
};

const statusCopy: Record<string, { label: string; tone: string }> = {
  pending: { label: "Awaiting payment", tone: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", tone: "bg-brand-50 text-forest border-brand-200" },
  completed: { label: "Completed", tone: "bg-sky-50 text-sky-700 border-sky-200" },
  cancelled: { label: "Cancelled", tone: "bg-red-50 text-red-700 border-red-200" },
};

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const [{ reference }, sp] = await Promise.all([params, searchParams]);
  const data = await getBookingByReference(reference);
  if (!data) notFound();
  const { booking, payments } = data;
  const paidNow = sp.paid === "1" && booking.payment_status === "paid";
  const status = statusCopy[booking.status] ?? statusCopy.pending;
  const successPayment = payments.find((p) => p.status === "success");

  return (
    <>
      <section className="border-b border-line bg-mist">
        <div className="shell py-9">
          {paidNow ? (
            <div className="mx-auto max-w-2xl text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-100 text-forest"><CheckCircle2 className="h-7 w-7" /></span>
              <p className="hero-script mt-3 text-[22px] text-brand-600">You&apos;re going to Nepal!</p>
              <h1 className="mt-1 text-[30px] font-semibold tracking-[-0.02em] text-ink">Booking confirmed</h1>
              <p className="mt-2 text-[13px] text-muted">
                Payment received. A confirmation email is on its way to <span className="font-medium text-ink">{booking.email}</span>. Your reference is
                <span className="ml-1 rounded-md bg-white px-2 py-0.5 font-mono text-[12px] font-bold text-forest ring-1 ring-line">{booking.reference}</span>.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="eyebrow">Your booking</p>
                <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-ink">{booking.reference}</h1>
                <p className="mt-1 text-[12.5px] text-muted">Keep this reference for any questions about your trip.</p>
              </div>
              <span className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${status.tone}`}>{status.label}</span>
            </div>
          )}
        </div>
      </section>

      <section className="shell grid gap-6 py-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="relative h-40 sm:h-48">
              <SmartImage src={booking.trip_image} alt={booking.trip_title ?? "Trip"} fill sizes="(max-width: 1024px) 100vw, 640px" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <h2 className="text-[22px] font-semibold">{booking.trip_title}</h2>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-white/80">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" /> Nepal</span>
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {booking.start_date ? shortDate(booking.start_date) : "Dates to confirm"}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.duration_days ?? ""} days</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {booking.travelers} travellers</span>
                </div>
              </div>
            </div>
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Lead traveller</p>
                <p className="mt-1 text-[13px] font-semibold text-ink">{booking.full_name}</p>
                <p className="text-[11.5px] text-muted">{booking.email}</p>
                <p className="text-[11.5px] text-muted">{booking.phone} · {booking.nationality}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Booking status</p>
                <p className="mt-1 text-[13px] font-semibold capitalize text-ink">{booking.status} · {booking.payment_status}</p>
                <p className="text-[11.5px] text-muted">Created {shortDate(booking.created_at)}</p>
                {booking.payment_method && <p className="text-[11.5px] text-muted">Paid by {booking.payment_method}</p>}
              </div>
              {booking.addons && booking.addons.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Extras</p>
                  <ul className="mt-1 flex flex-wrap gap-1.5">
                    {booking.addons.map((a) => <li key={a.name} className="rounded-full bg-mist px-2.5 py-1 text-[11px] text-body/80">{a.name}</li>)}
                  </ul>
                </div>
              )}
              {booking.special_requests && (
                <div className="sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Special requests</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-body/80">{booking.special_requests}</p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5">
            <h2 className="text-[14px] font-semibold text-ink">Payment history</h2>
            {payments.length === 0 ? (
              <p className="mt-2 text-[12px] text-muted">No payments recorded yet.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-[11.5px]">
                  <thead className="text-[10px] uppercase tracking-wide text-muted">
                    <tr><th className="pb-2">Method</th><th className="pb-2">Reference</th><th className="pb-2">Date</th><th className="pb-2 text-right">Amount</th><th className="pb-2 text-right">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 font-medium capitalize text-ink">{p.method}</td>
                        <td className="py-2 font-mono text-[10.5px] text-muted">{p.transaction_ref}</td>
                        <td className="py-2 text-muted">{shortDate(p.paid_at)}</td>
                        <td className="py-2 text-right font-semibold text-ink">{npr(Number(p.amount))}</td>
                        <td className="py-2 text-right"><span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-forest">{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <p className="text-[10px] uppercase tracking-wide text-muted">Amount</p>
            <p className="text-[26px] font-bold leading-none text-forest">{npr(Number(booking.total))}</p>
            <div className="mt-3 space-y-1.5 text-[11.5px]">
              <div className="flex justify-between gap-2"><span className="text-muted">Subtotal</span><span className="text-ink">{npr(Number(booking.subtotal))}</span></div>
              {Number(booking.discount) > 0 && <div className="flex justify-between gap-2 text-brand-700"><span>Discount</span><span>−{npr(Number(booking.discount))}</span></div>}
              <div className="flex justify-between gap-2 border-t border-line pt-1.5 font-semibold"><span className="text-ink">Paid</span><span className="text-ink">{booking.payment_status === "paid" ? npr(Number(successPayment?.amount ?? booking.total)) : npr(0)}</span></div>
            </div>
            {booking.status === "pending" && (
              <Link href={`/checkout/${booking.reference}`} className="btn-primary mt-4 w-full"><Wallet className="h-4 w-4" /> Complete payment</Link>
            )}
            <div className="mt-2 grid gap-2">
              <PrintButton label="Print confirmation" />
              <Link href={booking.trip_slug ? `/tours/${booking.trip_slug}` : "/tours"} className="btn-ghost btn-sm w-full"><Download className="h-4 w-4" /> Trip itinerary</Link>
            </div>
          </div>

          <div className="rounded-3xl bg-forest p-5 text-white">
            <Headset className="h-5 w-5 text-brand-200" />
            <p className="mt-2 text-[14px] font-semibold">We&apos;re here 24/7</p>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/65">Questions about gear, flights or altitude? Our Kathmandu team replies fast.</p>
            <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-brand-200 hover:text-white">Contact support →</Link>
          </div>

          <div className="rounded-3xl border border-line bg-mist/60 p-4 text-[11px] leading-relaxed text-muted">
            <p className="font-semibold text-ink">What happens next</p>
            <ol className="mt-2 space-y-1.5">
              <li>1. Our team reviews your booking within one business day.</li>
              <li>2. You receive a gear list and joining instructions.</li>
              <li>3. Final trip briefing 7 days before departure.</li>
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
