"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { updateBookingAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";

export default function BookingUpdateForm({
  id,
  status,
  paymentStatus,
  paymentMethod,
}: {
  id: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string | null;
}) {
  const [state, action] = useActionState<AdminState, FormData>(updateBookingAction, {});

  return (
    <form action={action} className="admin-card p-4">
      <input type="hidden" name="id" value={id} />
      <h3 className="text-[13px] font-bold text-slate-900">Update booking</h3>
      <p className="mt-1 text-[11px] text-slate-400">Seats are adjusted automatically when you confirm or cancel.</p>

      {state.error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}

      <div className="mt-3 space-y-3">
        <div>
          <label className="admin-label" htmlFor="status">Booking status</label>
          <select id="status" name="status" defaultValue={status} className="admin-input">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="payment_status">Payment status</label>
          <select id="payment_status" name="payment_status" defaultValue={paymentStatus} className="admin-input">
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="payment_method">Payment method</label>
          <select id="payment_method" name="payment_method" defaultValue={paymentMethod ?? ""} className="admin-input">
            <option value="">—</option>
            <option value="esewa">eSewa</option>
            <option value="khalti">Khalti</option>
            <option value="card">Card</option>
            <option value="bank">Bank transfer / cash</option>
            <option value="cash">Cash at office</option>
          </select>
        </div>
        <div>
          <label className="admin-label" htmlFor="admin_note">Note to traveller (optional)</label>
          <textarea id="admin_note" name="admin_note" rows={3} placeholder="Included in their dashboard notification" className="admin-input resize-none" />
        </div>
        <SubmitButton className="w-full">Save changes</SubmitButton>
      </div>
    </form>
  );
}
