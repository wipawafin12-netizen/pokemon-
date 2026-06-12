# Art Guidelines

## Direction

**HD-2D pixel art, fantasy adventure, bright colors, modern UI.** Chunky readable pixel sprites over softly lit painterly-leaning backdrops; the UI layer is deliberately modern (rounded panels, glass blur, motion) to frame the pixel world like a jewel box.

## THE STYLE FORMULA (canonical — byte-identical in every asset prompt)

> chunky HD-2D pixel art with a crisp 32x32 grid feel and subtle painterly highlights, rounded friendly silhouettes with thin deep-navy outlines, environments in bright saturated emerald, amber and sky-blue regional palettes with cool indigo shadows, creatures in vivid jewel tones that pop against the surroundings, hazards and pickups marked with a warm golden glow, sunlit storybook fantasy-adventure atmosphere with soft bloom, high contrast between game elements and backgrounds, clean readable silhouettes, consistent flat frontal perspective across all assets

**STYLE TOKEN** (≤120 chars, for length-limited fields):
`chunky HD-2D pixel art, jewel-tone creatures, emerald-amber-sky palettes, indigo shadows, golden glow accents, navy outlines`

Rules: never paraphrase the formula; one formula per game; changing it invalidates all assets and re-opens approval.

## Palette roles

| Role | Colors | Why |
|---|---|---|
| Environments | bright emerald / amber / sky-blue per region, indigo shadows | regional identity, stays "behind" |
| Creatures | vivid jewel tones (element-keyed, see below) | must pop against any region |
| Hazards & pickups | warm golden glow | single signal hue |
| UI | slate-950 glass panels, amber headings, indigo actions | modern frame |

Element key colors (`game/data/typeChart.ts` — used by UI badges AND procedural sprites):
fire `#f4633a` · water `#3a8df4` · nature `#52b95b` · earth `#b98a52` · wind `#8fd6c8` · electric `#f4cf3a` · ice `#9fdcf4` · light `#f4e9b0` · shadow `#8a5cc8`.

## Asset layers

1. **Procedural baseline (shipped):** every tile, character and creature is generated at runtime (`game/phaser/textures.ts`, `creatureSprite.ts`) — deterministic, seeded per species, element-paletted. The game is complete with zero art files.
2. **Higgsfield art (drop-in):** any PNG at `public/assets/creatures/<speciesId>.png` (transparent cutout) automatically replaces the procedural sprite everywhere; backgrounds live in `public/assets/backgrounds/`. Five creatures, the battle backdrop, the title vista and the animated title loop are already generated with the formula above.

## Technical specs

| Asset | Spec |
|---|---|
| Tiles | 32×32 px, generated per theme (8 palettes) |
| Character sprites | 32×32, 4 directions × 2 walk frames |
| Procedural creatures | 12×12 mirrored grid → rendered at 96–192px, NEAREST scaling |
| Higgsfield creature art | 1024×1024 generated → background removed → served as-is (object-contain) |
| Backgrounds | 16:9, 1376×768+ |
| Scale | hero = 1.0 unit; creatures 0.8–1.4 in battle (bosses 1.4) |
| Pixel rendering | `image-rendering: pixelated` for procedural, smooth for painted art; Phaser `roundPixels: true` |

## Coherence checklist (run on every new asset batch)

- [ ] Same rendering style as formula block 1 (chunky pixel, painterly highlights)?
- [ ] Thin deep-navy outlines present?
- [ ] Creature pops against all eight region palettes?
- [ ] Golden glow only on hazards/pickups?
- [ ] Flat frontal perspective?
- [ ] Key-color background fully removed (check enclosed regions, e.g. between limbs)?
- [ ] Regeneration budget: max 2 attempts per asset, then compensate in code (tint/scale).
