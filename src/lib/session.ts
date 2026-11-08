import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/types";

const COOKIE = "nt_session";
const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || "nepal-travel-dev-secret-change-me-please-2026");

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ id: user.id, name: user.name, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());

  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.id || !payload.role) return null;
    return {
      id: Number(payload.id),
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
      role: payload.role === "admin" ? "admin" : "user",
    };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export const SESSION_COOKIE = COOKIE;
