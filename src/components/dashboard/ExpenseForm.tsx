"use client";

import { useActionState } from "react";
import { CheckCircle2, Loader2, Plus } from "lucide-react";
import { addExpenseAction, type DashState } from "@/app/actions/dashboard";

const initial: DashState = {};

const categories = ["food", "transport", "stay", "activities", "shopping", "other"];

export default function ExpenseForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState(addExpenseAction, initial);

  return (
    <form action={action} className="rounded-3xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-600"><Plus className="h-4 w-4" /></span>
        <h2 className="text-[14px] font-semibold text-ink">Add an expense</h2>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label" htmlFor="label">What was it?</label>
          <input id="label" name="label" required maxLength={180} placeholder="Dal bhat at Namche teahouse" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="category">Category</label>
          <select id="category" name="category" className="field capitalize" defaultValue="food">
            {categories.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="amount">Amount</label>
          <div className="flex gap-1.5">
            <input id="amount" name="amount" type="number" min="1" step="0.01" required placeholder="850" className="field flex-1" />
            <select name="currency" className="field w-24" defaultValue="NPR" aria-label="Currency">
              <option value="NPR">NPR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label" htmlFor="spent_on">Date</label>
          <input id="spent_on" name="spent_on" type="date" required defaultValue={today} className="field" />
        </div>
        <div>
          <label className="label" htmlFor="note">Note <span className="font-normal text-muted">(optional)</span></label>
          <input id="note" name="note" maxLength={255} placeholder="Split with group" className="field" />
        </div>
      </div>
      {state.error && <p className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-[11.5px] text-red-700">{state.error}</p>}
      {state.ok && <p className="mt-2 flex items-center gap-1.5 rounded-xl bg-brand-50 px-3 py-2 text-[11.5px] text-forest"><CheckCircle2 className="h-3.5 w-3.5" /> {state.message}</p>}
      <button type="submit" disabled={pending} className="btn-primary btn-sm mt-3">
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : "Add expense"}
      </button>
    </form>
  );
}
