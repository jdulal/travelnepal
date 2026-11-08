"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SaveButton({ tripId, initialSaved }: { tripId: number; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();
  const router = useRouter();

  const toggle = () => {
    start(async () => {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      if (res.status === 401) {
        router.push(`/sign-in?next=${encodeURIComponent("/dashboard/saved")}`);
        return;
      }
      const data = await res.json();
      setSaved(Boolean(data.saved));
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Remove from saved trips" : "Save trip"}
      className={cn(
        "pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-105",
        saved ? "text-rose-500" : "text-ink/70 hover:text-rose-500"
      )}
    >
      <Heart className={cn("h-4 w-4", saved && "fill-rose-500")} />
    </button>
  );
}
