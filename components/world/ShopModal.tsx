"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/game/state/uiStore";
import { useGame } from "@/game/state/gameStore";
import { SHOP_MAP } from "@/game/data/shops";
import { getItem } from "@/game/data/items";
import { Button, Panel } from "@/components/common/ui";
import { AudioManager } from "@/game/systems/AudioManager";

export function ShopModal() {
  const shopId = useUI((s) => s.shopId);
  const closeShop = useUI((s) => s.closeShop);
  const toast = useUI((s) => s.toast);
  const save = useGame((s) => s.save);
  const buyItem = useGame((s) => s.buyItem);
  const [tab, setTab] = useState<"gold" | "crystals">("gold");

  if (!shopId || !save) return null;
  const shop = SHOP_MAP[shopId];
  if (!shop) return null;

  const stock = tab === "gold" ? shop.stock : (shop.crystalStock ?? []);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
        <Panel className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-300">{shop.name}</h2>
            <div className="text-sm tabular-nums text-slate-300">
              🪙 {save.gold.toLocaleString()} · 💎 {save.crystals}
            </div>
          </div>

          {shop.crystalStock && (
            <div className="mb-3 flex gap-2">
              <Button variant={tab === "gold" ? "gold" : "ghost"} onClick={() => setTab("gold")}>Gold</Button>
              <Button variant={tab === "crystals" ? "gold" : "ghost"} onClick={() => setTab("crystals")}>Crystal Shards</Button>
            </div>
          )}

          <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
            {stock.map((itemId) => {
              const item = getItem(itemId);
              const price = tab === "gold" ? item.price : (item.crystalPrice ?? 0);
              const canAfford = tab === "gold" ? save.gold >= price : save.crystals >= price;
              return (
                <div key={itemId} className="flex items-center justify-between gap-3 rounded-xl bg-slate-800/70 p-3">
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-slate-100">{item.name}</span>
                      <span className="text-xs text-slate-400">owned: {save.inventory[itemId] ?? 0}</span>
                    </div>
                    <div className="truncate text-xs text-slate-400">{item.description}</div>
                  </div>
                  <Button
                    variant="primary"
                    disabled={!canAfford}
                    onClick={() => {
                      if (buyItem(itemId, tab)) toast(`Bought ${item.name}`, "success");
                      else AudioManager.playSfx("cancel");
                    }}
                    className="shrink-0"
                  >
                    {tab === "gold" ? `🪙 ${price}` : `💎 ${price}`}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-4 text-right">
            <Button variant="ghost" onClick={closeShop}>Leave Shop</Button>
          </div>
        </Panel>
      </motion.div>
    </div>
  );
}
