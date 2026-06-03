/**
 * contract.test.ts — Task 14 (TDD)
 * 3-part SVG contract:
 *   1) No inline style= on root.
 *   2) No hex literal colors anywhere in the body.
 *   3) Root declares fill="currentColor"; every painted shape uses
 *      currentColor | none | transparent.
 */
import { describe, it, expect } from "vitest";
import { assertMarkInvariants } from "../../src/marks/contract";

describe("assertMarkInvariants", () => {
  it("passes a clean SVG", () => {
    const ok = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="currentColor"><path fill="currentColor" d="M0 0h64v64H0z"/></svg>`;
    expect(() => assertMarkInvariants(ok)).not.toThrow();
  });

  it("rejects inline style= on root", () => {
    const bad = `<svg style="color:red" viewBox="0 0 64 64" fill="currentColor"><path fill="currentColor" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(/inline style.*root/i);
  });

  it("rejects hex literals in body", () => {
    const bad = `<svg viewBox="0 0 64 64" fill="currentColor"><path fill="#FF0000" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(/hex literal/i);
  });

  it("rejects root missing fill='currentColor'", () => {
    const bad = `<svg viewBox="0 0 64 64"><path fill="currentColor" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(/root.*currentColor/i);
  });

  it("rejects painted path missing fill", () => {
    const bad = `<svg viewBox="0 0 64 64" fill="currentColor"><path d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(
      /painted path.*currentColor/i,
    );
  });

  it("allows fill='none' on stroke-only paths", () => {
    const ok = `<svg viewBox="0 0 64 64" fill="currentColor"><path fill="none" stroke="currentColor" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(ok)).not.toThrow();
  });

  it("rejects malformed root", () => {
    expect(() => assertMarkInvariants("<notsvg></notsvg>")).toThrow(
      /SVG root not found/,
    );
  });

  it("rejects non-currentColor stroke", () => {
    const bad = `<svg viewBox="0 0 64 64" fill="currentColor"><path stroke="red" fill="none" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(/stroke must be/i);
  });

  it("rejects non-currentColor fill that isn't a hex literal", () => {
    // Use named color (no '#') so the hex-literal check passes and we land on
    // the fill-currentColor check at line 43.
    const bad = `<svg viewBox="0 0 64 64" fill="currentColor"><path fill="red" d="M0 0z"/></svg>`;
    expect(() => assertMarkInvariants(bad)).toThrow(/fill must be/i);
  });
});
