# UI Wireframes

Dark-fantasy theme, rounded-2xl panels (`bg-slate-900/90`, `border-slate-700`), amber headings, indigo primary actions. All screens responsive: single column on phones, side panels appear ≥768px. Framer Motion fades between screens; reduced-motion setting halves/disables animation.

## 1. Main Menu
```
┌──────────────────────────────────────────────┐
│        (Higgsfield title-loop video bg)      │
│           🐻   🌱   💧   ← bobbing starters   │
│        E T E R N A L   M O N S T E R S       │
│         tagline · explore/capture/become     │
│              [ ▶ Press Start ]               │
└──────────────────────────────────────────────┘
```

## 2. Save Select
```
┌── Choose a Save ─────────────────────────────┐
│ ┌ Slot 1  Tester 🏅3/8                      ┐ │
│ │ Crystal Caverns · 4h 12m · 📖 18/50 [Del] │ │
│ ├ Slot 2 — Empty · Start a new adventure   ┤ │
│ ├ Slot 3 — Empty                           ┤ │
│ └ [← Back to Title]                        ┘ │
└──────────────────────────────────────────────┘
New slot → inline name input → Starter Select (3 cards: sprite, type badge, lore).
```

## 3. World
```
┌ Origin Village          [Party][Collection]  ┐
│ 🪙500 💎0 🏅0/8          [Bag][Quests][Map]   │
│                          [Settings][💾Save]  │
│              PHASER CANVAS                   │
│        (camera-followed player)              │
│ ┌ D-pad ┐                       (RUN) (A)    │  ← touch only
│ ┌──────────── Dialogue box ────────────────┐ │  ← when talking
│ │ Elder Rowan: "Ah, the new tamer!"   ▾    │ │
└──────────────────────────────────────────────┘
```

## 4. Battle
```
┌  WILD ENCOUNTER · TURN 3                     ┐
│   (Higgsfield battle backdrop)               │
│                       ┌ Mossling  Lv3 ─────┐ │
│                       │ NATURE  [██████──] │ │
│                       └────────────────────┘ │
│                              👾  ← shake/    │
│   🐉  ← player sprite           flash/floats │
│ ┌ Sproutling Lv10 ────┐                      │
│ │ NATURE [████████──] │                      │
│ │ XP [███───────────] │                      │
│ └─────────────────────┘                      │
│ ┌ log: "A critical hit!" ──────────────────┐ │
│ [⚔ Attack][🧪 Items][🔮 Capture][🔄][🏃]      │
│   └ submenu: 4 skill cards (PWR/ACC/CD)      │
└──────────────────────────────────────────────┘
Victory overlay: 🏆 rewards list → [Continue].
Capture: orb wobbles 1–3×, burst on success.
```

## 5. Creature Collection
```
┌ Creature Collection      Seen 24 · Caught 18 ┐
│ ┌──┬──┬──┬──┬──┬──┬──┬──┐  ┌─ Detail ──────┐ │
│ │🐻│🌱│?│👾│…│  │  │  │  │  │ sprite, types │ │
│ │#1│#2│#3│#4│ grid 50  │  │ stat bars     │ │
│ └──┴──┴──┴──┴──┴──┴──┴──┘  │ learnset, evo │ │
│  ?=unseen, silhouette=seen │ lore, habitat │ │
└──────────────────────────────────────────────┘
```

## 6. Inventory
```
┌ Inventory                    🪙2,340 💎12    ┐
│ [All][Orbs][Potions][Evolution][Quest]       │
│                 (search…) [Sort: A→Z|Qty]    │
│ ┌ Great Orb ×5 · capture ×1.6        [Use?]┐ │
│ ┌ Small Potion ×3 · heal 40       [Use]    │ │
│ Use → party picker modal (sprite+HP bars)    │
└──────────────────────────────────────────────┘
```

## 7. Quest Log
```
┌ Quest Log     [Story][Side][Daily]           ┐
│ ┌ The Verdant Trial          ✓ Complete!    ┐│
│ │ ✓ Defeat Vael, the Bramble Warden  [Claim]││
│ │ Rewards: 🪙500 💎5 +250XP                  ││
│ ┌ Granny's Locket                           ┐│
│ │ ✓ Find the Lost Locket      ○ Return it   ││
└──────────────────────────────────────────────┘
```

## 8. Party
```
┌ Party                                        ┐
│ ┌ 🌱 Florabeast Lv18 LEAD [██████──] ▲▼     ┐ │  ┌ Detail: XP bar,
│ ┌ 🐦 Chirpuff  Lv12      [████────] ▲▼     ┐ │  │ friendship ♥♥♥,
│ +2 creature(s) in storage                    │  │ 5 stats, 4 skill
└──────────────────────────────────────────────┘  └ cards (PWR/ACC/CD)
```

## 9. World Map — vertical journey line, 8 region cards (icon, name, wild levels, [Travel] if visited, "❓ Unexplored" otherwise, ring on current).

## 10. Settings — sliders (music/SFX), segmented choices (text speed, 🌙/☀️ theme, reduced motion, touch controls), [Save & Quit to Title].

## Overlays (any screen)
- **Toasts** — top-center stack, color-coded info/success/warning, auto-dismiss 3.5s.
- **Evolution modal** — old sprite ➜ new sprite, [Not yet][Evolve!].
- **Shop modal** — gold/crystal tabs, stock rows with owned count, [Leave Shop].
