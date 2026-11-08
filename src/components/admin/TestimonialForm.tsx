"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Quote } from "lucide-react";
import { saveTestimonialAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Testimonial } from "@/lib/admin";

export default function TestimonialForm({ testimonial }: { testimonial?: Testimonial }) {
  const [state, action] = useActionState<AdminState, FormData>(saveTestimonialAction, {});
  const editing = Boolean(testimonial);

  return (
    <form action={action} className={editing ? "mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3" : "rounded-xl border border-dashed border-slate-200 p-3.5"}>
      {testimonial && <input type="hidden" name="id" value={testimonial.id} />}
      {state.error && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <input name="name" required defaultValue={testimonial?.name ?? ""} placeholder="Traveller name" className="admin-input" />
        <input name="location" defaultValue={testimonial?.location ?? ""} placeholder="Location — e.g. Sydney, Australia" className="admin-input" />
        <div className="sm:col-span-2">
          <textarea name="quote" required rows={3} defaultValue={testimonial?.quote ?? ""} placeholder="Their words about the trip." className="admin-input resize-none" />
        </div>
        <input name="trip_title" defaultValue={testimonial?.trip_title ?? ""} placeholder="Trip title (optional)" className="admin-input" />
        <select name="rating" defaultValue={testimonial?.rating ?? 5} className="admin-input">
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r}>{r} star{r > 1 ? "s" : ""}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11.5px] text-slate-600 sm:col-span-2">
          <input type="checkbox" name="active" value="1" defaultChecked={testimonial ? Boolean(testimonial.active) : true} className="h-4 w-4 accent-brand-500" />
          Show on the homepage
        </label>
        <div className="sm:col-span-2">
          <SubmitButton className="w-full">
            <Quote className="h-3.5 w-3.5" /> {editing ? "Save testimonial" : "Add testimonial"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
