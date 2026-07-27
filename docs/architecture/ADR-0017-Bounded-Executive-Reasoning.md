# ADR-0017 — Bounded Executive Reasoning

## Status

Accepted for Sprint 3.22.

## Purpose and position

Bounded Executive Reasoning sits downstream of Candidate Plan Comparative Analysis and upstream of future Governed Action Proposal. It consumes one coherent Executive Context, Intent Set, Constraint Set, Candidate Plan Set, Evaluated Candidate Plan Set, and Candidate Plan Comparison Set. It answers only what bounded interpretation typed canonical state supports; proposal, human approval, and authorised execution remain distinct later boundaries.

## Decision

The reasoning package has the minimum public surface specified by Sprint 3.22 and produces one canonical Executive Reasoning Record. The record references the six upstream artefacts by stable identity rather than duplicating their rich graph. Its only additional public semantic units are compact observations, typed unresolved questions, explicit governance boundaries, count-only summary, policy/definition identities, and provenance. There is no reasoning graph, node, edge, profile, matrix, cluster, or synthesis container.

Statuses are the closed vocabulary `supported`, `unsupported`, `unresolved`, `indeterminate`, and `not_applicable`. Scopes are `candidate`, `cross_candidate`, `planning_set`, `governance_boundary`, and `evidence_state`. Observation types cover objective alignment, constraint and approval boundaries, dependency readiness, assumptions, completion conditions, evidence sufficiency/conflict, comparison support/limitations, candidate availability, planning-set completeness, proposal-readiness boundaries, and the execution boundary. Registry-governed closed reason codes explain typed results without hidden preference.

Every observation is authorised by an explicit immutable definition containing identity/version, scope, observation type, canonical selectors, applicability, supported outcomes, policy, origin, and optional candidate/evidence/governance references. Definitions contain no expression language, prompt, weight, score, preference direction, recommendation, selection, approval, or execution rule. Descriptions, labels, Calendar prose, names, and titles never establish an observation or authority.

Objective support preserves absent support as unsupported. Missing configured evidence or authority is unresolved and may create a bounded question or boundary. Conflicting canonical evidence is indeterminate. Not-comparable and indeterminate comparisons remain limitations; structural difference never becomes advantage or preference and equivalence never becomes suitability. Candidate availability means only that no configured explicit boundary removed the candidate from future consideration. An unresolved proposal-readiness boundary is not rejection, and no aggregate conclusion is formed.

Observation identity binds source graph identities, definition/policy identities, scope/type/status, reason, compact value, and sorted candidate, evaluation, comparison, evidence, and governance references. Question identity binds its typed requirement and source graph; boundary identity binds type, canonical source, candidates, status, policy, reason, and graph; record identity binds all six sources plus sorted policies, definitions, observations, questions, and boundaries. Code-unit ordering is structural and locale independent. Identities use no clock, UUID, randomness, prose, process state, or insertion/registration order.

Summaries contain counts only by scope, type, status, policy, question reason and boundary type, plus structural candidate counts. Provenance makes the typed basis of each artefact directly inspectable. Policy inputs and outputs are defensive JSON-compatible clones; all canonical output is recursively frozen. Structurally identical replay is structurally identical. Validation or policy failure, malformed or duplicate artefacts, incoherent identities, missing profiles/evaluations, mutation, unsupported vocabulary, invalid references, or JSON incompatibility aborts the entire operation without a partial record.

A coherent empty candidate graph is valid and manufactures no fallback. A single candidate is valid and creates no synthetic comparator. No applicable definition produces a deterministic zero-observation record; this implies neither approval nor rejection. Supported is not recommended, unsupported is not rejected, and a boundary is not an execution instruction.

## Boundaries and non-goals

The layer is advisory and inert. It does not mutate plans, evaluations, or comparisons; interpret narrative; aggregate feasibility or compliance; score, weight, optimise, rank, prefer, recommend, select, approve, reject, schedule, invoke a specialist or LLM, orchestrate runtime work, persist state, expose APIs/UI, or execute. Future Governed Action Proposal may consume the compact record but is not part of reasoning; proposal remains separate from human approval, and approval remains separate from execution.

## Rejected alternatives

We rejected LLM-generated records; semantic interpretation of descriptions; duplication of the upstream graph; reasoning graphs, matrices, and clusters; weighted synthesis and aggregate scores; implicit utility and hidden preference; ranking, selection, recommendation, or approval; treating unresolved as rejection or supported as recommendation; inferring authority from titles; mutating plans, evaluations, or comparisons; side-effecting policies; and combining reasoning with Governed Action Proposal, approval, or execution.
