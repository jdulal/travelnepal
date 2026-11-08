import type { Metadata } from "next";
import SignInForm from "@/components/site/SignInForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  const next = sp.next && sp.next.startsWith("/") ? sp.next : "";
  return <SignInForm next={next} />;
}
