"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

type Faq = { id: number; question: string; answer: string; category: string };

export default function FaqAccordion({ items }: { items: Faq[] }) {
  const [open, setOpen] = useState<number | null>(items[0]?.id ?? null);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-3xl border border-line bg-white">
      {items.map((faq) => {
        const isOpen = open === faq.id;
        return (
          <div key={faq.id}>
            <button
              onClick={() => setOpen(isOpen ? null : faq.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-mist/50"
              aria-expanded={isOpen}
            >
              <span className="text-[14.5px] font-semibold text-ink">{faq.question}</span>
              <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full transition", isOpen ? "bg-forest text-white" : "bg-brand-50 text-forest")}>
                {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            {isOpen && <div className="px-5 pb-5 pr-12 text-[13px] leading-relaxed text-body/80">{faq.answer}</div>}
          </div>
        );
      })}
    </div>
  );
}
