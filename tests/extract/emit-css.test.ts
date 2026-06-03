/**
 * emit-css.test.ts — Task 11 (TDD)
 */
import { describe, it, expect } from "vitest";
import { emitPaletteCss } from "../../src/extract/emit-css";
import type { Palette } from "../../src/extract/parse-themes";

describe("emitPaletteCss", () => {
  it("emits dark scope in :root", () => {
    const out = emitPaletteCss({
      mode: "dark",
      palette: {
        gold: "#D4A24C",
        textPrimary: "#FAFAFA",
        surfaceElevated: "#1F1F1F",
      } as unknown as Palette,
    });
    expect(out).toMatch(/^:root\s*\{/m);
    expect(out).toContain("--color-gold: #D4A24C;");
    expect(out).toContain("--color-text-primary: #FAFAFA;");
    expect(out).toContain("--color-surface-elevated: #1F1F1F;");
  });

  it("emits light scope under .theme-light", () => {
    const out = emitPaletteCss({
      mode: "light",
      palette: { gold: "#B8893A" } as unknown as Palette,
    });
    expect(out).toMatch(/^\.theme-light\s*\{/m);
    expect(out).toContain("--color-gold: #B8893A;");
  });

  it("converts camelCase → kebab-case property names", () => {
    const out = emitPaletteCss({
      mode: "dark",
      palette: {
        textPrimary: "#A",
        surfaceElevated: "#B",
      } as unknown as Palette,
    });
    expect(out).toContain("--color-text-primary");
    expect(out).toContain("--color-surface-elevated");
    expect(out).not.toContain("--color-textPrimary");
  });

  it("is byte-stable across input key order", () => {
    const a = emitPaletteCss({
      mode: "dark",
      palette: { gold: "#1", border: "#2" } as unknown as Palette,
    });
    const b = emitPaletteCss({
      mode: "dark",
      palette: { border: "#2", gold: "#1" } as unknown as Palette,
    });
    expect(a).toBe(b);
  });
});
