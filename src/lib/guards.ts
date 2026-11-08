import { redirect } from "next/navigation";
import { getSession } from "./session";
import type { SessionUser } from "@/types";

export async function requireUser(next = "/dashboard"): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "admin") redirect("/dashboard");
  return session;
}

export function isAdmin(session: SessionUser | null) {
  return session?.role === "admin";
}
