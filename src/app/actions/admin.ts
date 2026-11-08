"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exec, q, q1 } from "@/lib/db";
import { requireAdmin } from "@/lib/guards";
import { slugify } from "@/lib/utils";

export type AdminState = { error?: string; ok?: boolean; message?: string };

function lines(value: FormDataEntryValue | null): string[] {
  return String(value ?? "")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function log(action: string, entity: string, entityId: number | null, details: string) {
  const admin = await requireAdmin();
  await exec("INSERT INTO activity_logs (user_id, action, entity, entity_id, details) VALUES (?,?,?,?,?)", [
    admin.id, action, entity, entityId, details,
  ]);
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/tours");
  revalidatePath("/trekking");
  revalidatePath("/destinations");
  revalidatePath("/stories");
}

/* ------------------------------ trips ------------------------------ */

const tripSchema = z.object({
  id: z.coerce.number().int().positive().optional(),
  title: z.string().trim().min(4, "Title is required.").max(180),
  slug: z.string().trim().max(200).optional(),
  destination_id: z.coerce.number().int().positive().optional(),
  category: z.enum(["trekking", "tour", "adventure", "cultural", "wildlife", "wellness", "honeymoon"]),
  summary: z.string().trim().max(1000).optional(),
  description: z.string().trim().max(20000).optional(),
  duration_days: z.coerce.number().int().min(1).max(60),
  difficulty: z.enum(["easy", "moderate", "challenging", "strenuous"]),
  max_altitude: z.coerce.number().int().positive().optional(),
  group_size: z.coerce.number().int().min(1).max(50),
  price: z.coerce.number().positive("Price is required."),
  sale_price: z.coerce.number().positive().optional(),
  hero_image: z.string().trim().max(255).optional(),
  best_season: z.string().trim().max(120).optional(),
  departure_city: z.string().trim().min(2).max(80),
  permit_info: z.string().trim().max(2000).optional(),
  status: z.enum(["draft", "published"]),
});

export async function saveTripAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = {
    id: formData.get("id") || undefined,
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    destination_id: formData.get("destination_id") || undefined,
    category: formData.get("category"),
    summary: formData.get("summary") || undefined,
    description: formData.get("description") || undefined,
    duration_days: formData.get("duration_days"),
    difficulty: formData.get("difficulty"),
    max_altitude: formData.get("max_altitude") || undefined,
    group_size: formData.get("group_size"),
    price: formData.get("price"),
    sale_price: formData.get("sale_price") || undefined,
    hero_image: formData.get("hero_image") || undefined,
    best_season: formData.get("best_season") || undefined,
    departure_city: formData.get("departure_city") || "Kathmandu",
    permit_info: formData.get("permit_info") || undefined,
    status: formData.get("status") || "draft",
  };
  const parsed = tripSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  const slug = slugify(d.slug || d.title);
  const featured = formData.get("featured") === "1" ? 1 : 0;
  const gallery = JSON.stringify(lines(formData.get("gallery")));
  const highlights = JSON.stringify(lines(formData.get("highlights")));
  const inclusions = JSON.stringify(lines(formData.get("inclusions")));
  const exclusions = JSON.stringify(lines(formData.get("exclusions")));

  const duplicate = await q1<{ id: number }>("SELECT id FROM trips WHERE slug = ? AND id <> ?", [slug, d.id ?? 0]);
  if (duplicate) return { error: "That slug is already used by another trip." };

  if (d.id) {
    await exec(
      `UPDATE trips SET destination_id=?, title=?, slug=?, category=?, summary=?, description=?, duration_days=?, difficulty=?,
        max_altitude=?, group_size=?, price=?, sale_price=?, hero_image=?, gallery=?, highlights=?, inclusions=?, exclusions=?,
        best_season=?, departure_city=?, permit_info=?, status=?, featured=? WHERE id=?`,
      [
        d.destination_id ?? null, d.title, slug, d.category, d.summary ?? null, d.description ?? null, d.duration_days, d.difficulty,
        d.max_altitude ?? null, d.group_size, d.price, d.sale_price ?? null, d.hero_image ?? null, gallery, highlights, inclusions, exclusions,
        d.best_season ?? null, d.departure_city, d.permit_info ?? null, d.status, featured, d.id,
      ]
    );
    await log("update", "trip", d.id, `Updated trip ${d.title}`);
    revalidateAll();
    revalidatePath(`/admin/trips/${d.id}`);
    redirect(`/admin/trips/${d.id}?saved=1`);
  }

  const result = await exec(
    `INSERT INTO trips (destination_id, title, slug, category, summary, description, duration_days, difficulty, max_altitude, group_size,
      price, sale_price, hero_image, gallery, highlights, inclusions, exclusions, best_season, departure_city, permit_info, status, featured)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      d.destination_id ?? null, d.title, slug, d.category, d.summary ?? null, d.description ?? null, d.duration_days, d.difficulty,
      d.max_altitude ?? null, d.group_size, d.price, d.sale_price ?? null, d.hero_image ?? null, gallery, highlights, inclusions, exclusions,
      d.best_season ?? null, d.departure_city, d.permit_info ?? null, d.status, featured,
    ]
  );
  await log("create", "trip", result.insertId, `Created trip ${d.title}`);
  revalidateAll();
  redirect(`/admin/trips/${result.insertId}?created=1`);
}

export async function toggleTripStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = formData.get("status") === "published" ? "draft" : "published";
  await exec("UPDATE trips SET status = ? WHERE id = ?", [status, id]);
  await log("update", "trip", id, `Trip set to ${status}`);
  revalidateAll();
  revalidatePath("/admin/trips");
}

export async function deleteTripAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const bookings = await q1<{ n: number }>("SELECT COUNT(*) AS n FROM bookings WHERE trip_id = ?", [id]);
  if (Number(bookings?.n ?? 0) > 0) redirect("/admin/trips?error=has-bookings");
  await exec("DELETE FROM trips WHERE id = ?", [id]);
  await log("delete", "trip", id, "Deleted trip");
  revalidateAll();
  redirect("/admin/trips");
}

export async function saveTripDaysAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const tripId = Number(formData.get("trip_id"));
  if (!tripId) return { error: "Trip not found." };
  const titles = formData.getAll("day_title").map(String);
  const descriptions = formData.getAll("day_description").map(String);
  const accommodations = formData.getAll("day_accommodation").map(String);
  const meals = formData.getAll("day_meals").map(String);
  const altitudes = formData.getAll("day_altitude").map(String);

  const rows = titles
    .map((title, i) => ({
      day: i + 1,
      title: title.trim(),
      description: descriptions[i]?.trim() ?? "",
      accommodation: accommodations[i]?.trim() ?? "",
      meals: meals[i]?.trim() ?? "",
      altitude: altitudes[i]?.trim() ?? "",
    }))
    .filter((r) => r.title.length > 0);

  await exec("DELETE FROM trip_days WHERE trip_id = ?", [tripId]);
  for (const r of rows) {
    await exec(
      "INSERT INTO trip_days (trip_id, day_number, title, description, accommodation, meals, altitude) VALUES (?,?,?,?,?,?,?)",
      [tripId, r.day, r.title, r.description || null, r.accommodation || null, r.meals || null, r.altitude || null]
    );
  }
  await log("update", "trip", tripId, `Saved ${rows.length}-day itinerary`);
  revalidateAll();
  revalidatePath(`/admin/trips/${tripId}`);
  return { ok: true, message: `Itinerary saved (${rows.length} days).` };
}

/* -------------------------- destinations -------------------------- */

export async function saveDestinationAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Destination name is required." };
  const slug = slugify(String(formData.get("slug") ?? "") || name);
  const fields = [
    String(formData.get("region") ?? "Nepal").trim() || "Nepal",
    String(formData.get("province") ?? "").trim() || null,
    String(formData.get("tagline") ?? "").trim() || null,
    String(formData.get("summary") ?? "").trim() || null,
    String(formData.get("description") ?? "").trim() || null,
    String(formData.get("hero_image") ?? "").trim() || null,
    String(formData.get("thumbnail") ?? "").trim() || null,
    String(formData.get("altitude") ?? "").trim() || null,
    String(formData.get("best_season") ?? "").trim() || null,
    formData.get("featured") === "1" ? 1 : 0,
    Number(formData.get("sort_order")) || 0,
    formData.get("status") === "hidden" ? "hidden" : "active",
  ];

  const dup = await q1<{ id: number }>("SELECT id FROM destinations WHERE slug = ? AND id <> ?", [slug, id]);
  if (dup) return { error: "That slug is already used." };

  if (id) {
    await exec(
      `UPDATE destinations SET name=?, slug=?, region=?, province=?, tagline=?, summary=?, description=?, hero_image=?, thumbnail=?,
       altitude=?, best_season=?, featured=?, sort_order=?, status=? WHERE id=?`,
      [name, slug, ...fields, id]
    );
    await log("update", "destination", id, `Updated destination ${name}`);
  } else {
    const result = await exec(
      `INSERT INTO destinations (name, slug, region, province, tagline, summary, description, hero_image, thumbnail, altitude, best_season, featured, sort_order, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [name, slug, ...fields]
    );
    await log("create", "destination", result.insertId, `Created destination ${name}`);
  }
  revalidateAll();
  redirect("/admin/destinations?saved=1");
}

export async function deleteDestinationAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM destinations WHERE id = ?", [id]);
  await log("delete", "destination", id, "Deleted destination");
  revalidateAll();
  revalidatePath("/admin/destinations");
  redirect("/admin/destinations");
}

/* --------------------------- departures --------------------------- */

export async function saveDepartureAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const tripId = Number(formData.get("trip_id"));
  const start = String(formData.get("start_date") ?? "");
  const end = String(formData.get("end_date") ?? "");
  const seats = Number(formData.get("seats_total")) || 12;
  const price = formData.get("price") ? Number(formData.get("price")) : null;
  const status = String(formData.get("status") ?? "open");
  if (!tripId || !start || !end) return { error: "Trip, start date and end date are required." };
  if (new Date(end) < new Date(start)) return { error: "End date must be after the start date." };

  try {
    if (id) {
      await exec("UPDATE trip_departures SET start_date=?, end_date=?, seats_total=?, price=?, status=? WHERE id=?", [start, end, seats, price, status, id]);
      await log("update", "departure", id, `Updated departure ${start}`);
    } else {
      const result = await exec(
        "INSERT INTO trip_departures (trip_id, start_date, end_date, seats_total, price, status) VALUES (?,?,?,?,?,?)",
        [tripId, start, end, seats, price, status]
      );
      await log("create", "departure", result.insertId, `Created departure ${start}`);
    }
  } catch {
    return { error: "A departure already exists for that trip and date." };
  }
  revalidatePath("/admin/departures");
  revalidatePath("/tours");
  return { ok: true, message: "Departure saved." };
}

export async function deleteDepartureAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM trip_departures WHERE id = ?", [id]);
  await log("delete", "departure", id, "Deleted departure");
  revalidatePath("/admin/departures");
  revalidatePath("/tours");
}

/* ---------------------------- bookings ---------------------------- */

export async function updateBookingAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "pending");
  const paymentStatus = String(formData.get("payment_status") ?? "unpaid");
  const method = String(formData.get("payment_method") ?? "") || null;
  const note = String(formData.get("admin_note") ?? "").trim();

  const booking = await q1<{ id: number; reference: string; user_id: number | null; departure_id: number | null; travelers: number; total: string; status: string; payment_status: string; email: string }>(
    "SELECT id, reference, user_id, departure_id, travelers, total, status, payment_status, email FROM bookings WHERE id = ?",
    [id]
  );
  if (!booking) return { error: "Booking not found." };

  await exec("UPDATE bookings SET status=?, payment_status=?, payment_method=? WHERE id=?", [status, paymentStatus, method, id]);

  if (booking.departure_id) {
    const wasActive = booking.status === "confirmed" || booking.status === "completed";
    const willBeActive = status === "confirmed" || status === "completed";
    if (!wasActive && willBeActive) {
      await exec("UPDATE trip_departures SET seats_booked = seats_booked + ? WHERE id = ?", [booking.travelers, booking.departure_id]);
      await exec("UPDATE trip_departures SET status='full' WHERE id = ? AND seats_booked >= seats_total", [booking.departure_id]);
    } else if (wasActive && !willBeActive) {
      await exec("UPDATE trip_departures SET seats_booked = GREATEST(seats_booked - ?, 0) WHERE id = ?", [booking.travelers, booking.departure_id]);
      await exec("UPDATE trip_departures SET status='open' WHERE id = ? AND status='full' AND seats_booked < seats_total", [booking.departure_id]);
    }
  }

  if (paymentStatus === "paid" && booking.payment_status !== "paid") {
    const existing = await q1<{ id: number }>("SELECT id FROM payments WHERE booking_id = ? AND status='success'", [id]);
    if (!existing) {
      await exec(
        "INSERT INTO payments (booking_id, method, amount, transaction_ref, status, paid_at) VALUES (?,?,?,?, 'success', NOW())",
        [id, ["esewa", "khalti", "card", "bank", "cash"].includes(method ?? "") ? method : "bank", booking.total, `ADMIN-${booking.reference}`]
      );
    }
  }

  if (booking.user_id) {
    await exec("INSERT INTO notifications (user_id, title, message, link) VALUES (?,?,?,?)", [
      booking.user_id,
      `Booking ${booking.reference} updated`,
      note || `Your booking status is now ${status} and payment is ${paymentStatus}.`,
      `/booking/${booking.reference}`,
    ]);
  }
  await log("update", "booking", id, `Booking ${booking.reference}: ${status}/${paymentStatus}`);
  revalidatePath("/admin/bookings");
  revalidatePath("/dashboard/bookings");
  return { ok: true, message: "Booking updated." };
}

/* ------------------------------ users ------------------------------ */

export async function updateUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = Number(formData.get("id"));
  const role = formData.get("role") === "admin" ? "admin" : "user";
  const status = formData.get("status") === "blocked" ? "blocked" : "active";
  if (id === admin.id) redirect("/admin/users?error=self");
  await exec("UPDATE users SET role=?, status=? WHERE id=?", [role, status, id]);
  await log("update", "user", id, `Role ${role}, status ${status}`);
  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

/* ----------------------------- stories ----------------------------- */

export async function saveStoryAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 4) return { error: "Story title is required." };
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const status = formData.get("status") === "draft" ? "draft" : "published";
  const dup = await q1<{ id: number }>("SELECT id FROM stories WHERE slug = ? AND id <> ?", [slug, id]);
  if (dup) return { error: "That slug is already used by another story." };
  const values = [
    String(formData.get("destination_id") ?? "") ? Number(formData.get("destination_id")) : null,
    title,
    slug,
    String(formData.get("excerpt") ?? "").trim() || null,
    String(formData.get("body") ?? "").trim() || null,
    String(formData.get("cover_image") ?? "").trim() || null,
    String(formData.get("author_name") ?? "Nepal Travel Editorial").trim(),
    String(formData.get("author_role") ?? "").trim() || null,
    String(formData.get("category") ?? "Travel Story").trim(),
    Number(formData.get("read_time")) || 5,
    status,
  ];
  if (id) {
    await exec(
      `UPDATE stories SET destination_id=?, title=?, slug=?, excerpt=?, body=?, cover_image=?, author_name=?, author_role=?, category=?, read_time=?, status=?,
       published_at = IF(? = 'published' AND published_at IS NULL, NOW(), published_at) WHERE id=?`,
      [...values, status, id]
    );
    await log("update", "story", id, `Updated story ${title}`);
  } else {
    const result = await exec(
      `INSERT INTO stories (destination_id, title, slug, excerpt, body, cover_image, author_name, author_role, category, read_time, status, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?, IF(? = 'published', NOW(), NULL))`,
      [...values, status]
    );
    await log("create", "story", result.insertId, `Created story ${title}`);
  }
  revalidateAll();
  redirect("/admin/stories?saved=1");
}

export async function deleteStoryAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM stories WHERE id = ?", [id]);
  await log("delete", "story", id, "Deleted story");
  revalidateAll();
  revalidatePath("/admin/stories");
  redirect("/admin/stories");
}

/* --------------------------- moderation --------------------------- */

export async function moderateReviewAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (action === "delete") await exec("DELETE FROM reviews WHERE id = ?", [id]);
  else await exec("UPDATE reviews SET status = ? WHERE id = ?", [action === "approve" ? "approved" : "rejected", id]);
  const review = await q1<{ trip_id: number; status: string }>("SELECT trip_id, status FROM reviews WHERE id = ?", [id]);
  if (review && action !== "delete") {
    const agg = await q1<{ avg: string | null; n: number }>("SELECT AVG(rating) AS avg, COUNT(*) AS n FROM reviews WHERE trip_id = ? AND status='approved'", [review.trip_id]);
    await exec("UPDATE trips SET rating = ?, review_count = ? WHERE id = ?", [Number(agg?.avg ?? 5).toFixed(1), Number(agg?.n ?? 0), review.trip_id]);
  }
  await log(action, "review", id, `Review ${action}`);
  revalidatePath("/admin/reviews");
  revalidatePath("/tours");
}

export async function moderatePostAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const action = String(formData.get("action"));
  if (action === "delete") await exec("DELETE FROM posts WHERE id = ?", [id]);
  else await exec("UPDATE posts SET status = ? WHERE id = ?", [action === "hide" ? "hidden" : "published", id]);
  await log(action, "post", id, `Community post ${action}`);
  revalidatePath("/admin/community");
  revalidatePath("/community");
}

export async function setInquiryStatusAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "read");
  await exec("UPDATE inquiries SET status = ? WHERE id = ?", [status, id]);
  await log("update", "inquiry", id, `Inquiry status ${status}`);
  revalidatePath("/admin/inquiries");
}

/* ---------------------------- coupons ---------------------------- */

export async function saveCouponAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (code.length < 3) return { error: "Coupon code must be at least 3 characters." };
  const type = formData.get("type") === "fixed" ? "fixed" : "percent";
  const value = Number(formData.get("value"));
  if (!value || value <= 0) return { error: "Enter a discount value." };
  if (type === "percent" && value > 100) return { error: "Percentage discount cannot exceed 100." };
  const values = [
    type, value,
    Number(formData.get("min_spend")) || 0,
    Number(formData.get("max_uses")) || 100,
    String(formData.get("expires_at") ?? "") || null,
    formData.get("active") === "1" ? 1 : 0,
  ];
  try {
    if (id) {
      await exec("UPDATE coupons SET code=?, type=?, value=?, min_spend=?, max_uses=?, expires_at=?, active=? WHERE id=?", [code, ...values, id]);
    } else {
      await exec("INSERT INTO coupons (code, type, value, min_spend, max_uses, expires_at, active) VALUES (?,?,?,?,?,?,?)", [code, ...values]);
    }
  } catch {
    return { error: "That coupon code already exists." };
  }
  await log("update", "coupon", id || null, `Saved coupon ${code}`);
  revalidatePath("/admin/coupons");
  return { ok: true, message: "Coupon saved." };
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM coupons WHERE id = ?", [id]);
  await log("delete", "coupon", id, "Deleted coupon");
  revalidatePath("/admin/coupons");
}

/* ------------------------- faqs & testimonials ------------------------- */

export async function saveFaqAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const question = String(formData.get("question") ?? "").trim();
  const answer = String(formData.get("answer") ?? "").trim();
  if (question.length < 5 || answer.length < 5) return { error: "Question and answer are required." };
  const values = [question, answer, String(formData.get("category") ?? "general").trim(), Number(formData.get("sort_order")) || 0, formData.get("active") === "1" ? 1 : 0];
  if (id) await exec("UPDATE faqs SET question=?, answer=?, category=?, sort_order=?, active=? WHERE id=?", [...values, id]);
  else await exec("INSERT INTO faqs (question, answer, category, sort_order, active) VALUES (?,?,?,?,?)", values);
  await log("update", "faq", id || null, "Saved FAQ");
  revalidatePath("/admin/content");
  revalidatePath("/faq");
  return { ok: true, message: "FAQ saved." };
}

export async function deleteFaqAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM faqs WHERE id = ?", [id]);
  revalidatePath("/admin/content");
  revalidatePath("/faq");
}

export async function saveTestimonialAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const id = Number(formData.get("id")) || 0;
  const name = String(formData.get("name") ?? "").trim();
  const quote = String(formData.get("quote") ?? "").trim();
  if (name.length < 2 || quote.length < 10) return { error: "Name and quote are required." };
  const values = [
    name,
    String(formData.get("location") ?? "").trim() || null,
    quote,
    Math.min(5, Math.max(1, Number(formData.get("rating")) || 5)),
    String(formData.get("trip_title") ?? "").trim() || null,
    formData.get("active") === "1" ? 1 : 0,
  ];
  if (id) await exec("UPDATE testimonials SET name=?, location=?, quote=?, rating=?, trip_title=?, active=? WHERE id=?", [...values, id]);
  else await exec("INSERT INTO testimonials (name, location, quote, rating, trip_title, active) VALUES (?,?,?,?,?,?)", values);
  revalidatePath("/admin/content");
  revalidatePath("/");
  return { ok: true, message: "Testimonial saved." };
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM testimonials WHERE id = ?", [id]);
  revalidatePath("/admin/content");
  revalidatePath("/");
}

/* ---------------------------- settings ---------------------------- */

export async function saveSettingsAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  let count = 0;
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("setting__")) continue;
    const settingKey = key.replace("setting__", "");
    await exec(
      "INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
      [settingKey, String(value)]
    );
    count++;
  }
  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, message: `${count} settings saved.` };
}

/* -------------------------- newsletter -------------------------- */

export async function deleteSubscriberAction(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  await exec("DELETE FROM newsletter_subscribers WHERE id = ?", [id]);
  revalidatePath("/admin/newsletter");
}

export async function bulkImportDeparturesAction(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const tripId = Number(formData.get("trip_id"));
  const raw = String(formData.get("rows") ?? "").trim();
  if (!tripId || !raw) return { error: "Choose a trip and paste at least one row." };
  const rows = raw.split(/\r?\n/).map((line) => line.split(",").map((c) => c.trim())).filter((c) => c[0]);
  let created = 0;
  for (const [start, end, seats, price] of rows) {
    if (!start || !end) continue;
    try {
      await exec(
        "INSERT INTO trip_departures (trip_id, start_date, end_date, seats_total, price, status) VALUES (?,?,?,?,?, 'open')",
        [tripId, start, end, Number(seats) || 12, price ? Number(price) : null]
      );
      created++;
    } catch {
      // skip duplicates or invalid dates
    }
  }
  await log("create", "departure", null, `Bulk imported ${created} departures`);
  revalidatePath("/admin/departures");
  return { ok: true, message: `${created} departures imported.` };
}
