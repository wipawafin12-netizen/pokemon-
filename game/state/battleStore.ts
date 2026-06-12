"use client";

import { create } from "zustand";
import type { CreatureInstance } from "../data/types";
import { getSpecies } from "../data/creatures";
import { getItem } from "../data/items";
import { getTrainer } from "../data/trainers";
import { getBoss } from "../data/bosses";
import {
  BattleCreature,
  BattleEvent,
  bossStrikesTwice,
  chooseEnemySkill,
  endOfTurnStatus,
  escapeChance,
  executeSkill,
  makeBattleCreature,
  playerActsFirst,
  runBossHooks,
  statusGate,
  tickCooldowns,
} from "../systems/battle";
import { attemptCapture } from "../systems/capture";
import { createInstance, xpReward } from "../systems/leveling";
import { useGame } from "./gameStore";
import { useUI } from "./uiStore";
import { getSkill } from "../data/skills";

export type BattleMode = "wild" | "trainer" | "boss";

export type BattleUiEvent =
  | BattleEvent
  | { type: "capture-anim"; shakes: number; success: boolean }
  | { type: "switch-in"; side: "player" | "enemy" }
  | { type: "xp"; amount: number }
  | { type: "levelup"; level: number };

export type BattlePhase = "intro" | "choice" | "playing" | "switch-prompt" | "over";
export type BattleOutcome = "victory" | "defeat" | "captured" | "fled" | null;

export type PlayerAction =
  | { type: "skill"; skillId: string }
  | { type: "item"; itemId: string; targetUid?: string }
  | { type: "capture"; orbId: string }
  | { type: "escape" }
  | { type: "switch"; uid: string };

interface BattleState {
  mode: BattleMode | null;
  phase: BattlePhase;
  outcome: BattleOutcome;
  player: BattleCreature | null;
  enemy: BattleCreature | null;
  enemyQueue: CreatureInstance[];
  trainerId: string | null;
  bossId: string | null;
  queue: BattleUiEvent[];
  turn: number;
  rewardSummary: string[];

  startWild: (speciesId: string, level: number) => void;
  startTrainer: (trainerId: string) => void;
  startBoss: (bossId: string) => void;
  beginChoice: () => void;
  act: (action: PlayerAction) => void;
  switchTo: (uid: string) => void;
  consumeEvent: () => BattleUiEvent | undefined;
  finishPlayback: () => void;
  endBattle: () => void;
}

function activePlayerCreature(): CreatureInstance | null {
  const g = useGame.getState();
  if (!g.save) return null;
  return g.save.party.find((c) => c.uid === g.activeUid && c.currentHp > 0)
    ?? g.save.party.find((c) => c.currentHp > 0)
    ?? null;
}

export const useBattle = create<BattleState>((set, get) => ({
  mode: null,
  phase: "intro",
  outcome: null,
  player: null,
  enemy: null,
  enemyQueue: [],
  trainerId: null,
  bossId: null,
  queue: [],
  turn: 0,
  rewardSummary: [],

  // ------------------------------------------------ starters

  startWild: (speciesId, level) => {
    const mine = activePlayerCreature();
    if (!mine) return;
    useGame.setState({ activeUid: mine.uid });
    const wild = createInstance(speciesId, level);
    useGame.getState().markSeen(speciesId);
    set({
      mode: "wild",
      phase: "intro",
      outcome: null,
      player: makeBattleCreature(mine),
      enemy: makeBattleCreature(wild),
      enemyQueue: [],
      trainerId: null,
      bossId: null,
      queue: [{ type: "text", text: `A wild ${getSpecies(speciesId).name} appeared!` }],
      turn: 0,
      rewardSummary: [],
    });
    useUI.getState().setScreen("battle");
  },

  startTrainer: (trainerId) => {
    const mine = activePlayerCreature();
    if (!mine) return;
    useGame.setState({ activeUid: mine.uid });
    const trainer = getTrainer(trainerId);
    const team = trainer.team.map((m) => createInstance(m.speciesId, m.level));
    const [first, ...rest] = team;
    useGame.getState().markSeen(first.speciesId);
    set({
      mode: "trainer",
      phase: "intro",
      outcome: null,
      player: makeBattleCreature(mine),
      enemy: makeBattleCreature(first),
      enemyQueue: rest,
      trainerId,
      bossId: null,
      queue: [
        { type: "text", text: `${trainer.title} ${trainer.name} challenges you!` },
        { type: "text", text: `"${trainer.introLine}"` },
        { type: "text", text: `${trainer.name} sent out ${getSpecies(first.speciesId).name}!` },
      ],
      turn: 0,
      rewardSummary: [],
    });
    useUI.getState().setScreen("battle");
  },

  startBoss: (bossId) => {
    const mine = activePlayerCreature();
    if (!mine) return;
    useGame.setState({ activeUid: mine.uid });
    const boss = getBoss(bossId);
    const inst = createInstance(boss.speciesId, boss.level);
    // Guardians are tougher than wild kin.
    inst.stats = { ...inst.stats, hp: Math.floor(inst.stats.hp * 1.5) };
    inst.currentHp = inst.stats.hp;
    useGame.getState().markSeen(boss.speciesId);
    set({
      mode: "boss",
      phase: "intro",
      outcome: null,
      player: makeBattleCreature(mine),
      enemy: makeBattleCreature(inst, boss.mechanics.map((m) => m.hook)),
      enemyQueue: [],
      trainerId: null,
      bossId,
      queue: [
        { type: "text", text: `${boss.name}, ${boss.title}, awakens!` },
        ...boss.mechanics.map((m) => ({ type: "text" as const, text: `⚠ ${m.name}: ${m.description}` })),
      ],
      turn: 0,
      rewardSummary: [],
    });
    useUI.getState().setScreen("battle");
  },

  beginChoice: () => set({ phase: "choice" }),

  // ------------------------------------------------ the turn

  act: (action) => {
    const st = get();
    const { player, enemy, mode } = st;
    if (!player || !enemy || st.phase !== "choice") return;
    const game = useGame.getState();
    const events: BattleUiEvent[] = [];
    let battleEnded = false;

    const enemyTakesTurn = (): void => {
      if (battleEnded || enemy.inst.currentHp <= 0 || player.inst.currentHp <= 0) return;
      if (mode === "boss") events.push(...runBossHooks(enemy, player, "enemy"));
      if (player.inst.currentHp <= 0 || enemy.inst.currentHp <= 0) return;
      const gate = statusGate(enemy, "enemy");
      events.push(...gate.events);
      if (!gate.canAct) return;
      const strikes = mode === "boss" && bossStrikesTwice(enemy) ? 2 : 1;
      for (let i = 0; i < strikes; i++) {
        if (player.inst.currentHp <= 0) break;
        const skillId = chooseEnemySkill(enemy, player, mode !== "wild");
        const out = executeSkill(enemy, player, skillId, "enemy");
        events.push(...out.events);
      }
    };

    const playerUsesSkill = (skillId: string): void => {
      const gate = statusGate(player, "player");
      events.push(...gate.events);
      if (!gate.canAct) return;
      const out = executeSkill(player, enemy, skillId, "player");
      events.push(...out.events);
      if (out.targetFainted) handleEnemyFaint();
    };

    const handleEnemyFaint = (): void => {
      // XP
      const xp = xpReward(enemy.inst.speciesId, enemy.inst.level, mode !== "wild");
      events.push({ type: "xp", amount: xp });
      const beforeLevel = player.inst.level;
      const newSkills = game.grantXpToParty(player.inst.uid, xp);
      if (player.inst.level > beforeLevel) {
        events.push({ type: "levelup", level: player.inst.level });
        events.push({ type: "text", text: `${getSpecies(player.inst.speciesId).name} grew to level ${player.inst.level}!` });
        for (const s of newSkills) events.push({ type: "text", text: `Learned ${getSkill(s).name}!` });
      }
      // Next enemy?
      const [next, ...rest] = get().enemyQueue;
      if (next && st.trainerId) {
        useGame.getState().markSeen(next.speciesId);
        events.push({ type: "text", text: `${getTrainer(st.trainerId).name} sent out ${getSpecies(next.speciesId).name}!` });
        events.push({ type: "switch-in", side: "enemy" });
        set({ enemy: makeBattleCreature(next), enemyQueue: rest });
      } else {
        battleEnded = true;
        finishVictory(events);
      }
    };

    const finishVictory = (evts: BattleUiEvent[]): void => {
      const summary: string[] = [];
      const g = useGame.getState();
      if (mode === "trainer" && st.trainerId) {
        const t = getTrainer(st.trainerId);
        evts.push({ type: "text", text: `"${t.defeatLine}"` });
        g.addGold(t.rewardGold);
        summary.push(`+${t.rewardGold} gold`);
        for (const r of t.rewardItems ?? []) {
          g.addItem(r.itemId, r.qty);
          summary.push(`${getItem(r.itemId).name} ×${r.qty}`);
        }
        g.defeatTrainer(st.trainerId);
      } else if (mode === "boss" && st.bossId) {
        const b = getBoss(st.bossId);
        evts.push({ type: "text", text: `${b.name} acknowledges your strength. The way forward opens.` });
        g.addGold(b.rewardGold);
        g.addCrystals(b.rewardCrystals);
        summary.push(`+${b.rewardGold} gold`, `+${b.rewardCrystals} crystal shards`);
        for (const r of b.rewardItems) {
          g.addItem(r.itemId, r.qty);
          summary.push(`${getItem(r.itemId).name} ×${r.qty}`);
        }
        g.defeatBoss(st.bossId);
        // The two legendaries acknowledge their conqueror and join the team —
        // without this, the 50-creature collection could never be completed.
        if (st.bossId === "boss-sky" || st.bossId === "boss-final") {
          const legend = createInstance(b.speciesId, b.level);
          legend.friendship = 120;
          g.addCreature(legend);
          const name = getSpecies(b.speciesId).name;
          evts.push({ type: "text", text: `${name} bows its head... and joins your team!` });
          summary.push(`✨ ${name} joined your team!`);
        }
      } else {
        g.recordQuestEvent({ kind: "win_battle" });
        const gold = 20 + enemy.inst.level * 4;
        g.addGold(gold);
        summary.push(`+${gold} gold`);
      }
      // friendship for the fighter
      player.inst.friendship = Math.min(255, player.inst.friendship + 3);
      set({ outcome: "victory", rewardSummary: summary });
    };

    // ----- resolve the chosen action -----
    switch (action.type) {
      case "skill": {
        const first = playerActsFirst(player, enemy);
        tickCooldowns(player);
        tickCooldowns(enemy);
        if (first) {
          playerUsesSkill(action.skillId);
          enemyTakesTurn();
        } else {
          enemyTakesTurn();
          if (player.inst.currentHp > 0 && enemy.inst.currentHp > 0) playerUsesSkill(action.skillId);
          else if (enemy.inst.currentHp > 0 && player.inst.currentHp <= 0) {
            /* player fainted before acting */
          }
        }
        break;
      }
      case "item": {
        const msg = game.useItemOnCreature(action.itemId, action.targetUid ?? player.inst.uid);
        if (msg) events.push({ type: "text", text: msg });
        tickCooldowns(player);
        tickCooldowns(enemy);
        enemyTakesTurn();
        break;
      }
      case "capture": {
        if (mode !== "wild") {
          events.push({ type: "text", text: "You can't capture another tamer's creature!" });
          break;
        }
        if (!game.removeItem(action.orbId, 1)) {
          events.push({ type: "text", text: "No orbs of that kind left!" });
          break;
        }
        const result = attemptCapture(enemy.inst, action.orbId);
        events.push({ type: "text", text: `You hurl a ${getItem(action.orbId).name}!` });
        events.push({ type: "capture-anim", shakes: result.shakes, success: result.success });
        if (result.success) {
          events.push({ type: "text", text: `Gotcha! ${getSpecies(enemy.inst.speciesId).name} was captured!` });
          enemy.inst.status = null;
          game.addCreature(enemy.inst);
          battleEnded = true;
          set({ outcome: "captured", rewardSummary: [`${getSpecies(enemy.inst.speciesId).name} joined your team!`] });
        } else {
          events.push({ type: "text", text: `Oh no! It broke free!` });
          tickCooldowns(player);
          tickCooldowns(enemy);
          enemyTakesTurn();
        }
        break;
      }
      case "escape": {
        if (mode !== "wild") {
          events.push({ type: "text", text: "There's no running from this battle!" });
          break;
        }
        if (Math.random() < escapeChance(player, enemy)) {
          events.push({ type: "text", text: "You slipped away safely!" });
          battleEnded = true;
          set({ outcome: "fled" });
        } else {
          events.push({ type: "text", text: "Couldn't escape!" });
          tickCooldowns(player);
          tickCooldowns(enemy);
          enemyTakesTurn();
        }
        break;
      }
      case "switch": {
        const save = game.save;
        const next = save?.party.find((c) => c.uid === action.uid && c.currentHp > 0);
        if (!next) break;
        useGame.setState({ activeUid: next.uid });
        events.push({ type: "text", text: `Go, ${next.nickname ?? getSpecies(next.speciesId).name}!` });
        events.push({ type: "switch-in", side: "player" });
        set({ player: makeBattleCreature(next) });
        const newPlayer = get().player!;
        // Enemy gets a free hit on the switch-in
        if (enemy.inst.currentHp > 0) {
          if (mode === "boss") events.push(...runBossHooks(enemy, newPlayer, "enemy"));
          const gate = statusGate(enemy, "enemy");
          events.push(...gate.events);
          if (gate.canAct) {
            const skillId = chooseEnemySkill(enemy, newPlayer, mode !== "wild");
            events.push(...executeSkill(enemy, newPlayer, skillId, "enemy").events);
          }
        }
        break;
      }
    }

    // ----- end of turn upkeep (burn / poison) -----
    const current = get();
    const curPlayer = current.player!;
    if (!battleEnded && curPlayer.inst.currentHp > 0) {
      events.push(...endOfTurnStatus(curPlayer, "player"));
    }
    if (!battleEnded && enemy.inst.currentHp > 0) {
      const before = enemy.inst.currentHp;
      events.push(...endOfTurnStatus(enemy, "enemy"));
      if (before > 0 && enemy.inst.currentHp <= 0) handleEnemyFaint();
    }

    set({ phase: "playing", queue: [...get().queue, ...events], turn: get().turn + 1 });
  },

  switchTo: (uid) => {
    // Used from the switch-prompt after a faint (no enemy free hit — it already acted).
    const game = useGame.getState();
    const next = game.save?.party.find((c) => c.uid === uid && c.currentHp > 0);
    if (!next) return;
    useGame.setState({ activeUid: next.uid });
    set({
      player: makeBattleCreature(next),
      phase: "playing",
      queue: [
        { type: "text", text: `Go, ${next.nickname ?? getSpecies(next.speciesId).name}!` },
        { type: "switch-in", side: "player" },
      ],
    });
  },

  consumeEvent: () => {
    const [first, ...rest] = get().queue;
    if (first) set({ queue: rest });
    return first;
  },

  finishPlayback: () => {
    const st = get();
    if (st.outcome) {
      set({ phase: "over" });
      return;
    }
    const player = st.player;
    if (player && player.inst.currentHp <= 0) {
      const game = useGame.getState();
      const hasHealthy = game.save?.party.some((c) => c.currentHp > 0);
      if (hasHealthy) {
        set({ phase: "switch-prompt" });
      } else {
        // Blackout: lose 10% gold, return home healed
        const lost = Math.floor((game.save?.gold ?? 0) * 0.1);
        game.addGold(-lost);
        game.healParty();
        game.travelTo("origin-village", 12, 8);
        set({
          outcome: "defeat",
          phase: "over",
          rewardSummary: lost > 0 ? [`Lost ${lost} gold...`, "You wake up back home."] : ["You wake up back home."],
        });
      }
      return;
    }
    set({ phase: "choice" });
  },

  endBattle: () => {
    const game = useGame.getState();
    game.checkEvolutions();
    game.saveGame();
    set({
      mode: null, phase: "intro", outcome: null, player: null, enemy: null,
      enemyQueue: [], trainerId: null, bossId: null, queue: [], turn: 0, rewardSummary: [],
    });
    useUI.getState().setScreen("world");
  },
}));
