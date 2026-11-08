import Link from "next/link";
import { cn } from "@/lib/utils";

export default function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="Nepal Travel home">
      <span className="relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-50 ring-1 ring-brand-200 transition group-hover:ring-brand-400">
        <svg viewBox="0 0 40 40" className="h-7 w-7" aria-hidden="true">
          <circle cx="29" cy="11" r="3.2" fill="#f0b429" />
          <path d="M5 29.5 15.5 13l5.6 9 3-4.5L34 29.5H5Z" fill="#63ab45" />
          <path d="M5 29.5 15.5 13l3.6 5.8-4.4 6.6-3.7 4.1H5Z" fill="#004f32" opacity=".88" />
          <path d="m10.5 29.5 5-7.4 4.9 7.4h-9.9Z" fill="#fff" opacity=".55" />
          <path d="M4 32.5h32" stroke="#004f32" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn("text-[21px] font-semibold tracking-[-0.03em]", light ? "text-white" : "text-ink")}>
          Nepal <span className={light ? "text-brand-300" : "text-brand-500"}>Travel</span>
        </span>
        <span className={cn("mt-1 text-[9px] font-medium uppercase tracking-[0.24em]", light ? "text-white/55" : "text-muted/80")}>
          Trek · Tour · Explore
        </span>
      </span>
    </Link>
  );
}
