"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { signInAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export default function SignInForm({ next = "" }: { next?: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const [show, setShow] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600"><LockKeyhole className="h-5 w-5" /></span>
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Welcome back</h1>
          <p className="text-[11.5px] text-muted">Sign in to plans, bookings and saved trips.</p>
        </div>
      </div>

      <form action={action} className="mt-5 space-y-3.5">
        <input type="hidden" name="next" value={next} />
        <div>
          <label className="label" htmlFor="identifier">Email or username</label>
          <input id="identifier" name="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} required className="field" autoComplete="username" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input id="password" name="password" type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="field pr-11" autoComplete="current-password" placeholder="••••••••" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {state.error && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</> : "Sign in"}
        </button>
      </form>

      <div className="mt-4 rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-forest">Demo account</p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <div className="text-[11px] text-body/75">
            <p><span className="text-muted">Email:</span> aayush@example.com</p>
            <p><span className="text-muted">Password:</span> Traveler@2026</p>
          </div>
          <button
            type="button"
            onClick={() => { setIdentifier("aayush@example.com"); setPassword("Traveler@2026"); }}
            className="rounded-full bg-white px-3 py-1.5 text-[10.5px] font-semibold text-forest ring-1 ring-line hover:ring-brand-300"
          >
            Fill
          </button>
        </div>
      </div>

      <p className="mt-4 text-center text-[12px] text-muted">
        New here? <Link href="/sign-up" className="font-semibold text-brand-600 hover:text-forest">Create an account</Link>
      </p>
      <p className="mt-1.5 text-center text-[10.5px] text-muted">Staff? <Link href="/admin/login" className="font-semibold text-brand-600 hover:text-forest">Admin sign in</Link></p>
    </div>
  );
}
