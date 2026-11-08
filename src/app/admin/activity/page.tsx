import type { Metadata } from "next";
import { requireAdmin } from "@/lib/guards";
import { getAdminActivity } from "@/lib/admin";
import { EmptyState, PageHeader, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import { dateTime } from "@/lib/utils";

export const metadata: Metadata = { title: "Activity log", robots: { index: false } };
export const dynamic = "force-dynamic";

const actionStyles: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700",
  update: "bg-blue-50 text-blue-700",
  delete: "bg-rose-50 text-rose-700",
  login: "bg-slate-100 text-slate-600",
  approve: "bg-emerald-50 text-emerald-700",
  reject: "bg-amber-50 text-amber-700",
  reply: "bg-brand-50 text-forest",
};

export default async function AdminActivityPage() {
  await requireAdmin();
  const rows = await getAdminActivity();

  return (
    <div>
      <PageHeader title="Activity log" description="An audit trail of administrative actions — who changed what, when, and from where." />

      {rows.length === 0 ? (
        <EmptyState title="No activity yet" description="Admin actions will be recorded here automatically." />
      ) : (
        <TableWrap>
          <thead className="border-b border-slate-100 bg-slate-50/60">
            <tr>
              <Th>When</Th>
              <Th>Administrator</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Details</Th>
              <Th>IP</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/60">
                <Td className="whitespace-nowrap text-slate-400">{dateTime(r.created_at)}</Td>
                <Td className="font-medium text-slate-700">{r.name ?? "System"}</Td>
                <Td>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize ${actionStyles[r.action] ?? "bg-slate-100 text-slate-600"}`}>
                    {r.action}
                  </span>
                </Td>
                <Td className="capitalize">
                  {r.entity ?? "—"}{r.entity_id ? <span className="text-slate-400"> #{r.entity_id}</span> : null}
                </Td>
                <Td className="max-w-[380px] text-slate-600">{r.details ?? "—"}</Td>
                <Td className="font-mono text-[10.5px] text-slate-400">{r.ip ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}
