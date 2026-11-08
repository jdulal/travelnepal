"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exec, q, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";
import { bookingReference } from "@/lib/utils";

export type BookingState = { error?: string };

const bookingSchema = z.object({
  trip_id: z.coerce.number().int().positive(),
  departure_id: z.coerce.number().int().positive().optional(),
  travelers: z.coerce.number().int().min(1).max(12),
  full_name: z.string().trim().min(2, "Please enter the lead traveller's full name."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Enter a contact phone number.").max(40),
  nationality: z.string().trim().min(2).max(80),
  coupon_code: z.string().trim().max(40).optional(),
  special_requests: z.string().trim().max(2000).optional(),
});

export async function createBookingAction(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const parsed = bookingSchema.safeParse({
    trip_id: formData.get("trip_id"),
    departure_id: formData.get("departure_id") || undefined,
    travelers: formData.get("travelers"),
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    nationality: formData.get("nationality"),
    coupon_code: formData.get("coupon_code") || undefined,
    special_requests: formData.get("special_requests") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const input = parsed.data;

  const trip = await q1<{ id: number; title: string; price: string; sale_price: string | null }>(
    "SELECT id, title, price, sale_price FROM trips WHERE id = ? AND status = 'published'",
    [input.trip_id]
  );
  if (!trip) return { error: "This trip is no longer available." };

  let startDate: string | null = null;
  let unitPrice = Number(trip.sale_price ?? trip.price);

  if (input.departure_id) {
    const departure = await q1<{ id: number; trip_id: number; start_date: string; seats_total: number; seats_booked: number; price: string | null; status: string }>(
      "SELECT id, trip_id, start_date, seats_total, seats_booked, price, status FROM trip_departures WHERE id = ?",
      [input.departure_id]
    );
    if (!departure || departure.trip_id !== trip.id) return { error: "That departure is not available for this trip." };
    if (departure.status !== "open" || departure.seats_booked + input.travelers > departure.seats_total) {
      return { error: "Not enough seats left on that departure. Please choose another date." };
    }
    startDate = departure.start_date;
    if (departure.price) unitPrice = Number(departure.price);
  }

  const addonIds = formData.getAll("addons").map((v) => Number(v)).filter((n) => Number.isInteger(n) && n > 0);
  let addons: { name: string; price: number }[] = [];
  if (addonIds.length > 0) {
    const placeholders = addonIds.map(() => "?").join(",");
    const rows = await q<{ name: string; price: string }>(
      `SELECT name, price FROM addons WHERE active = 1 AND id IN (${placeholders})`,
      addonIds
    );
    addons = rows.map((r) => ({ name: r.name, price: Number(r.price) }));
  }
  const addonsTotal = addons.reduce((sum, a) => sum + a.price, 0) * input.travelers;
  const subtotal = unitPrice * input.travelers + addonsTotal;

  let discount = 0;
  let couponCode: string | null = null;
  if (input.coupon_code) {
    const coupon = await q1<{ code: string; type: "percent" | "fixed"; value: string; min_spend: string; expires_at: string | null; active: number }>(
      "SELECT code, type, value, min_spend, expires_at, active FROM coupons WHERE code = ? AND active = 1",
      [input.coupon_code.toUpperCase()]
    );
    if (!coupon) return { error: "That coupon code is not valid." };
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return { error: "That coupon has expired." };
    if (subtotal < Number(coupon.min_spend)) return { error: `This coupon needs a minimum spend of NPR ${Number(coupon.min_spend).toLocaleString("en-IN")}.` };
    discount = coupon.type === "percent" ? Math.round((subtotal * Number(coupon.value)) / 100) : Number(coupon.value);
    discount = Math.min(discount, subtotal);
    couponCode = coupon.code;
  }

  const total = subtotal - discount;

  let reference = bookingReference();
  for (let i = 0; i < 5; i++) {
    const exists = await q1<{ id: number }>("SELECT id FROM bookings WHERE reference = ?", [reference]);
    if (!exists) break;
    reference = bookingReference();
  }

  const session = await getSession();

  await exec(
    `INSERT INTO bookings
      (reference, user_id, trip_id, departure_id, full_name, email, phone, nationality, travelers, start_date, addons,
       subtotal, discount, total, currency, coupon_code, special_requests, status, payment_status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'NPR', ?,?, 'pending', 'unpaid')`,
    [
      reference,
      session?.id ?? null,
      trip.id,
      input.departure_id ?? null,
      input.full_name,
      input.email,
      input.phone,
      input.nationality,
      input.travelers,
      startDate,
      JSON.stringify(addons),
      subtotal,
      discount,
      total,
      couponCode,
      input.special_requests ?? null,
    ]
  );

  if (couponCode) {
    await exec("UPDATE coupons SET used_count = used_count + 1 WHERE code = ?", [couponCode]);
  }

  const booking = await q1<{ id: number }>("SELECT id FROM bookings WHERE reference = ?", [reference]);
  if (booking && session) {
    await exec("INSERT INTO notifications (user_id, title, message, link) VALUES (?,?,?,?)", [
      session.id,
      "Booking started",
      `Your booking ${reference} for ${trip.title} is awaiting payment.`,
      `/booking/${reference}`,
    ]);
  }
  await exec("INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)", [
    session?.id ?? null,
    "create",
    "booking",
    booking?.id ?? null,
    `Booking ${reference} created for ${trip.title} (${input.email}, NPR ${total})`,
  ]);

  revalidatePath("/dashboard/bookings");
  redirect(`/checkout/${reference}`);
}

export async function payBookingAction(_prev: BookingState, formData: FormData): Promise<BookingState> {
  const reference = String(formData.get("reference") || "").trim();
  const method = String(formData.get("method") || "").trim();
  if (!["esewa", "khalti", "card", "bank", "cash"].includes(method)) return { error: "Choose a payment method." };

  const booking = await q1<{ id: number; user_id: number | null; departure_id: number | null; travelers: number; total: string; status: string; payment_status: string; email: string }>(
    "SELECT id, user_id, departure_id, travelers, total, status, payment_status, email FROM bookings WHERE reference = ?",
    [reference]
  );
  if (!booking) return { error: "Booking not found." };
  if (booking.status === "cancelled") return { error: "This booking has been cancelled. Please start a new booking." };
  if (booking.payment_status === "paid") redirect(`/booking/${reference}`);

  if (booking.departure_id) {
    const seats = await q1<{ seats_total: number; seats_booked: number }>(
      "SELECT seats_total, seats_booked FROM trip_departures WHERE id = ?",
      [booking.departure_id]
    );
    if (!seats || seats.seats_booked + booking.travelers > seats.seats_total) {
      return { error: "That departure just sold out. Please contact us to move your booking to another date." };
    }
    await exec("UPDATE trip_departures SET seats_booked = seats_booked + ? WHERE id = ?", [booking.travelers, booking.departure_id]);
    await exec("UPDATE trip_departures SET status = 'full' WHERE id = ? AND seats_booked >= seats_total", [booking.departure_id]);
  }

  const txn = `DEMO-${Date.now().toString(36).toUpperCase()}`;
  await exec(
    "INSERT INTO payments (booking_id, method, amount, transaction_ref, status, paid_at) VALUES (?,?,?,?, 'success', NOW())",
    [booking.id, method, booking.total, txn]
  );
  await exec(
    "UPDATE bookings SET status = 'confirmed', payment_status = 'paid', payment_method = ? WHERE id = ?",
    [method, booking.id]
  );

  if (booking.user_id) {
    await exec("INSERT INTO notifications (user_id, title, message, link) VALUES (?,?,?,?)", [
      booking.user_id,
      "Booking confirmed",
      `We received your payment. Booking ${reference} is confirmed — see you in Nepal.`,
      `/booking/${reference}`,
    ]);
  }
  await exec("INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)", [
    booking.user_id,
    "payment",
    "booking",
    booking.id,
    `Payment ${txn} via ${method} for ${reference} (NPR ${booking.total})`,
  ]);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/bookings");
  redirect(`/booking/${reference}?paid=1`);
}

export async function cancelBookingAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const reference = String(formData.get("reference") || "");
  const booking = await q1<{ id: number; status: string; payment_status: string }>(
    "SELECT id, status, payment_status FROM bookings WHERE reference = ? AND user_id = ?",
    [reference, session.id]
  );
  if (!booking || booking.status === "completed" || booking.status === "cancelled") {
    redirect("/dashboard/bookings");
  }
  if (booking.payment_status === "paid") {
    redirect("/contact?subject=Cancel%20booking%20" + encodeURIComponent(reference));
  }
  await exec("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [booking.id]);
  await exec("INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)", [
    session.id,
    "cancel",
    "booking",
    booking.id,
    `Booking ${reference} cancelled by traveller`,
  ]);
  revalidatePath("/dashboard/bookings");
  redirect("/dashboard/bookings");
}
