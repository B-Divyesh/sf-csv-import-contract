# Adversarial first-read review 1 — CSV Import Contract

**Date:** 2026-08-28  
**Reviewed URL:** <https://csv-import-contract.sociobot.in>  
**Verdict: FAIL**

This is a first-time, unauthenticated review. It fails because the advertised
sample path is not an isolated demo, the required claim contract is absent,
the first screen does not name the audience, and the paid checkout link is
dead. BLOCKING findings are listed first.

## Cold first read

Fresh Playwright contexts were opened at 390 × 844 and 1440 × 900 before any
scrolling. Both showed the same opening copy:

> “Local migration workbench”  
> “Make the import repeatable.”  
> “Turn parsing assumptions, column decisions, and validation rules into a
> contract another person can run—not another undocumented cleanup.”

My best inference was: it helps someone make a repeatable import process. I
could not tell from that first screen **for whom** it is intended; neither
“implementation consultant,” “operations staff,” nor “migration team” appears.
I also could not tell what is being imported until the lower “Choose a CSV or
XLSX” control. On the phone the sample action starts at y=806 and is clipped by
the 844 px viewport. The correct first action is therefore not immediately
clear, and “Try a safe sample” does not say what result it will show.

This fails the required what / who / first-action first read.

## Findings

### BLOCKING — R1: The sample is not a demo sandbox

**Quote / evidence:** The only action is “Try a safe sample.” Opening
`/?demo=1` in a fresh context showed no sample, no source, and no demo banner.
After clicking the action, the product showed a useful realistic
`migration-sample.csv` preview (three data rows), but the browser database was
`csv-import-contract`, store `projects`, record `id: "current"`. That is the
same real-workspace record used by normal uploads. There was no “Demo — sample
data, nothing is saved” banner, “Reset demo,” or “Start for real” control.

**Why this loses or misleads a first-time visitor:** “Safe” suggests a
non-destructive trial, but the trial occupies the normal persisted workspace.
It can overwrite a visitor’s real current project and provides no way to reset
or leave the sample state. The catalog/verifier URL cannot enter a preloaded
demo either.

**Concrete fix:** Make `/demo` (and `?demo=1`) load the existing sample before
paint, use an independent `demo:` IndexedDB database/key namespace, never read
or write the normal record while demo is active, and display a persistent
banner: “Demo — sample data, nothing is saved.” Include `Reset demo` and
`Start for real`; leaving demo must discard its namespace. Add
`.factory/demo.md` documenting this URL, sample, reset behaviour, and namespace.
Add an `@claim:demo-isolation` browser test that seeds real data, enters demo,
mutates/resets it, then proves the real record is unchanged.

### BLOCKING — R2: The opening screen does not identify the visitor or job

**Quote:** “Make the import repeatable.” / “Local migration workbench.”

**Why this loses a first-time visitor:** The headline does not say CSV/XLSX,
does not name the migration-preparation job, and does not say who should use
it. “Workbench,” “parsing assumptions,” and “column contract” assume product
context. On a phone the primary decision is below the opening copy, and the
secondary “Try a safe sample” is not the required result-naming verb.

**Concrete fix:** Replace the first-screen copy with:

> **Prepare a CSV import contract**  
> For migration teams who need another person to repeat a CSV import.  
> **Try it with sample data** — see a filled contract, checks, and handoff
> files now.

Put three short facts next to that action: “Files stay on this device,” “Works
offline after first visit,” and “Core exports are free.” Each fact needs its
claim test below.

### BLOCKING — R3: Required claims registry and executable claim tests are absent

**Quote / evidence:** `.factory/claims.json` does not exist. There are no
`@claim:` tags in the repository, and `.factory/demo.md` does not exist.
Consequently there was no listed claim test to run from a clean install. The
ordinary suites passed (`npm test`: 6 tests; `npm run test:e2e`: 8 tests), but
neither is a declared claim test.

**Why this loses or misleads a visitor:** The page and README make reliance
claims about local processing, privacy, offline use, exports, validation, price,
and licensing without the contract that proves them in the advertised demo.
Passing general regression tests is not evidence that each promise is true in a
fresh visitor flow.

**Concrete fix:** Add `.factory/claims.json` with one executable
`@claim:<id>` test per claim, starting with `offline-reload`, `local-only`,
`csv-export`, `demo-isolation`, and `pro-checkout`. Tests must use `/demo` from
a new browser context and assert observable output. Remove any claim that
cannot be tested. See the unlisted-claim inventory below for the copy that must
be covered or removed.

### BLOCKING — R4: The Pro purchase action is a dead link

**Quote:** “Buy Pro securely · $29” links to
`https://api.sociobot.in/api/v1/products/csv-import-contract/checkout`.

**Why this loses or misleads a visitor:** A visitor can read a paid offer and
reach a 404 instead of checkout. This makes the price and “securely” promise
unverifiable.

**Concrete fix:** Configure the published checkout endpoint, test a fresh
navigation to its expected non-error handoff, and add an `@claim:pro-checkout`
claim test. Until it works, remove the Pro button and all paid-access copy.

### BLOCKING — R5: Unknown routes present the home page instead of a designed 404

**Quote / evidence:** A live visit to `/no-such-route` returned HTTP 200 with
the home title and “Make the import repeatable.” It did not identify the
missing page or provide a contextual return action.

**Why this loses or misleads a visitor:** A mistyped or shared URL silently
pretends to be the workbench, so the address bar, back button, and page meaning
no longer agree. This is broken routing, not an intentional 404 experience.

**Concrete fix:** Add a styled 404 route that returns 404, says “This page does
not exist,” and links to the workbench. Give meaningful product states real
URLs (at minimum `/demo`) and on route changes update title, move focus to the
new h1, and announce it. Test direct loads, reloads, Back, and focus for every
route.

### Major — R6: Claim-like copy is unlisted

The following visitor-reliance statements have no claims entry because the
registry is absent. Each is an unlisted-claim finding until removed or covered
by a specific test.

| Location | Unlisted claim-like sentence / line |
| --- | --- |
| Landing | “We’ll reveal its parsing assumptions, propose a column contract, and keep every source value on your device.” |
| Landing | “or drop it here · processed locally” |
| Landing | “Files and working data stay in this browser.” |
| Landing Pro dialog | “The free workbench always includes profiling, all safety rules, and every export.” |
| Landing Pro dialog | “Pro adds a reusable multi-client project archive for a one-time $29.” |
| Landing Pro dialog | “Refunds are handled there and revoke the license automatically.” |
| README | “CSV Import Contract is an offline-capable browser workbench…” |
| README | “Profiles CSV delimiter, quote, newline, encoding, row count, and column count.” |
| README | “Reads the first worksheet from an XLSX locally and identifies it in the profile.” |
| README | “Proposes stable target names, data types, and deterministic transforms.” |
| README | “Applies required, unique, type, allowed-value, and regex validations.” |
| README | “Keeps original row numbers and untouched values in issue evidence.” |
| README | “Shows source and cleaned previews before handoff.” |
| README | “Exports a versioned JSON contract, cleaned CSV, Markdown handoff report, and issue CSV…” |
| README | “Persists the current workspace in IndexedDB and works offline after first load.” |
| README | “Includes a one-time Pro license path…” |
| README | “No source rows are sent to a server.” |
| README | “The only optional network request is a license verification call…” |
| README | Every behaviour assertion under “Contract behavior,” including deterministic date/number/boolean coercion, original evidence, approval blocking, and no production import. |
| README | “Checkout and license verification use only the Sociobot billing API; no payment provider is embedded.” |
| README | “No analytics, remote fonts, or runtime CDN scripts are used.” |

For an exploratory check, a fresh sample flow made only same-origin requests;
and a sample saved under normal storage reloaded offline after the first visit.
Those are encouraging observations, not claim verification, because the
required `/demo` sandbox and tagged tests do not exist.

### Major — R7: Route metadata and shared structure are incomplete

**Evidence:** Root has a valid title, one h1, description, canonical, main,
and a skip link. `/privacy/` and `/terms/` have one h1/main and valid title
order, but neither has a canonical link, OG metadata, Twitter metadata, SVG
favicon, skip link, or the root header/footer structure. No page has OG/Twitter
metadata or a 1200 × 630 social image. The root header contains no Demo or
Privacy navigation; legal footers omit “Built by Param Factory” and a build id.

**Why it matters:** Shared routes do not provide a consistent navigation or
metadata contract, and shared links/pages have a poorer keyboard first stop.

**Concrete fix:** Supply canonical/OG/Twitter metadata and original social art
on every route; add SVG and Apple icons; use the same header, skip link, nav,
and footer on legal pages; include Demo and Privacy in the header. Keep the
existing distinct blueprint-drafting visual direction—it is product-specific,
not a generic SaaS template.

### Minor — R8: Copy uses unexplained internal terms and non-result buttons

**Quote:** “Local migration workbench”; “parsing assumptions”; “column
contract”; “Define the receiving shape”; “A portable agreement”; “Unlock Pro”;
“Try a safe sample.”

**Why it matters:** These words delay a cold reader’s understanding and the
buttons do not name what happens.

**Concrete fix:** Use “CSV import plan,” “how this file is read,” “field map,”
“Set the output fields,” “Export handoff files,” “View Pro archive,” and “Try
it with sample data.”

## Copy audit

Word counts treat numbers and slash-separated file types as words. “Flag”
includes jargon, unclear out-of-context headings, inconsistent terminology,
non-result buttons, and sentences over 22 words. The inventory includes all
visitor-facing landing strings in the initial page (including the closed Pro
dialog) and every prose sentence/bullet in README; code blocks and URLs are
excluded.

### Landing page

| # | Copy | Words | Flag / proposed rewrite |
| --- | --- | ---: | --- |
| 1 | CSV / import contract | 3 | Inconsistent with product name. Use “CSV Import Contract.” |
| 2 | Local & online | 2 | Conflicts with local/offline positioning. Use “Files stay on this device” (with a claim test). |
| 3 | Unlock Pro | 2 | Not result-naming. Use “View Pro archive” after checkout works. |
| 4 | Local migration workbench | 3 | Jargon/no audience. Use “For migration teams.” |
| 5 | Make the import repeatable. | 4 | Job is too vague. Use “Prepare a CSV import contract.” |
| 6 | Turn parsing assumptions, column decisions, and validation rules into a contract another person can run—not another undocumented cleanup. | 19 | Jargon and two ideas. Use the R2 subhead. |
| 7 | Active source | 2 | Clear enough after a source is loaded. |
| 8 | data rows · never uploaded | 4 | Claim; test or use “data rows” only. |
| 9 | establish source | 2 | Internal wording. Use “Choose a CSV or XLSX.” |
| 10 | Inspect before you import. | 4 | Object is missing. Use “Check a CSV before import.” |
| 11 | Open a CSV or Excel export. | 7 | Clear. |
| 12 | We’ll reveal its parsing assumptions, propose a column contract, and keep every source value on your device. | 17 | Jargon and compound claim. Use “Check how the file is read. Map its fields before import.” |
| 13 | Choose a CSV or XLSX | 5 | Clear real first action. |
| 14 | or drop it here · processed locally | 6 | Claim and fragment. Use “Drop a file here. It stays on this device.” |
| 15 | Try a safe sample | 4 | Not a result-naming demo action. Use “Try it with sample data.” |
| 16 | Read locally | 2 | Claim fragment; test or remove. |
| 17 | Make rules explicit | 3 | Vague. Use “Set field rules.” |
| 18 | Hand off evidence | 3 | Vague. Use “Export handoff files.” |
| 19 | Files and working data stay in this browser. | 8 | Privacy claim; add `local-only` test. |
| 20 | Original generated illustration · CSV Import Contract v1 | 7 | Acceptable provenance, but use the product name consistently. |
| 21 | Ready | 1 | Status lacks meaning. Use “Ready to choose a file.” |
| 22 | Contract 1.0.0 | 2 | Clear after a project is loaded. |
| 23 | Reusable practice | 2 | Meaningless out of context. Use “Reuse projects across clients.” |
| 24 | Unlock Pro once | 3 | Not result-naming. Use “Buy a one-time Pro archive.” |
| 25 | The free workbench always includes profiling, all safety rules, and every export. | 11 | Untested product claim. Use only after a coverage test. |
| 26 | Pro adds a reusable multi-client project archive for a one-time $29. | 12 | Untested price/feature claim; checkout is dead. Remove until tested. |
| 27 | Buy Pro securely · $29 | 4 | Claim and dead link. Use after R4 is repaired/tested. |
| 28 | Have a license? Paste it here | 6 | Clear enough. |
| 29 | Verify license | 2 | Result-naming enough. |
| 30 | Sociobot/Dodo is the merchant of record. | 6 | Legal/payment claim; test or retain only on Terms if legally required. |
| 31 | Refunds are handled there and revoke the license automatically. | 9 | Untested legal/behaviour claim. State the actual refund route and test revocation. |

Terminology varies between “CSV Import Contract,” “CSV / import contract,”
“contract,” “column contract,” “workbench,” “source,” “export,” and
“handoff.” Use **CSV import contract** for the artifact, **CSV/XLSX file** for
the input, **field map** for mappings, and **handoff files** for exports.

### README

| # | Copy | Words | Flag / proposed rewrite |
| --- | --- | ---: | --- |
| 1 | CSV Import Contract | 3 | Product name, clear. |
| 2 | CSV Import Contract is an offline-capable browser workbench for implementation consultants and operations teams preparing CSV/XLSX exports for migration. | 20 | Jargon/claim. Use “Prepare a repeatable CSV import plan for a system migration.” |
| 3 | It turns parsing assumptions, mappings, deterministic transforms, validation rules, and review sign-off into a portable import contract instead of another set of undocumented spreadsheet edits. | 24 | >22 and jargon. Use “Save the field map and checks another person needs to repeat the import.” |
| 4 | What it does | 4 | Clear enough heading. |
| 5 | Profiles CSV delimiter, quote, newline, encoding, row count, and column count. | 10 | Jargon/claim. Use “Shows how the CSV is structured.” |
| 6 | Reads the first worksheet from an XLSX locally and identifies it in the profile. | 13 | Claim. Use “For XLSX files, uses the first sheet.” |
| 7 | Proposes stable target names, data types, and deterministic transforms. | 10 | Jargon/claim. Use “Suggests output field names and conversions.” |
| 8 | Applies required, unique, type, allowed-value, and regex validations. | 9 | “regex” jargon. Use “Checks required fields, duplicates, types, allowed values, and patterns.” |
| 9 | Keeps original row numbers and untouched values in issue evidence. | 10 | Claim. Use “Issue reports show the original row and value.” |
| 10 | Shows source and cleaned previews before handoff. | 8 | Claim. Use “Preview source and cleaned rows before export.” |
| 11 | Exports a versioned JSON contract, cleaned CSV, Markdown handoff report, and issue CSV; contract JSON can be imported against a compatible new source. | 22 | Dense/jargon. Split: “Export a JSON import contract, cleaned CSV, report, and issue CSV. Reuse the JSON with a compatible file.” |
| 12 | Persists the current workspace in IndexedDB and works offline after first load. | 11 | Browser-storage jargon/claim. Use “Saves the current work in this browser. It works offline after the first visit.” |
| 13 | Includes a one-time Pro license path for a reusable multi-client archive. | 11 | Product claim. Use “Pro adds an archive for reusable client projects.” |
| 14 | Core safety, accessibility, validation, and exports remain free. | 8 | Product claim. Use “The free plan includes checks and exports.” |
| 15 | No source rows are sent to a server. | 9 | Privacy claim; claim-test it. |
| 16 | The only optional network request is a license verification call when a Pro token is present. | 15 | Privacy claim; claim-test it. |
| 17 | Develop and verify | 3 | Clear developer heading. |
| 18 | Requires Node.js 22+. | 3 | Clear. |
| 19 | `npm run build` is the deployment command. | 5 | Clear. |
| 20 | It writes the static product to `./dist`, with `dist/index.html` at its root. | 12 | Clear. |
| 21 | End-to-end tests build the product, start the production preview, run the full 390 px workflow, scan with axe, and reload offline. | 22 | Dense. Split into two sentences. |
| 22 | If Playwright cannot find Chromium, run `npx playwright install chromium` once. | 11 | Clear. |
| 23 | Contract behavior | 2 | Vague heading. Use “How file checks and conversions work.” |
| 24 | Dates written as `DD/MM/YYYY` or `DD-MM-YYYY` normalize to ISO `YYYY-MM-DD` only when they are real calendar dates; impossible dates and non-leap-year 29 February values remain validation errors with their original source evidence. | 35 | >22. Split into two plain sentences. |
| 25 | Number coercion removes thousands separators only when deterministic. | 8 | “coercion/deterministic” jargon. Use “Number conversion removes thousands separators only when the result is unambiguous.” |
| 26 | Boolean coercion recognizes true/false, yes/no, y/n, and 1/0. | 9 | “coercion” jargon. Use “Boolean conversion accepts true/false, yes/no, y/n, and 1/0.” |
| 27 | Coercive number/date/boolean transforms are flagged in the contract and report. | 9 | Jargon. Use “The contract and report flag number, date, and yes/no conversions.” |
| 28 | An approval is forced back to draft if current validations fail. | 10 | Jargon. Use “A changed or failing check changes approval back to Draft.” |
| 29 | The app does not perform a production import; use the cleaned CSV for a test import in the receiving system. | 20 | Clear but product claim; split for scanability. |
| 30 | The product brief is in `.factory/brief.json`, the unique visual system and generated-asset provenance are in `.factory/design.md`, and release verification is in `.factory/handoff.md`. | 18 | Repository detail; not visitor copy. Move to contributor docs. |
| 31 | Privacy and terms ship as static pages at `/privacy/` and `/terms/`. | 10 | Clear. |
| 32 | Checkout and license verification use only the Sociobot billing API; no payment provider is embedded. | 13 | Claim; checkout is currently dead. |
| 33 | No analytics, remote fonts, or runtime CDN scripts are used. | 9 | Claim; add a network test. |
| 34 | License | 1 | Clear. |
| 35 | MIT. | 1 | Clear. |
| 36 | See LICENSE. | 2 | Clear. |

## Verification record

| Check | Result |
| --- | --- |
| Fresh live first read, 390 px and desktop | Failed R2. No console errors observed. |
| One-click sample | Sample data appears immediately, but failed R1 isolation/banner/reset/direct-entry checks. |
| Demo URL | `/?demo=1` returns the blank real workspace; `/demo` is the same fallback page. |
| Demo storage | Failed: sample saved in normal `csv-import-contract` / `projects` / `current` record. |
| Offline and privacy exercise | Same-origin requests only during the exploratory flow; a saved sample reloaded offline. Not claim proof because there is no demo sandbox or claim test. |
| Claim registry/tests | Failed: no `.factory/claims.json`, no `.factory/demo.md`, no `@claim:` tests. |
| Local quality commands | `npm ci`, `npm test` (6/6), `npm run build`, and `npm run test:e2e` (8/8) passed. |
| Accessibility regression | Existing E2E Axe checks reported zero serious/critical issues. |
| Link crawl | Root, Privacy, Terms, sitemap, robots, and sociobot.in returned 200; the Pro checkout endpoint returned 404. |
| Metadata | Root basics pass; R7 failures found on legal routes and all social metadata. |
| Visual identity | Pass: the drafting-sheet palette, grid, and original technical illustration are distinct and match `.factory/design.md`. |

## Verdict rule

There are five BLOCKING findings and two additional severity findings. This is
therefore **FAIL**; it cannot meet the PASS threshold of zero BLOCKING findings
and at most three minor findings.
