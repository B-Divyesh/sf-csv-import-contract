# Review handoff — CSV Import Contract

## What was done

Performed the requested adversarial first-read review against the live product
at 390 px and desktop, reviewed repository contract files/copy, exercised the
sample and storage behaviour, inspected routing/metadata, crawled links, and
ran the local verification commands. The full evidence and findings are in
[review-1.md](review-1.md).

No product code was modified. This handoff and the review are the only intended
repository changes.

## How verified

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

All commands passed in this review environment: Vitest 6/6 and Playwright 8/8.
Live browser checks used fresh Chromium contexts against
`https://csv-import-contract.sociobot.in` at 390 × 844 and 1440 × 900.

## Result and known gaps

**FAIL.** The product is not ready for acceptance under this review because:

- the sample writes to the normal IndexedDB workspace and lacks a direct,
  resettable isolated demo;
- `.factory/claims.json`, `.factory/demo.md`, and tagged claim tests are absent;
- the first screen does not plainly identify the user/audience or a result-named
  sample action;
- the Pro checkout link returns HTTP 404; and
- unknown routes return the home page instead of a designed 404.

Next work should implement the demo sandbox and claim contract first, then
repair first-screen copy, checkout, routing, and metadata as specified in the
review.
