/**
 * invariant.test.ts — Task 18 (TDD)
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { assertOneWoff2PerRange } from "../../src/fonts/invariant";

describe("inter.css invariant", () => {
  it("ships one woff2 per declared unicode-range", () => {
    const css = readFileSync("src/fonts/inter.css", "utf8");
    expect(() => assertOneWoff2PerRange(css, "src/fonts")).not.toThrow();
  });

  it("fails if two blocks share the same unicode-range", () => {
    const css = `
      @font-face { src: url("./a.woff2") format("woff2-variations"); font-weight: 100 900; font-display: swap; unicode-range: U+0000-00FF; }
      @font-face { src: url("./b.woff2") format("woff2-variations"); font-weight: 100 900; font-display: swap; unicode-range: U+0000-00FF; }
    `;
    expect(() => assertOneWoff2PerRange(css, "src/fonts")).toThrow(
      /duplicate unicode-range/i,
    );
  });

  it("fails if a referenced woff2 file is missing", () => {
    const css = `@font-face { src: url("./missing.woff2") format("woff2-variations"); font-weight: 100 900; font-display: swap; unicode-range: U+0000-00FF; }`;
    expect(() => assertOneWoff2PerRange(css, "src/fonts")).toThrow(
      /missing.*woff2/i,
    );
  });

  it("fails if font-display: swap is absent", () => {
    const css = `@font-face { src: url("./inter-latin-wght-normal.woff2") format("woff2-variations"); font-weight: 100 900; unicode-range: U+0000-00FF; }`;
    expect(() => assertOneWoff2PerRange(css, "src/fonts")).toThrow(
      /font-display.*swap/i,
    );
  });

  it("fails when no @font-face blocks parse", () => {
    expect(() => assertOneWoff2PerRange("/* no faces */", "src/fonts")).toThrow(
      /no @font-face blocks parsed/,
    );
  });
});
