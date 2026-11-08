import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MessageSquare, MessagesSquare, Trash2 } from "lucide-react";
import { requireUser } from "@/lib/guards";
import { getConversations } from "@/lib/queries";
import { deleteConversationAction } from "@/app/actions/dashboard";
import { dateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Assistant chats" };

export default async function ConversationsPage() {
  const session = await requireUser("/dashboard/conversations");
  const conversations = await getConversations(session.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Your conversations</p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Assistant chats</h1>
          <p className="mt-1 text-[12.5px] text-muted">Every question you ask the assistant is saved here for later.</p>
        </div>
        <Link href="/" className="btn-outline btn-sm"><MessageSquare className="h-4 w-4" /> Ask something new</Link>
      </div>

      {conversations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-line bg-white p-12 text-center">
          <MessagesSquare className="mx-auto h-9 w-9 text-brand-400" />
          <h2 className="mt-3 text-[16px] font-semibold text-ink">No conversations yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-[12px] text-muted">Use the assistant bubble on any page to ask about routes, permits, seasons or gear. Chats with a signed-in account appear here.</p>
          <Link href="/" className="btn-primary btn-sm mt-4">Start a chat</Link>
        </div>
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
          {conversations.map((c) => (
            <div key={c.id} className="flex items-center gap-3 px-5 py-3.5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600"><MessagesSquare className="h-4 w-4" /></span>
              <Link href={`/dashboard/conversations/${c.id}`} className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-ink hover:text-forest">{c.title}</p>
                <p className="text-[10.5px] text-muted">{c.message_count} messages · updated {dateTime(c.updated_at)}</p>
              </Link>
              <Link href={`/dashboard/conversations/${c.id}`} className="hidden shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-forest sm:inline-flex">Open <ArrowRight className="h-3.5 w-3.5" /></Link>
              <form action={deleteConversationAction}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-red-50 hover:text-red-600" aria-label="Delete conversation"><Trash2 className="h-3.5 w-3.5" /></button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
