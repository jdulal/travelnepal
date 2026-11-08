import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations } from "@/lib/admin";
import { deleteDestinationAction } from "@/app/actions/admin";
import DestinationForm from "@/components/admin/DestinationForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";

export const metadata: Metadata = { title: "Edit destination", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditDestinationPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const destinations = await getAdminDestinations();
  const destination = destinations.find((d) => d.id === Number(id));
  if (!destination) notFound();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400">Destination #{destination.id}</p>
        <h2 className="mt-1 text-[22px] font-bold tracking-tight text-slate-900">{destination.name}</h2>
      </div>

      <DestinationForm destination={destination} />

      <div className="admin-card flex flex-wrap items-center justify-between gap-3 border-rose-100 p-4">
        <div>
          <p className="text-[12.5px] font-bold text-rose-600">Delete this destination</p>
          <p className="text-[11px] text-slate-400">Trips keep existing but lose their destination link.</p>
        </div>
        <form action={deleteDestinationAction}>
          <input type="hidden" name="id" value={destination.id} />
          <ConfirmSubmit
            message={`Delete "${destination.name}"? Trips will remain but become unlinked.`}
            className="border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete destination
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
