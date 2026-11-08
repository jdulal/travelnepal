"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, PenLine } from "lucide-react";
import { createPostAction, type PostState } from "@/app/actions/community";
import { cn } from "@/lib/utils";

const initial: PostState = {};

type Destination = { id: number; name: string; hero_image: string | null; thumbnail: string | null };

export default function PostComposer({ destinations, signedIn }: { destinations: Destination[]; signedIn: boolean }) {
  const [state, action, pending] = useActionState(createPostAction, initial);
  const [open, setOpen] = useState(false);
  const [image, setImage] = useState<Destination | null>(null);

  if (!signedIn) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-white p-5 text-center">
        <PenLine className="mx-auto h-6 w-6 text-brand-500" />
        <p className="mt-2 text-[13px] font-semibold text-ink">Share a trail tip or find a trekking buddy</p>
        <p className="mt-1 text-[11.5px] text-muted"><a href="/sign-in" className="font-semibold text-brand-600">Sign in</a> to post to the community.</p>
      </div>
    );
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 rounded-3xl border border-line bg-white p-4 text-left shadow-soft transition hover:border-brand-200">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-50 text-brand-600"><PenLine className="h-4 w-4" /></span>
        <span>
          <span className="block text-[13px] font-semibold text-ink">Share something with travellers</span>
          <span className="block text-[11px] text-muted">A tip, a question, a trekking buddy, a photo story.</span>
        </span>
      </button>
    );
  }

  if (state.ok) {
    return (
      <div className="flex items-start gap-2.5 rounded-3xl border border-brand-200 bg-brand-50/60 p-5 text-[12.5px] text-forest">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <input type="hidden" name="image" value={image?.hero_image ?? image?.thumbnail ?? ""} />
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[14px] font-semibold text-ink">New community post</h2>
        <button type="button" onClick={() => setOpen(false)} className="text-[11px] font-medium text-muted hover:text-forest">Cancel</button>
      </div>
      <input name="title" required maxLength={200} placeholder="Title — e.g. Poon Hill in April: what to expect" className="field mt-3" />
      <textarea name="body" required minLength={20} rows={4} maxLength={4000} placeholder="Tell us the details: route, season, costs, questions…" className="field mt-2 resize-none" />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="destination_id">Related destination</label>
          <select id="destination_id" name="destination_id" className="field" defaultValue="">
            <option value="">General Nepal</option>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div>
          <span className="label"><ImagePlus className="mr-1 inline h-3.5 w-3.5 text-brand-500" /> Attach a destination photo</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {destinations.slice(0, 6).map((d) => {
              const src = d.thumbnail ?? d.hero_image;
              const active = image?.id === d.id;
              return (
                <button key={d.id} type="button" onClick={() => setImage(active ? null : d)} className={cn("relative h-12 w-16 shrink-0 overflow-hidden rounded-xl border-2", active ? "border-brand-500" : "border-transparent opacity-80 hover:opacity-100")} title={d.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src ?? "/images/fallback/nepal.jpg"} alt={d.name} className="h-full w-full object-cover" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {state.error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-3">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : "Post to community"}
      </button>
    </form>
  );
}
