# ADR 0001 — Engineering Workflow

- **Status:** Accepted
- **Date:** 2026-07-25

## Context

JARVIS was developed through a sequence of local backup folders and then imported into GitHub as a functioning baseline. Continuing to make direct, unreviewed changes to `main` would make regressions, architectural drift and recovery more likely.

## Decision

JARVIS will use the following workflow:

1. `main` is the stable, deployable baseline.
2. Consequential work occurs on a named branch.
3. Changes are integrated through pull requests.
4. Pull requests should explain purpose, scope, risk and verification.
5. Architecture decisions with durable consequences are recorded under `docs/adr/`.
6. Automated lint, test and build checks will be required before merge once CI is established.
7. Secrets, OAuth tokens, local memory and generated build artefacts are never committed.

For the initial operating-system foundation, the working branch is `sprint-1-operating-system`.

## Consequences

### Positive

- The imported baseline remains recoverable.
- Changes can be reviewed as coherent units.
- Architectural choices gain an explicit history.
- CI can become a reliable merge gate.
- Future collaboration becomes safer.

### Costs

- Small changes require slightly more process.
- Branches must be kept current with `main`.
- Documentation must be maintained alongside code.

## Rejected alternatives

### Continue using versioned backup folders

Rejected because backups preserve snapshots but do not provide meaningful diffs, review, traceability or controlled integration.

### Commit directly to `main`

Rejected as the default because it removes the review boundary and increases the chance of breaking the only canonical baseline.
