"use client";

/**
 * AR Capture — camera-overlay WebAR.
 *
 * Live rear-camera feed (getUserMedia) with the monster composited on top.
 * Device tilt (deviceorientation) pans the monster for a window-into-the-world
 * feel; on desktop the mouse parallaxes instead. Swipe up from the orb to
 * throw — aim and the monster's drift depth feed the capture odds.
 * No camera / permission denied → falls back to a painted backdrop, still playable.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAr } from "@/game/state/arStore";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { getSpecies } from "@/game/data/creatures";
import { getItem } from "@/game/data/items";
import { AR_MAX_THROWS, resolveArThrow } from "@/game/systems/arCapture";
import { AudioManager } from "@/game/systems/AudioManager";
import { CreatureSprite } from "@/components/common/CreatureSprite";
import { Button, HpBar, RarityBadge, TypeBadge } from "@/components/common/ui";

type Phase = "intro" | "aiming" | "flying" | "shaking" | "captured" | "fled";

interface OrbFlight {
  toX: number; // % of viewport
  toY: number;
  hit: boolean;
}

export function ARCaptureScreen() {
  const target = useAr((s) => s.target);
  const clear = useAr((s) => s.clear);
  const setScreen = useUI((s) => s.setScreen);
  const toast = useUI((s) => s.toast);
  const game = useGame();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [camera, setCamera] = useState<"pending" | "live" | "denied">("pending");
  const [throwsLeft, setThrowsLeft] = useState(AR_MAX_THROWS);
  const [message, setMessage] = useState("");
  const [orbFlight, setOrbFlight] = useState<OrbFlight | null>(null);
  const [shakes, setShakes] = useState(0);
  const [dodge, setDodge] = useState(0); // increments to trigger dodge wiggle

  // monster drift state (rAF-driven, rendered via transform)
  const monsterRef = useRef<HTMLDivElement>(null);
  const drift = useRef({ x: 0, y: 0, depth: 1 });
  const tilt = useRef({ x: 0, y: 0 });

  const save = game.save;
  const orbEntries = Object.entries(save?.inventory ?? {}).filter(
    ([id]) => getItem(id).category === "orb"
  );
  const [orbIndex, setOrbIndex] = useState(0);
  const currentOrb = orbEntries[Math.min(orbIndex, Math.max(0, orbEntries.length - 1))];

  const species = target ? getSpecies(target.speciesId) : null;

  const exit = useCallback(
    (reason?: string) => {
      if (reason) toast(reason, "info");
      clear();
      setScreen("world");
    },
    [clear, setScreen, toast]
  );

  // ---- camera ----
  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          void videoRef.current.play().catch(() => {});
        }
        setCamera("live");
      })
      .catch(() => setCamera("denied"));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ---- device tilt / mouse parallax ----
  useEffect(() => {
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      tilt.current.x = Math.max(-40, Math.min(40, e.gamma)) * 0.9;
      tilt.current.y = Math.max(-30, Math.min(30, e.beta - 45)) * 0.7;
    };
    const onMouse = (e: MouseEvent) => {
      tilt.current.x = (e.clientX / window.innerWidth - 0.5) * 60;
      tilt.current.y = (e.clientY / window.innerHeight - 0.5) * 40;
    };
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("mousemove", onMouse);
    return () => {
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  // ---- monster drift loop ----
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      drift.current.x = Math.sin(t * 0.7) * 14 + Math.sin(t * 1.7) * 5;
      drift.current.y = Math.cos(t * 0.9) * 8;
      drift.current.depth = 0.5 + 0.5 * Math.sin(t * 0.45); // 0 far … 1 near
      const el = monsterRef.current;
      if (el) {
        const scale = 0.65 + drift.current.depth * 0.55;
        el.style.transform = `translate(calc(-50% + ${drift.current.x - tilt.current.x}px), calc(-50% + ${drift.current.y - tilt.current.y}px)) scale(${scale})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // ---- swipe-to-throw ----
  const swipe = useRef<{ x: number; y: number; t: number } | null>(null);

  const onOrbDown = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !currentOrb) return;
    // capture the pointer so pointerup reaches us even though the swipe
    // ends far above the pad (mouse pointers don't capture implicitly)
    e.currentTarget.setPointerCapture(e.pointerId);
    swipe.current = { x: e.clientX, y: e.clientY, t: performance.now() };
  };

  const onOrbUp = (e: React.PointerEvent) => {
    if (phase !== "aiming" || !swipe.current || !target || !currentOrb) return;
    const dx = e.clientX - swipe.current.x;
    const dy = e.clientY - swipe.current.y;
    swipe.current = null;
    if (dy > -40) return; // needs a real upward flick

    const [orbId] = currentOrb;
    if (!game.removeItem(orbId, 1)) return;

    // Where does the orb land? Horizontal flick error vs the monster's drift.
    const vw = window.innerWidth;
    const monsterX = 50 + ((drift.current.x - tilt.current.x) / vw) * 100;
    const throwX = 50 + (dx / vw) * 130;
    const aimError = Math.min(1.4, Math.abs(throwX - monsterX) / 16);
    const depth = drift.current.depth;
    const result = resolveArThrow(target, orbId, { aimError, depth });

    setPhase("flying");
    AudioManager.playSfx("capture-shake");
    setOrbFlight({
      toX: result.outcome === "miss" ? throwX : monsterX,
      toY: result.outcome === "miss" ? 8 : 34,
      hit: result.outcome !== "miss",
    });

    window.setTimeout(() => {
      setOrbFlight(null);
      if (result.outcome === "miss") {
        setDodge((d) => d + 1);
        setMessage("Whiffed! It darted aside.");
        afterThrow();
        return;
      }
      // shake sequence
      setShakes(result.shakes);
      setPhase("shaking");
      for (let i = 0; i < result.shakes; i++) {
        window.setTimeout(() => AudioManager.playSfx("capture-shake"), 250 + i * 700);
      }
      window.setTimeout(() => {
        if (result.outcome === "captured") {
          AudioManager.playSfx("capture-success");
          target.status = null;
          game.addCreature(target);
          game.saveGame();
          setPhase("captured");
        } else {
          AudioManager.playSfx("capture-fail");
          setMessage("It broke free!");
          setDodge((d) => d + 1);
          afterThrow();
        }
      }, 400 + result.shakes * 700);
    }, 650);

    function afterThrow() {
      setThrowsLeft((n) => {
        const left = n - 1;
        if (left <= 0) {
          setPhase("fled");
        } else {
          setPhase("aiming");
        }
        return left;
      });
    }
  };

  // fled / out of orbs auto-exit message
  useEffect(() => {
    if (phase === "aiming" && orbEntries.length === 0) setPhase("fled");
  }, [phase, orbEntries.length]);

  if (!target || !species || !save) return null;

  const hpPct = target.currentHp / target.stats.hp;

  return (
    <div className="relative h-dvh w-full touch-none overflow-hidden bg-slate-950 select-none">
      {/* camera feed / fallback backdrop */}
      <video
        ref={videoRef}
        playsInline
        muted
        className={`absolute inset-0 h-full w-full object-cover ${camera === "live" ? "" : "hidden"}`}
      />
      {camera !== "live" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/assets/backgrounds/title-vista.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/70" />

      {/* intro: explain + camera state */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/70 p-6 text-center"
          >
            <div className="text-4xl">📸</div>
            <h2 className="mt-2 text-2xl font-black text-amber-300">AR Hunt</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-300">
              A wild creature is hiding in the world around you. Tilt your device to track it —
              then <span className="font-bold text-amber-300">swipe up from the orb</span> to throw.
              Throws land best when it drifts close and you lead your aim.
            </p>
            {camera === "denied" && (
              <p className="mt-2 max-w-xs text-xs text-slate-400">
                (Camera unavailable — hunting against the painted sky instead.)
              </p>
            )}
            <Button variant="gold" className="mt-6 px-8" onClick={() => {
              AudioManager.init();
              AudioManager.playSfx("confirm");
              setPhase("aiming");
            }}>
              Start the hunt
            </Button>
            <Button variant="ghost" className="mt-2" onClick={() => exit()}>Leave</Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* top panel: monster info */}
      {phase !== "intro" && (
        <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between p-3">
          <div className="rounded-xl border border-slate-600/60 bg-slate-950/80 px-3 py-2 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-100">{species.name}</span>
              <span className="text-xs text-slate-400">Lv {target.level}</span>
              <TypeBadge element={species.element} small />
              <RarityBadge rarity={species.rarity} />
            </div>
            <div className="mt-1 w-44">
              <HpBar current={target.currentHp} max={target.stats.hp} showText={false} />
            </div>
          </div>
          <button
            onClick={() => exit("The creature slipped away.")}
            className="rounded-xl border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-sm text-slate-200 backdrop-blur"
          >
            ✕
          </button>
        </div>
      )}

      {/* target circle */}
      {(phase === "aiming" || phase === "flying") && (
        <div className="pointer-events-none absolute top-[34%] left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-52 w-52 rounded-full border-2 border-dashed border-amber-300/70"
          />
        </div>
      )}

      {/* the monster */}
      {phase !== "captured" && (
        <div
          ref={monsterRef}
          className="absolute top-[34%] left-1/2 z-20"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <motion.div
            key={dodge} // re-trigger wiggle on dodge
            initial={dodge ? { x: 60, rotate: 12 } : false}
            animate={
              phase === "shaking"
                ? { opacity: 0.15, scale: 0.7 }
                : phase === "fled"
                  ? { opacity: 0, y: -120, scale: 0.4 }
                  : { x: 0, rotate: 0, opacity: 1, scale: 1 }
            }
            transition={{ type: "spring", stiffness: 120, damping: 9 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <CreatureSprite speciesId={species.id} size={190} shiny={target.isShiny} />
            </motion.div>
            {/* contact shadow sells the AR grounding */}
            <div className="mx-auto -mt-3 h-4 w-28 rounded-full bg-slate-950/50 blur-md" />
          </motion.div>
        </div>
      )}

      {/* orb in flight */}
      <AnimatePresence>
        {orbFlight && (
          <motion.div
            initial={{ left: "50%", top: "88%", scale: 1 }}
            animate={{
              left: `${orbFlight.toX}%`,
              top: `${orbFlight.toY}%`,
              scale: orbFlight.hit ? 0.55 : 0.3,
              rotate: 720,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute z-30 -translate-x-1/2 -translate-y-1/2 text-5xl"
          >
            🔮
          </motion.div>
        )}
      </AnimatePresence>

      {/* shaking orb at the monster's spot */}
      {phase === "shaking" && (
        <motion.div
          className="absolute top-[34%] left-1/2 z-30 -translate-x-1/2 -translate-y-1/2 text-6xl"
          animate={{ rotate: [...Array.from({ length: shakes * 2 }, (_, i): number => (i % 2 ? 22 : -22)), 0] }}
          transition={{ duration: shakes * 0.7, ease: "easeInOut" }}
        >
          🔮
        </motion.div>
      )}

      {/* bottom HUD: message, orb selector, throw pad */}
      {phase !== "intro" && phase !== "captured" && phase !== "fled" && (
        <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 p-4 pb-6">
          {message && <div className="rounded-full bg-slate-950/80 px-4 py-1 text-sm text-amber-200 backdrop-blur">{message}</div>}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOrbIndex((i) => (i + 1) % Math.max(1, orbEntries.length))}
              className="rounded-xl border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur"
            >
              {currentOrb ? `${getItem(currentOrb[0]).name} ×${currentOrb[1]} ⇄` : "No orbs!"}
            </button>
            <div className="rounded-xl border border-slate-600/60 bg-slate-950/80 px-3 py-2 text-xs text-slate-300 backdrop-blur">
              Throws: {throwsLeft}
            </div>
          </div>
          <div
            onPointerDown={onOrbDown}
            onPointerUp={onOrbUp}
            className={`mt-1 flex h-24 w-24 items-center justify-center rounded-full border-2 text-6xl transition ${
              phase === "aiming" && currentOrb
                ? "cursor-grab border-amber-300/80 bg-slate-950/60 active:scale-95"
                : "border-slate-700/60 bg-slate-950/40 opacity-40"
            }`}
          >
            <motion.span animate={phase === "aiming" ? { y: [0, -5, 0] } : {}} transition={{ duration: 1.4, repeat: Infinity }}>
              🔮
            </motion.span>
          </div>
          <div className="text-[10px] uppercase tracking-widest text-slate-400">swipe up to throw</div>
        </div>
      )}

      {/* outcome overlays */}
      <AnimatePresence>
        {phase === "captured" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/75 p-6 text-center"
          >
            <motion.div initial={{ scale: 0.4 }} animate={{ scale: [0.4, 1.15, 1] }} transition={{ duration: 0.5 }}>
              <CreatureSprite speciesId={species.id} size={150} shiny={target.isShiny} />
            </motion.div>
            <motion.h2
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="mt-3 text-3xl font-black text-amber-300"
            >
              Gotcha!
            </motion.h2>
            <p className="mt-1 text-sm text-slate-300">
              {species.name} (Lv {target.level}) joined your collection{target.isShiny ? " — and it's ✨ shiny!" : "!"}
            </p>
            <Button variant="gold" className="mt-6 px-8" onClick={() => exit()}>
              Continue
            </Button>
          </motion.div>
        )}
        {phase === "fled" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-slate-950/75 p-6 text-center"
          >
            <div className="text-4xl">💨</div>
            <h2 className="mt-2 text-2xl font-black text-slate-200">It fled...</h2>
            <p className="mt-1 text-sm text-slate-400">
              {orbEntries.length === 0 ? "You're out of capture orbs." : "Too many close calls — it vanished from the lens."}
            </p>
            <Button variant="gold" className="mt-6 px-8" onClick={() => exit()}>
              Back to the world
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
