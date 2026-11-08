import { cache } from "react";
import { q, q1, parseJson } from "./db";
import type { AdminStats, Booking, Destination, Departure, Post, Review, Story, Trip, TripDay } from "@/types";

export type AdminDestinationRow = Destination & { trip_count: number };
export type AdminTripRow = Trip & { destination_name: string | null; day_count: number; booking_count: number };
export type AdminDepartureRow = Departure & { trip_title: string; trip_slug: string; booking_count: number };
export type AdminUserRow = {
  id: number;
  name: string;
  email: string;
  username: string | null;
  phone: string | null;
  country: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  created_at: string;
  booking_count: number;
  spend: string;
};
export type AdminPostRow = Post & { author_name: string; destination_name: string | null; comment_count: number; like_count: number };
export type AdminReviewRow = Review & { trip_title: string; trip_slug: string };
export type Coupon = {
  id: number;
  code: string;
  type: "percent" | "fixed";
  value: string;
  min_spend: string;
  max_uses: number;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  active: number;
  created_at: string;
};
export type Inquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: "new" | "read" | "replied" | "closed";
  created_at: string;
};
export type Faq = { id: number; question: string; answer: string; category: string; sort_order: number; active: number };
export type Testimonial = {
  id: number;
  name: string;
  location: string | null;
  quote: string;
  rating: number;
  trip_title: string | null;
  active: number;
};
export type AdminPayment = {
  id: number;
  booking_id: number;
  method: string;
  amount: string;
  transaction_ref: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
};

export const getAdminStats = cache(async (): Promise<AdminStats> => {
  const base = await q1<{
    revenue: string | null; bookings: number; pending: number; travellers: number; users: number; trips: number; reviewsPending: number; inquiriesNew: number;
  }>(
    `SELECT (SELECT COALESCE(SUM(total),0) FROM bookings WHERE payment_status='paid') AS revenue,
            (SELECT COUNT(*) FROM bookings) AS bookings,
            (SELECT COUNT(*) FROM bookings WHERE status='pending') AS pending,
            (SELECT COALESCE(SUM(travelers),0) FROM bookings WHERE status <> 'cancelled') AS travellers,
            (SELECT COUNT(*) FROM users WHERE role='user') AS users,
            (SELECT COUNT(*) FROM trips) AS trips,
            (SELECT COUNT(*) FROM reviews WHERE status='pending') AS reviewsPending,
            (SELECT COUNT(*) FROM inquiries WHERE status='new') AS inquiriesNew`
  );

  const [revenueByMonth, bookingsByStatus, topTrips] = await Promise.all([
    q<{ month: string; revenue: string }>(
      `SELECT DATE_FORMAT(created_at, '%b') AS month, YEAR(created_at) AS y, MONTH(created_at) AS m, COALESCE(SUM(total),0) AS revenue
       FROM bookings WHERE payment_status='paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY y, m, month ORDER BY y, m`
    ),
    q<{ status: string; count: number }>("SELECT status, COUNT(*) AS count FROM bookings GROUP BY status"),
    q<{ title: string; bookings: number; revenue: string }>(
      `SELECT t.title, COUNT(b.id) AS bookings, COALESCE(SUM(b.total),0) AS revenue
       FROM bookings b JOIN trips t ON t.id = b.trip_id
       WHERE b.status <> 'cancelled' GROUP BY t.id, t.title ORDER BY revenue DESC LIMIT 5`
    ),
  ]);

  return {
    revenue: Number(base?.revenue ?? 0),
    bookings: Number(base?.bookings ?? 0),
    pending: Number(base?.pending ?? 0),
    travellers: Number(base?.travellers ?? 0),
    users: Number(base?.users ?? 0),
    trips: Number(base?.trips ?? 0),
    reviewsPending: Number(base?.reviewsPending ?? 0),
    inquiriesNew: Number(base?.inquiriesNew ?? 0),
    revenueByMonth: revenueByMonth.map((r) => ({ month: r.month, revenue: Number(r.revenue) })),
    bookingsByStatus: bookingsByStatus.map((r) => ({ status: r.status, count: Number(r.count) })),
    topTrips: topTrips.map((r) => ({ title: r.title, bookings: Number(r.bookings), revenue: Number(r.revenue) })),
  };
});

export const getAdminBookings = cache(async (filters: { status?: string; q?: string } = {}) => {
  const where: string[] = [];
  const params: unknown[] = [];
  if (filters.status) {
    where.push("b.status = ?");
    params.push(filters.status);
  }
  if (filters.q) {
    where.push("(b.reference LIKE ? OR b.full_name LIKE ? OR b.email LIKE ? OR t.title LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  return q<Booking>(
    `SELECT b.*, t.title AS trip_title, t.slug AS trip_slug, t.hero_image AS trip_image
     FROM bookings b JOIN trips t ON t.id = b.trip_id
     ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
     ORDER BY b.created_at DESC LIMIT 200`,
    params
  );
});

export const getAdminBooking = cache(async (id: number) => {
  const booking = await q1<
    Booking & {
      trip_title: string;
      trip_slug: string;
      trip_image: string | null;
      duration_days: number;
      difficulty: string;
      departure_start: string | null;
      departure_end: string | null;
    }
  >(
    `SELECT b.*, t.title AS trip_title, t.slug AS trip_slug, t.hero_image AS trip_image, t.duration_days, t.difficulty,
       dp.start_date AS departure_start, dp.end_date AS departure_end
     FROM bookings b
     JOIN trips t ON t.id = b.trip_id
     LEFT JOIN trip_departures dp ON dp.id = b.departure_id
     WHERE b.id = ?`,
    [id]
  );
  if (!booking) return null;
  const payments = await q<AdminPayment>("SELECT * FROM payments WHERE booking_id = ? ORDER BY created_at DESC", [id]);
  return { booking: { ...booking, addons: parseJson<{ name: string; price: number }[]>(booking.addons, []) }, payments };
});

export const getAdminTrips = cache(async (): Promise<AdminTripRow[]> => {
  return q<AdminTripRow>(
    `SELECT t.*, d.name AS destination_name,
       (SELECT COUNT(*) FROM trip_days td WHERE td.trip_id = t.id) AS day_count,
       (SELECT COUNT(*) FROM bookings b WHERE b.trip_id = t.id) AS booking_count
     FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id
     ORDER BY t.updated_at DESC`
  );
});

export const getAdminTrip = cache(async (id: number) => {
  const trip = await q1<Trip & { destination_name: string | null }>(
    `SELECT t.*, d.name AS destination_name FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id WHERE t.id = ?`,
    [id]
  );
  if (!trip) return null;
  const [days, departures] = await Promise.all([
    q<TripDay>("SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number", [id]),
    q<Departure>("SELECT * FROM trip_departures WHERE trip_id = ? ORDER BY start_date DESC", [id]),
  ]);
  return {
    trip: {
      ...trip,
      gallery: parseJson<string[]>(trip.gallery, []),
      highlights: parseJson<string[]>(trip.highlights, []),
      inclusions: parseJson<string[]>(trip.inclusions, []),
      exclusions: parseJson<string[]>(trip.exclusions, []),
    },
    days,
    departures,
  };
});

export const getAdminDestinations = cache(async (): Promise<AdminDestinationRow[]> => {
  return q<AdminDestinationRow>(
    `SELECT d.*, (SELECT COUNT(*) FROM trips t WHERE t.destination_id = d.id) AS trip_count
     FROM destinations d ORDER BY d.sort_order, d.name`
  );
});

export const getAdminDepartures = cache(async (): Promise<AdminDepartureRow[]> => {
  return q<AdminDepartureRow>(
    `SELECT dp.*, t.title AS trip_title, t.slug AS trip_slug,
       (SELECT COUNT(*) FROM bookings b WHERE b.departure_id = dp.id) AS booking_count
     FROM trip_departures dp JOIN trips t ON t.id = dp.trip_id
     WHERE dp.start_date >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
     ORDER BY dp.start_date ASC LIMIT 200`
  );
});

export const getAdminUsers = cache(async (): Promise<AdminUserRow[]> => {
  return q<AdminUserRow>(
    `SELECT u.id, u.name, u.email, u.username, u.phone, u.country, u.role, u.status, u.created_at,
       (SELECT COUNT(*) FROM bookings b WHERE b.user_id = u.id) AS booking_count,
       (SELECT COALESCE(SUM(b.total),0) FROM bookings b WHERE b.user_id = u.id AND b.payment_status='paid') AS spend
     FROM users u ORDER BY u.created_at DESC LIMIT 300`
  );
});

export const getAdminStories = cache(async (): Promise<Story[]> => {
  return q<Story>("SELECT * FROM stories ORDER BY created_at DESC");
});

export const getAdminStory = cache(async (id: number) => {
  return q1<Story>("SELECT * FROM stories WHERE id = ?", [id]);
});

export const getAdminReviews = cache(async (): Promise<AdminReviewRow[]> => {
  return q<AdminReviewRow>(
    `SELECT r.*, t.title AS trip_title, t.slug AS trip_slug FROM reviews r JOIN trips t ON t.id = r.trip_id ORDER BY r.created_at DESC LIMIT 200`
  );
});

export const getAdminPosts = cache(async (): Promise<AdminPostRow[]> => {
  return q<AdminPostRow>(
    `SELECT p.*, u.name AS author_name, d.name AS destination_name,
       (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comment_count,
       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count
     FROM posts p JOIN users u ON u.id = p.user_id LEFT JOIN destinations d ON d.id = p.destination_id
     ORDER BY p.created_at DESC LIMIT 200`
  );
});

export const getAdminCoupons = cache(async (): Promise<Coupon[]> => {
  return q<Coupon>("SELECT * FROM coupons ORDER BY created_at DESC");
});

export const getAdminInquiries = cache(async (): Promise<Inquiry[]> => {
  return q<Inquiry>("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200");
});

export const getAdminFaqs = cache(async (): Promise<Faq[]> => {
  return q<Faq>("SELECT * FROM faqs ORDER BY sort_order, id");
});

export const getAdminTestimonials = cache(async (): Promise<Testimonial[]> => {
  return q<Testimonial>("SELECT * FROM testimonials ORDER BY id DESC");
});

export const getAdminSettings = cache(async () => {
  return q<{ setting_key: string; setting_value: string | null }>("SELECT setting_key, setting_value FROM settings ORDER BY setting_key");
});

export const getAdminActivity = cache(async () => {
  return q<{ id: number; action: string; entity: string | null; entity_id: number | null; details: string | null; ip: string | null; created_at: string; name: string | null }>(
    `SELECT a.*, u.name FROM activity_logs a LEFT JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC LIMIT 100`
  );
});

export const getAdminNewsletter = cache(async () => {
  return q<{ id: number; email: string; created_at: string }>("SELECT * FROM newsletter_subscribers ORDER BY created_at DESC LIMIT 500");
});

export const getAllTripsForSelect = cache(async () => {
  return q<{ id: number; title: string }>("SELECT id, title FROM trips ORDER BY title");
});

export const getTripDaysForAdmin = cache(async (tripId: number) => {
  return q<TripDay>("SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number", [tripId]);
});
