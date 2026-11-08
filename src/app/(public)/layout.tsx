import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import MobileNav from "@/components/site/MobileNav";
import AiAssistant from "@/components/site/AiAssistant";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <div className="h-16 md:hidden" />
      <MobileNav />
      <AiAssistant />
    </div>
  );
}
