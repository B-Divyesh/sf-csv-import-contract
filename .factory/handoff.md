# Verification 4 handoff — CSV Import Contract

## Result

**FAIL — one minor accessibility finding remains; untested claims: 0.**

This verifier made no product-code changes. The reviewed implementation is `643ff684a5fb8bc865b64632fa6ad9fbd51f8efb`; this report/documentation commit started from `c34c08c5152be185a34ac24d7abe21df7999a97e`. The live URL is <https://csv-import-contract.sociobot.in>.

## What was verified

- Clean setup: `npm ci`, `npm test` (6/6), `npm run build`, `npm run test:e2e` (22/22), and `npm audit --omit=dev` all passed.
- Every declared claim command passed separately in both desktop and phone projects: demo isolation, local-only flow, offline reload, populated handoff exports, XLSX input, contract reuse, and no production import.
- Fresh live desktop and phone visits showed the CSV import job, migration-team audience, and sample action before scrolling. The demo showed populated output and its persistent sample label; reset focus/announcement, real-work preservation, invalid-file recovery, TSV parsing, offline reload, routes, legal pages, touch targets, headers, and live asset identity were checked.
- The live root, JS, CSS, worker, and manifest are byte-identical to the final local build. `verify-url.sh` passed. Playwright Axe found no serious or critical violation on root, demo, Privacy, Terms, or 404.

## Open finding

`A11Y-4-001` is a minor semantic-structure defect. Axe reports a moderate `region` violation on root and demo because `.save-strip` and the nearby live announcer sit outside every landmark. Move them into an existing landmark, retain their status behaviour, then rerun the full browser/claim suite and live Axe scan.

The standalone Axe CLI could not launch the supplied Chromium in this runner (`SessionNotCreatedError`); the installed Playwright Axe integration supplied the scan evidence instead. This is a runner limitation, not a product claim.

## How to verify after repair

```sh
npm ci
npm test
npm run build
npm run test:e2e
npm run test:e2e -- --grep @claim:demo-isolation
npm run test:e2e -- --grep @claim:local-only
npm run test:e2e -- --grep @claim:offline-reload
npm run test:e2e -- --grep @claim:handoff-exports
npm run test:e2e -- --grep @claim:xlsx-input
npm run test:e2e -- --grep @claim:contract-reuse
npm run test:e2e -- --grep @claim:no-production-import
```

See `.factory/verification-4.md` for complete evidence and earlier-finding disposition.
