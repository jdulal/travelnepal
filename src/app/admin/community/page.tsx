import type { Metadata } from "next";
import { Eye, EyeOff, Heart, MessageCircle, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminPosts } from "@/lib/admin";
import { moderatePostAction } from "@/app/actions/admin";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { EmptyState, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import SmartImage from "@/components/site/SmartImage";
import { dateTime, initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Community", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminCommunityPage() {
  await requireAdmin();
  const posts = await getAdminPosts();

  return (
    <div>
      <PageHeader
        title="Community"
        description="Traveller posts from the public feed. Hide anything off-topic or harmful; hidden posts disappear from the site immediately."
      />

      {posts.length === 0 ? (
        <EmptyState title="No community posts yet" description="Traveller stories and questions will appear here for moderation." />
      ) : (
        <div className="space-y-2.5">
          {posts.map((p) => (
            <div key={p.id} className="admin-card flex flex-col gap-3 p-4 sm:flex-row">
              {p.image && (
                <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-20 sm:w-28">
                  <SmartImage src={p.image} alt={p.title} fill sizes="112px" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-50 text-[9px] font-bold text-forest ring-1 ring-brand-200">{initials(p.author_name)}</span>
                  <span className="text-[12px] font-semibold text-slate-700">{p.author_name}</span>
                  {p.destination_name && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{p.destination_name}</span>}
                  <StatusPill status={p.status} />
                  <span className="ml-auto text-[10.5px] text-slate-400">{dateTime(p.created_at)}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold text-slate-800">{p.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-relaxed text-slate-500">{p.body}</p>
                <div className="mt-2 flex items-center gap-4 text-[10.5px] text-slate-400">
                  <span className="inline-flex items-center gap-1"><Heart className="h-3 w-3" /> {p.like_count}</span>
                  <span className="inline-flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {p.comment_count}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 sm:flex-col sm:items-end sm:justify-center">
                <form action={moderatePostAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="action" value={p.status === "published" ? "hide" : "publish"} />
                  <button type="submit" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10.5px] font-semibold text-slate-600 hover:bg-slate-50">
                    {p.status === "published" ? <><EyeOff className="h-3 w-3" /> Hide</> : <><Eye className="h-3 w-3" /> Publish</>}
                  </button>
                </form>
                <form action={moderatePostAction}>
                  <input type="hidden" name="id" value={p.id} />
                  <input type="hidden" name="action" value="delete" />
                  <ConfirmSubmit message="Delete this post and its comments?" className="border border-slate-200 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </ConfirmSubmit>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
