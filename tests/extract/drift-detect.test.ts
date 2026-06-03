/**
 * drift-detect.test.ts — Task 13 (TDD)
 */
import { describe, it, expect } from "vitest";
import { compareForDrift } from "../../src/extract/drift";

describe("compareForDrift", () => {
  it("returns OK when pinned and head SHAs match", () => {
    expect(
      compareForDrift({
        pinnedSha: "abc",
        headSha: "abc",
        pinnedJson: "{}",
        headJson: "{}",
      }).status,
    ).toBe("ok");
  });

  it("returns drift with diff when SHAs differ AND JSON differs", () => {
    const r = compareForDrift({
      pinnedSha: "abc",
      headSha: "def",
      pinnedJson: '{"a":1}',
      headJson: '{"a":2}',
    });
    expect(r.status).toBe("drift");
    expect(r.message).toContain("themes.ts diverged");
    expect(r.message).toContain("abc → def");
  });

  it("returns ok-cosmetic when SHAs differ but JSON identical", () => {
    const r = compareForDrift({
      pinnedSha: "abc",
      headSha: "def",
      pinnedJson: '{"a":1}',
      headJson: '{"a":1}',
    });
    expect(r.status).toBe("ok-cosmetic");
    expect(r.message).toContain("byte-identical");
  });
});
