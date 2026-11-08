import type { Metadata } from "next";
import Link from "next/link";
import { Check, Star, Trash2, X } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminReviews } from "@/lib/admin";
import { moderateReviewAction } from "@/app/actions/admin";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { EmptyState, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import { cn, dateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Reviews", robots: { index: false } };
export const dynamic = "force-dynamic";

const filters = ["pending", "approved", "rejected", "all"] as const;

export default async function AdminReviewsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = filters.includes((status ?? "pending") as (typeof filters)[number]) ? status ?? "pending" : "pending";
  const all = await getAdminReviews();
  const reviews = active === "all" ? all : all.filter((r) => r.status === active);
  const counts = {
    pending: all.filter((r) => r.status === "pending").length,
    approved: all.filter((r) => r.status === "approved").length,
    rejected: all.filter((r) => r.status === "rejected").length,
  };

  return (
    <div>
      <PageHeader
        title="Reviews"
        description="Approve genuine traveller feedback and remove spam. Trip ratings recalculate automatically after every decision."
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Link
            key={f}
            href={`/admin/reviews?status=${f}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11.5px] font-semibold capitalize ring-1 transition",
              active === f ? "bg-forest text-white ring-forest" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {f === "all" ? "All" : f}
            {f !== "all" && <span className="ml-1 opacity-70">{counts[f]}</span>}
          </Link>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState title="Nothing here" description={active === "pending" ? "No reviews are waiting for moderation." : "No reviews with this status."} />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="admin-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-800">{r.name}</p>
                    <StatusPill status={r.status} />
                  </div>
                  <div className="mt-1 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={cn("h-3 w-3", n <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                    ))}
                    <span className="ml-1.5 text-[10.5px] text-slate-400">{dateTime(r.created_at)}</span>
                  </div>
                </div>
                <Link href={`/tours/${r.trip_slug}`} className="max-w-[150px] truncate text-[11px] font-semibold text-brand-600 hover:text-forest">
                  {r.trip_title}
                </Link>
              </div>

              {r.title && <p className="mt-2.5 text-[12.5px] font-semibold text-slate-700">{r.title}</p>}
              <p className="mt-1 text-[12px] leading-relaxed text-slate-500">{r.body}</p>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2.5">
                {r.status !== "approved" && (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="approve" />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100">
                      <Check className="h-3 w-3" /> Approve
                    </button>
                  </form>
                )}
                {r.status !== "rejected" && (
                  <form action={moderateReviewAction}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="action" value="reject" />
                    <button type="submit" className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-100">
                      <X className="h-3 w-3" /> Reject
                    </button>
                  </form>
                )}
                <form action={moderateReviewAction} className="ml-auto">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="action" value="delete" />
                  <ConfirmSubmit message="Delete this review permanently?" className="text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
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
