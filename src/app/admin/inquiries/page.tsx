import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminInquiries } from "@/lib/admin";
import { setInquiryStatusAction } from "@/app/actions/admin";
import { EmptyState, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import { cn, dateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Inquiries", robots: { index: false } };
export const dynamic = "force-dynamic";

const statuses = ["new", "read", "replied", "closed", "all"] as const;

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireAdmin();
  const { status } = await searchParams;
  const active = statuses.includes((status ?? "all") as (typeof statuses)[number]) ? status ?? "all" : "all";
  const all = await getAdminInquiries();
  const inquiries = active === "all" ? all : all.filter((i) => i.status === active);
  const newCount = all.filter((i) => i.status === "new").length;

  return (
    <div>
      <PageHeader
        title="Inquiries"
        description="Messages from the contact form, trip pages and custom itinerary requests. Reply by email, then update the status."
      />

      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {statuses.map((s) => (
          <Link
            key={s}
            href={`/admin/inquiries?status=${s}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-[11.5px] font-semibold capitalize ring-1 transition",
              active === s ? "bg-forest text-white ring-forest" : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            )}
          >
            {s === "all" ? "All messages" : s}
            {s === "new" && newCount > 0 && <span className="ml-1 rounded-full bg-brand-500 px-1.5 text-[9px] text-white">{newCount}</span>}
          </Link>
        ))}
      </div>

      {inquiries.length === 0 ? (
        <EmptyState title="No messages" description="New inquiries from travellers will land here." />
      ) : (
        <div className="space-y-2.5">
          {inquiries.map((i) => (
            <details key={i.id} className="admin-card group p-4 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer flex-wrap items-center gap-2">
                <span className={cn("h-2 w-2 shrink-0 rounded-full", i.status === "new" ? "bg-brand-500" : "bg-slate-200")} />
                <span className="text-[13px] font-semibold text-slate-800">{i.subject}</span>
                <StatusPill status={i.status} />
                <span className="ml-auto text-[10.5px] text-slate-400">{i.name} · {dateTime(i.created_at)}</span>
              </summary>
              <div className="mt-3 border-t border-slate-100 pt-3">
                <p className="whitespace-pre-line text-[12.5px] leading-relaxed text-slate-600">{i.message}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-[11.5px]">
                  <a href={`mailto:${i.email}?subject=Re: ${encodeURIComponent(i.subject)}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:text-forest">
                    <Mail className="h-3.5 w-3.5" /> {i.email}
                  </a>
                  {i.phone && <span className="inline-flex items-center gap-1.5 text-slate-500"><Phone className="h-3.5 w-3.5" /> {i.phone}</span>}
                </div>
              </div>
              <form action={setInquiryStatusAction} className="mt-3 flex items-center gap-2">
                <input type="hidden" name="id" value={i.id} />
                <select name="status" defaultValue={i.status} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] text-slate-600">
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed</option>
                </select>
                <button type="submit" className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[10.5px] font-semibold text-white hover:bg-slate-700">Update status</button>
              </form>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
