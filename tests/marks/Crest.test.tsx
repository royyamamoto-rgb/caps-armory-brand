/**
 * Crest.test.tsx — Task 14
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Crest } from "../../src/marks/Crest";
import { assertMarkInvariants } from "../../src/marks/contract";

describe("Crest mark", () => {
  it("source SVG satisfies 3-part contract", () => {
    const svg = readFileSync("src/marks/Crest.svg", "utf8");
    expect(() => assertMarkInvariants(svg)).not.toThrow();
  });
  it("TSX wrapper output satisfies 3-part contract", () => {
    const html = renderToStaticMarkup(<Crest />);
    expect(() => assertMarkInvariants(html)).not.toThrow();
  });
  it("TSX wrapper renders <title> when prop provided", () => {
    const html = renderToStaticMarkup(<Crest title="Caps Armory" />);
    expect(html).toContain("<title>Caps Armory</title>");
  });
  it("decorative=true sets aria-hidden + role=presentation", () => {
    const html = renderToStaticMarkup(<Crest decorative />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });
});
