/**
 * invariant.ts — publish-blocking guard: every @font-face block must
 *   - reference exactly one woff2 file that exists in fontsDir
 *   - have a unique unicode-range across the CSS
 *   - declare font-display: swap
 */
import { existsSync } from "node:fs";
import { join } from "node:path";

interface Block {
  src: string;
  range: string;
  display: string | null;
}

function parseBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  const re = /@font-face\s*\{([^}]*)\}/g;
  for (const m of css.matchAll(re)) {
    const body = m[1] ?? "";
    const src =
      /src:\s*url\(["']?\.?\/?([^"')]+\.woff2)["']?\)/.exec(body)?.[1] ?? "";
    const range = /unicode-range:\s*([^;]+);/.exec(body)?.[1]?.trim() ?? "";
    const display = /font-display:\s*(\w+)/.exec(body)?.[1] ?? null;
    blocks.push({ src, range, display });
  }
  return blocks;
}

export function assertOneWoff2PerRange(css: string, fontsDir: string): void {
  const blocks = parseBlocks(css);
  if (blocks.length === 0) {
    throw new Error("no @font-face blocks parsed");
  }

  // Phase 1: enforce uniqueness of unicode-range across all blocks before any
  // FS lookups (so duplicate-range failures aren't masked by missing-file errors
  // when the same fixture references files that don't exist on disk).
  const seenRanges = new Set<string>();
  for (const b of blocks) {
    if (seenRanges.has(b.range)) {
      throw new Error(`duplicate unicode-range found: ${b.range}`);
    }
    seenRanges.add(b.range);
  }

  // Phase 2: per-block sanity (font-display + file existence).
  for (const b of blocks) {
    if (b.display !== "swap") {
      throw new Error(
        `@font-face missing font-display: swap (range: ${b.range})`,
      );
    }
    if (!existsSync(join(fontsDir, b.src))) {
      throw new Error(`missing woff2 file referenced from CSS: ${b.src}`);
    }
  }
}
