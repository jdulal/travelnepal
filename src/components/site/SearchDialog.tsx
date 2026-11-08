"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, MapPin, ArrowRight, Loader2 } from "lucide-react";

type Results = {
  trips: { title: string; slug: string; destination_name: string; duration_days: number }[];
  destinations: { name: string; slug: string; region: string }[];
};

export default function SearchDialog({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ trips: [], destinations: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 60);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ trips: [], destinations: [] });
      return;
    }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch {
        setResults({ trips: [], destinations: [] });
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    router.push(`/tours?q=${encodeURIComponent(query)}`);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search destinations and trips"
        className="grid h-10 w-10 place-items-center rounded-full text-ink transition hover:bg-brand-50 hover:text-forest"
      >
        <Search className="h-[19px] w-[19px]" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center bg-forest-deep/40 px-4 pt-[8vh] backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/60 bg-white shadow-float"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search Nepal Travel"
          >
            <form onSubmit={submit} className="flex items-center gap-3 border-b border-line px-5 py-4">
              <Search className="h-5 w-5 shrink-0 text-brand-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Everest, Pokhara, Chitwan or a trek…"
                className="h-10 w-full bg-transparent text-[15px] text-ink placeholder:text-muted/70"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-brand-500" />}
              <button type="button" onClick={() => setOpen(false)} className="grid h-8 w-8 place-items-center rounded-full text-muted hover:bg-mist" aria-label="Close search">
                <X className="h-4 w-4" />
              </button>
            </form>

            <div className="max-h-[55vh] overflow-y-auto p-3">
              {!query && (
                <div className="p-2">
                  <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Popular right now</p>
                  <div className="flex flex-wrap gap-2">
                    {["Everest Base Camp", "Annapurna", "Pokhara", "Chitwan", "Mustang", "Poon Hill"].map((s) => (
                      <button key={s} onClick={() => setQuery(s)} className="chip">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {results.destinations.length > 0 && (
                <div className="p-2">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Destinations</p>
                  {results.destinations.map((d) => (
                    <Link key={d.slug} href={`/destinations/${d.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-mist">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"><MapPin className="h-4 w-4" /></span>
                      <span>
                        <span className="block text-sm font-medium text-ink">{d.name}</span>
                        <span className="block text-xs text-muted">{d.region}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {results.trips.length > 0 && (
                <div className="p-2">
                  <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Trips</p>
                  {results.trips.map((t) => (
                    <Link key={t.slug} href={`/tours/${t.slug}`} onClick={() => setOpen(false)} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 hover:bg-mist">
                      <span>
                        <span className="block text-sm font-medium text-ink">{t.title}</span>
                        <span className="block text-xs text-muted">{t.destination_name} · {t.duration_days} days</span>
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand-500" />
                    </Link>
                  ))}
                </div>
              )}

              {query && !loading && results.trips.length === 0 && results.destinations.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted">
                  No matches for “{query}”. Try “Everest”, “Pokhara” or “trek”.
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line bg-mist/60 px-5 py-3 text-xs text-muted">
              <span>Press <kbd className="rounded border border-line bg-white px-1.5 py-0.5 text-[10px]">Esc</kbd> to close</span>
              <button onClick={submit as unknown as () => void} className="font-semibold text-brand-600 hover:text-forest">
                See all results →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
