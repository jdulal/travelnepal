"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, User } from "lucide-react";
import { adminLoginAction, type AuthState } from "@/app/actions/auth";

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(adminLoginAction, {});
  const [show, setShow] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[12.5px] text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label htmlFor="identifier" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Email or username
        </label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="identifier"
            name="identifier"
            autoComplete="username"
            required
            defaultValue="admin"
            placeholder="admin@nepaltravel.com"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Password
        </label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="password"
            name="password"
            type={show ? "text" : "password"}
            autoComplete="current-password"
            required
            defaultValue="Nepal@2026"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-3 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(99,171,69,.9)] transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in to admin console"}
      </button>
    </form>
  );
}
