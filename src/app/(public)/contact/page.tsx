import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Clock, Headset, Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import ContactForm from "@/components/site/ContactForm";
import { getSettings } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Talk to a local Nepal Travel expert in Kathmandu — trip planning, bookings, custom itineraries and 24/7 on-trail support.",
};

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const [sp, settings] = await Promise.all([searchParams, getSettings()]);

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-10">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">Contact</span>
          </div>
          <p className="hero-script mt-5 text-[21px] text-brand-600">We answer, properly</p>
          <h1 className="mt-1 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[46px]">Talk to a local</h1>
          <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
            No call centre scripts. Your message goes to the Kathmandu team who actually run the trips — usually answered the same working day.
          </p>
        </div>
      </section>

      <section className="shell grid gap-7 py-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <ContactForm defaultSubject={sp.subject ?? ""} />

        <aside className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <h2 className="text-[14px] font-semibold text-ink">Kathmandu office</h2>
            <div className="mt-3 space-y-3 text-[12px] text-body/80">
              <p className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> Thamel Marg, Kathmandu 44600, Nepal</p>
              <p className="flex gap-2.5"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> <span>{settings.contact_email || "hello@nepaltravel.com"}</span></p>
              <p className="flex gap-2.5"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> <span>{settings.contact_phone || "+977 1 441 2345"}</span></p>
              <p className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> <span>Sun–Fri, 09:00–18:00 NPT<br />On-trail support 24/7</span></p>
            </div>
          </div>

          <div className="rounded-3xl bg-forest p-5 text-white">
            <Headset className="h-5 w-5 text-brand-200" />
            <h2 className="mt-2 text-[14px] font-semibold">Already booked?</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/65">Include your booking reference so we can pull up your trip instantly.</p>
            <Link href="/dashboard/bookings" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[12px] font-bold text-forest hover:bg-brand-50">Manage my booking</Link>
          </div>

          <div className="rounded-3xl border border-line bg-mist/60 p-5">
            <MessageSquare className="h-5 w-5 text-brand-500" />
            <h2 className="mt-2 text-[13px] font-semibold text-ink">Prefer to plan first?</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-muted">Draft a day-by-day itinerary with our AI planner, then send it over — we&apos;ll quote it and fix the details.</p>
            <Link href="/itinerary" className="btn-outline btn-sm mt-3 w-full">Open AI planner</Link>
          </div>
        </aside>
      </section>
    </>
  );
}
