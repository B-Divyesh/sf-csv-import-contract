# Verification 3 handoff — CSV Import Contract

## Result

**FAIL — 3 findings and 3 untested public claims remain.**

See [verification-3.md](verification-3.md) for the full independent evidence.

## Release identity

- Implementation reviewed: `e6ff8a898a80e96416cbcf85990c6aa31b42d724`
- Documentation reviewed: `76b97dffe849bc5354b94b8dab3b265412f4db6b`
- Live URL: <https://csv-import-contract.sociobot.in>
- Verified: 5 September 2026 UTC

The live root HTML, hashed app JS and CSS, service worker, manifest, 404 page,
and route-focus script are byte-identical to the clean candidate build.

## What was verified

- Clean install, 6/6 unit tests, production build, and 14/14 browser tests.
- All five declared claim commands separately; every command passed in both
  desktop and mobile projects.
- Fresh live phone and desktop first reads, the complete sample workflow, four
  populated exports, persistent demo label, reset, and real-work isolation.
- CSV, TSV recovery, XLSX, invalid calendar dates, contract reuse, persistence,
  keyboard flow, reduced motion, offline reload, and update notice.
- Root, Demo, Privacy, Terms, offline, metadata, links, security headers,
  caching, designed HTTP 404, console logs, and network requests.
- Independent Axe scans and mobile Lighthouse. Lighthouse scored 100 in all
  four categories, with 945 ms LCP, 0 ms TBT, and 0 CLS.

## Findings to fix

1. Add complete tagged claim coverage for XLSX input, repeat-contract import,
   and the contents of the JSON, Markdown, and issue-CSV exports.
2. Preserve or deliberately move focus and announce new state after workflow
   step changes and Reset demo.
3. Increase the live phone hit areas for demo, home, footer, and legal-page
   links to at least 44 × 44 CSS px.

## Commands

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:handoff-exports
npm run test:e2e -- --grep @claim:no-production-import
```

## Known external dependency

The paid archive is not offered because no Sociobot billing product is
provisioned. Keep it absent until checkout and license behavior can be tested.
This does not change the FAIL verdict, which is caused by the three findings
above.
