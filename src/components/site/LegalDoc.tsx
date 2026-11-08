import Link from "next/link";
import { ChevronRight, FileText } from "lucide-react";

export type LegalSection = { heading: string; body: string[] };

export default function LegalDoc({ title, intro, updated, sections }: { title: string; intro: string; updated: string; sections: LegalSection[] }) {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="shell py-9">
          <div className="flex items-center gap-1.5 text-[11.5px] text-muted">
            <Link href="/" className="hover:text-forest">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-ink">{title}</span>
          </div>
          <div className="mt-5 flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-600"><FileText className="h-5 w-5" /></span>
            <div>
              <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.02em] text-ink sm:text-[36px]">{title}</h1>
              <p className="mt-1 text-[11.5px] text-muted">Last updated {updated}</p>
            </div>
          </div>
          <p className="mt-3 max-w-2xl text-[13px] leading-relaxed text-muted">{intro}</p>
        </div>
      </section>

      <section className="shell grid gap-8 py-9 lg:grid-cols-[1fr_260px] lg:items-start">
        <article className="min-w-0 space-y-7">
          {sections.map((s, i) => (
            <section key={s.heading} id={`s${i + 1}`} className="scroll-mt-24">
              <h2 className="text-[17px] font-semibold text-ink">{i + 1}. {s.heading}</h2>
              <div className="mt-2 space-y-2.5">
                {s.body.map((p, j) => <p key={j} className="text-[13px] leading-relaxed text-body/80">{p}</p>)}
              </div>
            </section>
          ))}
          <p className="rounded-2xl border border-line bg-mist/60 p-4 text-[11.5px] leading-relaxed text-muted">
            Questions about this document? Email <span className="font-semibold text-forest">hello@nepaltravel.com</span> or use our <Link href="/contact" className="font-semibold text-brand-600">contact form</Link>.
          </p>
        </article>
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="rounded-2xl border border-line bg-white p-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">On this page</p>
            <ol className="mt-2 space-y-1.5">
              {sections.map((s, i) => (
                <li key={s.heading}>
                  <a href={`#s${i + 1}`} className="text-[12px] text-body/75 hover:text-forest">{i + 1}. {s.heading}</a>
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </section>
    </>
  );
}
