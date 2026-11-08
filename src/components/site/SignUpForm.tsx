"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { signUpAction, type AuthState } from "@/app/actions/auth";

const initial: AuthState = {};

export default function SignUpForm() {
  const [state, action, pending] = useActionState(signUpAction, initial);
  const [show, setShow] = useState(false);

  return (
    <div className="rounded-[2rem] border border-line bg-white p-6 shadow-card sm:p-8">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-600"><UserPlus className="h-5 w-5" /></span>
        <div>
          <h1 className="text-[21px] font-semibold tracking-[-0.02em] text-ink">Create your account</h1>
          <p className="text-[11.5px] text-muted">Free, fast, and it keeps your plans in one place.</p>
        </div>
      </div>

      <form action={action} className="mt-5 space-y-3.5">
        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input id="name" name="name" required className="field" autoComplete="name" placeholder="Aayush Sharma" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field" autoComplete="email" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone / WhatsApp <span className="font-normal text-muted">(optional)</span></label>
          <input id="phone" name="phone" className="field" autoComplete="tel" placeholder="+977 98…" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input id="password" name="password" type={show ? "text" : "password"} required minLength={8} className="field pr-11" autoComplete="new-password" placeholder="At least 8 characters" />
            <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-forest" aria-label={show ? "Hide password" : "Show password"}>
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {state.error && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}</p>}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create account"}
        </button>
        <p className="text-center text-[10px] leading-relaxed text-muted">
          By continuing you agree to our <Link href="/terms-condition" className="underline hover:text-forest">terms</Link> and <Link href="/privacy-policy" className="underline hover:text-forest">privacy policy</Link>.
        </p>
      </form>

      <p className="mt-4 text-center text-[12px] text-muted">
        Already have an account? <Link href="/sign-in" className="font-semibold text-brand-600 hover:text-forest">Sign in</Link>
      </p>
    </div>
  );
}
