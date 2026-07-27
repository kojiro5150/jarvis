# ADR-0011 — Deterministic Executive Situation Assessment

**Status:** Accepted
**Date:** 2026-07-27

## Context

Situation Formation establishes which immutable Attention Records belong together. Before any future planning boundary, the Executive Operating System needs a replay-safe description of structural characteristics that are explicitly present in each formed situation.

## Decision

Introduce a Situation Assessment package after Situation Formation. A validated, deterministically ordered registry supplies versioned policies to an atomic assessment engine. Policies consume only Executive Situations, their Attention and membership metadata, canonical values, snapshot identities, and formation evidence. They emit typed observations containing a stable type, structured JSON evidence, originating Attention Record identifiers, and the originating Situation identifier.

Assessment identities derive from the Situation identifier, sorted observation identifiers, and sorted assessment-policy identifiers. Observation identities derive entirely from their structural inputs. Assessment Sets derive from the snapshot and sorted Situation identifiers. No identity uses time, randomness, UUIDs, or mutable process state.

Assessments are ordered by Situation identifier, lowest observation identifier, then assessment identifier. Observations and registry policies use lexical identifier ordering. Summaries contain counts only, grouped deterministically by policy and observation type. The final candidate is validated, defensively copied, and deeply frozen; any policy or validation failure prevents an Assessment Set from being returned.

The initial production policies observe only explicit cancellation, schedule modification, source availability transition, multiple Attention domains, parent relationships, and multiple canonical entities.

## Architectural Boundary

Assessment does not interpret evidence or infer intent. It does not assign importance, priority, severity, urgency, confidence, or meaning. It does not recommend, plan, brief, notify, invoke specialists or models, execute work, or orchestrate runtime behaviour. The package depends only on Situation, Attention, canonical contracts, and local/shared validation.

## Consequences

Identical Situation Sets and policy versions produce identical immutable Assessment Sets, identities, order, and summaries. Policies remain independently testable and additions require explicit versioned registry entries. Structural evidence is available to a future planning layer without making planning part of assessment.

## Non-goals and Future Boundary

Planning is intentionally deferred. A future planning layer may consume an immutable Assessment Set, but it must not move recommendations, semantic interpretation, prioritisation, reasoning, or execution into this package.
