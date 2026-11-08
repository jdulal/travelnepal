import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import Logo from "@/components/site/Logo";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === "admin") redirect("/admin");

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-forest p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url('/images/hero/hero.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 via-forest/70 to-forest" />
        <div className="relative">
          <Logo light />
        </div>
        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5" /> Operations console
          </span>
          <h2 className="mt-5 text-[34px] font-semibold leading-tight text-white">Run every trek, tour and traveller from one place.</h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Manage bookings and departures, publish trips and stories, moderate reviews, answer inquiries and watch revenue — all without leaving Kathmandu time.
          </p>
        </div>
        <p className="relative text-[11px] text-white/45">© {new Date().getFullYear()} Nepal Travel Pvt. Ltd. Kathmandu, Nepal.</p>
      </div>

      <div className="flex flex-col justify-center px-5 py-10 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="mt-8 lg:mt-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">Nepal Travel admin</p>
            <h1 className="mt-2 text-[28px] font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-1.5 text-sm text-slate-500">Sign in with your administrator account to continue.</p>
          </div>

          <div className="mt-7">
            <AdminLoginForm />
          </div>

          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/70 px-4 py-3 text-[11.5px] leading-relaxed text-forest">
            <span className="font-bold">Demo access</span> — username <code className="rounded bg-white px-1 py-0.5 font-semibold">admin</code>, password{" "}
            <code className="rounded bg-white px-1 py-0.5 font-semibold">Nepal@2026</code>. Change this before going live.
          </div>

          <div className="mt-7 flex items-center justify-between text-[12px]">
            <Link href="/" className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-forest">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </Link>
            <Link href="/sign-in" className="font-semibold text-brand-600 hover:text-forest">
              Traveller sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
