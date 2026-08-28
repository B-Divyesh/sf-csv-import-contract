# Demo sandbox

Open [`/demo`](https://csv-import-contract.sociobot.in/demo), or use
`/?demo=1`, to start with `migration-sample.csv`. The sample has customer IDs,
email addresses, dates, activity values, and balances so the file profile,
field map, checks, and exports are useful immediately.

The demo uses IndexedDB database `demo:csv-import-contract`; the normal
workspace uses `csv-import-contract`. Demo mode never reads or writes the
normal database. **Reset demo** deletes the demo record and reloads the shipped
sample. **Start for real** deletes the demo record and opens `/`.
