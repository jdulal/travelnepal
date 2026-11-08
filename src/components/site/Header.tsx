import Link from "next/link";
import { Phone, Mail, ShieldCheck, ArrowRight } from "lucide-react";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SearchDialog from "./SearchDialog";
import AccountMenu from "./AccountMenu";
import MobileMenu from "./MobileMenu";
import { getSession } from "@/lib/session";
import { getSettings } from "@/lib/queries";

export default async function Header() {
  const [session, settings] = await Promise.all([getSession(), getSettings()]);
  const phone = settings.contact_phone || "+977 1 441 2345";
  const email = settings.contact_email || "hello@nepaltravel.com";

  return (
    <header className="sticky top-0 z-50">
      <div className="hidden bg-forest text-white sm:block">
        <div className="shell flex h-9 items-center justify-between text-[11.5px]">
          <p className="flex items-center gap-2 text-white/85">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
            Government-licensed agency · 100% locally owned in Kathmandu
          </p>
          <div className="flex items-center gap-5 text-white/85">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-white"><Phone className="h-3 w-3" /> {phone}</a>
            <a href={`mailto:${email}`} className="hidden items-center gap-1.5 hover:text-white lg:flex"><Mail className="h-3 w-3" /> {email}</a>
            <Link href="/itinerary" className="flex items-center gap-1 font-semibold text-brand-200 hover:text-white">
              Plan a trip <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-line/80 bg-white/95 backdrop-blur-xl">
        <div className="shell flex h-[68px] items-center justify-between gap-4">
          <Logo />
          <nav className="hidden items-center gap-0.5 lg:flex">
            <NavLinks />
          </nav>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <SearchDialog />
            <AccountMenu user={session ? { name: session.name, email: session.email, role: session.role } : null} />
            <Link href="/itinerary" className="btn-primary btn-sm ml-1 hidden lg:inline-flex">
              Plan my trip
            </Link>
            <MobileMenu user={session} phone={phone} email={email} />
          </div>
        </div>
      </div>
    </header>
  );
}
