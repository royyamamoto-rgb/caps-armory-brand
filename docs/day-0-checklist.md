# P1a Day-0 Checklist

- [x] npm scope `@capsarmory` reserved via `@capsarmory/scope-reservation@0.0.0` published 2026-06-03T06:10:58.974Z
  - Maintainer: `lumina28` | Registry: https://www.npmjs.com/package/@capsarmory/scope-reservation
- [x] `THEMES_READ_PAT` provisioned 2026-06-03 in vault (STOPGAP: reuses gh CLI OAuth token on royyamamoto-rgb; scope is classic-OAuth `repo` rather than Fine-Grained Contents:Read; rotate to Fine-Grained PAT by 2026-09-01)
- [x] `assets.capsarmory.com` Caddy vhost on VPS + Cloudflare DNS A record proxied — 2026-06-03T07:03:00Z
  - Caddy config: `vps:/etc/caddy/conf.d/assets.capsarmory.com.conf` (archived to brand repo at `docs/infra/assets.capsarmory.com.caddy` in Task 4)
  - DNS record id: `3e931d68edffa164720cf06eee71068c` (A, assets, proxied=true)
  - Origin path: `/opt/capsarmory-brand-assets/` (caddy:caddy 0755)
  - Verified end-to-end: HTTP 200 on `/LICENSE.txt`, HTTP 403 on out-of-allowlist, cache-control public+immutable on `/assets/*`, CORS `*` headers, `server: cloudflare`
