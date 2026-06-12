# Eternal Monsters

A complete browser-based **Monster Catching RPG** — explore eight regions, capture 50 original creatures, battle 20 tamers and 8 Boss Guardians, and become the Grand Tamer. Entirely original IP.

**Stack:** Next.js 16 (App Router, Turbopack) · TypeScript · TailwindCSS 4 · Phaser 4 · Zustand · Framer Motion · LocalStorage saves · Higgsfield-generated key art & title animation.

## Play locally

```bash
npm install
npm run dev      # → http://localhost:3000
```

Desktop: WASD/arrows to move, Shift to run, Space/Enter/Z to interact. Mobile: on-screen D-pad + A button.

## Features

- 8 explorable regions + interiors, gated by Guardian badges, with fast travel
- **📸 AR Hunt** — camera-overlay WebAR capture: live rear-camera feed, tilt-to-track parallax, swipe-to-throw orbs, aim/distance-based odds; falls back to a painted backdrop without a camera. Home of the AR-exclusive **Embercub**
- 51 creatures · 112 skills · 9-element type chart · 4 evolution methods incl. branching
- Turn-based battles: status effects, stat stages, crits, cooldowns, smart AI, 8 unique boss mechanics
- Capture orbs (4 tiers) with HP/status-driven odds and shake animations
- 19 quests (story / side / daily), 3 shops, 2 currencies, 30 NPCs
- 3 save slots (LocalStorage, versioned migrations), settings incl. dark mode & reduced motion
- Fully playable with **zero asset files**: procedural pixel tilesets, seeded creature sprites, WebAudio synth score — real art/audio drops into `public/assets/**` and is auto-detected

## Scripts

```bash
npm run build                       # production build (Vercel-ready)
npx tsx scripts/validate-data.ts    # data integrity gate
npx tsx scripts/smoke-battle.ts     # engine balance simulation
node scripts/verify-boot.mjs        # Playwright E2E: boot → starter → world (dev server required)
node scripts/verify-battle.mjs      # Playwright E2E: encounter → battle → capture
npx tsx scripts/gen-docs.ts         # regenerate database docs from data
```

## Documentation

| Doc | Contents |
|---|---|
| [docs/GDD.md](docs/GDD.md) | Full game design document |
| [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) | Schema & ER overview |
| [docs/CREATURE_DATABASE.md](docs/CREATURE_DATABASE.md) | All 50 species (generated) |
| [docs/SKILL_DATABASE.md](docs/SKILL_DATABASE.md) | All 112 skills (generated) |
| [docs/QUEST_DATABASE.md](docs/QUEST_DATABASE.md) | All 19 quests (generated) |
| [docs/TYPE_CHART.md](docs/TYPE_CHART.md) | 9×9 effectiveness matrix (generated) |
| [docs/WORLD_ALMANAC.md](docs/WORLD_ALMANAC.md) | Items, NPCs, trainers, bosses (generated) |
| [docs/UI_WIREFRAMES.md](docs/UI_WIREFRAMES.md) | Screen wireframes |
| [docs/ART_GUIDELINES.md](docs/ART_GUIDELINES.md) | Art direction + STYLE FORMULA |
| [docs/HIGGSFIELD_PROMPTS.md](docs/HIGGSFIELD_PROMPTS.md) | AI asset pipeline prompts |
| [docs/ASSET_LIST.md](docs/ASSET_LIST.md) | Shipped & drop-in assets |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Vercel & self-host guide |
| [docs/EXPANSION_PLAN.md](docs/EXPANSION_PLAN.md) | Roadmap |

## Deploy

Push to GitHub → import at [vercel.com/new](https://vercel.com/new) → deploy. No env vars, no config — see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
"# pokemon-" 
