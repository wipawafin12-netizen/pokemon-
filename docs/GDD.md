# Eternal Monsters — Game Design Document

**Genre:** Monster Catching RPG · **Platform:** Web browser (desktop / mobile / tablet)
**Tech:** Next.js 16 (App Router, Turbopack) · TypeScript · TailwindCSS 4 · Phaser 4 · Zustand · Framer Motion · LocalStorage saves
**Deployment:** Vercel-ready static-first build

---

## 1. Vision

A modern creature-collecting RPG: explore a hand-built fantasy world of eight regions, discover and capture 50 original creatures, battle 20 tamers and 8 Boss Guardians, complete quests, and become the **Grand Tamer** by sealing the First Night beneath Capital City.

Pillars: **Exploration · Discovery · Progression · Collection · Strategy.**

### Story arc

The world was born from two siblings: **Luxorath, the First Dawn**, and **Umbrageist, the First Night**. The Night was sealed beneath what became Capital City; the Dawn keeps watch from the Sky Temple. The seal is failing. A new tamer from Origin Village walks the eight regions, earning the trust of each region's Guardian, until the Dawn itself measures them worthy to face the Night — not to destroy it, but to defeat and befriend it. Completing the collection (all 50, both legendaries) is the true Grand Tamer ending.

## 2. Core gameplay loop

```
Explore region → encounter wild creatures in tall grass → battle / capture
   → level & evolve party → complete quests → defeat region trainers
      → challenge the Boss Guardian → earn the badge + key item
         → next region unlocks → repeat ×8 → finale
```

Minute-to-minute: grid-based walking (hold Shift / RUN to run), NPC dialogue, item pickups, shops, and turn-based battles.

## 3. World — 8 regions + 2 interiors

| # | Region | Theme | Wild levels | Guardian |
|---|---|---|---|---|
| 1 | Origin Village | safe hub, tutorial | — | — |
| 2 | Verdant Forest | nature/wind/electric | 3–8 | Vael, the Bramble Warden (L14) |
| 3 | Crystal Caverns | earth/shadow/fire | 10–17 | Korr, the Mountain's Heart (L20) |
| 4 | Desert Frontier | earth/fire/nature | 17–24 | Sirocco, the Endless Gale (L26) |
| 5 | Frozen Ridge | ice | 25–31 | Boreas, the Sleeping Avalanche (L32) |
| 6 | Thunder Plateau | electric/wind/fire | 32–38 | Voltaras, the Stormheart (L38) |
| 7 | Sky Temple | light | 38–44 | Luxorath, the First Dawn (L44) |
| 8 | Capital City | shadow endgame | 42–48 | Nocten (L47) → Umbrageist (L50) |

Progression gates: each Guardian's defeat sets a flag that opens the portal to the next region (briars part, crystal walls melt, sandstorms still, avalanches clear, the sky-lift wakes, the skybridge materializes). The World Map screen allows fast travel to any *visited* region.

Maps are ASCII tile grids (`game/data/maps.ts`) rendered with procedurally generated 32px pixel-art tilesets per theme. Tile legend: ground `.` deco `,` solid `#` water `~` tall grass `*` path `=` building `B` door `D` bridge `-` ledge `^`.

## 4. Creatures (50 species)

- 5 stats: **HP / Attack / Defense / Magic / Speed**. Battle stat at level L: `floor(2·base·L/100)+5` (HP adds `L+10`).
- Rarity tiers drive capture rate & XP yield: common (180/60), rare (100/110), epic (50/170), legendary (15/280).
- Base stat totals: ~300 common · ~400 rare · ~480 epic · ~570 legendary.
- ~1/256 wild creatures are **shiny** (alternate palette, cosmetic).
- Full roster, stats, lore: [CREATURE_DATABASE.md](CREATURE_DATABASE.md).

### Evolution (all four methods shipped)

| Method | Example |
|---|---|
| Level | Sproutling → Florabeast (16) → Elderbloom (32) |
| Item | Emberimp + Ember Stone → Ashfiend; Frostfox + Frost Gem → Glacielle |
| Friendship | Aquafawn (160) → Mistelk; Lumigleam (180) → Seraphlume |
| Quest | Shadeling + "The Shadow Pact" → Nyxfiend |
| **Branching** | Branchling + Sun Charm → Solivine **or** + Moon Charm → Lunivine |

Friendship rises from battles won (+3), level-ups (+3), evolving (+10); starts at 70 (100 for the starter).

## 5. Elements & type chart

9 elements: Fire, Water, Nature, Earth, Wind, Electric, Ice, Light, Shadow. Full 9×9 matrix in [TYPE_CHART.md](TYPE_CHART.md). STAB ×1.2, dual-type defenders multiply, crits ×1.5 (base 6.25% + skill bonuses).

## 6. Battle system

Turn-based 1v1 with party switching (max party 6).

- **Actions:** Skill · Item · Capture (wild only) · Switch · Escape (wild only).
- **Damage:** `(((2L/5+2)·power·atk/def)/50+2) · STAB · type · crit · variance(0.85–1)`; physical animations (slash/quake/burst) use Attack, the rest use Magic.
- **Stat stages:** ±3, multiplier `(2+s)/2` or `2/(2−s)`.
- **Status effects:** Burn (6% HP/turn, −30% Attack) · Poison (10% HP/turn) · Freeze (skip, 25% thaw) · Sleep (skip, 40% wake) · Stun (40% skip, −25% Speed, 2 turns).
- **Cooldowns:** advanced 1–2 turns, ultimates 3–4 — skill rotation matters.
- **Turn order:** effective Speed; **escape:** `0.55 + (yourSpd − foeSpd)/150`, clamped 25–95%.
- **AI:** wild = random usable skill; trainers/bosses = best expected damage vs your types, heals below 35% HP, occasional opening buffs.
- **Defeat:** blackout — lose 10% gold, party healed, respawn in Origin Village.

### Boss mechanics (engine hooks)

`shield_every_3` · `speed_ramp` · `heal_once` (40% below 30%) · `status_aura` (30%/turn element status) · `reflect` (20%) · `double_strike` (above 70% HP) · `enrage_below_half` (+35% Attack) · `last_stand` (survives first lethal hit at 1 HP). Bosses get ×1.5 HP. Each Guardian combines 2–3 hooks (see [WORLD_ALMANAC.md](WORLD_ALMANAC.md)). Luxorath and Umbrageist **join the team** when defeated, making the 50/50 collection completable.

## 6b. AR Hunt (camera-overlay WebAR)

From the world HUD (📸 AR Hunt), the rear camera opens (`getUserMedia`, HTTPS) and a wild creature from the current region's encounter table — or the AR-exclusive **Embercub** (~18% anywhere) — is composited over the live feed. Device tilt (`deviceorientation`) pans the creature for a window-into-the-world feel (mouse parallax on desktop); it drifts near/far on a slow sine.

**Throw:** swipe up from the orb pad (pointer-captured so mouse drags work too). Capture odds = core formula × **aimFactor** (1.15 bullseye → 0.6 graze; > threshold whiffs entirely) × **depthFactor** (0.8 far → 1.2 near). Six throws before the creature flees. Success feeds the same collection/save/quest pipeline as battle captures. No camera permission → painted-sky fallback keeps the mode fully playable. Engine: `game/systems/arCapture.ts`; screen: `components/ar/ARCaptureScreen.tsx`.

## 7. Capture system

`chance = (captureRate/255) · hpFactor · statusBonus · orbPower`, clamped 3–95%, where `hpFactor = (3·max − 2·cur)/(3·max)`; sleep/freeze ×2, other statuses ×1.5.

| Orb | Power | Price |
|---|---|---|
| Basic Orb | ×1.0 | 150g |
| Great Orb | ×1.6 | 500g |
| Ultra Orb | ×2.2 | 1,100g |
| Mythic Orb | ×3.5 | 50💎 |

The orb shakes 1–3 times (near-misses shake more) before the verdict; success/failure each have distinct animation + sound.

## 8. Skills (112)

Every species learns a basic → advanced → ultimate arc plus utility (heal/buff/debuff/status). Per-skill: power, accuracy, cooldown, animation type (slash/burst/beam/wave/shield/sparkle/quake/storm/drain/nova), plus optional status chance, stat stages, drain, multi-hit, crit bonus. Full list: [SKILL_DATABASE.md](SKILL_DATABASE.md). Creatures hold 4 equipped skills; new skills auto-slot on level-up (oldest rotates out).

## 9. Quests (19)

8 story chapters (one per region) + 8 side quests + 3 dailies (reset on a new calendar day). Objective kinds: talk / defeat_trainer / defeat_boss / capture (optionally element-filtered) / collect / reach / win_battles. Quests track automatically from play events; rewards are claimed in the Quest Log. Full list: [QUEST_DATABASE.md](QUEST_DATABASE.md).

## 10. Economy

Currencies: **Gold** (battles, quests, selling) and **Crystal Shards** (bosses, quests, dailies — premium-feel sink, no real money).

Income vs sink curve: region N trainers pay ≈ region N orb/potion needs ×1.3, so a player who fights most trainers affords consumables without grinding; crystal items (Mythic Orb 50💎, evolution stones 30💎) cost ≈ 2 boss clears each. Shops: General Store (village), Caravan Orbs (desert), Destiny Emporium (evolution items, Frozen Ridge). Blackout penalty (−10% gold) is the only money sink with teeth.

## 11. Save system

3 slots in LocalStorage (`eternal-monsters:save:{0..2}`), versioned with forward-migration (`SaveManager.migrate`). Stores: player profile, position, party + storage, inventory, quests, dex (seen/caught), flags, badges, defeated trainers, play time. Settings saved separately. Manual save button + autosave after every battle.

## 12. Audio architecture

Two layers (`game/systems/AudioManager.ts`): if a file exists under `public/assets/audio/**` it plays; otherwise a WebAudio **procedural synth** generates theme music (per-region scale/tempo/waveform) and all SFX — the game ships fully audible with zero audio files. Folder contract documented in the AudioManager header. Music/SFX volumes are independent settings; audio unlocks on first user gesture.

## 13. Performance

- 60 FPS target; Phaser 4 WebGL renderer, `roundPixels`, camera zoom adapts to viewport (1.4× phone → 2.2× desktop).
- Phaser is **lazy-loaded** (`dynamic import`) only when entering the world; the menu shell is a few KB.
- All textures are generated once per scene on small canvases (32px tiles); creature art is cached data-URLs; real PNG assets are probed once and cached.
- Maps are ≤26×16 tiles → < 450 static images per scene, trivially within draw-call budget.
- Smoke numbers (Playwright, dev build, 1280×800): world scene steady at the display refresh rate, no dropped-frame warnings; full boot → world in < 3 s.

## 14. Controls

| Action | Desktop | Touch |
|---|---|---|
| Move | WASD / Arrows (physical key codes) | virtual D-pad |
| Run | Shift | RUN button |
| Interact / advance dialogue | Space / Enter / Z | A button |
| Menus | HUD buttons | HUD buttons |

## 15. Screens

Main Menu · Save Select (3 slots, delete, summary) · Starter Select · World (Phaser + HUD) · World Map (fast travel) · Creature Collection (dex w/ silhouettes) · Inventory (tabs, search, sort, use-on-creature) · Quest Log (3 tabs, claim) · Party (reorder, stats, skills) · Battle · Settings (volumes, text speed, theme, reduced motion, touch controls). Wireframes: [UI_WIREFRAMES.md](UI_WIREFRAMES.md).
