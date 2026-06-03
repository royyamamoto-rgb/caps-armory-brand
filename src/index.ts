/**
 * @capsarmory/brand — top-level barrel.
 * Tree-shakable consumers can also import from subpaths
 * (`./tokens`, `./marks/Crest`, etc.) declared in `package.json#exports`.
 */
export * from "./tokens";
export { Crest } from "./marks/Crest";
export type { CrestProps } from "./marks/Crest";
export { Wordmark } from "./marks/Wordmark";
export type { WordmarkProps } from "./marks/Wordmark";
export { Iconmark } from "./marks/Iconmark";
export type { IconmarkProps } from "./marks/Iconmark";
export {
  resolveAsset,
  listAssets,
  AssetNotFoundError,
} from "./manifest/resolve";
export type { AssetManifest } from "./manifest/resolve";
