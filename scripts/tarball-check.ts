/**
 * tarball-check.ts — pre-publish whitelist + size cap.
 * Uses `npm pack --dry-run --json` because pnpm pack lacks JSON output.
 */
import { execSync } from "node:child_process";

const FORBIDDEN: RegExp[] = [
  /\/raw\//,
  /\.map$/,
  /\.env(\.|$)/,
  /\/secrets/,
  /\/__tests__\//,
  /\.test\.(t|j)sx?$/,
  /\/tests?\//,
  /\/scripts\//,
];

const MAX_BYTES = 2 * 1024 * 1024; // 2 MiB

interface PackEntry {
  path: string;
  size: number;
}

interface PackResult {
  size: number;
  unpackedSize: number;
  files: PackEntry[];
}

function pack(): PackResult {
  const json = execSync("npm pack --dry-run --json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const arr = JSON.parse(json) as PackResult[];
  if (!arr[0]) throw new Error("npm pack returned no entries");
  return arr[0];
}

function main(): void {
  const { files, size, unpackedSize } = pack();
  const violations: string[] = [];
  for (const f of files) {
    for (const re of FORBIDDEN) {
      if (re.test(f.path)) {
        violations.push(`forbidden path matched ${re}: ${f.path}`);
      }
    }
  }
  if (size > MAX_BYTES) {
    violations.push(
      `tarball ${(size / 1024 / 1024).toFixed(2)} MiB exceeds 2 MiB cap`,
    );
  }
  if (violations.length > 0) {
    console.error("Tarball whitelist FAILED:");
    for (const v of violations) console.error("  " + v);
    process.exit(1);
  }
  console.log(
    `Tarball whitelist OK — ${files.length} files, ` +
      `${(size / 1024).toFixed(1)} KiB packed, ` +
      `${(unpackedSize / 1024).toFixed(1)} KiB unpacked`,
  );
}

main();
