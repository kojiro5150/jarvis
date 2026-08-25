# Sprint 3.129 — Eager Full-State Surface Retirement

- **Status:** Implemented
- **Date:** 25 August 2026
- **Migration Step 5:** **Complete**

## Scope

The two remaining legacy aggregate-state APIs are fail-closed. Requests to
`GET /api/operational-state` and the deprecated
`GET /api/operational-picture` return HTTP 410 without importing or invoking
`buildOperationalState()`. They therefore perform no Calendar, Gmail, Drive,
or Memory acquisition.

Repository search found no client of the evidence-only
`/api/operational-state/evaluation` route. The route was removed rather than
preserving an ambient path to the aggregate builder. The pure evaluation code
and the internal `OperationalState` module and type remain available for tests
and non-acquiring transformations; this sprint does not remove useful internal
contracts.

## Quarantine and inventory

The production quarantine now requires zero imports of
`buildOperationalState()`, requires both retained legacy routes to remain
fail-closed with HTTP 410, and requires the unused evaluation route to remain
absent. The machine-readable inventory classifies both retained routes and the
removed evaluation surface as acquisition `none` and records zero callable
eager full-state surfaces.

Migration Step 5 is complete because no production caller can invoke the eager
full-state builder. This statement is limited to retiring that aggregate
callable surface; it does not assert that new private-data authorities exist.

## Explicit non-scope

- no Gmail, Drive, or Memory authority;
- no `BRIEF_ME_GRANT` or replacement grant;
- no changes to Calendar authority;
- no replacement multi-source briefing path;
- no removal or redesign of the internal `OperationalState` type/module.
