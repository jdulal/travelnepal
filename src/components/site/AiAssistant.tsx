"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Loader2,
  Mic,
  MicOff,
  ReceiptText,
  Salad,
  Send,
  Sparkles,
  Upload,
  X,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Tool = "landmark" | "receipt" | "food";
type ToolResult = Record<string, unknown> & { demo?: boolean; note?: string };

type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

const greeting: Msg = {
  role: "assistant",
  content:
    "Namaste! I'm your Nepal Travel assistant. I can plan an itinerary, suggest treks for your dates and fitness, explain permits, or help with anything about travelling in Nepal. What are you dreaming of?",
};

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"home" | "chat" | Tool>("home");
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [listening, setListening] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [toolText, setToolText] = useState("");
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [toolBusy, setToolBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("nt:open-ai", handler);
    return () => window.removeEventListener("nt:open-ai", handler);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, view]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setSending(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-12), conversationId }),
      });
      const data = await res.json();
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages([...next, { role: "assistant", content: data.reply || "Sorry, I could not answer that. Please try again." }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I'm offline for a moment. Please try again shortly, or email hello@nepaltravel.com." }]);
    } finally {
      setSending(false);
    }
  };

  const startVoice = () => {
    const w = window as unknown as { webkitSpeechRecognition?: new () => RecognitionLike; SpeechRecognition?: new () => RecognitionLike };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      setMessages((m) => [...m, { role: "assistant", content: "Voice input isn't supported in this browser. Chrome or Edge works best." }]);
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setListening(false);
      send(transcript);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const pickImage = (file: File) => {
    if (file.size > 4 * 1024 * 1024) {
      setToolResult({ demo: true, note: "Please choose an image under 4 MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setToolResult(null);
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (view === "home" || view === "chat") return;
    if (!image && !toolText.trim()) {
      setToolResult({ note: "Upload a photo or add a short description first." });
      return;
    }
    setToolBusy(true);
    setToolResult(null);
    try {
      const res = await fetch("/api/ai/tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: view, image, text: toolText }),
      });
      setToolResult(await res.json());
    } catch {
      setToolResult({ note: "Could not analyse this right now. Please try again." });
    } finally {
      setToolBusy(false);
    }
  };

  const resetTool = () => {
    setImage(null);
    setToolText("");
    setToolResult(null);
  };

  const openTool = (tool: Tool) => {
    setView(tool);
    resetTool();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group fixed bottom-6 right-6 z-40 hidden h-14 items-center gap-2 rounded-full bg-forest px-4 pr-5 text-white shadow-[0_16px_40px_-12px_rgba(0,79,50,.65)] transition hover:-translate-y-1 hover:bg-forest-deep md:flex"
        aria-label="Open AI travel assistant"
      >
        <span className="relative grid h-9 w-9 place-items-center rounded-full bg-brand-500">
          <Sparkles className="h-4.5 w-4.5" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-forest bg-brand-300" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-[13px] font-semibold">Ask AI</span>
          <span className="block text-[10px] text-white/60">Trip help, instantly</span>
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[95] flex items-end justify-end bg-forest-deep/30 p-0 backdrop-blur-[2px] sm:p-4 md:p-6">
          <div className="absolute inset-0" onClick={() => setOpen(false)} />
          <div className="relative flex h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-white/60 bg-white shadow-float sm:h-[640px] sm:w-[410px] sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-line bg-gradient-to-r from-brand-50 to-white px-4 py-3">
              <div className="flex items-center gap-2.5">
                {view !== "home" && (
                  <button onClick={() => { setView("home"); resetTool(); }} className="grid h-8 w-8 place-items-center rounded-full bg-white text-forest ring-1 ring-brand-100" aria-label="Back">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-white">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Nepal Travel AI</p>
                  <p className="flex items-center gap-1 text-[10px] text-muted"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Online · understands Nepal</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-mist" aria-label="Close assistant">
                <X className="h-4 w-4" />
              </button>
            </div>

            {view === "home" && (
              <div className="flex-1 overflow-y-auto p-4">
                <div className="rounded-2xl rounded-tl-sm bg-mist p-3.5 text-sm leading-relaxed text-body">{greeting.content}</div>
                <p className="mb-2 mt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">What can I help with?</p>
                <div className="space-y-2">
                  <ToolRow icon={<MessageSquare className="h-4 w-4" />} tint="green" title="Ask AI & voice chat" subtitle="Treks, permits, costs, best seasons" onClick={() => setView("chat")} />
                  <ToolRow icon={<Camera className="h-4 w-4" />} tint="blue" title="Identify landmarks" subtitle="Snap a photo of any temple or peak" onClick={() => openTool("landmark")} />
                  <ToolRow icon={<ReceiptText className="h-4 w-4" />} tint="amber" title="Scan travel receipts" subtitle="Extract totals and track expenses" onClick={() => openTool("receipt")} />
                  <ToolRow icon={<Salad className="h-4 w-4" />} tint="rose" title="Food & nutrition" subtitle="Dal bhat, momo and calorie estimates" onClick={() => openTool("food")} />
                </div>
                <p className="mt-4 rounded-xl bg-brand-50/70 px-3 py-2.5 text-[11px] leading-relaxed text-forest/80">
                  Planning a full trip? <a href="/itinerary" className="font-semibold underline">Open the AI itinerary builder</a> for a day-by-day plan you can save and book.
                </p>
              </div>
            )}

            {view === "chat" && (
              <>
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed", m.role === "user" ? "rounded-br-sm bg-forest text-white" : "rounded-tl-sm bg-mist text-body")}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {sending && (
                    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-mist px-3.5 py-3 text-xs text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /> Thinking…
                    </div>
                  )}
                  <div ref={endRef} />
                </div>
                <div className="border-t border-line p-3">
                  <div className="flex items-center gap-1.5 rounded-2xl border border-line bg-white p-1.5 focus-within:border-brand-300">
                    <button onClick={startVoice} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", listening ? "bg-red-50 text-red-500" : "text-muted hover:bg-mist")} aria-label="Voice input">
                      {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </button>
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder={listening ? "Listening…" : "Ask about your Nepal trip…"}
                      className="min-w-0 flex-1 bg-transparent text-[13px]"
                    />
                    <button onClick={() => send()} disabled={sending || !input.trim()} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-500 text-white disabled:opacity-40" aria-label="Send message">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="mt-1.5 text-center text-[9px] text-muted">AI can make mistakes. Confirm permits and prices with our team.</p>
                </div>
              </>
            )}

            {view !== "home" && view !== "chat" && (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  <h3 className="text-base font-semibold text-ink">
                    {view === "landmark" ? "Identify a landmark" : view === "receipt" ? "Scan a travel receipt" : "Check food & nutrition"}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    {view === "landmark"
                      ? "Upload a photo of a temple, stupa or mountain, or describe it, and I'll tell you what it is."
                      : view === "receipt" ? "Upload a photo of a receipt and I'll extract the vendor, total and line items."
                      : "Name a Nepali dish (or upload a photo) for an estimate of calories, macros and allergens."}
                  </p>

                  {!image ? (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-brand-200 bg-brand-50/40 px-4 py-8 text-center transition hover:border-brand-400 hover:bg-brand-50"
                    >
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-brand-600 shadow-soft"><Upload className="h-5 w-5" /></span>
                      <span className="text-sm font-semibold text-forest">Upload a photo</span>
                      <span className="text-[11px] text-muted">JPG or PNG · up to 4 MB</span>
                    </button>
                  ) : (
                    <div className="relative mt-4 overflow-hidden rounded-2xl border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt="Upload preview" className="max-h-56 w-full object-cover" />
                      <button onClick={resetTool} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/90 text-ink shadow" aria-label="Remove image"><X className="h-3.5 w-3.5" /></button>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])} />

                  <label className="label mt-4">{view === "food" ? "Dish name (optional)" : "Description (optional)"}</label>
                  <textarea
                    value={toolText}
                    onChange={(e) => setToolText(e.target.value)}
                    rows={2}
                    placeholder={view === "landmark" ? "e.g. white stupa with Buddha eyes, pigeons…" : view === "receipt" ? "e.g. 2 nights, breakfast included…" : "e.g. dal bhat with chicken and pickle"}
                    className="field resize-none text-[13px]"
                  />

                  <button onClick={analyze} disabled={toolBusy} className="btn-primary mt-3 w-full">
                    {toolBusy ? <><Loader2 className="h-4 w-4 animate-spin" /> Analysing…</> : <><Sparkles className="h-4 w-4" /> Analyse</>}
                  </button>

                  {toolResult && <ResultCard type={view} result={toolResult} />}
                </div>
                <div className="border-t border-line px-4 py-2.5 text-center text-[9px] text-muted">
                  Images are processed for this request only and are not stored.
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ToolRow({ icon, tint, title, subtitle, onClick }: { icon: React.ReactNode; tint: string; title: string; subtitle: string; onClick: () => void }) {
  const colors: Record<string, string> = {
    green: "bg-brand-50 text-brand-600 ring-brand-100",
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    rose: "bg-rose-50 text-rose-600 ring-rose-100",
  };
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-2xl border border-line bg-white p-3 text-left transition hover:border-brand-300 hover:bg-brand-50/30">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1", colors[tint])}>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-semibold text-ink">{title}</span>
        <span className="block truncate text-[11px] text-muted">{subtitle}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted" />
    </button>
  );
}

function ResultCard({ type, result }: { type: Tool; result: ToolResult }) {
  const r = result as Record<string, unknown>;
  const rows: [string, string][] = [];

  if (type === "landmark") {
    if (r.name) rows.push(["Landmark", String(r.name)]);
    if (r.location) rows.push(["Location", String(r.location)]);
    if (r.confidence) rows.push(["Confidence", `${Math.round(Number(r.confidence) * 100)}%`]);
    if (r.description) rows.push(["About", String(r.description)]);
    if (Array.isArray(r.tips) && r.tips.length) rows.push(["Tips", (r.tips as string[]).join(" · ")]);
  } else if (type === "receipt") {
    if (r.vendor) rows.push(["Vendor", String(r.vendor)]);
    if (r.total) rows.push(["Total", `${r.currency || "NPR"} ${Number(r.total).toLocaleString()}`]);
    if (Array.isArray(r.items)) rows.push(["Items", (r.items as { label: string; amount: number }[]).map((i) => `${i.label} (${i.amount})`).join(", ")]);
  } else {
    if (r.dish) rows.push(["Dish", String(r.dish)]);
    if (r.calories) rows.push(["Calories", `${r.calories} kcal`]);
    if (r.protein != null) rows.push(["Protein", `${r.protein} g`]);
    if (r.carbs != null) rows.push(["Carbs", `${r.carbs} g`]);
    if (r.fat != null) rows.push(["Fat", `${r.fat} g`]);
    if (Array.isArray(r.allergens)) rows.push(["Allergens", (r.allergens as string[]).length ? (r.allergens as string[]).join(", ") : "None detected"]);
    if (r.health_note) rows.push(["Note", String(r.health_note)]);
  }

  if (!rows.length && (r.note || result.note)) {
    return <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800">{String(result.note)}</p>;
  }

  return (
    <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/40 p-3.5">
      {result.demo && <p className="mb-2 rounded-lg bg-white/70 px-2 py-1 text-[10px] font-medium text-amber-700">Demo analysis · add an AI key in .env for live recognition</p>}
      <dl className="space-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_1fr] gap-2 text-[12px]">
            <dt className="font-semibold text-forest">{k}</dt>
            <dd className="text-body">{v}</dd>
          </div>
        ))}
      </dl>
      {result.note && <p className="mt-2 text-[10px] leading-relaxed text-muted">{result.note}</p>}
    </div>
  );
}
