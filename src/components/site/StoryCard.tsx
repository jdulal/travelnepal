import Link from "next/link";
import { Clock, ArrowUpRight } from "lucide-react";
import SmartImage from "./SmartImage";
import { shortDate } from "@/lib/utils";
import type { Story } from "@/types";

export default function StoryCard({ story }: { story: Story }) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <Link href={`/stories/${story.slug}`} className="relative block aspect-[16/10] overflow-hidden">
        <SmartImage src={story.cover_image} alt={story.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="transition duration-700 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-forest">{story.category}</span>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] text-muted">
          <span>{story.destination_name || "Nepal"}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {story.read_time} min read</span>
        </div>
        <h3 className="mt-2 text-[17px] font-semibold leading-snug text-ink">
          <Link href={`/stories/${story.slug}`} className="hover:text-forest">{story.title}</Link>
        </h3>
        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted">{story.excerpt}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-muted">By {story.author_name} · {shortDate(story.published_at)}</span>
          <Link href={`/stories/${story.slug}`} className="grid h-8 w-8 place-items-center rounded-full border border-line text-forest transition group-hover:border-forest group-hover:bg-forest group-hover:text-white" aria-label={story.title}>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
