# ADR-0016 — Deterministic Candidate Plan Comparative Analysis

## Status

Accepted for Sprint 3.21.

## Purpose and position

Candidate Plan Comparative Analysis sits strictly downstream of Candidate Plan Constraint Evaluation and upstream of future Executive Reasoning and Governed Action Proposal. It binds one coherent Context, Intent Set, Constraint Set, Candidate Plan Set, and Evaluated Candidate Plan Set to explicit comparison definitions and registered policies. Every candidate and evaluation is preserved exactly once through a profile; the output remains inert and non-executable.

## Decision

The closed relation vocabulary is `equivalent`, `different`, `only_left`, `only_right`, `not_comparable`, and `indeterminate`. The closed structural outcome vocabulary is `same_value`, `different_value`, `same_count`, `different_count`, `present_in_both`, `absent_in_both`, `present_only_left`, `present_only_right`, `unsupported`, and `conflicting`. Registry-governed reason codes explain every observation and pairwise result without encoding merit.

Explicit definitions authorize only a typed dimension, target selector, value shape, applicability, origin, optional candidate scope, and optional pairwise construction. Supported dimensions cover status, finding-type, and policy counts; objective, constraint, evidence, approval, dependency, assumption, completion-condition, and provenance reference sets; typed temporal and resource values; plan-step structure; and configured metadata. There is no arbitrary expression evaluator and no interpretation of descriptions, labels, Calendar prose, or other narrative.

Each applicable definition produces an ordered typed observation in the candidate profile. Pairwise records exist only for pairwise-enabled definitions. Candidate identifiers are code-unit sorted before generating each unordered pair, so registration and input order cannot choose a baseline. Compatible equal values are equivalent, compatible unequal values are different, explicit one-sided values remain `only_left` or `only_right`, unavailable compatible values are `not_comparable`, and conflicting canonical state is `indeterminate`. None of these relations is a preference or suitability judgement.

Observation identity binds the candidate and evaluation, definition and version, dimension, canonical value, sorted references, policy and version, and reason code. Profile identity additionally binds the evaluated set, sorted policy and definition identities, and sorted observation identities. Pairwise-result identity binds the canonical pair, definition, dimension, relation, outcome, left and right canonical values, policy, and reason. Pairwise identity binds both evaluations and sorted policies, definitions, and result identities. Set identity binds every coherent source identity plus sorted policy, definition, profile, and pair identities. Identities never use clocks, UUIDs, randomness, locale, object insertion order, registration order, or prose.

Profiles preserve Candidate Plan source order; pairs and dimensions use locale-independent code-unit structural order, never relation or merit order. Profile, pair, and set summaries contain counts only. Provenance carries all source-set identities, candidate/evaluation identities, definition and policy identities, source references, configured origin, values, relation/outcome, and reason code. Inputs to policies are defensive clones, outputs are JSON-compatible recursive immutable clones, and replay of structurally identical canonical input is structurally identical.

Empty coherent source sets produce an immutable empty comparison set. A single candidate produces one profile and no synthetic pair. A candidate with no applicable dimensions retains a deterministic zero-observation profile. Zero observations, equivalence, and counts imply neither approval nor recommendation. Malformed or incoherent identities, missing/duplicate/mutated candidates or evaluations, definitions or policies, policy exceptions, unsupported vocabularies, malformed artefacts, duplicates, invalid ordering, summary inconsistency, JSON incompatibility, or identity failure abort the complete operation atomically.

## Boundaries and non-goals

Comparison is descriptive and preserves unchanged upstream artefacts. It performs no aggregate scoring, compliance or feasibility verdict, weighting, utility inference, ranking, Pareto analysis, preference, recommendation, selection, approval, Executive Reasoning, Governed Action Proposal, scheduling, runtime orchestration, specialist or LLM invocation, persistence, API/UI work, or execution. Future reasoning may interpret authorised comparison artefacts; future proposal and authorised execution remain later and separate boundaries.

## Rejected alternatives

- LLM comparison and semantic description comparison: prose inference is neither typed nor replay-safe.
- Weighted scoring, implicit utility functions, higher/lower-is-better defaults, and aggregate compliance or feasibility scores: counts and differences are not merit.
- Ranking, winner selection, candidate removal, or implicit baseline selection: comparison must preserve every candidate and mixed dimension.
- Mutable upstream artefacts or upstream mutation: construction and evaluation remain comparison-neutral.
- Registration-order pair generation: canonical unordered-pair ordering is required.
- Action execution from comparison policies: comparison artefacts are inert and cannot cross an execution boundary.
