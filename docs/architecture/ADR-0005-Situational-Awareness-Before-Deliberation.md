# ADR-0005 — Establish Situational Awareness Before Deliberation

**Status:** Accepted

**Date:** 2026-07-26

**Authors:** Governance Engineering Project

## Context

JARVIS has completed its first deterministic behavioural architecture: Behavioural Constitutions, Constitutional Compliance, Capability Matrix, Collaboration Graph and Behavioural Architecture Diagnostics. That architecture defines how specialists are constituted and structurally related; it does not define the user's current operational world.

Without a first-class situational model, later features could treat conversational history as implicit state, mix operational facts with specialist behaviour, reason without bounded context, duplicate roles, projects and commitments, infer urgency from incomplete data, pass raw connector payloads into reasoning, hide state in prompts, lose provenance and make deterministic decision derivation difficult. A typed, bounded and immutable model is required before connectors, deliberation, prioritisation or execution.

## Decision

Introduce a first-class `SituationalAwareness` model in the Executive Operating System product layer. It represents identity, roles, projects, commitments, waiting items, explicit priorities, active work, bounded context and source state. It is a non-editable projection of facts supplied by approved authoritative sources, not an authority itself.

The model excludes general memory and conversation history, specialist reasoning, decisions, recommendations, attention ranking and execution. Its construction boundary validates identity, uniqueness and internal references, copies supplied plain data, preserves supplied order, applies documented empty defaults and deeply freezes the result. It reads neither time nor external state and remains JSON-compatible and data-minimised. No runtime behaviour changes.

### Current Operational Truth, Not Remembered Conversation

> Situational Awareness represents the bounded operational facts currently relevant to the user's work. It is not a transcript, memory store, embedding index or reconstruction of past conversation.

Conversation-derived facts may only enter a future projection through an approved, governed source boundary; conversation itself is not situational state.

### Situational Awareness Before Deliberation

> JARVIS shall establish a deterministic representation of the user's operational situation before invoking behavioural reasoning. Specialist deliberation must be grounded in explicit situational state rather than hidden conversational context.

Actual deliberation is not implemented by this decision. `createSituationalAwareness` only validates and freezes already-supplied facts. A future `buildSituationalAwareness` may gather and normalise facts from approved sources.

## Consequences

Positive consequences are an explicit product-layer state model; separation between behaviour and situation; less hidden prompt context; deterministic future Decision Surface input; role-aware future behaviour; bounded provenance; improved privacy; stable testing and serialisation; and a common future connector projection.

Trade-offs are another public compatibility surface; future normalisation of heterogeneous systems; explicitly unavailable or stale facts; stricter source preparation due to reference integrity; deliberately omitted inferred context; and a need for backwards-compatible schema evolution.

## Explicit exclusions

This decision introduces no connectors or source ingestion; Calendar, email or GitHub reads; persistence; conversation memory; embeddings; RAG; AI inference; decision candidates; attention ranking; specialist routing; recommendations; execution; automation; telemetry; UI; or runtime activation. It also introduces no raw payloads, credentials, polling, freshness calculations, conflict reconciliation, event sourcing, ontology or generic entity framework.
