/**
 * emit-json.ts — emit `tokens.json` with byte-stable, sorted-key output.
 */
import type { Palette } from "./parse-themes";

export interface JsonArgs {
  dark: Palette;
  light: Palette;
}

const sortKeys = (obj: Record<string, string>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)),
  );

export function emitTokensJson({ dark, light }: JsonArgs): string {
  return (
    JSON.stringify(
      {
        schemaVersion: "1.0.0",
        themes: { dark: sortKeys(dark), light: sortKeys(light) },
      },
      null,
      2,
    ) + "\n"
  );
}
