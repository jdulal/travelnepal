import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { getNotifications } from "@/lib/queries";
import { markNotificationReadAction, markNotificationsReadAction } from "@/app/actions/dashboard";
import { dateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireUser("/dashboard/notifications");
  const notifications = await getNotifications(session.id);
  const unread = notifications.filter((n) => !n.read_at).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Updates</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Notifications</h1>
          <p className="mt-1 text-[12.5px] text-muted">{unread > 0 ? `${unread} unread update${unread === 1 ? "" : "s"}.` : "You're all caught up."}</p>
        </div>
        {unread > 0 && (
          <form action={markNotificationsReadAction}>
            <button type="submit" className="btn-outline btn-sm"><CheckCheck className="h-4 w-4" /> Mark all read</button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <Bell className="mx-auto h-9 w-9 text-brand-400" />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">No notifications yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">Booking updates, trip reminders and account messages will appear here.</p>
          <Link href="/tours" className="btn-primary btn-sm mt-4">Browse trips</Link>
        </div>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
          {notifications.map((n) => (
            <div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${!n.read_at ? "bg-brand-50/30" : ""}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${!n.read_at ? "bg-brand-500" : "bg-line"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-ink">{n.title}</p>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-body/75">{n.message}</p>
                <p className="mt-1 text-[10px] text-muted">{dateTime(n.created_at)}</p>
                {n.link && (
                  <Link href={n.link} className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-forest">
                    Open <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
              {!n.read_at && (
                <form action={markNotificationReadAction}>
                  <input type="hidden" name="id" value={n.id} />
                  <button type="submit" className="rounded-full border border-line px-2.5 py-1 text-[10px] font-semibold text-muted hover:border-brand-300 hover:text-forest">Mark read</button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
