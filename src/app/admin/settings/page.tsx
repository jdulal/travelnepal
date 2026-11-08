import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { getAdminSettings } from "@/lib/admin";
import SettingsForm from "@/components/admin/SettingsForm";

export const metadata: Metadata = { title: "Settings", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  await requireAdmin();
  const rows = await getAdminSettings();

  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Settings</h2>
        <p className="mt-1 max-w-2xl text-[12.5px] text-slate-500">
          Global storefront configuration. Changes are revalidated immediately; no deploy required.
        </p>
      </div>
      <SettingsForm rows={rows} />
    </div>
  );
}
