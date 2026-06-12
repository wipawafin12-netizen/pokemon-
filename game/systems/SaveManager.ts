import type { GameSettings, PlayerSave } from "../data/types";

const SAVE_VERSION = 1;
const SLOT_COUNT = 3;
const SLOT_KEY = (slot: number) => `eternal-monsters:save:${slot}`;
const SETTINGS_KEY = "eternal-monsters:settings";

export interface SaveSlotSummary {
  slot: number;
  empty: boolean;
  playerName?: string;
  playTimeSec?: number;
  badges?: number;
  dexCaught?: number;
  mapName?: string;
  updatedAt?: number;
}

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

export const SaveManager = {
  SLOT_COUNT,

  save(data: PlayerSave): boolean {
    if (!storageAvailable()) return false;
    try {
      data.version = SAVE_VERSION;
      data.updatedAt = Date.now();
      localStorage.setItem(SLOT_KEY(data.slot), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error("Save failed", e);
      return false;
    }
  },

  load(slot: number): PlayerSave | null {
    if (!storageAvailable()) return null;
    try {
      const raw = localStorage.getItem(SLOT_KEY(slot));
      if (!raw) return null;
      const data = JSON.parse(raw) as PlayerSave;
      return migrate(data);
    } catch (e) {
      console.error("Load failed", e);
      return null;
    }
  },

  delete(slot: number): void {
    if (!storageAvailable()) return;
    localStorage.removeItem(SLOT_KEY(slot));
  },

  listSlots(): SaveSlotSummary[] {
    const out: SaveSlotSummary[] = [];
    for (let i = 0; i < SLOT_COUNT; i++) {
      const data = this.load(i);
      if (!data) out.push({ slot: i, empty: true });
      else
        out.push({
          slot: i,
          empty: false,
          playerName: data.playerName,
          playTimeSec: data.playTimeSec,
          badges: data.badges.length,
          dexCaught: data.dexCaught.length,
          mapName: data.mapId,
          updatedAt: data.updatedAt,
        });
    }
    return out;
  },

  saveSettings(settings: GameSettings): void {
    if (!storageAvailable()) return;
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore */
    }
  },

  loadSettings(): GameSettings | null {
    if (!storageAvailable()) return null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? (JSON.parse(raw) as GameSettings) : null;
    } catch {
      return null;
    }
  },
};

/** Forward-migrate older saves. */
function migrate(data: PlayerSave): PlayerSave {
  if (data.version === SAVE_VERSION) return data;
  // future migrations go here, e.g. if (data.version === 1) {...}
  data.version = SAVE_VERSION;
  return data;
}
