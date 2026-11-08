"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { changePasswordAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, initial);

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <h2 className="flex items-center gap-1.5 text-[14px] font-semibold text-ink"><LockKeyhole className="h-4 w-4 text-brand-500" /> Password</h2>
      <p className="mt-0.5 text-[11px] text-muted">Use at least 8 characters. You&apos;ll stay signed in on this device.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="current">Current password</label>
          <input id="current" name="current" type="password" required className="field" autoComplete="current-password" />
        </div>
        <div>
          <label className="label" htmlFor="password">New password</label>
          <input id="password" name="password" type="password" required minLength={8} className="field" autoComplete="new-password" />
        </div>
      </div>
      {state.error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{state.error}</p>}
      {state.ok && <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-[11.5px] text-forest"><CheckCircle2 className="h-3.5 w-3.5" /> {state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-3">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</> : "Change password"}
      </button>
    </form>
  );
}
