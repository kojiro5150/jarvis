# Sprint 3.54 — Operational Validation Report Browser

The report browser reads JSON reports directly from the existing, gitignored
`data/validation-reports/` directory. It does not create an index or retain report metadata.

Run it with:

```text
npm run validation-reports -- list
npm run validation-reports -- latest
npm run validation-reports -- show <runId>
npm run validation-reports -- summary <runId>
```

`list` reads the run ID and generated timestamp from every report. `latest` and `show` emit
the selected report bytes exactly as stored. `summary` validates and derives the existing
migration recommendation from the selected report, then emits only the specified operational
summary fields. The report remains the sole source for every operation.
