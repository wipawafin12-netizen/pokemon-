# Future Expansion Plan

## Phase 1 — Quality of life (1–2 weeks)
- Creature **nicknaming** (field exists on `CreatureInstance`) and a storage-box UI (storage array already persists).
- Skill **re-learning** NPC (learnsets retained in data) and manual skill slot management.
- 7 remaining regional **battle backdrops** + full 50-creature Higgsfield art pass (prompts ready in HIGGSFIELD_PROMPTS.md).
- Recorded music pack dropped into `public/assets/audio/` (architecture already prefers files over synth).
- Cloud save export/import (copy the save JSON; later: optional account sync).

## Phase 2 — Systems depth (3–6 weeks)
- **Held items** & natures (small stat modifiers) — extend `CreatureInstance`.
- **Weather** per map (sandstorm, snow, storm) feeding battle modifiers via the existing boss-hook pattern.
- **Breeding/eggs** at a new Village hatchery; egg steps tick off the existing playtime/step counters.
- **Trainer rematches** with scaled teams (flag-gated on badges) and a **Battle Tower** (endless trainer gauntlet reusing `startTrainer`).
- Day/night cycle (real-clock) gating encounters (Glowbug/Lunivine at night) — encounter entries gain an optional `time` field.

## Phase 3 — Content drops (quarterly)
- **Region 9: Sunken Archipelago** — water/wind, +10 species (dex 51–60), 1 guardian, 4 quests. The data layer is additive: new rows in creatures/maps/quests/bosses pass the validator and ship.
- Legendary trio side-saga (one roaming legendary that hops maps via a flag rotation).
- Seasonal dailies & shiny-boost events driven by `dayStamp`.

## Phase 4 — Multiplayer (exploratory)
- Async **PvP**: export a team snapshot, battle a friend's snapshot locally with the deterministic engine (`executeSkill` already takes an injectable RNG → replayable seeds).
- Trade codes: signed JSON creature transfers.
- Realtime co-op raids would need a server tier — out of scope for the LocalStorage architecture; revisit with Supabase/WebSocket if demand exists.

## Tech debt watchlist
- BattleScreen event playback could move from setTimeout-chains to a generator/async queue for easier pausing.
- Phaser scene fully remounts on screen changes (simple & robust); if map sizes grow 10×, switch to scene sleep/wake.
- Procedural creature sprites are charming but samey at 50 — the Higgsfield art pass is the real fix.
