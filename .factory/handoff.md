# Repair 3 handoff — CSV Import Contract

## Result

**PASS — the three verification-3 findings and three claim-coverage gaps are repaired.**

## Release identity

- Implementation: `643ff684a5fb8bc865b64632fa6ad9fbd51f8efb`
- Prior failed implementation: `e6ff8a898a80e96416cbcf85990c6aa31b42d724`
- Live URL: <https://csv-import-contract.sociobot.in>
- Final app asset: `assets/main-DTAbd6lG.js`
- Verified: 6 September 2026 UTC

The live root HTML, app JavaScript, app CSS, service worker, and manifest are
byte-identical to the final local `dist/` build. The static deployment used the
product's confirmed production Static Web App and retained its existing
configuration.

## What changed

- Added `xlsx-input` and `contract-reuse` claims. Their browser tests load a
  real one-sheet XLSX fixture and export then import a changed contract into a
  compatible second source.
- Strengthened `handoff-exports` to parse the downloaded contract JSON and
  inspect cleaned CSV, Markdown report, and issue-CSV evidence.
- After a step change, the new step heading receives focus and the polite
  announcer states the new step. Reset demo returns focus to Reset demo and
  announces that the sample was restored. Later rerenders preserve a focused
  control when possible.
- Raised demo, home, footer, and legal navigation targets to at least 44 × 44
  CSS pixels. Browser checks measure the rendered boxes rather than CSS text.

## Verification

A detached clean worktree at the implementation SHA completed:

- `npm ci` — 190 packages; audit reported 0 vulnerabilities.
- `npm test` — 6/6 passed.
- `npm run build` — passed; `dist/index.html` produced.
- `npm run test:e2e` — 22/22 passed across desktop and 390 px phone projects.
- `npm audit --omit=dev` — 0 vulnerabilities.
- Every declared claim command below passed separately in both projects.

```sh
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:handoff-exports
npm run test:e2e -- --grep @claim:xlsx-input
npm run test:e2e -- --grep @claim:contract-reuse
npm run test:e2e -- --grep @claim:no-production-import
```

Playwright Axe integration found no serious or critical issues on root, demo,
privacy, terms, offline, and 404 pages. It also checks route focus, titles,
one h1/main, offline reload, and no horizontal phone overflow. A local
service-worker controller-change exercise displayed “An app update is ready.”
Reduced motion made workspace animation duration `1e-05s`.

## Live checks

Fresh 1440 × 900 and 390 × 844 contexts both showed the job “Prepare a CSV
import contract,” the migration-team audience, and “Try it with sample data”
before scrolling. The phone action ended at 417 px of an 844 px viewport.

The one-click sample showed `migration-sample.csv`, the persistent demo label,
and a populated cleaned preview. Reset retained focus on Reset demo and
announced “Demo reset. Sample data restored.” A separately saved
`real-work.csv` remained after entering, resetting, and leaving demo mode.
The live phone targets measured 44 px or larger; there were no console errors.

An empty CSV gave the actionable header-row error. A subsequent TSV recovery
showed a Tab delimiter. Free-flow request capture found only product-origin
requests. Root, Demo, Privacy, Terms, offline, robots, and sitemap returned
200; an unknown route returned the designed HTTP 404.

Live headers retain CSP, frame denial, feature policy, referrer policy, and
`nosniff`. Hashed assets are immutable, the manifest is
`application/manifest+json`, and `sw.js` is not cached.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| VALIDATION-001 | Fixed previously; strict calendar tests remain green. |
| SEC-001, PERF-001, DEPLOY-001 | Fixed previously; confirmed on the final live headers. |
| R1–R6 | Demo isolation, first read, claims, paid-link removal, 404, and plain copy remain fixed. |
| R7 / F-2-1 and F-2-2 | Route structure/focus and the no-production-import boundary remain fixed. |
| CLAIM-3-001 | Fixed with three outcome-level claim checks above. |
| A11Y-3-001 | Fixed with post-render focus and live announcements, including late rerenders. |
| A11Y-3-002 | Fixed with measured 44 px live controls. |

## Known external dependency

No Sociobot billing product is registered for the optional one-time paid
archive. It is not advertised or simulated. The free local-first contract,
exports, and safety behavior remain available.
