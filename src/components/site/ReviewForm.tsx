"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { reviewAction, type FormState } from "@/app/actions/public";
import { cn } from "@/lib/utils";

const initial: FormState = {};

export default function ReviewForm({ tripId, signedIn }: { tripId: number; signedIn: boolean }) {
  const [state, action, pending] = useActionState(reviewAction, initial);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);

  if (!signedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-mist/50 p-5 text-center text-[12.5px] text-muted">
        Sign in after your trip to share a review. Every review is verified against a booking.
      </div>
    );
  }

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 text-[12.5px] text-forest">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-4">
      <input type="hidden" name="trip_id" value={tripId} />
      <input type="hidden" name="rating" value={rating} />
      <p className="text-[13px] font-semibold text-ink">Share your experience</p>
      <div className="mt-2 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            <Star className={cn("h-6 w-6 transition", (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-line")} />
          </button>
        ))}
        <span className="ml-1 text-[11px] text-muted">{rating}/5</span>
      </div>
      <input name="title" placeholder="Review title (optional)" className="field mt-3" maxLength={180} />
      <textarea name="body" required minLength={10} rows={3} placeholder="What stood out? Guides, views, food, pace…" className="field mt-2 resize-none" />
      {state.error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-3 w-full">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : "Post review"}
      </button>
    </form>
  );
}
