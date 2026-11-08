"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { addPostCommentAction, type PostState } from "@/app/actions/community";

const initial: PostState = {};

export default function PostCommentForm({ postId }: { postId: number }) {
  const [state, action, pending] = useActionState(addPostCommentAction, initial);

  return (
    <form action={action} className="mt-3 flex items-center gap-2">
      <input type="hidden" name="post_id" value={postId} />
      <input name="body" required placeholder="Write a comment…" className="field h-9 flex-1 py-0 text-[12px]" />
      <button type="submit" disabled={pending} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-forest text-white transition hover:bg-forest-deep" aria-label="Post comment">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
      </button>
      {state.error && <p className="text-[10.5px] text-red-700">{state.error}</p>}
    </form>
  );
}
