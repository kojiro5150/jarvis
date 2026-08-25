# Sprint 3.124 — Status-Only Connector Path

- **Status:** Implemented for `UnifiedOpsConsole` connector chrome
- **Date:** 25 August 2026
- **Scope:** Connector-status observation only

## Objective

Stop a connector-status UI refresh from indirectly acquiring Calendar, Gmail,
Drive and Memory content through the legacy `OperationalState` builder.

## Implementation

`GET /api/connector-status` returns only the three existing connector service
statuses. Its server-side builder derives those statuses from connector
provider configuration, whether stored Google token metadata is present, the
grant's recorded scopes, token expiry/refresh metadata, and OAuth
configuration. It does not instantiate a connector, call a provider API, read
Memory, refresh a token, or return token and configuration details.

`UnifiedOpsConsole` now uses this endpoint for its initial connector-status
refresh. Failure remains fail-closed in the existing UI vocabulary by showing
all three services as unavailable.

## Verification

Unit coverage verifies ungranted, renewable, scoped and explicitly local
metadata states. Route coverage verifies the response is exactly the bounded
status snapshot. The console contract verifies that the status refresh uses
`/api/connector-status` and no longer fetches `/api/operational-state`.

## Explicit non-scope

This sprint does not redesign, remove or change `OperationalState` or its
remaining callers. It does not authorize or acquire Calendar content and does
not introduce Gmail, Drive or Memory authority. It does not validate live
provider reachability, refresh tokens, broaden OAuth scopes, change connector
content loaders, or change conversational and briefing paths.
