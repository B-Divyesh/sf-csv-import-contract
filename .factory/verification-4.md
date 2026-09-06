# CSV Import Contract verification 4 — Prepare a CSV import contract

**Verdict: FAIL**

- Findings: **1**
- Untested public claims: **0**
- Candidate implementation: `643ff684a5fb8bc865b64632fa6ad9fbd51f8efb`
- Documentation reviewed: `c34c08c5152be185a34ac24d7abe21df7999a97e`
- Live URL: <https://csv-import-contract.sociobot.in>
- Verified: 6 September 2026 UTC

The live release is byte-identical to the reviewed implementation for the root HTML, application JavaScript and CSS, service worker, and manifest. The product's main path works. This is not a PASS because one minor accessibility finding remains. The work order requires zero findings at every severity.

## Finding

### Minor — A11Y-4-001: Persistent status content is outside landmarks

On both `/` and `/demo/`, Playwright Axe 4.13 reports `region` with moderate impact. The affected node is:

```html
<div class="save-strip"><span id="save-status">Ready</span><span>Contract 1.0.0</span></div>
```

It is a direct sibling of `header`, `main`, and `footer`, rather than content within a landmark. It presents persistent status and contract-version text, so screen-reader landmark navigation can skip it. The nearby polite announcer is also outside a landmark.

Move the strip and announcer into an appropriate existing landmark while retaining their sticky/status behaviour, then rerun the Axe scan. This is a minor semantic-structure defect; no serious or critical Axe violations were found.

## Clean checkout and declared claims

The documented Node 22 prerequisite was installed from the clean candidate checkout. All commands passed:

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 190 packages installed; audit reported 0 vulnerabilities. |
| `npm test` | PASS — 6/6 Vitest tests. |
| `npm run build` | PASS — produced `dist/index.html`. |
| `npm run test:e2e` | PASS — 22/22 Playwright tests across desktop and 390 px phone projects. |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities. |

Every command declared in `.factory/claims.json` was run separately. Each has exactly one matching tagged test and passed in both browser projects:

| Claim | Result and observable proof |
| --- | --- |
| `demo-isolation` | PASS — changes and reset in `demo:csv-import-contract` leave `real-work.csv` in the normal workspace. |
| `local-only` | PASS — the sample flow records only product-origin requests. |
| `offline-reload` | PASS — a fresh controlled context reloads the demo after `setOffline(true)`. |
| `handoff-exports` | PASS — JSON, cleaned CSV, Markdown report, and issue CSV downloads are parsed and contain sample data. |
| `xlsx-input` | PASS — a real one-sheet XLSX fixture opens and identifies its worksheet/profile. |
| `contract-reuse` | PASS — an exported changed map is applied to a compatible second source. |
| `no-production-import` | PASS — the cleaned CSV download contains transformed rows and the final action makes no request. |

There are no missing, false, incomplete, or untested public claims found in the landing page, README, privacy policy, terms, or handoff controls.

## Fresh live checks

Fresh unauthenticated desktop (1440 × 900) and phone (390 × 844) contexts both showed the job, audience, and first action before scrolling:

- Job: **Prepare a CSV import contract**.
- Audience: migration teams who need another person to repeat a CSV import.
- First action: **Try it with sample data**; its bottom edge was 427 px on desktop and 417 px on phone.

The one-click live sample displayed `migration-sample.csv`, the persistent label “Demo — sample data, nothing is saved,” and populated transformed rows including customer IDs, emails, dates, activity values, and balances. A live keyboard reset retained focus on `#reset-demo`, announced “Demo reset. Sample data restored.”, and restored the sample. A separately saved `real-work.csv` remained after entering demo and using Start for real; both normal and demo IndexedDB databases were present.

An empty CSV produced the actionable header-row error. A later TSV loaded as `recovery.tsv` and displayed a Tab delimiter. The live demo registered a service worker and reloaded its sample while offline. Live 390 px target measurements were at least 44 px for demo, home, footer, and legal controls. No console or page errors occurred in the fresh desktop, phone, demo, recovery, or route checks.

`/`, `/demo/`, `/privacy/`, `/terms/`, `/offline.html`, `/robots.txt`, `/sitemap.xml`, and `/manifest.webmanifest` return 200. The deliberately unknown route returns the designed page with HTTP 404, one `h1`, and one `main`; this expected 404 is not a defect. Privacy and Terms have their own correct titles and one `main` each.

`/opt/fleet/lib/verify-url.sh` passed for the live root: title, `lang=en`, one `h1`, `main`, image alt coverage, and console checks all passed. The standalone `@axe-core/cli` could not start this runner's Chromium (`SessionNotCreatedError`), so the installed Playwright Axe integration was used instead. It found no serious or critical violations on root, demo, Privacy, Terms, or 404; it found the moderate finding above on root and demo.

## Delivery, privacy, and PWA checks

- Live SHA-256 values match local `dist/` for `index.html`, `assets/main-DTAbd6lG.js`, `assets/main-CU2t-tg5.css`, `sw.js`, and `manifest.webmanifest`.
- Live HTTPS headers include HSTS, CSP with `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer Policy, and Permissions Policy. Hashed assets are immutable; the worker is no-store; the manifest has `application/manifest+json`.
- The application bundle is 11.88 KB gzip, the lazy XLSX chunk is 19.34 KB gzip, and CSS is 4.76 KB gzip: within the static PWA budgets.
- The free demo's recorded requests stay on the product origin. No backend, tenant-isolation, restart, health, rate-limit, CLI, library, or desktop check applies to this static local-first PWA. The optional paid archive remains absent and unadvertised pending billing registration.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| `VALIDATION-001` | Fixed; unit and browser calendar regression checks pass. |
| `SEC-001`, `PERF-001`, `DEPLOY-001` | Fixed; final live headers, cache policy, and manifest MIME pass. |
| `R1`–`R6` | Demo sandbox, first read, claims registry, paid-offer removal, 404, and plain public claims remain fixed. |
| `R7` / `F-2-1` | Route shells, metadata, titles, focus, legal pages, and designed 404 remain fixed. |
| `F-2-2` | The product boundary remains fixed and its outcome claim passes. |
| `CLAIM-3-001` | Fixed; XLSX, contract reuse, and parsed export-content claims all pass. |
| `A11Y-3-001` | Fixed; live reset focus and announcement pass, including delayed rerender coverage. |
| `A11Y-3-002` | Fixed; measured live controls meet 44 px. |
| `A11Y-4-001` | **Open** — persistent save/status content is outside landmarks. |

## Release decision

**FAIL — 1 minor finding, 0 untested public claims.**

Do not declare this candidate accepted until A11Y-4-001 is repaired and the full claim suite plus live Axe scan are rerun.

