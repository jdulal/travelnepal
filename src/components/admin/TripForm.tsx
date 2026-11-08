"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { saveTripAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Destination } from "@/types";

export type TripFormValues = {
  id?: number;
  title: string;
  slug: string;
  destination_id: number | null;
  category: string;
  summary: string | null;
  description: string | null;
  duration_days: number;
  difficulty: string;
  max_altitude: number | null;
  group_size: number;
  price: string | number;
  sale_price: string | number | null;
  hero_image: string | null;
  gallery: string[] | null;
  highlights: string[] | null;
  inclusions: string[] | null;
  exclusions: string[] | null;
  best_season: string | null;
  departure_city: string;
  permit_info: string | null;
  status: string;
  featured: number;
};

const categories = ["trekking", "tour", "adventure", "cultural", "wildlife", "wellness", "honeymoon"];
const difficulties = ["easy", "moderate", "challenging", "strenuous"];

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="admin-card p-5">
      <h3 className="text-[13px] font-bold text-slate-900">{title}</h3>
      {hint && <p className="mt-0.5 text-[11px] text-slate-400">{hint}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

export default function TripForm({ trip, destinations }: { trip?: TripFormValues; destinations: Pick<Destination, "id" | "name">[] }) {
  const [state, action] = useActionState<AdminState, FormData>(saveTripAction, {});
  const editing = Boolean(trip?.id);

  return (
    <form action={action} className="space-y-4">
      {trip?.id && <input type="hidden" name="id" value={trip.id} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/trips" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-forest">
          <ArrowLeft className="h-3.5 w-3.5" /> All trips
        </Link>
        <div className="flex items-center gap-2">
          {editing && (
            <Link href={`/tours/${trip?.slug}`} className="admin-btn-ghost text-[12px]">Preview public page</Link>
          )}
          <SubmitButton className="bg-forest hover:bg-forest-deep">
            <Save className="h-3.5 w-3.5" /> {editing ? "Save trip" : "Create trip"}
          </SubmitButton>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <Section title="Basics" hint="Titles and slugs appear in search results, cards and URLs.">
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="title">Trip title</label>
          <input id="title" name="title" required defaultValue={trip?.title ?? ""} placeholder="Everest Base Camp Trek — 14 days" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="slug">Slug</label>
          <input id="slug" name="slug" defaultValue={trip?.slug ?? ""} placeholder="everest-base-camp-trek" className="admin-input" />
          <p className="mt-1 text-[10.5px] text-slate-400">Leave blank to generate from the title.</p>
        </div>
        <div>
          <label className="admin-label" htmlFor="destination_id">Destination</label>
          <select id="destination_id" name="destination_id" defaultValue={trip?.destination_id ?? ""} className="admin-input">
            <option value="">— No destination —</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={trip?.category ?? "trekking"} className="admin-input">
            {categories.map((c) => (
              <option key={c} value={c} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={trip?.status ?? "draft"} className="admin-input">
            <option value="draft">Draft — hidden from site</option>
            <option value="published">Published — visible on site</option>
          </select>
        </div>
        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 sm:col-span-2">
          <input type="checkbox" name="featured" value="1" defaultChecked={Boolean(trip?.featured)} className="h-4 w-4 accent-brand-500" />
          <span className="text-[12px] font-medium text-slate-600">Feature this trip on the homepage and destination pages</span>
        </label>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="summary">Summary</label>
          <textarea id="summary" name="summary" rows={3} defaultValue={trip?.summary ?? ""} placeholder="One or two sentences shown on trip cards and search results." className="admin-input resize-none" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="description">Full description (HTML allowed)</label>
          <textarea id="description" name="description" rows={8} defaultValue={trip?.description ?? ""} placeholder="<p>Describe the journey, landscapes and experience…</p>" className="admin-input resize-y font-mono text-[11.5px]" />
        </div>
      </Section>

      <Section title="Logistics" hint="Used for filters, badges and the trip facts panel.">
        <div>
          <label className="admin-label" htmlFor="duration_days">Duration (days)</label>
          <input id="duration_days" name="duration_days" type="number" min={1} max={60} required defaultValue={trip?.duration_days ?? 7} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" defaultValue={trip?.difficulty ?? "moderate"} className="admin-input">
            {difficulties.map((d) => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="max_altitude">Maximum altitude (m)</label>
          <input id="max_altitude" name="max_altitude" type="number" min={1} defaultValue={trip?.max_altitude ?? ""} placeholder="5545" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="group_size">Maximum group size</label>
          <input id="group_size" name="group_size" type="number" min={1} max={50} defaultValue={trip?.group_size ?? 12} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="best_season">Best season</label>
          <input id="best_season" name="best_season" defaultValue={trip?.best_season ?? ""} placeholder="March–May · September–November" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="departure_city">Departure city</label>
          <input id="departure_city" name="departure_city" defaultValue={trip?.departure_city ?? "Kathmandu"} className="admin-input" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="permit_info">Permit information</label>
          <textarea id="permit_info" name="permit_info" rows={4} defaultValue={trip?.permit_info ?? ""} placeholder="Which permits are included and which the traveller pays for." className="admin-input resize-y" />
        </div>
      </Section>

      <Section title="Pricing" hint="Prices are in Nepalese rupees (NPR).">
        <div>
          <label className="admin-label" htmlFor="price">Price per person</label>
          <input id="price" name="price" type="number" min={1} step="0.01" required defaultValue={trip?.price ?? ""} placeholder="185000" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="sale_price">Sale price (optional)</label>
          <input id="sale_price" name="sale_price" type="number" min={1} step="0.01" defaultValue={trip?.sale_price ?? ""} placeholder="165000" className="admin-input" />
        </div>
      </Section>

      <Section title="Media" hint="Use local paths such as /images/trips/everest.jpg for fast, offline-friendly delivery.">
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="hero_image">Hero image path</label>
          <input id="hero_image" name="hero_image" defaultValue={trip?.hero_image ?? ""} placeholder="/images/trips/everest-base-camp.jpg" className="admin-input" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="gallery">Gallery image paths (one per line)</label>
          <textarea id="gallery" name="gallery" rows={4} defaultValue={(trip?.gallery ?? []).join("\n")} placeholder={"/images/trips/everest-1.jpg\n/images/trips/everest-2.jpg"} className="admin-input resize-y font-mono text-[11.5px]" />
        </div>
      </Section>

      <Section title="Itinerary highlights & inclusions" hint="One item per line.">
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="highlights">Highlights</label>
          <textarea id="highlights" name="highlights" rows={5} defaultValue={(trip?.highlights ?? []).join("\n")} placeholder={"Sunrise from Kala Patthar\nSherpa villages and monasteries\nSagarmatha National Park"} className="admin-input resize-y" />
        </div>
        <div>
          <label className="admin-label" htmlFor="inclusions">Inclusions</label>
          <textarea id="inclusions" name="inclusions" rows={5} defaultValue={(trip?.inclusions ?? []).join("\n")} placeholder={"Airport transfers\nTeahouse accommodation\nLicensed guide"} className="admin-input resize-y" />
        </div>
        <div>
          <label className="admin-label" htmlFor="exclusions">Exclusions</label>
          <textarea id="exclusions" name="exclusions" rows={5} defaultValue={(trip?.exclusions ?? []).join("\n")} placeholder={"International flights\nTravel insurance\nPersonal gear"} className="admin-input resize-y" />
        </div>
      </Section>

      <div className="flex justify-end pb-6">
        <SubmitButton className="bg-forest px-6 hover:bg-forest-deep">
          <Save className="h-3.5 w-3.5" /> {editing ? "Save trip" : "Create trip"}
        </SubmitButton>
      </div>
    </form>
  );
}
