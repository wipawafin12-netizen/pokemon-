"use client";

import { create } from "zustand";
import type { CreatureInstance, PlayerSave, QuestProgress } from "../data/types";
import { getSpecies } from "../data/creatures";
import { getItem } from "../data/items";
import { getQuest, QUESTS } from "../data/quests";
import { getMap } from "../data/maps";
import { SaveManager } from "../systems/SaveManager";
import { createInstance, grantXp, MAX_PARTY } from "../systems/leveling";
import { applyEvolution, eligibleEvolution } from "../systems/evolution";
import { useUI } from "./uiStore";
import { AudioManager } from "../systems/AudioManager";

export type QuestEvent =
  | { kind: "capture"; speciesId: string }
  | { kind: "win_battle" }
  | { kind: "defeat_trainer"; trainerId: string }
  | { kind: "defeat_boss"; bossId: string }
  | { kind: "reach"; mapId: string }
  | { kind: "talk"; npcId: string }
  | { kind: "collect"; itemId: string };

function dayStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function freshQuestProgress(questId: string): QuestProgress {
  const q = getQuest(questId);
  return { questId, progress: q.objectives.map(() => 0), completed: false, claimed: false, dayStamp: dayStamp() };
}

interface GameState {
  /** null until a save is loaded / created */
  save: PlayerSave | null;
  /** uid of the creature leading the party in battle */
  activeUid: string | null;
  pendingEvolutions: { uid: string; toSpeciesId: string }[];

  // lifecycle
  newGame: (slot: number, playerName: string, starterId: string) => void;
  loadGame: (slot: number) => boolean;
  saveGame: () => void;
  quitToMenu: () => void;
  tickPlaytime: (sec: number) => void;

  // world
  setPosition: (mapId: string, x: number, y: number, facing: PlayerSave["facing"]) => void;
  travelTo: (mapId: string, x: number, y: number) => void;
  setFlag: (flag: string) => void;
  hasFlag: (flag: string) => boolean;

  // economy & inventory
  addGold: (n: number) => void;
  addCrystals: (n: number) => void;
  addItem: (itemId: string, qty: number) => void;
  removeItem: (itemId: string, qty: number) => boolean;
  itemCount: (itemId: string) => number;
  buyItem: (itemId: string, currency: "gold" | "crystals") => boolean;

  // creatures
  addCreature: (inst: CreatureInstance) => void;
  healParty: () => void;
  markSeen: (speciesId: string) => void;
  markCaught: (speciesId: string) => void;
  setParty: (party: CreatureInstance[]) => void;
  grantXpToParty: (uid: string, amount: number) => string[];
  useItemOnCreature: (itemId: string, uid: string) => string | null;
  checkEvolutions: () => void;
  confirmEvolution: () => void;
  skipEvolution: () => void;

  // quests
  acceptQuest: (questId: string) => void;
  recordQuestEvent: (ev: QuestEvent) => void;
  claimQuest: (questId: string) => void;
  questState: (questId: string) => QuestProgress | undefined;

  // battle integration
  defeatTrainer: (trainerId: string) => void;
  defeatBoss: (bossId: string) => void;
}

export const useGame = create<GameState>((set, get) => ({
  save: null,
  activeUid: null,
  pendingEvolutions: [],

  // ------------------------------------------------ lifecycle

  newGame: (slot, playerName, starterId) => {
    const starter = createInstance(starterId, 5);
    starter.friendship = 100;
    const save: PlayerSave = {
      version: 1,
      slot,
      playerName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      playTimeSec: 0,
      gold: 500,
      crystals: 0,
      mapId: "origin-village",
      pos: { x: 12, y: 8 },
      facing: "down",
      // (flags set below)
      party: [starter],
      storage: [],
      inventory: { "basic-orb": 5, "small-potion": 3 },
      quests: QUESTS.filter((q) => q.type === "daily").map((q) => freshQuestProgress(q.id)),
      dexSeen: [starterId],
      dexCaught: [starterId],
      flags: { "visited-origin-village": true },
      badges: [],
      defeatedTrainers: [],
    };
    set({ save, activeUid: starter.uid, pendingEvolutions: [] });
    SaveManager.save(save);
  },

  loadGame: (slot) => {
    const save = SaveManager.load(slot);
    if (!save) return false;
    // Reset daily quests on a new day
    const today = dayStamp();
    for (const qp of save.quests) {
      const q = getQuest(qp.questId);
      if (q.type === "daily" && qp.dayStamp !== today) {
        Object.assign(qp, freshQuestProgress(qp.questId));
      }
    }
    for (const q of QUESTS.filter((q) => q.type === "daily")) {
      if (!save.quests.find((p) => p.questId === q.id)) save.quests.push(freshQuestProgress(q.id));
    }
    set({ save, activeUid: save.party[0]?.uid ?? null, pendingEvolutions: [] });
    return true;
  },

  saveGame: () => {
    const save = get().save;
    if (save) {
      SaveManager.save(save);
      useUI.getState().toast("Game saved", "success");
    }
  },

  quitToMenu: () => {
    const save = get().save;
    if (save) SaveManager.save(save);
    set({ save: null, activeUid: null, pendingEvolutions: [] });
  },

  tickPlaytime: (sec) => {
    const save = get().save;
    if (!save) return;
    save.playTimeSec += sec;
    set({ save: { ...save } });
  },

  // ------------------------------------------------ world

  setPosition: (mapId, x, y, facing) => {
    const save = get().save;
    if (!save) return;
    save.mapId = mapId;
    save.pos = { x, y };
    save.facing = facing;
    // Intentionally no set() — position updates are high-frequency and
    // read imperatively by the Phaser scene; React doesn't render them.
  },

  travelTo: (mapId, x, y) => {
    const save = get().save;
    if (!save) return;
    getMap(mapId); // throws on bad id
    save.mapId = mapId;
    save.pos = { x, y };
    save.flags[`visited-${mapId}`] = true;
    set({ save: { ...save } });
    get().recordQuestEvent({ kind: "reach", mapId });
  },

  setFlag: (flag) => {
    const save = get().save;
    if (!save) return;
    save.flags[flag] = true;
    set({ save: { ...save } });
  },

  hasFlag: (flag) => !!get().save?.flags[flag],

  // ------------------------------------------------ economy & inventory

  addGold: (n) => {
    const save = get().save;
    if (!save) return;
    save.gold = Math.max(0, save.gold + n);
    set({ save: { ...save } });
  },

  addCrystals: (n) => {
    const save = get().save;
    if (!save) return;
    save.crystals = Math.max(0, save.crystals + n);
    set({ save: { ...save } });
  },

  addItem: (itemId, qty) => {
    const save = get().save;
    if (!save) return;
    save.inventory[itemId] = (save.inventory[itemId] ?? 0) + qty;
    set({ save: { ...save } });
    get().recordQuestEvent({ kind: "collect", itemId });
  },

  removeItem: (itemId, qty) => {
    const save = get().save;
    if (!save) return false;
    const have = save.inventory[itemId] ?? 0;
    if (have < qty) return false;
    if (have - qty <= 0) delete save.inventory[itemId];
    else save.inventory[itemId] = have - qty;
    set({ save: { ...save } });
    return true;
  },

  itemCount: (itemId) => get().save?.inventory[itemId] ?? 0,

  buyItem: (itemId, currency) => {
    const save = get().save;
    if (!save) return false;
    const item = getItem(itemId);
    if (currency === "gold") {
      if (item.price <= 0 || save.gold < item.price) return false;
      save.gold -= item.price;
    } else {
      const cost = item.crystalPrice ?? -1;
      if (cost <= 0 || save.crystals < cost) return false;
      save.crystals -= cost;
    }
    save.inventory[itemId] = (save.inventory[itemId] ?? 0) + 1;
    set({ save: { ...save } });
    AudioManager.playSfx("item");
    return true;
  },

  // ------------------------------------------------ creatures

  addCreature: (inst) => {
    const save = get().save;
    if (!save) return;
    if (save.party.length < MAX_PARTY) save.party.push(inst);
    else {
      save.storage.push(inst);
      useUI.getState().toast(`${getSpecies(inst.speciesId).name} was sent to storage`, "info");
    }
    get().markSeen(inst.speciesId);
    get().markCaught(inst.speciesId);
    set({ save: { ...save } });
  },

  healParty: () => {
    const save = get().save;
    if (!save) return;
    for (const c of save.party) {
      c.currentHp = c.stats.hp;
      c.status = null;
    }
    set({ save: { ...save } });
  },

  markSeen: (speciesId) => {
    const save = get().save;
    if (!save) return;
    if (!save.dexSeen.includes(speciesId)) {
      save.dexSeen.push(speciesId);
      set({ save: { ...save } });
    }
  },

  markCaught: (speciesId) => {
    const save = get().save;
    if (!save) return;
    if (!save.dexCaught.includes(speciesId)) {
      save.dexCaught.push(speciesId);
      set({ save: { ...save } });
    }
    get().recordQuestEvent({ kind: "capture", speciesId });
  },

  setParty: (party) => {
    const save = get().save;
    if (!save || party.length === 0) return;
    save.party = party;
    set({ save: { ...save } });
  },

  grantXpToParty: (uid, amount) => {
    const save = get().save;
    if (!save) return [];
    const inst = save.party.find((c) => c.uid === uid);
    if (!inst) return [];
    const res = grantXp(inst, amount);
    set({ save: { ...save } });
    return res.newSkills;
  },

  useItemOnCreature: (itemId, uid) => {
    const save = get().save;
    if (!save) return null;
    const item = getItem(itemId);
    const inst = save.party.find((c) => c.uid === uid) ?? save.storage.find((c) => c.uid === uid);
    if (!inst) return null;

    // Evolution items
    if (item.category === "evolution") {
      const branch = eligibleEvolution(inst, { usedItemId: itemId, completedQuests: completedQuestSet(save) });
      if (!branch) return "It would have no effect.";
      if (!get().removeItem(itemId, 1)) return null;
      const oldName = getSpecies(inst.speciesId).name;
      applyEvolution(inst, branch);
      get().markSeen(inst.speciesId);
      get().markCaught(inst.speciesId);
      set({ save: { ...save } });
      AudioManager.playSfx("evolve");
      return `${oldName} evolved into ${getSpecies(inst.speciesId).name}!`;
    }

    // Potions
    if (item.category === "potion") {
      if (item.revivePercent) {
        if (inst.currentHp > 0) return "It's not fainted.";
        if (!get().removeItem(itemId, 1)) return null;
        inst.currentHp = Math.max(1, Math.floor((inst.stats.hp * item.revivePercent) / 100));
        set({ save: { ...save } });
        AudioManager.playSfx("heal");
        return `${getSpecies(inst.speciesId).name} was revived!`;
      }
      if (item.cures) {
        if (!inst.status || (item.cures !== "all" && inst.status !== item.cures)) return "It would have no effect.";
        if (!get().removeItem(itemId, 1)) return null;
        inst.status = null;
        set({ save: { ...save } });
        AudioManager.playSfx("heal");
        return `${getSpecies(inst.speciesId).name} was cured!`;
      }
      if (item.healAmount) {
        if (inst.currentHp <= 0) return "It's fainted — use a Revive Ember.";
        if (inst.currentHp >= inst.stats.hp) return "HP is already full.";
        if (!get().removeItem(itemId, 1)) return null;
        const amount = item.healAmount === -1 ? inst.stats.hp : item.healAmount;
        inst.currentHp = Math.min(inst.stats.hp, inst.currentHp + amount);
        set({ save: { ...save } });
        AudioManager.playSfx("heal");
        return `${getSpecies(inst.speciesId).name} recovered HP!`;
      }
    }
    return "It can't be used here.";
  },

  checkEvolutions: () => {
    const save = get().save;
    if (!save) return;
    const completed = completedQuestSet(save);
    const pending: { uid: string; toSpeciesId: string }[] = [];
    for (const inst of save.party) {
      const branch = eligibleEvolution(inst, { completedQuests: completed });
      if (branch) pending.push({ uid: inst.uid, toSpeciesId: branch.toSpeciesId });
    }
    if (pending.length) set({ pendingEvolutions: pending });
  },

  confirmEvolution: () => {
    const save = get().save;
    const [next, ...rest] = get().pendingEvolutions;
    if (!save || !next) return;
    const inst = save.party.find((c) => c.uid === next.uid);
    if (inst) {
      const completed = completedQuestSet(save);
      const branch = eligibleEvolution(inst, { completedQuests: completed });
      if (branch) {
        const oldName = getSpecies(inst.speciesId).name;
        applyEvolution(inst, branch);
        get().markSeen(inst.speciesId);
        get().markCaught(inst.speciesId);
        AudioManager.playSfx("evolve");
        useUI.getState().toast(`${oldName} evolved into ${getSpecies(inst.speciesId).name}!`, "success");
      }
    }
    set({ save: { ...save }, pendingEvolutions: rest });
  },

  skipEvolution: () => {
    const [, ...rest] = get().pendingEvolutions;
    set({ pendingEvolutions: rest });
  },

  // ------------------------------------------------ quests

  acceptQuest: (questId) => {
    const save = get().save;
    if (!save) return;
    if (save.quests.find((q) => q.questId === questId)) return;
    const q = getQuest(questId);
    if (q.requires) {
      const prereq = save.quests.find((p) => p.questId === q.requires);
      if (!prereq?.completed) return;
    }
    save.quests.push(freshQuestProgress(questId));
    set({ save: { ...save } });
    AudioManager.playSfx("quest");
    useUI.getState().toast(`Quest started: ${q.name}`, "info");
    // Retroactively credit "reach" objectives for the current map
    get().recordQuestEvent({ kind: "reach", mapId: save.mapId });
  },

  recordQuestEvent: (ev) => {
    const save = get().save;
    if (!save) return;
    let changed = false;
    for (const qp of save.quests) {
      if (qp.completed) continue;
      const quest = getQuest(qp.questId);
      quest.objectives.forEach((obj, i) => {
        const target =
          obj.kind === "capture" || obj.kind === "collect" || obj.kind === "win_battles" ? obj.count : 1;
        if (qp.progress[i] >= target) return;
        let hit = false;
        switch (obj.kind) {
          case "capture":
            if (ev.kind === "capture") {
              const species = getSpecies(ev.speciesId);
              hit = !obj.element || species.element === obj.element || species.secondaryElement === obj.element;
            }
            break;
          case "win_battles":
            hit = ev.kind === "win_battle";
            break;
          case "defeat_trainer":
            hit = ev.kind === "defeat_trainer" && ev.trainerId === obj.trainerId;
            break;
          case "defeat_boss":
            hit = ev.kind === "defeat_boss" && ev.bossId === obj.bossId;
            break;
          case "reach":
            hit = ev.kind === "reach" && ev.mapId === obj.mapId;
            break;
          case "talk":
            hit = ev.kind === "talk" && ev.npcId === obj.npcId;
            break;
          case "collect":
            hit = ev.kind === "collect" && ev.itemId === obj.itemId;
            break;
        }
        if (hit) {
          qp.progress[i] = Math.min(target, qp.progress[i] + 1);
          changed = true;
        }
      });
      const done = quest.objectives.every((obj, i) => {
        const target =
          obj.kind === "capture" || obj.kind === "collect" || obj.kind === "win_battles" ? obj.count : 1;
        return qp.progress[i] >= target;
      });
      if (done && !qp.completed) {
        qp.completed = true;
        qp.dayStamp = dayStamp();
        changed = true;
        useUI.getState().toast(`Quest complete: ${quest.name} — claim your reward!`, "success");
        AudioManager.playSfx("quest");
      }
    }
    if (changed) set({ save: { ...save } });
  },

  claimQuest: (questId) => {
    const save = get().save;
    if (!save) return;
    const qp = save.quests.find((q) => q.questId === questId);
    if (!qp || !qp.completed || qp.claimed) return;
    const quest = getQuest(questId);
    qp.claimed = true;
    save.gold += quest.rewardGold;
    save.crystals += quest.rewardCrystals ?? 0;
    for (const r of quest.rewardItems ?? []) {
      save.inventory[r.itemId] = (save.inventory[r.itemId] ?? 0) + r.qty;
    }
    if (quest.rewardXp && save.party[0]) grantXp(save.party[0], quest.rewardXp);
    set({ save: { ...save } });
    AudioManager.playSfx("confirm");
    useUI.getState().toast(`Reward claimed: ${quest.rewardGold} gold`, "success");
    get().checkEvolutions();
  },

  questState: (questId) => get().save?.quests.find((q) => q.questId === questId),

  // ------------------------------------------------ battle integration

  defeatTrainer: (trainerId) => {
    const save = get().save;
    if (!save) return;
    if (!save.defeatedTrainers.includes(trainerId)) save.defeatedTrainers.push(trainerId);
    set({ save: { ...save } });
    get().recordQuestEvent({ kind: "defeat_trainer", trainerId });
    get().recordQuestEvent({ kind: "win_battle" });
  },

  defeatBoss: (bossId) => {
    const save = get().save;
    if (!save) return;
    save.flags[bossId] = true;
    if (!save.badges.includes(bossId)) save.badges.push(bossId);
    set({ save: { ...save } });
    get().recordQuestEvent({ kind: "defeat_boss", bossId });
    get().recordQuestEvent({ kind: "win_battle" });
  },
}));

function completedQuestSet(save: PlayerSave): Set<string> {
  return new Set(save.quests.filter((q) => q.completed).map((q) => q.questId));
}
