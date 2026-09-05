# Repair 2 handoff — CSV Import Contract

## Release identity

- Implementation commit: `e6ff8a898a80e96416cbcf85990c6aa31b42d724`
- Implementation message: `fix: complete route contract and import boundary`
- Documentation commit: the commit containing this handoff; use
  `git rev-parse HEAD` after checkout.
- Live URL: <https://csv-import-contract.sociobot.in>
- Deployment ID: `bd4735f0-ba54-484a-a69b-fb3d9b274a53`
- Deployment date: 5 September 2026

The production artifact was built from the clean implementation commit before
the later handoff-only commit.

## What changed

- Completed the 404 metadata with canonical, Open Graph, Twitter, favicon, and
  Apple touch tags using the existing original social image.
- Made every static route focus its `h1` after navigation and announce the page
  through a polite live region. Returning from the demo also focuses the new
  workspace heading.
- Standardized legal, offline, and 404 footers with the product one-liner,
  Privacy, Terms, Param Factory credit, and build ID.
- Added the plain boundary: the product creates handoff files and does not
  import data into another system.
- Added `no-production-import` to the claims registry. Its browser test reaches
  handoff, checks the downloaded CSV rows, and proves the action makes no
  network request.
- Expanded route tests to follow real links, check focus and live announcements,
  inspect rendered metadata and footers, and run Axe on each route.
- Kept the existing blueprint drafting-sheet identity. No new image or AI
  feature was needed for this repair.

## Earlier finding disposition

| Finding | Current disposition |
| --- | --- |
| VALIDATION-001 impossible dates | Fixed earlier. Unit and browser regressions still pass for invalid and leap-year dates. |
| SEC-001 response policy | Fixed earlier. Live CSP, permissions, referrer, frame, and content-type headers remain present. |
| PERF-001 cache policy | Fixed earlier. Live hashed assets are immutable; the worker is no-store. |
| DEPLOY-001 manifest MIME | Fixed earlier. Live manifest is `application/manifest+json`. |
| R1 demo isolation | Fixed. `demo:csv-import-contract` remains separate and the isolation claim passes. |
| R2 first read | Fixed. Job, migration-team audience, and sample action are visible without scrolling. |
| R3 claims contract | Fixed. Five declared claim commands pass from a clean clone. |
| R4 dead checkout | Fixed earlier by removing the unavailable paid offer. |
| R5 designed 404 | Fixed. An unknown live URL returns the designed page with HTTP 404. |
| R6 unlisted claims | Fixed. Current landing and README promises map to declared claims. |
| R7 / F-2-1 route structure | Fixed. The 404 metadata, every footer, and static route focus now pass browser checks. |
| R8 unclear copy | Fixed earlier and retained. |
| F-2-2 no-import boundary | Fixed with landing copy and the new outcome-based claim. |

## Clean-checkout verification

Fresh clone at the implementation commit:

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Results:

- `npm ci`: 190 packages installed; 0 vulnerabilities.
- `npm test`: 6/6 Vitest tests passed.
- `npm run build`: passed; `dist/index.html` exists.
- `npm run test:e2e`: 14/14 Playwright tests passed across desktop and 390 px.
- Axe: zero serious or critical findings on root, demo, Privacy, Terms, offline,
  and 404 pages.
- Bundle: 32,437 B app JS, 65,440 B lazy XLSX JS, 18,741 B CSS, and
  27,111 B mobile hero AVIF.

Each command in `.factory/claims.json` was also run separately from that clean
clone. Every command passed in both browser projects:

```sh
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:handoff-exports
npm run test:e2e -- --grep @claim:no-production-import
```

## Live verification

Fresh 1440 × 900 and 390 × 844 browser contexts completed the same cold flow.
Before scrolling, both showed:

- Job: **Prepare a CSV import contract**.
- Audience: migration teams who need another person to repeat an import.
- First action: **Try it with sample data**.

On the phone, the action ended at 417 px in an 844 px viewport. The page had no
horizontal overflow. Both contexts then:

- loaded `migration-sample.csv` with three realistic customer rows;
- retained “Demo — sample data, nothing is saved” through the handoff step;
- showed the populated cleaned preview;
- reset to the original sample;
- used Start for real and returned to an empty normal workspace; and
- made requests only to `https://csv-import-contract.sociobot.in`.

Privacy navigation and the designed 404 focused their headings. The missing URL
returned HTTP 404 and contained the complete metadata and footer. Root, demo,
Privacy, and Terms produced no console or page errors. Chromium logs the expected
failed-resource message only for the deliberate HTTP 404 navigation.

Live responses were byte-identical to the implementation build for
`index.html`, `404.html`, `route-focus.js`, and the hashed main JavaScript.

The live offline reload retained the demo banner and sample. Reduced-motion
animation duration was `0.00001 s`. Live mobile Axe scans found zero serious or
critical issues on all routes.

Mobile Lighthouse against the live URL:

- Performance: 100
- Accessibility: 100
- Best Practices: 100
- SEO: 100
- LCP: 0.95 s
- TBT: 0 ms
- CLS: 0

The first Lighthouse invocation used an unsupported CLI path flag and failed
before measurement. Re-running with the documented `CHROME_PATH` environment
completed successfully and produced the scores above.

## Deployment policy checks

- Manifest: `application/manifest+json`, no-cache.
- Hashed JS: one-year immutable cache.
- Service worker: no-cache, no-store, must-revalidate.
- Live HTML and 404: CSP, Permissions-Policy, Referrer-Policy,
  X-Content-Type-Options, and frame denial are present.
- The deployed artifact is static and keeps workspace state in browser
  IndexedDB. No shared database or backend is used.

## Known gap and next step

No review finding remains open. The researched one-time paid archive is not
offered because a working Sociobot billing product and checkout are not
available in this repository. Keep it absent until that external dependency is
provisioned and can be covered by a live checkout claim.
