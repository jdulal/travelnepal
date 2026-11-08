"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { saveFaqAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Faq } from "@/lib/admin";

export default function FaqForm({ faq }: { faq?: Faq }) {
  const [state, action] = useActionState<AdminState, FormData>(saveFaqAction, {});
  const editing = Boolean(faq);

  return (
    <form action={action} className={editing ? "mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3" : "rounded-xl border border-dashed border-slate-200 p-3.5"}>
      {faq && <input type="hidden" name="id" value={faq.id} />}
      {state.error && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11.5px] text-rose-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="mb-2 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[11.5px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {state.message}
        </div>
      )}
      <div className="grid gap-2.5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <input name="question" required defaultValue={faq?.question ?? ""} placeholder="Question — e.g. Do I need travel insurance?" className="admin-input" />
        </div>
        <div className="sm:col-span-2">
          <textarea name="answer" required rows={3} defaultValue={faq?.answer ?? ""} placeholder="Answer shown in the FAQ accordion." className="admin-input resize-none" />
        </div>
        <input name="category" defaultValue={faq?.category ?? "General"} placeholder="Category" className="admin-input" />
        <input name="sort_order" type="number" defaultValue={faq?.sort_order ?? 0} placeholder="Sort order" className="admin-input" />
        <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11.5px] text-slate-600 sm:col-span-2">
          <input type="checkbox" name="active" value="1" defaultChecked={faq ? Boolean(faq.active) : true} className="h-4 w-4 accent-brand-500" />
          Visible on the public FAQ page
        </label>
        <div className="sm:col-span-2">
          <SubmitButton className="w-full">
            <HelpCircle className="h-3.5 w-3.5" /> {editing ? "Save FAQ" : "Add FAQ"}
          </SubmitButton>
        </div>
      </div>
    </form>
  );
}
