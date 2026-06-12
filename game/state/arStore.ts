"use client";

import { create } from "zustand";
import type { CreatureInstance } from "../data/types";
import { spawnArCreature } from "../systems/arCapture";
import { useGame } from "./gameStore";
import { useUI } from "./uiStore";

interface ArState {
  target: CreatureInstance | null;
  /** start an AR hunt on the current map */
  startHunt: () => void;
  clear: () => void;
}

export const useAr = create<ArState>((set) => ({
  target: null,

  startHunt: () => {
    const game = useGame.getState();
    const save = game.save;
    if (!save) return;
    const partyLevel = save.party[0]?.level ?? 5;
    const target = spawnArCreature(save.mapId, partyLevel);
    game.markSeen(target.speciesId);
    set({ target });
    useUI.getState().setScreen("ar-capture");
  },

  clear: () => set({ target: null }),
}));
