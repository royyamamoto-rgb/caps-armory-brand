import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Iconmark } from "../../src/marks/Iconmark";
import { assertMarkInvariants } from "../../src/marks/contract";

describe("Iconmark mark", () => {
  it("source SVG satisfies contract", () => {
    expect(() =>
      assertMarkInvariants(readFileSync("src/marks/Iconmark.svg", "utf8")),
    ).not.toThrow();
  });
  it("TSX output satisfies contract", () => {
    expect(() =>
      assertMarkInvariants(renderToStaticMarkup(<Iconmark />)),
    ).not.toThrow();
  });
  it("renders <title> when prop provided", () => {
    expect(renderToStaticMarkup(<Iconmark title="Caps Armory" />)).toContain(
      "<title>Caps Armory</title>",
    );
  });
  it("decorative=true sets aria-hidden + role=presentation", () => {
    const html = renderToStaticMarkup(<Iconmark decorative />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });
});
