"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { AlertCircle, CalendarDays, Check, ChevronRight, Loader2, ShieldCheck, Ticket, Users, Wallet } from "lucide-react";
import { createBookingAction, type BookingState } from "@/app/actions/booking";
import { cn, npr, priceOf, seatsLeft, shortDate } from "@/lib/utils";
import type { Departure, Trip } from "@/types";

const initial: BookingState = {};

type Addon = { id: number; name: string; description: string | null; price: string };

export default function BookingForm({
  trip,
  departures,
  addons,
  defaultDeparture,
  defaultTravelers,
  defaults,
}: {
  trip: Trip;
  departures: Departure[];
  addons: Addon[];
  defaultDeparture?: number;
  defaultTravelers: number;
  defaults: { name: string; email: string };
}) {
  const [state, action, pending] = useActionState(createBookingAction, initial);
  const [departureId, setDepartureId] = useState(() => {
    const preferred = departures.find((d) => d.id === defaultDeparture && seatsLeft(d) > 0);
    return preferred?.id ?? departures.find((d) => seatsLeft(d) > 0)?.id ?? 0;
  });
  const [travelers, setTravelers] = useState(Math.max(1, Math.min(defaultTravelers, trip.group_size)));
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);

  const departure = departures.find((d) => d.id === departureId);
  const unitPrice = departure?.price ? Number(departure.price) : priceOf(trip);
  const addonTotal = useMemo(
    () => addons.filter((a) => selectedAddons.includes(a.id)).reduce((sum, a) => sum + Number(a.price), 0),
    [addons, selectedAddons]
  );
  const subtotal = unitPrice * travelers + addonTotal * travelers;

  const toggleAddon = (id: number) =>
    setSelectedAddons((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  return (
    <form action={action} className="grid gap-7 lg:grid-cols-[1fr_360px] lg:items-start">
      <input type="hidden" name="trip_id" value={trip.id} />
      <input type="hidden" name="departure_id" value={departureId || ""} />
      <input type="hidden" name="travelers" value={travelers} />

      <div className="space-y-5">
        <section className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">1</span>
            <h2 className="text-[16px] font-semibold text-ink">Lead traveller</h2>
          </div>
          <p className="mt-1 pl-9 text-[11.5px] text-muted">We&apos;ll send confirmations and trip notes to this address.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="full_name">Full name</label>
              <input id="full_name" name="full_name" required defaultValue={defaults.name} className="field" autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required defaultValue={defaults.email} className="field" autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone / WhatsApp</label>
              <input id="phone" name="phone" required placeholder="+977 98…" className="field" autoComplete="tel" />
            </div>
            <div>
              <label className="label" htmlFor="nationality">Nationality</label>
              <input id="nationality" name="nationality" required defaultValue="Nepal" className="field" autoComplete="country-name" />
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">2</span>
            <h2 className="text-[16px] font-semibold text-ink">Your dates &amp; group</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="departure">Departure date</label>
              <select
                id="departure"
                value={departureId}
                onChange={(e) => setDepartureId(Number(e.target.value))}
                className="field"
              >
                {departures.length === 0 && <option value="0">Request custom dates</option>}
                {departures.map((d) => (
                  <option key={d.id} value={d.id} disabled={seatsLeft(d) === 0}>
                    {shortDate(d.start_date)} — {shortDate(d.end_date)} · {seatsLeft(d) === 0 ? "Full" : `${seatsLeft(d)} seats left`}
                  </option>
                ))}
              </select>
              {departure && <p className="mt-1.5 text-[10.5px] text-muted">{departure.trip_id === trip.id ? `${trip.duration_days} days · starts in ${trip.departure_city}` : ""}</p>}
            </div>
            <div>
              <label className="label" htmlFor="travelers_input">Travellers</label>
              <select id="travelers_input" value={travelers} onChange={(e) => setTravelers(Number(e.target.value))} className="field">
                {Array.from({ length: Math.min(trip.group_size, 12) }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "traveller" : "travellers"}</option>
                ))}
              </select>
              {departure && seatsLeft(departure) > 0 && travelers > seatsLeft(departure) && (
                <p className="mt-1.5 text-[10.5px] text-red-600">Only {seatsLeft(departure)} seats left on this date.</p>
              )}
            </div>
          </div>
        </section>

        {addons.length > 0 && (
          <section className="rounded-3xl border border-line bg-white p-5">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">3</span>
              <h2 className="text-[16px] font-semibold text-ink">Make it yours</h2>
            </div>
            <p className="mt-1 pl-9 text-[11.5px] text-muted">Optional extras, priced per traveller.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {addons.map((a) => {
                const active = selectedAddons.includes(a.id);
                return (
                  <label key={a.id} className={cn("flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition", active ? "border-brand-300 bg-brand-50/60" : "border-line hover:border-brand-200")}>
                    <input type="checkbox" name="addons" value={a.id} checked={active} onChange={() => toggleAddon(a.id)} className="sr-only" />
                    <span className={cn("mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border", active ? "border-forest bg-forest text-white" : "border-line bg-white text-transparent")}>
                      <Check className="h-3 w-3" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-[12.5px] font-semibold text-ink">{a.name}</span>
                        <span className="shrink-0 text-[11.5px] font-semibold text-forest">{npr(a.price)}</span>
                      </span>
                      {a.description && <span className="mt-0.5 block text-[10.5px] leading-relaxed text-muted">{a.description}</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        )}

        <section className="rounded-3xl border border-line bg-white p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{addons.length > 0 ? 4 : 3}</span>
            <h2 className="text-[16px] font-semibold text-ink">Final details</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="coupon_code"><Ticket className="mr-1 inline h-3.5 w-3.5 text-brand-500" /> Coupon code</label>
              <input id="coupon_code" name="coupon_code" placeholder="NEPAL10" className="field uppercase" maxLength={40} />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="special_requests">Special requests</label>
              <textarea id="special_requests" name="special_requests" rows={3} placeholder="Dietary needs, room preferences, arrival time…" className="field resize-none" maxLength={2000} />
            </div>
          </div>
          <label className="mt-4 flex items-start gap-2 text-[11px] leading-relaxed text-muted">
            <input type="checkbox" required className="mt-0.5 h-3.5 w-3.5 rounded border-line text-brand-500" />
            I agree to the <Link href="/terms-condition" className="font-semibold text-brand-600 underline">booking terms</Link> and <Link href="/privacy-policy" className="font-semibold text-brand-600 underline">privacy policy</Link>, and confirm names match travel documents.
          </label>
        </section>

        {state.error && (
          <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}</p>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
          <div className="relative h-32">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={trip.hero_image ?? "/images/fallback/nepal.jpg"} alt={trip.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-deep/85 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 text-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-brand-200">Your trip</p>
              <p className="text-[14px] font-semibold leading-tight">{trip.title}</p>
            </div>
          </div>
          <div className="p-5">
            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between"><span className="text-muted">Travellers</span><span className="inline-flex items-center gap-1 font-medium text-ink"><Users className="h-3.5 w-3.5 text-brand-500" /> {travelers}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted">Departure</span><span className="inline-flex items-center gap-1 font-medium text-ink"><CalendarDays className="h-3.5 w-3.5 text-brand-500" /> {departure ? shortDate(departure.start_date) : "Custom"}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted">Per person</span><span className="font-medium text-ink">{npr(unitPrice)}</span></div>
              {addonTotal > 0 && (
                <div className="flex items-center justify-between"><span className="text-muted">Extras (per person)</span><span className="font-medium text-ink">{npr(addonTotal)}</span></div>
              )}
              <div className="flex items-center justify-between border-t border-line pt-2"><span className="text-muted">Subtotal</span><span className="font-semibold text-ink">{npr(subtotal)}</span></div>
            </div>

            <div className="mt-3 rounded-2xl bg-mist p-3">
              <p className="text-[10px] uppercase tracking-wide text-muted">Estimated total</p>
              <p className="text-[22px] font-bold text-forest">{npr(subtotal)}</p>
              <p className="text-[10px] text-muted">Coupons applied on the next step.</p>
            </div>

            <button type="submit" disabled={pending || (departure ? travelers > seatsLeft(departure) : false)} className="btn-primary mt-4 w-full">
              {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating booking…</> : <>Continue to payment <ChevronRight className="h-4 w-4" /></>}
            </button>
            <div className="mt-3 space-y-1.5 text-[10.5px] text-muted">
              <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-brand-600" /> Secure checkout · no hidden fees</p>
              <p className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5 text-brand-600" /> eSewa, Khalti, cards &amp; bank transfer</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[10px] text-muted">Need help? <Link href="/contact" className="font-semibold text-brand-600">Talk to a local expert</Link></p>
      </aside>
    </form>
  );
}
