/**
 * check-token-rename.ts — fail PR if any token key was added or removed
 * but no `major`-tagged changeset for `@capsarmory/brand` exists.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

function tokensAt(ref: string): Record<string, string> | null {
  try {
    const json = execSync(`git show ${ref}:src/tokens/tokens.json`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    const parsed = JSON.parse(json) as {
      themes: { dark: Record<string, string> };
    };
    return parsed.themes.dark;
  } catch {
    return null;
  }
}

function hasMajorChangeset(): boolean {
  const dir = ".changeset";
  if (!existsSync(dir)) return false;
  const files = readdirSync(dir).filter(
    (f) => f.endsWith(".md") && f !== "README.md",
  );
  for (const f of files) {
    const body = readFileSync(join(dir, f), "utf8");
    if (/"@capsarmory\/brand":\s*major/.test(body)) return true;
  }
  return false;
}

const baseRef = process.env["GITHUB_BASE_REF"]
  ? `origin/${process.env["GITHUB_BASE_REF"]}`
  : "origin/main";

const oldTokens = tokensAt(baseRef);
const newTokens = tokensAt("HEAD");

if (!oldTokens || !newTokens) {
  console.log("token JSON missing on one side; skipping");
  process.exit(0);
}

const oldKeys = new Set(Object.keys(oldTokens));
const newKeys = new Set(Object.keys(newTokens));
const removed = [...oldKeys].filter((k) => !newKeys.has(k));
const added = [...newKeys].filter((k) => !oldKeys.has(k));

if (removed.length === 0 && added.length === 0) {
  console.log("no rename detected");
  process.exit(0);
}

if (!hasMajorChangeset()) {
  console.error(
    `Token rename detected (removed=${JSON.stringify(removed)}, ` +
      `added=${JSON.stringify(added)}) but no major-tagged changeset for ` +
      `@capsarmory/brand.`,
  );
  process.exit(1);
}
console.log("token rename present and major changeset declared — OK");
