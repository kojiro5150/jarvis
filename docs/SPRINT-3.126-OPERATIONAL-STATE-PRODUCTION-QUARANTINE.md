# Sprint 3.126 — OperationalState Production Inventory and Quarantine

- **Status:** Implemented as an inventory and regression boundary
- **Date:** 25 August 2026
- **Migration Step 5:** **Partial**

## Scope

This sprint records every remaining production acquisition of the legacy
`OperationalState` aggregate and every in-repository client of
`/api/operational-state`. It freezes that set with regression tests so a new
caller cannot be added accidentally. It does not authorize any acquisition,
change runtime behaviour, migrate DAWNWATCH, redesign the Dashboard, or make
the legacy aggregate canonical.

The deterministic, machine-readable inventory is
`docs/operational-state-production-inventory.json`. Production means source
under `app/`, `components/`, or `lib/`, excluding test/spec files. The guard
tracks direct `buildOperationalState` imports, literal API fetches, and the
Dashboard hook entry point. Test fixtures and type-only consumers do not
acquire state and are therefore outside the caller allowlist.

## Complete production surface classification

| Surface | Acquisition chain | Classification | Quarantine disposition |
| --- | --- | --- | --- |
| Dashboard | `DashboardShell` → `useOperationalState` → `GET /api/operational-state` → builder | Legacy product surface and the sole in-repository API client | Remains live pending source-by-source authorized replacement; no redesign in this sprint. |
| DAWNWATCH | lighter specialist runtime → builder → DAWNWATCH presentation input | Legacy specialist prompt surface | Remains live and explicitly unmigrated in this sprint. |
| Operational-state API | route → builder | Legacy production API | Retained only for its quarantined Dashboard dependency. |
| Operational-picture alias | deprecated route → builder | Deprecated compatibility API | No known in-repository client; retained without expansion. |
| Operational-state evaluation | evidence route → builder → parallel evaluation | Evidence-only evaluation API | No known in-repository client; not production authority. |

There are four direct builder entry points because the Dashboard surface
shares the operational-state API entry point rather than adding a fifth
builder import. There is exactly one literal `/api/operational-state` fetch,
in `lib/useOperationalState.ts`, and exactly one production importer of that
hook, `components/dashboard/DashboardShell.tsx`.

## Regression boundary

`lib/operational-state-quarantine.test.ts` walks production source paths in a
stable sorted order and compares discoveries with closed allowlists. It fails
if code adds another direct builder importer, another literal API fetch, or
another `useOperationalState` entry point. It also checks that the JSON
inventory lists the same direct builders and continues to declare Step 5
partial. An intentional future migration must update code, classification,
inventory, tests, and migration status together.

This is quarantine, not approval. Existing callers still permit eager Memory,
Calendar, Gmail and Drive acquisition and local fallback through the legacy
builder. The guard prevents growth; it does not make those paths compliant.

## Explicit non-scope

- no DAWNWATCH migration or prompt/presentation change;
- no Dashboard UX, data-flow, polling, or presentation redesign;
- no changes to `OperationalState`, its builder, connectors, fallback, routes,
  or response shapes;
- no new authority decision, grant, acquisition adapter, or canonical state;
- no claim that migration Step 5 is complete.

Step 5 remains **partial**: Sprint 3.124 removed console status refresh and
Sprint 3.125 removed ordinary non-capability chat from the builder, while the
five quarantined surfaces above still depend directly or transitively on it.
