# Sprint 3.128 — Dashboard Non-Private Compatibility State

- **Status:** Implemented
- **Date:** 25 August 2026
- **Migration Step 5:** **Partial**

## Scope

The Dashboard no longer automatically fetches `/api/operational-state` when it
mounts or refreshes. Its existing shell and component contract are preserved by
an explicitly empty `OperationalState`-shaped compatibility value: priorities,
projects, signals, blockers, calendar events, Gmail threads, and Drive files are
all empty. It contains no `SEED_MEMORY` content.

The compatibility hook fetches `/api/connector-status` only. That endpoint
derives service availability from connector selection, OAuth configuration, and
stored-token metadata without acquiring Calendar, Gmail, Drive, or Memory
content. The returned three service statuses are overlaid on the empty state so
existing Dashboard status chrome continues to work without a visual redesign.

## Quarantine update

The inventory records the Dashboard as a metadata-only consumer and removes its
dependency on the operational-state API. There are now no in-repository clients
of `/api/operational-state`. The quarantine guard freezes that boundary while
continuing to allow exactly the three existing direct builder entry points:

1. `app/api/operational-picture/route.ts`;
2. `app/api/operational-state/evaluation/route.ts`;
3. `app/api/operational-state/route.ts`.

Migration Step 5 remains partial because those clientless compatibility and
evaluation APIs still invoke the legacy aggregate builder.

## Explicit non-scope

- no Dashboard redesign or component-contract migration;
- no Calendar, Gmail, Drive, or Memory content acquisition for Dashboard load;
- no Gmail, Drive, or Memory authority;
- no `BRIEF_ME_GRANT` or replacement grant;
- no changes to the legacy builder or the three remaining builder routes;
- no changes to the existing governed Calendar conversational path.
