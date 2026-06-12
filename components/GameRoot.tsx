"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/game/state/uiStore";
import { useGame } from "@/game/state/gameStore";
import { useSettings } from "@/game/state/settingsStore";
import { getSpecies } from "@/game/data/creatures";
import { AudioManager } from "@/game/systems/AudioManager";
import { MainMenu } from "./screens/MainMenu";
import { SaveSelect } from "./screens/SaveSelect";
import { StarterSelect } from "./screens/StarterSelect";
import { SettingsScreen } from "./screens/SettingsScreen";
import { Collection } from "./screens/Collection";
import { Inventory } from "./screens/Inventory";
import { QuestLog } from "./screens/QuestLog";
import { PartyScreen } from "./screens/PartyScreen";
import { WorldMapScreen } from "./screens/WorldMapScreen";
import { WorldView } from "./world/WorldView";
import { BattleScreen } from "./battle/BattleScreen";
import { ARCaptureScreen } from "./ar/ARCaptureScreen";
import { CreatureSprite } from "./common/CreatureSprite";
import { Button, Panel } from "./common/ui";

export default function GameRoot() {
  const screen = useUI((s) => s.screen);
  const toasts = useUI((s) => s.toasts);
  const hydrate = useSettings((s) => s.hydrate);
  const darkMode = useSettings((s) => s.darkMode);
  const pendingEvolutions = useGame((s) => s.pendingEvolutions);
  const confirmEvolution = useGame((s) => s.confirmEvolution);
  const skipEvolution = useGame((s) => s.skipEvolution);
  const save = useGame((s) => s.save);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // first user gesture unlocks audio
  useEffect(() => {
    const unlock = () => AudioManager.init();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const pendingEvo = pendingEvolutions[0];
  const evoCreature = pendingEvo && save ? save.party.find((c) => c.uid === pendingEvo.uid) : null;

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="relative h-dvh w-full overflow-hidden bg-slate-950 font-sans text-slate-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen === "world" ? "world" : screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full w-full"
          >
            {screen === "menu" && <MainMenu />}
            {screen === "save-select" && <SaveSelect />}
            {screen === "starter" && <StarterSelect />}
            {screen === "world" && <WorldView />}
            {screen === "battle" && <BattleScreen />}
            {screen === "ar-capture" && <ARCaptureScreen />}
            {screen === "collection" && <Collection />}
            {screen === "inventory" && <Inventory />}
            {screen === "quests" && <QuestLog />}
            {screen === "party" && <PartyScreen />}
            {screen === "world-map" && <WorldMapScreen />}
            {screen === "settings" && <SettingsScreen />}
          </motion.div>
        </AnimatePresence>

        {/* Evolution modal */}
        <AnimatePresence>
          {evoCreature && pendingEvo && screen === "world" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            >
              <Panel className="w-full max-w-sm p-6 text-center">
                <h3 className="text-lg font-black text-amber-300">What&apos;s this?</h3>
                <p className="mt-1 text-sm text-slate-300">
                  {evoCreature.nickname ?? getSpecies(evoCreature.speciesId).name} is ready to evolve into{" "}
                  <span className="font-bold text-violet-300">{getSpecies(pendingEvo.toSpeciesId).name}</span>!
                </p>
                <div className="mt-4 flex items-center justify-center gap-4">
                  <CreatureSprite speciesId={evoCreature.speciesId} size={80} />
                  <motion.span animate={{ x: [0, 6, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="text-2xl text-slate-400">➜</motion.span>
                  <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.2, repeat: Infinity }}>
                    <CreatureSprite speciesId={pendingEvo.toSpeciesId} size={88} />
                  </motion.div>
                </div>
                <div className="mt-5 flex gap-2">
                  <Button variant="ghost" className="flex-1" onClick={skipEvolution}>Not yet</Button>
                  <Button variant="gold" className="flex-1" onClick={confirmEvolution}>Evolve!</Button>
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toasts */}
        <div className="pointer-events-none absolute top-16 left-1/2 z-[60] flex w-full max-w-sm -translate-x-1/2 flex-col items-center gap-2 px-4">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className={`w-full rounded-xl border px-4 py-2 text-center text-sm font-semibold shadow-xl backdrop-blur ${
                  t.kind === "success"
                    ? "border-emerald-600/60 bg-emerald-950/90 text-emerald-200"
                    : t.kind === "warning"
                      ? "border-amber-600/60 bg-amber-950/90 text-amber-200"
                      : "border-slate-600/60 bg-slate-900/90 text-slate-200"
                }`}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
