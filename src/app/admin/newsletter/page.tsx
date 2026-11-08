import type { Metadata } from "next";
import { Download, Mail, Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminNewsletter } from "@/lib/admin";
import { deleteSubscriberAction } from "@/app/actions/admin";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import { shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Newsletter", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  await requireAdmin();
  const subscribers = await getAdminNewsletter();

  return (
    <div>
      <PageHeader title="Newsletter" description="Travellers who subscribed from the footer and blog. Export the list for your email platform." />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="admin-card p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Subscribers</p>
          <p className="mt-1 text-[24px] font-bold text-slate-900">{subscribers.length}</p>
        </div>
        <div className="admin-card p-4">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">Latest signup</p>
          <p className="mt-1 text-[15px] font-bold text-slate-900">{subscribers[0] ? shortDate(subscribers[0].created_at) : "—"}</p>
        </div>
        <a href="/admin/export/newsletter" className="admin-card flex items-center justify-center gap-2 p-4 text-[12px] font-semibold text-forest transition hover:bg-brand-50">
          <Download className="h-4 w-4" /> Export CSV
        </a>
      </div>

      {subscribers.length === 0 ? (
        <EmptyState title="No subscribers yet" description="The footer signup form feeds this list automatically." />
      ) : (
        <TableWrap>
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <Th>Email</Th>
              <Th>Subscribed</Th>
              <Th className="text-right">Remove</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/60">
                <Td>
                  <span className="inline-flex items-center gap-2 font-medium text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-300" /> {s.email}
                  </span>
                </Td>
                <Td className="whitespace-nowrap text-slate-400">{shortDate(s.created_at)}</Td>
                <Td>
                  <form action={deleteSubscriberAction} className="flex justify-end">
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmSubmit message={`Remove ${s.email} from the newsletter?`} className="text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmSubmit>
                  </form>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
