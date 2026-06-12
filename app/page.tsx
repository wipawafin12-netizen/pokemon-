"use client";

import dynamic from "next/dynamic";

// The entire game is client-side (Phaser, WebAudio, localStorage saves) —
// skip SSR for the game root.
const GameRoot = dynamic(() => import("@/components/GameRoot"), {
  ssr: false,
  loading: () => (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-950">
      <div className="animate-pulse text-lg font-bold tracking-widest text-amber-300">
        ETERNAL MONSTERS
      </div>
    </div>
  ),
});

export default function Page() {
  return <GameRoot />;
}
