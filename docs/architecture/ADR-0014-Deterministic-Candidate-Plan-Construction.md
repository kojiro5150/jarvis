# ADR-0014 — Deterministic Candidate Plan Construction

## Status

Accepted for Sprint 3.19.

## Context and purpose

Executive Context describes canonical state, Executive Intent records explicitly authorised objectives, and Executive Constraints records governing boundaries. The next downstream boundary must construct possible plan shapes without deciding whether any option is compliant, feasible, desirable, approved, or executable.

## Decision

Candidate Plan Construction lives in `lib/executive-operating-system/planning/candidates`. It accepts one coherent Context, Intent Set, and Constraint Set plus explicit typed definitions. Definitions are inert configuration. A registered, versioned policy first evaluates typed structural applicability and may then instantiate that definition. Policies are returned in code-unit identifier order, and duplicate identifiers fail rather than overwrite.

No plan may be inferred from calendar or email prose, missing information, an assessment narrative, semantic similarity, a model, or an objective alone. A definition must explicitly exist and resolve every declared objective, constraint, and canonical context reference. Downstream planning may not bypass Executive Intent.

Construction is separate from future Plan Constraint Evaluation. Evaluation is in turn separate from comparison and selection. Candidate construction produces no score, ranking, recommendation, approval decision, action proposal, scheduling, runtime work, or side effect.

Candidate Plan identities encode the Context, Intent Set, Constraint Set, definition and policy identities and versions, sorted objective and evidence references, and stable step identities. Step identities encode definition identity/version, configured step identity, and objective references. The Candidate Plan Set identity encodes the three source identities, sorted active policy identities, and sorted candidate identities. Neither identity uses time, randomness, locale, registration order, or process state.

Plans use structural ordering by objective references, definition identity/version, policy identity/version, and candidate identity. Steps use explicit ordinal then configured identifier; dependencies must resolve and be acyclic. This ordering conveys no preference.

All candidates retain source, definition, policy, objective, evidence, constraint, and configured-origin provenance. Nested configured content retains its own typed origin. Inputs passed to policies are cloned; policy metadata and canonical results are recursively frozen and JSON-compatible. Construction is atomic: malformed input, policy failure, malformed output, unresolved references, duplicate identity, or inconsistent summary aborts the operation and returns no partial set.

Zero applicable definitions produces a canonical immutable empty Candidate Plan Set with source and registered-policy provenance, count-only summary, and deterministic identity. No fallback or implicit no-action plan is manufactured. A no-action candidate requires an explicit definition and review/completion condition.

## Non-goals and future boundary

Plan Constraint Evaluation is future work. So are feasibility and compliance determination, comparison, ranking, selection, Executive Reasoning, recommendations, Governed Action Proposals, approvals, execution, runtime orchestration, specialists, APIs, UI, persistence, and model integration.

## Rejected alternatives

- Direct LLM plan generation, because it is inferred and not replay-safe.
- Generating plans from calendar or email prose, because observations are not authority.
- Combining construction and constraint evaluation, because a configured relationship is not a compliance result.
- Automatic fallback plans or implicit no-action candidates, because zero candidates is meaningful canonical state.
- Ranking during construction, because structural order must not encode preference.
- Allowing construction policies to execute actions, because candidates are inert options.
- Allowing planning to bypass Executive Intent, because only authorised objectives may be referenced.
