"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { q1, exec } from "@/lib/db";
import { createSession, destroySession, getSession } from "@/lib/session";
import { rateLimit, clientKey } from "@/lib/rate-limit";

export type AuthState = { error?: string; ok?: boolean; message?: string };

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(40).optional(),
  password: z.string().min(8, "Password must be at least 8 characters.").max(100),
});

export async function signUpAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, phone, password } = parsed.data;

  const limit = rateLimit(clientKey("signup", await ip()), 10, 20 * 60 * 1000);
  if (!limit.allowed) return { error: "Too many attempts. Please try again later." };

  const existing = await q1<{ id: number }>("SELECT id FROM users WHERE email = ?", [email]);
  if (existing) return { error: "An account with this email already exists. Try signing in." };

  const hash = await bcrypt.hash(password, 10);
  const result = await exec(
    "INSERT INTO users (name, email, phone, password_hash, role, status) VALUES (?,?,?,?, 'user', 'active')",
    [name, email, phone || null, hash]
  );

  await createSession({ id: result.insertId, name, email, role: "user" });
  redirect("/dashboard");
}

const signInSchema = z.object({
  identifier: z.string().trim().min(1, "Enter your email or username."),
  password: z.string().min(1, "Enter your password."),
});

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { identifier, password } = parsed.data;

  const limit = rateLimit(clientKey("signin", identifier), 6, 10 * 60 * 1000);
  if (!limit.allowed) return { error: "Too many failed attempts. Please wait 10 minutes." };

  const user = await q1<{ id: number; name: string; email: string; password_hash: string; role: "user" | "admin"; status: string }>(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? OR username = ? LIMIT 1",
    [identifier.toLowerCase(), identifier]
  );
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Incorrect email/username or password." };
  }
  if (user.status === "blocked") return { error: "This account has been suspended. Please contact support." };

  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  const next = String(formData.get("next") || "");
  redirect(next.startsWith("/") ? next : user.role === "admin" ? "/admin" : "/dashboard");
}

export async function adminLoginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const identifier = String(formData.get("identifier") || "");
  const password = String(formData.get("password") || "");
  if (!identifier || !password) return { error: "Enter your admin username and password." };

  const limit = rateLimit(clientKey("admin", identifier), 5, 10 * 60 * 1000);
  if (!limit.allowed) return { error: "Too many failed attempts. Please wait 10 minutes." };

  const user = await q1<{ id: number; name: string; email: string; password_hash: string; role: "user" | "admin"; status: string }>(
    "SELECT id, name, email, password_hash, role, status FROM users WHERE (email = ? OR username = ?) AND role = 'admin' LIMIT 1",
    [identifier.toLowerCase(), identifier]
  );
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "Invalid administrator credentials." };
  }
  if (user.status === "blocked") return { error: "This admin account is suspended." };

  await createSession({ id: user.id, name: user.name, email: user.email, role: "admin" });
  await exec(
    "INSERT INTO activity_logs (user_id, action, entity, entity_id, details, ip) VALUES (?, 'login', 'admin', ?, 'Admin signed in', ?)",
    [user.id, user.id, await ip()]
  );
  redirect("/admin");
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const phone = String(formData.get("phone") || "").trim();
  const country = String(formData.get("country") || "").trim();

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter a valid email address." };

  const other = await q1<{ id: number }>("SELECT id FROM users WHERE email = ? AND id <> ?", [email, session.id]);
  if (other) return { error: "Another account already uses this email." };

  await exec("UPDATE users SET name = ?, email = ?, phone = ?, country = ? WHERE id = ?", [
    name,
    email,
    phone || null,
    country || "Nepal",
    session.id,
  ]);
  await createSession({ ...session, name, email });
  return { ok: true, message: "Profile updated." };
}

export async function changePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) return { error: "Please sign in again." };
  const current = String(formData.get("current") || "");
  const next = String(formData.get("password") || "");
  if (next.length < 8) return { error: "New password must be at least 8 characters." };

  const user = await q1<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [session.id]);
  if (!user || !(await bcrypt.compare(current, user.password_hash))) {
    return { error: "Your current password is incorrect." };
  }
  await exec("UPDATE users SET password_hash = ? WHERE id = ?", [await bcrypt.hash(next, 10), session.id]);
  return { ok: true, message: "Password changed successfully." };
}
