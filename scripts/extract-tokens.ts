/**
 * extract-tokens.ts — orchestrator: fetch pinned themes.ts, parse, emit all
 * output formats into src/tokens/.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fetchThemesAt } from "../src/extract/fetch-themes";
import { parseThemes } from "../src/extract/parse-themes";
import { emitPaletteTs } from "../src/extract/emit-ts";
import { emitPaletteCss } from "../src/extract/emit-css";
import { emitTokensJson } from "../src/extract/emit-json";

async function readPinnedSha(): Promise<string> {
  const pin = await readFile(".themes-pin", "utf8");
  const m = /^sha=([0-9a-f]{40})$/m.exec(pin);
  if (!m) throw new Error(".themes-pin has no sha=<hex> line");
  return m[1];
}

async function main(): Promise<void> {
  const token = process.env["THEMES_READ_PAT"];
  if (!token) throw new Error("THEMES_READ_PAT env var required");
  const sha = await readPinnedSha();
  // Use the pinned blob SHA as the expected value; fetch from master and
  // verify the blob hasn't drifted.
  const { source } = await fetchThemesAt({
    expectedSha: sha,
    ref: "master",
    token,
  });
  const { dark, light } = parseThemes(source);

  const out = join("src", "tokens");
  await mkdir(out, { recursive: true });
  await writeFile(
    join(out, "dark.ts"),
    emitPaletteTs({ name: "DarkPalette", palette: dark }),
  );
  await writeFile(
    join(out, "light.ts"),
    emitPaletteTs({ name: "LightPalette", palette: light }),
  );
  await writeFile(
    join(out, "dark.css"),
    emitPaletteCss({ mode: "dark", palette: dark }),
  );
  await writeFile(
    join(out, "light.css"),
    emitPaletteCss({ mode: "light", palette: light }),
  );
  await writeFile(join(out, "tokens.json"), emitTokensJson({ dark, light }));
  await writeFile(
    join(out, "index.ts"),
    `export * from "./dark";\nexport * from "./light";\n`,
  );

  console.log(
    "OK extracted: dark.ts light.ts dark.css light.css tokens.json index.ts",
  );
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
