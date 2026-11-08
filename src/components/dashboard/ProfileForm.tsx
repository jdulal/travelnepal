"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { updateProfileAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export default function ProfileForm({ profile }: { profile: { name: string; email: string; phone: string | null; country: string } }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <h2 className="text-[14px] font-semibold text-ink">Profile</h2>
      <p className="mt-0.5 text-[11px] text-muted">Used on bookings, permits and communications.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required defaultValue={profile.name} className="field" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required defaultValue={profile.email} className="field" autoComplete="email" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" defaultValue={profile.phone ?? ""} className="field" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="country">Country</label>
          <input id="country" name="country" defaultValue={profile.country} className="field" autoComplete="country-name" />
        </div>
      </div>
      {state.error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{state.error}</p>}
      {state.ok && <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-[11.5px] text-forest"><CheckCircle2 className="h-3.5 w-3.5" /> {state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-3">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Save profile"}
      </button>
    </form>
  );
}
