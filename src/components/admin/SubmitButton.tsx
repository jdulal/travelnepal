"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SubmitButton({
  children,
  className,
  pendingLabel,
}: {
  children: React.ReactNode;
  className?: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-[12.5px] font-semibold text-white transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60",
        className
      )}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {pending ? pendingLabel ?? "Saving…" : children}
    </button>
  );
}
