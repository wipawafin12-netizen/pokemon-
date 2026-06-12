"use client";

import type { ElementType, Rarity, StatusEffect } from "@/game/data/types";
import { ELEMENT_COLOR, ELEMENT_LABEL } from "@/game/data/typeChart";

export function TypeBadge({ element, small = false }: { element: ElementType; small?: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide text-slate-950 ${small ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
      style={{ backgroundColor: ELEMENT_COLOR[element] }}
    >
      {ELEMENT_LABEL[element]}
    </span>
  );
}

const RARITY_STYLE: Record<Rarity, string> = {
  common: "text-slate-300 border-slate-500",
  rare: "text-sky-300 border-sky-500",
  epic: "text-violet-300 border-violet-500",
  legendary: "text-amber-300 border-amber-500",
};

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  return (
    <span className={`rounded border px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider ${RARITY_STYLE[rarity]}`}>
      {rarity}
    </span>
  );
}

const STATUS_STYLE: Record<StatusEffect, { label: string; cls: string }> = {
  burn: { label: "BRN", cls: "bg-orange-600" },
  freeze: { label: "FRZ", cls: "bg-cyan-600" },
  poison: { label: "PSN", cls: "bg-purple-600" },
  sleep: { label: "SLP", cls: "bg-slate-500" },
  stun: { label: "STN", cls: "bg-yellow-600" },
};

export function StatusBadge({ status }: { status: StatusEffect | null }) {
  if (!status) return null;
  const s = STATUS_STYLE[status];
  return <span className={`rounded px-1.5 py-0 text-[9px] font-bold text-white ${s.cls}`}>{s.label}</span>;
}

export function HpBar({ current, max, showText = true }: { current: number; max: number; showText?: boolean }) {
  const pct = Math.max(0, Math.min(100, (current / max) * 100));
  const color = pct > 50 ? "bg-emerald-500" : pct > 20 ? "bg-amber-400" : "bg-rose-500";
  return (
    <div className="w-full">
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/80">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      {showText && (
        <div className="mt-0.5 text-right text-[10px] tabular-nums text-slate-300">
          {Math.max(0, Math.ceil(current))}/{max}
        </div>
      )}
    </div>
  );
}

export function XpBar({ xpInLevel, xpForNext }: { xpInLevel: number; xpForNext: number }) {
  const pct = xpForNext <= 0 ? 100 : Math.max(0, Math.min(100, (xpInLevel / xpForNext) * 100));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-700/80">
      <div className="h-full rounded-full bg-sky-400 transition-all duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-slate-700/60 bg-slate-900/90 shadow-xl backdrop-blur ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "danger" | "gold";
  disabled?: boolean;
  className?: string;
}) {
  const styles: Record<string, string> = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    ghost: "bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-600/60",
    danger: "bg-rose-700 hover:bg-rose-600 text-white",
    gold: "bg-amber-500 hover:bg-amber-400 text-slate-950",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
