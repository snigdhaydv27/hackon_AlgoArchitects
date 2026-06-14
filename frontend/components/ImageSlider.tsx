"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";

interface Props {
  images: string[];
  alt: string;
  className?: string;
}

/**
 * Left/right image slider for product listings.
 * Shows navigation arrows when there are multiple images.
 * Graceful fallback if image fails to load.
 */
export function ImageSlider({ images, alt, className = "" }: Props) {
  const [current, setCurrent] = useState(0);
  const [failedSet, setFailedSet] = useState<Set<number>>(new Set());

  const validImages = images.filter((img) => img && img.length > 0);

  if (validImages.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2 ${className}`}>
        <Package className="size-10 text-slate-400" />
        <span className="text-xs text-slate-500 font-medium text-center px-2 line-clamp-2">{alt}</span>
      </div>
    );
  }

  function prev(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === 0 ? validImages.length - 1 : c - 1));
  }

  function next(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setCurrent((c) => (c === validImages.length - 1 ? 0 : c + 1));
  }

  function handleError() {
    setFailedSet((prev) => new Set(prev).add(current));
  }

  const isFailed = failedSet.has(current);

  return (
    <div className={`relative group ${className}`}>
      {/* Current image or fallback */}
      {isFailed ? (
        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center gap-2">
          <Package className="size-10 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">{alt}</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={validImages[current]}
          alt={`${alt} - photo ${current + 1}`}
          className="w-full h-full object-cover"
          onError={handleError}
        />
      )}

      {/* Left/Right arrows (only show if multiple images) */}
      {validImages.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-4 text-slate-700" />
          </button>
          <button
            onClick={next}
            className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-md rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            aria-label="Next image"
          >
            <ChevronRight className="size-4 text-slate-700" />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {validImages.map((_, i) => (
            <span
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === current ? "bg-white w-3" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      {/* Image counter badge */}
      {validImages.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-medium rounded-full px-1.5 py-0.5">
          {current + 1}/{validImages.length}
        </div>
      )}
    </div>
  );
}
