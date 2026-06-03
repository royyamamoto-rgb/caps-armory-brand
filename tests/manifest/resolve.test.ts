/**
 * resolve.test.ts — Task 19 (TDD)
 */
import { describe, it, expect } from "vitest";
import {
  resolveAsset,
  listAssets,
  AssetNotFoundError,
} from "../../src/manifest/resolve";

const MANIFEST = {
  schemaVersion: "1.0.0",
  brandVersion: "0.0.1-alpha.0",
  assets: {
    "hero/tactical-60s.mp4":
      "https://assets.capsarmory.com/assets/abc/hero.mp4",
    "photos/product/01.webp":
      "https://assets.capsarmory.com/assets/def/p1.webp",
  },
};

describe("resolveAsset", () => {
  it("returns URL for known logical name", () => {
    expect(resolveAsset("hero/tactical-60s.mp4", MANIFEST)).toBe(
      "https://assets.capsarmory.com/assets/abc/hero.mp4",
    );
  });
  it("throws AssetNotFoundError for unknown name", () => {
    expect(() => resolveAsset("hero/missing.mp4", MANIFEST)).toThrow(
      AssetNotFoundError,
    );
  });
  it("AssetNotFoundError carries the missing key in the message", () => {
    try {
      resolveAsset("hero/missing.mp4", MANIFEST);
    } catch (e) {
      expect((e as Error).message).toContain("hero/missing.mp4");
      expect((e as Error).name).toBe("AssetNotFoundError");
    }
  });
  it("listAssets returns sorted logical names", () => {
    expect(listAssets(MANIFEST)).toEqual([
      "hero/tactical-60s.mp4",
      "photos/product/01.webp",
    ]);
  });
  it("defaults to built-in manifest when no argument is provided", () => {
    // Built-in manifest ships empty in 0.0.1-alpha.0.
    expect(listAssets()).toEqual([]);
  });
});
