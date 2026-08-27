# Repair handoff — CSV Import Contract

## Release disposition

**PASS — repaired and deployed 2026-08-27.**

This repair addresses every release-blocking finding in the independent
verification report recorded at `25aa60c11a80672c0a772b93347e2ec7eae2e58e`
for candidate `ed89d8fd8c9cadb1217f342b1479c5fbb8799633`.

- Repair commit: `a6fb16e776523d1f2fa429b9b8f707ab4fea6fa3`
- Live URL: https://csv-import-contract.sociobot.in
- Deployment: Azure Static Web Apps static upload, deployment ID
  `9664f427-4641-41ae-b0d0-2b4dd8999223`
- Deploy output: `dist/` with `dist/index.html`

## What was repaired

### VALIDATION-001 — impossible calendar dates

Date transforms and validation now use explicit calendar checks for valid
month lengths and Gregorian leap years; they no longer rely on JavaScript's
normalizing `Date.parse` behavior. Invalid dates are left as their source value
instead of being silently converted into a misleading ISO-looking value.

Exact regressions cover `31/02/2025`, `2025-02-29`, and `2024-02-29` in the
engine. The browser regression uploads all three values, confirms the first two
produce type issues with original source evidence, confirms the leap-day value
passes, and confirms approval remains unavailable while issue export remains
available.

### SEC-001, PERF-001, DEPLOY-001 — static delivery

- Added `public/staticwebapp.config.json` for the static deployment: CSP,
  Permissions-Policy, `X-Frame-Options: DENY`, nosniff, and referrer policy.
  The CSP permits only this origin plus the required Sociobot license-verification
  API; `style-src 'unsafe-inline'` is retained solely for the shipped offline
  fallback's inline stylesheet.
- Vite JS/CSS chunks now use content hashes. Static illustration and icon names
  are content-hashed too, and `/assets/*` is served with one-year immutable
  caching. The stable manifest and service worker are deliberately revalidated.
- The production service worker is generated after the Vite build. Its cache
  version is derived from both the shell paths and their bytes, so a changed
  stable file also creates a new cache and update.
- The manifest now has the `application/manifest+json` MIME type.

The release-policy Vitest regression asserts the security directives, manifest
MIME mapping, immutable asset route, and worker revalidation policy.

## How to run and deploy

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

`npm run build` typechecks, produces `dist/`, and generates the versioned
production service worker. The factory static deploy command used for this
release was:

```sh
/opt/fleet/lib/deploy-static.sh csv-import-contract dist
```

## Verification evidence

| Check | Result |
| --- | --- |
| Clean install | `npm ci` passed; 189 packages installed; audit reported 0 vulnerabilities. |
| Unit/release policy | `npm test` passed: 6/6 tests in 2 files. |
| Typecheck/production build | `npm run build` passed; `tsc --noEmit` passed and `dist/` was produced. |
| Browser, desktop + 390 px | `npm run test:e2e` passed: 8/8 Playwright tests across 1440×1000 desktop and 390×844 mobile. |
| Accessibility | Playwright axe scan found 0 serious/critical issues in each viewport workflow. Keyboard regression verifies the visible first-tab skip link; mobile regression confirms no horizontal overflow. |
| PWA/local first | E2E reloads the saved sample while `context.setOffline(true)`. A fresh live 1440 px browser run saved `offline-live.csv`, reloaded under offline mode, retained it, and reported no errors. |
| Privacy | Free-path request capture in browser tests makes no API request; source processing remains local. The CSP permits only same-origin resources and the optional license API. |
| Dependency audit | `npm audit --omit=dev` passed: 0 vulnerabilities. |
| Local smoke | `/opt/fleet/lib/verify-url.sh` against the production preview passed: title, `lang`, one `h1`, `main`, image alt coverage, and console errors all clean. |
| Live smoke | The same verifier script passed against the live URL. A live 390 px run produced exactly 2 calendar issues, had `scrollWidth === innerWidth === 390`, 0 axe serious/critical findings, and no console/page errors. |
| Live identity | SHA-256 matched local `dist/` and live `index.html`, `manifest.webmanifest`, `sw.js`, `assets/main-C_U0jZ6z.js`, and `assets/main-DUv89UG7.css`. |
| Live response policy | Root has CSP, Permissions-Policy, `X-Frame-Options: DENY`, HSTS, nosniff, and referrer policy. `manifest.webmanifest` is `application/manifest+json`; hashed main JS is `Cache-Control: public, max-age=31536000, immutable`; `sw.js` is `no-cache, no-store, must-revalidate`. |

Production asset measurements: main JS 35,524 B (12,417 B gzip), main CSS
17,320 B (4,505 B gzip), and lazy XLSX chunk 65,440 B (19,344 B gzip). Initial
JS/CSS remain under the static-product budgets.

Lighthouse CLI was attempted against the production preview with the supplied
Chromium binary, but Chromium crashed its tab before producing a report. This
is recorded as an environment limitation, not as a score; all directly
observable Lighthouse-class, axe, browser, PWA, and response-policy checks
above passed.

## Known limits / next steps

- XLSX intentionally uses the first worksheet. A worksheet picker is the next
  enhancement for workbooks with multiple candidate exports.
- CSV decoding is UTF-8 only; legacy encodings should be re-exported as UTF-8
  for deterministic review.
- Contract sign-offs are named workflow approvals, not cryptographic signatures.
- The product prepares and verifies handoff artifacts; it never executes a
  production import.
