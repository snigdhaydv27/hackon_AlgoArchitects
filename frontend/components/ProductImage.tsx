"use client";

import { useState } from "react";
import { Package } from "lucide-react";

interface Props {
  src?: string | null;
  alt: string;
  className?: string;
}

/**
 * Product image with graceful fallback.
 * Shows a styled placeholder if the image fails to load or src is empty.
 */
export function ProductImage({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2 ${className}`}>
        <Package className="size-10 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium text-center px-2 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
