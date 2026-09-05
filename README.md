# CSV Import Contract

Prepare a repeatable CSV import plan for a system migration. It is for migration
teams who need another person to repeat a CSV import.

Try the isolated sample at
<https://csv-import-contract.sociobot.in/demo>.

## What it does

- Guides the file profile, field map, checks, and handoff steps.
- Exports a JSON import plan, cleaned CSV, handoff report, and issue CSV.
- Keeps source files and working data in the browser.
- Works offline after the first visit.
- Creates handoff files. It does not import data into another system.

The sample page uses a separate demo workspace. Reset demo restores the sample.
Start for real removes the demo workspace before opening the normal workspace.
Core exports are free.

## Run and verify

Requires Node.js 22+.

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

`npm run build` writes the static product to `./dist`, with `dist/index.html`
at its root. Browser tests include the tagged claim checks, keyboard and mobile
checks, Axe, offline reload, and privacy request checks.

## Privacy and legal

Read the [privacy policy](https://csv-import-contract.sociobot.in/privacy/) and
[terms](https://csv-import-contract.sociobot.in/terms/).

## License

MIT. See [LICENSE](LICENSE).
