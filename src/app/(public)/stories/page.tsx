import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronRight, Clock } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import StoryCard from "@/components/site/StoryCard";
import { getStories } from "@/lib/queries";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Stories & Guides",
  description: "Field notes, route guides and traveller stories from Nepal — written by the guides and people who live there.",
};

export default async function StoriesPage() {
  const stories = await getStories();
  const featured = stories[0];
  const rest = stories.slice(1);
  const categories = Array.from(new Set(stories.map((s) => s.category)));

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-10 sm:py-14">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">Stories</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="hero-script text-[21px] text-brand-600">Notes from the trail</p>
              <h1 className="mt-1 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[46px]">Stories &amp; guides</h1>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">
                Honest route guides, packing lists and first-person accounts — written by the guides, teahouse owners and travellers who know these trails best.
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((c) => <span key={c} className="chip">{c}</span>)}
            </div>
          </div>
        </div>
      </section>

      <section className="shell py-8">
        {featured && (
          <Link href={`/stories/${featured.slug}`} className="group grid overflow-hidden rounded-[2rem] border border-line bg-white shadow-card lg:grid-cols-[1.15fr_1fr]">
            <div className="relative min-h-[260px] sm:min-h-[340px]">
              <SmartImage src={featured.cover_image} alt={featured.title} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="transition duration-700 group-hover:scale-[1.03]" />
              <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-forest">{featured.category}</span>
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-brand-600"><BookOpen className="h-3.5 w-3.5" /> Featured story</p>
              <h2 className="mt-2 text-[25px] font-semibold leading-tight text-ink group-hover:text-forest sm:text-[30px]">{featured.title}</h2>
              <p className="mt-2.5 text-[13px] leading-relaxed text-body/75">{featured.excerpt}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted">
                <span className="font-medium text-ink">{featured.author_name}</span>
                <span>{shortDate(featured.published_at)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {featured.read_time} min read</span>
              </div>
              <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-600">Read the story <ArrowRight className="h-3.5 w-3.5" /></span>
            </div>
          </Link>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((s) => <StoryCard key={s.id} story={s} />)}
        </div>
      </section>
    </>
  );
}
