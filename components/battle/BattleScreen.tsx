"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBattle, BattleUiEvent } from "@/game/state/battleStore";
import { useGame } from "@/game/state/gameStore";
import { useSettings } from "@/game/state/settingsStore";
import { getSpecies } from "@/game/data/creatures";
import { getSkill } from "@/game/data/skills";
import { getItem } from "@/game/data/items";
import { getBoss } from "@/game/data/bosses";
import type { AnimationType } from "@/game/data/types";
import { AudioManager } from "@/game/systems/AudioManager";
import { CreatureSprite } from "@/components/common/CreatureSprite";
import { OrbIcon } from "@/components/common/OrbIcon";
import { Button, HpBar, Panel, StatusBadge, TypeBadge } from "@/components/common/ui";
import { xpForLevel } from "@/game/systems/leveling";

type MenuMode = "main" | "skills" | "items" | "orbs" | "switch";

const ANIM_COLOR: Record<AnimationType, string> = {
  slash: "#f4f4f4",
  burst: "#f4a03a",
  beam: "#3ad6f4",
  wave: "#3a8df4",
  shield: "#8fd6c8",
  sparkle: "#f4e9b0",
  quake: "#b98a52",
  storm: "#8fd6c8",
  drain: "#8a5cc8",
  nova: "#f4633a",
};

interface FloatingNumber {
  id: number;
  amount: number;
  crit: boolean;
  heal: boolean;
  side: "player" | "enemy";
}

let floatId = 0;

export function BattleScreen() {
  const battle = useBattle();
  const save = useGame((s) => s.save);
  const reducedMotion = useSettings((s) => s.reducedMotion);

  // Local display state driven by event playback
  const [log, setLog] = useState<string>("");
  const [playerHp, setPlayerHp] = useState(0);
  const [enemyHp, setEnemyHp] = useState(0);
  const [menu, setMenu] = useState<MenuMode>("main");
  const [floats, setFloats] = useState<FloatingNumber[]>([]);
  const [shake, setShake] = useState<"player" | "enemy" | null>(null);
  const [flash, setFlash] = useState<{ side: "player" | "enemy"; color: string } | null>(null);
  const [orbAnim, setOrbAnim] = useState<{ shakes: number; success: boolean } | null>(null);
  const [enemyVisible, setEnemyVisible] = useState(true);
  const playingRef = useRef(false);

  const { player, enemy, mode, phase } = battle;

  // sync HP displays when battle starts or creatures switch
  useEffect(() => {
    if (player) setPlayerHp(player.inst.currentHp);
  }, [player]);
  useEffect(() => {
    if (enemy) {
      setEnemyHp(enemy.inst.currentHp);
      setEnemyVisible(true);
    }
  }, [enemy]);

  useEffect(() => {
    AudioManager.playMusic(mode === "boss" ? "boss" : "battle");
  }, [mode]);

  const speedMul = reducedMotion ? 0.5 : 1;

  const playEvent = useCallback(
    (ev: BattleUiEvent): number => {
      switch (ev.type) {
        case "text":
          setLog(ev.text);
          return 900 * speedMul;
        case "skill": {
          const skill = getSkill(ev.skillId);
          setFlash({ side: ev.actor === "player" ? "enemy" : "player", color: ANIM_COLOR[skill.animation] });
          setTimeout(() => setFlash(null), 450 * speedMul);
          return 250 * speedMul;
        }
        case "damage": {
          AudioManager.playSfx(ev.crit ? "crit" : "hit");
          setShake(ev.target);
          setTimeout(() => setShake(null), 350);
          setFloats((f) => [...f, { id: ++floatId, amount: ev.amount, crit: ev.crit, heal: false, side: ev.target }]);
          if (ev.target === "player") setPlayerHp((hp) => Math.max(0, hp - ev.amount));
          else setEnemyHp((hp) => Math.max(0, hp - ev.amount));
          if (ev.effectivenessMsg) setLog(ev.effectivenessMsg);
          return 650 * speedMul;
        }
        case "heal":
          AudioManager.playSfx("heal");
          setFloats((f) => [...f, { id: ++floatId, amount: ev.amount, crit: false, heal: true, side: ev.target }]);
          if (ev.target === "player") setPlayerHp((hp) => Math.min(player?.inst.stats.hp ?? hp, hp + ev.amount));
          else setEnemyHp((hp) => Math.min(enemy?.inst.stats.hp ?? hp, hp + ev.amount));
          return 600 * speedMul;
        case "status":
        case "stat":
          return 350 * speedMul;
        case "faint":
          AudioManager.playSfx("faint");
          if (ev.target === "enemy") setEnemyVisible(false);
          return 800 * speedMul;
        case "miss":
          return 300 * speedMul;
        case "capture-anim": {
          AudioManager.playSfx("capture-shake");
          setOrbAnim({ shakes: ev.shakes, success: ev.success });
          const dur = (ev.shakes * 850 + 800) * speedMul;
          setTimeout(() => {
            AudioManager.playSfx(ev.success ? "capture-success" : "capture-fail");
            if (ev.success) setEnemyVisible(false);
            setOrbAnim(null);
          }, dur - 300);
          return dur;
        }
        case "switch-in":
          if (ev.side === "player" && player) setPlayerHp(player.inst.currentHp);
          return 500 * speedMul;
        case "xp":
          setLog(`Gained ${ev.amount} XP!`);
          return 700 * speedMul;
        case "levelup":
          AudioManager.playSfx("levelup");
          return 700 * speedMul;
        default:
          return 300;
      }
    },
    [player, enemy, speedMul]
  );

  // tiny tick state to re-run the playback effect after each event's delay
  const [tick, setTick] = useState(0);

  // Event playback loop
  useEffect(() => {
    if (playingRef.current) return;
    if (battle.queue.length === 0) {
      if (phase === "playing" || phase === "intro") {
        if (phase === "intro") battle.beginChoice();
        else battle.finishPlayback();
        setMenu("main");
      }
      return;
    }
    playingRef.current = true;
    const ev = battle.consumeEvent();
    if (!ev) {
      playingRef.current = false;
      return;
    }
    const wait = playEvent(ev);
    const t = setTimeout(() => {
      playingRef.current = false;
      setTick((n) => n + 1);
    }, wait);
    return () => {
      // StrictMode re-runs effects after cleanup: release the guard so the
      // re-run can keep draining the queue instead of deadlocking.
      clearTimeout(t);
      playingRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [battle.queue.length, phase, tick]);

  if (!player || !enemy || !save) return null;

  const playerSpecies = getSpecies(player.inst.speciesId);
  const enemySpecies = getSpecies(enemy.inst.speciesId);
  const canChoose = phase === "choice";

  const orbs = Object.entries(save.inventory).filter(([id]) => getItem(id).category === "orb");
  const potions = Object.entries(save.inventory).filter(([id]) => {
    const it = getItem(id);
    return it.category === "potion";
  });

  const inLevel = player.inst.xp - xpForLevel(player.inst.level);
  const needed = xpForLevel(player.inst.level + 1) - xpForLevel(player.inst.level);

  const bossTitle = battle.bossId ? `${getBoss(battle.bossId).name}, ${getBoss(battle.bossId).title}` : null;

  return (
    <div className={`relative flex h-dvh w-full flex-col overflow-hidden ${mode === "boss" ? "bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950" : "bg-gradient-to-b from-sky-950 via-slate-900 to-slate-950"}`}>
      {/* Arena — Higgsfield battle backdrop over the gradient fallback */}
      <div className="relative flex-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/backgrounds/battle-forest.png"
          alt=""
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${mode === "boss" ? "opacity-25 saturate-50" : "opacity-45"}`}
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />
        {/* Enemy */}
        <div className="absolute top-6 right-4 flex flex-col items-end gap-2 sm:top-10 sm:right-16">
          <Panel className="w-56 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-slate-100">
                {bossTitle ?? enemySpecies.name}
              </span>
              <span className="shrink-0 text-xs text-slate-400">Lv {enemy.inst.level}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TypeBadge element={enemySpecies.element} small />
              {enemySpecies.secondaryElement && <TypeBadge element={enemySpecies.secondaryElement} small />}
              <StatusBadge status={enemy.inst.status} />
            </div>
            <div className="mt-1.5">
              <HpBar current={enemyHp} max={enemy.inst.stats.hp} />
            </div>
          </Panel>
          <motion.div
            animate={
              shake === "enemy"
                ? { x: [0, -10, 10, -6, 6, 0] }
                : enemyVisible
                  ? { y: [0, -5, 0] }
                  : { opacity: 0, scale: 0.6 }
            }
            transition={shake === "enemy" ? { duration: 0.35 } : enemyVisible ? { duration: 2.4, repeat: Infinity } : { duration: 0.4 }}
            className="relative mr-6"
          >
            <CreatureSprite speciesId={enemy.inst.speciesId} size={mode === "boss" ? 150 : 120} shiny={enemy.inst.isShiny} />
            {flash?.side === "enemy" && (
              <motion.div
                initial={{ opacity: 0.9, scale: 0.4 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: flash.color }}
              />
            )}
            {orbAnim && (
              <motion.div
                className="absolute inset-x-0 -bottom-2 flex justify-center"
                animate={{ rotate: [...Array.from({ length: orbAnim.shakes * 2 + 1 }, (_, i): number => (i % 2 ? 25 : -25)), 0] }}
                transition={{ duration: orbAnim.shakes * 0.85, ease: "easeInOut" }}
              >
                <OrbIcon size={52} />
              </motion.div>
            )}
            {/* floating numbers */}
            <AnimatePresence>
              {floats.filter((f) => f.side === "enemy").map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -44 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  onAnimationComplete={() => setFloats((arr) => arr.filter((x) => x.id !== f.id))}
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 text-xl font-black ${f.heal ? "text-emerald-400" : f.crit ? "text-amber-300" : "text-rose-400"}`}
                >
                  {f.heal ? "+" : "−"}{f.amount}{f.crit ? "!" : ""}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Player */}
        <div className="absolute bottom-2 left-4 flex flex-col items-start gap-2 sm:left-16">
          <motion.div
            animate={shake === "player" ? { x: [0, -10, 10, -6, 6, 0] } : { y: [0, -4, 0] }}
            transition={shake === "player" ? { duration: 0.35 } : { duration: 2.8, repeat: Infinity }}
            className="relative ml-6"
          >
            <CreatureSprite speciesId={player.inst.speciesId} size={130} shiny={player.inst.isShiny} className="-scale-x-100" />
            {flash?.side === "player" && (
              <motion.div
                initial={{ opacity: 0.9, scale: 0.4 }}
                animate={{ opacity: 0, scale: 1.6 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: flash.color }}
              />
            )}
            <AnimatePresence>
              {floats.filter((f) => f.side === "player").map((f) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -44 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                  onAnimationComplete={() => setFloats((arr) => arr.filter((x) => x.id !== f.id))}
                  className={`absolute -top-2 left-1/2 -translate-x-1/2 text-xl font-black ${f.heal ? "text-emerald-400" : f.crit ? "text-amber-300" : "text-rose-400"}`}
                >
                  {f.heal ? "+" : "−"}{f.amount}{f.crit ? "!" : ""}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
          <Panel className="w-60 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-bold text-slate-100">{player.inst.nickname ?? playerSpecies.name}</span>
              <span className="shrink-0 text-xs text-slate-400">Lv {player.inst.level}</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <TypeBadge element={playerSpecies.element} small />
              {playerSpecies.secondaryElement && <TypeBadge element={playerSpecies.secondaryElement} small />}
              <StatusBadge status={player.inst.status} />
            </div>
            <div className="mt-1.5">
              <HpBar current={playerHp} max={player.inst.stats.hp} />
            </div>
            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
              <div className="h-full bg-sky-400" style={{ width: `${Math.min(100, (inLevel / Math.max(1, needed)) * 100)}%` }} />
            </div>
          </Panel>
        </div>

        {/* turn indicator */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-900/70 px-3 py-1 text-[10px] uppercase tracking-widest text-slate-400">
          {mode === "boss" ? "⚔ Guardian Battle" : mode === "trainer" ? "⚔ Tamer Battle" : "Wild Encounter"} · Turn {battle.turn + 1}
        </div>
      </div>

      {/* Log + Actions */}
      <div className="z-10 border-t border-slate-800 bg-slate-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 min-h-10 rounded-xl bg-slate-900 px-4 py-2 text-sm text-slate-200">
            {log || (canChoose ? "What will you do?" : "...")}
          </div>

          {canChoose && menu === "main" && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <Button variant="primary" onClick={() => setMenu("skills")}>⚔ Attack</Button>
              <Button variant="ghost" onClick={() => setMenu("items")}>🧪 Items</Button>
              <Button variant="ghost" disabled={mode !== "wild"} onClick={() => setMenu("orbs")}>🔮 Capture</Button>
              <Button variant="ghost" onClick={() => setMenu("switch")}>🔄 Switch</Button>
              <Button variant="ghost" disabled={mode !== "wild"} onClick={() => battle.act({ type: "escape" })} className="col-span-2 sm:col-span-1">
                🏃 Escape
              </Button>
            </div>
          )}

          {canChoose && menu === "skills" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {player.inst.skills.map((id) => {
                const s = getSkill(id);
                const cd = player.cooldowns[id] ?? 0;
                return (
                  <button
                    key={id}
                    disabled={cd > 0}
                    onClick={() => battle.act({ type: "skill", skillId: id })}
                    className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left hover:border-indigo-500 disabled:opacity-40"
                  >
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{s.name}</div>
                      <div className="text-[10px] text-slate-500">
                        PWR {s.power || "—"} · ACC {s.accuracy} {cd > 0 ? `· CD ${cd}` : ""} · {s.category}
                      </div>
                    </div>
                    <TypeBadge element={s.element} small />
                  </button>
                );
              })}
              <Button variant="ghost" onClick={() => setMenu("main")} className="sm:col-span-2">← Back</Button>
            </div>
          )}

          {canChoose && menu === "items" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {potions.length === 0 && <div className="text-sm text-slate-500">No usable items.</div>}
              {potions.map(([id, qty]) => (
                <button
                  key={id}
                  onClick={() => battle.act({ type: "item", itemId: id })}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left hover:border-emerald-500"
                >
                  <span className="text-sm font-semibold text-slate-100">{getItem(id).name}</span>
                  <span className="text-xs text-slate-400">×{qty}</span>
                </button>
              ))}
              <Button variant="ghost" onClick={() => setMenu("main")} className="sm:col-span-2">← Back</Button>
            </div>
          )}

          {canChoose && menu === "orbs" && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {orbs.length === 0 && <div className="text-sm text-slate-500">No capture orbs! Buy some at a shop.</div>}
              {orbs.map(([id, qty]) => (
                <button
                  key={id}
                  onClick={() => battle.act({ type: "capture", orbId: id })}
                  className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left hover:border-amber-500"
                >
                  <span className="text-sm font-semibold text-slate-100">{getItem(id).name}</span>
                  <span className="text-xs text-slate-400">×{qty}</span>
                </button>
              ))}
              <Button variant="ghost" onClick={() => setMenu("main")} className="sm:col-span-2">← Back</Button>
            </div>
          )}

          {canChoose && menu === "switch" && (
            <SwitchList onPick={(uid) => battle.act({ type: "switch", uid })} onBack={() => setMenu("main")} currentUid={player.inst.uid} />
          )}

          {phase === "switch-prompt" && (
            <div>
              <div className="mb-2 text-sm font-semibold text-rose-300">Your creature fainted! Choose the next fighter:</div>
              <SwitchList onPick={(uid) => battle.switchTo(uid)} currentUid={player.inst.uid} />
            </div>
          )}
        </div>
      </div>

      {/* Outcome overlay */}
      <AnimatePresence>
        {phase === "over" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
          >
            <motion.div initial={{ scale: 0.9, y: 16 }} animate={{ scale: 1, y: 0 }}>
              <Panel className="w-full max-w-sm p-6 text-center">
                <div className="text-3xl">
                  {battle.outcome === "victory" ? "🏆" : battle.outcome === "captured" ? "🔮" : battle.outcome === "fled" ? "💨" : "💤"}
                </div>
                <h3 className="mt-2 text-xl font-black text-amber-300">
                  {battle.outcome === "victory" ? "Victory!" : battle.outcome === "captured" ? "Captured!" : battle.outcome === "fled" ? "Got away safely" : "Defeated..."}
                </h3>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  {battle.rewardSummary.map((r, i) => (
                    <div key={i}>{r}</div>
                  ))}
                </div>
                <Button variant="gold" className="mt-5 w-full" onClick={() => battle.endBattle()}>
                  Continue
                </Button>
              </Panel>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SwitchList({ onPick, onBack, currentUid }: { onPick: (uid: string) => void; onBack?: () => void; currentUid: string }) {
  const save = useGame((s) => s.save);
  if (!save) return null;
  const options = save.party.filter((c) => c.currentHp > 0 && c.uid !== currentUid);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {options.length === 0 && <div className="text-sm text-slate-500">No other healthy creatures.</div>}
      {options.map((c) => (
        <button
          key={c.uid}
          onClick={() => onPick(c.uid)}
          className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-left hover:border-indigo-500"
        >
          <CreatureSprite speciesId={c.speciesId} size={36} shiny={c.isShiny} />
          <div className="flex-1">
            <div className="text-sm font-semibold text-slate-100">
              {c.nickname ?? getSpecies(c.speciesId).name} <span className="text-xs text-slate-400">Lv {c.level}</span>
            </div>
            <HpBar current={c.currentHp} max={c.stats.hp} showText={false} />
          </div>
        </button>
      ))}
      {onBack && <Button variant="ghost" onClick={onBack} className="sm:col-span-2">← Back</Button>}
    </div>
  );
}
