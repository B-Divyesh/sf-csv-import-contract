# Build handoff — CSV Import Contract

Work order: `csv-import-contract-build-1`

Completed: 2026-08-27

Deploy type: static PWA; output is `dist/`

## What shipped

- A complete local four-stage workflow: source profile, mapping/transforms,
  validations, and reviewable handoff.
- CSV syntax detection for delimiter, quote, newline, UTF-8, uneven rows, empty
  headings, and duplicate headings; XLSX parsing is lazy-loaded and profiles the
  first worksheet.
- Deterministic trim, case, number, date, and boolean transforms with warnings
  for coercive operations.
- Required, unique, inferred-type, allowed-value, and regex checks. Issue output
  always includes original source row and original value.
- Visible source/cleaned previews plus exports for versioned contract JSON,
  cleaned CSV, Markdown handoff report, and issue evidence CSV. Contract JSON can
  be imported against a subsequent source.
- Prepared-by, reviewed-by, semantic contract version, and draft/approved review
  sign-off. A failing validation cannot be exported as approved.
- IndexedDB current-project persistence, explicit exports, install manifest,
  versioned service-worker shell, asset caching, offline fallback, online/offline
  status, and update-ready notice.
- One-time $29 Pro unlock through the required Sociobot checkout/verify endpoints,
  daily verdict cache, URL token capture/cleanup, restore field, quiet revocation
  handling, and an implemented multi-client project archive. Safety and exports
  are never paywalled.
- Static privacy and terms pages, MIT license, responsive 390 px layout, keyboard
  focus treatment, reduced-motion mode, and no analytics/CDNs/remote fonts.
- A product-specific blueprint drafting visual system and an original generated
  alignment-jig illustration. Source, prompt sidecars, responsive AVIF/WebP/JPEG,
  icon source, and provenance are retained in the repository.

## How to run and deploy

```sh
npm install
npm test
npm run build
npm run test:e2e
```

Factory deploy command: `npm run build`

Deploy directory: `dist` (`dist/index.html` is present)

The release environment should register the billing product for slug
`csv-import-contract`; the client intentionally contains no product ID or secret.

## Verification performed

- `npm test`: 4/4 unit tests passed (syntax, quoting, stable headings,
  transforms, source evidence, CSV escaping, versioned contract).
- `npm run test:e2e`: 2/2 Playwright tests passed at 390×844. Covered sample
  ingest, all four steps, output readiness, IndexedDB restoration, a real
  `context.setOffline(true)` reload, privacy/terms landmarks, console errors,
  and axe. Serious/critical axe violations: 0.
- `npm audit --omit=dev`: 0 vulnerabilities.
- Production output: initial JS 35.14 KB (12.22 KB gzip), lazy XLSX chunk 65.44
  KB (19.34 KB gzip), CSS 17.32 KB (4.51 KB gzip). Largest hero variant is 131
  KB; served AVIF is 75 KB desktop / 27 KB mobile.
- Lighthouse mobile against the production preview: Performance 100,
  Accessibility 100, Best Practices 100, SEO 100. FCP 1.0 s, LCP 1.6 s, CLS 0,
  Total Blocking Time 0 ms, Time to Interactive 1.6 s.
- Manual visual review completed at 1440×1000 and 390×844. The generated hero
  was inspected at source resolution for text artifacts, brands, and seams.

## Known limits / next steps

- XLSX intentionally uses the first worksheet and says which sheet was used. A
  worksheet picker would be the next enhancement for workbooks containing
  multiple candidate exports.
- CSV text decoding is UTF-8 only. Legacy encodings should be re-exported as
  UTF-8 so parsing is deterministic and reviewable.
- Contract signatures are named workflow sign-offs, not cryptographic signatures.
- The tool prepares and verifies handoff artifacts; it deliberately does not
  connect to databases or execute production imports.
