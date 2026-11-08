import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function npr(value: number | string | null | undefined) {
  const n = Number(value ?? 0);
  return "NPR " + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function usd(value: number | string | null | undefined, rate = 0.0075) {
  const n = Number(value ?? 0) * rate;
  return "≈ US$ " + new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
}

export function shortDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export function dayMonth(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export function dateTime(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function nights(days: number) {
  return Math.max(days - 1, 0);
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function truncate(value: string, length = 140) {
  if (value.length <= length) return value;
  return value.slice(0, length).replace(/\s+\S*$/, "") + "…";
}

export function bookingReference() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `NT-${new Date().getFullYear().toString().slice(2)}-${out}`;
}

export function difficultyLabel(d: string) {
  return { easy: "Easy", moderate: "Moderate", challenging: "Challenging", strenuous: "Strenuous" }[d] ?? d;
}

export function categoryLabel(c: string) {
  return {
    trekking: "Trekking",
    tour: "Local Tour",
    adventure: "Adventure",
    cultural: "Cultural",
    wildlife: "Wildlife",
    wellness: "Wellness",
    honeymoon: "Honeymoon",
  }[c] ?? c;
}

export function priceOf(trip: { price: string | number; sale_price: string | number | null }) {
  return Number(trip.sale_price ?? trip.price);
}

export function seatsLeft(d: { seats_total: number; seats_booked: number }) {
  return Math.max(d.seats_total - d.seats_booked, 0);
}
