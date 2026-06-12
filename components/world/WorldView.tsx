"use client";

import { useEffect, useRef } from "react";
import type Phaser from "phaser";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { getMap } from "@/game/data/maps";
import { DialogueBox } from "./DialogueBox";
import { ShopModal } from "./ShopModal";
import { TouchControls } from "./TouchControls";
import { useAr } from "@/game/state/arStore";

const MENU_BUTTONS: { label: string; icon: string; screen: "party" | "collection" | "inventory" | "quests" | "world-map" | "settings" }[] = [
  { label: "Party", icon: "🐾", screen: "party" },
  { label: "Collection", icon: "📖", screen: "collection" },
  { label: "Bag", icon: "🎒", screen: "inventory" },
  { label: "Quests", icon: "📜", screen: "quests" },
  { label: "Map", icon: "🗺️", screen: "world-map" },
  { label: "Settings", icon: "⚙️", screen: "settings" },
];

export function WorldView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const save = useGame((s) => s.save);
  const saveGame = useGame((s) => s.saveGame);
  const openOverlay = useUI((s) => s.openOverlay);
  const startHunt = useAr((s) => s.startHunt);

  const mapId = save?.mapId;

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    let destroyed = false;
    void import("@/game/phaser/createGame").then(({ createGame }) => {
      if (destroyed || !containerRef.current) return;
      gameRef.current = createGame(containerRef.current);
    });
    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  if (!save) return null;
  const mapName = mapId ? getMap(mapId).name : "";

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950">
      <div ref={containerRef} className="absolute inset-0" />

      {/* Top HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex flex-wrap items-center justify-between gap-2 p-3">
        <div className="pointer-events-auto rounded-xl border border-slate-700/60 bg-slate-950/80 px-3 py-1.5 backdrop-blur">
          <div className="text-sm font-bold text-amber-300">{mapName}</div>
          <div className="text-xs tabular-nums text-slate-300">
            🪙 {save.gold.toLocaleString()} · 💎 {save.crystals} · 🏅 {save.badges.length}/8
          </div>
        </div>
        <div className="pointer-events-auto flex flex-wrap gap-1.5">
          {MENU_BUTTONS.map((b) => (
            <button
              key={b.screen}
              onClick={() => openOverlay(b.screen)}
              className="rounded-xl border border-slate-700/60 bg-slate-950/80 px-2.5 py-1.5 text-xs font-semibold text-slate-200 backdrop-blur transition hover:bg-indigo-700/70"
              title={b.label}
            >
              <span className="sm:mr-1">{b.icon}</span>
              <span className="hidden sm:inline">{b.label}</span>
            </button>
          ))}
          <button
            onClick={startHunt}
            className="rounded-xl border border-amber-600/60 bg-amber-900/70 px-2.5 py-1.5 text-xs font-semibold text-amber-200 backdrop-blur transition hover:bg-amber-700/70"
            title="AR Hunt"
          >
            <span className="sm:mr-1">📸</span>
            <span className="hidden sm:inline">AR Hunt</span>
          </button>
          <button
            onClick={saveGame}
            className="rounded-xl border border-emerald-700/60 bg-emerald-900/70 px-2.5 py-1.5 text-xs font-semibold text-emerald-200 backdrop-blur transition hover:bg-emerald-700/70"
          >
            <span className="sm:mr-1">💾</span>
            <span className="hidden sm:inline">Save</span>
          </button>
        </div>
      </div>

      <TouchControls />
      <DialogueBox />
      <ShopModal />
    </div>
  );
}
