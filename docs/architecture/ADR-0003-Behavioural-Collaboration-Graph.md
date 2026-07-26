# ADR-0003 — Represent Constitutional Collaboration as a Directed Behavioural Graph

**Status:** Accepted  
**Date:** 2026-07-26  
**Authors:** Governance Engineering Project

## Context

Behavioural Constitutions and the Behavioural Capability Matrix expose declared collaboration relationships. Without one formal graph boundary, future consumers could repeatedly interpret collaboration lists, discard direction, assume reciprocity, infer undeclared relationships, treat collaboration as authority or automatic handoff, create divergent topology and ordering models, or couple orchestration directly to constitutional prose.

A deterministic collaboration representation is required before future coverage analysis, compilation or orchestration work.

## Decision

JARVIS introduces a deterministic, typed and deeply immutable `BehaviouralCollaborationGraph` built only from a `BehaviouralCapabilityMatrix`.

The graph:

- contains one lightweight node per specialist capability, including isolated specialists;
- contains one directed edge per declared source-target relationship;
- deduplicates repeated ordered pairs without mutating its input;
- preserves asymmetric declarations and never adds an inverse edge;
- marks an edge reciprocal if and only if the inverse directed edge is declared;
- preserves matrix order for nodes and orders edges by source then target node order;
- introduces no routing or execution semantics; and
- remains a projection rather than a source of truth.

Canonical ordering is representation ordering only. It conveys no priority, precedence, workflow or execution sequence. Existing constitutional rules do not prohibit self-references, so a declared self-relationship is preserved; its inverse is itself and it is therefore reciprocal.

### Behavioural Collaboration Topology invariant

The Behavioural Collaboration Graph is a deterministic projection of constitutionally declared collaboration relationships. It describes collaboration topology but does not activate, route, schedule, delegate, sequence or execute work.

### Source-of-truth boundary

Behavioural Constitutions remain the ultimate source of truth. The Capability Matrix is the immediate graph input. The Collaboration Graph may not be edited independently. Changes must originate in a constitution and flow through the matrix; the graph neither reads constitutional prose nor defines relationships of its own.

Malformed input that contradicts the matrix contract—duplicate specialist nodes, a missing identity or a target absent from the node set—throws a focused internal error. Constitutional invalidity remains the responsibility of existing compliance and capability layers.

## Consequences

Positive consequences:

- one authoritative collaboration topology;
- preserved relationship direction and visible asymmetry;
- deterministic reciprocity and ordering;
- stable input for future coverage and diagnostics;
- reduced repeated interpretation by future consumers;
- a clear distinction between collaboration and orchestration; and
- directly testable topology and immutability.

Trade-offs:

- another derived architectural representation must remain aligned with the Capability Matrix;
- constitutional collaboration changes may alter graph topology; and
- consumers must not over-interpret descriptive edges as operational instructions.

## Explicit exclusions

This decision does not introduce routing, handoffs, delegation, specialist selection, priorities, edge weights, execution order, workflows, planning, prompts, runtime activation, authority propagation, graph UI, persistence, telemetry, inferred relationships, network scoring or centrality analysis.

An edge is not authority, delegation, handoff, sequence, dependency or semantic similarity. A one-way declaration does not imply reciprocity. No runtime currently consumes the graph.
