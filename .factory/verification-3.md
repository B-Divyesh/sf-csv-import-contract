# Verify CSV import contract preparation — verification 3

**Verdict: FAIL**

- Findings: **3**
- Untested public claims: **3**
- Candidate implementation: `e6ff8a898a80e96416cbcf85990c6aa31b42d724`
- Documentation reviewed: `76b97dffe849bc5354b94b8dab3b265412f4db6b`
- Live URL: <https://csv-import-contract.sociobot.in>
- Verified: 5 September 2026 UTC

The main CSV job works and all five declared claim commands pass. The product
does not meet the release rule because this review found two accessibility
defects and three public behaviors without complete declared claim tests.

## Findings

### Medium — CLAIM-3-001: Three public behaviors lack complete claim tests

The live product makes these promises, but `.factory/claims.json` does not give
them complete outcome-level coverage:

1. The landing file control and Terms say the product accepts XLSX files. No
   declared claim or repository test loads an XLSX file.
2. Handoff says “Repeat this contract” and says a contract JSON can be opened
   against another compatible source. No declared claim or repository test
   exports a contract and imports it against a second source.
3. The handoff cards promise populated JSON, Markdown, and issue evidence. The
   `handoff-exports` test checks only the suggested filenames for those three
   downloads. It does not parse or inspect their contents, so empty or corrupt
   files could pass. The cleaned CSV receives a content check in the separate
   `no-production-import` test.

Independent live checks showed that the XLSX and repeat-contract paths work and
that all four sample downloads are populated. This is a release-test gap, not
a reproduced runtime failure. The claims contract still requires each public
promise to be listed and proven on every build.

Required fix: add tagged demo-based claims for XLSX input and contract reuse.
Strengthen the export claim to parse the JSON and assert meaningful JSON,
Markdown, and issue-CSV content.

### Medium — A11Y-3-001: Core workflow changes lose keyboard focus

In a fresh live demo, pressing Enter on **Continue to map** replaced the
workspace and left `document.activeElement` on `BODY`. The new “Set the output
fields” heading was neither focused nor written to the live region. Pressing
Enter on **Reset demo** also left focus on `BODY`; `#announcer` stayed empty.
Only the visual save strip changed to “Demo reset.”

Keyboard users must restart from the top of the document, and screen-reader
users receive no direct notice that the step or reset completed. Static route
focus works; this defect is limited to dynamic workspace changes.

Required fix: after each step and reset render, move focus to the new step
heading or restored Reset control and announce the state through the existing
polite live region. Add keyboard assertions for focus and announcement.

### Minor — A11Y-3-002: Several phone touch targets are under 44 px

At the required 390 px phone viewport, measured live target boxes included:

- demo **Reset demo** and **Start for real**: 38 px high;
- root/demo home mark: 36 × 36 px;
- legal-page home link: 26.4 px high;
- footer Privacy and Terms links: 14 px high.

The targets are visible and keyboard reachable, but they do not meet the
attached 44 × 44 px touch-target baseline. Increase their clickable padding or
minimum size without changing the visible label size.

## First screen

Fresh 390 × 844 and 1440 × 900 contexts showed the same information before
scrolling:

- Job: **Prepare a CSV import contract**.
- Audience: migration teams who need another person to repeat a CSV import.
- First action: **Try it with sample data**.
- Result note: a filled contract, checks, and handoff files appear.

The phone action ended at 417 px in an 844 px viewport. Both layouts had no
horizontal overflow. Screenshots are at
`/work/.evidence/live-phone-first-screen.png` and
`/work/.evidence/live-desktop-first-screen.png`.

## Clean checkout and declared claims

A separate checkout was detached at the implementation SHA before installing
the documented Node.js dependencies.

| Command | Result |
| --- | --- |
| `npm ci` | PASS — 190 packages installed; 0 vulnerabilities |
| `npm test` | PASS — 6/6 Vitest tests |
| `npm run build` | PASS — `dist/index.html` produced |
| `npm run test:e2e` | PASS — 14/14 browser tests |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

Every command in `.factory/claims.json` was run separately:

| Claim | Result |
| --- | --- |
| `demo-isolation` | PASS — 2/2 projects |
| `local-only` | PASS — 2/2 projects |
| `offline-reload` | PASS — 2/2 projects |
| `handoff-exports` | PASS — 2/2 projects, with the content-assertion gap above |
| `no-production-import` | PASS — 2/2 projects |

No declared command failed. CLAIM-3-001 records promises missing from or
incompletely checked by that registry.

## Live workflow evidence

The one-click sample loaded `migration-sample.csv` with three realistic customer
rows. The demo label stayed visible through handoff. The cleaned preview showed
customer IDs, email addresses, dates, activity values, and balances.

All four downloads contained data:

| File | Measured size |
| --- | ---: |
| JSON contract | 1,847 bytes |
| Cleaned CSV | 177 bytes |
| Markdown handoff report | 1,114 bytes |
| Issue CSV | 194 bytes |

Reset restored the first target to `customer_id`. Starting for real removed the
demo banner and restored the separately seeded `real-work.csv`. IndexedDB held
the distinct `csv-import-contract` and `demo:csv-import-contract` databases.
Every captured request in the flow used the product origin. No console or page
errors occurred. A populated phone screenshot is at
`/work/.evidence/live-phone-populated-handoff.png`.

Normal CSV and XLSX paths worked. A generated one-sheet XLSX displayed its
`Customers` worksheet and row. An empty CSV produced the actionable error
“This file is empty. Choose an export with a header row,” and a valid TSV then
recovered with a detected Tab delimiter. The prior impossible-date case still
produced two issues for `31/02/2025` and `2025-02-29`; approval stayed disabled,
while `2024-02-29` remained valid. A contract exported from the demo imported
against a second compatible source and restored its project and rules.

## Accessibility, PWA, routes, and delivery

- Independent Axe scans found zero serious or critical violations on root,
  demo, Privacy, Terms, offline, and 404 documents.
- The first Tab focused the visible skip link with a 3 px outline.
- Reduced motion changed the workspace animation to `0.00001 s`.
- Root and demo had no page overflow at 320 px or 390 px. Zoom is not disabled.
- Live demo reload retained the banner and sample while the browser was offline.
- A controlled local service-worker update displayed “An app update is ready.”
- Root, demo, Privacy, Terms, robots, and sitemap returned 200.
- `/no-such-route-verification-3` returned HTTP 404 and the designed recovery
  page, with correct title, focused heading, metadata, and footer. This is the
  expected missing-route response, not a defect.
- Internal route titles, canonical links, one `h1`, one `main`, footer links,
  and route focus passed. The labeled external contact link was not followed
  because this work order limits network access to this product.

Fresh mobile Lighthouse results were 100 Performance, 100 Accessibility, 100
Best Practices, and 100 SEO. LCP was 945 ms, TBT 0 ms, and CLS 0. The report is
`/work/.evidence/lighthouse-verify-3.json`.

The production build measured 32,437 B app JavaScript, 65,440 B lazy XLSX
JavaScript, and 18,741 B CSS. The mobile hero AVIF is 27,111 B.

Live root HTML, the hashed app JS and CSS, service worker, manifest, 404 page,
and route-focus script were SHA-256 identical to the clean build at the
implementation commit. Live headers include CSP, frame denial, feature policy,
referrer policy, and `nosniff`. The manifest has the correct MIME type, hashed
assets are immutable for one year, and the service worker is not cached.

## Earlier finding disposition

| Earlier finding | Current disposition |
| --- | --- |
| VALIDATION-001 impossible dates | Fixed; unit, browser, and independent live checks pass. |
| SEC-001 missing response policy | Fixed; required live headers are present. |
| PERF-001 cache policy | Fixed; hashed assets are immutable and the worker is no-store. |
| DEPLOY-001 manifest MIME | Fixed; live type is `application/manifest+json`. |
| R1 demo isolation | Fixed; separate databases, reset, and real-work preservation pass. |
| R2 first read | Fixed on phone and desktop. |
| R3 claims contract | Reopened by CLAIM-3-001; all listed commands pass, but coverage is incomplete. |
| R4 dead paid checkout | Fixed by keeping the unavailable paid offer absent. |
| R5 missing 404 | Fixed; the live missing route is a designed HTTP 404. |
| R6 unlisted claims | Reopened by the XLSX and repeat-contract promises in CLAIM-3-001. |
| R7 / F-2-1 route structure | Fixed; metadata, footers, and static-route focus pass. |
| R8 unclear copy | Fixed; current first-screen and action copy are plain. |
| F-2-2 no-import boundary | Fixed; copy and declared outcome test pass. |

This is a static local-first PWA. Backend tenant, server restart, health, and
429/Retry-After checks do not apply. No CLI, library, or desktop artifact is
shipped. The paid archive remains honestly absent until its Sociobot billing
product exists; that external dependency is not a finding against the free
product.

## Release decision

**FAIL — 3 findings and 3 untested public claims remain.**

Do not declare this candidate accepted until the findings are fixed and every
new or strengthened claim command passes from a clean checkout.
