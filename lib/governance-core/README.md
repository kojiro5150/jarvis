# Governance Core type boundary

This directory begins the implementation of the frozen Governance Core doctrine.

PR B is deliberately narrow. It introduces nominal trust-bearing types and compile-time negative tests for `MODEL-TRUST-01`; it does **not** migrate Calendar, Gmail, Drive, or any live authority path yet.

## What is proven by this PR

The repository's normal `tsc --noEmit` run rejects direct substitution of model-authored text for:

- authority evidence;
- governed evidence;
- governed provenance;
- policy proof;
- verification proof;
- completion proof.

The negative tests live in `model-trust.typecheck.ts`. They use `@ts-expect-error`, so CI fails if a forbidden assignment ever becomes legal.

## What is not yet proven

This PR does not claim:

- existing runtime authority code uses these types;
- existing provider evidence has migrated to these types;
- a complete source-provenance constructor chain exists;
- the Governance Core is operational;
- legacy authority mechanisms are removed.

Those are later migration steps.

## Migration lock

With this type core present, `MIGRATION-LOCK-01` is active:

> No new capability-touching implementation may depend on a superseded authority mechanism. Existing legacy mechanisms may remain only for bounded migration.

New capability work must target this typed trust boundary or stop for an explicit architecture decision.

## Proposal boundary

Model proposal construction is now represented explicitly by `ModelProposal<T>` and `ModelProposalBatch<T>`.

A proposal is only JARVIS's interpretation of the user's request. It is deliberately not a `ValidatedOperation<T>`, authority, evidence, provenance, policy proof, verification proof, or completion proof. Compound requests may produce multiple proposals, but grouping them does not create shared authority between sibling operations.

This PR does not replace the current Calendar/Gmail/Drive conversational selector or migrate any live capability path. It establishes the typed low-trust destination those later migrations must target under `MIGRATION-LOCK-01`.

## Conversation state versus governance state

PR D adds the common state boundary without forcing the existing reference stores into one runtime registry.

`ConversationReference` and `ConversationState` may preserve semantic continuity such as "the first one" or "that meeting". They are intentionally low-trust and cannot satisfy validation, authority, evidence, provenance, policy, verification, or completion types.

`GovernanceState<T>` is a separate server-owned category. This module exposes no generic constructor for it. Later capability migrations must resolve genuine server-owned state at a trusted boundary rather than promote a client-carried reference or model proposal.

The lifecycle audit in `REFERENCE-LIFECYCLE-AUDIT.md` records why existing Gmail, Calendar, result-set, disambiguation, and pending-authorisation stores are **not** being prematurely collapsed into one registry.
