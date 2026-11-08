import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import DestinationForm from "@/components/admin/DestinationForm";

export const metadata: Metadata = { title: "New destination", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewDestinationPage() {
  await requireAdmin();
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Create a destination</h2>
        <p className="mt-1 text-[12.5px] text-slate-500">Group trips under a region so travellers can browse Nepal by place.</p>
      </div>
      <DestinationForm />
    </div>
  );
}
