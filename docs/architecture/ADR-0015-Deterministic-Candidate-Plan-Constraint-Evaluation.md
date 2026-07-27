# ADR-0015 — Deterministic Candidate Plan Constraint Evaluation

## Status

Accepted for Sprint 3.20.

## Purpose and position

Candidate Plan Constraint Evaluation sits strictly downstream of Candidate Plan Construction. It consumes one coherent Executive Context, Intent Set, Constraint Set, and Candidate Plan Set plus explicit evaluation definitions and registered policies. It produces immutable findings attached to unchanged candidates. Future Candidate Plan Comparison consumes these artefacts; future Executive Reasoning may consume comparison, but neither concern is implemented here.

## Decision

The closed status vocabulary is `satisfied`, `violated`, `unresolved`, `not_applicable`, and `indeterminate`. Findings are typed as constraint, dependency, approval, assumption, completion condition, or evidence. Registry-governed closed reason codes describe structural outcomes and participate in identity; prose does not.

Applicability is explicit. A policy emits a finding only for a referenced or deterministically applicable requirement. Unrelated constraints emit no finding. Narrative descriptions, labels, Calendar prose, inferred authority, and inferred resources never create applicability or evidence. Missing required evidence produces `unresolved`; explicit conflicting evidence produces `indeterminate`. Approval requirements and named authorities are not approval evidence.

Every source Candidate Plan is preserved exactly once and in source structural order, including candidates with violated, unresolved, or zero findings. Evaluation cannot mutate candidates and cannot omit them. An empty source set produces an empty evaluated set with coherent identities and zero counts.

Finding identity derives from candidate, finding type, requirement, policy and version, status, reason code, and sorted evidence and missing-evidence identifiers. Candidate Plan Evaluation identity additionally binds source-set identities, active policies, and sorted findings. Evaluated Candidate Plan identity binds the source candidate and its evaluation. Evaluated Candidate Plan Set identity binds all coherent source identities, active policies, and sorted evaluated-candidate identities. Code-unit ordering is used; status never controls order.

Temporal evaluation uses only canonical typed values and an explicit validated reference time when a time-relative policy requires one. The current system clock, generated timestamps, and randomness are prohibited. A relevant reference time is retained in provenance and therefore replay inputs.

Summaries contain counts only: finding type, status, and policy counts plus structural candidate/set counts. “All emitted findings satisfied” is not approval, safety, feasibility, compliance, selection, or an overall verdict. Every finding retains source identities, requirement, policy/version, evidence, missing evidence, reason code, configured origin, and applicable reference time. Outputs are JSON-compatible, defensively cloned, recursively frozen, and replay-safe.

Policies are validated and registered once per stable identifier. Registration order cannot affect retrieval or identity. Policy exceptions, malformed applicability or findings, unsupported statuses or reason codes, unresolved mandatory references, duplicates, identity mismatch, invalid summaries, JSON incompatibility, or source-candidate preservation failure abort the whole evaluation; partial output is never returned.

## Boundaries and non-goals

Evaluation provides structural findings, never an overall verdict. It performs no comparison, comparative weighting, scoring, ranking, selection, recommendation, reasoning, approval decision, proposal, scheduling, remediation, specialist or provider invocation, persistence, API/UI work, runtime orchestration, or execution. Candidate Plans remain evaluation-neutral; upstream packages do not import this package.

## Rejected alternatives

- LLM-based compliance evaluation and narrative constraint interpretation: neither is typed or replay-safe.
- Collapsing findings into pass/fail: this destroys unresolved, conflicting, and requirement-level structure.
- Ranking during evaluation, removing violated candidates, or automatically rejecting unresolved candidates: these cross comparison and selection boundaries.
- Treating missing evidence as satisfaction or successful construction as compliance: neither establishes a structural result.
- Using the current clock without canonical reference time: replay would vary.
- Mutating Candidate Plans with evaluation fields: construction must remain upstream and evaluation-neutral.
- Granting approval because an approval step or named authority exists: a requirement is not approval evidence.
- Permitting policies to execute corrective actions: evaluation is inert and side-effect free.
