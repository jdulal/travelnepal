"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

export default function ConversationChat({ conversationId, initial }: { conversationId: number; initial: Msg[] }) {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, conversationId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not reply right now.");
      setMessages((prev) => [...prev, { role: "assistant", content: String(data.reply) }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-forest text-white"><Sparkles className="h-4 w-4 text-brand-200" /></span>
        <div>
          <p className="text-[12.5px] font-semibold text-ink">Nepal Travel assistant</p>
          <p className="text-[9.5px] text-muted">Saved conversation · replies may use offline knowledge</p>
        </div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-mist/40 p-4">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed", m.role === "user" ? "rounded-br-md bg-forest text-white" : "rounded-bl-md bg-white text-body/85 ring-1 ring-line")}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && <div className="flex justify-start"><div className="rounded-2xl rounded-bl-md bg-white px-3.5 py-2.5 text-[11px] text-muted ring-1 ring-line"><Loader2 className="inline h-3.5 w-3.5 animate-spin" /> Thinking…</div></div>}
        {error && <p className="text-center text-[11px] text-red-700">{error}</p>}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a follow-up…" className="field h-10 flex-1" maxLength={2000} />
        <button type="submit" disabled={sending || !input.trim()} className="btn-primary btn-sm h-10"><Send className="h-4 w-4" /></button>
      </form>
    </div>
  );
}
