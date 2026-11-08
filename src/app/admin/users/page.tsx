import type { Metadata } from "next";
import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminUsers } from "@/lib/admin";
import { updateUserAction } from "@/app/actions/admin";
import { Banner, PageHeader, StatusPill, TableWrap, Td, Th } from "@/components/admin/AdminUI";
import { initials, npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; saved?: string; error?: string }>;
}) {
  const admin = await requireAdmin();
  const { q, saved, error } = await searchParams;
  const users = await getAdminUsers();
  const needle = (q ?? "").toLowerCase().trim();
  const filtered = needle
    ? users.filter((u) => `${u.name} ${u.email} ${u.username ?? ""} ${u.country}`.toLowerCase().includes(needle))
    : users;

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Registered travellers, their booking history and account status. Promote trusted staff to administrator here."
      />

      {saved && <Banner kind="success">Customer updated.</Banner>}
      {error === "self" && <Banner kind="error">You cannot change your own role or status from this screen.</Banner>}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <form action="/admin/users" className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Name, email, username or country"
              className="w-64 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-[12px] text-slate-700 placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            />
          </div>
          <button type="submit" className="admin-btn-ghost py-2 text-[12px]">Search</button>
        </form>
        <a href="/admin/export/users" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[12px] font-semibold text-slate-600 hover:bg-slate-50">
          <Download className="h-3.5 w-3.5" /> CSV
        </a>
      </div>

      <TableWrap>
        <thead className="border-b border-slate-100 bg-slate-50/60">
          <tr>
            <Th>Customer</Th>
            <Th>Country</Th>
            <Th>Bookings</Th>
            <Th>Paid spend</Th>
            <Th>Joined</Th>
            <Th>Role</Th>
            <Th>Status</Th>
            <Th className="text-right">Save</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filtered.length === 0 && (
            <tr><Td colSpan={8} className="py-10 text-center text-slate-400">No customers match.</Td></tr>
          )}
          {filtered.map((u) => {
            const self = u.id === admin.id;
            return (
              <tr key={u.id} className="hover:bg-slate-50/60">
                <Td>
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-50 text-[10px] font-bold text-forest ring-1 ring-brand-200">
                      {initials(u.name)}
                    </span>
                    <div className="min-w-0">
                      <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                        {u.name}
                        {self && <span className="rounded bg-slate-100 px-1 py-0.5 text-[9px] font-bold uppercase text-slate-400">You</span>}
                      </span>
                      <span className="block text-[10.5px] text-slate-400">{u.email}{u.username ? ` · @${u.username}` : ""}</span>
                    </div>
                  </div>
                </Td>
                <Td>{u.country}</Td>
                <Td>{u.booking_count}</Td>
                <Td className="font-semibold text-slate-700">{npr(u.spend)}</Td>
                <Td className="whitespace-nowrap text-slate-400">{shortDate(u.created_at)}</Td>
                <Td><StatusPill status={u.role} /></Td>
                <Td><StatusPill status={u.status} /></Td>
                <Td>
                  {self ? (
                    <span className="block text-right text-[10.5px] text-slate-300">—</span>
                  ) : (
                    <form action={updateUserAction} className="flex items-center justify-end gap-1.5">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-600">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <select name="status" defaultValue={u.status} className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-600">
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                      </select>
                      <button type="submit" className="rounded-lg bg-slate-900 px-2 py-1 text-[10.5px] font-semibold text-white hover:bg-slate-700">Save</button>
                    </form>
                  )}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </TableWrap>

      <p className="mt-3 text-[10.5px] text-slate-400">
        Showing {filtered.length} of {users.length} accounts · <Link href="/admin/activity" className="font-semibold text-brand-600 hover:text-forest">View admin activity log</Link>
      </p>
    </div>
  );
}
