"use client";

import { useUI } from "@/game/state/uiStore";
import { useSettings } from "@/game/state/settingsStore";
import { useEffect, useState } from "react";

function useIsTouch(): boolean {
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0));
  }, []);
  return touch;
}

export function TouchControls() {
  const mode = useSettings((s) => s.touchControls);
  const setTouchDir = useUI((s) => s.setTouchDir);
  const setTouchRun = useUI((s) => s.setTouchRun);
  const pressInteract = useUI((s) => s.pressInteract);
  const isTouch = useIsTouch();

  const visible = mode === "on" || (mode === "auto" && isTouch);
  if (!visible) return null;

  const dirBtn = (dir: "up" | "down" | "left" | "right", label: string, cls: string) => (
    <button
      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-slate-800/70 text-xl text-slate-200 backdrop-blur active:bg-indigo-600 ${cls}`}
      onPointerDown={(e) => {
        e.preventDefault();
        setTouchDir({ [dir]: true });
      }}
      onPointerUp={() => setTouchDir({ [dir]: false })}
      onPointerLeave={() => setTouchDir({ [dir]: false })}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))] select-none">
      <div className="pointer-events-auto grid grid-cols-3 grid-rows-3 gap-1">
        <div />
        {dirBtn("up", "▲", "")}
        <div />
        {dirBtn("left", "◀", "")}
        <div className="h-14 w-14" />
        {dirBtn("right", "▶", "")}
        <div />
        {dirBtn("down", "▼", "")}
        <div />
      </div>
      <div className="pointer-events-auto flex flex-col gap-2">
        <button
          className="h-14 w-14 rounded-full bg-slate-800/70 text-xs font-bold text-slate-200 backdrop-blur active:bg-amber-500"
          onPointerDown={() => setTouchRun(true)}
          onPointerUp={() => setTouchRun(false)}
          onPointerLeave={() => setTouchRun(false)}
        >
          RUN
        </button>
        <button
          className="h-16 w-16 rounded-full bg-indigo-600/90 text-sm font-bold text-white shadow-lg backdrop-blur active:bg-indigo-400"
          onPointerDown={(e) => {
            e.preventDefault();
            pressInteract();
          }}
        >
          A
        </button>
      </div>
    </div>
  );
}
