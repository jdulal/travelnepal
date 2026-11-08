"use client";

import { useActionState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { storyCommentAction, type FormState } from "@/app/actions/public";

const initial: FormState = {};

export default function StoryCommentForm({ storyId, signedIn }: { storyId: number; signedIn: boolean }) {
  const [state, action, pending] = useActionState(storyCommentAction, initial);

  if (!signedIn) {
    return (
      <p className="rounded-2xl border border-dashed border-line bg-mist/50 px-4 py-3 text-[12px] text-muted">
        <a href="/sign-in" className="font-semibold text-brand-600">Sign in</a> to join the conversation.
      </p>
    );
  }

  return (
    <form action={action} className="rounded-2xl border border-line bg-white p-4">
      <input type="hidden" name="story_id" value={storyId} />
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-ink" htmlFor="comment"><MessageCircle className="h-4 w-4 text-brand-500" /> Add a comment</label>
      <textarea id="comment" name="body" required rows={3} placeholder="Share a tip, a question or your own memory…" className="field mt-2 resize-none" />
      {state.error && <p className="mt-2 text-[11.5px] text-red-700">{state.error}</p>}
      {state.ok && <p className="mt-2 text-[11.5px] font-medium text-brand-700">{state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-2.5">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Posting…</> : "Post comment"}
      </button>
    </form>
  );
}
