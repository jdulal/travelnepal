import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = () => new TextEncoder().encode(process.env.SESSION_SECRET || "nepal-travel-dev-secret-change-me-please-2026");

async function readSession(req: NextRequest) {
  const token = req.cookies.get("nt_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const session = await readSession(req);

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    if (session.role !== "admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/dashboard") && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if ((pathname === "/sign-in" || pathname === "/sign-up") && session) {
    const url = req.nextUrl.clone();
    url.pathname = session.role === "admin" ? "/admin" : "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};
