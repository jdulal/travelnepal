import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, Mail, MapPin, Phone, Users } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminBooking } from "@/lib/admin";
import BookingUpdateForm from "@/components/admin/BookingUpdateForm";
import { StatusPill } from "@/components/admin/AdminUI";
import { dateTime, npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Booking detail", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminBookingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const data = await getAdminBooking(Number(id));
  if (!data) notFound();
  const { booking, payments } = data;

  return (
    <div>
      <Link href="/admin/bookings" className="mb-4 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-forest">
        <ArrowLeft className="h-3.5 w-3.5" /> All bookings
      </Link>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-slate-900">
            {booking.reference}
            <StatusPill status={booking.status} />
            <StatusPill status={booking.payment_status} />
          </h2>
          <p className="mt-1 text-[12px] text-slate-500">Booked {dateTime(booking.created_at)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/tours/${booking.trip_slug}`} className="admin-btn-ghost text-[12px]">
            <ExternalLink className="h-3.5 w-3.5" /> View trip
          </Link>
          <Link href={`/booking/${booking.reference}`} className="admin-btn text-[12px]">
            <ExternalLink className="h-3.5 w-3.5" /> Traveller view
          </Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="admin-card p-5">
            <h3 className="text-[13px] font-bold text-slate-900">Trip</h3>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[15px] font-semibold text-slate-800">{booking.trip_title}</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {booking.duration_days} days · <span className="capitalize">{booking.difficulty}</span> · {booking.travelers} traveller{booking.travelers > 1 ? "s" : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-4 text-[12px] text-slate-600">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-brand-600" />
                    {shortDate(booking.departure_start ?? booking.start_date)}
                    {booking.departure_end ? ` – ${shortDate(booking.departure_end)}` : ""}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-brand-600" /> {booking.travelers} seats
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Total</p>
                <p className="text-[20px] font-bold text-forest">{npr(booking.total)}</p>
                <p className="text-[10.5px] text-slate-400">{booking.currency}</p>
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-[13px] font-bold text-slate-900">Traveller</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-[14px] font-semibold text-slate-800">{booking.full_name}</p>
                <p className="text-[11.5px] text-slate-400">{booking.nationality}</p>
              </div>
              <div className="space-y-1 text-[12px] text-slate-600 sm:text-right">
                <p className="inline-flex items-center gap-1.5 sm:flex"><Mail className="h-3.5 w-3.5 text-slate-400" /> {booking.email}</p>
                <p className="flex items-center gap-1.5 sm:justify-end"><Phone className="h-3.5 w-3.5 text-slate-400" /> {booking.phone}</p>
                <p className="flex items-center gap-1.5 sm:justify-end"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {booking.nationality}</p>
              </div>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-[13px] font-bold text-slate-900">Add-ons & requests</h3>
            {booking.addons && booking.addons.length > 0 ? (
              <ul className="mt-3 divide-y divide-slate-100">
                {booking.addons.map((a) => (
                  <li key={a.name} className="flex items-center justify-between py-2 text-[12.5px]">
                    <span className="text-slate-600">{a.name}</span>
                    <span className="font-semibold text-slate-700">{npr(a.price)} / person</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-[12px] text-slate-400">No add-ons selected.</p>
            )}
            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <p className="text-[10.5px] font-bold uppercase tracking-wide text-slate-400">Special requests</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-slate-600">{booking.special_requests || "None provided."}</p>
            </div>
          </div>

          <div className="admin-card p-5">
            <h3 className="text-[13px] font-bold text-slate-900">Amount breakdown</h3>
            <dl className="mt-3 space-y-2 text-[12.5px]">
              <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-medium text-slate-700">{npr(booking.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Discount {booking.coupon_code ? `(${booking.coupon_code})` : ""}</dt><dd className="font-medium text-emerald-600">− {npr(booking.discount)}</dd></div>
              <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px]"><dt className="font-bold text-slate-800">Total</dt><dd className="font-bold text-forest">{npr(booking.total)}</dd></div>
            </dl>
          </div>

          <div className="admin-card overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-3.5">
              <h3 className="text-[13px] font-bold text-slate-900">Payment history</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead className="bg-slate-50/60 text-left">
                  <tr>
                    <th className="px-5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Method</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Transaction</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Amount</th>
                    <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-5 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-6 text-center text-[12px] text-slate-400">No payments recorded.</td></tr>
                  )}
                  {payments.map((p) => (
                    <tr key={String(p.id)} className="text-[12px] text-slate-600">
                      <td className="px-5 py-2.5 font-semibold capitalize">{String(p.method)}</td>
                      <td className="px-3 py-2.5 font-mono text-[11px]">{String(p.transaction_ref ?? "—")}</td>
                      <td className="px-3 py-2.5">{npr(String(p.amount))}</td>
                      <td className="px-3 py-2.5"><StatusPill status={String(p.status)} /></td>
                      <td className="px-5 py-2.5 text-slate-400">{shortDate(String(p.paid_at ?? p.created_at))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <BookingUpdateForm id={booking.id} status={booking.status} paymentStatus={booking.payment_status} paymentMethod={booking.payment_method} />
          <div className="admin-card p-4">
            <h3 className="text-[13px] font-bold text-slate-900">Quick facts</h3>
            <dl className="mt-3 space-y-2 text-[11.5px]">
              <div className="flex justify-between"><dt className="text-slate-400">Reference</dt><dd className="font-semibold text-slate-700">{booking.reference}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Coupon</dt><dd className="font-semibold text-slate-700">{booking.coupon_code ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Method</dt><dd className="font-semibold capitalize text-slate-700">{booking.payment_method ?? "—"}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Booked on</dt><dd className="font-semibold text-slate-700">{shortDate(booking.created_at)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-400">Account</dt><dd className="font-semibold text-slate-700">{booking.user_id ? `#${booking.user_id}` : "Guest"}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
