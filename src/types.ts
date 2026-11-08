export type Role = "user" | "admin";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type Destination = {
  id: number;
  name: string;
  slug: string;
  region: string;
  province: string | null;
  tagline: string | null;
  summary: string | null;
  description: string | null;
  hero_image: string | null;
  thumbnail: string | null;
  altitude: string | null;
  best_season: string | null;
  featured: number;
  sort_order: number;
  status: "active" | "hidden";
};

export type Trip = {
  id: number;
  destination_id: number | null;
  title: string;
  slug: string;
  category: "trekking" | "tour" | "adventure" | "cultural" | "wildlife" | "wellness" | "honeymoon";
  summary: string | null;
  description: string | null;
  duration_days: number;
  difficulty: "easy" | "moderate" | "challenging" | "strenuous";
  max_altitude: number | null;
  group_size: number;
  price: string;
  sale_price: string | null;
  rating: string;
  review_count: number;
  hero_image: string | null;
  gallery: string[] | null;
  highlights: string[] | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  best_season: string | null;
  departure_city: string;
  permit_info: string | null;
  status: "draft" | "published";
  featured: number;
  destination_name?: string | null;
  destination_slug?: string | null;
  destination_region?: string | null;
  seats_left?: number | null;
};

export type TripDay = {
  id: number;
  trip_id: number;
  day_number: number;
  title: string;
  description: string | null;
  accommodation: string | null;
  meals: string | null;
  altitude: string | null;
};

export type Departure = {
  id: number;
  trip_id: number;
  start_date: string;
  end_date: string;
  seats_total: number;
  seats_booked: number;
  price: string | null;
  status: "open" | "full" | "closed";
};

export type Review = {
  id: number;
  trip_id: number;
  user_id: number | null;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

export type Story = {
  id: number;
  destination_id: number | null;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  cover_image: string | null;
  author_name: string;
  author_role: string | null;
  category: string;
  read_time: number;
  status: "draft" | "published";
  published_at: string | null;
  destination_name?: string | null;
  destination_slug?: string | null;
};

export type Post = {
  id: number;
  user_id: number;
  destination_id: number | null;
  title: string;
  body: string;
  image: string | null;
  status: "published" | "hidden";
  created_at: string;
  author_name: string;
  author_avatar: string | null;
  destination_name?: string | null;
  destination_slug?: string | null;
  like_count: number;
  comment_count: number;
  liked?: number;
};

export type Booking = {
  id: number;
  reference: string;
  user_id: number | null;
  trip_id: number;
  departure_id: number | null;
  full_name: string;
  email: string;
  phone: string;
  nationality: string;
  travelers: number;
  start_date: string | null;
  addons: { name: string; price: number }[] | null;
  subtotal: string;
  discount: string;
  total: string;
  currency: string;
  coupon_code: string | null;
  special_requests: string | null;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  payment_status: "unpaid" | "paid" | "refunded";
  payment_method: string | null;
  created_at: string;
  trip_title?: string;
  trip_slug?: string;
  trip_image?: string;
  duration_days?: number;
  difficulty?: string;
};

export type PlanData = {
  title: string;
  destination: string;
  days: number;
  travelers: number;
  budget_tier: string;
  summary: string;
  itinerary: {
    day: number;
    title: string;
    morning: string;
    afternoon: string;
    evening: string;
    meals: string[];
    stay: string;
    cost: number;
  }[];
  totals: { per_person: number; group: number; currency: string };
  tips: string[];
};

export type Plan = {
  id: number;
  user_id: number | null;
  token: string;
  title: string;
  destination: string | null;
  days: number;
  travelers: number;
  budget_tier: string;
  interests: string[] | null;
  plan_json: string;
  source: "ai" | "local";
  created_at: string;
};

export type AdminStats = {
  revenue: number;
  bookings: number;
  pending: number;
  travellers: number;
  users: number;
  trips: number;
  reviewsPending: number;
  inquiriesNew: number;
  revenueByMonth: { month: string; revenue: number }[];
  bookingsByStatus: { status: string; count: number }[];
  topTrips: { title: string; bookings: number; revenue: number }[];
};
