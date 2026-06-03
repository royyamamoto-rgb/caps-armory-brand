# @capsarmory/brand

## 0.0.1-alpha.0

### Patch Changes

- Initial alpha — design tokens (dark + light palettes extracted from `caps-armory-app` via SHA-pinned drift gate), Inter Variable fonts (unicode-range shards), placeholder Crest/Wordmark/Iconmark marks satisfying the 3-part SVG contract, and an empty asset manifest with `resolveAsset()` / `listAssets()` / `AssetNotFoundError` helpers. Consumers wire `@capsarmory/brand/tokens/dark.css` + `@capsarmory/brand/fonts/inter.css` and import marks from the barrel.
