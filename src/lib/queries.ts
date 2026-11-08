import { cache } from "react";
import { q, q1, parseJson } from "./db";
import type {
  Destination,
  Trip,
  TripDay,
  Departure,
  Review,
  Story,
  Post,
  Booking,
  Plan,
  Post as CommunityPost,
} from "@/types";

const mapTrip = (r: Record<string, unknown>): Trip => ({
  ...(r as unknown as Trip),
  gallery: parseJson<string[]>(r.gallery, []),
  highlights: parseJson<string[]>(r.highlights, []),
  inclusions: parseJson<string[]>(r.inclusions, []),
  exclusions: parseJson<string[]>(r.exclusions, []),
});

export type TripFilters = {
  q?: string;
  category?: string;
  difficulty?: string;
  destination?: string;
  minDays?: number;
  maxDays?: number;
  maxPrice?: number;
  sort?: string;
  limit?: number;
  featuredOnly?: boolean;
};

export const getTrips = cache(async (filters: TripFilters = {}): Promise<Trip[]> => {
  const where = ["t.status = 'published'"];
  const params: unknown[] = [];

  if (filters.q) {
    where.push("(t.title LIKE ? OR t.summary LIKE ? OR d.name LIKE ? OR t.description LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like, like, like);
  }
  if (filters.category) {
    where.push("t.category = ?");
    params.push(filters.category);
  }
  if (filters.difficulty) {
    where.push("t.difficulty = ?");
    params.push(filters.difficulty);
  }
  if (filters.destination) {
    where.push("d.slug = ?");
    params.push(filters.destination);
  }
  if (filters.minDays) {
    where.push("t.duration_days >= ?");
    params.push(filters.minDays);
  }
  if (filters.maxDays) {
    where.push("t.duration_days <= ?");
    params.push(filters.maxDays);
  }
  if (filters.maxPrice) {
    where.push("COALESCE(t.sale_price, t.price) <= ?");
    params.push(filters.maxPrice);
  }
  if (filters.featuredOnly) where.push("t.featured = 1");

  let order = "t.featured DESC, t.rating DESC, t.review_count DESC";
  if (filters.sort === "price-asc") order = "COALESCE(t.sale_price, t.price) ASC";
  if (filters.sort === "price-desc") order = "COALESCE(t.sale_price, t.price) DESC";
  if (filters.sort === "duration") order = "t.duration_days ASC";
  if (filters.sort === "rating") order = "t.rating DESC";
  if (filters.sort === "newest") order = "t.id DESC";

  const limit = filters.limit ? ` LIMIT ${Number(filters.limit)}` : "";
  const rows = await q<Record<string, unknown>>(
    `SELECT t.*, d.name AS destination_name, d.slug AS destination_slug, d.region AS destination_region
     FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id
     WHERE ${where.join(" AND ")} ORDER BY ${order}${limit}`,
    params
  );
  return rows.map(mapTrip);
});

export const getDestinations = cache(async (featuredOnly = false): Promise<Destination[]> => {
  const rows = await q<Destination>(
    `SELECT * FROM destinations WHERE status = 'active' ${featuredOnly ? "AND featured = 1" : ""} ORDER BY sort_order, name`
  );
  return rows;
});

export const getDestinationBySlug = cache(async (slug: string) => {
  const destination = await q1<Destination>("SELECT * FROM destinations WHERE slug = ? AND status = 'active'", [slug]);
  if (!destination) return null;
  const trips = await getTrips({ destination: slug });
  return { destination, trips };
});

export const getTripBySlug = cache(async (slug: string) => {
  const row = await q1<Record<string, unknown>>(
    `SELECT t.*, d.name AS destination_name, d.slug AS destination_slug, d.region AS destination_region,
       d.best_season AS dest_season, d.altitude AS dest_altitude
     FROM trips t LEFT JOIN destinations d ON d.id = t.destination_id
     WHERE t.slug = ? AND t.status = 'published'`,
    [slug]
  );
  if (!row) return null;
  const trip = mapTrip(row);

  const [days, departures, reviews] = await Promise.all([
    q<TripDay>("SELECT * FROM trip_days WHERE trip_id = ? ORDER BY day_number", [trip.id]),
    q<Departure>(
      `SELECT * FROM trip_departures WHERE trip_id = ? AND start_date >= CURDATE() AND status <> 'closed' ORDER BY start_date LIMIT 8`,
      [trip.id]
    ),
    q<Review>(
      `SELECT id, trip_id, user_id, name, rating, title, body, status, created_at FROM reviews
       WHERE trip_id = ? AND status = 'approved' ORDER BY created_at DESC LIMIT 8`,
      [trip.id]
    ),
  ]);

  const related = await getTrips({ category: trip.category, limit: 4 });
  return {
    trip,
    days,
    departures,
    reviews,
    related: related.filter((t) => t.id !== trip.id).slice(0, 3),
  };
});

export const getAddons = cache(async (tripId: number) => {
  return q<{ id: number; name: string; description: string | null; price: string }>(
    "SELECT id, name, description, price FROM addons WHERE active = 1 AND (trip_id IS NULL OR trip_id = ?) ORDER BY price",
    [tripId]
  );
});

export const getStories = cache(async (limit?: number): Promise<Story[]> => {
  const rows = await q<Story>(
    `SELECT s.*, d.name AS destination_name, d.slug AS destination_slug FROM stories s
     LEFT JOIN destinations d ON d.id = s.destination_id
     WHERE s.status = 'published' ORDER BY s.published_at DESC${limit ? ` LIMIT ${Number(limit)}` : ""}`
  );
  return rows;
});

export const getStoryBySlug = cache(async (slug: string) => {
  const story = await q1<Story>(
    `SELECT s.*, d.name AS destination_name, d.slug AS destination_slug FROM stories s
     LEFT JOIN destinations d ON d.id = s.destination_id
     WHERE s.slug = ? AND s.status = 'published'`,
    [slug]
  );
  if (!story) return null;
  const [comments, more] = await Promise.all([
    q<{ id: number; name: string; body: string; created_at: string }>(
      `SELECT id, name, body, created_at FROM story_comments WHERE story_id = ? AND status = 'visible' ORDER BY created_at DESC LIMIT 20`,
      [story.id]
    ),
    q<Story>(
      `SELECT s.*, d.name AS destination_name FROM stories s LEFT JOIN destinations d ON d.id = s.destination_id
       WHERE s.status = 'published' AND s.id <> ? ORDER BY s.published_at DESC LIMIT 3`,
      [story.id]
    ),
  ]);
  return { story, comments, more };
});

export const getPosts = cache(async (viewerId?: number): Promise<Post[]> => {
  const rows = await q<CommunityPost & { author_name: string; author_avatar: string | null }>(
    `SELECT p.*, u.name AS author_name, u.avatar AS author_avatar, d.name AS destination_name, d.slug AS destination_slug,
       (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS like_count,
       (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id AND pc.status = 'visible') AS comment_count,
       (SELECT COUNT(*) FROM post_likes pl2 WHERE pl2.post_id = p.id AND pl2.user_id = ?) AS liked
     FROM posts p
     JOIN users u ON u.id = p.user_id
     LEFT JOIN destinations d ON d.id = p.destination_id
     WHERE p.status = 'published'
     ORDER BY p.created_at DESC
     LIMIT 30`,
    [viewerId ?? 0]
  );
  return rows;
});

export const getPostComments = cache(async (postId: number) => {
  return q<{ id: number; body: string; created_at: string; name: string; avatar: string | null }>(
    `SELECT pc.id, pc.body, pc.created_at, u.name, u.avatar FROM post_comments pc
     JOIN users u ON u.id = pc.user_id
     WHERE pc.post_id = ? AND pc.status = 'visible' ORDER BY pc.created_at ASC`,
    [postId]
  );
});

export const getFaqs = cache(async () => {
  return q<{ id: number; question: string; answer: string; category: string }>(
    "SELECT id, question, answer, category FROM faqs WHERE active = 1 ORDER BY sort_order"
  );
});

export const getTestimonials = cache(async () => {
  return q<{ id: number; name: string; location: string; quote: string; rating: number; trip_title: string }>(
    "SELECT id, name, location, quote, rating, trip_title FROM testimonials WHERE active = 1 ORDER BY id"
  );
});

export const getSettings = cache(async () => {
  const rows = await q<{ setting_key: string; setting_value: string }>("SELECT setting_key, setting_value FROM settings");
  return Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])) as Record<string, string>;
});

export const getProfile = cache(async (userId: number) => {
  return q1<{ id: number; name: string; email: string; phone: string | null; country: string; created_at: string }>(
    "SELECT id, name, email, phone, country, created_at FROM users WHERE id = ?",
    [userId]
  );
});

export const getSavedTripIds = cache(async (userId: number) => {
  const rows = await q<{ trip_id: number }>("SELECT trip_id FROM saved_trips WHERE user_id = ?", [userId]);
  return rows.map((r) => Number(r.trip_id));
});

export const getSavedTrips = cache(async (userId: number) => {
  const rows = await q<Record<string, unknown>>(
    `SELECT t.*, d.name AS destination_name, d.slug AS destination_slug
     FROM saved_trips st JOIN trips t ON t.id = st.trip_id
     LEFT JOIN destinations d ON d.id = t.destination_id
     WHERE st.user_id = ? ORDER BY st.created_at DESC`,
    [userId]
  );
  return rows.map(mapTrip);
});

export const getUserBookings = cache(async (userId: number): Promise<Booking[]> => {
  return q<Booking>(
    `SELECT b.*, t.title AS trip_title, t.slug AS trip_slug, t.hero_image AS trip_image
     FROM bookings b JOIN trips t ON t.id = b.trip_id
     WHERE b.user_id = ? ORDER BY b.created_at DESC`,
    [userId]
  );
});

export const getBookingByReference = cache(async (reference: string) => {
  const booking = await q1<Booking>(
    `SELECT b.*, t.title AS trip_title, t.slug AS trip_slug, t.hero_image AS trip_image, t.duration_days,
       t.difficulty, t.hero_image
     FROM bookings b JOIN trips t ON t.id = b.trip_id WHERE b.reference = ?`,
    [reference]
  );
  if (!booking) return null;
  const addons = parseJson<{ name: string; price: number }[]>(booking.addons, []);
  return { booking: { ...booking, addons }, payments: await q<{ id: number; method: string; amount: string; transaction_ref: string; status: string; paid_at: string }>(
    "SELECT id, method, amount, transaction_ref, status, paid_at FROM payments WHERE booking_id = ? ORDER BY id",
    [booking.id]
  ) };
});

export const getPlans = cache(async (userId: number): Promise<Plan[]> => {
  return q<Plan>("SELECT * FROM plans WHERE user_id = ? ORDER BY created_at DESC", [userId]);
});

export const getPlanByToken = cache(async (token: string, userId?: number) => {
  const plan = await q1<Plan>(
    `SELECT * FROM plans WHERE token = ?${userId ? " AND user_id = ?" : ""}`,
    userId ? [token, userId] : [token]
  );
  if (!plan) return null;
  return { ...plan, data: parseJson(plan.plan_json, null) };
});

export const getConversations = cache(async (userId: number) => {
  return q<{ id: number; title: string; updated_at: string; message_count: number }>(
    `SELECT c.id, c.title, c.updated_at, (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
     FROM conversations c WHERE c.user_id = ? ORDER BY c.updated_at DESC`,
    [userId]
  );
});

export const getConversation = cache(async (id: number, userId: number) => {
  const conversation = await q1<{ id: number; title: string; updated_at: string }>(
    "SELECT id, title, updated_at FROM conversations WHERE id = ? AND user_id = ?",
    [id, userId]
  );
  if (!conversation) return null;
  const messages = await q<{ id: number; role: "user" | "assistant"; content: string; created_at: string }>(
    "SELECT id, role, content, created_at FROM messages WHERE conversation_id = ? ORDER BY id",
    [id]
  );
  return { conversation, messages };
});

export const getExpenses = cache(async (userId: number) => {
  const rows = await q<{ category: string; total: string }>(
    "SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = ? GROUP BY category",
    [userId]
  );
  const items = await q<{ id: number; label: string; category: string; amount: string; currency: string; spent_on: string; note: string | null }>(
    "SELECT id, label, category, amount, currency, spent_on, note FROM expenses WHERE user_id = ? ORDER BY spent_on DESC, id DESC LIMIT 50",
    [userId]
  );
  return { items, byCategory: rows };
});

export const getScans = cache(async (userId: number) => {
  return q<{ id: number; type: "landmark" | "receipt" | "food"; title: string; summary: string | null; result_json: string | null; created_at: string }>(
    "SELECT id, type, title, summary, result_json, created_at FROM scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 30",
    [userId]
  );
});

export const getNotifications = cache(async (userId: number) => {
  return q<{ id: number; title: string; message: string; link: string | null; read_at: string | null; created_at: string }>(
    "SELECT id, title, message, link, read_at, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20",
    [userId]
  );
});

export const getHomeStats = cache(async () => {
  const row = await q1<{ trips: number; destinations: number; reviews: number; travellers: number }>(
    `SELECT (SELECT COUNT(*) FROM trips WHERE status='published') AS trips,
            (SELECT COUNT(*) FROM destinations WHERE status='active') AS destinations,
            (SELECT COUNT(*) FROM reviews WHERE status='approved') AS reviews,
            (SELECT COALESCE(SUM(travelers),0) FROM bookings WHERE status <> 'cancelled') AS travellers`
  );
  return row ?? { trips: 0, destinations: 0, reviews: 0, travellers: 0 };
});
