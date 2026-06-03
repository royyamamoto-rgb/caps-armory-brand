# @capsarmory/brand — Design Spec (P1a)

**Date:** 2026-05-12
**Owner:** Captain (山本竜平)
**Status:** DRAFT — pending Captain approval before writing-plans handoff
**Predecessor:** N/A (new package)
**Related:** caps-armory-www, caps-armory-app, caps-armory-portal
**Council:** docs/superpowers/council/2026-05-12-p1a-brand-pre-spec-council-v3.md (APPROVED, 8.25/10)
**FMEA:** docs/superpowers/fmea/2026-05-12-p1a-brand-package-fmea.md
**Parent spec:** docs/superpowers/specs/2026-05-07-capsarmory-www-design.md § 8 (Phase 1 — Marketing + Brand Foundation)

---

## 1. Purpose

Deliver `@capsarmory/brand` — a versioned, semver-disciplined npm package that is the single source of truth for the CAPS Armory brand surface across every downstream consumer:

1. Replace the current ad-hoc brand surface (Tailwind 4 `@theme` block hand-typed inside `caps-armory-www/src/app/globals.css`, SVG-less marks, Inter loaded via raw `@fontsource-variable/inter/wght.css`) with a shared, versioned import.
2. Carry brand tokens, vector marks, typography wiring, and a curated photographic + cinematic asset library that all three consumers (capsarmory-www, caps-armory-portal, caps-armory-app) bind against the same version.
3. Provide compile-time drift detection against `caps-armory-app/constants/themes.ts` so the iOS app and the web brand never diverge silently.
4. Decouple heavy assets (hero video, AI photo library) from the npm tarball — assets are hosted on Cloudflare R2 with content-addressed paths; the package carries only an asset manifest mapping logical name to immutable URL.
5. Ship cross-platform (Next.js / RN / generic web) by emitting tokens as ESM + CJS + plain CSS + a JSON manifest, and by shipping typography as precompiled `@font-face` CSS rather than a `next/font` wrapper.
6. Publish publicly to npmjs.com under MIT with sigstore provenance + changesets-managed versioning, so sister brands (DutyKits, BM-Maligator, Lumina28) can pattern-match by reading the source.
7. Unblock parent spec P1-AC-03 / P1-AC-04 / P1-AC-05 / P1-AC-06 from a single Gate-1 design and a 3-week production schedule.

## 2. Non-Goals

1. **No commerce, no UI primitives, no app-shell.** The package is brand, marks, type, and asset-manifest only. Buttons, forms, layout components stay in each consumer.
2. **No catalog of sister-brand tokens.** This package is CAPS-Armory-only. Other sister brands consume the same shape under their own package name later.
3. **No multi-theme palette switching API.** Dark is canonical; light tokens ship for parity with the iOS app but no runtime theme switcher.
4. **No build-time image transforms.** Asset processing (Veo encoding, AI-photo pre-filter, OCR/face/logo screening) lives in a Makefile target that Captain invokes manually; CI does not regenerate assets.
5. **No `next/font` wrapper or any framework-specific font integration.** Q4=C: precompiled `@font-face` CSS only.
6. **No bundled hero video or AI photos inside the tarball.** Those live on R2; the package ships only the manifest.
7. **No `peerDependencies` on Next.js, React, or React Native.** The package is framework-agnostic CSS + JSON + SVG.

## 3. Architecture

### 3.1 Diagram

```
                  ┌─────────────────────────────────────────────────┐
                  │  caps-armory-app/constants/themes.ts (canonical) │
                  │  SHA-pinned at kickoff via .themes-pin file     │
                  └─────────────────────┬───────────────────────────┘
                                        │ read by drift detector
                                        ▼ (lumina-drift-bot, PAT)
                  ┌─────────────────────────────────────────────────┐
                  │  @capsarmory/brand (this package)               │
                  │  ─ tokens (ESM + CJS + JSON + CSS)              │
                  │  ─ marks (Crest / Wordmark / Iconmark, SVG+TSX) │
                  │  ─ fonts (precompiled @font-face, woff2 shards) │
                  │  ─ asset-manifest.json (R2 URL bindings)        │
                  │  ─ no React peerDep — TSX marks are optional    │
                  │  Published to npmjs.com (MIT) via OIDC + sigstore│
                  └────┬─────────────────────┬────────────────────┬─┘
                       │                     │                    │
                       ▼                     ▼                    ▼
              caps-armory-www      caps-armory-portal     caps-armory-app
              (Next.js 16)         (Next.js 16)           (React Native / Expo)
              @import CSS          @import CSS            import JSON tokens
              import marks/*       import marks/*         (no CSS, no fonts)
                       │                     │                    │
                       └─────────┬───────────┴────────────────────┘
                                 ▼
                  ┌─────────────────────────────────────────────────┐
                  │  Cloudflare R2 (assets.capsarmory.com)          │
                  │  assets/{content-hash}/{filename}               │
                  │  Cloudflare Worker fronts R2; immutable headers │
                  └─────────────────────────────────────────────────┘
```

### 3.2 Ownership Matrix

| Surface | Owner of source | Owner of build | Consumed by | Update cadence |
|---|---|---|---|---|
| Token values | `caps-armory-app/constants/themes.ts` | `@capsarmory/brand` extract script | www, portal, app | Per-release; drift detector blocks mismatch |
| Vector marks (Crest / Wordmark / Iconmark) | `@capsarmory/brand/src/marks/*.svg` | tsup + svgo | www, portal | Per-release |
| Typography (Inter Variable) | `@fontsource-variable/inter` (devDep) | extract script → woff2 shards | www, portal | Per-release (pinned fontsource version) |
| Asset manifest | `@capsarmory/brand/asset-manifest.json` | `make brand-assets` (Captain-run) | www | Per-release |
| Hero video, AI photos | R2 `assets/{hash}/{filename}` | `make brand-assets` upload | www | Decoupled from package versioning |
| Drift detector | `@capsarmory/brand` CI (read-only PAT on caps-armory-app) | GitHub Actions | n/a | Every CI run |

### 3.3 Boundary Rules

- **Inbound:** brand reads `caps-armory-app/constants/themes.ts` via read-only PAT on bot account `lumina-drift-bot`. No write path.
- **Outbound:** consumers import via npm; no consumer writes back into the package.
- **Lateral:** brand never imports from caps-armory-www or caps-armory-portal. Dependency direction is strictly one-way.

## 4. Package Layout

### 4.1 Source tree

```
caps-armory-brand/
├── package.json
├── tsup.config.ts
├── .themes-pin                       # SHA of caps-armory-app/constants/themes.ts at lock time
├── .changeset/
├── src/
│   ├── tokens/
│   │   ├── dark.ts                   # generated from themes.ts
│   │   ├── light.ts                  # generated from themes.ts
│   │   ├── dark.css                  # generated — CSS custom properties
│   │   ├── light.css                 # generated — CSS custom properties
│   │   └── tokens.json               # generated — single source for non-JS consumers
│   ├── marks/
│   │   ├── Crest.svg
│   │   ├── Crest.tsx                 # optional React wrapper
│   │   ├── Wordmark.svg
│   │   ├── Wordmark.tsx
│   │   ├── Iconmark.svg
│   │   └── Iconmark.tsx
│   ├── fonts/
│   │   ├── inter.css                 # generated @font-face declarations
│   │   └── inter-latin-{range}.woff2 # unicode-range shards (HIGH-09)
│   ├── manifest/
│   │   └── asset-manifest.json       # logical name → R2 content-addressed URL
│   └── index.ts                      # barrel re-export
├── scripts/
│   ├── extract-tokens.ts             # themes.ts → dark.ts/light.ts/css/json
│   ├── extract-fonts.ts              # @fontsource-variable/inter → unicode-range shards
│   ├── drift-detect.ts               # CI: compare extracted tokens against .themes-pin SHA
│   └── publish-dry-run.ts            # asserts tarball contents
├── raw/                              # not published; under .npmignore
│   ├── photos/
│   └── prompts/
├── Makefile                          # brand-assets target (manual, not CI)
└── dist/                             # build output, published
```

### 4.2 `package.json` exports map

```jsonc
{
  "name": "@capsarmory/brand",
  "version": "0.0.1-alpha.0",
  "license": "MIT",
  "files": [
    "dist/",
    "fonts/",
    "marks/",
    "tokens/",
    "manifest/",
    "README.md",
    "LICENSE",
    "CHANGELOG.md"
  ],
  "type": "module",
  "exports": {
    ".":                  { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.cjs" },
    "./tokens":           { "types": "./dist/tokens/index.d.ts", "import": "./dist/tokens/index.mjs", "require": "./dist/tokens/index.cjs" },
    "./tokens/dark":      { "types": "./dist/tokens/dark.d.ts", "import": "./dist/tokens/dark.mjs", "require": "./dist/tokens/dark.cjs" },
    "./tokens/light":     { "types": "./dist/tokens/light.d.ts", "import": "./dist/tokens/light.mjs", "require": "./dist/tokens/light.cjs" },
    "./tokens/dark.css":  "./dist/tokens/dark.css",
    "./tokens/light.css": "./dist/tokens/light.css",
    "./tokens/json":      "./dist/tokens/tokens.json",
    "./fonts/inter.css":  "./dist/fonts/inter.css",
    "./marks/Crest":      { "types": "./dist/marks/Crest.d.ts", "import": "./dist/marks/Crest.mjs", "require": "./dist/marks/Crest.cjs" },
    "./marks/Wordmark":   { "types": "./dist/marks/Wordmark.d.ts", "import": "./dist/marks/Wordmark.mjs", "require": "./dist/marks/Wordmark.cjs" },
    "./marks/Iconmark":   { "types": "./dist/marks/Iconmark.d.ts", "import": "./dist/marks/Iconmark.mjs", "require": "./dist/marks/Iconmark.cjs" },
    "./marks/*.svg":      "./dist/marks/*.svg",
    "./manifest":         "./dist/manifest/asset-manifest.json"
  },
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true }
  },
  "devDependencies": {
    "@fontsource-variable/inter": "5.1.0",
    "tsup": "8.3.0",
    "@changesets/cli": "2.27.9",
    "svgo": "3.3.2",
    "fonttools-py-shim": "0.1.0"
  }
}
```

### 4.3 Build pipeline (tsup, dual ESM + CJS)

`tsup.config.ts` emits:

| Entry | ESM | CJS | `.d.ts` | Note |
|---|---|---|---|---|
| `src/index.ts` | yes | yes | yes | barrel — re-exports tokens + marks |
| `src/tokens/dark.ts` | yes | yes | yes | object literal of dark palette |
| `src/tokens/light.ts` | yes | yes | yes | object literal of light palette |
| `src/marks/*.tsx` | yes | yes | yes | React optional via peerDep |
| `src/tokens/*.css` | copy | copy | n/a | passthrough |
| `src/fonts/*.{css,woff2}` | copy | copy | n/a | passthrough |
| `src/marks/*.svg` | copy | copy | n/a | passthrough |
| `src/manifest/asset-manifest.json` | copy | copy | n/a | passthrough |

Dual-build is mandatory: Next.js 16 App Router consumes ESM; caps-armory-app's Metro bundler still hits CJS resolution on JSON-token paths in some toolchains. R-P1a-11 (RPN 30) is mitigated by per-consumer smoke jobs in CI (§ 10).

## 5. Tokens

### 5.1 Canonical source

`caps-armory-app/constants/themes.ts` is the canonical source of token values. The brand package never authors token literals directly; it extracts them.

### 5.2 Derivation

`scripts/extract-tokens.ts` runs at build time and on the CI drift-check step:

1. Read `caps-armory-app/constants/themes.ts` via GitHub Contents API (read-only PAT on bot account `lumina-drift-bot`, secret name `THEMES_DRIFT_PAT`).
2. Parse the `DarkColors` and `LightColors` exports as TypeScript AST (ts-morph). Reject non-literal values (e.g., spread, computed) — this is a brand-purity invariant.
3. Emit four artifacts per theme:
   - `src/tokens/{dark,light}.ts` — typed object literal `export const DarkPalette = {...} as const;`
   - `src/tokens/{dark,light}.css` — CSS custom properties wrapped in `:root` or `.theme-light`
   - `src/tokens/tokens.json` — single JSON for non-JS consumers
   - `src/tokens/index.ts` — barrel that re-exports both
4. Hash the resulting JSON; compare against the SHA recorded in `.themes-pin`.
5. If hash differs, fail the build with a diff and instructions to update `.themes-pin` via Captain-reviewed PR.

### 5.3 Schema

The token surface mirrors the `ThemeColors` interface in themes.ts exactly. No renames, no additions. Token names below match keys of `DarkColors` / `LightColors`:

| Group | Tokens |
|---|---|
| Surface | `background`, `surface`, `surfaceElevated`, `border` |
| Brand accent | `gold`, `goldLight`, `olive`, `oliveLight`, `oliveMuted` |
| Neutrals | `white`, `black`, `darkGrey` |
| Text | `textPrimary`, `textSecondary`, `textMuted` |
| Semantic | `success`, `warning`, `danger`, `info`, `cancelled` |

CSS custom property names use `--color-{kebab-case}`: `gold` → `--color-gold`; `surfaceElevated` → `--color-surface-elevated`; `textPrimary` → `--color-text-primary`; etc.

### 5.4 Drift detector (CI gate)

`.github/workflows/ci.yml` runs `pnpm run drift-check` on every push and PR:

1. Pull `caps-armory-app/constants/themes.ts` at the SHA recorded in `.themes-pin`.
2. Pull the file again at `main`.
3. Diff. If the file changed at `main` but `.themes-pin` was not updated in this PR, fail with a structured error pointing at exactly which token diverged.
4. Captain reviews any `.themes-pin` bump; bumps require a parallel changeset entry describing the token impact.

Maps to R-P1a-03 (RPN 80, mandatory).

### 5.5 Token consumer flow (capsarmory-www example)

`caps-armory-www/src/app/globals.css` after P1a:

```css
@import "tailwindcss";
@import "@capsarmory/brand/tokens/dark.css";
@import "@capsarmory/brand/fonts/inter.css";

@theme {
  --color-bg: var(--color-background);
  --color-surface: var(--color-surface);
  --color-surface-elevated: var(--color-surface-elevated);
  --color-border-default: var(--color-border);
  --color-gold: var(--color-gold);
  /* ...all surface + brand + text tokens re-exposed under Tailwind 4 @theme block... */
  --font-sans: "Inter Variable", system-ui, sans-serif;
}

html, body {
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

The hand-typed hex literals currently in `globals.css` lines 6-17 are replaced by `var(--color-*)` references resolving to package-shipped values.

## 6. Components (Marks)

### 6.1 Surface

Three vector marks ship as SVG primitives with optional TSX React wrappers. The TSX wrappers re-export the SVG with type-safe props and a forwarded ref. React is an **optional** peer dependency; non-React consumers import the `.svg` path directly.

| Mark | Use case | Aspect ratio | viewBox |
|---|---|---|---|
| `Crest` | Hero stamp, footer seal | square (1:1) | `0 0 256 256` |
| `Wordmark` | Header logo, marketing pages | wide (4:1) | `0 0 1024 256` |
| `Iconmark` | Favicon, app icon source, dock badge | square (1:1) | `0 0 64 64` |

### 6.2 Contract (R-P1a-10, RPN 48)

Every mark file MUST satisfy a 3-part invariant, asserted by a vitest contract test:

1. **No inline `style=` attribute on the SVG root.** Color is controlled exclusively via `fill="currentColor"` + `stroke="currentColor"`.
2. **Zero hex literal colors anywhere in the SVG body.** All `fill` and `stroke` attributes resolve to `currentColor`, `none`, or `transparent`.
3. **`fill="currentColor"` is set on the root `<svg>` element AND on every painted child path/shape.** This guarantees the mark inherits color from the surrounding text-color context regardless of how the consumer mounts it.

### 6.3 TSX wrapper shape

```tsx
import { forwardRef, type SVGProps } from "react";

export interface CrestProps extends SVGProps<SVGSVGElement> {
  title?: string;          // a11y — rendered as <title> if provided
  decorative?: boolean;    // when true, role="presentation" + aria-hidden
}

export const Crest = forwardRef<SVGSVGElement, CrestProps>(function Crest(
  { title, decorative = false, ...rest },
  ref
) { /* ... */ });
```

Same shape for `Wordmark` and `Iconmark`.

### 6.4 a11y

- When `title` prop is provided, render `<title>{title}</title>` as first child.
- When `decorative=true`, the consumer is asserting the mark adds no semantic content; the wrapper sets `role="presentation"` and `aria-hidden="true"`.
- Default (`decorative=false`, no `title`) renders no role; consumer is expected to provide accessible labeling via `aria-label` on a wrapping link/button.

## 7. Asset Pipeline

### 7.1 Three asset classes, three handling rules

| Class | Bundled in tarball? | Where it lives | Updated by |
|---|---|---|---|
| Vector marks (Crest / Wordmark / Iconmark) | Yes — tiny, version-coupled, brand-critical | `dist/marks/` | source SVG in repo |
| Hero video (60-second cinematic loop) | No — too large, would balloon every install | Cloudflare R2 | `make brand-assets` |
| AI photo library (12 photos × multiple sizes) | No — same reason | Cloudflare R2 | `make brand-assets` |

### 7.2 R2 hosting and content-addressed paths (Q-CDN-1, Q-CDN-2)

- **Bucket:** `capsarmory-brand-assets` on Cloudflare R2.
- **Public origin:** `https://assets.capsarmory.com/` (Cloudflare Worker fronts R2, applies `Cache-Control: public, max-age=31536000, immutable`).
- **Path shape:** `assets/{content-hash}/{filename}` — flat, content-addressed, immutable. (Replaces v1's `v{semver}/{hash}/...` per HIGH-07.)
- `{content-hash}` = lowercase hex SHA-256 of the file bytes (first 16 chars sufficient for namespacing — `1.2 × 10^19` keyspace).
- `{filename}` carries the human-readable name + extension (e.g., `hero-tactical-60s.mp4`).
- Cache hit rate stays high across patch bumps because path is decoupled from semver.

### 7.3 Manifest binding

`dist/manifest/asset-manifest.json` is shipped inside the npm tarball and is the consumer's only entrypoint into the asset library:

```jsonc
{
  "schemaVersion": "1.0.0",
  "brandVersion": "0.0.1-alpha.0",
  "assets": {
    "hero/tactical-60s.mp4":  "https://assets.capsarmory.com/assets/a1b2c3d4e5f6a7b8/hero-tactical-60s.mp4",
    "hero/tactical-60s.webm": "https://assets.capsarmory.com/assets/9f8e7d6c5b4a3210/hero-tactical-60s.webm",
    "hero/tactical-poster.jpg": "https://assets.capsarmory.com/assets/0011223344556677/hero-tactical-poster.jpg",
    "photos/product/01.webp":   "https://assets.capsarmory.com/assets/.../product-01.webp",
    "photos/lifestyle/01.webp": "https://assets.capsarmory.com/assets/.../lifestyle-01.webp",
    "photos/location/01.webp":  "https://assets.capsarmory.com/assets/.../location-01.webp"
    /* 12 total photos */
  }
}
```

Logical paths use the slash-namespaced form `class/name.ext`. Consumers fetch logical-name → URL via a typed helper:

```ts
import manifest from "@capsarmory/brand/manifest";
import { resolveAsset } from "@capsarmory/brand";
const heroMp4 = resolveAsset("hero/tactical-60s.mp4");
```

### 7.4 Hero video pipeline (Veo)

1. Captain runs `make brand-assets PROMPTS=hero` after Q7=D aesthetic lock.
2. `scripts/render-hero.ts` invokes Veo with 5 candidate prompts; outputs to `raw/hero/`.
3. Captain reviews; picks one; locks via interactive prompt.
4. `ffmpeg` encodes:
   - `hero-tactical-60s.mp4` — h.265 (`hevc_videotoolbox`) at 1280×720 @ 24 fps, target ≤ 3.5 MB.
   - `hero-tactical-60s.webm` — VP9, same resolution, target ≤ 4 MB (fallback for h.265-incapable browsers).
   - `hero-tactical-poster.jpg` — frame at 0:00:01 for `<video poster>`.
5. Each file is SHA-256-hashed; uploaded to R2 at `assets/{hash}/{filename}`; URL recorded in `asset-manifest.json`.
6. Total transferred bytes (largest path: mp4 + poster) ≤ 4 MB — satisfies parent P1-AC-05.

Maps to R-P1a-01 (RPN 126, mandatory) — 5 candidate prompts + Captain lock + Phase-0 placeholder hero remains valid fallback.

### 7.5 AI photo pipeline (gemini-image + automated pre-filter)

1. Captain runs `make brand-assets PROMPTS=photos`. Generates 12 photos in 3 classes (4 product / 4 lifestyle / 4 location).
2. **Automated pre-filter** (R-P1a-08, MED-02 fix, RPN dropped 128 → 64):
   - **OCR** via Tesseract.js: rejects any image where detected text confidence > 0.6 (catches stray brand text, signs).
   - **Face detection** via face-api.js: rejects any image containing a recognizable face (privacy).
   - **Logo template-match** via OpenCV.js: rejects matches against a known-logo bank (Glock, S&W, Sig, Nike, etc.).
3. Rejections are logged to `raw/photos/rejected/{reason}/`. Captain reviews rejection log; can override only by adding image to `raw/photos/manual-accept.allowlist`.
4. Approved photos are encoded to AVIF + WebP at three widths (640 / 1280 / 1920) using `sharp`.
5. Each output file is SHA-256-hashed; uploaded to R2; URL recorded in manifest.

ML model weights (Tesseract, face-api, OpenCV) are cached in CI via `actions/cache@v4` keyed on tool version. The `make brand-assets` target is **never** invoked by `npm run build` or `npm test` (MED-05 fix). CI invokes it only when `raw/photos/` or `prompts/` change.

### 7.6 Asset license (Q-5-1 v3)

- **Package code (tokens, marks, scripts, manifest, fonts CSS):** MIT.
- **R2-hosted marketing assets (hero video, AI photo library):** **Separate license**, drafted by NemoClaw on Day 1 of P1a. License intent: free use by Lumeria-family brands (DutyKits, BM-Maligator, Lumina28); restricted commercial reuse by unrelated parties. License text shipped at `https://assets.capsarmory.com/LICENSE.txt` and referenced from package README.

Maps to R-P1a-14 (RPN 60).

## 8. Font Strategy (Q4=C)

### 8.1 Decision summary

Brand package ships **precompiled `@font-face` CSS** for Inter Variable. Self-hosted woff2 files emitted into `dist/fonts/`. Consumers import the CSS file; no `next/font` wrapping. This sacrifices `next/font`'s automatic preload and subset analysis in exchange for cross-platform portability (works in caps-armory-app's React Native context where `next/font` is not available) and consumer simplicity.

### 8.2 Cross-platform implication

The brand package's font strategy must work in **both** web (Next.js 16, capsarmory-www and caps-armory-portal) and React Native (caps-armory-app via Expo's `expo-font` loader). Precompiled `@font-face` CSS is web-only; the package therefore ships **both**:

- `dist/fonts/inter.css` + woff2 shards → web consumers.
- `dist/fonts/manifest.json` (axis, weight range, font-family name, asset URLs) → RN consumers consume via Expo's `useFonts` hook, fetching woff2 files from the package's own `dist/fonts/` path or from the R2 mirror.

RN consumers wire fonts in their own root via `expo-font`; the brand package does not attempt to do that wiring.

### 8.3 Variable font extraction by unicode-range (HIGH-09, R-P1a-20, RPN 90, mandatory)

Variable fonts subset by **unicode-range**, not by weight. Shipping weight-shard files (`inter-latin-400.woff2`, `500`, `600`, `700`) and declaring `font-weight: 100 900` is internally inconsistent — applying a `wght` axis to a static 400 file synthesizes bold/italic and produces poor typography.

The extraction script (`scripts/extract-fonts.ts`) MUST:

1. Pull from `@fontsource-variable/inter`'s actual variable woff2 files (one per unicode-range), e.g.:
   - `inter-latin-wght-normal.woff2` (basic Latin)
   - `inter-latin-ext-wght-normal.woff2` (Latin Extended)
   - `inter-cyrillic-wght-normal.woff2`
   - `inter-cyrillic-ext-wght-normal.woff2`
   - `inter-greek-wght-normal.woff2`
   - `inter-greek-ext-wght-normal.woff2`
   - `inter-vietnamese-wght-normal.woff2`
2. Copy them verbatim into `dist/fonts/` preserving the unicode-range association.
3. Emit `dist/fonts/inter.css` with **one `@font-face` block per unicode-range**, each declaring `font-weight: 100 900` (the full Inter Variable wght axis), `font-style: normal`, `font-display: swap`, and `unicode-range: U+...` matching the shard.

**Invariant test** (vitest, blocks publish): for every distinct `unicode-range` declared in `dist/fonts/inter.css`, exactly one woff2 file exists under `dist/fonts/`. The test parses the CSS, groups `@font-face` blocks by unicode-range, and asserts cardinality.

### 8.4 Emitted CSS shape

```css
/* dist/fonts/inter.css — schematic */
@font-face {
  font-family: "Inter Variable";
  src: url("./inter-latin-wght-normal.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, /* ...basic Latin... */;
}
@font-face {
  font-family: "Inter Variable";
  src: url("./inter-latin-ext-wght-normal.woff2") format("woff2-variations");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
  unicode-range: U+0100-024F, U+1E00-1EFF, /* ...Latin Extended... */;
}
/* ... one block per unicode-range, normal axis ... */
/* If italic is needed in v1.0, add parallel font-style: italic blocks with -italic.woff2 sources. */
```

Suggestions from council v3:
- `format("woff2-variations")` is the correct declaration for variable fonts; `format("woff2")` is acceptable as a fallback hint if older Safari versions require it (incorporated as a comma-separated `format()` list when extraction confirms support matrix).
- `@fontsource-variable/inter` is `devDependencies`-only — consumers receive emitted CSS + woff2 files, not the source package.

### 8.5 Preload strategy — manual `<link rel="preload">` REJECTED (HIGH-08, R-P1a-19, RPN 80, mandatory)

Documented option to add `<link rel="preload" href="/_next/static/media/inter-latin-400.woff2">` is **REJECTED**. Reason: Next.js Webpack/Turbopack appends content hashes to copied font files (`inter-latin-400.[hash].woff2`); a hardcoded href returns 404 in production, causing the very font flash it tries to prevent.

**Decision:** rely on `font-display: swap`. Inter is a tightly fallback-matched typeface to `system-ui`/`sans-serif`, and Inter's woff2 shards are small (15-30 KB each, gzipped) — the swap window is short.

**Benchmark plan** (executed in P1a Week 1 before the package locks):

1. Build the holding page (P0 is already shipped at capsarmory.com) on a branch wired to a published `0.0.1-alpha.0` of `@capsarmory/brand`.
2. Capture three Lighthouse mobile runs against the live preview deployment with package-served fonts + `font-display: swap` + no manual preload:
   - LCP (target ≤ 2.5 s, parent P0-AC-02 requires Performance ≥ 90).
   - CLS (target ≤ 0.1).
   - Total Blocking Time.
3. Compare against three runs on the current `@fontsource-variable/inter/wght.css` baseline.
4. If `font-display: swap` causes a measurable LCP regression > 200 ms or pushes Lighthouse Performance below 90, escalate to council and consider the documented alternative: consumer uses `next/font/local` pointing at `node_modules/@capsarmory/brand/fonts/` to restore Next.js's automatic hashing + preloading.

Benchmark results and decision recorded in CAPA log before package locks at `1.0.0`.

## 9. Publishing

### 9.1 Registry and licensing

- **Registry:** npmjs.com (public). Scope `@capsarmory` confirmed available on Day 0 (`npm view @capsarmory` returns 404); fallback `@capsarmoryllc` reserved. All consumer imports use a scope token (`@SCOPE@`) for trivial find-and-replace if scope must be renamed (R-P1a-02, RPN 21).
- **License:** MIT for the package. Asset license per § 7.6.

### 9.2 OIDC trusted publishing + sigstore provenance

- npm "Trusted Publisher" configuration binds the `caps-armory-brand` GitHub repo's `release` environment to publish under the `@capsarmory/brand` package name via OIDC.
- GitHub Actions workflow requests `id-token: write`; `npm publish --provenance` attaches a sigstore attestation.
- No `NPM_TOKEN` secret stored anywhere — publish capability lives entirely in the OIDC trust relationship.

Maps to R-P1a-06 (RPN 20).

### 9.3 Tarball whitelist (R-P1a-07, RPN 36)

`package.json`'s `files` field is an explicit whitelist (§ 4.2). CI runs `pnpm pack --dry-run` and asserts:

1. Tarball file count matches a recorded baseline (drift fails the build with a diff).
2. No file path matches `**/raw/**`, `**/*.map`, `**/.env*`, `**/secrets*`, `**/__tests__/**`.
3. Total tarball size ≤ 2 MB (sanity bound — assets are off-package; only marks + tokens + fonts ship).

Mitigates leakage of sourcemaps, env, prompt history, raw AI outputs.

### 9.4 Changesets + semver discipline

- `@changesets/cli` manages versions and CHANGELOG generation.
- Every PR that mutates published surface MUST include a changeset.
- **Token rename = major bump even in 0.x** (R-P1a-15, RPN 96, mandatory). The changeset bot's `type: "major" | "minor" | "patch"` selector is documented in CONTRIBUTING.md.
- Alpha versions publish with `--tag alpha` and **never** to the `latest` dist-tag (R-P1a-12, RPN 54). The publish workflow asserts the tag explicitly.

### 9.5 Day-1 alpha publish

`0.0.1-alpha.0` ships on Day 1 of P1a Week 1 with:

- Token surface fully extracted from `themes.ts` (drift detector live).
- Marks shipped as **placeholder SVGs** (text-only "CAPS Armory" wordmark, stripped-down crest); contract test still asserts the 3-part invariant.
- Font CSS + unicode-range woff2 shards shipped (production-ready).
- Asset manifest empty (`assets: {}`); hero + photos arrive in subsequent alphas.

This unblocks capsarmory-www and caps-armory-portal to wire the import path immediately while final marks and hero+photos finish production in Weeks 1-3.

## 10. Testing

### 10.1 Six layers (per brainstorm § 6)

| Layer | What it asserts | Tool | Gate |
|---|---|---|---|
| Unit — token shape | Extracted dark/light objects have exactly the 20 `ThemeColors` keys; values are 6- or 8-digit hex literals | vitest | Pre-publish |
| Unit — mark contract | The 3-part SVG invariant (no `style=`, no hex, `fill="currentColor"` on root + paint paths) | vitest + happy-dom | Pre-publish |
| Unit — font invariant | One woff2 per unicode-range in `dist/fonts/`; `font-display: swap` present on every block | vitest | Pre-publish (HIGH-09) |
| Drift check | Extracted tokens hash matches `.themes-pin`; any divergence fails with a diff | `scripts/drift-detect.ts` | CI on every push |
| Contract — WCAG | Every dark-mode text/background pair (`textPrimary` on `background`, `textSecondary` on `surface`, etc.) meets WCAG AA 4.5:1 | vitest + `wcag-contrast` | Pre-publish (R-P1a-04) |
| Smoke — consumer | Build the package, install into a throwaway Next.js 16 App Router project and a throwaway RN/Expo project, import every export, assert no resolution errors | GitHub Actions matrix | Publish-blocking (R-P1a-11) |

### 10.2 New CI smoke jobs

`.github/workflows/ci.yml` includes a job matrix:

| Job | Consumer | Asserts |
|---|---|---|
| `smoke-nextjs-app` | scratch Next.js 16 App Router project | `@capsarmory/brand`, `/tokens/dark`, `/tokens/dark.css`, `/fonts/inter.css`, `/marks/Crest` all import cleanly; `next build` succeeds |
| `smoke-rn-expo` | scratch Expo SDK project | `@capsarmory/brand/tokens/json` parses; `manifest` resolves; Metro bundler resolution succeeds |
| `smoke-tarball` | `pnpm pack --dry-run` | Whitelist + size + forbidden-path assertions |
| `drift-check` | n/a | § 5.4 |
| `font-invariant` | n/a | § 8.3 invariant test |

### 10.3 Coverage targets (LUBS Gate 4)

Package code (extraction scripts, drift detector, TSX wrappers, helper `resolveAsset`) must hit **≥ 95% statement / ≥ 90% branch** coverage. Generated artifacts (raw `dist/` output) are excluded from coverage instrumentation.

### 10.4 Manual review checklist (Captain)

For each alpha, Captain runs `pnpm preview` to render a localhost page that displays:

- All three marks in dark and light contexts.
- A swatch grid of every token in both palettes.
- A type specimen at 4 sizes against both backgrounds.
- The hero `<video>` playing from R2.

Manual sign-off is logged to FM-009 (job traveler).

## 11. Acceptance Criteria

### 11.1 Inherited from parent spec § 8

These are restated verbatim from `docs/superpowers/specs/2026-05-07-capsarmory-www-design.md`. P1a fully satisfies P1-AC-03 and P1-AC-04. P1a partially satisfies P1-AC-05 (delivers the encoded video + manifest; the embedding on `/` is in capsarmory-www's P1 follow-up). P1a fully delivers the asset catalog for P1-AC-06.

| ID | Criterion |
|----|-----------|
| P1-AC-03 | Brand tokens (color, type, spacing) are defined in a shared package importable by capsarmory-www and caps-armory-portal. |
| P1-AC-04 | Wordmark and iconmark exist as SVG assets in `/public/brand/` and render correctly in both dark and light mode. (P1a substitutes the path `@capsarmory/brand/marks/*` for `/public/brand/`; equivalence is the deliverable that consumers can render both marks correctly in both modes.) |
| P1-AC-05 | 60s cinematic hero loop plays on `/`; total transferred bytes for the loop ≤ 4 MB on a mobile connection (h.265 + VP9 fallback). |
| P1-AC-06 | At least 12 AI-generated brand photos are catalogued and used across pages with `next/image` optimization. |

### 11.2 P1a-specific

| ID | Criterion |
|----|-----------|
| P1a-AC-01 | `@capsarmory/brand@0.0.1-alpha.0` publishes to npmjs.com with sigstore provenance attestation visible on the npm package page; alpha publishes under `--tag alpha`, never `latest`. |
| P1a-AC-02 | Token extraction reproduces `caps-armory-app/constants/themes.ts` exactly (20 keys × dark + light); drift detector fails CI if the extracted hash does not match `.themes-pin`. |
| P1a-AC-03 | Tokens are importable from **all four** entrypoints (`/tokens/dark`, `/tokens/light`, `/tokens/dark.css`, `/tokens/json`); ESM and CJS consumers both resolve `/tokens/dark` without bundler errors. |
| P1a-AC-04 | The three marks (Crest, Wordmark, Iconmark) ship as SVG + TSX; the 3-part SVG contract test passes for every mark. |
| P1a-AC-05 | Replacing `caps-armory-www/src/app/globals.css` lines 2 and 4-17 with `@import "@capsarmory/brand/tokens/dark.css"` + `@import "@capsarmory/brand/fonts/inter.css"` yields a `next build` that succeeds and a rendered page visually identical to P0 (pixel-diff threshold ≤ 0.5%). |
| P1a-AC-06 | `dist/fonts/inter.css` declares one `@font-face` block per unicode-range; for every distinct unicode-range, exactly one woff2 file exists under `dist/fonts/`; vitest invariant asserts this. |
| P1a-AC-07 | No manual `<link rel="preload">` is required or documented in the package README; reliance on `font-display: swap` is benchmarked and Lighthouse Performance remains ≥ 90 on the holding page mobile run. |
| P1a-AC-08 | Hero video deliverable: `hero-tactical-60s.mp4` (h.265, ≤ 3.5 MB) + `hero-tactical-60s.webm` (VP9, ≤ 4 MB) + poster JPG exist on R2 at `assets/{content-hash}/{filename}`; manifest binds logical names to URLs; total bytes for the chosen path ≤ 4 MB. |
| P1a-AC-09 | 12 AI photos (4 product / 4 lifestyle / 4 location) exist on R2 in AVIF + WebP at 640/1280/1920 widths; every photo passed the automated OCR + face + logo pre-filter; manifest lists all 36 image variants. |
| P1a-AC-10 | `pnpm pack --dry-run` whitelist test passes: no `raw/`, no `.env*`, no `.map`, total tarball ≤ 2 MB. |
| P1a-AC-11 | Cross-consumer smoke jobs pass: scratch Next.js 16 App Router project and scratch Expo project both build with `@capsarmory/brand` installed and every export imported. |
| P1a-AC-12 | WCAG contrast: every text/surface token pair in DarkPalette and LightPalette satisfies AA 4.5:1 (normal text) or 3:1 (large text); violations block release. |
| P1a-AC-13 | Token rename in any PR triggers a changeset of type `major`; CI fails the PR if a token name diverges between `themes.ts` and the extracted output without an accompanying major-tagged changeset. |
| P1a-AC-14 | Asset license text exists at `https://assets.capsarmory.com/LICENSE.txt`, is referenced from package README, and has been reviewed by NemoClaw before `1.0.0`. |

## 12. RTM (Requirements Traceability Matrix)

Test IDs follow the convention `T-P1a-NN`. One row per AC; columns map each AC to its test(s), FMEA risk(s), and verification method.

| AC ID | Criterion (abbrev) | Test ID(s) | FMEA Risk(s) | Verification Method |
|---|---|---|---|---|
| P1-AC-03 | Shared brand package importable | T-P1a-01, T-P1a-02, T-P1a-22 | R-P1a-02, R-P1a-11 | Smoke jobs: Next.js + Expo import + build |
| P1-AC-04 | Wordmark + iconmark render dark/light | T-P1a-08, T-P1a-09 | R-P1a-10 | Mark contract test + visual diff Captain review |
| P1-AC-05 | 60s hero, ≤ 4 MB, h.265 + VP9 | T-P1a-15 | R-P1a-01, R-P1a-05 | ffmpeg report + R2 manifest assertion + bandwidth budget test |
| P1-AC-06 | ≥ 12 AI photos catalogued | T-P1a-16, T-P1a-17 | R-P1a-08, R-P1a-13 | Manifest count + pre-filter rejection log review |
| P1a-AC-01 | Alpha publish with provenance | T-P1a-20, T-P1a-21 | R-P1a-06, R-P1a-12 | npm package page check + dist-tag assertion |
| P1a-AC-02 | Token extraction matches themes.ts | T-P1a-03 | R-P1a-03 | Drift detector run on `main` head |
| P1a-AC-03 | Tokens importable from all four entrypoints | T-P1a-01, T-P1a-04 | R-P1a-11 | ESM + CJS dual-build smoke tests |
| P1a-AC-04 | 3-part SVG contract per mark | T-P1a-08 | R-P1a-10 | vitest contract: no inline style, no hex, currentColor everywhere |
| P1a-AC-05 | globals.css replacement compiles, pixel-equal | T-P1a-22 | R-P1a-11 | scratch Next.js build + Playwright pixel diff vs P0 baseline |
| P1a-AC-06 | One woff2 per unicode-range | T-P1a-10 | R-P1a-20 | vitest invariant: parse @font-face blocks, group by unicode-range, assert cardinality |
| P1a-AC-07 | No manual preload, Lighthouse Perf ≥ 90 | T-P1a-11 | R-P1a-19 | Lighthouse benchmark vs baseline, recorded in CAPA |
| P1a-AC-08 | Hero on R2, ≤ 4 MB | T-P1a-15 | R-P1a-01, R-P1a-05 | ffmpeg encoded bytes + manifest URL HEAD check |
| P1a-AC-09 | 12 photos × 6 variants pre-filtered | T-P1a-16, T-P1a-17 | R-P1a-08 | OCR/face/logo report + manifest count |
| P1a-AC-10 | Tarball whitelist | T-P1a-18 | R-P1a-07 | `pnpm pack --dry-run` assertions |
| P1a-AC-11 | Cross-consumer smoke jobs | T-P1a-22, T-P1a-23 | R-P1a-11 | Next.js + Expo install + build in CI matrix |
| P1a-AC-12 | WCAG AA contrast on every pair | T-P1a-13 | R-P1a-04 | vitest + `wcag-contrast` library |
| P1a-AC-13 | Token rename = major changeset | T-P1a-05 | R-P1a-15 | CI changeset-type gate |
| P1a-AC-14 | Asset license reviewed by NemoClaw | n/a (manual) | R-P1a-09, R-P1a-14 | NemoClaw legal pass logged before 1.0.0 |

Drift detector (T-P1a-03), tarball whitelist (T-P1a-18), font invariant (T-P1a-10), and contrast suite (T-P1a-13) are publish-blocking. All other tests run pre-publish and must pass for `pnpm publish` to proceed; the publish workflow's `pre-publish` step runs `pnpm test && pnpm test:smoke && pnpm test:tarball` and aborts on first failure.

## 13. Risks

Full register: `docs/superpowers/fmea/2026-05-12-p1a-brand-package-fmea.md`. The six mandatory mitigations (RPN ≥ 80) are inline below; lower-RPN risks are addressed by the test layers and CI gates referenced above.

| ID | RPN | Risk | Mandatory mitigation in this spec |
|---|---|---|---|
| R-P1a-01 | 126 | Veo hero fails to converge on tactical aesthetic | § 7.4 — 5 candidate prompts + Captain lock + Phase-0 placeholder hero retained as indefinite fallback |
| R-P1a-15 | 96 | Silent breaking token change in 0.x minor | § 9.4 — token rename = major even in 0.x; exact-version pin in consumers; CHANGELOG required per release |
| R-P1a-20 | 90 | Variable font shipped as weight shards | § 8.3 — extraction by unicode-range only; vitest invariant asserts one woff2 per range |
| R-P1a-13 | 84 | CI asset regeneration creates drift | § 7.5 — assets committed (not regenerated in CI); `make brand-assets` is human-action only; ML weights cached |
| R-P1a-03 | 80 | themes.ts mutated mid-P1a; drift detector fails | § 5.4 — `.themes-pin` SHA file; pin bumps require Captain-reviewed PR + changeset |
| R-P1a-19 | 80 | next/font preload hardcoded href 404s after Next.js asset-hash rename | § 8.5 — manual preload rejected; rely on `font-display: swap`; benchmark before lock |

R-P1a-08 (RPN 64) — AI photo content risk — is mitigated by the automated OCR + face + logo pre-filter pipeline in § 7.5; rejection log review is Captain's responsibility per FM-009.

R-P1a-16 (RPN 56) — PAT compromise — is mitigated per the v3 brainstorm text: PAT on dedicated bot account `lumina-drift-bot`, scoped Contents:Read on caps-armory-app entire repo (file-scope unavailable per Fine-Grained PAT spec), 90-day rotation in Captain's calendar, inversion-path fallback documented (app pushes tokens mirror; brand reads mirror) for CAPA log as v1.0 candidate simplification.

R-P1a-17 (RPN 48) — R2 egress overrun — is mitigated per § 7.2: Worker fronts R2 with `Cache-Control: immutable`; content-addressed paths maximize cache hit rate; Cloudflare bill alarm at $50/mo.

R-P1a-09 (RPN 30) — Inter license — Inter is SIL OFL 1.1 (permits commercial + embedding + bundling). NemoClaw legal pass scheduled before `1.0.0`.

## 14. Schedule

| Window | Deliverable | Gate |
|---|---|---|
| Day 0 | Repo scaffold, `npm view @capsarmory` reservation, `lumina-drift-bot` GitHub bot account + PAT issuance, NemoClaw asset license drafting kicks off | — |
| Day 1 | `0.0.1-alpha.0` published: tokens + drift detector + font woff2 + placeholder marks + empty asset manifest; capsarmory-www and caps-armory-portal wire the import immediately | Captain sign-off on FM-009 |
| Week 1 | Final Crest / Wordmark / Iconmark SVGs land; font-display benchmark run on holding page; WCAG contrast suite passes; tarball whitelist + smoke matrix green; `0.0.2-alpha.0` publishes with production marks | Gate 4 coverage + Gate 5 FAI |
| Week 2 | AI photo production sprint: 12 photos × 3 widths × 2 formats; OCR/face/logo pre-filter exercised; manifest populated with photo URLs; `0.0.3-alpha.0` | Captain rejection-log review |
| Week 3 | Veo hero production: 5 candidate prompts → Captain lock → encode (h.265 + VP9 + poster) → R2 upload; manifest populated with hero URLs; `0.0.4-alpha.0` | Bandwidth budget test |
| End of Week 3 | NemoClaw asset license review complete; `1.0.0` candidate cut; council review (Gate 6); release (Gate 7) | Council ≥ 8.0, CAPA clear |

Schedule is decoupled from capsarmory-www's P1 page-build sprint — both can run in parallel from Day 1 because the alpha unblocks the import wiring.

## 15. Open Questions

| ID | Question | Owner | Resolution path |
|---|---|---|---|
| OQ-01 | Final exact text of the asset license (Q-5-1) — wording for sister-brand permitted use vs commercial restriction | NemoClaw | Day-1 draft → Captain review → publish at assets.capsarmory.com/LICENSE.txt before `1.0.0` |
| OQ-02 | Wordmark typography lock-up (geometric sans variant of Inter, or a separate display face?) — affects Wordmark SVG outlines | Captain + BRD-001 (advisory) | Resolve in Week 1 mark production before `0.0.2-alpha.0` |
| OQ-03 | Phone number / FFL # / address baked into static portions of marketing assets — any? | Captain | If yes, those go on R2 with a separate license note; if no, marks stay text-of-business-only |
| OQ-04 | Whether to also subset Inter to a `latin-only` build for capsarmory-www specifically (cuts ~60 KB but breaks RN consumer parity) | DEV-001 + Captain | Decide before `1.0.0` based on benchmark from § 8.5 |
| OQ-05 | Sister-brand consumption path — does Lumina28 / BM-Maligator consume `@capsarmory/brand` directly, or does each brand fork the same shape under its own scope? | Captain | Defer to post-P1a; affects only the README guidance, not the package surface |
| OQ-06 | Inversion-path activation criterion (R-P1a-16) — what PAT-rotation overhead threshold flips us to "caps-armory-app publishes tokens mirror"? | DEV-001 + SEC-001 | Log to CAPA at `1.0.0`; revisit at 6-month checkpoint |
