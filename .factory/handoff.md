# Repair handoff — CSV Import Contract

## Repair commit

`6e39e7182743a755190eded570dae9791e484671` — `fix: polish demo sandbox and release routes`

## What changed

- Replaced the cold first screen with the plain job, named migration teams, a
  visible **Try it with sample data** action, its result, and three tested facts.
- Added direct `/demo` and `?demo=1` sample entry. Demo work uses the isolated
  IndexedDB database `demo:csv-import-contract`; it never opens the real
  database. The persistent banner has Reset demo and Start for real controls.
- Added the claim contract, demo documentation, copy audit, and four tagged
  browser claim tests. Removed the unavailable Pro purchase and license UI
  rather than leaving a dead checkout promise.
- Added real static routes, route-specific metadata, social preview art,
  favicon, shared legal navigation, `/demo` sitemap entry, and a styled 404
  response configured with HTTP 404 status.
- Preserved the blueprint drafting-sheet identity and verified the 390 px
  layout. Pinned Playwright to the supplied 1.58.2 browser revision.

## Verification evidence

Fresh clone: `/tmp/csv-import-contract-clean` cloned from repair commit, then:

```sh
npm ci                         # 191 packages, 0 vulnerabilities
npm test                       # 6/6 Vitest passed
npm run build                  # dist/index.html produced
npm run test:e2e               # 12/12 Playwright tests passed (desktop + 390 px)
```

The browser suite includes Axe with zero serious or critical violations,
keyboard skip-link/focus checks, legal routes, title/canonical checks, real
404 status, console-error checks, mobile overflow checks, and the calendar
regression.

Every declared claim command passed (two browser projects each):

```sh
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:handoff-exports
```

The offline claim uses `context.setOffline(true)` after service-worker control.
The privacy claim records the full demo flow and accepts only same-origin
requests. The export claim downloads the JSON contract, cleaned CSV, report,
and issue CSV. The isolation claim saves normal work, changes and resets demo
data, then proves the normal record is unchanged.

Mobile Lighthouse against the production preview: **Performance 100**,
**Accessibility 100**, LCP **1.6 s**, CLS **0**. Initial app assets are
11.38 KB gzip JS plus 4.71 KB gzip CSS; the responsive mobile hero AVIF is
28 KB. Visual review was completed at 390 × 844 for landing and demo.

## Deployment

Static output is `dist/`, with `staticwebapp.config.json` providing the
`/demo` rewrite, security headers, cache policy, and designed 404 response.
Push the commits on `main` to trigger the configured static deployment.

## Known gaps

None. All BLOCKING findings from `review-1.md` are addressed. The previous Pro
offer is intentionally absent until a published Sociobot checkout exists.
