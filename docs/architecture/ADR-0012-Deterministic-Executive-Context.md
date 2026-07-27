# ADR-0012 — Deterministic Executive Context

## Status

Accepted.

## Purpose

Executive Context is the canonical runtime representation of the complete deterministic executive state at one snapshot. It aggregates immutable Situation Assessment Sets into typed indexes, structural counts, and canonical provenance. It does not interpret or narrate that state.

## Architectural Boundary

The Context package follows Assessment and depends only on Assessment and local canonical validation contracts. It cannot consume planning, reasoning, execution, orchestration, UI, APIs, notifications, specialists, LLMs, embeddings, runtime memory, or execution history. Context policies receive cloned Assessment Sets and cannot modify their inputs.

Downstream planning, reasoning, DAWNWATCH, Executive UI, and future APIs must consume Executive Context rather than Assessment Sets or lower-level layers directly.

## Identity

An Executive Context identifier derives exclusively from the snapshot identifier, Assessment Set identifier, and sorted Context Section identifiers. Identifiers contain no UUID, timestamp generation, randomness, or mutable runtime state.

## Ordering

Policy registration order has no effect. Policies, sections, section entries, statistics, dimensions, and provenance references use stable lexical ordering. This order is serialization structure only and never communicates priority, importance, urgency, or severity.

## Context Philosophy

Context aggregates canonical structure. Initial policies expose Situation, Assessment, and Attention indexes; entity, relationship, domain, observation, and policy statistics; and canonical provenance. Summaries contain counts only. Policy output is typed, JSON-compatible, duplicate-free, validated atomically, and deeply frozen after construction.

## Future Planning Boundary

Planning may later consume Executive Context. Planning must remain downstream and cannot add recommendations, ranking, interpretation, or execution semantics to Context construction.

## Non-goals

This decision introduces no planning, reasoning, recommendation, priority, briefing, prose summary, semantic interpretation, LLM, embedding, notification, execution, specialist, runtime orchestration, API, or UI capability.
