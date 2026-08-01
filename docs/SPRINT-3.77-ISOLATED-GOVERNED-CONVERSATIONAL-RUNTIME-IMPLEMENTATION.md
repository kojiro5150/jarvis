# Sprint 3.77 — Isolated Governed Conversational Runtime Implementation

**Status:** Implementation — Isolated
**Authority:** Sprint 3.76 Governed Conversational Runtime Contract

## Scope and configuration

This sprint implements only the isolated governed input, four-state evidence computation, typed semantic response envelope, deterministic validator, safe failure envelope, reference-only execution-record payload, and explicitly synthetic fixtures. It does not integrate a route, prompt, model, selector, retrieval mechanism, persistence store, or UI.

Reference time is an injected ISO instant. Timezone and locale are explicit question inputs when required. Source identity is the stable tuple of source, resource, field, and observation instant. Conversation history is always non-canonical. Material status precedence is `unsupported`, `unavailable`, `insufficient_coverage`, then `available`; non-material claims do not control the summary. The validation ruleset is `governed-conversation-validator/1.0.0`. Every fixture carries `SYNTHETIC_GOVERNED_CONVERSATIONAL_FIXTURE_NOT_OPERATIONAL_EVIDENCE` and uses a fixed reference instant.

## Governed boundaries

Governed claims carry source-qualified references, provenance, availability, content kind, coverage, conflicts, and deterministic status. Compatibility fields have no authority, remain separately typed, and explicitly enumerate excluded heuristics. A governed/legacy conflict downgrades an otherwise available affected claim to `insufficient_coverage`. Importance, urgency, and actionability remain unsupported without a separately governed significance rule; partial evidence for an otherwise supported claim is insufficient coverage.

Validation is pure and structurally checks lineage, closed statuses, status preservation and visibility, governed source references, ownership, prior-assistant exclusion, conflict preservation, negative-scope and excerpt/full-content boundaries, recommendation bounds, and overall-status consistency. It uses no semantic or second model. Safe failure never repairs prose: it removes facts and advice and returns deterministic disclosure and refusal.

The execution payload contains stable identities, source and policy references, availability/status/ownership summaries, response and validator lineage, refusal outcome, and execution metadata references. It neither copies factual content nor persists anything.

## Deferred and rejected boundary

No attachment-content retrieval, automatic or non-identified search, high-impact recommendation policy, citation UI policy, replacement selector, prompt, endpoint, model call, audit-store integration, parallel evaluation, production integration, verification, or promotion is implemented.
