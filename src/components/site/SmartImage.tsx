"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
};

const FALLBACK = "/images/fallback/nepal.jpg";

export default function SmartImage({ src, alt, className, sizes = "100vw", priority, fill, width, height }: Props) {
  const [current, setCurrent] = useState(src || FALLBACK);
  const fallback = () => {
    if (current !== FALLBACK) setCurrent(FALLBACK);
  };

  if (fill) {
    return (
      <Image
        src={current}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onError={fallback}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={current}
      alt={alt}
      width={width ?? 800}
      height={height ?? 600}
      sizes={sizes}
      priority={priority}
      onError={fallback}
      className={cn("object-cover", className)}
    />
  );
}
