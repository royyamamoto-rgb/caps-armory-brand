/**
 * contrast-pairs.ts — WCAG AA contrast targets enforced on every published
 * palette. Body text targets 4.5:1; large/UI text targets 3.0:1.
 */
import type { Palette } from "../extract/parse-themes";

export interface Pair {
  text: keyof Palette;
  bg: keyof Palette;
  minRatio: number;
}

export const TEXT_BG_PAIRS: Pair[] = [
  { text: "textPrimary", bg: "background", minRatio: 4.5 },
  { text: "textPrimary", bg: "surface", minRatio: 4.5 },
  { text: "textPrimary", bg: "surfaceElevated", minRatio: 4.5 },
  { text: "textSecondary", bg: "background", minRatio: 4.5 },
  { text: "textSecondary", bg: "surface", minRatio: 4.5 },
  { text: "textMuted", bg: "background", minRatio: 3.0 },
  { text: "gold", bg: "background", minRatio: 3.0 },
  { text: "olive", bg: "background", minRatio: 3.0 },
];
