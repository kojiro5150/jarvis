# Sprint 3.61 — Governed Dashboard Integration

## Integration outcome

The production `StatusStrip` supports both `LEGACY` and `GOVERNED` inputs. The governed branch
renders only the existing `DashboardPresentation` contract; the legacy branch continues to render
`OperationalState`. `DashboardShell` selects exactly one branch and the rest of the production UI
continues to use `OperationalState` unchanged.

## Deterministic selection and rollback

`DASHBOARD_PRESENTATION_MODE` is a server-side runtime environment variable with two accepted
values: `LEGACY` and `GOVERNED`. An absent or empty value selects `LEGACY`, preserving the production
default. Any other value fails explicitly rather than silently choosing a presentation.

To expose the governed path, set `DASHBOARD_PRESENTATION_MODE=GOVERNED` and restart the application.
To roll back, set `DASHBOARD_PRESENTATION_MODE=LEGACY` (or remove the variable) and restart the
application. Neither operation requires a source edit, commit revert, or reconstruction of
Dashboard presentation logic.

## Presentation adapter boundary

The production bridge is presentation-layer-only. It maps the existing operational publication to
the already governed `DashboardCanonicalSource` application port, then invokes
`buildDashboardPresentation`. It does not publish that ephemeral input, mutate `OperationalState`
or `ExecutiveStateSnapshot`, add canonical facts, or reconstruct deferred fields. The governed
consumer therefore receives the contract rather than selecting operational fields itself.

The operational publication timestamp is propagated as the explicit reference instant. Connector
and provider provenance is copied only where the existing operational publication carries it.

## Promotion gate

This integration does not promote the governed Dashboard. `LEGACY` remains the default and both
paths remain executable. Promotion is limited to the later default change described by Sprint 3.62;
no additional component wiring or adapter work should be necessary.
