"use client";

import { create } from "zustand";

export type Screen =
  | "menu"
  | "save-select"
  | "starter"
  | "world"
  | "world-map"
  | "battle"
  | "ar-capture"
  | "collection"
  | "inventory"
  | "quests"
  | "party"
  | "settings";

export interface DialogueState {
  speaker: string;
  lines: string[];
  index: number;
  /** npc id, used to fire quest hooks when dialogue closes */
  npcId?: string;
}

export interface Toast {
  id: number;
  text: string;
  kind: "info" | "success" | "warning";
}

interface UIState {
  screen: Screen;
  /** screen to return to when closing an overlay menu */
  previousScreen: Screen;
  dialogue: DialogueState | null;
  shopId: string | null;
  toasts: Toast[];
  /** virtual d-pad state, read by the Phaser scene */
  touchDir: { up: boolean; down: boolean; left: boolean; right: boolean };
  touchRun: boolean;
  touchInteract: boolean;

  setScreen: (s: Screen) => void;
  openOverlay: (s: Screen) => void;
  closeOverlay: () => void;
  openDialogue: (d: Omit<DialogueState, "index">) => void;
  advanceDialogue: () => void;
  closeDialogue: () => void;
  openShop: (shopId: string) => void;
  closeShop: () => void;
  toast: (text: string, kind?: Toast["kind"]) => void;
  dismissToast: (id: number) => void;
  setTouchDir: (dir: Partial<UIState["touchDir"]>) => void;
  setTouchRun: (run: boolean) => void;
  pressInteract: () => void;
  clearInteract: () => void;
}

let toastId = 0;

export const useUI = create<UIState>((set, get) => ({
  screen: "menu",
  previousScreen: "menu",
  dialogue: null,
  shopId: null,
  toasts: [],
  touchDir: { up: false, down: false, left: false, right: false },
  touchRun: false,
  touchInteract: false,

  setScreen: (s) => set({ screen: s }),

  openOverlay: (s) => set((st) => ({ screen: s, previousScreen: st.screen })),
  closeOverlay: () => set((st) => ({ screen: st.previousScreen })),

  openDialogue: (d) => set({ dialogue: { ...d, index: 0 } }),
  advanceDialogue: () => {
    const d = get().dialogue;
    if (!d) return;
    if (d.index + 1 < d.lines.length) set({ dialogue: { ...d, index: d.index + 1 } });
    else set({ dialogue: null });
  },
  closeDialogue: () => set({ dialogue: null }),

  openShop: (shopId) => set({ shopId }),
  closeShop: () => set({ shopId: null }),

  toast: (text, kind = "info") => {
    const id = ++toastId;
    set((st) => ({ toasts: [...st.toasts.slice(-3), { id, text, kind }] }));
    setTimeout(() => get().dismissToast(id), 3500);
  },
  dismissToast: (id) => set((st) => ({ toasts: st.toasts.filter((t) => t.id !== id) })),

  setTouchDir: (dir) => set((st) => ({ touchDir: { ...st.touchDir, ...dir } })),
  setTouchRun: (run) => set({ touchRun: run }),
  pressInteract: () => set({ touchInteract: true }),
  clearInteract: () => set({ touchInteract: false }),
}));
