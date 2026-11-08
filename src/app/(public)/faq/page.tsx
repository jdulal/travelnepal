import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, HelpCircle, MessageCircle } from "lucide-react";
import FaqAccordion from "@/components/site/FaqAccordion";
import { getFaqs } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description: "Answers about booking, payments, permits, altitude, safety, cancellation and travelling in Nepal with Nepal Travel.",
};

const labels: Record<string, string> = {
  booking: "Booking & payments",
  trip: "Trips & itineraries",
  trek: "Trekking & altitude",
  travel: "Travel in Nepal",
  general: "General",
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const groups = faqs.reduce<Record<string, typeof faqs>>((acc, f) => {
    (acc[f.category] ??= []).push(f);
    return acc;
  }, {});

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-10">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">FAQ</span>
          </div>
          <p className="hero-script mt-5 text-[21px] text-brand-600">Ask away</p>
          <h1 className="mt-1 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[46px]">Frequently asked questions</h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">The things travellers ask us most — about money, permits, fitness and what happens if plans change.</p>
        </div>
      </section>

      <section className="shell grid gap-7 py-8 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="space-y-8">
          {Object.entries(groups).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="mb-3 flex items-center gap-2 text-[17px] font-semibold text-ink">
                <HelpCircle className="h-4 w-4 text-brand-500" /> {labels[cat] ?? cat}
              </h2>
              <FaqAccordion items={items} />
            </div>
          ))}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-forest p-5 text-white">
            <MessageCircle className="h-5 w-5 text-brand-200" />
            <h2 className="mt-2 text-[14px] font-semibold">Still unsure?</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/65">Ask a real guide. No sales script, just straight answers about routes and conditions.</p>
            <Link href="/contact" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[12px] font-bold text-forest hover:bg-brand-50">Ask a question</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
