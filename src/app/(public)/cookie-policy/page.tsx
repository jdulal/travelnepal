import type { Metadata } from "next";
import LegalDoc from "@/components/site/LegalDoc";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "The cookies Nepal Travel uses and how you can control them.",
};

export default function CookiePage() {
  return (
    <LegalDoc
      title="Cookie policy"
      updated="1 November 2026"
      intro="We keep cookies to a minimum. Most of what this site does is powered by a single session cookie — there are no advertising or cross-site tracking cookies."
      sections={[
        {
          heading: "Essential cookies",
          body: [
            "nt_session — a signed, httpOnly cookie that keeps you signed in and lets the site show your saved trips, bookings and plans. It expires after 7 days or when you sign out.",
            "These cookies cannot be switched off without breaking sign-in and checkout. They contain no payment details.",
          ],
        },
        {
          heading: "Preference storage",
          body: [
            "Some interface choices, such as a planner draft you keep in the browser or whether you dismissed a notice, may be stored locally in your browser. This data stays on your device and is not sent to us.",
          ],
        },
        {
          heading: "Analytics",
          body: [
            "If analytics are enabled, they are configured to record aggregated page views only — no advertising identifiers and no cross-site profiles. You can block them without affecting bookings.",
          ],
        },
        {
          heading: "Managing cookies",
          body: [
            "You can delete or block cookies through your browser settings. Blocking the session cookie will prevent sign-in, saving trips and completing checkout.",
            "For questions about cookies, email hello@nepaltravel.com.",
          ],
        },
      ]}
    />
  );
}
