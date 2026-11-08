"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { exec, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";

export type FormState = { error?: string; ok?: boolean; message?: string };

export async function subscribeAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!z.string().email().safeParse(email).success) return { error: "Enter a valid email address." };
  try {
    await exec("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);
    return { ok: true, message: "You're on the list. Watch your inbox for Nepal inspiration." };
  } catch {
    return { error: "Could not subscribe right now. Please try again." };
  }
}

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Enter a valid email."),
  phone: z.string().trim().max(40).optional(),
  subject: z.string().trim().min(3, "Please add a subject."),
  message: z.string().trim().min(10, "Please tell us a little more."),
});

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const limit = rateLimit(clientKey("contact", ip), 5, 30 * 60 * 1000);
  if (!limit.allowed) return { error: "Too many messages. Please try again later." };

  const { name, email, phone, subject, message } = parsed.data;
  await exec("INSERT INTO inquiries (name, email, phone, subject, message, status) VALUES (?,?,?,?,?, 'new')", [
    name, email, phone || null, subject, message,
  ]);
  return { ok: true, message: "Thank you — a local expert will reply within one business day." };
}

export async function reviewAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to leave a review." };
  const tripId = Number(formData.get("trip_id"));
  const rating = Number(formData.get("rating"));
  const title = String(formData.get("title") || "").trim();
  const body = String(formData.get("body") || "").trim();
  if (!tripId || !rating || rating < 1 || rating > 5) return { error: "Choose a rating from 1 to 5." };
  if (body.length < 10) return { error: "Please write a little more about your experience." };

  await exec(
    "INSERT INTO reviews (trip_id, user_id, name, email, rating, title, body, status) VALUES (?,?,?,?,?,?,?, 'pending')",
    [tripId, session.id, session.name, session.email, rating, title || null, body]
  );
  revalidatePath(`/tours`);
  return { ok: true, message: "Thanks! Your review is pending moderation and will appear shortly." };
}

export async function storyCommentAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in to join the conversation." };
  const storyId = Number(formData.get("story_id"));
  const body = String(formData.get("body") || "").trim();
  if (!storyId || body.length < 2) return { error: "Write a comment first." };

  await exec("INSERT INTO story_comments (story_id, user_id, name, body) VALUES (?,?,?,?)", [
    storyId, session.id, session.name, body,
  ]);
  const story = await q1<{ slug: string }>("SELECT slug FROM stories WHERE id = ?", [storyId]);
  if (story) revalidatePath(`/stories/${story.slug}`);
  return { ok: true, message: "Comment posted." };
}
