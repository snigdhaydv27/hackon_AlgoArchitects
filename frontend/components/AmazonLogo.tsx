import React from "react";

/**
 * Amazon-style brand logo: the lowercase "amazon" wordmark with the
 * signature orange smile arrow curving from the "a" to the "z".
 */
export function AmazonLogo({
  className = "",
  textClassName = "text-2xl",
  smileColor = "#FF9900",
}: {
  className?: string;
  textClassName?: string;
  smileColor?: string;
}) {
  return (
    <div className={`relative inline-block select-none ${className}`}>
      <span className={`font-bold lowercase tracking-tight leading-none ${textClassName}`}>
        amazon
      </span>
      <svg
        viewBox="0 0 120 16"
        className="absolute left-1 -bottom-1.5 w-[88%] h-2.5"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* smile curve */}
        <path
          d="M3 5 C 38 16, 84 16, 113 6"
          stroke={smileColor}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        {/* arrowhead near the z */}
        <path
          d="M113 6 l-8 1.5 M113 6 l-1.5 8"
          stroke={smileColor}
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/**
 * Standalone Amazon smile mark (no wordmark) for use as a compact icon.
 */
export function AmazonSmile({
  className = "size-5",
  color = "#FF9900",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path
        d="M3 12 C 7 18, 17 18, 21 12"
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M21 12 l-5 0.8 M21 12 l-0.8 5"
        stroke={color}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
