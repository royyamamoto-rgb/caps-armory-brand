/**
 * drift-detect.ts — publish-blocking drift detector.
 * Exit 0 on ok / ok-cosmetic; exit 1 on drift.
 */
import { readFile } from "node:fs/promises";
import { fetchThemesAt } from "../src/extract/fetch-themes";
import { parseThemes } from "../src/extract/parse-themes";
import { emitTokensJson } from "../src/extract/emit-json";
import { compareForDrift } from "../src/extract/drift";

async function readPinnedSha(): Promise<string> {
  const pin = await readFile(".themes-pin", "utf8");
  const m = /^sha=([0-9a-f]{40})$/m.exec(pin);
  if (!m) throw new Error(".themes-pin has no sha=<hex>");
  return m[1];
}

async function main(): Promise<void> {
  const token = process.env["THEMES_READ_PAT"] ?? "";
  if (!token) {
    console.error("THEMES_READ_PAT missing");
    process.exit(2);
  }
  const pinnedSha = await readPinnedSha();

  // Fetch HEAD content (blob-SHA agnostic) and the pinned content (verified).
  const headRes = await fetchThemesAt({
    expectedSha: null,
    ref: "master",
    token,
  });
  const headJson = emitTokensJson(parseThemes(headRes.source));

  // The pinned blob must still exist on master; fetch verifies the SHA.
  // If the file was renamed/removed, this throws — surfaced as drift script error.
  let pinnedJson: string;
  if (headRes.sha === pinnedSha) {
    pinnedJson = headJson;
  } else {
    // Get the pinned blob directly via the Git Blobs API (works for any reachable blob).
    const blobRes = await fetch(
      `https://api.github.com/repos/royyamamoto-rgb/caps-armory-app/git/blobs/${pinnedSha}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    if (!blobRes.ok) {
      throw new Error(`pinned blob fetch ${blobRes.status}`);
    }
    const blob = (await blobRes.json()) as { content: string; encoding: string };
    const pinnedSource = Buffer.from(
      blob.content,
      blob.encoding as BufferEncoding,
    ).toString("utf8");
    pinnedJson = emitTokensJson(parseThemes(pinnedSource));
  }

  const r = compareForDrift({
    pinnedSha,
    headSha: headRes.sha,
    pinnedJson,
    headJson,
  });
  console.log(`drift-detect: ${r.status} — ${r.message}`);
  process.exit(r.status === "drift" ? 1 : 0);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
