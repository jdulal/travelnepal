import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Heart, MapPin, MessageCircle, ShieldCheck, Sparkles, Users } from "lucide-react";
import SmartImage from "@/components/site/SmartImage";
import PostComposer from "@/components/site/PostComposer";
import PostCommentForm from "@/components/site/PostCommentForm";
import { toggleLikeAction } from "@/app/actions/community";
import { getDestinations, getPostComments, getPosts } from "@/lib/queries";
import { getSession } from "@/lib/session";
import { initials, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Traveller Community",
  description: "Ask questions, share trail notes and find trekking buddies with travellers who have just been there.",
};

export default async function CommunityPage() {
  const [session, destinations] = await Promise.all([getSession(), getDestinations()]);
  const posts = await getPosts(session?.id);
  const commentsByPost = await Promise.all(posts.map((p) => getPostComments(p.id)));

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-10 sm:py-12">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">Community</span>
          </div>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="hero-script text-[21px] text-brand-600">Real travellers, real advice</p>
              <h1 className="mt-1 text-[36px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-[46px]">The Nepal Travel community</h1>
              <p className="mt-3 max-w-xl text-[13.5px] leading-relaxed text-muted">Fresh trail conditions, honest costs and trekking buddies — from people who were there last week, not last decade.</p>
            </div>
            <div className="flex gap-2 text-[11px] text-muted">
              <span className="rounded-full border border-line bg-mist px-3 py-1.5"><strong className="text-ink">{posts.length}</strong> posts</span>
              <span className="rounded-full border border-line bg-mist px-3 py-1.5"><strong className="text-ink">2.4k</strong> members</span>
            </div>
          </div>
        </div>
      </section>

      <section className="shell grid gap-7 py-8 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="min-w-0 space-y-5">
          <PostComposer destinations={destinations} signedIn={Boolean(session)} />

          {posts.map((post, i) => {
            const comments = commentsByPost[i];
            return (
              <article key={post.id} className="overflow-hidden rounded-3xl border border-line bg-white shadow-soft">
                <div className="p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-forest text-[11px] font-bold text-white">{initials(post.author_name)}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-ink">{post.author_name}</p>
                      <p className="flex flex-wrap items-center gap-x-2 text-[10.5px] text-muted">
                        {shortDate(post.created_at)}
                        {post.destination_name && <span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3 text-brand-500" /> {post.destination_name}</span>}
                      </p>
                    </div>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wide text-forest">Traveller</span>
                  </div>

                  <h2 className="mt-3.5 text-[18px] font-semibold leading-snug text-ink">{post.title}</h2>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-body/80">{post.body}</p>

                  {post.image && (
                    <div className="relative mt-3.5 aspect-[16/8] overflow-hidden rounded-2xl">
                      <SmartImage src={post.image} alt={post.title} fill sizes="(max-width: 1024px) 100vw, 640px" />
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 border-t border-line pt-3">
                    {session ? (
                      <form action={toggleLikeAction}>
                        <input type="hidden" name="post_id" value={post.id} />
                        <button type="submit" className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold transition ${post.liked ? "bg-rose-50 text-rose-600" : "bg-mist text-muted hover:text-rose-600"}`}>
                          <Heart className={`h-3.5 w-3.5 ${post.liked ? "fill-rose-500 text-rose-500" : ""}`} /> {post.like_count}
                        </button>
                      </form>
                    ) : (
                      <Link href="/sign-in" className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-semibold text-muted hover:text-rose-600">
                        <Heart className="h-3.5 w-3.5" /> {post.like_count}
                      </Link>
                    )}
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-mist px-3 py-1.5 text-[11.5px] font-semibold text-muted">
                      <MessageCircle className="h-3.5 w-3.5" /> {post.comment_count}
                    </span>
                    {post.destination_name && <Link href={`/destinations/${post.destination_slug ?? ""}`} className="ml-auto text-[11px] font-semibold text-brand-600 hover:text-forest">Explore {post.destination_name}</Link>}
                  </div>
                </div>

                {(comments.length > 0 || session) && (
                  <div className="bg-mist/50 px-5 py-4">
                    {comments.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex gap-2.5 py-1.5">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[9px] font-bold text-forest ring-1 ring-line">{initials(c.name)}</span>
                        <div className="min-w-0">
                          <p className="text-[11.5px]"><span className="font-semibold text-ink">{c.name}</span> <span className="text-muted">· {shortDate(c.created_at)}</span></p>
                          <p className="text-[11.5px] leading-relaxed text-body/80">{c.body}</p>
                        </div>
                      </div>
                    ))}
                    {comments.length > 3 && <p className="mt-1 text-[10.5px] text-muted">+ {comments.length - 3} more comments</p>}
                    {session && <PostCommentForm postId={post.id} />}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <Users className="h-5 w-5 text-brand-500" />
            <h2 className="mt-2 text-[14px] font-semibold text-ink">Be useful, be kind</h2>
            <ul className="mt-2.5 space-y-2 text-[11.5px] leading-relaxed text-body/75">
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> No personal contact details in public posts.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> Share real costs and conditions you experienced.</li>
              <li className="flex gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" /> No commercial promotions or gear sales.</li>
            </ul>
          </div>

          <div className="rounded-3xl bg-forest p-5 text-white">
            <Sparkles className="h-5 w-5 text-brand-200" />
            <h2 className="mt-2 text-[14px] font-semibold">Turn advice into a plan</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/65">Use the AI planner to turn the tips you read here into a day-by-day itinerary.</p>
            <Link href="/itinerary" className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-[12px] font-bold text-forest hover:bg-brand-50">Open planner</Link>
          </div>

          <div className="rounded-3xl border border-line bg-mist/60 p-5">
            <h2 className="text-[13px] font-semibold text-ink">Popular destinations</h2>
            <div className="mt-3 space-y-2.5">
              {destinations.slice(0, 5).map((d) => (
                <Link key={d.id} href={`/destinations/${d.slug}`} className="flex items-center gap-2.5 text-[12px] font-medium text-body/80 hover:text-forest">
                  <span className="relative h-8 w-10 shrink-0 overflow-hidden rounded-lg"><SmartImage src={d.thumbnail ?? d.hero_image} alt={d.name} fill sizes="40px" /></span>
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </>
  );
}
