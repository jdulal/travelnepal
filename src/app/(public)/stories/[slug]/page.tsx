import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ChevronRight, Clock, MapPin, MessageCircle } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import StoryCard from "@/components/site/StoryCard";
import StoryCommentForm from "@/components/site/StoryCommentForm";
import { getStoryBySlug } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getStoryBySlug(slug);
  if (!data) return { title: "Story not found" };
  return {
    title: data.story.title,
    description: data.story.excerpt ?? undefined,
    openGraph: { title: data.story.title, description: data.story.excerpt ?? undefined, images: data.story.cover_image ? [data.story.cover_image] : undefined },
  };
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [data, session] = await Promise.all([getStoryBySlug(slug), getSession()]);
  if (!data) notFound();
  const { story, comments, more } = data;

  return (
    <>
      <div className="border-b border-line bg-white">
        <div className="shell flex items-center gap-1.5 py-3 text-[11.5px] text-muted">
          <Link href="/" className="hover:text-forest">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/stories" className="hover:text-forest">Stories</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="truncate font-medium text-ink">{story.title}</span>
        </div>
      </div>

      <article>
        <header className="shell max-w-3xl pt-8 text-center">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-forest">{story.category}</span>
          <h1 className="mt-4 text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-ink sm:text-[42px]">{story.title}</h1>
          <p className="mx-auto mt-3 max-w-2xl text-[14px] leading-relaxed text-body/70">{story.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11.5px] text-muted">
            <span className="font-semibold text-ink">{story.author_name}</span>
            {story.author_role && <span>{story.author_role}</span>}
            <span>{shortDate(story.published_at)}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {story.read_time} min read</span>
            {story.destination_name && <Link href={`/destinations/${story.destination_slug}`} className="inline-flex items-center gap-1 font-medium text-brand-600 hover:text-forest"><MapPin className="h-3 w-3" /> {story.destination_name}</Link>}
          </div>
        </header>

        <div className="shell mt-7 max-w-4xl">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl">
            <SmartImage src={story.cover_image} alt={story.title} fill priority sizes="(max-width: 1024px) 100vw, 900px" />
          </div>
        </div>

        <div className="shell max-w-2xl py-8">
          <div className="prose-nepal text-[14px] leading-[1.85] text-body/85" dangerouslySetInnerHTML={{ __html: story.body ?? "" }} />

          <div className="mt-8 rounded-3xl bg-forest p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-200">Walk this story</p>
            <h2 className="mt-1.5 text-[19px] font-semibold">Turn these pages into your itinerary</h2>
            <p className="mt-1 text-[12px] leading-relaxed text-white/70">We run small-group trips along this route, or our AI planner can build a private version around your dates.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link href="/itinerary" className="rounded-full bg-white px-4 py-2 text-[12px] font-bold text-forest hover:bg-brand-50">Plan with AI</Link>
              <Link href="/tours" className="rounded-full border border-white/30 px-4 py-2 text-[12px] font-semibold text-white hover:bg-white/10">See guided trips</Link>
            </div>
          </div>

          <section className="mt-10">
            <h2 className="flex items-center gap-2 text-[17px] font-semibold text-ink"><MessageCircle className="h-4 w-4 text-brand-500" /> Comments ({comments.length})</h2>
            <div className="mt-4 space-y-3">
              {comments.length === 0 && <p className="text-[12.5px] text-muted">No comments yet. Ask a question or add your own experience.</p>}
              {comments.map((c) => (
                <div key={c.id} className="rounded-2xl border border-line bg-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold text-ink">{c.name}</p>
                    <p className="text-[10px] text-muted">{shortDate(c.created_at)}</p>
                  </div>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-body/80">{c.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-4"><StoryCommentForm storyId={story.id} signedIn={Boolean(session)} /></div>
          </section>
        </div>
      </article>

      {more.length > 0 && (
        <section className="shell pb-16">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">Keep reading</p>
              <h2 className="section-title mt-1">More stories</h2>
            </div>
            <Link href="/stories" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-600 hover:text-forest">All stories <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {more.map((s) => <StoryCard key={s.id} story={s} />)}
          </div>
        </section>
      )}
    </>
  );
}
