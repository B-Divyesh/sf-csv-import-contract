# Independent verification 2 — CSV Import Contract

**Verdict: PASS**

Verified 2026-08-27 from a clean worktree at candidate commit
`e0908fb5ad6a61be914857901951d4f56dc201ec`.

- Local production artifact: `dist/` produced by `npm run build`
- Live deployment: https://csv-import-contract.sociobot.in
- Scope: local-first CSV/XLSX import-contract workflow, PWA behavior,
  accessibility, privacy/network behavior, delivery policy, and release
  identity.

The previously reported calendar-validation and deployment-policy failures are
resolved in this candidate. Fresh evidence found no release-blocking defects.

## Quality gates

| Check | Result |
| --- | --- |
| Clean checkout | PASS — initially clean at the nominated SHA. |
| `npm ci` | PASS — 189 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS — 6 Vitest tests in 2 files, including strict calendar-date and static-release-policy regressions. |
| `npm run build` | PASS — `tsc --noEmit`, Vite production build, and generated versioned service worker; `dist/` exists. |
| `npm run test:e2e` | PASS — 8 Playwright tests across 1440×1000 and 390×844, including offline reload, calendar evidence, axe smoke coverage, legal pages, keyboard skip link, and mobile width. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |
| Lint/type checks | No separate lint script is defined; the complete TypeScript check is part of the passing production build. |

Production sizes are within the static-PWA budgets: entry JS
`35,524 B` (`12,417 B` gzip), entry CSS `17,320 B` (`4,505 B` gzip), lazy XLSX
chunk `65,440 B` (`19,344 B` gzip), and mobile hero AVIF `27,111 B` (mobile
WebP `40,630 B`). Initial JavaScript and CSS are far below 200 KB and 50 KB.

## Independent end-to-end exercise

Fresh Playwright checks used the exact local production build, then repeated
desktop and 390 px checks on the live URL.

- Representative CRLF CSV: six fields including quoted comma-containing text,
  quoted thousands-separated number, dates, booleans, email, duplicate and
  missing identifier values. The source profile reported comma, quote, and
  CRLF assumptions. Mapping set deterministic email/date/boolean/number
  transforms and required/unique rules.
- Validation found **7** expected issues, including invalid email, missing and
  duplicate identifier, invalid boolean/number, `31/02/2025`, and
  `2025-02-29`. The issue table retained the original invalid date values and
  source evidence. The handoff warned that destructive coercions are
  documented.
- All four handoff artifacts downloaded: JSON contract, cleaned CSV, Markdown
  report, and issues CSV. Project state survived reload through IndexedDB.
- Empty CSV produced the actionable local error, and immediately selecting a
  valid TSV recovered successfully and showed the `Tab` parsing assumption.
- Reduced-motion emulation reduced the workspace animation duration to
  `0.01 ms` (`1e-05s`).
- Explicit PWA update test: a test-only static server served the exact `dist/`
  app, then a changed `sw.js` response. After `registration.update()`, the app
  displayed **“An app update is ready.”** with no console/page errors. The
  normal workflow also registered the worker and retained the local project on
  an offline reload.

## Accessibility, responsive, and browser checks

| Surface | Serious/critical axe | Console/page errors | Width result |
| --- | ---: | ---: | --- |
| Local production, desktop | 0 | 0 | 1440/1440 px |
| Local production, 390 px | 0 | 0 | 390/390 px |
| Live deployment, desktop | 0 | 0 | 1440/1440 px |
| Live deployment, 390 px | 0 | 0 | 390/390 px |

Keyboard-first inspection confirmed the skip link receives the first focus and
has a visible designed outline. The mobile document had no horizontal overflow.
The passing repository E2E also verifies one `h1`, `main`, legal-page headings,
and image alt coverage. No console or uncaught page errors occurred in the
independent local or live workflows.

## Privacy and network behavior

Request capture during the entire free workflow observed only the app origin:
`http://127.0.0.1:4173` locally and
`https://csv-import-contract.sociobot.in` live. No file contents were sent,
and there were no third-party scripts, fonts, analytics, or API requests before
a license is supplied. Source/workflow data persisted in browser IndexedDB.
The only configured optional external destination is the documented Sociobot
license-verification API, allowed narrowly by CSP.

## Live deployment identity and response policy

Fresh SHA-256 comparisons were byte-identical between local `dist/` and live
responses for all of:

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `assets/main-C_U0jZ6z.js`
- `assets/main-DUv89UG7.css`

The live root, manifest, worker, JS, and CSS return HTTPS with HSTS,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Content-Type-Options:
nosniff`, CSP, `Permissions-Policy`, and `X-Frame-Options: DENY`. The CSP is
local-first (`default-src 'self'`) and limits `connect-src` to same origin plus
the optional Sociobot license API. `manifest.webmanifest` is
`application/manifest+json`; hashed assets use
`Cache-Control: public, max-age=31536000, immutable`; and `sw.js` uses
`no-cache, no-store, must-revalidate`.

## Defects by severity

No critical, high, medium, or low defects were found in this verification.

## Measurement note

Lighthouse CLI was attempted twice against the local production preview using
the supplied Chromium path. The first invocation rejected the CLI path option;
the second (`CHROME_PATH=…`) reported it could not connect to Chrome. This is a
runner/browser integration limitation, so no Lighthouse numeric score is
claimed. It does not affect the directly measured bundle budgets, axe scans,
semantic checks, browser error checks, or responsive/PWA evidence above.

