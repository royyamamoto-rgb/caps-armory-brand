/**
 * extract.test.ts — Task 17 (TDD)
 */
import { describe, it, expect } from "vitest";
import { buildFontCss, type FontShard } from "../../src/fonts/manifest";

const SHARDS: FontShard[] = [
  {
    file: "inter-latin-wght-normal.woff2",
    unicodeRange: "U+0000-00FF, U+0131, U+0152-0153",
  },
  {
    file: "inter-latin-ext-wght-normal.woff2",
    unicodeRange: "U+0100-024F",
  },
];

describe("buildFontCss", () => {
  it("emits one @font-face per shard", () => {
    const css = buildFontCss(SHARDS);
    expect(css.match(/@font-face/g)?.length).toBe(2);
  });
  it("each block references its woff2 file with format('woff2-variations')", () => {
    const css = buildFontCss(SHARDS);
    expect(css).toContain(
      `src: url("./inter-latin-wght-normal.woff2") format("woff2-variations")`,
    );
    expect(css).toContain(
      `src: url("./inter-latin-ext-wght-normal.woff2") format("woff2-variations")`,
    );
  });
  it("each block declares font-weight: 100 900 and font-display: swap", () => {
    const css = buildFontCss(SHARDS);
    const blocks = css.split("@font-face").slice(1);
    for (const b of blocks) {
      expect(b).toMatch(/font-weight:\s*100\s+900/);
      expect(b).toMatch(/font-display:\s*swap/);
    }
  });
  it("each block declares the shard's unicode-range", () => {
    const css = buildFontCss(SHARDS);
    expect(css).toContain(
      "unicode-range: U+0000-00FF, U+0131, U+0152-0153",
    );
    expect(css).toContain("unicode-range: U+0100-024F");
  });
});
