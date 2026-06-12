"use client";

import { create } from "zustand";
import type { GameSettings } from "../data/types";
import { SaveManager } from "../systems/SaveManager";
import { AudioManager } from "../systems/AudioManager";

const DEFAULTS: GameSettings = {
  musicVolume: 0.5,
  sfxVolume: 0.7,
  textSpeed: "normal",
  darkMode: true,
  reducedMotion: false,
  touchControls: "auto",
};

interface SettingsState extends GameSettings {
  hydrated: boolean;
  hydrate: () => void;
  update: (patch: Partial<GameSettings>) => void;
}

export const useSettings = create<SettingsState>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,

  hydrate: () => {
    const loaded = SaveManager.loadSettings();
    const merged = { ...DEFAULTS, ...(loaded ?? {}) };
    AudioManager.setVolumes(merged.musicVolume, merged.sfxVolume);
    set({ ...merged, hydrated: true });
  },

  update: (patch) => {
    set(patch);
    const s = get();
    const settings: GameSettings = {
      musicVolume: s.musicVolume,
      sfxVolume: s.sfxVolume,
      textSpeed: s.textSpeed,
      darkMode: s.darkMode,
      reducedMotion: s.reducedMotion,
      touchControls: s.touchControls,
    };
    AudioManager.setVolumes(settings.musicVolume, settings.sfxVolume);
    SaveManager.saveSettings(settings);
  },
}));

export const TEXT_SPEED_MS: Record<GameSettings["textSpeed"], number> = {
  slow: 55,
  normal: 30,
  fast: 12,
};
