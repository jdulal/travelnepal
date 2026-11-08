"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { saveDestinationAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Destination } from "@/types";

export default function DestinationForm({ destination }: { destination?: Destination }) {
  const [state, action] = useActionState<AdminState, FormData>(saveDestinationAction, {});
  const editing = Boolean(destination?.id);

  return (
    <form action={action} className="space-y-4">
      {destination?.id && <input type="hidden" name="id" value={destination.id} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/destinations" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-forest">
          <ArrowLeft className="h-3.5 w-3.5" /> All destinations
        </Link>
        <SubmitButton className="bg-forest hover:bg-forest-deep">
          <Save className="h-3.5 w-3.5" /> {editing ? "Save destination" : "Create destination"}
        </SubmitButton>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="admin-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900">Destination</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="name">Name</label>
            <input id="name" name="name" required defaultValue={destination?.name ?? ""} placeholder="Everest Region" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={destination?.slug ?? ""} placeholder="everest-region" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="region">Region</label>
            <input id="region" name="region" defaultValue={destination?.region ?? ""} placeholder="Khumbu, Solukhumbu" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="province">Province</label>
            <input id="province" name="province" defaultValue={destination?.province ?? ""} placeholder="Koshi Province" className="admin-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="tagline">Tagline</label>
            <input id="tagline" name="tagline" defaultValue={destination?.tagline ?? ""} placeholder="The roof of the world" className="admin-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="summary">Summary</label>
            <textarea id="summary" name="summary" rows={3} defaultValue={destination?.summary ?? ""} className="admin-input resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="description">Description (HTML allowed)</label>
            <textarea id="description" name="description" rows={7} defaultValue={destination?.description ?? ""} className="admin-input resize-y font-mono text-[11.5px]" />
          </div>
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900">Practical details</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="altitude">Altitude</label>
            <input id="altitude" name="altitude" defaultValue={destination?.altitude ?? ""} placeholder="2,800–5,545 m" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="best_season">Best season</label>
            <input id="best_season" name="best_season" defaultValue={destination?.best_season ?? ""} placeholder="March–May · September–November" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="sort_order">Sort order</label>
            <input id="sort_order" name="sort_order" type="number" defaultValue={destination?.sort_order ?? 0} className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="status">Visibility</label>
            <select id="status" name="status" defaultValue={destination?.status ?? "active"} className="admin-input">
              <option value="active">Active — visible on site</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 sm:col-span-2">
            <input type="checkbox" name="featured" value="1" defaultChecked={Boolean(destination?.featured)} className="h-4 w-4 accent-brand-500" />
            <span className="text-[12px] font-medium text-slate-600">Feature this destination on the homepage</span>
          </label>
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900">Media</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="hero_image">Hero image path</label>
            <input id="hero_image" name="hero_image" defaultValue={destination?.hero_image ?? ""} placeholder="/images/destinations/everest.jpg" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="thumbnail">Thumbnail path</label>
            <input id="thumbnail" name="thumbnail" defaultValue={destination?.thumbnail ?? ""} placeholder="/images/destinations/everest-thumb.jpg" className="admin-input" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <SubmitButton className="bg-forest px-6 hover:bg-forest-deep">
          <Save className="h-3.5 w-3.5" /> {editing ? "Save destination" : "Create destination"}
        </SubmitButton>
      </div>
    </form>
  );
}
