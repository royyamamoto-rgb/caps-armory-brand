import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { Wordmark } from "../../src/marks/Wordmark";
import { assertMarkInvariants } from "../../src/marks/contract";

describe("Wordmark mark", () => {
  it("source SVG satisfies contract", () => {
    expect(() =>
      assertMarkInvariants(readFileSync("src/marks/Wordmark.svg", "utf8")),
    ).not.toThrow();
  });
  it("TSX output satisfies contract", () => {
    expect(() =>
      assertMarkInvariants(renderToStaticMarkup(<Wordmark />)),
    ).not.toThrow();
  });
  it("renders <title> when prop provided", () => {
    expect(renderToStaticMarkup(<Wordmark title="Caps Armory" />)).toContain(
      "<title>Caps Armory</title>",
    );
  });
  it("decorative=true sets aria-hidden + role=presentation", () => {
    const html = renderToStaticMarkup(<Wordmark decorative />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('role="presentation"');
  });
});
