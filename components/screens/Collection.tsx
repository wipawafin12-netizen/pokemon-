"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CREATURES, getSpecies } from "@/game/data/creatures";
import { getSkill } from "@/game/data/skills";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { CreatureSprite } from "@/components/common/CreatureSprite";
import { Button, Panel, RarityBadge, TypeBadge } from "@/components/common/ui";

export function Collection() {
  const save = useGame((s) => s.save);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const [selected, setSelected] = useState<string | null>(null);

  if (!save) return null;
  const caught = new Set(save.dexCaught);
  const seen = new Set(save.dexSeen);
  const species = selected ? getSpecies(selected) : null;

  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto flex h-full max-w-5xl flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">Creature Collection</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-400">
              Seen {seen.size} · Caught <span className="font-bold text-emerald-400">{caught.size}</span>/{CREATURES.length}
            </span>
            <Button variant="ghost" onClick={closeOverlay}>✕ Close</Button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 gap-4">
          {/* Grid */}
          <div className="grid flex-1 auto-rows-min grid-cols-4 gap-2 overflow-y-auto pr-1 sm:grid-cols-6 md:grid-cols-8">
            {CREATURES.map((c) => {
              const isCaught = caught.has(c.id);
              const isSeen = seen.has(c.id);
              return (
                <motion.button
                  key={c.id}
                  whileHover={{ scale: 1.06 }}
                  onClick={() => isSeen && setSelected(c.id)}
                  className={`flex aspect-square flex-col items-center justify-center rounded-xl border p-1 ${
                    selected === c.id
                      ? "border-amber-400 bg-slate-800"
                      : isCaught
                        ? "border-slate-600 bg-slate-900 hover:border-indigo-500"
                        : "border-slate-800 bg-slate-900/50"
                  }`}
                >
                  {isSeen ? (
                    <CreatureSprite speciesId={c.id} size={44} silhouette={!isCaught} />
                  ) : (
                    <span className="text-xl text-slate-700">?</span>
                  )}
                  <span className="text-[9px] tabular-nums text-slate-500">#{c.dexNumber}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Detail */}
          {species && (
            <Panel className="hidden w-72 shrink-0 overflow-y-auto p-4 md:block">
              <div className="flex justify-center">
                <CreatureSprite speciesId={species.id} size={120} silhouette={!caught.has(species.id)} />
              </div>
              <div className="mt-2 text-center">
                <div className="text-lg font-bold text-slate-100">
                  #{species.dexNumber} {caught.has(species.id) ? species.name : "???"}
                </div>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <TypeBadge element={species.element} />
                  {species.secondaryElement && <TypeBadge element={species.secondaryElement} />}
                  <RarityBadge rarity={species.rarity} />
                </div>
              </div>
              {caught.has(species.id) ? (
                <>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">{species.description}</p>
                  <div className="mt-3 space-y-1">
                    {Object.entries(species.baseStats).map(([k, v]) => (
                      <div key={k} className="flex items-center gap-2 text-xs">
                        <span className="w-14 uppercase text-slate-500">{k}</span>
                        <div className="h-1.5 flex-1 rounded-full bg-slate-800">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(100, (v / 140) * 100)}%` }} />
                        </div>
                        <span className="w-7 text-right tabular-nums text-slate-300">{v}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills</div>
                    <div className="mt-1 space-y-1">
                      {species.learnset.map((l) => (
                        <div key={l.skillId} className="flex justify-between text-xs">
                          <span className="text-slate-300">{getSkill(l.skillId).name}</span>
                          <span className="text-slate-500">Lv {l.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {species.evolutions.length > 0 && (
                    <div className="mt-3 text-xs text-slate-400">
                      <span className="font-semibold uppercase tracking-wider text-slate-500">Evolves: </span>
                      {species.evolutions.map((e) => `${getSpecies(e.toSpeciesId).name} (${e.label})`).join(" / ")}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-slate-500">Habitat: {species.habitat}</div>
                </>
              ) : (
                <p className="mt-3 text-center text-xs text-slate-500">Capture one to reveal its secrets.</p>
              )}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
