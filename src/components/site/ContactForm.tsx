"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { contactAction, type FormState } from "@/app/actions/public";

const initial: FormState = {};

export default function ContactForm({ defaultSubject = "" }: { defaultSubject?: string }) {
  const [state, action, pending] = useActionState(contactAction, initial);

  if (state.ok) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
        <div>
          <p className="text-[14px] font-semibold text-forest">Message received</p>
          <p className="mt-1 text-[12px] leading-relaxed text-body/75">{state.message}</p>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6">
      <h2 className="text-[18px] font-semibold text-ink">Send us a message</h2>
      <p className="mt-1 text-[12px] text-muted">A local expert in Kathmandu replies within one business day.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" name="name" required className="field" placeholder="Your name" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field" placeholder="you@example.com" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp <span className="font-normal text-muted">(optional)</span></label>
          <input id="phone" name="phone" className="field" placeholder="+977 98…" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="subject">Subject</label>
          <input id="subject" name="subject" required defaultValue={defaultSubject} className="field" placeholder="Trip enquiry, booking help…" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">How can we help?</label>
          <textarea id="message" name="message" required rows={5} className="field resize-none" placeholder="Dates, group size, budget, fitness, questions…" />
        </div>
      </div>
      {state.error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-[12px] text-red-700">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-primary mt-4">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : <><Send className="h-4 w-4" /> Send message</>}
      </button>
      <p className="mt-3 text-[10px] leading-relaxed text-muted">By sending this form you agree to our privacy policy. We never share your details.</p>
    </form>
  );
}
