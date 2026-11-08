import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminStories } from "@/lib/admin";
import { deleteStoryAction } from "@/app/actions/admin";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { Banner, PageHeader, StatusPill, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import SmartImage from "@/components/site/SmartImage";
import { dateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Stories", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminStoriesPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  await requireAdmin();
  const { saved } = await searchParams;
  const stories = await getAdminStories();

  return (
    <div>
      <PageHeader
        title="Stories"
        description="Long-form travel journalism and trekking diaries. Published stories appear in the public journal and in search."
        action={{ href: "/admin/stories/new", label: "New story", icon: Plus }}
      />

      {saved && <Banner kind="success">Story saved.</Banner>}

      <TableWrap>
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <Th>Story</Th>
            <Th>Category</Th>
            <Th>Author</Th>
            <Th>Read time</Th>
            <Th>Published</Th>
            <Th>Status</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {stories.length === 0 && (
            <tr><Td colSpan={7} className="py-12 text-center text-slate-400">No stories yet.</Td></tr>
          )}
          {stories.map((s) => (
            <tr key={s.id} className="hover:bg-slate-50/60">
              <Td>
                <div className="flex items-center gap-3">
                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    <SmartImage src={s.cover_image} alt={s.title} fill sizes="56px" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/stories/${s.id}`} className="block max-w-[260px] truncate font-semibold text-slate-800 hover:text-forest">{s.title}</Link>
                    <span className="block text-[10.5px] text-slate-400">/{s.slug}</span>
                  </div>
                </div>
              </Td>
              <Td>{s.category}</Td>
              <Td>{s.author_name}</Td>
              <Td>{s.read_time} min</Td>
              <Td className="whitespace-nowrap text-slate-400">{s.published_at ? dateTime(s.published_at) : "—"}</Td>
              <Td><StatusPill status={s.status} /></Td>
              <Td>
                <div className="flex items-center justify-end gap-1.5">
                  <Link href={`/stories/${s.slug}`} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-forest" aria-label="View story">
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                  <Link href={`/admin/stories/${s.id}`} className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:text-forest" aria-label="Edit story">
                    <Pencil className="h-3.5 w-3.5" />
                  </Link>
                  <form action={deleteStoryAction}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmSubmit message={`Delete "${s.title}"?`} className="border border-slate-200 text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmSubmit>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </TableWrap>
    </div>
  );
}
