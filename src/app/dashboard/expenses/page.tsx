import type { Metadata } from "next";
import Link from "next/link";
import { Camera, ReceiptText, Salad, ScanLine, Trash2, Wallet } from "lucide-react";
import ExpenseForm from "@/components/dashboard/ExpenseForm";
import { requireUser } from "@/lib/guards";
import { getExpenses, getScans } from "@/lib/queries";
import { deleteExpenseAction, deleteScanAction } from "@/app/actions/dashboard";
import { npr, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Expenses & scans" };

const labels: Record<string, string> = {
  food: "Food & drink",
  transport: "Transport",
  stay: "Accommodation",
  activities: "Activities",
  shopping: "Shopping",
  other: "Other",
};

const scanIcons = { landmark: Camera, receipt: ReceiptText, food: Salad };

export default async function ExpensesPage() {
  const session = await requireUser("/dashboard/expenses");
  const [expenses, scans] = await Promise.all([getExpenses(session.id), getScans(session.id)]);
  const total = expenses.byCategory.reduce((sum, c) => sum + Number(c.total), 0);
  const max = Math.max(...expenses.byCategory.map((c) => Number(c.total)), 1);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kathmandu" });

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">On-trip money</p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Expenses &amp; scans</h1>
        <p className="mt-1 text-[12.5px] text-muted">Log what you spend on the road, and keep the receipt and food scans you make with the assistant.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-forest p-5 text-white">
          <Wallet className="h-5 w-5 text-brand-200" />
          <p className="mt-3 text-[10px] uppercase tracking-wide text-white/55">Total logged</p>
          <p className="text-[24px] font-bold">{npr(total)}</p>
          <p className="text-[10px] text-white/50">{expenses.items.length} expenses</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 sm:col-span-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted">By category</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {expenses.byCategory.length === 0 && <p className="text-[11.5px] text-muted">No expenses yet — add your first on the right.</p>}
            {expenses.byCategory.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="text-muted">{labels[c.category] ?? c.category}</span>
                  <span className="font-semibold text-ink">{npr(Number(c.total))}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.max(4, (Number(c.total) / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr] xl:items-start">
        <section className="rounded-3xl border border-line bg-white shadow-card">
          <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
            <h2 className="text-[14px] font-semibold text-ink">Expense log</h2>
            <span className="text-[10.5px] text-muted">Last 50</span>
          </div>
          {expenses.items.length === 0 ? (
            <p className="px-5 py-10 text-center text-[12px] text-muted">Nothing logged yet. Add an expense to start tracking your trip budget.</p>
          ) : (
            <ul className="divide-y divide-line">
              {expenses.items.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mist text-[9px] font-bold uppercase text-forest">{e.category.slice(0, 2)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-medium text-ink">{e.label}</p>
                    <p className="text-[10px] text-muted">{shortDate(e.spent_on)} · {labels[e.category] ?? e.category}{e.note ? ` · ${e.note}` : ""}</p>
                  </div>
                  <span className="shrink-0 text-[12px] font-semibold text-forest">{e.currency} {Number(e.amount).toLocaleString("en-IN")}</span>
                  <form action={deleteExpenseAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="grid h-7 w-7 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete expense"><Trash2 className="h-3.5 w-3.5" /></button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <ExpenseForm today={today} />
          <div className="rounded-2xl border border-dashed border-brand-200 bg-brand-50/40 p-4 text-[11px] leading-relaxed text-forest/80">
            <ScanLine className="h-4 w-4" />
            <p className="mt-1.5 font-semibold">Scan receipts, food and landmarks</p>
            <p className="mt-0.5">Open the assistant bubble on any public page and use the camera tools. Receipt scans are added to this expense log automatically.</p>
            <Link href="/" className="mt-2 inline-flex font-semibold text-brand-700 hover:text-forest">Go to the site →</Link>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-line bg-white shadow-card">
        <div className="flex items-center justify-between gap-2 border-b border-line px-5 py-4">
          <h2 className="text-[14px] font-semibold text-ink">My scans</h2>
          <span className="text-[10.5px] text-muted">{scans.length} saved</span>
        </div>
        {scans.length === 0 ? (
          <p className="px-5 py-8 text-center text-[12px] text-muted">No scans yet. Landmark, receipt and food scans you make while signed in show up here.</p>
        ) : (
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            {scans.map((s) => {
              const Icon = scanIcons[s.type];
              return (
                <article key={s.id} className="flex items-start gap-3 rounded-2xl border border-line p-3.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[12px] font-semibold text-ink">{s.title}</p>
                      <form action={deleteScanAction}>
                        <input type="hidden" name="id" value={s.id} />
                        <button type="submit" className="text-muted hover:text-red-600" aria-label="Delete scan"><Trash2 className="h-3.5 w-3.5" /></button>
                      </form>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[10.5px] text-muted">{s.summary}</p>
                    <p className="mt-1 text-[9.5px] text-muted/80">{shortDate(s.created_at)} · {s.type}</p>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
