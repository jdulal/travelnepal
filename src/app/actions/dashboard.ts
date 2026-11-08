"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { exec, q1 } from "@/lib/db";
import { getSession } from "@/lib/session";

export type DashState = { error?: string; ok?: boolean; message?: string };

const expenseSchema = z.object({
  label: z.string().trim().min(2, "Add a short description.").max(180),
  category: z.enum(["food", "transport", "stay", "activities", "shopping", "other"]),
  amount: z.coerce.number().positive("Enter an amount greater than zero.").max(10_000_000),
  currency: z.string().trim().max(8).default("NPR"),
  spent_on: z.string().trim().min(8),
  note: z.string().trim().max(255).optional(),
});

export async function addExpenseAction(_prev: DashState, formData: FormData): Promise<DashState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const parsed = expenseSchema.safeParse({
    label: formData.get("label"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    currency: formData.get("currency") || "NPR",
    spent_on: formData.get("spent_on"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const d = parsed.data;
  await exec(
    "INSERT INTO expenses (user_id, label, category, amount, currency, spent_on, note) VALUES (?,?,?,?,?,?,?)",
    [session.id, d.label, d.category, d.amount, d.currency, d.spent_on, d.note ?? null]
  );
  revalidatePath("/dashboard/expenses");
  revalidatePath("/dashboard");
  return { ok: true, message: "Expense added." };
}

export async function deleteExpenseAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const id = Number(formData.get("id"));
  if (id) await exec("DELETE FROM expenses WHERE id = ? AND user_id = ?", [id, session.id]);
  revalidatePath("/dashboard/expenses");
}

export async function deleteScanAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const id = Number(formData.get("id"));
  if (id) await exec("DELETE FROM scans WHERE id = ? AND user_id = ?", [id, session.id]);
  revalidatePath("/dashboard/expenses");
}

export async function deletePlanAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const id = Number(formData.get("id"));
  if (id) await exec("DELETE FROM plans WHERE id = ? AND user_id = ?", [id, session.id]);
  revalidatePath("/dashboard/plans");
  redirect("/dashboard/plans");
}

export async function deleteConversationAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const id = Number(formData.get("id"));
  if (id) await exec("DELETE FROM conversations WHERE id = ? AND user_id = ?", [id, session.id]);
  revalidatePath("/dashboard/conversations");
  redirect("/dashboard/conversations");
}

export async function markNotificationsReadAction() {
  const session = await getSession();
  if (!session) return;
  await exec("UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL", [session.id]);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}

export async function markNotificationReadAction(formData: FormData) {
  const session = await getSession();
  if (!session) return;
  const id = Number(formData.get("id"));
  if (id) {
    await exec("UPDATE notifications SET read_at = NOW() WHERE id = ? AND user_id = ? AND read_at IS NULL", [id, session.id]);
    revalidatePath("/dashboard/notifications");
    revalidatePath("/dashboard");
  }
}

export async function updateNotificationPrefsAction(_prev: DashState, formData: FormData): Promise<DashState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const enabled = formData.get("alerts") === "on" ? 1 : 0;
  await exec(
    "INSERT INTO settings (setting_key, setting_value) VALUES (?,?) ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)",
    [`user_${session.id}_alerts`, String(enabled)]
  );
  return { ok: true, message: "Notification preferences saved." };
}

export async function deleteSavedTripAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/sign-in");
  const tripId = Number(formData.get("trip_id"));
  if (tripId) await exec("DELETE FROM saved_trips WHERE user_id = ? AND trip_id = ?", [session.id, tripId]);
  revalidatePath("/dashboard/saved");
}

export async function getUnreadCount(userId: number) {
  const row = await q1<{ n: number }>("SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL", [userId]);
  return Number(row?.n ?? 0);
}
