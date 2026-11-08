"use client";

import { cn } from "@/lib/utils";

export default function ConfirmSubmit({
  message,
  className,
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={cn("inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold", className)}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
