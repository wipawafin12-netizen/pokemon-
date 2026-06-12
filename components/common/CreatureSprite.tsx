"use client";

import { useEffect, useState } from "react";
import { creatureSpriteDataUrl } from "@/game/phaser/creatureSprite";

const assetExists = new Map<string, boolean>();

/**
 * Creature artwork. Prefers a real asset at /assets/creatures/<id>.png
 * (the Higgsfield pipeline drop-in point); falls back to the procedural
 * pixel sprite so the game never shows a broken image.
 */
export function CreatureSprite({
  speciesId,
  size = 96,
  shiny = false,
  silhouette = false,
  className = "",
}: {
  speciesId: string;
  size?: number;
  shiny?: boolean;
  silhouette?: boolean;
  className?: string;
}) {
  const assetUrl = `/assets/creatures/${speciesId}.png`;
  const known = assetExists.get(speciesId);
  const [useAsset, setUseAsset] = useState<boolean>(known ?? false);
  const [fallback, setFallback] = useState<string>("");

  useEffect(() => {
    setFallback(creatureSpriteDataUrl(speciesId, 192, shiny));
    if (assetExists.has(speciesId)) {
      setUseAsset(assetExists.get(speciesId)!);
      return;
    }
    const img = new Image();
    img.onload = () => {
      assetExists.set(speciesId, true);
      setUseAsset(true);
    };
    img.onerror = () => {
      assetExists.set(speciesId, false);
      setUseAsset(false);
    };
    img.src = assetUrl;
  }, [speciesId, shiny, assetUrl]);

  const src = useAsset ? assetUrl : fallback;
  if (!src) return <div style={{ width: size, height: size }} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={speciesId}
      width={size}
      height={size}
      draggable={false}
      className={`select-none ${silhouette ? "brightness-0 opacity-40" : ""} ${useAsset ? "object-contain" : "[image-rendering:pixelated]"} ${className}`}
    />
  );
}
