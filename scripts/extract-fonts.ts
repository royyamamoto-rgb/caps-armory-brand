/**
 * extract-fonts.ts — copy woff2 shards + emit inter.css alongside them.
 */
import { mkdir, copyFile, writeFile, access } from "node:fs/promises";
import { join } from "node:path";
import { INTER_SHARDS, buildFontCss } from "../src/fonts/manifest";

const SOURCE = "node_modules/@fontsource-variable/inter/files";
const DEST = "src/fonts";

async function main(): Promise<void> {
  await mkdir(DEST, { recursive: true });
  for (const shard of INTER_SHARDS) {
    const src = join(SOURCE, shard.file);
    await access(src);
    await copyFile(src, join(DEST, shard.file));
  }
  await writeFile(join(DEST, "inter.css"), buildFontCss(INTER_SHARDS));
  console.log(`OK extracted ${INTER_SHARDS.length} shards + inter.css`);
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
