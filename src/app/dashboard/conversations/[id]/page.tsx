import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import ConversationChat from "@/components/dashboard/ConversationChat";
import { requireUser } from "@/lib/guards";
import { getConversation } from "@/lib/queries";
import { dateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireUser("/dashboard/conversations");
  const { id } = await params;
  const data = await getConversation(Number(id), session.id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/dashboard/conversations" className="inline-flex items-center gap-1 text-[11.5px] font-medium text-muted hover:text-forest"><ArrowLeft className="h-3.5 w-3.5" /> All chats</Link>
          <h1 className="mt-1.5 text-[21px] font-semibold tracking-[-0.02em] text-ink">{data.conversation.title}</h1>
          <p className="flex items-center gap-1 text-[10.5px] text-muted"><MessagesSquare className="h-3 w-3" /> {data.messages.length} messages · started {dateTime(data.conversation.updated_at)}</p>
        </div>
      </div>
      <ConversationChat conversationId={data.conversation.id} initial={data.messages.map((m) => ({ role: m.role, content: m.content }))} />
    </div>
  );
}
