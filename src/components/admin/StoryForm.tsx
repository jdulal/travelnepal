"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Save } from "lucide-react";
import { saveStoryAction, type AdminState } from "@/app/actions/admin";
import SubmitButton from "@/components/admin/SubmitButton";
import type { Destination, Story } from "@/types";

export default function StoryForm({ story, destinations }: { story?: Story; destinations: Pick<Destination, "id" | "name">[] }) {
  const [state, action] = useActionState<AdminState, FormData>(saveStoryAction, {});
  const editing = Boolean(story?.id);

  return (
    <form action={action} className="space-y-4">
      {story?.id && <input type="hidden" name="id" value={story.id} />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/stories" className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 hover:text-forest">
          <ArrowLeft className="h-3.5 w-3.5" /> All stories
        </Link>
        <div className="flex items-center gap-2">
          {editing && story?.status === "published" && (
            <Link href={`/stories/${story.slug}`} className="admin-btn-ghost text-[12px]">Preview</Link>
          )}
          <SubmitButton className="bg-forest hover:bg-forest-deep">
            <Save className="h-3.5 w-3.5" /> {editing ? "Save story" : "Create story"}
          </SubmitButton>
        </div>
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12px] text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {state.error}
        </div>
      )}

      <div className="admin-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900">Story</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="title">Title</label>
            <input id="title" name="title" required defaultValue={story?.title ?? ""} placeholder="A morning above the clouds in Ghorepani" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="slug">Slug</label>
            <input id="slug" name="slug" defaultValue={story?.slug ?? ""} placeholder="morning-above-the-clouds" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="destination_id">Destination</label>
            <select id="destination_id" name="destination_id" defaultValue={story?.destination_id ?? ""} className="admin-input">
              <option value="">— None —</option>
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label" htmlFor="category">Category</label>
            <input id="category" name="category" defaultValue={story?.category ?? "Travel Story"} placeholder="Trekking diary" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="read_time">Read time (minutes)</label>
            <input id="read_time" name="read_time" type="number" min={1} max={90} defaultValue={story?.read_time ?? 5} className="admin-input" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="excerpt">Excerpt</label>
            <textarea id="excerpt" name="excerpt" rows={3} defaultValue={story?.excerpt ?? ""} placeholder="A short teaser shown on the stories grid." className="admin-input resize-none" />
          </div>
          <div className="sm:col-span-2">
            <label className="admin-label" htmlFor="body">Body (HTML allowed)</label>
            <textarea id="body" name="body" rows={14} defaultValue={story?.body ?? ""} placeholder="<p>We left Pokhara before sunrise…</p>" className="admin-input resize-y font-mono text-[11.5px]" />
          </div>
        </div>
      </div>

      <div className="admin-card p-5">
        <h3 className="text-[13px] font-bold text-slate-900">Author & publishing</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="admin-label" htmlFor="author_name">Author</label>
            <input id="author_name" name="author_name" defaultValue={story?.author_name ?? "Nepal Travel Editorial"} className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="author_role">Author role</label>
            <input id="author_role" name="author_role" defaultValue={story?.author_role ?? ""} placeholder="Trek leader, Khumbu" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="cover_image">Cover image path</label>
            <input id="cover_image" name="cover_image" defaultValue={story?.cover_image ?? ""} placeholder="/images/stories/ghorepani.jpg" className="admin-input" />
          </div>
          <div>
            <label className="admin-label" htmlFor="status">Status</label>
            <select id="status" name="status" defaultValue={story?.status ?? "draft"} className="admin-input">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pb-6">
        <SubmitButton className="bg-forest px-6 hover:bg-forest-deep">
          <Save className="h-3.5 w-3.5" /> {editing ? "Save story" : "Create story"}
        </SubmitButton>
      </div>
    </form>
  );
}
