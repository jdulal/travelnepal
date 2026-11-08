import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "@/components/site/Logo";
import SmartImage from "@/components/site/SmartImage";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-mist">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[11.5px] font-semibold text-forest hover:border-brand-300">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-5 pb-12 lg:grid-cols-[1fr_460px] lg:items-stretch">
        <section className="relative hidden overflow-hidden rounded-[2rem] lg:block">
          <SmartImage src="/images/hero/hero.jpg" alt="Himalayan trail" fill priority sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-deep via-forest-deep/55 to-forest-deep/15" />
          <div className="relative flex h-full flex-col justify-between p-8 text-white">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-brand-100 backdrop-blur">
              <Sparkles className="h-3 w-3" /> Your next chapter
            </span>
            <div>
              <p className="hero-script text-[26px] text-brand-200">Trek higher. Travel deeper.</p>
              <h2 className="mt-2 max-w-md text-[30px] font-semibold leading-tight">One account for plans, bookings and trail notes.</h2>
              <ul className="mt-5 space-y-2.5">
                {["Save any trip or AI itinerary", "Track bookings, payments and expenses", "Chat with our local team in one place"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-[12px] text-white/80"><span className="grid h-5 w-5 place-items-center rounded-full bg-white/15"><Check className="h-3 w-3 text-brand-200" /></span> {x}</li>
                ))}
              </ul>
              <p className="mt-6 inline-flex items-center gap-1.5 text-[10.5px] text-white/55"><ShieldCheck className="h-3.5 w-3.5" /> Your data stays private. No advertising trackers.</p>
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full">{children}</div>
        </section>
      </main>
    </div>
  );
}
