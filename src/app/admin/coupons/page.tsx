import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminCoupons } from "@/lib/admin";
import { deleteCouponAction } from "@/app/actions/admin";
import CouponForm from "@/components/admin/CouponForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { EmptyState, PageHeader, StatusPill } from "@/components/admin/AdminUI";
import { npr, shortDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Coupons", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  await requireAdmin();
  const coupons = await getAdminCoupons();

  return (
    <div>
      <PageHeader title="Coupons" description="Promotional codes for campaigns, repeat travellers and partnerships." />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-2.5 lg:col-span-2">
          {coupons.length === 0 && <EmptyState title="No coupons yet" description="Create your first discount code to share with travellers." />}
          {coupons.map((c) => (
            <div key={c.id} className="admin-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-forest px-2.5 py-1 font-mono text-[12px] font-bold tracking-wide text-white">{c.code}</span>
                    <StatusPill status={c.active ? "active" : "hidden"} />
                  </div>
                  <p className="mt-1.5 text-[12px] text-slate-600">
                    {c.type === "percent" ? `${Number(c.value)}% off` : `${npr(c.value)} off`} · min spend {npr(c.min_spend)} · used {c.used_count}/{c.max_uses}
                  </p>
                  <p className="text-[10.5px] text-slate-400">
                    {c.expires_at ? `Expires ${shortDate(c.expires_at)}` : "No expiry"} · created {shortDate(c.created_at)}
                  </p>
                </div>
                <form action={deleteCouponAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <ConfirmSubmit message={`Delete coupon ${c.code}?`} className="border border-slate-200 text-rose-500 hover:bg-rose-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </ConfirmSubmit>
                </form>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-[11px] font-semibold text-brand-600 hover:text-forest">Edit coupon</summary>
                <CouponForm coupon={c} />
              </details>
            </div>
          ))}
        </div>
        <div>
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
