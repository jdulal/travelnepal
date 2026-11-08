import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { exec, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";
import { generateChatReply } from "@/lib/ai";
import { rateLimit, clientKey } from "@/lib/rate-limit";

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  let body: { messages?: Msg[]; conversationId?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const messages = (body.messages || [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUser) return NextResponse.json({ error: "Say something first." }, { status: 400 });

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(clientKey("ai-chat", ip), 40, 10 * 60 * 1000);
  if (!limit.allowed) return NextResponse.json({ reply: "You're sending messages quickly. Please take a short break and try again." });

  const reply = await generateChatReply(messages);

  const session = await getSession();
  let conversationId = body.conversationId ? Number(body.conversationId) : null;

  if (session) {
    if (conversationId) {
      const owned = await q1<{ id: number }>("SELECT id FROM conversations WHERE id = ? AND user_id = ?", [conversationId, session.id]);
      if (!owned) conversationId = null;
    }
    if (!conversationId) {
      const result = await exec("INSERT INTO conversations (user_id, title) VALUES (?, ?)", [
        session.id,
        lastUser.content.slice(0, 100),
      ]);
      conversationId = result.insertId;
    }
    await exec("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'user', ?)", [conversationId, lastUser.content]);
    await exec("INSERT INTO messages (conversation_id, role, content) VALUES (?, 'assistant', ?)", [conversationId, reply]);
    await exec("UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", [conversationId]);
  }

  return NextResponse.json({ reply, conversationId });
}
