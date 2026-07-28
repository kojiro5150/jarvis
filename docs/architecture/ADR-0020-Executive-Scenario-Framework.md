# ADR-0020 — Executive Scenario Framework

**Status:** Accepted  
**Date:** 28 July 2026

## Context

The deterministic Executive Operating System needs permanent, replayable executive environments for end-to-end architectural verification. Test setup must not become an alternative owner of reasoning or runtime behaviour.

## Decision

Canonical Executive Scenarios are immutable test architecture under `tests/scenarios`. They contain only scenario identity and metadata, `ProjectionArtifactSet` input, deterministic expectations, provenance, and a replay identity. Runtime configuration is supplied independently at execution.

The canonical registry validates all registrations before publication, rejects duplicate identifiers, orders identifiers with deterministic code-unit comparison, and deeply freezes the published definitions. Invalid scenarios are never published.

The scenario loader validates the selected scenario before execution, invokes the existing `DeterministicExecutiveOperatingSystemRuntime` directly, evaluates assertions using structural equivalence (object key order is incidental; array order is significant), and returns a deeply frozen execution report. Loading or validation failures prevent runtime invocation. Assertion mismatches remain explicit failed results and are never silently repaired.

## Replay philosophy and lifecycle

Scenarios are versioned canonical environments. Their replay identity binds a scenario version to its deterministic fixture boundary. Discovery, publication, loading, runtime execution, assertion evaluation, and reporting contain no clock, randomness, locale-sensitive ordering, connector, persistence, or API dependency. Existing golden fixtures remain authoritative and unchanged.

Lifecycle: author → validate → register → freeze/publish → load/validate → run through EOS → assert → freeze/report.

## Consequences

- Executive reality and executive interpretation remain separate.
- EOS and `ProjectionArtifactSet` public contracts remain unchanged.
- New scenarios can be added through the single canonical registry without a second execution path.
- Declarative assertion paths select runtime output without placing executable runtime behaviour in scenarios.

## Non-goals

This decision does not add or alter reasoning stages, runtime configuration, planning, connectors, production integrations, APIs, persistence, UI, stochastic behaviour, or the golden replay fixtures.
