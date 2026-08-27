# CSV Import Contract

CSV Import Contract is an offline-capable browser workbench for implementation
consultants and operations teams preparing CSV/XLSX exports for migration. It
turns parsing assumptions, mappings, deterministic transforms, validation rules,
and review sign-off into a portable import contract instead of another set of
undocumented spreadsheet edits.

Live: <https://csv-import-contract.sociobot.in>

## What it does

- Profiles CSV delimiter, quote, newline, encoding, row count, and column count.
- Reads the first worksheet from an XLSX locally and identifies it in the profile.
- Proposes stable target names, data types, and deterministic transforms.
- Applies required, unique, type, allowed-value, and regex validations.
- Keeps original row numbers and untouched values in issue evidence.
- Shows source and cleaned previews before handoff.
- Exports a versioned JSON contract, cleaned CSV, Markdown handoff report, and
  issue CSV; contract JSON can be imported against a compatible new source.
- Persists the current workspace in IndexedDB and works offline after first load.
- Includes a one-time Pro license path for a reusable multi-client archive. Core
  safety, accessibility, validation, and exports remain free.

No source rows are sent to a server. The only optional network request is a
license verification call when a Pro token is present.

## Develop and verify

Requires Node.js 22+.

```sh
npm install
npm run dev
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment command. It writes the static product to
`./dist`, with `dist/index.html` at its root. End-to-end tests build the product,
start the production preview, run the full 390 px workflow, scan with axe, and
reload offline. If Playwright cannot find Chromium, run `npx playwright install
chromium` once.

## Contract behavior

- Dates written as `DD/MM/YYYY` or `DD-MM-YYYY` normalize to ISO `YYYY-MM-DD`.
- Number coercion removes thousands separators only when deterministic.
- Boolean coercion recognizes true/false, yes/no, y/n, and 1/0.
- Coercive number/date/boolean transforms are flagged in the contract and report.
- An approval is forced back to draft if current validations fail.
- The app does not perform a production import; use the cleaned CSV for a test
  import in the receiving system.

The product brief is in [`.factory/brief.json`](.factory/brief.json), the unique
visual system and generated-asset provenance are in
[`.factory/design.md`](.factory/design.md), and release verification is in
[`.factory/handoff.md`](.factory/handoff.md).

## Privacy and licensing

Privacy and terms ship as static pages at `/privacy/` and `/terms/`. Checkout
and license verification use only the Sociobot billing API; no payment provider
is embedded. No analytics, remote fonts, or runtime CDN scripts are used.

## License

MIT. See [LICENSE](LICENSE).
