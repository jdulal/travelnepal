import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminDestinations, getAdminStory } from "@/lib/admin";
import { deleteStoryAction } from "@/app/actions/admin";
import StoryForm from "@/components/admin/StoryForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { StatusPill } from "@/components/admin/AdminUI";

export const metadata: Metadata = { title: "Edit story", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function EditStoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [story, destinations] = await Promise.all([getAdminStory(Number(id)), getAdminDestinations()]);
  if (!story) notFound();

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-slate-400">Story #{story.id}</p>
        <h2 className="mt-1 flex items-center gap-2 text-[22px] font-bold tracking-tight text-slate-900">
          {story.title} <StatusPill status={story.status} />
        </h2>
      </div>

      <StoryForm story={story} destinations={destinations} />

      <div className="admin-card flex flex-wrap items-center justify-between gap-3 border-rose-100 p-4">
        <div>
          <p className="text-[12.5px] font-bold text-rose-600">Delete this story</p>
          <p className="text-[11px] text-slate-400">Comments on this story are removed too.</p>
        </div>
        <form action={deleteStoryAction}>
          <input type="hidden" name="id" value={story.id} />
          <ConfirmSubmit message={`Delete "${story.title}"?`} className="border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100">
            <Trash2 className="h-3.5 w-3.5" /> Delete story
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}
