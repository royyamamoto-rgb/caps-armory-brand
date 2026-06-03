/**
 * contract.ts — SVG brand-mark invariants used as a publish-blocking gate
 * and as a sanity test on every shipped mark + rendered TSX output.
 */
const HEX = /#[0-9a-fA-F]{3,8}\b/;
const PAINT_TAGS = ["path", "circle", "rect", "ellipse", "polygon", "polyline"];

export function assertMarkInvariants(svgSource: string): void {
  const trimmed = svgSource.trim();
  const rootMatch = /^<svg\b([^>]*)>/i.exec(trimmed);
  if (!rootMatch) {
    throw new Error("SVG root not found");
  }
  const rootAttrs = rootMatch[1] ?? "";

  if (/\bstyle\s*=/.test(rootAttrs)) {
    throw new Error("inline style= attribute on SVG root is forbidden");
  }
  const hexMatch = HEX.exec(svgSource);
  if (hexMatch) {
    throw new Error(`hex literal color found in SVG body: ${hexMatch[0]}`);
  }
  if (!/fill\s*=\s*["']currentColor["']/i.test(rootAttrs)) {
    throw new Error('SVG root must declare fill="currentColor"');
  }
  const tagRe = new RegExp(
    `<(${PAINT_TAGS.join("|")})\\b([^/>]*)/?>`,
    "gi",
  );
  for (const m of svgSource.matchAll(tagRe)) {
    const attrs = m[2] ?? "";
    const hasFill = /fill\s*=/i.test(attrs);
    const hasStroke = /stroke\s*=/i.test(attrs);
    if (!hasFill && !hasStroke) {
      throw new Error(
        `painted path <${m[1]}> missing fill/stroke — must declare currentColor`,
      );
    }
    if (
      hasFill &&
      !/fill\s*=\s*["'](currentColor|none|transparent)["']/i.test(attrs)
    ) {
      throw new Error(
        `painted path <${m[1]}> fill must be currentColor|none|transparent`,
      );
    }
    if (
      hasStroke &&
      !/stroke\s*=\s*["'](currentColor|none|transparent)["']/i.test(attrs)
    ) {
      throw new Error(
        `painted path <${m[1]}> stroke must be currentColor|none|transparent`,
      );
    }
  }
}
