/**
 * fetch-themes.test.ts — Task 8 (TDD)
 * Verifies GitHub Contents API fetcher with SHA-mismatch guard.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchThemesAt } from "../../src/extract/fetch-themes";

describe("fetchThemesAt", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("returns decoded source when blob SHA matches", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sha: "abc123",
          encoding: "base64",
          content: Buffer.from(
            "export const DarkColors = { gold: '#D4A24C' };",
          ).toString("base64"),
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const result = await fetchThemesAt({ expectedSha: "abc123", ref: "master", token: "tok" });
    expect(result.source).toContain("DarkColors");
    expect(result.source).toContain("#D4A24C");
    expect(result.sha).toBe("abc123");
    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "/repos/royyamamoto-rgb/caps-armory-app/contents/constants/themes.ts?ref=master",
      ),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "Bearer tok" }),
      }),
    );
  });

  it("throws on non-200", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response("not found", { status: 404 }),
    );
    await expect(
      fetchThemesAt({ expectedSha: "deadbeef", ref: "master", token: "tok" }),
    ).rejects.toThrow(/404/);
  });

  it("throws on SHA mismatch (defends against ref-rewrite race)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sha: "different",
          encoding: "base64",
          content: Buffer.from("x").toString("base64"),
        }),
        { status: 200 },
      ),
    );
    await expect(
      fetchThemesAt({ expectedSha: "expected", ref: "master", token: "tok" }),
    ).rejects.toThrow(/sha mismatch/i);
  });

  it("allows skipping SHA check when expectedSha is null (drift head probe)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          sha: "anything",
          encoding: "base64",
          content: Buffer.from("export const DarkColors = {};").toString("base64"),
        }),
        { status: 200 },
      ),
    );
    const r = await fetchThemesAt({ expectedSha: null, ref: "master", token: "tok" });
    expect(r.sha).toBe("anything");
    expect(r.source).toContain("DarkColors");
  });
});
