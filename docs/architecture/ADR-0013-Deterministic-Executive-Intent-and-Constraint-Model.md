# ADR-0013 — Deterministic Executive Intent & Constraint Model

**Status:** Accepted  
**Date:** 2026-07-27

## Context and architectural purpose

Executive Context describes current executive state but does not establish what JARVIS is authorised to pursue. Future planning requires a canonical boundary between observed state and explicit objectives and obligations. The Intent & Constraint Model therefore follows Executive Context and precedes any Planning Engine.

## Decision

JARVIS shall construct separate immutable `IntentSet` and `ConstraintSet` contracts from a canonical Executive Context plus explicit configuration. Deterministic, typed policies admit configured definitions; they do not interpret context or derive objectives from observations. Registries validate policies and expose them in lexical policy-identifier order. Construction fails atomically.

Intent-set identity is derived solely from the context identifier and lexically sorted objective identifiers. Constraint-set identity is derived solely from the context identifier and lexically sorted constraint identifiers. Identifiers use canonical percent encoding. UUIDs, timestamps, randomness, insertion order, priority, urgency, importance, and ranking do not participate in identity or ordering.

Objectives and constraints are returned in lexical identifier order. Summaries contain counts only and are validated against canonical members. All returned values, including nested scope and provenance values, are cloned and deeply frozen. These properties make replay with identical context and configuration byte-for-byte JSON stable.

## Constraint philosophy

Constraints are structural, non-negotiable boundaries rather than recommendations. They state authority, temporal, resource, governance, behavioural, privacy, execution, and approval boundaries. A binding-status field records explicit configuration; the model does not weigh, resolve, relax, or recommend around constraints.

## Planning boundary

This layer answers only what explicitly authorised objectives exist and what constraints govern future planning. A future Planning Engine may consume the canonical sets. It must not cause this package to depend on planning, reasoning, execution, runtime, specialists, APIs, UI, notifications, or language models.

## Non-goals

This decision introduces no planning, option evaluation, action selection, recommendation, prioritisation, scheduling, execution, notification, orchestration, semantic extraction, inferred intent, runtime memory, or language-model interpretation. Calendar integration demonstrates the architectural chain only; calendar content never creates an objective or constraint.

## Consequences

Callers must supply explicit typed configuration and stable identifiers. Unsupported configured categories produce no canonical member until an explicit policy is registered. This is deliberate: explicit policy admission is preferable to inference. Duplicate identifiers, malformed JSON values, inconsistent summaries, unstable identities, and unordered canonical members are rejected before a set is returned.
