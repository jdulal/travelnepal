"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2, Save } from "lucide-react";
import { saveSettingsAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";

type Row = { setting_key: string; setting_value: string | null };

const groups: { title: string; hint: string; fields: { key: string; label: string; hint?: string; type?: string }[] }[] = [
  {
    title: "Site identity",
    hint: "Copy used across the homepage, footer and metadata.",
    fields: [
      { key: "site_name", label: "Site name" },
      { key: "tagline", label: "Tagline" },
      { key: "hero_headline", label: "Hero headline" },
    ],
  },
  {
    title: "Contact details",
    hint: "Shown on the contact page, footer and booking emails.",
    fields: [
      { key: "contact_email", label: "Support email", type: "email" },
      { key: "contact_phone", label: "Phone" },
      { key: "whatsapp", label: "WhatsApp number" },
      { key: "address", label: "Office address" },
      { key: "office_hours", label: "Office hours" },
    ],
  },
  {
    title: "Social profiles",
    hint: "Leave blank to hide a profile from the footer.",
    fields: [
      { key: "instagram", label: "Instagram URL" },
      { key: "facebook", label: "Facebook URL" },
      { key: "youtube", label: "YouTube URL" },
    ],
  },
  {
    title: "Booking & currency",
    hint: "Exchange rates are indicative; deposits are charged at booking time.",
    fields: [
      { key: "booking_deposit_percent", label: "Deposit (%)", type: "number" },
      { key: "currency_usd_rate", label: "USD rate (1 NPR =)", type: "number" },
      { key: "currency_eur_rate", label: "EUR rate (1 NPR =)", type: "number" },
    ],
  },
];

export default function SettingsForm({ rows }: { rows: Row[] }) {
  const [state, action] = useActionState<AdminState, FormData>(saveSettingsAction, {});
  const map = Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value ?? ""]));
  const known = new Set(groups.flatMap((g) => g.fields.map((f) => f.key)));
  const extras = rows.filter((r) => !known.has(r.setting_key));

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}
      {state.ok && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[12px] text-emerald-700">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {state.message}
        </div>
      )}

      {groups.map((group) => (
        <div key={group.title} className="admin-card p-5">
          <h3 className="text-[13px] font-bold text-slate-900">{group.title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{group.hint}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.key}>
                <label className="admin-label" htmlFor={`setting__${field.key}`}>{field.label}</label>
                <input
                  id={`setting__${field.key}`}
                  name={`setting__${field.key}`}
                  type={field.type ?? "text"}
                  step={field.type === "number" ? "any" : undefined}
                  defaultValue={map[field.key] ?? ""}
                  className="admin-input"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {extras.length > 0 && (
        <div className="admin-card p-5">
          <h3 className="text-[13px] font-bold text-slate-900">Other settings</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">Additional keys stored in the settings table.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {extras.map((row) => (
              <div key={row.setting_key}>
                <label className="admin-label" htmlFor={`setting__${row.setting_key}`}>{row.setting_key.replace(/_/g, " ")}</label>
                <input id={`setting__${row.setting_key}`} name={`setting__${row.setting_key}`} defaultValue={row.setting_value ?? ""} className="admin-input" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end pb-6">
        <SubmitButton className="bg-forest px-6 hover:bg-forest-deep">
          <Save className="h-3.5 w-3.5" /> Save settings
        </SubmitButton>
      </div>
    </form>
  );
}
