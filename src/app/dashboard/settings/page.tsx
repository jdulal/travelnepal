import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Headset, ShieldCheck, UserRound } from "lucide-react";
import ProfileForm from "@/components/dashboard/ProfileForm";
import PasswordForm from "@/components/dashboard/PasswordForm";
import { requireUser } from "@/lib/guards";
import { getProfile } from "@/lib/queries";
import { initials, shortDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Account settings" };

export default async function SettingsPage() {
  const session = await requireUser("/dashboard/settings");
  const profile = await getProfile(session.id);

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Your account</p>
        <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em] text-ink">Account settings</h1>
        <p className="mt-1 text-[12.5px] text-muted">Keep your details accurate — they&apos;re used on permits and booking documents.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr] xl:items-start">
        <div className="space-y-4">
          <ProfileForm profile={{ name: profile?.name ?? session.name, email: profile?.email ?? session.email, phone: profile?.phone ?? null, country: profile?.country ?? "Nepal" }} />
          <PasswordForm />
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-forest text-[14px] font-bold text-white">{initials(session.name)}</span>
              <div>
                <p className="text-[14px] font-semibold text-ink">{session.name}</p>
                <p className="text-[11px] text-muted">{session.email}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-3 text-[11.5px]">
              <p className="flex justify-between gap-2"><span className="text-muted">Member since</span><span className="font-medium text-ink">{shortDate(profile?.created_at)}</span></p>
              <p className="flex justify-between gap-2"><span className="text-muted">Account type</span><span className="inline-flex items-center gap-1 font-medium capitalize text-ink"><BadgeCheck className="h-3.5 w-3.5 text-brand-600" /> {session.role}</span></p>
              <p className="flex justify-between gap-2"><span className="text-muted">Email verification</span><span className="font-medium text-brand-700">Verified on sign-up</span></p>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-white p-5 shadow-card">
            <ShieldCheck className="h-5 w-5 text-brand-500" />
            <h2 className="mt-2 text-[13px] font-semibold text-ink">Your data</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">We store only what&apos;s needed to plan and run your trip. You can request a copy or deletion of your account data any time.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href="/privacy-policy" className="btn-outline btn-sm">Privacy policy</Link>
              <Link href="/contact?subject=Data%20request" className="btn-ghost btn-sm">Request my data</Link>
            </div>
          </div>

          <div className="rounded-3xl bg-forest p-5 text-white">
            <Headset className="h-5 w-5 text-brand-200" />
            <h2 className="mt-2 text-[13px] font-semibold">Something not right?</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-white/60">Our Kathmandu team can update names, merge duplicate accounts or fix booking details.</p>
            <Link href="/contact" className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3.5 py-1.5 text-[11px] font-bold text-forest hover:bg-brand-50"><UserRound className="h-3.5 w-3.5" /> Contact support</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
