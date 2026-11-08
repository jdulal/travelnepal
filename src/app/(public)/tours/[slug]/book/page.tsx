import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, LockKeyhole } from "lucide-react";
import BookingForm from "@/components/site/BookingForm";
import { getAddons, getTripBySlug } from "@/lib/queries";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book your trip",
  robots: { index: false, follow: false },
};

export default async function BookTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ departure?: string; travelers?: string }>;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const [data, addons, session] = await Promise.all([getTripBySlug(slug), getAddons(0), getSession()]);
  if (!data) notFound();
  const { trip, departures } = data;

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="shell flex items-center gap-1.5 py-3 text-[11.5px] text-muted">
          <Link href="/" className="hover:text-forest">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/tours" className="hover:text-forest">Tours</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/tours/${trip.slug}`} className="hover:text-forest">{trip.title}</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-ink">Book</span>
        </div>
      </div>

      <section className="shell py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Secure booking</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">Book {trip.title}</h1>
            <p className="mt-1.5 text-[12.5px] text-muted">No payment is taken until the next step. Prices in NPR per person.</p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[11px] font-medium text-muted">
            <LockKeyhole className="h-3.5 w-3.5 text-brand-600" /> 256-bit secure checkout
          </span>
        </div>

        <div className="mt-6">
          <BookingForm
            trip={trip}
            departures={departures}
            addons={addons}
            defaultDeparture={sp.departure ? Number(sp.departure) : undefined}
            defaultTravelers={sp.travelers ? Number(sp.travelers) : 2}
            defaults={{ name: session?.name ?? "", email: session?.email ?? "" }}
          />
        </div>
      </section>
    </>
  );
}
