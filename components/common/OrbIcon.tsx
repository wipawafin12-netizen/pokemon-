"use client";

import { useState } from "react";

/**
 * The capture orb artwork (Higgsfield-generated original design).
 * Falls back to the crystal-ball emoji if the asset is missing.
 */
export function OrbIcon({ size = 64, className = "" }: { size?: number; className?: string }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span className={className} style={{ fontSize: size * 0.85, lineHeight: 1 }}>
        🔮
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/ui/capture-orb.png"
      alt="Capture Orb"
      width={size}
      height={size}
      draggable={false}
      onError={() => setBroken(true)}
      className={`select-none object-contain drop-shadow-lg ${className}`}
    />
  );
}
