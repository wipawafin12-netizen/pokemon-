"use client";

import { useMemo, useState } from "react";
import { getItem } from "@/game/data/items";
import type { ItemCategory } from "@/game/data/types";
import { getSpecies } from "@/game/data/creatures";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { Button, Panel, HpBar } from "@/components/common/ui";
import { CreatureSprite } from "@/components/common/CreatureSprite";

const TABS: { key: ItemCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "orb", label: "Orbs" },
  { key: "potion", label: "Potions" },
  { key: "evolution", label: "Evolution" },
  { key: "quest", label: "Quest" },
];

type SortKey = "name" | "qty";

export function Inventory() {
  const save = useGame((s) => s.save);
  const useItemOnCreature = useGame((s) => s.useItemOnCreature);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const toast = useUI((s) => s.toast);
  const [tab, setTab] = useState<ItemCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [using, setUsing] = useState<string | null>(null);

  const entries = useMemo(() => {
    if (!save) return [];
    return Object.entries(save.inventory)
      .map(([id, qty]) => ({ item: getItem(id), qty }))
      .filter(({ item }) => (tab === "all" || item.category === tab))
      .filter(({ item }) => item.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (sort === "name" ? a.item.name.localeCompare(b.item.name) : b.qty - a.qty));
  }, [save, tab, search, sort]);

  if (!save) return null;

  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">Inventory</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm tabular-nums text-slate-400">🪙 {save.gold.toLocaleString()} · 💎 {save.crystals}</span>
            <Button variant="ghost" onClick={closeOverlay}>✕ Close</Button>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold ${tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {t.label}
            </button>
          ))}
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="ml-auto w-40 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 outline-none focus:border-indigo-400"
          />
          <button
            onClick={() => setSort(sort === "name" ? "qty" : "name")}
            className="rounded-lg bg-slate-800 px-2 py-1 text-xs text-slate-300 hover:bg-slate-700"
          >
            Sort: {sort === "name" ? "A→Z" : "Qty"}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {entries.length === 0 && <div className="py-12 text-center text-sm text-slate-500">Nothing here yet.</div>}
          {entries.map(({ item, qty }) => (
            <Panel key={item.id} className="flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-slate-100">{item.name}</span>
                  <span className="text-xs tabular-nums text-amber-400">×{qty}</span>
                  <span className="rounded bg-slate-800 px-1.5 text-[9px] uppercase tracking-wider text-slate-400">{item.category}</span>
                </div>
                <div className="truncate text-xs text-slate-400">{item.description}</div>
              </div>
              {(item.category === "potion" || item.category === "evolution") && (
                <Button variant="primary" className="shrink-0 px-3 py-1.5 text-xs" onClick={() => setUsing(item.id)}>
                  Use
                </Button>
              )}
            </Panel>
          ))}
        </div>
      </div>

      {/* target picker */}
      {using && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setUsing(null)}>
          <Panel className="w-full max-w-md p-4" >
            <h3 className="mb-3 font-bold text-slate-100">Use {getItem(using).name} on...</h3>
            <div className="space-y-2">
              {save.party.map((c) => (
                <button
                  key={c.uid}
                  className="flex w-full items-center gap-3 rounded-xl bg-slate-800/70 p-2 text-left hover:bg-slate-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    const msg = useItemOnCreature(using, c.uid);
                    if (msg) toast(msg, msg.includes("no effect") || msg.includes("can't") ? "warning" : "success");
                    setUsing(null);
                  }}
                >
                  <CreatureSprite speciesId={c.speciesId} size={40} shiny={c.isShiny} />
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-100">
                      {c.nickname ?? getSpecies(c.speciesId).name} <span className="text-xs text-slate-400">Lv {c.level}</span>
                    </div>
                    <HpBar current={c.currentHp} max={c.stats.hp} showText={false} />
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 text-right">
              <Button variant="ghost" onClick={() => setUsing(null)}>Cancel</Button>
            </div>
          </Panel>
        </div>
      )}
    </div>
  );
}
