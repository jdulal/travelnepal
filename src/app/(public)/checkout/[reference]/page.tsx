import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CalendarDays, Check, ChevronRight, Clock, ShieldCheck, Users } from "lucide-react";
import PaymentForm from "@/components/site/PaymentForm";
import SmartImage from "@/components/site/SmartImage";
import { getBookingByReference } from "@/lib/queries";
import { npr, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

const steps = [["Details", true], ["Payment", true], ["Confirmed", false]] as const;

export default async function CheckoutPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const data = await getBookingByReference(reference);
  if (!data) notFound();
  const { booking } = data;
  if (booking.payment_status === "paid") redirect(`/booking/${reference}`);

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
                <Link href="/tours" className="hover:text-forest">Tours</Link>
                <ChevronRight className="h-3 w-3" />
                <span className="font-medium text-ink">Checkout</span>
              </div>
              <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.02em] text-ink">Secure checkout</h1>
              <p className="mt-1 text-[12px] text-muted">Booking reference <span className="font-mono font-semibold text-forest">{booking.reference}</span></p>
            </div>
            <ol className="flex items-center gap-2 text-[11px]">
              {steps.map(([label, done], i) => (
                <li key={label} className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold ${done ? "bg-brand-50 text-forest" : "bg-mist text-muted"}`}>
                    {done && i === 0 ? <Check className="h-3 w-3" /> : <span className="grid h-4 w-4 place-items-center rounded-full bg-current/10 text-[9px]">{i + 1}</span>}
                    {label}
                  </span>
                  {i < steps.length - 1 && <span className="h-px w-4 bg-line" />}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="shell grid gap-7 py-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
            <div className="relative h-36 sm:h-44">
              <SmartImage src={booking.trip_image} alt={booking.trip_title ?? "Trip"} fill sizes="(max-width: 1024px) 100vw, 640px" />
              <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/90 via-forest-deep/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">Your booking</p>
                <h2 className="text-[21px] font-semibold leading-tight">{booking.trip_title}</h2>
                <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-white/80">
                  <span className="inline-flex items-center gap-1"><CalendarDays className="h-3 w-3" /> {booking.start_date ? shortDate(booking.start_date) : "Custom dates"}</span>
                  <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {booking.duration_days ?? ""} days</span>
                  <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" /> {booking.travelers} travellers</span>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-[14px] font-semibold text-ink">Choose how to pay</h3>
              <p className="mt-0.5 text-[11.5px] text-muted">All transactions are encrypted. You&apos;ll get an instant confirmation.</p>
              <div className="mt-4"><PaymentForm reference={booking.reference} total={Number(booking.total)} /></div>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-line bg-mist/60 p-4 text-[11.5px] leading-relaxed text-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <p>Need to pay by instalments or from abroad? Email <span className="font-semibold text-forest">hello@nepaltravel.com</span> with your reference and our team will arrange it. Free cancellation up to 30 days before departure.</p>
          </div>
        </div>

        <aside className="rounded-3xl border border-line bg-white p-5 shadow-card">
          <h2 className="text-[14px] font-semibold text-ink">Price breakdown</h2>
          <div className="mt-3 space-y-2 text-[12px]">
            <div className="flex justify-between gap-3"><span className="text-muted">Trip subtotal</span><span className="font-medium text-ink">{npr(Number(booking.subtotal))}</span></div>
            {booking.addons && booking.addons.length > 0 && (
              <div className="rounded-xl bg-mist/70 p-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Extras</p>
                {booking.addons.map((a) => (
                  <div key={a.name} className="mt-1 flex justify-between gap-2 text-[11.5px]"><span className="text-body/80">{a.name}</span><span className="text-ink">{npr(a.price)}<span className="text-[9px] text-muted"> /pp</span></span></div>
                ))}
              </div>
            )}
            {Number(booking.discount) > 0 && (
              <div className="flex justify-between gap-3 text-brand-700"><span>Discount {booking.coupon_code ? `(${booking.coupon_code})` : ""}</span><span className="font-medium">−{npr(Number(booking.discount))}</span></div>
            )}
            <div className="flex items-end justify-between gap-3 border-t border-line pt-2.5">
              <span className="font-semibold text-ink">Total due</span>
              <span className="text-[20px] font-bold text-forest">{npr(Number(booking.total))}</span>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 rounded-2xl bg-mist p-3 text-[11px] text-muted">
            <p className="flex justify-between gap-2"><span>Lead traveller</span><span className="font-medium text-ink">{booking.full_name}</span></p>
            <p className="flex justify-between gap-2"><span>Email</span><span className="truncate font-medium text-ink">{booking.email}</span></p>
            <p className="flex justify-between gap-2"><span>Phone</span><span className="font-medium text-ink">{booking.phone}</span></p>
          </div>
          <Link href={`/tours/${booking.trip_slug}`} className="btn-ghost btn-sm mt-4 w-full">Back to trip</Link>
        </aside>
      </section>
    </>
  );
}
