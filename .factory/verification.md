# Independent verification — CSV Import Contract

**Verdict: FAIL**

Tested 2026-08-27 against commit
`ed89d8fd8c9cadb1217f342b1479c5fbb8799633` and
https://csv-import-contract.sociobot.in.

The live deployment is the nominated candidate: SHA-256 matched byte-for-byte
for `index.html`, `assets/main.js`, `assets/main.css`, `sw.js`, and
`manifest.webmanifest` between a fresh local production build and the live URL.
The failure is a real data-integrity defect in the product, not a deployment
failure.

## Blocking defect

### High — VALIDATION-001: impossible calendar dates are silently accepted

The date transform turns `31/02/2025` into `2025-02-31`. The date validator
then accepts it because `Date.parse("2025-02-31T00:00:00Z")` normalizes that
impossible date instead of rejecting it.

Fresh browser reproduction, using a three-row CSV with required/unique ID,
email, number, boolean, and date fields:

- Expected validation issues appeared for duplicate/missing ID, invalid email,
  invalid number, and invalid boolean (five total); each retained its original
  source row/value.
- No validation issue was emitted for `31/02/2025`.
- The handoff preview contains the invalid cleaned value `2025-02-31`.
- The issue export was enabled, so a consultant can export a contract whose
  validation says this invalid date is safe. With no other failing fields it
  can be marked approved.

This violates the brief's safe, repeatable import-contract purpose and its
requirement to warn about destructive coercions. Use strict calendar validation
(including month lengths and leap years) before accepting normalized dates, and
add UI/unit regressions for `31/02/2025`, `2025-02-29`, and `2024-02-29`.

## Other defects and deployment findings

### Medium — SEC-001: live response security policy is incomplete

The live HTML, JS, service worker, legal pages, and manifest responses include
HSTS, `Referrer-Policy: strict-origin-when-cross-origin`, and
`X-Content-Type-Options: nosniff`, but no `Content-Security-Policy`,
`Permissions-Policy`, or frame-embedding policy. The legacy
`X-XSS-Protection` response does not substitute for CSP. A CSP is especially
appropriate for a local-sensitive-file utility even though the examined UI
escapes displayed values.

### Low — PERF-001: static asset caching does not meet the stated immutable
asset policy

Live `assets/main.js`, `assets/main.css`, and `sw.js` use stable, non-hashed
URLs and `Cache-Control: public, must-revalidate, max-age=30`; none is
long-lived immutable. The service worker makes the app usable offline, but the
HTTP cache policy creates unnecessary revalidation and does not satisfy the
factory's immutable-hashed-assets guidance.

### Low — DEPLOY-001: manifest has a generic MIME type

`/manifest.webmanifest` is served as `application/octet-stream`, rather than
`application/manifest+json` (or JSON). Chromium still registered the service
worker in this verification, but this is an avoidable PWA deployment
compatibility risk.

## Fresh clean-checkout quality-gate evidence

The worktree was clean and at the nominated commit before testing.

| Check | Result |
| --- | --- |
| `npm ci` | PASS — 189 packages installed; audit reported 0 vulnerabilities |
| `npm test` | PASS — 4/4 Vitest tests |
| `npm run build` | PASS — `tsc --noEmit` plus Vite production build; `dist/` produced |
| `npm run test:e2e` | PASS — 2/2 Playwright tests, including the repository's offline and mobile axe smoke test |
| Lint/type scripts | No separate lint script is defined; typechecking is part of build |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Build budget results: initial JS `35,137 B` (12.22 KB gzip), initial CSS
`17,320 B` (4.51 KB gzip), and lazy XLSX chunk `65,440 B` (19.34 KB gzip), all
within the stated initial JS/CSS budgets. The mobile hero AVIF is `27,111 B`;
mobile WebP is `40,630 B`.

An independent Lighthouse CLI attempt could not complete in this container:
Lighthouse lost its CDP connection to the supplied Chrome binary (`Connection
closed`). This is a verification-environment limitation, not a passing score;
no independent Lighthouse score is claimed.

## Independent product exercise

- Exercised the local production build at desktop 1440×1000 and mobile
  390×844. Visual review found the intended blueprint layout, readable mobile
  stacking, and no horizontal overflow at 390 px.
- Exercised normal source → mapping → validation → handoff flow with a CSV
  containing quoted thousands separators, CRLF records, duplicate/missing
  values, invalid email/number/boolean values, and the invalid date above.
- Empty-file error was announced as actionable text; selecting a valid file
  immediately afterward recovered correctly.
- Confirmed source row/original value evidence for the five expected invalid
  fields and enabled issue export. Contract/export controls are disabled for
  invalid mapping configuration by product code; the repository e2e covers the
  normal export path.
- No serious or critical axe findings in an independent desktop handoff scan;
  repository mobile axe scan also passed. First keyboard Tab reaches the visible
  3 px skip-link focus ring. Reduced motion changed transitions to `0.01 ms`.
- The mobile page had `scrollWidth === innerWidth === 390`.
- No console errors or page errors in independent local or live runs.
- Before a license is present, request capture found no third-party or API
  requests; live and local runs made no outbound request for file processing.
  Source/workflow data persisted locally across refresh.
- Local service worker install, offline reload, and update behavior passed. For
  the update test, a test-only server served the exact build, then a changed
  service-worker response; the candidate showed “An app update is ready”, and
  an offline reload retained `migration-sample.csv`. Live deployment also
  retained that sample on offline reload with no errors.

## Live HTTP evidence

The live URL returns HTTPS with HSTS and `nosniff`; root content is
`text/html`, JS `text/javascript`, and CSS `text/css`. It currently returns
`cache-control: public, must-revalidate, max-age=30` for app resources and
`application/octet-stream` for the manifest. These observations produced the
SEC-001, PERF-001, and DEPLOY-001 findings above.

## Required disposition

Do not release this candidate as PASS. Fix VALIDATION-001 and rerun the full
clean-checkout, local PWA, and live-deployment verification. Address the
response-policy/cache findings in the deployment configuration before release.
