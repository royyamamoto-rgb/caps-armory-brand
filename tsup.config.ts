/**
 * tsup.config.ts — dual ESM+CJS build with separate entry points per subpath
 * exported in package.json. SVG / woff2 / CSS / JSON assets are copied via
 * `onSuccess` so the dist tree mirrors the publishConfig.
 */
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/tokens/dark.ts",
    "src/tokens/light.ts",
    "src/tokens/index.ts",
    "src/marks/Crest.tsx",
    "src/marks/Wordmark.tsx",
    "src/marks/Iconmark.tsx",
    "src/manifest/resolve.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: false,
  clean: true,
  outDir: "dist",
  splitting: false,
  treeshake: true,
  external: ["react", "react-dom"],
  onSuccess: async () => {
    const { cp, mkdir } = await import("node:fs/promises");
    await mkdir("dist/marks", { recursive: true });
    await cp("src/marks/Crest.svg", "dist/marks/Crest.svg");
    await cp("src/marks/Wordmark.svg", "dist/marks/Wordmark.svg");
    await cp("src/marks/Iconmark.svg", "dist/marks/Iconmark.svg");
    await mkdir("dist/fonts", { recursive: true });
    // Only copy the published asset files — exclude source TS modules so the
    // tarball whitelist gate doesn't fail on leaked `manifest.ts` / `invariant.ts`.
    const { readdir, copyFile } = await import("node:fs/promises");
    const fontFiles = await readdir("src/fonts");
    for (const file of fontFiles) {
      if (file.endsWith(".woff2") || file.endsWith(".css")) {
        await copyFile(`src/fonts/${file}`, `dist/fonts/${file}`);
      }
    }
    await mkdir("dist/tokens", { recursive: true });
    await cp("src/tokens/dark.css", "dist/tokens/dark.css");
    await cp("src/tokens/light.css", "dist/tokens/light.css");
    await cp("src/tokens/tokens.json", "dist/tokens/tokens.json");
    await mkdir("dist/manifest", { recursive: true });
    await cp(
      "src/manifest/asset-manifest.json",
      "dist/manifest/asset-manifest.json",
    );
    console.log("tsup onSuccess: copied SVG, fonts, CSS, JSON to dist/");
  },
});
