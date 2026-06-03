/**
 * contrast.test.ts — Task 22
 * Verifies all TEXT_BG_PAIRS clear the WCAG AA threshold on both palettes.
 */
import { describe, it, expect } from "vitest";
import { hex } from "wcag-contrast";
import { DarkPalette } from "../../src/tokens/dark";
import { LightPalette } from "../../src/tokens/light";
import { TEXT_BG_PAIRS } from "../../src/a11y/contrast-pairs";

const fmt = (n: number): string => n.toFixed(2);

describe("WCAG contrast — DarkPalette", () => {
  for (const p of TEXT_BG_PAIRS) {
    it(`${p.text} on ${p.bg} ≥ ${p.minRatio}:1`, () => {
      const ratio = hex(
        DarkPalette[p.text].slice(0, 7),
        DarkPalette[p.bg].slice(0, 7),
      );
      expect(ratio, `actual ${fmt(ratio)}:1`).toBeGreaterThanOrEqual(
        p.minRatio,
      );
    });
  }
});

describe("WCAG contrast — LightPalette", () => {
  for (const p of TEXT_BG_PAIRS) {
    it(`${p.text} on ${p.bg} ≥ ${p.minRatio}:1`, () => {
      const ratio = hex(
        LightPalette[p.text].slice(0, 7),
        LightPalette[p.bg].slice(0, 7),
      );
      expect(ratio, `actual ${fmt(ratio)}:1`).toBeGreaterThanOrEqual(
        p.minRatio,
      );
    });
  }
});
