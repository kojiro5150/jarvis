# Sprint 3.67.1 — DAWNWATCH Production Evidence Bridge Completion

## Status

**Complete — operator verified against real operational data**

This record documents three post-integration fixes to `buildProductionDawnwatchInput` in `lib/dawnwatch-presentation-selection.ts`. They were made after Sprint 3.67 was merged but before the governed DAWNWATCH path had ever been verified against real operational data.

`LEGACY` remained the production default throughout. The operator selected the governed path explicitly by setting `DAWNWATCH_PRESENTATION_MODE=GOVERNED` on the real running JARVIS instance.

## Objective

Bridge real operational state into the already-governed DAWNWATCH presentation without changing its governance contract or promoting it to the production default.

Sprint 3.67 integrated the governed presentation behind the explicit `DAWNWATCH_PRESENTATION_MODE` selector, defaulting to `LEGACY`. Its completion report correctly limited its claims to isolated-sandbox verification under that sprint's Execution Boundary and could not verify real production behaviour. When the operator subsequently selected `GOVERNED` on the real running instance, priorities, commitments, and communications all reported `insufficient_coverage` despite real, visible operational data being present.

## Findings

### Gap 1 — Missing assertion identity

`buildProductionDawnwatchInput` hardcoded `provenance.assertionId` to `""` for every priority, commitment, and communication. The evidence-status logic in `lib/dawnwatch-presentation.ts` requires a non-empty `assertionId` before an item can be classified as available.

This was not a Sprint 3.64 governance requirement: `assertionId` does not appear in `docs/SPRINT-3.64-GOVERNED-DAWNWATCH-BRIEFING-PRESENTATION-CONTRACT.md`. It was an undefined Sprint 3.65 implementation detail.

### Gap 2 — Missing source observation evidence and source-ID vocabulary mismatch

Two independent defects existed in the same function:

1. Every source observation hardcoded `observedAt: ""` and `snapshotId: ""`. The evidence-status check requires both values to be non-empty and `observedAt` to be a parseable timestamp. Failure returns `insufficient_coverage` before any item-level check runs.
2. Commitment and communication provenance used connector-provider values such as `"google"` from `commitment.source` and `communication.source`, while the sources list used connector names—`"calendar"`, `"gmail"`, and `"drive"`—as IDs. The availability-set lookup therefore could not match them.

### Gap 3 — Priorities had no source identity or backing source entry

`Priority` in `lib/memory/schema.ts` has no source-identifying field. Priorities originate from local memory or seed data rather than a connector, and `connectorStatuses` had no corresponding entry.

## Fixes

### Gap 1 fix

Each item's existing stable ID now supplies `assertionId`; priorities use the array-index-derived ID already used elsewhere. Legacy connector data has no assertion identity distinct from entity identity.

This fix was committed through PR #130, which was merged with a commit range including `8d8f4bf` and the subsequent conflict-resolution merge commit `94bccfe`.

### Gap 2 fix

Every source now uses `state.updatedAt` for `observedAt` and the deterministic placeholder ``snapshot-${source.name}-${state.updatedAt}`` for `snapshotId`. Commitment provenance uses the literal source ID `"calendar"`, and communication provenance uses the literal source ID `"gmail"`, aligning both with the sources-list vocabulary.

The repository owner committed the source-ID and observation-evidence fix directly to `main` as `9b7a217a38eed5c328ec5cdc64f25c9f39a34bce`.

### Gap 3 fix

Priority provenance now uses `sourceId: "memory"`. The sources array now includes a `"memory"` entry with `availability: "available"`, because memory is local application state and `OperationalState` currently represents no disconnected condition for it. The new entry uses the same `observedAt` and `snapshotId` treatment as the other sources.

The repository owner committed this fix directly to `main` as `9d435c1`.

## Verification

All three fixes were verified against the real running JARVIS instance with `DAWNWATCH_PRESENTATION_MODE=GOVERNED` explicitly set, not only through isolated-sandbox tests.

After the Gap 2 fix, real calendar commitments with the visible titles “Rotary meeting,” “PHDSS Demo,” and “Governance Engineering Test” rendered as available through the governed voice.

After the Gap 3 fix, real priorities with the titles “Governance reasoning review,” “Research brief — market position,” and “Q3 roadmap sequencing” also rendered as available.

This is the first genuine operator-verified confirmation in the DAWNWATCH sequence and is distinct from every prior sprint's isolated-sandbox-only evidence.

## Remaining Work

### Named follow-up — Extend Gmail recipient evidence for governed communications

Communications remain `insufficient_coverage`. `EmailMessage` in `lib/connectors/email-message.ts` has no recipient field, while the governed semantic-field requirement for communications requires at least one recipient.

Resolving this requires extending the Gmail connector to fetch real recipient data from the live API. That is a connector-layer change, not a presentation-bridge fix, and was deliberately not attempted here.

`LEGACY` remains the production default. DAWNWATCH promotion in a future Sprint 3.68 or similar remains blocked on this specific communications gap under the **replacement follows demonstrated equivalence** principle, consistent with the sequencing used for Dashboard promotion.
