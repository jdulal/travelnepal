import Link from "next/link";
import { ArrowUpRight, Facebook, Instagram, Mail, MapPin, Phone, Youtube, Clock } from "lucide-react";
import Logo from "./Logo";
import NewsletterForm from "./NewsletterForm";
import { getSettings } from "@/lib/queries";

export default async function Footer() {
  const s = await getSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20">
      <section className="relative overflow-hidden bg-forest text-white">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-brand-400/20 blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-brand-300/10 blur-3xl" />
        <div className="shell relative grid gap-8 py-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-200">The Nepal Travel letter</p>
            <h2 className="max-w-xl text-[30px] font-semibold leading-tight text-white sm:text-[38px]">
              Trek tips, hidden valleys and early-bird departures.
            </h2>
            <p className="mt-3 max-w-lg text-sm text-white/70">
              One thoughtful email a month, written by our guides in Kathmandu. No spam, no noise.
            </p>
          </div>
          <div className="lg:justify-self-end lg:w-[420px]">
            <NewsletterForm />
            <p className="mt-3 text-xs text-white/50">By subscribing you agree to our privacy policy.</p>
          </div>
        </div>
      </section>

      <div className="border-t border-line bg-white">
        <div className="shell grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-body/75">
              A Kathmandu-based travel company running small-group treks, cultural journeys and wildlife safaris across Nepal since 2014. Licensed, local and guide-owned.
            </p>
            <div className="mt-5 flex gap-2">
              <a href={s.facebook || "#"} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-brand-300 hover:text-forest"><Facebook className="h-4 w-4" /></a>
              <a href={s.instagram || "#"} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-brand-300 hover:text-forest"><Instagram className="h-4 w-4" /></a>
              <a href={s.youtube || "#"} target="_blank" rel="noreferrer" aria-label="YouTube" className="grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition hover:border-brand-300 hover:text-forest"><Youtube className="h-4 w-4" /></a>
            </div>
          </div>

          <FooterCol title="Explore" links={[
            ["All tours", "/tours"],
            ["Trekking in Nepal", "/trekking"],
            ["Destinations", "/destinations"],
            ["AI trip planner", "/itinerary"],
            ["Traveler stories", "/stories"],
          ]} />

          <FooterCol title="Company" links={[
            ["About us", "/about"],
            ["Community", "/community"],
            ["Contact", "/contact"],
            ["FAQs", "/faq"],
            ["Admin console", "/admin/login"],
          ]} />

          <div>
            <h3 className="text-sm font-semibold text-ink">Get in touch</h3>
            <ul className="mt-4 space-y-3 text-sm text-body/75">
              <li className="flex gap-2.5"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.address || "Thamel Marg, Kathmandu 44600, Nepal"}</li>
              <li><a href={`tel:${(s.contact_phone || "").replace(/\s/g, "")}`} className="flex gap-2.5 hover:text-forest"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.contact_phone || "+977 1 441 2345"}</a></li>
              <li><a href={`mailto:${s.contact_email}`} className="flex gap-2.5 hover:text-forest"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.contact_email || "hello@nepaltravel.com"}</a></li>
              <li className="flex gap-2.5"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" /> {s.office_hours || "Sun–Fri, 9:00 – 18:00 NPT"}</li>
            </ul>
            <a
              href={`https://wa.me/${(s.whatsapp || "+9779801234567").replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-forest"
            >
              Chat on WhatsApp <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="border-t border-line">
          <div className="shell flex flex-col gap-3 py-5 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
            <p>© {year} Nepal Travel Pvt. Ltd. · Kathmandu, Nepal · All rights reserved.</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/terms-condition" className="hover:text-forest">Terms & Condition</Link>
              <Link href="/privacy-policy" className="hover:text-forest">Privacy Policy</Link>
              <Link href="/cookie-policy" className="hover:text-forest">Cookie Policy</Link>
              <Link href="/admin/login" className="hover:text-forest">Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <ul className="mt-4 space-y-2.5">
        {links.map(([label, href]) => (
          <li key={href}>
            <Link href={href} className="text-sm text-body/75 transition hover:text-forest">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
