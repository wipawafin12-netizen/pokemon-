"use client";

import { useState } from "react";
import { getSpecies } from "@/game/data/creatures";
import { getSkill } from "@/game/data/skills";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { xpForLevel } from "@/game/systems/leveling";
import { Button, HpBar, Panel, StatusBadge, TypeBadge, XpBar } from "@/components/common/ui";
import { CreatureSprite } from "@/components/common/CreatureSprite";

export function PartyScreen() {
  const save = useGame((s) => s.save);
  const setParty = useGame((s) => s.setParty);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  if (!save) return null;
  const selected = save.party.find((c) => c.uid === selectedUid) ?? save.party[0];

  const move = (index: number, dir: -1 | 1) => {
    const next = [...save.party];
    const j = index + dir;
    if (j < 0 || j >= next.length) return;
    [next[index], next[j]] = [next[j], next[index]];
    setParty(next);
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto flex h-full max-w-4xl flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">Party</h2>
          <Button variant="ghost" onClick={closeOverlay}>✕ Close</Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
          <div className="flex-1 space-y-2 overflow-y-auto pr-1">
            {save.party.map((c, i) => {
              const species = getSpecies(c.speciesId);
              return (
                <Panel
                  key={c.uid}
                  className={`flex items-center gap-3 p-3 ${selected?.uid === c.uid ? "ring-1 ring-amber-400" : ""}`}
                >
                  <button onClick={() => setSelectedUid(c.uid)} className="flex flex-1 items-center gap-3 text-left">
                    <CreatureSprite speciesId={c.speciesId} size={52} shiny={c.isShiny} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100">{c.nickname ?? species.name}</span>
                        {c.isShiny && <span title="Shiny">✨</span>}
                        <span className="text-xs text-slate-400">Lv {c.level}</span>
                        {i === 0 && <span className="rounded bg-amber-500/20 px-1.5 text-[9px] font-bold text-amber-300">LEAD</span>}
                        <StatusBadge status={c.status} />
                      </div>
                      <HpBar current={c.currentHp} max={c.stats.hp} />
                    </div>
                  </button>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="rounded bg-slate-800 px-2 text-xs text-slate-300 disabled:opacity-30">▲</button>
                    <button onClick={() => move(i, 1)} disabled={i === save.party.length - 1} className="rounded bg-slate-800 px-2 text-xs text-slate-300 disabled:opacity-30">▼</button>
                  </div>
                </Panel>
              );
            })}
            {save.storage.length > 0 && (
              <div className="pt-2 text-xs text-slate-500">+{save.storage.length} creature(s) in storage</div>
            )}
          </div>

          {selected && (
            <Panel className="w-full shrink-0 overflow-y-auto p-4 md:w-80">
              {(() => {
                const species = getSpecies(selected.speciesId);
                const inLevel = selected.xp - xpForLevel(selected.level);
                const needed = xpForLevel(selected.level + 1) - xpForLevel(selected.level);
                return (
                  <>
                    <div className="flex justify-center"><CreatureSprite speciesId={selected.speciesId} size={110} shiny={selected.isShiny} /></div>
                    <div className="mt-2 text-center">
                      <div className="text-lg font-bold text-slate-100">{selected.nickname ?? species.name}</div>
                      <div className="mt-1 flex items-center justify-center gap-2">
                        <TypeBadge element={species.element} />
                        {species.secondaryElement && <TypeBadge element={species.secondaryElement} />}
                      </div>
                    </div>
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between"><span className="text-slate-500">Level</span><span className="text-slate-200">{selected.level}</span></div>
                      <XpBar xpInLevel={inLevel} xpForNext={needed} />
                      <div className="flex justify-between"><span className="text-slate-500">Friendship</span><span className="text-rose-300">{"♥".repeat(Math.max(1, Math.round(selected.friendship / 52)))} {selected.friendship}</span></div>
                      {(["hp", "attack", "defense", "magic", "speed"] as const).map((k) => (
                        <div key={k} className="flex justify-between">
                          <span className="uppercase text-slate-500">{k}</span>
                          <span className="tabular-nums text-slate-200">{selected.stats[k]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Skills</div>
                      <div className="mt-1 space-y-1.5">
                        {selected.skills.map((id) => {
                          const s = getSkill(id);
                          return (
                            <div key={id} className="rounded-lg bg-slate-800/70 p-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-200">{s.name}</span>
                                <TypeBadge element={s.element} small />
                              </div>
                              <div className="mt-0.5 flex gap-3 text-[10px] text-slate-500">
                                <span>PWR {s.power || "—"}</span>
                                <span>ACC {s.accuracy}</span>
                                <span>CD {s.cooldown}</span>
                                <span className="uppercase">{s.category}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </>
                );
              })()}
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
