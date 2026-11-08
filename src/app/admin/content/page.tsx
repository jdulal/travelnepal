import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { requireAdmin } from "@/lib/guards";
import { getAdminFaqs, getAdminTestimonials } from "@/lib/admin";
import { deleteFaqAction, deleteTestimonialAction } from "@/app/actions/admin";
import FaqForm from "@/components/admin/FaqForm";
import TestimonialForm from "@/components/admin/TestimonialForm";
import ConfirmSubmit from "@/components/admin/ConfirmSubmit";
import { PageHeader, StatusPill } from "@/components/admin/AdminUI";
import { Star } from "lucide-react";

export const metadata: Metadata = { title: "FAQs & testimonials", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireAdmin();
  const [faqs, testimonials] = await Promise.all([getAdminFaqs(), getAdminTestimonials()]);

  return (
    <div>
      <PageHeader
        title="FAQs & testimonials"
        description="Reusable trust content. FAQs power the help centre; testimonials appear across the homepage and trip pages."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="admin-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-slate-900">Frequently asked questions</h3>
              <p className="text-[11px] text-slate-400">{faqs.length} questions · grouped by category on the FAQ page</p>
            </div>
          </div>

          <details>
            <summary className="cursor-pointer rounded-xl bg-brand-50 px-3 py-2 text-[11.5px] font-semibold text-forest ring-1 ring-brand-200">+ Add a new FAQ</summary>
            <div className="mt-2"><FaqForm /></div>
          </details>

          <div className="mt-3 space-y-2">
            {faqs.length === 0 && <p className="py-6 text-center text-[12px] text-slate-400">No FAQs yet.</p>}
            {faqs.map((f) => (
              <div key={f.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-slate-700">{f.question}</p>
                    <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-400">{f.answer}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500">{f.category}</span>
                      <StatusPill status={f.active ? "active" : "hidden"} />
                    </div>
                  </div>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={f.id} />
                    <ConfirmSubmit message="Delete this FAQ?" className="text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmSubmit>
                  </form>
                </div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-[10.5px] font-semibold text-brand-600 hover:text-forest">Edit</summary>
                  <FaqForm faq={f} />
                </details>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-card p-5">
          <div className="mb-3">
            <h3 className="text-[13px] font-bold text-slate-900">Testimonials</h3>
            <p className="text-[11px] text-slate-400">{testimonials.length} quotes · only active ones are shown</p>
          </div>

          <details>
            <summary className="cursor-pointer rounded-xl bg-brand-50 px-3 py-2 text-[11.5px] font-semibold text-forest ring-1 ring-brand-200">+ Add a testimonial</summary>
            <div className="mt-2"><TestimonialForm /></div>
          </details>

          <div className="mt-3 space-y-2">
            {testimonials.length === 0 && <p className="py-6 text-center text-[12px] text-slate-400">No testimonials yet.</p>}
            {testimonials.map((t) => (
              <div key={t.id} className="rounded-xl border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-semibold text-slate-700">{t.name}</p>
                      <span className="flex items-center">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-2.5 w-2.5 ${n <= t.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-[11px] italic text-slate-400">“{t.quote}”</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      {t.location && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9.5px] font-semibold text-slate-500">{t.location}</span>}
                      <StatusPill status={t.active ? "active" : "hidden"} />
                    </div>
                  </div>
                  <form action={deleteTestimonialAction}>
                    <input type="hidden" name="id" value={t.id} />
                    <ConfirmSubmit message="Delete this testimonial?" className="text-rose-500 hover:bg-rose-50">
                      <Trash2 className="h-3.5 w-3.5" />
                    </ConfirmSubmit>
                  </form>
                </div>
                <details className="mt-1">
                  <summary className="cursor-pointer text-[10.5px] font-semibold text-brand-600 hover:text-forest">Edit</summary>
                  <TestimonialForm testimonial={t} />
                </details>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
