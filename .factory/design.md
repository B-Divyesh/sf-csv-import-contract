# Visual thesis — blueprint drafting sheet

## Why this direction

An import contract is an engineering drawing for data: parsing assumptions are
dimensions, mappings are callouts, and validation failures are revision marks.
The interface therefore behaves like a clean drafting table rather than a
spreadsheet clone. A faint measured grid provides orientation; navy ink carries
the working content; cyan is the active drafting pencil; vermilion is reserved
for revisions that need attention. The result feels precise, calm, and suitable
for a client handoff.

This is an explicitly light, paper-like visual thesis. Dark mode is intentionally
not offered: the persistent pale blueprint sheet is part of the product's
meaning, and all operating-system modes are painted explicitly.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| paper | `#F3F0E7` | app background, warm drafting stock |
| paper-raised | `#FFFEF8` | inputs and active work surfaces |
| blueprint | `#12324A` | primary ink and headings |
| blueprint-muted | `#506675` | secondary copy |
| grid | `#C8D6DA` | measured grid and rules |
| cyan | `#087F8C` | action, focus, current step |
| cyan-dark | `#075B65` | accessible interactive text |
| safety | `#A33A2B` | errors and destructive warnings |
| amber | `#8A5A00` | non-destructive warnings |
| approved | `#2D6A4F` | successful checks |

All body and control pairs meet WCAG AA (4.5:1); state is reinforced with
icons/labels, never color alone.

## Typography

- **Drawing labels:** `"Arial Narrow", "Roboto Condensed", "Helvetica Neue", sans-serif`.
  Uppercase tracking is used sparingly for sheet numbers, step labels, and
  table headers. No network font is requested.
- **Working text:** `ui-monospace, "Cascadia Code", "SFMono-Regular", Consolas, monospace`.
  This keeps source values, column names, and row numbers visually exact.
- Scale: 12 / 14 / 16 / 20 / 28 / clamp(36–56) px; body is 16 px with 1.55
  line height and long copy is capped at 68 characters.

## Spacing, shape, and depth

- An 8 px base rhythm with 4 px micro-spacing; main gaps are 16, 24, 32, 48.
- Corners are clipped or 2–4 px, like paper and drafting tools—not pill-shaped.
- Hairline rules group dense tabular information; shadows appear only on the
  floating sheet/tool drawer and use hard, offset ink-like depth.
- Controls are at least 44 px high. On 390 px screens the step rail becomes a
  horizontally scrollable index, tables become stacked field cards, and the
  sticky action bar remains above the safe area.

## Interaction grammar

- The current phase is a numbered blueprint callout with a cyan rule.
- Changes mark the sheet as “unsaved” immediately; IndexedDB persistence returns
  it to “saved on this device.”
- Dangerous type coercions receive a vermilion revision flag before export.
- Preview cells expose original and cleaned values by focus/hover, and validation
  issues always retain source row and source value.
- Keyboard order follows the drafting sequence: source → mapping → rules → review.

## Motion policy

Panels settle upward by 8 px over 180 ms and status marks fade over 150 ms.
Nothing loops. Motion is restricted to opacity and transform. Under
`prefers-reduced-motion: reduce`, transitions and animated scrolling are removed
and state changes are instantaneous while hierarchy remains intact.

## Asset plan and provenance

- One original generated hero illustration: an axonometric drafting table where
  a messy stack of spreadsheet strips passes through a transparent alignment jig
  and exits as a precise, stamped data contract. It explains the transformation
  from opaque cleanup to reviewable specification; it is not a UI screenshot.
- Small interface marks (ruler ticks, registration cross, document/folder icons)
  are hand-authored CSS/SVG geometry and are licensed with the app.
- Output formats: source PNG retained under `assets/src/`; optimized responsive
  WebP/AVIF in `public/assets/`, with the mobile WebP below 300 KB.

### Prompt sheet

- Use case: `stylized-concept`
- Subject: axonometric architect's drafting table; untidy spreadsheet strips
  entering a transparent measuring/alignment jig; one precise contract sheet
  exiting, with check marks and registration marks only.
- World/materials: warm vellum, navy technical ink, translucent cyan acrylic,
  brushed steel ruler, subtle paper fibers.
- Light/lens: soft overcast studio light, clean axonometric/isometric view,
  generous negative space, crisp edges.
- Palette words: warm ivory paper, deep blueprint navy, restrained cyan,
  tiny vermilion revision accents.
- Negative list: readable words, letters, numbers, logos, watermarks, people,
  hands, brand marks, glossy corporate 3D, neon gradients, illegible pseudo-text,
  excessive clutter.
- Generator: Azure AI Foundry image deployment `factory-image`, via
  `/opt/fleet/lib/gen-image.sh`.
- Date: 2026-08-27. Generated imagery is original to this product and disclosed
  in the footer.
