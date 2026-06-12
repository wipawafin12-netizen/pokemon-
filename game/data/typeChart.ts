import type { ElementType } from "./types";

export const ELEMENTS: ElementType[] = [
  "fire",
  "water",
  "nature",
  "earth",
  "wind",
  "electric",
  "ice",
  "light",
  "shadow",
];

export const ELEMENT_LABEL: Record<ElementType, string> = {
  fire: "Fire",
  water: "Water",
  nature: "Nature",
  earth: "Earth",
  wind: "Wind",
  electric: "Electric",
  ice: "Ice",
  light: "Light",
  shadow: "Shadow",
};

export const ELEMENT_COLOR: Record<ElementType, string> = {
  fire: "#f4633a",
  water: "#3a8df4",
  nature: "#52b95b",
  earth: "#b98a52",
  wind: "#8fd6c8",
  electric: "#f4cf3a",
  ice: "#9fdcf4",
  light: "#f4e9b0",
  shadow: "#8a5cc8",
};

/**
 * Complete effectiveness matrix.
 * chart[attacker][defender] — 2 = super effective, 0.5 = not very effective, 1 = neutral.
 */
const SUPER: Record<ElementType, ElementType[]> = {
  fire: ["nature", "ice"],
  water: ["fire", "earth"],
  nature: ["water", "earth"],
  earth: ["fire", "electric"],
  wind: ["nature", "earth"],
  electric: ["water", "wind"],
  ice: ["nature", "wind", "earth"],
  light: ["shadow", "ice"],
  shadow: ["light", "nature"],
};

const WEAK: Record<ElementType, ElementType[]> = {
  fire: ["water", "earth", "fire"],
  water: ["nature", "electric", "water"],
  nature: ["fire", "ice", "wind", "shadow"],
  earth: ["water", "nature", "ice", "wind"],
  wind: ["electric", "ice"],
  electric: ["earth", "nature"],
  ice: ["fire", "light", "ice"],
  light: ["shadow", "light"],
  shadow: ["light", "shadow"],
};

export function effectiveness(attacker: ElementType, defender: ElementType): number {
  if (SUPER[attacker].includes(defender)) return 2;
  if (WEAK[attacker].includes(defender)) return 0.5;
  return 1;
}

/** Effectiveness vs a creature with one or two elements. */
export function effectivenessVs(
  attacker: ElementType,
  primary: ElementType,
  secondary?: ElementType
): number {
  return effectiveness(attacker, primary) * (secondary ? effectiveness(attacker, secondary) : 1);
}

export function effectivenessText(mult: number): string | null {
  if (mult >= 4) return "Devastatingly effective!";
  if (mult >= 2) return "Super effective!";
  if (mult <= 0.25) return "Barely effective...";
  if (mult <= 0.5) return "Not very effective...";
  return null;
}
