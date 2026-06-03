# FMEA — P1a `@capsarmory/brand` Package (v3 — post-council)

**Date:** 2026-05-12
**Gate:** 0 (Risk Analysis)
**Owner:** Captain (山本竜平)
**Brainstorm version:** v3 (council-approved 8.25/10)
**Council artifact:** `docs/superpowers/council/2026-05-12-p1a-brand-pre-spec-council-v3.md`
**Method:** Severity × Occurrence × Detection on a 1–10 scale. RPN > 100 = mandatory mitigation.

---

## 1. Risk Register

| ID | Failure Mode | Effect | S | O | D | RPN | Mitigation | Owner |
|----|---|---|---|---|---|---|---|---|
| **R-P1a-01** | Veo hero loop fails to converge on acceptable tactical aesthetic | Asset slips → P1b unblock delayed | 6 | 7 | 3 | 126 | 5 candidate prompts; Captain lock before encoding budget; Phase-0 placeholder hero remains valid fallback | Captain |
| **R-P1a-02** | `@capsarmory` npm scope already claimed | Rename forces import refactor across capsarmory-www + portal | 7 | 3 | 1 | 21 | Day-0 `npm view @capsarmory && npm view @caps-armory`; fallback `@capsarmoryllc`; all imports use scope token (`@SCOPE@`) for trivial find-and-replace | Captain |
| **R-P1a-03** | `caps-armory-app/constants/themes.ts` mutated mid-P1a; drift detector fails every CI build | CI stuck red; pressure to disable gate; silent divergence reintroduced | 8 | 5 | 2 | 80 | Snapshot-pin themes.ts SHA at kickoff via `.themes-pin` file; pin updates require explicit Captain-reviewed PR | DEV-001 |
| **R-P1a-04** | themes.ts colors miss WCAG AA contrast (4.5:1) at scale | A11y test fails; release blocked | 7 | 3 | 2 | 42 | Run contrast matrix on full token surface in spec phase; raise to BRD-001 if violations found | DEV-001 |
| **R-P1a-05** | Hero video exceeds 4 MB after encoding | P1-AC-05 fails | 5 | 4 | 1 | 20 | 1280×720 @ 24 fps `hevc_videotoolbox`; budget test fails fast in CI; fallback shorten to 45 s | DEV-001 |
| **R-P1a-06** | Provenance attestation fails to publish | P1a-AC-01 fails | 4 | 5 | 1 | 20 | Public repo + `release` environment + `id-token: write`; dry-run gate before tag | DEV-001 |
| **R-P1a-07** | npm publish leaks private artifact (sourcemaps, .env, internal docs) | Confidential leak in public package | 9 | 2 | 2 | 36 | `files` whitelist (`dist/`, `marks/`, `tokens/`, `fonts/`, `README.md`); CI dry-run asserts file count + names | DEV-001 |
| **R-P1a-08** | gemini-image generates AI photos with faces / text / third-party logos | Privacy / IP / brand-purity breach | 8 | 4 | 2 | 64 | Automated Tesseract.js OCR + face-api.js + logo template-match pre-filter in `make brand-assets`; rejections logged; manual checklist as confirmation only | Captain + BRD-001 |
| **R-P1a-09** | Inter font license incompatible with embedding | Legal exposure | 3 | 2 | 5 | 30 | Inter = SIL OFL 1.1 — permits commercial + embedding + bundling; NemoClaw legal pass before v1.0 | NemoClaw |
| **R-P1a-10** | Component CSS leaks `currentColor` to non-themed contexts; marks render wrong | Marks render wrong colors on portal consumer | 4 | 4 | 3 | 48 | 3-part contract test: (1) no `style=` on SVG root, (2) zero hex literals in output, (3) `fill="currentColor"` on root + all painted paths | DEV-001 |
| **R-P1a-11** | Tokens emit ESM-only; breaks Next.js or RN consumer | Build fails on import | 5 | 3 | 2 | 30 | tsup dual-build ESM + CJS; consumer-smoke-test jobs (Next.js App Router + RN Metro) in publish-blocking CI | DEV-001 |
| **R-P1a-12** | Day-1 alpha stub pulled to prod by floating range | Prod renders placeholder marks | 9 | 2 | 3 | 54 | LUBS pin-versions rule; alpha versions use `--tag alpha`, never `latest` dist-tag | DEV-001 |
| **R-P1a-13** | CI asset regeneration creates visual drift between local and CI | Visual tests fail unpredictably | 6 | 7 | 2 | 84 | Assets committed (not regenerated in CI); `make brand-assets` is human-action only | DEV-001 |
| **R-P1a-14** | License blocks legitimate sister-brand reuse | Sister brands fall back to manual copy-paste | 5 | 4 | 3 | 60 | Q-5-1 v3: package-level MIT enables sister-brand consumption; R2-hosted marks governed by separate license that permits Lumeria-family use | Captain + NemoClaw |
| **R-P1a-15** | Silent breaking token change in `0.x` minor release | Web prod renders wrong colors after `npm i` | 8 | 3 | 4 | 96 | Semver: token rename = major even in 0.x; capsarmory-www pins exact version (R-P1a-12); CHANGELOG required per release | DEV-001 |
| **R-P1a-16** | Cross-repo drift PAT leaks or expires | CI drift detector fails or PAT exposes app repo | 7 | 4 | 2 | 56 | PAT on dedicated bot `lumina-drift-bot`, Contents:Read on caps-armory-app entire repo (file-scope not available in Fine-Grained PAT); stored only in brand-repo Actions secret; 90-day rotation in calendar; inversion-path (app pushes tokens mirror) documented as fallback | DEV-001 + SEC-001 |
| **R-P1a-17** | R2 egress overrun via Class A operation spike | Unexpected $ on Cloudflare bill | 4 | 3 | 4 | 48 | Cloudflare Worker fronts R2 with aggressive Cache-Control immutable headers; egress alarm at $50/mo; content-addressed paths maximize cache hit rate | DEV-001 + OPS-001 |
| **R-P1a-18** | Veo or gemini-image API outage during production sprint | Asset production stalls | 6 | 3 | 1 | 18 | Asset production decoupled from package code path; Phase-0 placeholder hero remains valid fallback indefinitely; production sprints have float baked in | DEV-001 |
| **R-P1a-19** | next/font preload hardcoded href returns 404 after Next.js asset-hash rename | Font flash on first paint; LCP regression | 5 | 4 | 4 | 80 | Per HIGH-08: drop manual preload, rely on `font-display: swap`; benchmark perf delta in spec phase; alternative `next/font/local` documented | DEV-001 |
| **R-P1a-20** | Variable font shipped as weight shards instead of unicode-range shards | Synthesized bold/italic; poor typography | 6 | 5 | 3 | 90 | Per HIGH-09: extraction pulls @fontsource-variable's actual variable files by unicode-range; vitest asserts single-woff2-per-range invariant | DEV-001 |

---

## 2. RPN-ordered mandatory mitigations (RPN ≥ 80)

| Rank | ID | RPN | Status |
|------|----|----|---|
| 1 | R-P1a-01 | 126 | Mandatory — 5 candidate prompts + Captain lock + Phase-0 fallback |
| 2 | R-P1a-15 | 96 | Mandatory — semver discipline + CHANGELOG + exact-version pin |
| 3 | R-P1a-20 | 90 | Mandatory — unicode-range variable font extraction + invariant test |
| 4 | R-P1a-13 | 84 | Mandatory — assets committed, not CI-regenerated |
| 5 | R-P1a-03 | 80 | Mandatory — themes.ts SHA pin |
| 6 | R-P1a-19 | 80 | Mandatory — drop manual preload, font-display: swap |

R-P1a-08 dropped from 128 (v1) → 64 (v3) via automated OCR + face + logo pre-filter (MED-02 fix).

## 3. Detectability methods

Each risk's detection mechanism is enumerated in Spec § 11 RTM mapping (one row per AC × test ID).

## 4. Gate-0 Exit Criteria

- [x] All risks RPN > 100 have mandatory mitigations (R-P1a-01 only).
- [x] Each mitigation maps to a spec section or test.
- [x] FMEA cross-references council-approved brainstorm v3.
- [ ] Captain reviews + signs off → Gate 0 closed → Gate 1 spec drafting proceeds.

**Status:** Gate 0 ready. Awaiting Captain sign-off to formally close Gate 0 and proceed to Gate 1 (spec).
