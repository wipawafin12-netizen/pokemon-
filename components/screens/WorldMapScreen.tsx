"use client";

import { motion } from "framer-motion";
import { WORLD_MAP_ORDER, getMap } from "@/game/data/maps";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { Button, Panel } from "@/components/common/ui";
import { AudioManager } from "@/game/systems/AudioManager";

/** Safe arrival point for fast travel into each region. */
const SPAWN: Record<string, { x: number; y: number }> = {
  "origin-village": { x: 12, y: 8 },
  "verdant-forest": { x: 1, y: 6 },
  "crystal-caverns": { x: 1, y: 8 },
  "desert-frontier": { x: 1, y: 8 },
  "frozen-ridge": { x: 13, y: 14 },
  "thunder-plateau": { x: 1, y: 8 },
  "sky-temple": { x: 6, y: 12 },
  "capital-city": { x: 1, y: 8 },
};

const REGION_ICONS: Record<string, string> = {
  "origin-village": "🏡",
  "verdant-forest": "🌳",
  "crystal-caverns": "💎",
  "desert-frontier": "🏜️",
  "frozen-ridge": "🏔️",
  "thunder-plateau": "⛈️",
  "sky-temple": "🏛️",
  "capital-city": "🏰",
};

export function WorldMapScreen() {
  const save = useGame((s) => s.save);
  const travelTo = useGame((s) => s.travelTo);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const setScreen = useUI((s) => s.setScreen);

  if (!save) return null;

  return (
    <div className="h-dvh w-full overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">World Map</h2>
          <Button variant="ghost" onClick={closeOverlay}>✕ Close</Button>
        </div>

        <div className="relative space-y-3">
          {/* journey line */}
          <div className="absolute top-4 bottom-4 left-7 w-0.5 bg-slate-700" />
          {WORLD_MAP_ORDER.map((id, i) => {
            const map = getMap(id);
            const visited = !!save.flags[`visited-${id}`];
            const here = save.mapId === id;
            return (
              <motion.div key={id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Panel className={`relative ml-0 flex items-center gap-4 p-4 ${here ? "ring-2 ring-amber-400" : ""} ${visited ? "" : "opacity-50"}`}>
                  <div className="z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-slate-600 bg-slate-800 text-2xl">
                    {visited ? REGION_ICONS[id] : "❓"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-100">{visited ? map.name : "Unexplored Region"}</div>
                    <div className="text-xs text-slate-400">
                      {here
                        ? "You are here"
                        : visited
                          ? map.encounters.length > 0
                            ? `Wild levels ${Math.min(...map.encounters.map((e) => e.minLevel))}–${Math.max(...map.encounters.map((e) => e.maxLevel))}`
                            : "Safe zone"
                          : "Reach it on foot to unlock fast travel"}
                    </div>
                  </div>
                  {visited && !here && (
                    <Button
                      variant="primary"
                      className="shrink-0 px-3 py-1.5 text-xs"
                      onClick={() => {
                        AudioManager.playSfx("confirm");
                        const spawn = SPAWN[id];
                        travelTo(id, spawn.x, spawn.y);
                        setScreen("world");
                      }}
                    >
                      Travel
                    </Button>
                  )}
                </Panel>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
