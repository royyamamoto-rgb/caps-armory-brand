/**
 * resolve.ts — public resolver for asset URLs declared in asset-manifest.json.
 */
import builtin from "./asset-manifest.json" with { type: "json" };

export interface AssetManifest {
  schemaVersion: string;
  brandVersion: string;
  assets: Record<string, string>;
}

export class AssetNotFoundError extends Error {
  constructor(name: string) {
    super(`asset not found in manifest: ${name}`);
    this.name = "AssetNotFoundError";
  }
}

export function resolveAsset(
  logicalName: string,
  manifest: AssetManifest = builtin as AssetManifest,
): string {
  const url = manifest.assets[logicalName];
  if (!url) throw new AssetNotFoundError(logicalName);
  return url;
}

export function listAssets(
  manifest: AssetManifest = builtin as AssetManifest,
): string[] {
  return Object.keys(manifest.assets).sort();
}
