import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations } from "@/lib/admin";
import StoryForm from "@/components/admin/StoryForm";

export const metadata: Metadata = { title: "New story", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function NewStoryPage() {
  await requireAdmin();
  const destinations = await getAdminDestinations();
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">Write a story</h2>
        <p className="mt-1 text-[12.5px] text-slate-500">Share a journey, a place or a piece of local knowledge with travellers.</p>
      </div>
      <StoryForm destinations={destinations} />
    </div>
  );
}
