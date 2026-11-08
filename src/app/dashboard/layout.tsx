import Link from "next/link";
import { Bell, ChevronRight, LogOut, ShieldCheck } from "lucide-react";
import Logo from "@/components/site/Logo";
import Sidebar from "@/components/dashboard/Sidebar";
import MobileDashNav from "@/components/dashboard/MobileDashNav";
import { requireUser } from "@/lib/guards";
import { getNotifications } from "@/lib/queries";
import { signOutAction } from "@/app/actions/auth";
import { initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const notifications = await getNotifications(session.id);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="min-h-screen bg-mist">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="lg:hidden"><Logo /></div>
          <div className="hidden items-center gap-1.5 text-[11.5px] text-muted lg:flex">
            <Link href="/" className="hover:text-forest">Nepal Travel</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-medium text-ink">My account</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/notifications" className="relative grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-muted hover:text-forest" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-500 px-1 text-[8.5px] font-bold text-white">{unread}</span>}
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 hover:border-brand-200">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-forest text-[9.5px] font-bold text-white">{initials(session.name)}</span>
              <span className="hidden text-left sm:block">
                <span className="block text-[11px] font-semibold leading-tight text-ink">{session.name}</span>
                <span className="block text-[9px] text-muted">Traveller</span>
              </span>
            </Link>
            {session.role === "admin" && (
              <Link href="/admin" className="hidden items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-[10.5px] font-bold text-forest ring-1 ring-brand-200 sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5" /> Admin
              </Link>
            )}
            <form action={signOutAction}>
              <button type="submit" className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-muted hover:border-red-200 hover:text-red-600" aria-label="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 py-6 sm:px-6">
        <Sidebar unread={unread} />
        <main className="min-w-0 flex-1">
          <MobileDashNav />
          {children}
        </main>
      </div>
    </div>
  );
}
