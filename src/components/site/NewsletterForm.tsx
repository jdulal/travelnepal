"use client";

import { useActionState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { subscribeAction, type FormState } from "@/app/actions/public";

export default function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeAction, {});

  if (state.ok) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm text-white">
        <CheckCircle2 className="h-4 w-4 text-brand-200" /> {state.message}
      </div>
    );
  }

  return (
    <form action={action} className="w-full">
      <div className="flex items-center gap-2 rounded-full bg-white/10 p-1.5 ring-1 ring-white/20">
        <input
          name="email"
          type="email"
          required
          placeholder="Your email address"
          className="h-10 min-w-0 flex-1 bg-transparent px-4 text-sm text-white placeholder:text-white/55"
          aria-label="Email address"
        />
        <button disabled={pending} className="btn bg-white px-4 py-2.5 text-sm text-forest hover:bg-brand-50" type="submit">
          {pending ? "Joining…" : "Join"} <ArrowRight className="h-4 w-4" />
        </button>
      </div>
      {state.error && <p className="mt-2 pl-4 text-xs text-red-200">{state.error}</p>}
    </form>
  );
}
