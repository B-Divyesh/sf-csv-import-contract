# Adversarial first-read review 2 — CSV Import Contract

**Date:** 2026-08-28  
**Reviewed URL:** <https://csv-import-contract.sociobot.in>  
**Verdict: FAIL**

This was a fresh, unauthenticated review at 390 × 844 and 1440 × 900, followed
by a clean-clone test run. The primary job and demo are clear and work. The
verdict remains FAIL because the earlier route-structure finding is only partly
fixed; under the review contract, a half-fixed earlier finding is BLOCKING.

## Cold first read

Before scrolling, the page said:

> “Prepare a CSV import contract”  
> “For migration teams who need another person to repeat a CSV import.”  
> “Try it with sample data” — “See a filled contract, checks, and handoff
> files now.”

My first-read answer is: it prepares a repeatable CSV import plan for migration
teams; I should choose **Try it with sample data** first. This was equally clear
at 390 px and desktop. The primary action was visible at y=370–417 on the
phone. There were no console errors in either fresh context.

## Findings

### BLOCKING — F-2-1 (R7, half-fixed): Route metadata, footer links, and route-change focus are still incomplete

**Exact location / evidence:**

- A live direct visit to `/no-such-route` correctly returns HTTP 404 and says
  “This page does not exist,” but its document has no `og:*` or `twitter:*`
  metadata and no Apple touch icon. This is also visible in
  `public/404.html`, which contains only a description, canonical link, and
  SVG favicon.
- The live Privacy footer is “Terms · Workspace · Built by Param Factory ·
  build 1.0.0”; the live Terms footer is “Privacy · Workspace · Built by Param
  Factory · build 1.0.0.” Each omits one of the required Privacy/Terms links.
- Clicking the root header’s “Privacy” link in a fresh 390 px browser lands at
  `/privacy/` with `document.activeElement === BODY`. Its `h1` (“Privacy”) has
  no `tabindex` and receives no focus. The same static-page pattern applies to
  Terms and the 404 page.

**Why this is blocking:** Review 1’s R7 required metadata and a shared route
structure on every route. Root, Demo, Privacy, and Terms now have canonical,
OG/Twitter, and favicon metadata, so most of R7 is repaired; the designed 404
and legal-page footer/focus behavior remain partial. A keyboard or screen-reader
visitor gets no announced destination after navigation, and shared legal links
are inconsistent. The instructions require a half-fixed earlier finding to be
reported again as BLOCKING with its prior id.

**Concrete fix:** Add the same original social image, OG/Twitter tags, and
Apple-touch icon to `public/404.html`. Put both **Privacy** and **Terms** in
every footer (including the page currently open), plus the product one-liner.
On each static route, make the new `h1` or `main` programmatically focusable
and focus it on `DOMContentLoaded`; include an `aria-live="polite"` route
announcement where routing is client-side. Add browser coverage that follows
root → Privacy, root → Terms, and a 404 direct load, asserts the focused
heading/main, footer links, and all required metadata.

### MINOR — F-2-2: The landing page does not plainly state the no-import boundary

**Exact location / evidence:** The closest landing text is “Check a CSV before
import.” The explicit boundary appears only in Terms: “It does not run a
production import.” The brief makes “No production import execution” a product
constraint, and the required landing structure includes a plain “what it does
not do” statement.

**Why a first-time visitor can be misled:** “CSV Import Contract” and “import
plan” are clear to specialists, but a migration operator can still assume the
tool sends data to the receiving system. That is the decision boundary that
matters before they choose a source file.

**Concrete fix:** Add a short root-page fact or privacy boundary such as:
“Does not import data into another system.” Add a `no-production-import` claim
and demo test that completes the sample flow and verifies that it only creates
downloads and no external import request.

## Demo and sandbox verification

The one-click path passes the required functional review.

- Root **Try it with sample data** navigated to `/demo` in one click.
- The first demo screen already contained `migration-sample.csv`, three
  realistic customer rows (IDs, email, dates, activity values, balances), the
  source profile, and the active product step rail.
- The persistent banner read: “Demo — sample data, nothing is saved”; it also
  exposed **Reset demo** and **Start for real**.
- **Reset demo** restored the original sample. **Start for real** returned to
  `/` without the sample or banner. The code uses
  `demo:csv-import-contract` for demo storage and `csv-import-contract` for
  normal storage; `src/main.ts` never calls `loadProject` in demo mode.
- A live request log for the root → demo → validation flow contained only
  `https://csv-import-contract.sociobot.in`. No console errors occurred.

## Claims audit

`.factory/claims.json` has four entries. From a clean clone at
`/tmp/csv-import-contract-review2`, all commands passed (two Playwright
projects each):

| Claim id | Declared claim | Command | Result |
| --- | --- | --- | --- |
| `demo-isolation` | Sample demo uses a separate workspace and never changes real work. | `npm run test:e2e -- --grep @claim:demo-isolation` | PASS, 2/2 |
| `local-only` | Source files and working data stay in this browser; demo requests are same-origin. | `npm run test:e2e -- --grep @claim:local-only` | PASS, 2/2 |
| `offline-reload` | Works offline after the first visit. | `npm run test:e2e -- --grep @claim:offline-reload` | PASS, 2/2 |
| `handoff-exports` | Core exports are free. | `npm run test:e2e -- --grep @claim:handoff-exports` | PASS, 2/2 |

The tests use `/demo` or `?demo=1` from fresh contexts. The local-only test
records requests; the isolation test seeds ordinary work, edits/resets demo
work, then verifies ordinary work; the offline test reloads after
`context.setOffline(true)`; and the export test observes JSON, cleaned CSV,
report, and issue-CSV downloads. No declared claim failed. The landing and
README privacy, offline, demo-isolation, and export statements map to these
four entries; no additional visitor-reliance claim was found in this audit.

## Copy audit

Word counts treat a slash-separated file type as one word, exclude URLs and
code blocks, and include visible labels/actions separately. No sentence exceeds
22 words. No banned marketing adjective appears. “CSV import contract,”
“CSV/XLSX file,” “field map,” “handoff files,” and “demo” are used consistently.

### Landing sentences

| Visible sentence | Words | Result |
| --- | ---: | --- |
| For migration teams who need another person to repeat a CSV import. | 12 | Pass |
| See a filled contract, checks, and handoff files now. | 9 | Pass; explains the sample result. |
| Files stay on this device. | 5 | Listed `local-only` claim. |
| Works offline after first visit. | 5 | Listed `offline-reload` claim. |
| Core exports are free. | 4 | Listed `handoff-exports` claim. |
| Check a CSV before import. | 5 | Pass. |
| Choose a CSV or XLSX file. | 6 | Pass. |
| Set the field map and checks before another person imports it. | 11 | Pass. |
| Or drop a file here. | 5 | Pass. |
| It stays on this device. | 5 | Listed `local-only` claim. |
| CSV import plans for repeatable migration handoffs. | 7 | Pass. |

Visible landing labels/headings/actions also checked: “Skip to workspace” (3),
“CSV Import Contract” (3), “Try sample” (2), “Privacy” (1), “Ready” (1),
“Sheet 01 / Rev 1.0.0” (4), “CSV import plan for migration teams” (6),
“Prepare a CSV import contract” (5), “Try it with sample data” (6),
“01 — choose a source file” (5), “Choose a CSV or XLSX” (5),
“01 / Choose a file” (4), “02 / Set field rules” (4),
“03 / Export handoff files” (4), “Built by Param Factory · build 1.0.0” (6),
and “Contract 1.0.0” (2). The primary action is a result-naming verb and is
clear. “Try sample” is a secondary navigation label, not the primary task
button, and accurately links to the sample.

### README sentences

| README sentence | Words | Result |
| --- | ---: | --- |
| Prepare a repeatable CSV import plan for a system migration. | 10 | Pass. |
| It is for migration teams who need another person to repeat a CSV import. | 14 | Pass. |
| Try the isolated sample at. | 5 | Pass; URL follows. |
| Guides the file profile, field map, checks, and handoff steps. | 10 | Pass. |
| Exports a JSON import plan, cleaned CSV, handoff report, and issue CSV. | 12 | Listed `handoff-exports` claim. |
| Keeps source files and working data in the browser. | 9 | Listed `local-only` claim. |
| Works offline after the first visit. | 6 | Listed `offline-reload` claim. |
| The sample page uses a separate demo workspace. | 8 | Listed `demo-isolation` claim. |
| Reset demo restores the sample. | 5 | Listed `demo-isolation` behavior. |
| Start for real removes the demo workspace before opening the normal workspace. | 12 | Listed `demo-isolation` behavior. |
| Core exports are free. | 4 | Listed `handoff-exports` claim. |
| Requires Node.js 22+. | 3 | Pass. |
| `npm run build` writes the static product to `./dist`, with `dist/index.html` at its root. | 14 | Pass. |
| Browser tests include the tagged claim checks, keyboard and mobile checks, Axe, offline reload, and privacy request checks. | 18 | Pass; developer verification statement. |
| Read the privacy policy and terms. | 6 | Pass. |
| MIT. | 1 | Pass. |
| See LICENSE. | 2 | Pass. |

README headings (“CSV Import Contract,” “What it does,” “Run and verify,”
“Privacy and legal,” and “License”) are all intelligible out of context. No
copy rewrite is required beyond F-2-2’s missing boundary statement.

## History, structure, and quality checks

| Earlier finding | Live/code confirmation |
| --- | --- |
| R1 demo sandbox | Fixed: `/demo` and `?demo=1`, separate IndexedDB name, banner, reset, and exit behavior are present. |
| R2 cold first read | Fixed: plain job, named user, visible sample action, and three facts pass at 390 px and desktop. |
| R3 claims | Fixed: registry, demo documentation, and all four tagged commands pass from a clean clone. |
| R4 dead Pro checkout | Fixed: paid checkout/license copy and dead link are absent. |
| R5 missing 404 | Fixed: `/no-such-route` returns HTTP 404 with a designed recovery page. |
| R6 unlisted claims | Fixed for current landing/README reliance statements; they map to the four listed claims. |
| R7 route metadata/shared structure | **Half-fixed; see blocking F-2-1.** |
| R8 unclear copy/buttons | Fixed on the landing: no prior “workbench,” “safe sample,” or Pro wording remains. |

Additional checks:

- `npm test` passed 6/6; `npm run build` produced `dist/`; `npm run test:e2e`
  passed 12/12 in the clean clone.
- Live axe scans at 390 px found zero serious/critical violations on `/`,
  `/demo`, `/privacy/`, `/terms/`, and the 404 response.
- Root, Demo, Privacy, Terms, and the external `https://sociobot.in/` link all
  returned 200. The sitemap and robots file returned 200; the missing route
  returned 404.
- Root, Demo, Privacy, and Terms have one h1, one main, title, description,
  canonical, OG/Twitter metadata, favicon, and Apple icon. The 404 lacks the
  latter metadata/icon set as recorded in F-2-1.
- The warm drafting-sheet grid, technical illustration, clipped controls, and
  navy/cyan/vermilion system match `.factory/design.md` and are distinct from a
  generic SaaS template. No AI feature is expected by the brief; importing,
  exporting, and local handoff are already present.

## What would make this perfect

Complete F-2-1’s every-route metadata, footer, and focus contract, then add the
plain no-production-import boundary and its test from F-2-2. Re-run this full
review from a fresh browser context and clean clone. A PASS requires zero
findings.
