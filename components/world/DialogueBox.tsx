"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/game/state/uiStore";
import { useSettings, TEXT_SPEED_MS } from "@/game/state/settingsStore";
import { NPC_MAP } from "@/game/data/npcs";
import { AudioManager } from "@/game/systems/AudioManager";

export function DialogueBox() {
  const dialogue = useUI((s) => s.dialogue);
  const advance = useUI((s) => s.advanceDialogue);
  const openShop = useUI((s) => s.openShop);
  const textSpeed = useSettings((s) => s.textSpeed);
  const [shown, setShown] = useState(0);

  const line = dialogue ? dialogue.lines[dialogue.index] : "";

  useEffect(() => {
    setShown(0);
    if (!line) return;
    const ms = TEXT_SPEED_MS[textSpeed];
    const timer = setInterval(() => {
      setShown((n) => {
        if (n >= line.length) {
          clearInterval(timer);
          return n;
        }
        return n + 1;
      });
    }, ms);
    return () => clearInterval(timer);
  }, [line, textSpeed]);

  if (!dialogue) return null;

  const isLast = dialogue.index === dialogue.lines.length - 1;

  const handleNext = () => {
    AudioManager.playSfx("click");
    if (shown < line.length) {
      setShown(line.length);
      return;
    }
    if (isLast && dialogue.npcId) {
      const npc = NPC_MAP[dialogue.npcId];
      if (npc?.shopId) {
        advance(); // closes
        openShop(npc.shopId);
        return;
      }
    }
    advance();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="dialogue"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        className="pointer-events-auto absolute inset-x-2 bottom-2 z-40 sm:inset-x-8 sm:bottom-6"
        onClick={handleNext}
      >
        <div className="mx-auto max-w-3xl cursor-pointer rounded-2xl border-2 border-indigo-400/40 bg-slate-950/95 p-4 shadow-2xl">
          <div className="mb-1 text-sm font-bold text-amber-300">{dialogue.speaker}</div>
          <div className="min-h-12 text-base leading-relaxed text-slate-100">
            {line.slice(0, shown)}
            {shown >= line.length && (
              <span className="ml-2 inline-block animate-bounce text-indigo-300">▾</span>
            )}
          </div>
          <div className="text-right text-[10px] uppercase tracking-wider text-slate-500">
            {dialogue.index + 1}/{dialogue.lines.length} — tap or press Space
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
