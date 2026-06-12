# Higgsfield AI Asset Pipeline — Prompt Library

**Model:** `nano_banana_2` (1k; AR 1:1 for sprites/icons, 16:9 for backgrounds) · UI icons may use `gpt_image_2`.
**Assembly (mandatory):** `<kind template> + <description> + <STYLE FORMULA> + <kind suffix>` — the FORMULA goes in **byte-identical** (see [ART_GUIDELINES.md](ART_GUIDELINES.md)).
**Sprites/icons:** generate on key color (default `#FF00FF` magenta; `#00FF00` green when the subject is pink/purple), then `remove_background`.
**Animation:** image → `generate_video` (kling3_0 / seedance_2_0), 5s, slow ambient motion prompts.

Abbreviations below: `[FORMULA]` = the style formula; `[SPRITE-SUFFIX]` = `, on a solid uniform bright #FF00FF magenta background, no shadows cast on the background, no ground plane, nothing cropped at the edges`; `[BG-SUFFIX]` = `, no characters, no UI elements, slightly muted detail so foreground game elements stay readable, soft depth layering`.

## 1. Creature Design (one per species — vary only the description)

```
game sprite of <3-4 word creature shorthand>, single character/object, full body visible, centered, [FORMULA][SPRITE-SUFFIX]
```
Shipped examples: `cheerful leaf seed-sprite creature` (sproutling) · `soot-furred ember bear cub` (cindercub) · `round blue water-droplet spirit` (dripple) · `majestic golden light-stag deity` (luxorath) · `looming violet shadow wraith` (umbrageist, green key). Remaining 45 descriptions follow each species' dex entry in [CREATURE_DATABASE.md](CREATURE_DATABASE.md).

## 2. Evolution Design
Same template; reference the line's silhouette continuity in the description, e.g. `blooming petal-maned beast, evolved form of a leaf seed-sprite, larger and prouder` (florabeast) → `ancient walking garden colossus with a glowing canopy` (elderbloom).

## 3. NPC Portraits
```
game sprite of <NPC archetype>, single character, bust portrait, facing forward, centered, [FORMULA][SPRITE-SUFFIX]
```
e.g. `kindly riddling village elder with oak staff` (Elder Rowan) · `sun-weathered desert caravaneer with brass trinkets` (Zara) · `serene temple priestess in dawn-gold robes` (Alma).

## 4. Town Maps
```
game background of cozy fantasy starter village with thatched roofs, stone paths and a healing spring, top-down establishing view, [FORMULA][BG-SUFFIX]
```

## 5. Forest Maps
```
game background of deep emerald forest with mossy groves, glowing pollen motes and a briar-warded clearing, wide establishing view, [FORMULA][BG-SUFFIX]
```

## 6. Cave Maps
```
game background of luminous crystal cavern with humming prism-quartz pillars and still mirror pools, wide establishing view, [FORMULA][BG-SUFFIX]
```

## 7. Desert Maps
```
game background of golden dune sea at high sun with a lone oasis and red mesa rocks, wide establishing view, [FORMULA][BG-SUFFIX]
```

## 8. Boss Creatures
```
game sprite of <boss epithet>, single massive creature, full body visible, imposing stance, centered, [FORMULA][SPRITE-SUFFIX]
```
e.g. `briar-armored fortress beast wreathed in living thorns` (Vael) · `mountain-hearted crystal titan` (Korr) · `storm-crowned thunder raptor` (Voltaras).

## 9. Battle Backgrounds (one per region theme)
```
game background of sunlit forest meadow battle clearing, wide establishing view, [FORMULA][BG-SUFFIX]
```
Variants: `crystal cavern arena floor` · `scorched dune amphitheater` · `frozen ridge plateau under aurora` · `storm-lashed mesa summit` · `radiant sky temple sanctum` · `sealed undercity ritual circle`.

## 10. UI Icons
```
game UI element: <icon>, single element, centered, [FORMULA], on a solid uniform bright #FF00FF magenta background, crisp edges, no drop shadow outside the element
```
Set: capture orb (4 tiers) · potion vial (3 sizes) · status icons (burn/freeze/poison/sleep/stun) · gold coin · crystal shard · badge medallions ×8 · quest scroll.

## 11. Animation (video)
Title loop (shipped): start_image = title vista →
```
Gentle ambient title-screen loop of a fantasy world vista at dawn: drifting clouds, soft god-rays slowly sweeping, distant storm flickering over the plateau, subtle shimmer on the crystal cavern glow. Slow calm motion, very slow parallax push-in, no characters, no camera cuts.
```
Further candidates: battle-background idle loops (same recipe per region), evolution flash (creature image → `slow radiant burst of golden light enveloping the creature, particles rising, triumphant`), capture orb burst.

## Shipped manifest (this build)

| Asset | File | Source job |
|---|---|---|
| Sproutling art | `public/assets/creatures/sproutling.png` | nano_banana + rembg |
| Cindercub art | `public/assets/creatures/cindercub.png` | ″ |
| Dripple art | `public/assets/creatures/dripple.png` | ″ |
| Luxorath art | `public/assets/creatures/luxorath.png` | ″ |
| Umbrageist art | `public/assets/creatures/umbrageist.png` | ″ (green key) |
| Battle backdrop | `public/assets/backgrounds/battle-forest.png` | nano_banana 16:9 |
| Title vista | `public/assets/backgrounds/title-vista.png` | nano_banana 16:9 |
| Title animation | `public/assets/ui/title-loop.mp4` | kling3_0 image→video |
| Embercub art (AR-exclusive, user-directed Pixar-style — deliberate deviation from the pixel FORMULA for the AR camera surface) | `public/assets/creatures/embercub.png` | nano_banana + rembg (green key) |
| AR promo scene | `public/assets/backgrounds/ar-promo.png` | nano_banana 9:16 |
