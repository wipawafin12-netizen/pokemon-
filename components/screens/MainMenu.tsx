"use client";

import { motion } from "framer-motion";
import { useUI } from "@/game/state/uiStore";
import { AudioManager } from "@/game/systems/AudioManager";
import { CreatureSprite } from "@/components/common/CreatureSprite";
import { Button } from "@/components/common/ui";

export function MainMenu() {
  const setScreen = useUI((s) => s.setScreen);

  const start = () => {
    AudioManager.init();
    AudioManager.playSfx("confirm");
    AudioManager.playMusic("menu");
    setScreen("save-select");
  };

  return (
    <div className="relative flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950">
      {/* Higgsfield title art: animated loop with still-image poster fallback */}
      <div className="pointer-events-none absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/assets/backgrounds/title-vista.png"
          className="h-full w-full object-cover opacity-60"
          onError={(e) => ((e.target as HTMLVideoElement).style.display = "none")}
        >
          <source src="/assets/ui/title-loop.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950/90" />
      </div>
      {/* drifting glow orbs */}
      <div className="pointer-events-none absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl"
            initial={{ x: `${(i * 17) % 90}vw`, y: `${(i * 29) % 80}vh` }}
            animate={{ y: [`${(i * 29) % 80}vh`, `${((i * 29) % 80) - 10}vh`, `${(i * 29) % 80}vh`] }}
            transition={{ duration: 6 + i, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="z-10 flex flex-col items-center px-4 text-center"
      >
        <div className="mb-6 flex items-end gap-3">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
            <CreatureSprite speciesId="cindercub" size={72} />
          </motion.div>
          <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}>
            <CreatureSprite speciesId="sproutling" size={88} />
          </motion.div>
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}>
            <CreatureSprite speciesId="dripple" size={72} />
          </motion.div>
        </div>

        <h1 className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-5xl font-black tracking-tight text-transparent sm:text-7xl">
          ETERNAL MONSTERS
        </h1>
        <p className="mt-3 max-w-md text-sm text-slate-400 sm:text-base">
          Explore a living world. Capture wondrous creatures. Challenge the eight Guardians and become the Grand Tamer.
        </p>

        <motion.div whileHover={{ scale: 1.04 }} className="mt-10">
          <Button variant="gold" onClick={start} className="px-10 py-3 text-lg shadow-2xl shadow-amber-500/20">
            ▶ Press Start
          </Button>
        </motion.div>

        <div className="mt-8 text-xs text-slate-600">v1.0 — an original creature-taming RPG</div>
      </motion.div>
    </div>
  );
}
