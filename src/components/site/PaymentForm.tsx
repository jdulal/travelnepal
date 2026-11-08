"use client";

import { useActionState, useState } from "react";
import { AlertCircle, CreditCard, Landmark, Loader2, LockKeyhole, Smartphone, Wallet } from "lucide-react";
import { payBookingAction, type BookingState } from "@/app/actions/booking";
import { cn, npr } from "@/lib/utils";

const initial: BookingState = {};

const methods = [
  { id: "esewa", label: "eSewa", hint: "Pay with your eSewa wallet", icon: Smartphone, tone: "text-emerald-600 bg-emerald-50" },
  { id: "khalti", label: "Khalti", hint: "Pay with Khalti wallet", icon: Wallet, tone: "text-purple-600 bg-purple-50" },
  { id: "card", label: "Card", hint: "Visa, Mastercard or UnionPay", icon: CreditCard, tone: "text-sky-600 bg-sky-50" },
  { id: "bank", label: "Bank transfer", hint: "Nepali or international transfer", icon: Landmark, tone: "text-amber-600 bg-amber-50" },
];

export default function PaymentForm({ reference, total }: { reference: string; total: number }) {
  const [state, action, pending] = useActionState(payBookingAction, initial);
  const [method, setMethod] = useState("esewa");

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="reference" value={reference} />
      <input type="hidden" name="method" value={method} />

      <div className="grid gap-2.5 sm:grid-cols-2">
        {methods.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3.5 text-left transition",
                active ? "border-brand-400 bg-brand-50/60 ring-1 ring-brand-300" : "border-line bg-white hover:border-brand-200"
              )}
              aria-pressed={active}
            >
              <span className={cn("grid h-10 w-10 place-items-center rounded-xl", m.tone)}><Icon className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-ink">{m.label}</span>
                <span className="block text-[10.5px] text-muted">{m.hint}</span>
              </span>
              <span className={cn("grid h-4 w-4 place-items-center rounded-full border", active ? "border-forest bg-forest" : "border-line")}>
                {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-3.5 text-[11px] leading-relaxed text-forest/80">
        <p className="font-semibold">Demo checkout</p>
        <p className="mt-0.5">This is a demonstration environment — no real money is charged. Clicking pay records a simulated {method === "cash" ? "cash" : method} payment so you can see the full booking flow.</p>
      </div>

      {state.error && <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-[12px] text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}</p>}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</> : <><LockKeyhole className="h-4 w-4" /> Pay {npr(total)}</>}
      </button>
      <p className="text-center text-[10px] text-muted">By paying you accept our booking terms and cancellation policy.</p>
    </form>
  );
}
