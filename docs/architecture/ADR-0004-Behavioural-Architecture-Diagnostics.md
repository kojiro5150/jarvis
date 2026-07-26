# ADR-0004 — Diagnose Behavioural Architecture Without Introducing Enforcement

**Status:** Accepted  
**Date:** 2026-07-26  
**Authors:** Governance Engineering Project

## Context

JARVIS now has authoritative Behavioural Constitutions, deterministic compliance validation, a Capability Matrix projection and a directed Collaboration Graph projection. These artefacts represent specialist identity, capability and collaboration topology, but previously provided no stable boundary for structural observations.

Without that boundary, consumers could interpret topology independently, confuse observations with compliance failures, invent health scores or normative weaknesses, duplicate graph analysis, introduce runtime enforcement prematurely, or silently repair constitutional declarations.

## Decision

Introduce typed, deterministic and deeply immutable **Behavioural Architecture Diagnostics**, derived only from the Capability Matrix and Collaboration Graph. It reports explicitly defined structural observations, uses the restrained severities `information` and `attention`, controlled messages and canonical ordering, and validates cross-projection consistency before producing a complete report.

Compliance asks whether authoritative constitutional sources meet mandatory rules. Diagnostics describe structural characteristics of already-built projections. An `attention` diagnostic merits human interpretation, but is neither a compliance failure nor authority for a runtime response. No structural observation is inherently a defect.

### Diagnostics Without Authority

> Behavioural Architecture Diagnostics may identify deterministic structural properties of constitutional projections, but it shall not alter, repair, rank, optimise, approve, reject or enforce the behavioural architecture.

Behavioural Constitutions remain the ultimate source of truth. The matrix, graph and report are successive, non-editable projections. Diagnostics consume projected data rather than independently interpreting constitutional prose, and changes must originate at the appropriate authoritative layer.

Weak connectivity is used only to observe components: directed edges are temporarily treated as undirected adjacency without changing their direction or meaning. The layer provides no health, maturity, readiness or risk score because no normative model justifies one.

## Consequences

Positive consequences include one stable diagnostics boundary, deterministic topology interpretation, explicit separation from compliance, improved architectural transparency, stable input for future generated documentation, reduced arbitrary scoring, human-reviewable observations without runtime consequences and easier regression testing.

Trade-offs are that another derived representation must remain maintained, diagnostic codes become a compatibility surface, some observations require human interpretation, stronger normative conclusions remain deliberately excluded and any expansion must be evidence-based and explicitly specified.

## Explicit exclusions

This decision introduces no compliance enforcement, runtime blocking, specialist activation, routing, handoffs, delegation, prompts, scoring, ranking, maturity assessment, centrality analysis, automatic repair, generated constitutional changes, persistence, telemetry, UI, timestamps or AI-generated interpretation.
