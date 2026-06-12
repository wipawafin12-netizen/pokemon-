# Type Effectiveness Table

> Generated from `game/data/typeChart.ts` — attacker rows × defender columns.
> **2** = super effective · **½** = not very effective · blank = neutral

| Atk \\ Def | Fire | Water | Nature | Earth | Wind | Electric | Ice | Light | Shadow |
|---|---|---|---|---|---|---|---|---|---|
| **Fire** | ½ | ½ | **2** | ½ |  |  | **2** |  |  |
| **Water** | **2** | ½ | ½ | **2** |  | ½ |  |  |  |
| **Nature** | ½ | **2** |  | **2** | ½ |  | ½ |  | ½ |
| **Earth** | **2** | ½ | ½ |  | ½ | **2** | ½ |  |  |
| **Wind** |  |  | **2** | **2** |  | ½ | ½ |  |  |
| **Electric** |  | **2** | ½ | ½ | **2** |  |  |  |  |
| **Ice** | ½ |  | **2** | **2** | **2** |  | ½ | ½ |  |
| **Light** |  |  |  |  |  |  | **2** | ½ | **2** |
| **Shadow** |  |  | **2** |  |  |  |  | **2** | ½ |

## Design notes

- Every element has at least two offensive targets and at least one weakness — no dead types.
- Light and Shadow are mutually super effective (mutual glass-cannon matchup) and resist themselves.
- Ice is the broadest offensive type (3 targets) but is fragile and resisted by itself, Fire and Light.
- Dual-element defenders multiply both charts (max 4×, min ¼×).
- STAB (same-type attack bonus): ×1.2.
