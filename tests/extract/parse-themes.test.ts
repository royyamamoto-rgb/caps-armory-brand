/**
 * parse-themes.test.ts — Task 9 (TDD)
 * AST extractor invariants: 20 keys × 2 palettes, no non-literal entries,
 * no missing keys, hex literal validation.
 */
import { describe, it, expect } from "vitest";
import { parseThemes, REQUIRED_KEYS } from "../../src/extract/parse-themes";
import { VALID_THEMES_TS, SPREAD_THEMES_TS } from "../fixtures/themes.fixture";

describe("parseThemes", () => {
  it("extracts 20 keys × 2 palettes from valid source", () => {
    const { dark, light } = parseThemes(VALID_THEMES_TS);
    expect(Object.keys(dark).sort()).toEqual([...REQUIRED_KEYS].sort());
    expect(Object.keys(light).sort()).toEqual([...REQUIRED_KEYS].sort());
    expect(dark.gold).toBe("#C8A96E");
    expect(light.gold).toBe("#9E8451");
  });

  it("rejects non-literal values (brand-purity invariant)", () => {
    expect(() => parseThemes(SPREAD_THEMES_TS)).toThrow(/non-literal/i);
  });

  it("rejects missing keys", () => {
    const truncated = VALID_THEMES_TS.replace(
      "cancelled: '#7A7A7A',\n};",
      "};",
    );
    expect(() => parseThemes(truncated)).toThrow(/missing key.*cancelled/i);
  });

  it("rejects malformed hex literals", () => {
    const bad = VALID_THEMES_TS.replace("'#C8A96E'", "'not-a-color'");
    expect(() => parseThemes(bad)).toThrow(/invalid hex/i);
  });

  it("rejects unknown keys", () => {
    const bad = VALID_THEMES_TS.replace(
      "cancelled: '#7A7A7A',",
      "cancelled: '#7A7A7A',\n  rogueKey: '#000000',",
    );
    expect(() => parseThemes(bad)).toThrow(/unknown key.*rogueKey/i);
  });

  it("throws when DarkColors export is missing", () => {
    const bad = VALID_THEMES_TS.replace(
      "export const DarkColors",
      "const DarkColors",
    );
    expect(() => parseThemes(bad)).toThrow(/DarkColors not found/i);
  });

  it("throws when DarkColors initializer is not an object literal", () => {
    const bad = VALID_THEMES_TS.replace(
      /export const DarkColors: ThemeColors = \{[\s\S]*?\};/,
      "export const DarkColors: ThemeColors = makePalette();",
    );
    expect(() => parseThemes(bad)).toThrow(/initializer is not an object literal/i);
  });

  it("throws when a property is shorthand (no string-literal value)", () => {
    const bad = VALID_THEMES_TS.replace(
      "gold: '#C8A96E',",
      "gold,",
    );
    expect(() => parseThemes(bad)).toThrow(/non-literal entry/i);
  });

  it("strips an `as const` wrapper", () => {
    const withAsConst = VALID_THEMES_TS.replace(
      /export const DarkColors: ThemeColors = (\{[\s\S]*?\});/,
      "export const DarkColors = $1 as const;",
    );
    const { dark } = parseThemes(withAsConst);
    expect(dark.gold).toBe("#C8A96E");
  });

  it("normalizes hex values to uppercase", () => {
    const lowercased = VALID_THEMES_TS.replace("'#C8A96E'", "'#c8a96e'");
    const { dark } = parseThemes(lowercased);
    expect(dark.gold).toBe("#C8A96E");
  });

  it("accepts 8-digit hex (with alpha) values", () => {
    const withAlpha = VALID_THEMES_TS.replace("'#C8A96E'", "'#C8A96EFF'");
    const { dark } = parseThemes(withAlpha);
    expect(dark.gold).toBe("#C8A96EFF");
  });
});
