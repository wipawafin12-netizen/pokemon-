"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SaveManager, SaveSlotSummary } from "@/game/systems/SaveManager";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { getMap } from "@/game/data/maps";
import { Button, Panel } from "@/components/common/ui";
import { AudioManager } from "@/game/systems/AudioManager";

function fmtTime(sec = 0): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function SaveSelect() {
  const [slots, setSlots] = useState<SaveSlotSummary[]>([]);
  const [naming, setNaming] = useState<number | null>(null);
  const [name, setName] = useState("");
  const loadGame = useGame((s) => s.loadGame);
  const setScreen = useUI((s) => s.setScreen);

  const refresh = () => setSlots(SaveManager.listSlots());
  useEffect(refresh, []);

  const handleSlot = (slot: SaveSlotSummary) => {
    AudioManager.playSfx("confirm");
    if (slot.empty) {
      setNaming(slot.slot);
      setName("");
    } else if (loadGame(slot.slot)) {
      setScreen("world");
    }
  };

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-950 p-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-xl">
        <h2 className="mb-6 text-center text-3xl font-black text-amber-300">Choose a Save</h2>
        <div className="space-y-3">
          {slots.map((slot) => (
            <Panel key={slot.slot} className="overflow-hidden">
              {naming === slot.slot ? (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value.slice(0, 12))}
                    placeholder="Your tamer name..."
                    className="flex-1 rounded-xl border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100 outline-none focus:border-indigo-400"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && name.trim()) {
                        useUI.getState().setScreen("starter");
                        sessionStorage.setItem("em-pending-slot", String(slot.slot));
                        sessionStorage.setItem("em-pending-name", name.trim());
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="gold"
                      disabled={!name.trim()}
                      onClick={() => {
                        sessionStorage.setItem("em-pending-slot", String(slot.slot));
                        sessionStorage.setItem("em-pending-name", name.trim());
                        useUI.getState().setScreen("starter");
                      }}
                    >
                      Begin
                    </Button>
                    <Button variant="ghost" onClick={() => setNaming(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 p-4">
                  <button className="flex-1 text-left" onClick={() => handleSlot(slot)}>
                    {slot.empty ? (
                      <div>
                        <div className="font-bold text-slate-300">Slot {slot.slot + 1} — Empty</div>
                        <div className="text-xs text-slate-500">Start a new adventure</div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-bold text-slate-100">
                          {slot.playerName} <span className="ml-2 text-xs font-normal text-amber-400">🏅 {slot.badges}/8</span>
                        </div>
                        <div className="text-xs text-slate-400">
                          {slot.mapName ? getMap(slot.mapName).name : "?"} · {fmtTime(slot.playTimeSec)} · 📖 {slot.dexCaught}/51
                        </div>
                      </div>
                    )}
                  </button>
                  {!slot.empty && (
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => {
                        if (confirm(`Delete ${slot.playerName}'s save? This cannot be undone.`)) {
                          SaveManager.delete(slot.slot);
                          refresh();
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={() => setScreen("menu")}>← Back to Title</Button>
        </div>
      </motion.div>
    </div>
  );
}
