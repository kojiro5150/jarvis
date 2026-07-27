# ADR-0018 — Governed Action Proposal

## Status

Accepted for Sprint 3.23.

## Context and purpose

Bounded Executive Reasoning explains what typed interpretation is supported by one coherent planning graph. A separate downstream layer is required to formulate what may be placed before an authorised human. It must remain upstream of human approval and authorised execution: proposal is not recommendation, approval, rejection, decision, selection, or execution.

## Decision

Governed Action Proposal lives only in `lib/executive-operating-system/proposal`. Its minimum public surface is exported through that package index. The engine consumes one Executive Context, Intent Set, Constraint Set, Candidate Plan Set, Evaluated Candidate Plan Set, Candidate Plan Comparison Set, and immutable Executive Reasoning Record, plus explicit definitions and registered policies. It returns exactly one canonical set referencing those identities rather than duplicating upstream objects.

The closed statuses are `draft`, `ready_for_human_review`, `blocked`, `unresolved`, and `not_applicable`. Ready for review is not approval; blocked is not rejection. The closed kinds are single- and multiple-candidate consideration, evidence deferment, authority confirmation, human arbitration, conditional consideration, option preservation, no action pending resolution, and explicit-combination consideration. Structural scopes cover single candidate, multiple candidates, planning set, evidence resolution, authority resolution, and governance escalation.

Every proposal requires an immutable definition containing selectors, candidate selectors, deterministic applicability, authorised statuses, policy identity and origin. Registered policies declare supported kinds and scopes and return typed construction results. Reason codes are a closed non-preferential vocabulary. Policies receive defensive copies and may only inspect typed canonical values; descriptions and Calendar prose are not interpreted.

Each proposal records status, kind, scope, candidates, reasoning references, compact typed payload and complete provenance. Conditions, authority requirements, bounded questions, and boundaries have independent deterministic identities and equivalent provenance. Missing evidence remains an evidence condition, question, deferment, or unresolved state. Conflicting evidence and indeterminate reasoning may request human arbitration without resolving it. Unresolved authority creates a requirement rather than granting authority.

Multiple candidates are preserved without preference. A single-candidate proposal does not select that candidate. Explicit combinations are permitted only when the definition names an already canonical Candidate Plan; plans are never dynamically merged.

Proposal, condition, authority-requirement, question, boundary and set identities derive solely from canonical structural inputs. Collections use locale-independent code-unit structural ordering, never merit or severity ordering. Summaries contain counts only. Empty graphs, single-candidate graphs, and zero-proposal results are valid and deterministic.

Validation checks JSON compatibility, graph coherence, reference integrity, vocabularies, identities, uniqueness, ordering and summaries before returning. Inputs and policy outputs are cloned; canonical outputs are recursively frozen. A policy exception or malformed artefact aborts the entire operation, so no partial set is observable. These rules provide immutable replay-safe output and preserve the upstream artefacts unchanged.

The proposal set cannot cross the human approval boundary. Human approval remains future work, and approved action still cannot cross the separate future execution boundary without explicit authorisation.

## Consequences

The layer can formulate bounded review artefacts while leaving mixed and unresolved states visible. It has no aggregate conclusion, score, rank, preference, recommendation, approval, rejection, selected candidate, command, side effect, persistence, API, UI, runtime integration, specialist invocation, or provider dependency.

## Rejected alternatives

We reject LLM-generated proposals, semantic interpretation of descriptions, implicit preference, ranking or scoring candidates, recommending or automatically selecting a candidate, granting approval, rejecting proposals, executing proposals, dynamically merging candidates, and inferring authority from titles. We also reject treating readiness as approval, blocked as rejection, or one candidate as selected; allowing policy side effects; and combining proposal with either approval or execution.
