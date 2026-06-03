/**
 * drift.ts — pure decision logic for the drift detector.
 *
 * Cases:
 *  - SHAs equal              → ok
 *  - SHAs differ, JSON equal → ok-cosmetic (whitespace / comment edit)
 *  - SHAs differ, JSON diff  → drift (publish blocker)
 */
export interface DriftArgs {
  pinnedSha: string;
  headSha: string;
  pinnedJson: string;
  headJson: string;
}

export interface DriftResult {
  status: "ok" | "ok-cosmetic" | "drift";
  message: string;
}

export function compareForDrift(a: DriftArgs): DriftResult {
  if (a.pinnedSha === a.headSha) {
    return { status: "ok", message: "themes.ts unchanged at pinned SHA" };
  }
  if (a.pinnedJson === a.headJson) {
    return {
      status: "ok-cosmetic",
      message:
        `themes.ts SHA changed (${a.pinnedSha} → ${a.headSha}) but extracted ` +
        `tokens are byte-identical; safe to bump .themes-pin`,
    };
  }
  return {
    status: "drift",
    message:
      `themes.ts diverged: ${a.pinnedSha} → ${a.headSha}. Extracted token JSON ` +
      `differs. Captain must review the diff and bump .themes-pin in a PR with ` +
      `a changeset entry.`,
  };
}
