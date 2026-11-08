"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { exec, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";

export type PostState = { error?: string; ok?: boolean; message?: string };

const postSchema = z.object({
  title: z.string().trim().min(6, "Give your post a title.").max(200),
  body: z.string().trim().min(20, "Tell the community a little more (20+ characters).").max(4000),
  destination_id: z.coerce.number().int().positive().optional(),
  image: z.string().trim().max(255).optional(),
});

export async function createPostAction(_prev: PostState, formData: FormData): Promise<PostState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to post." };

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
    destination_id: formData.get("destination_id") || undefined,
    image: formData.get("image") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let image: string | null = null;
  if (parsed.data.image) {
    const allowed = await q1<{ hero_image: string | null; thumbnail: string | null }>(
      "SELECT hero_image, thumbnail FROM destinations WHERE hero_image = ? OR thumbnail = ?",
      [parsed.data.image, parsed.data.image]
    );
    if (allowed) image = parsed.data.image;
  }

  await exec("INSERT INTO posts (user_id, destination_id, title, body, image, status) VALUES (?,?,?,?,?, 'published')", [
    session.id,
    parsed.data.destination_id ?? null,
    parsed.data.title,
    parsed.data.body,
    image,
  ]);
  await exec("INSERT INTO activity_logs (user_id, action, entity, details) VALUES (?,?,?,?)", [
    session.id,
    "create",
    "post",
    `Community post: ${parsed.data.title}`,
  ]);
  revalidatePath("/community");
  return { ok: true, message: "Posted to the community." };
}

export async function toggleLikeAction(formData: FormData) {
  const session = await getSession();
  const postId = Number(formData.get("post_id"));
  if (!session || !postId) return;
  const liked = await q1<{ post_id: number }>("SELECT post_id FROM post_likes WHERE post_id = ? AND user_id = ?", [postId, session.id]);
  if (liked) await exec("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", [postId, session.id]);
  else await exec("INSERT IGNORE INTO post_likes (post_id, user_id) VALUES (?,?)", [postId, session.id]);
  revalidatePath("/community");
}

export async function addPostCommentAction(_prev: PostState, formData: FormData): Promise<PostState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to comment." };
  const postId = Number(formData.get("post_id"));
  const body = String(formData.get("body") || "").trim();
  if (!postId || body.length < 2) return { error: "Write a comment first." };
  await exec("INSERT INTO post_comments (post_id, user_id, body) VALUES (?,?,?)", [postId, session.id, body]);
  revalidatePath("/community");
  return { ok: true, message: "Comment added." };
}
