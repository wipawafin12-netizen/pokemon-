"use client";

import { useState } from "react";
import { QUESTS, getQuest } from "@/game/data/quests";
import type { QuestType } from "@/game/data/types";
import { useGame } from "@/game/state/gameStore";
import { useUI } from "@/game/state/uiStore";
import { Button, Panel } from "@/components/common/ui";
import { getItem } from "@/game/data/items";

const TABS: { key: QuestType; label: string }[] = [
  { key: "story", label: "Story" },
  { key: "side", label: "Side" },
  { key: "daily", label: "Daily" },
];

export function QuestLog() {
  const save = useGame((s) => s.save);
  const claimQuest = useGame((s) => s.claimQuest);
  const closeOverlay = useUI((s) => s.closeOverlay);
  const [tab, setTab] = useState<QuestType>("story");

  if (!save) return null;

  const active = save.quests
    .map((qp) => ({ qp, quest: getQuest(qp.questId) }))
    .filter(({ quest }) => quest.type === tab)
    .sort((a, b) => (a.quest.order ?? 99) - (b.quest.order ?? 99));

  const notStarted = QUESTS.filter(
    (q) => q.type === tab && !save.quests.find((p) => p.questId === q.id)
  );

  return (
    <div className="h-dvh w-full overflow-hidden bg-slate-950 p-3 sm:p-6">
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-2xl font-black text-amber-300">Quest Log</h2>
          <Button variant="ghost" onClick={closeOverlay}>✕ Close</Button>
        </div>

        <div className="mb-3 flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${tab === t.key ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {active.length === 0 && notStarted.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No quests here yet — explore and talk to people!</div>
          )}

          {active.map(({ qp, quest }) => (
            <Panel key={quest.id} className={`p-4 ${qp.claimed ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-100">
                    {quest.name}
                    {qp.completed && !qp.claimed && <span className="ml-2 text-xs font-semibold text-emerald-400">✓ Complete!</span>}
                    {qp.claimed && <span className="ml-2 text-xs text-slate-500">Claimed</span>}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-400">{quest.description}</p>
                </div>
                {qp.completed && !qp.claimed && (
                  <Button variant="gold" className="shrink-0 px-3 py-1.5 text-xs" onClick={() => claimQuest(quest.id)}>
                    Claim
                  </Button>
                )}
              </div>
              <div className="mt-3 space-y-1.5">
                {quest.objectives.map((obj, i) => {
                  const target = obj.kind === "capture" || obj.kind === "collect" || obj.kind === "win_battles" ? obj.count : 1;
                  const cur = qp.progress[i] ?? 0;
                  const done = cur >= target;
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className={done ? "text-emerald-400" : "text-slate-600"}>{done ? "✓" : "○"}</span>
                      <span className={done ? "text-slate-500 line-through" : "text-slate-300"}>{obj.label}</span>
                      {target > 1 && <span className="ml-auto tabular-nums text-slate-500">{cur}/{target}</span>}
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span>Rewards:</span>
                <span className="text-amber-400">🪙 {quest.rewardGold}</span>
                {quest.rewardCrystals ? <span className="text-sky-300">💎 {quest.rewardCrystals}</span> : null}
                {(quest.rewardItems ?? []).map((r) => (
                  <span key={r.itemId} className="text-slate-400">{getItem(r.itemId).name} ×{r.qty}</span>
                ))}
                {quest.rewardXp ? <span className="text-violet-300">+{quest.rewardXp} XP</span> : null}
              </div>
            </Panel>
          ))}

          {notStarted.length > 0 && (
            <>
              <div className="pt-2 text-xs font-semibold uppercase tracking-wider text-slate-600">Undiscovered</div>
              {notStarted.map((q) => (
                <Panel key={q.id} className="p-4 opacity-50">
                  <div className="font-bold text-slate-400">??? — {q.giverNpcId ? "someone out there has a request" : "keep exploring"}</div>
                </Panel>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
