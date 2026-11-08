import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed: "bg-blue-50 text-blue-700 ring-blue-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  unpaid: "bg-slate-100 text-slate-600 ring-slate-200",
  refunded: "bg-violet-50 text-violet-700 ring-violet-200",
  new: "bg-brand-50 text-forest ring-brand-200",
  read: "bg-slate-100 text-slate-600 ring-slate-200",
  replied: "bg-blue-50 text-blue-700 ring-blue-200",
  closed: "bg-slate-100 text-slate-500 ring-slate-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  draft: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  rejected: "bg-rose-50 text-rose-700 ring-rose-200",
  hidden: "bg-slate-100 text-slate-500 ring-slate-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blocked: "bg-rose-50 text-rose-700 ring-rose-200",
  admin: "bg-forest text-white ring-forest",
  user: "bg-slate-100 text-slate-600 ring-slate-200",
  open: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  full: "bg-rose-50 text-rose-700 ring-rose-200",
  easy: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  moderate: "bg-amber-50 text-amber-700 ring-amber-200",
  challenging: "bg-orange-50 text-orange-700 ring-orange-200",
  strenuous: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusPill({ status, className }: { status: string | null | undefined; className?: string }) {
  const key = String(status ?? "").toLowerCase();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-bold capitalize ring-1",
        toneMap[key] ?? "bg-slate-100 text-slate-600 ring-slate-200",
        className
      )}
    >
      {status ?? "—"}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: { href: string; label: string; icon?: LucideIcon };
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-slate-900">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-slate-500">{description}</p>}
      </div>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-brand-600">
          {action.icon && <action.icon className="h-4 w-4" />}
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "brand",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  tone?: "brand" | "forest" | "amber" | "blue" | "rose";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    forest: "bg-forest/10 text-forest",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="admin-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
          <p className="mt-1.5 text-[24px] font-bold leading-none tracking-tight text-slate-900">{value}</p>
          {hint && <p className="mt-1.5 text-[10.5px] text-slate-400">{hint}</p>}
        </div>
        <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tones[tone])}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

export function Banner({ kind = "success", children }: { kind?: "success" | "error" | "info"; children: React.ReactNode }) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-brand-200 bg-brand-50 text-forest",
  };
  return <div className={cn("mb-4 rounded-xl border px-4 py-2.5 text-[12.5px] font-medium", styles[kind])}>{children}</div>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="admin-card grid place-items-center px-6 py-14 text-center">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12px] text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Th({ children, className }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={cn("whitespace-nowrap px-3 py-2.5 text-left text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400", className)}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children?: React.ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={cn("px-3 py-3 align-middle text-[12.5px] text-slate-600", className)}>{children}</td>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">{children}</table>
      </div>
    </div>
  );
}
