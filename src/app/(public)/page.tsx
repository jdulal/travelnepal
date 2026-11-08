import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  Compass,
  HeartHandshake,
  MapPin,
  Mountain,
  PhoneCall,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wallet,
} from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import HeroSearch from "@/components/site/HeroSearch";
import TripCard from "@/components/site/TripCard";
import DestinationCard from "@/components/site/DestinationCard";
import DestinationRow from "@/components/site/DestinationRow";
import FaqAccordion from "@/components/site/FaqAccordion";
import StoryCard from "@/components/site/StoryCard";
import { getDestinations, getFaqs, getSavedTripIds, getStories, getTestimonials, getTrips } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { npr, priceOf } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredTrips, destinations, testimonials, faqs, stories, session] = await Promise.all([
    getTrips({ featuredOnly: true, limit: 6 }),
    getDestinations(),
    getTestimonials(),
    getFaqs(),
    getStories(3),
    getSession(),
  ]);
  const saved = session ? await getSavedTripIds(session.id) : [];
  const heroTrip = featuredTrips[0];
  const featuredDestinations = destinations.filter((d) => d.featured).slice(0, 4);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <SmartImage src="/images/hero/hero.jpg" alt="Trekking beneath the Himalayan peaks in Nepal" fill priority sizes="100vw" className="object-[60%_40%]" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/92 to-white/25" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-mist to-transparent" />

        <div className="shell relative py-12 sm:py-16 lg:py-24">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-[11px] font-semibold text-forest shadow-soft backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-brand-500" /> Powered by local experts + AI
            </span>

            <p className="hero-script hand-underline mt-9 text-[22px] sm:text-[27px]">Your Next Adventure Awaits</p>
            <h1 className="mt-4 text-[42px] font-semibold leading-[1.02] tracking-[-0.035em] text-ink sm:text-[54px] lg:text-[62px]">
              Where do you want
              <br />
              to <span className="hero-script text-brand-500">go?</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-body/75">
              Handcrafted treks, cultural journeys and wildlife escapes across Nepal — with AI planning that fits your dates, budget and pace.
            </p>

            <HeroSearch />

            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
              {[
                [Compass, "Personalised itineraries"],
                [MapPin, "Hidden gems & local tips"],
                [CalendarCheck, "Save time, travel smarter"],
              ].map(([Icon, label]) => (
                <span key={String(label)} className="flex items-center gap-2 text-[12.5px] font-medium text-body/80">
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-forest shadow-soft ring-1 ring-line">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label as string}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3">
              <div className="flex -space-x-2">
                {["AS", "EW", "HT", "SR"].map((x, i) => (
                  <span key={x} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[9px] font-bold text-white" style={{ background: ["#004f32", "#63ab45", "#8a6d3b", "#2f6f8f"][i] }}>
                    {x}
                  </span>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                  <span className="ml-1 text-[11px] font-semibold text-ink">4.9/5</span>
                </div>
                <p className="text-[11px] text-muted">Loved by 8,400+ travellers</p>
              </div>
            </div>
          </div>

          {heroTrip && (
            <div className="absolute bottom-10 right-8 hidden w-[290px] rounded-3xl border border-white/70 bg-white/90 p-3 shadow-float backdrop-blur-xl xl:block">
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <SmartImage src={heroTrip.hero_image} alt={heroTrip.title} fill sizes="290px" />
                <span className="absolute left-2.5 top-2.5 rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Featured trip</span>
              </div>
              <div className="px-1 pt-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brand-600">{heroTrip.destination_name}</p>
                <h3 className="mt-0.5 text-[15px] font-semibold text-ink">{heroTrip.title}</h3>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-[13px] font-bold text-forest">{npr(priceOf(heroTrip))}<span className="text-[10px] font-normal text-muted"> /person</span></p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted"><Users className="h-3 w-3" /> {heroTrip.duration_days} days</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Trending destinations */}
      <section className="shell relative pb-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {featuredDestinations.map((d) => <DestinationCard key={d.id} destination={d} />)}
        </div>
      </section>

      {/* Stats */}
      <section className="shell py-10">
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-white p-5 shadow-soft sm:grid-cols-4 sm:p-6">
          {[
            ["2014", "Guiding since"],
            ["8,400+", "Happy travellers"],
            ["4.9/5", "Average rating"],
            ["100%", "Local guides"],
          ].map(([value, label]) => (
            <div key={label} className="text-center sm:border-r sm:border-line sm:last:border-0">
              <p className="text-[24px] font-bold text-forest sm:text-[28px]">{value}</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-muted">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent itineraries */}
      <section className="section pt-6">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow"><Mountain className="h-3.5 w-3.5" /> Curated journeys</span>
              <h2 className="section-title mt-3">Our Recent Itineraries</h2>
              <p className="mt-2 max-w-xl text-sm text-muted">Small groups, licensed guides and routes we walk ourselves every season.</p>
            </div>
            <Link href="/tours" className="link-arrow">Browse all trips <ArrowRight className="h-4 w-4" /></Link>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTrips.slice(0, 6).map((trip) => (
              <TripCard key={trip.id} trip={trip} saved={saved.includes(trip.id)} />
            ))}
          </div>
        </div>
      </section>

      {/* Bring friends */}
      <section className="shell">
        <div className="overflow-hidden rounded-[2.5rem] bg-brand-50">
          <div className="grid items-center gap-0 lg:grid-cols-2">
            <div className="relative h-64 lg:h-[420px]">
              <SmartImage src="/images/community/post-2.jpg" alt="Friends trekking together in Nepal" fill sizes="(max-width: 1024px) 100vw, 50vw" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-50/40 lg:to-brand-50" />
              <div className="absolute bottom-5 left-5 rounded-2xl bg-white/90 p-3 shadow-float backdrop-blur">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Group perk</p>
                <p className="text-[15px] font-bold text-forest">Save 10% for 4+ travellers</p>
              </div>
            </div>
            <div className="p-7 sm:p-10 lg:p-12">
              <span className="eyebrow bg-white"><HeartHandshake className="h-3.5 w-3.5" /> Travel together</span>
              <h2 className="section-title mt-3">Bring Friends Along for the Adventure</h2>
              <p className="mt-3 text-sm leading-relaxed text-body/75">
                Private departures, flexible dates and group pricing for families, university clubs and companies. We handle permits, logistics and the little details so you can focus on the view.
              </p>
              <ul className="mt-5 space-y-2.5 text-[13px] text-body/80">
                {["Private guide and vehicle for your group", "Custom dates and pace", "Group discount from 4 travellers", "Flexible deposit and payment plans"].map((x) => (
                  <li key={x} className="flex items-center gap-2.5"><BadgeCheck className="h-4 w-4 shrink-0 text-brand-500" /> {x}</li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-2.5">
                <Link href="/contact" className="btn-dark">Plan a group trip <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/itinerary" className="btn-outline">Try the AI planner</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section">
        <div className="shell">
          <div className="mx-auto max-w-2xl text-center">
            <span className="eyebrow"><ShieldCheck className="h-3.5 w-3.5" /> Why Nepal Travel</span>
            <h2 className="section-title mt-3">Local expertise, every step of the way</h2>
            <p className="mt-2 text-sm text-muted">We are a guide-owned company based in Kathmandu — not a booking platform reselling someone else's trip.</p>
          </div>
          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Mountain, "Born in the mountains", "Our guides grew up in the valleys you will walk through. Their families still live there."],
              [ShieldCheck, "Safety before summits", "Oximeters, oxygen, evacuation plans and acclimatisation days built into every high-altitude trek."],
              [Wallet, "Honest local pricing", "No hidden fees. Permits, transfers and porters are included and listed upfront."],
              [HeartHandshake, "Responsible by default", "Fair porter wages, plastic-free trails and a percentage of profit to community schools."],
            ].map(([Icon, title, body]) => (
              <div key={String(title)} className="rounded-3xl border border-line bg-white p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-card">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-50 text-forest"><Icon className="h-5 w-5" /></span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{title as string}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{body as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular destinations */}
      <section className="bg-white py-16">
        <div className="shell">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow"><MapPin className="h-3.5 w-3.5" /> Where to next</span>
              <h2 className="section-title mt-3">Popular Destinations in Nepal</h2>
            </div>
            <Link href="/destinations" className="link-arrow">All destinations <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <DestinationRow destinations={destinations} />
        </div>
      </section>

      {/* Testimonials */}
      <section className="section">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow"><Star className="h-3.5 w-3.5" /> Traveller stories</span>
              <h2 className="section-title mt-3">They came for the view. They stayed for the people.</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-soft ring-1 ring-line">
              <span className="text-[20px] font-bold text-forest">4.9</span>
              <div>
                <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-[10px] text-muted">from 1,240 verified reviews</p>
              </div>
            </div>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {testimonials.slice(0, 3).map((t) => (
              <figure key={t.id} className="relative rounded-3xl border border-line bg-white p-6 shadow-soft">
                <Quote className="h-7 w-7 text-brand-200" />
                <blockquote className="mt-3 text-[13.5px] leading-relaxed text-body/85">“{t.quote}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{t.name.split(" ").map((x) => x[0]).join("")}</span>
                  <span>
                    <span className="block text-[13px] font-semibold text-ink">{t.name}</span>
                    <span className="block text-[11px] text-muted">{t.location} · {t.trip_title}</span>
                  </span>
                  <span className="ml-auto flex">{Array.from({ length: t.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Stories */}
      <section className="bg-white py-16">
        <div className="shell">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow"><Compass className="h-3.5 w-3.5" /> From the trail</span>
              <h2 className="section-title mt-3">Traveler Stories</h2>
              <p className="mt-2 text-sm text-muted">Field notes, culture and practical guides from our guides and guests.</p>
            </div>
            <Link href="/stories" className="link-arrow">Read the journal <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => <StoryCard key={story.id} story={story} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow"><PhoneCall className="h-3.5 w-3.5" /> Good to know</span>
            <h2 className="section-title mt-3">Frequently Asked Questions</h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Everything you need to know before booking a trek or tour with us. Still unsure? Talk to a human — we answer every message.
            </p>
            <div className="mt-6 rounded-3xl border border-line bg-white p-5 shadow-soft">
              <p className="text-[13px] font-semibold text-ink">Talk to a local expert</p>
              <p className="mt-1 text-[12px] text-muted">Sun–Fri, 9:00–18:00 NPT. We usually reply within an hour.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/contact" className="btn-dark btn-sm">Send a message</Link>
                <a href="https://wa.me/9779801234567" target="_blank" rel="noreferrer" className="btn-outline btn-sm">WhatsApp us</a>
              </div>
            </div>
          </div>
          <FaqAccordion items={faqs} />
        </div>
      </section>
    </>
  );
}
