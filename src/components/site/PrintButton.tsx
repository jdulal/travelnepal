"use client";

import { Printer } from "lucide-react";

export default function PrintButton({ label = "Print / save PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-outline btn-sm">
      <Printer className="h-4 w-4" /> {label}
    </button>
  );
}
