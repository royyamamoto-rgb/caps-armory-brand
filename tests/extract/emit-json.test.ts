/**
 * emit-json.test.ts — Task 12 (TDD)
 */
import { describe, it, expect } from "vitest";
import { emitTokensJson } from "../../src/extract/emit-json";
import type { Palette } from "../../src/extract/parse-themes";

describe("emitTokensJson", () => {
  it("emits a stable JSON shape with schemaVersion", () => {
    const out = JSON.parse(
      emitTokensJson({
        dark: { gold: "#D4A24C" } as unknown as Palette,
        light: { gold: "#B8893A" } as unknown as Palette,
      }),
    );
    expect(out.schemaVersion).toBe("1.0.0");
    expect(out.themes.dark.gold).toBe("#D4A24C");
    expect(out.themes.light.gold).toBe("#B8893A");
  });

  it("produces byte-stable output (sorted keys)", () => {
    const a = emitTokensJson({
      dark: { b: "#1", a: "#2" } as unknown as Palette,
      light: {} as unknown as Palette,
    });
    const b = emitTokensJson({
      dark: { a: "#2", b: "#1" } as unknown as Palette,
      light: {} as unknown as Palette,
    });
    expect(a).toBe(b);
  });

  it("ends with a trailing newline (POSIX file-ending convention)", () => {
    const out = emitTokensJson({
      dark: {} as unknown as Palette,
      light: {} as unknown as Palette,
    });
    expect(out.endsWith("\n")).toBe(true);
  });
});
