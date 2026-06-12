"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { getSpecies } from "@/game/data/creatures";
import { CreatureSprite } from "@/components/common/CreatureSprite";
import { Button, Panel, TypeBadge } from "@/components/common/ui";
import { AudioManager } from "@/game/systems/AudioManager";

const STARTERS = ["sproutling", "cindercub", "dripple"];

export function StarterSelect() {
  const [picked, setPicked] = useState<string | null>(null);
  const newGame = useGame((s) => s.newGame);
  const setScreen = useUI((s) => s.setScreen);

  const confirm = () => {
    if (!picked) return;
    const slot = Number(sessionStorage.getItem("em-pending-slot") ?? "0");
    const name = sessionStorage.getItem("em-pending-name") ?? "Tamer";
    AudioManager.playSfx("capture-success");
    newGame(slot, name, picked);
    setScreen("world");
  };

  return (
    // overflow-y-auto + bottom action bar: on phones the three cards stack
    // taller than the viewport and the confirm button must stay reachable
    <div className="h-dvh w-full overflow-y-auto bg-gradient-to-b from-indigo-950 to-slate-950 p-4 pb-28 sm:flex sm:flex-col sm:items-center sm:justify-center">
      <motion.h2 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 text-center text-3xl font-black text-amber-300">
        Choose Your Partner
      </motion.h2>
      <p className="mb-6 text-center text-sm text-slate-400">Elder Rowan smiles: &ldquo;Each of them has been waiting for someone. Perhaps for you.&rdquo;</p>

      <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
        {STARTERS.map((id, i) => {
          const species = getSpecies(id);
          const selected = picked === id;
          return (
            <motion.button
              key={id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              onClick={() => {
                AudioManager.playSfx("click");
                setPicked(id);
              }}
              className="text-left"
            >
              <Panel className={`p-5 transition ${selected ? "ring-2 ring-amber-400" : "hover:border-indigo-500/60"}`}>
                <div className="flex justify-center">
                  <motion.div animate={selected ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 0.4 }}>
                    <CreatureSprite speciesId={id} size={110} />
                  </motion.div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-100">{species.name}</span>
                  <TypeBadge element={species.element} />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{species.description}</p>
              </Panel>
            </motion.button>
          );
        })}
      </div>

      {/* action bar pinned to the bottom — always reachable on small screens */}
      <div className="fixed inset-x-0 bottom-0 z-10 flex justify-center gap-3 border-t border-slate-800/60 bg-slate-950/90 p-4 backdrop-blur">
        <Button variant="ghost" onClick={() => setScreen("save-select")}>← Back</Button>
        <Button variant="gold" disabled={!picked} onClick={confirm} className="px-8">
          {picked ? `Choose ${getSpecies(picked).name}!` : "Pick a partner"}
        </Button>
      </div>
    </div>
  );
}
