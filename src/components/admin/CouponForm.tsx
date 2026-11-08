"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Ticket } from "lucide-react";
import { saveCouponAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Coupon } from "@/lib/admin";

export default function CouponForm({ coupon }: { coupon?: Coupon }) {
  const [state, action] = useActionState<AdminState, FormData>(saveCouponAction, {});
  const editing = Boolean(coupon);

  return (
    <form action={action} className={editing ? "mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3" : "admin-card p-5"}>
      {coupon && <input type="hidden" name="id" value={coupon.id} />}
      {!editing && (
        <>
          <h3 className="text-[13px] font-bold text-slate-900">Create a coupon</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Discounts are validated server-side at checkout.</p>
        </>
      )}

      {state.error && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="code">Code</label>
          <input id="code" name="code" required defaultValue={coupon?.code ?? ""} placeholder="TREK10" className="admin-input uppercase" />
        </div>
        <div>
          <label className="admin-label" htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={coupon?.type ?? "percent"} className="admin-input">
            <option value="percent">Percentage off</option>
            <option value="fixed">Fixed amount off</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="value">Value</label>
          <input id="value" name="value" type="number" min={1} step="0.01" required defaultValue={coupon?.value ?? 10} placeholder="10" className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="min_spend">Minimum spend (NPR)</label>
          <input id="min_spend" name="min_spend" type="number" min={0} defaultValue={coupon?.min_spend ?? 0} className="admin-input" />
        </div>
        <div>
          <label className="admin-label" htmlFor="max_uses">Maximum uses</label>
          <input id="max_uses" name="max_uses" type="number" min={1} defaultValue={coupon?.max_uses ?? 100} className="admin-input" />
        </div>
        <div className="sm:col-span-2">
          <label className="admin-label" htmlFor="expires_at">Expires on (optional)</label>
          <input id="expires_at" name="expires_at" type="date" defaultValue={coupon?.expires_at ?? ""} className="admin-input" />
        </div>
        <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-3.5 py-3 sm:col-span-2">
          <input type="checkbox" name="active" value="1" defaultChecked={coupon ? Boolean(coupon.active) : true} className="h-4 w-4 accent-brand-500" />
          <span className="text-[12px] font-medium text-slate-600">Active and redeemable</span>
        </label>
        <div className="sm:col-span-2">
          <SubmitButton className="w-full">
            <Ticket className="h-3.5 w-3.5" /> {editing ? "Save coupon" : "Create coupon"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
