# Sprint 3.21 — Deterministic Candidate Plan Comparative Analysis

---

# JARVIS Engineering

This sprint forms part of the Executive Operating System implementation.

The Executive Operating System is governed by the following hierarchy:

Engineering Constitution
↓
North Star
↓
JESS — JARVIS Engineering Specification Standard
↓
Sprint Specifications
↓
Behavioural Constitutions
↓
Architecture Decision Records
↓
Compliance & Validation
↓
Executive Operating System Runtime

Every implementation decision in this sprint shall preserve this hierarchy.

Where this sprint specification conflicts with a higher-order constitutional document, the higher-order document prevails.

Where the existing repository architecture cannot support a required capability without weakening an established boundary, stop and report the architectural conflict rather than introducing hidden semantics, implicit preference, or upstream redesign.

---

# Engineering Principles

Continue the established repository principles:

- architecture before implementation
- deterministic before adaptive
- typed before dynamic
- validation before enforcement
- explicit over inferred
- immutable canonical artefacts
- replay safety
- provider independence
- provenance before convenience
- construction before evaluation
- evaluation before comparison
- comparison before reasoning
- reasoning before proposal
- proposal before authorised execution
- unresolved before assumed
- differences before preference
- backward compatibility unless intentionally changed
- small independently reviewable pull requests

No implementation may weaken these principles.

---

# Repository Status

Completed:

- Sprint 3.10 — Executive Operating System Foundations
- Sprint 3.11 — Projection Engine
- Sprint 3.12 — Calendar Projection Adapter
- Sprint 3.13 — Situational Awareness Snapshot Lifecycle
- Sprint 3.14 — Executive Attention Layer
- Sprint 3.15 — Executive Situation Formation
- Sprint 3.16 — Executive Situation Assessment
- Sprint 3.17 — Executive Context
- Sprint 3.18 — Executive Intent & Constraint Model
- Sprint 3.19 — Candidate Plan Construction
- Sprint 3.20 — Candidate Plan Constraint Evaluation

Current architecture:

External Systems
↓
Connectors
↓
Projection Adapters
↓
ProjectionArtifacts
↓
ProjectionEngine
↓
Situational Awareness
↓
Snapshot Lifecycle
↓
Deterministic Change Set
↓
Executive Attention
↓
Executive Attention Queue
↓
Executive Situation Formation
↓
Executive Situation Set
↓
Executive Situation Assessment
↓
Assessment Set
↓
Executive Context
↓
Executive Intent Set
+
Executive Constraint Set
↓
Candidate Plan Construction
↓
Candidate Plan Set
↓
Candidate Plan Constraint Evaluation
↓
Evaluated Candidate Plan Set

The repository can now construct explicit candidate plans, evaluate them against typed constraints and preserve every candidate without mutation, ranking, selection, recommendation, approval or execution.

No Candidate Plan Comparative Analysis model exists.

No comparative dimension registry exists.

No pairwise comparison model exists.

No candidate-level comparison profile exists.

No ranking, selection, Executive Reasoning, recommendation, Governed Action Proposal or execution boundary exists.

---

# Relationship to the North Star

Candidate Plan Construction answers:

> Which explicit candidate plans are authorised to exist?

Candidate Plan Constraint Evaluation answers:

> What deterministic findings apply to each candidate?

The next architectural question is:

> How do evaluated candidates differ across explicit, typed, non-preferential comparison dimensions?

This sprint introduces Candidate Plan Comparative Analysis.

The comparison layer shall expose structural differences between evaluated candidates.

It shall not determine which candidate is best, assign merit, rank, recommend, select, approve or execute.

---

# Sprint Objective

Implement a deterministic Candidate Plan Comparative Analysis Layer.

The layer shall consume:

- one immutable Evaluated Candidate Plan Set;
- the coherent immutable Executive Context;
- the coherent immutable Executive Intent Set;
- the coherent immutable Executive Constraint Set;
- the coherent immutable Candidate Plan Set;
- explicit typed comparison definitions;
- registered deterministic comparison policies.

The layer shall produce:

- immutable candidate comparison profiles;
- immutable pairwise comparison records where explicitly configured;
- typed dimension observations;
- explicit equivalence and difference findings;
- deterministic identities;
- structural ordering;
- count-only summaries;
- complete provenance;
- one immutable Candidate Plan Comparison Set;
- no hidden inference;
- no preference or merit semantics.

The layer shall preserve every evaluated candidate exactly once.

Comparison shall describe difference.

Comparison shall not convert difference into preference.

---

# Architectural Position

Executive Context
+
Executive Intent Set
+
Executive Constraint Set
+
Candidate Plan Set
+
Evaluated Candidate Plan Set
↓
Candidate Plan Comparison Definitions
↓
Candidate Plan Comparison Policies
↓
Candidate Plan Comparison Registry
↓
Candidate Plan Comparison Engine
↓
Candidate Plan Comparison Set
↓
Future Executive Reasoning
↓
Future Governed Action Proposal
↓
Future Authorised Execution

Candidate Plan Comparative Analysis must stop at deterministic comparison artefacts.

---

# Fundamental Separation

## Candidate Construction

Completed in Sprint 3.19.

Answers:

> Which explicit candidate options can be constructed?

## Constraint Evaluation

Completed in Sprint 3.20.

Answers:

> What deterministic findings apply to each candidate?

## Candidate Comparative Analysis

This sprint.

Answers:

> How do evaluated candidates differ across explicit typed dimensions?

## Executive Reasoning

Future sprint responsibility.

Answers:

> What bounded interpretation of those differences may be formed for authorised human consideration?

## Governed Action Proposal

Future sprint responsibility.

Answers:

> What candidate, combination, deferment, or request for further evidence may be proposed within governance boundaries?

## Authorised Execution

Future responsibility.

Answers:

> What approved action may cross the execution boundary?

Comparative Analysis shall not perform reasoning, recommendation, selection, approval, proposal or execution work.

---

# Comparison Philosophy

Comparison is not ranking.

Comparison is not scoring.

Comparison is not recommendation.

Comparison is not optimisation.

Comparison is not a decision.

The comparison layer shall represent only deterministic relationships supported by canonical typed inputs.

Permitted examples:

- Candidate A has two unresolved approval findings; Candidate B has one.
- Candidate A references a constraint that Candidate B does not.
- Candidate A and Candidate B have equivalent completion-condition counts.
- Candidate C contains an additional dependency.
- Candidate B has canonical evidence for one requirement that Candidate A lacks.
- Candidate A and Candidate D are structurally equivalent on a configured dimension.
- Candidate A and Candidate B cannot be compared on a dimension because compatible typed values are absent.

Prohibited examples:

- Candidate B is better.
- Candidate A is safer.
- Candidate C should be chosen.
- Candidate D is the preferred option.
- Candidate A is more feasible.
- Candidate B has the best trade-off.
- Candidate C wins.
- Candidate A is unacceptable.

---

# Comparison Scope

Sprint 3.21 shall support deterministic comparison of:

- finding counts by status;
- finding counts by type;
- finding counts by policy;
- explicit constraint coverage;
- explicit objective coverage;
- explicit evidence coverage;
- missing evidence;
- conflicting evidence;
- unresolved approvals;
- violated findings;
- unresolved findings;
- indeterminate findings;
- dependencies;
- assumptions;
- completion conditions;
- explicit typed resource values;
- explicit typed temporal values;
- explicit typed plan-step structures;
- explicit typed approval requirements;
- explicit typed provenance differences;
- configured canonical metadata.

Only comparison dimensions expressible through typed canonical data and registered deterministic policy logic are permitted.

---

# Architectural Boundaries

Candidate Plan Comparative Analysis may consume:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan public contracts;
- Candidate Plan Evaluation public contracts;
- explicit comparison definitions;
- explicit comparison dimensions;
- canonical finding statuses and reason codes;
- canonical evidence references;
- registered deterministic comparison policies;
- shared canonical validation and identity utilities.

Candidate Plan Comparative Analysis shall not consume:

- LLM outputs;
- embeddings;
- semantic similarity;
- free-form reasoning;
- generated recommendations;
- runtime memory;
- external state not represented canonically;
- specialist output;
- provider responses;
- web content;
- untyped prompts;
- inferred preference, utility, risk appetite, weighting, importance or urgency;
- hidden ranking rules;
- future reasoning, proposal or execution outputs.

---

# No Narrative Comparison

The comparison layer shall not compare candidates by interpreting prose.

Prohibited behaviour includes:

- determining that one plan is more ambitious because its description sounds broader;
- judging one plan more complex from step labels;
- interpreting narrative evidence as stronger or weaker;
- deciding that one approval is more important than another from role titles;
- using an LLM to compare plan quality;
- inferring cost, effort, risk or value from natural language;
- treating longer descriptions as more complete;
- treating more findings as worse;
- treating fewer findings as better.

Comparison must rely only on explicit typed values, identities, statuses, counts and configured dimensions.

---

# Package Structure

Create:

```text
lib/executive-operating-system/planning/comparison/
  types.ts
  registry.ts
  engine.ts
  policies.ts
  validation.ts
  index.ts
```

Focused tests shall live within the same package boundary:

```text
lib/executive-operating-system/planning/comparison/
  comparison.test.ts
  calendar-integration.test.ts
  package-conformance.test.ts
```

Do not add comparison code to Candidate Plan Construction, Candidate Plan Constraint Evaluation, Executive Context, Intent, Constraint, Assessment, Situation, Attention, Snapshot or Projection packages.

No package outside the comparison package may directly construct canonical comparison artefacts.

---

# Core Contracts

Implement immutable typed contracts for:

- `CandidatePlanComparisonRelation`
- `CandidatePlanComparisonOutcome`
- `CandidatePlanComparisonDimensionType`
- `CandidatePlanComparisonPolicy`
- `CandidatePlanComparisonPolicyMetadata`
- `CandidatePlanComparisonDefinition`
- `CandidatePlanComparisonInput`
- `CandidatePlanDimensionObservation`
- `CandidatePlanComparisonProfile`
- `CandidatePlanPairwiseComparison`
- `CandidatePlanPairwiseDimensionResult`
- `CandidatePlanComparisonSummary`
- `CandidatePlanComparisonSet`
- `CandidatePlanComparisonRegistry`
- `CandidatePlanComparisonEngine`

Use established repository naming and identity conventions where applicable.

All public contracts shall be immutable and all canonical outputs shall be JSON-compatible.

---

# Comparison Relation Vocabulary

Implement a closed non-preferential comparison-relation vocabulary.

At minimum:

```text
equivalent
different
only_left
only_right
not_comparable
indeterminate
```

## Equivalent

The compared candidates have structurally equal canonical values for the configured dimension.

## Different

Both candidates contain compatible canonical values and those values are structurally unequal.

## Only Left

The left candidate contains the configured canonical value or structure and the right candidate does not.

## Only Right

The right candidate contains the configured canonical value or structure and the left candidate does not.

## Not Comparable

The dimension applies, but compatible canonical values are not available for comparison.

## Indeterminate

Canonical values exist but conflict or otherwise prevent a deterministic relation within the supported model.

Do not introduce better, worse, superior, inferior, preferred, rejected, safer, riskier, feasible, winning, losing, dominant or dominated.

---

# Comparison Outcome Vocabulary

Where a separate dimension outcome is required, use a closed descriptive vocabulary.

At minimum:

```text
same_value
different_value
same_count
different_count
present_in_both
absent_in_both
present_only_left
present_only_right
unsupported
conflicting
```

Outcomes shall remain structural and shall not encode merit.

---

# Comparison Dimension Types

Support typed comparison dimensions at minimum for:

- status count;
- finding type count;
- policy count;
- constraint reference set;
- objective reference set;
- evidence reference set;
- missing evidence set;
- conflicting evidence set;
- approval requirement set;
- dependency set;
- assumption set;
- completion-condition set;
- typed temporal value;
- typed resource value;
- plan-step structure;
- provenance reference set;
- configured metadata value.

Do not create a generic arbitrary-expression evaluator.

---

# Candidate Plan Comparison Policy

Each comparison policy shall expose:

- stable policy identifier;
- stable policy version;
- immutable metadata;
- supported comparison dimension types;
- deterministic applicability evaluation;
- deterministic observation construction;
- deterministic pairwise comparison construction where applicable.

A policy may inspect typed Candidate Plan structures, typed evaluation findings, count-only summaries and canonical references. It may construct observations, compare compatible typed values, identify equality, difference, presence, absence, unsupported state or conflict, attach reason codes and preserve provenance.

A policy shall not mutate candidates or evaluations, create or remove plans, rank, score, weight, infer utility, recommend, select, approve, invoke an LLM or specialist, execute, schedule or perform side effects.

---

# Comparison Policy Metadata

Policy metadata shall contain, at minimum:

- stable identifier;
- version;
- display name;
- description;
- supported dimension types;
- origin;
- status.

Metadata shall be validated, cloned, deeply frozen, replay-safe and JSON-compatible.

Descriptions shall not contain hidden weighting or preference logic.

---

# Comparison Registry

Implement a deterministic Candidate Plan Comparison Registry.

The registry shall:

- validate every registered policy and its metadata;
- reject empty identifiers and versions;
- reject duplicate policy identifiers;
- permit one active registration per identifier unless an established versioning convention requires otherwise;
- clone and deeply freeze registration metadata;
- return policies in locale-independent code-unit ascending identifier order;
- remain independent of registration order;
- remain replay-safe.

Duplicate identifiers shall fail explicitly. No last-write-wins behaviour is permitted.

---

# Candidate Plan Comparison Definition

Comparison dimensions must be explicitly defined.

Each definition shall contain, at minimum:

- stable definition identifier;
- stable definition version;
- dimension type;
- target canonical field or typed selector;
- applicability configuration;
- supported value shape;
- configured origin;
- optional candidate scope;
- optional pairwise-comparison enablement.

Definitions shall not contain weights, scores, preference direction, optimisation goals, “higher is better” semantics, “lower is better” semantics, thresholds that imply approval, rankings or recommendations.

A comparison definition authorises observation and comparison only.

---

# Candidate Plan Comparison Input

The engine input shall bind exactly one coherent planning, evaluation and comparison state.

It shall contain:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- registered comparison policies;
- explicit comparison definitions.

Validation shall confirm:

- all source identities are coherent;
- the Candidate Plan Set references the supplied Context, Intent and Constraint sets;
- the Evaluated Candidate Plan Set references the supplied Candidate Plan Set and the same upstream identities;
- every Candidate Plan appears exactly once in the Evaluated Candidate Plan Set;
- every source Candidate Plan remains structurally unchanged;
- every comparison definition is valid and unique;
- every referenced policy and dimension is supported;
- no mutable input is retained by reference.

Any identity mismatch shall fail atomically.

---

# Candidate Plan Comparison Profile

Every evaluated candidate shall produce exactly one Candidate Plan Comparison Profile.

A profile shall contain:

- stable profile identifier;
- Candidate Plan identifier;
- Candidate Plan Evaluation identifier;
- ordered dimension observations;
- count-only profile summary;
- active policy identities;
- comparison-definition identities;
- source-set identities;
- provenance.

A profile shall not contain rank, score, preference, recommendation, approval status, selected status, executable status, overall quality, overall risk or overall feasibility.

---

# Candidate Plan Dimension Observation

Each observation shall contain, at minimum:

- stable observation identifier;
- Candidate Plan identifier;
- comparison definition identifier and version;
- dimension type;
- canonical value shape;
- canonical value or canonical reference set;
- value-presence state;
- source references;
- comparison policy identifier and version;
- deterministic reason code;
- provenance.

Values must remain typed and JSON-compatible.

Human-readable descriptions may explain a typed dimension, but shall not substitute for the canonical value.

---

# Pairwise Comparison

Pairwise comparison shall be implemented only where explicitly enabled by a comparison definition.

For `n` candidates, pairwise records shall be constructed deterministically for each unordered candidate pair.

Canonical pair ordering shall use code-unit ascending Candidate Plan identifiers.

A pairwise record shall contain:

- stable pairwise-comparison identifier;
- left Candidate Plan identifier;
- right Candidate Plan identifier;
- ordered dimension results;
- count-only summary;
- active policy identities;
- definition identities;
- provenance.

The left/right labels are structural only and shall not express preference.

---

# Pairwise Dimension Result

Each pairwise dimension result shall contain:

- stable result identifier;
- left Candidate Plan identifier;
- right Candidate Plan identifier;
- comparison definition identifier and version;
- dimension type;
- comparison relation;
- comparison outcome;
- left canonical value or reference set;
- right canonical value or reference set;
- deterministic reason code;
- comparison policy identifier and version;
- provenance.

A pairwise result shall not contain winner, loser, advantage, disadvantage, preference, score delta, weighted difference or recommendation.

---

# Reason Codes

Every observation and pairwise result shall contain a deterministic typed reason code.

Reason codes shall be closed or registry-governed.

Examples:

```text
dimension-values-equivalent
dimension-values-different
dimension-present-only-left
dimension-present-only-right
dimension-values-not-comparable
dimension-values-conflicting
status-counts-equivalent
status-counts-different
constraint-reference-sets-equivalent
constraint-reference-sets-different
evidence-reference-missing-left
evidence-reference-missing-right
typed-resource-values-different
typed-temporal-values-equivalent
unsupported-dimension-shape
```

Reason codes shall not encode preference. Canonical identity shall not depend on localised descriptions.

---

# Initial Production Comparison Policies

Implement a deliberately bounded production policy set.

## Policy 1 — Finding Status Count Comparison

Construct per-candidate observations for counts of satisfied, violated, unresolved, not-applicable and indeterminate findings.

Pairwise comparison may report same count, different count, unsupported shape or conflicting summary state.

This policy shall not interpret more or fewer findings as better or worse.

## Policy 2 — Finding Type Count Comparison

Construct per-candidate observations for counts of constraint, dependency, approval, assumption, completion-condition and evidence findings.

Pairwise comparison may report structural equality or difference only.

## Policy 3 — Canonical Reference Set Comparison

Compare explicit sets of objective, constraint, evidence, missing-evidence, conflicting-evidence, approval, dependency, assumption and completion-condition references.

Reference sets shall be sorted and deduplicated canonically.

The policy may identify equivalent sets, different sets, left-only references and right-only references. It shall not infer that broader coverage is superior.

## Policy 4 — Typed Temporal Value Comparison

Compare typed temporal values only where compatible canonical structures exist or one-sided presence is explicit.

The policy may compare not-before values, not-after values, intervals, durations, deadlines and reference times.

It shall not infer urgency, lateness, feasibility, scheduling preference or expected completion.

## Policy 5 — Typed Resource Value Comparison

Compare explicit compatible resource values such as canonical quantity, resource identifier, budget category, capacity category, availability state and prohibited or required resource sets.

The policy shall not estimate cost, staffing, effort or capacity and shall not encode “less is better” or “more is better”.

## Policy 6 — Plan Structure Comparison

Compare explicit plan structures such as number of steps, step identifier sets, step-type sets, dependency-edge sets, approval requirements, assumptions and completion conditions.

The policy shall not infer complexity or quality from structural size.

## Policy 7 — Provenance Comparison

Compare canonical provenance references such as source Objective, Constraint, Evidence, Situation, Assessment, policy and definition identifiers.

The policy may identify equivalent or differing provenance. It shall not infer reliability from provenance count or source name.

## Policy 8 — Explicit Metadata Comparison

Compare only configured typed metadata fields such as plan category, plan type, authority category, execution-boundary category, privacy classification and governance classification.

Descriptions and labels shall not be semantically interpreted.

---

# Policy Scope Discipline

Do not create a universal policy that compares arbitrary object fields.

Do not compare descriptive prose.

Do not create hidden weights.

Do not treat satisfied counts as positive points or violated counts as negative points.

Do not aggregate dimensions into a score.

Do not use lexical order as a ranking.

Do not treat the first candidate as a baseline unless explicitly configured as a non-preferential reference candidate.

Do not manufacture differences where canonical values are absent.

A comparison set containing many `not_comparable` results may be correct.

---

# Comparison Process

The engine shall:

1. validate Executive Context;
2. validate Executive Intent Set;
3. validate Executive Constraint Set;
4. validate Candidate Plan Set;
5. validate Evaluated Candidate Plan Set;
6. verify coherent source identities;
7. verify every Candidate Plan appears exactly once;
8. verify source Candidate Plans remain unchanged;
9. validate registered comparison policies;
10. validate explicit comparison definitions;
11. clone all policy inputs;
12. retrieve policies in deterministic order;
13. construct candidate-level observations;
14. validate every returned observation;
15. reject unsupported dimension types;
16. reject malformed reason codes;
17. reject unresolved mandatory references;
18. reject duplicate observation identities;
19. construct one comparison profile per candidate;
20. preserve source candidate structural order;
21. construct pairwise records only for explicitly enabled definitions;
22. generate unordered candidate pairs deterministically;
23. validate every pairwise dimension result;
24. reject duplicate pairwise result identities;
25. order observations and pairwise results deterministically;
26. construct count-only profile and pairwise summaries;
27. construct the comparison-set summary;
28. construct deterministic identities;
29. deeply freeze canonical output;
30. validate the final Candidate Plan Comparison Set;
31. return only after all validation succeeds.

Any failure shall abort the complete comparison. No partial Candidate Plan Comparison Set may be returned.

---

# Candidate Preservation

Every Evaluated Candidate Plan shall appear exactly once through a Candidate Plan Comparison Profile.

Comparison shall not omit, duplicate, mutate or merit-order candidates or evaluations.

If no comparison policy applies to a candidate, return a valid profile containing the source identifiers, an empty observation collection, a zero-valued summary, deterministic profile identity and policy provenance.

---

# Deterministic Identities

## Observation Identity

Derive from canonical structural inputs including Candidate Plan identifier, Candidate Plan Evaluation identifier, comparison definition identity, dimension type, canonical value, sorted references, comparison policy identity and reason code.

## Comparison Profile Identity

Derive from Candidate Plan identifier, Candidate Plan Evaluation identifier, Evaluated Candidate Plan Set identifier, sorted policy identities, sorted definition identities and sorted observation identities.

## Pairwise Comparison Identity

Derive from canonically ordered Candidate Plan identifiers, corresponding evaluation identifiers, sorted policy identities, sorted definition identities and sorted pairwise result identities.

Identity shall not depend on which candidate was originally supplied first.

## Pairwise Dimension Result Identity

Derive from canonically ordered Candidate Plan identifiers, comparison definition identity, dimension type, relation, outcome, canonical left and right values, policy identity and reason code.

## Candidate Plan Comparison Set Identity

Derive from Context, Intent Set, Constraint Set, Candidate Plan Set, Evaluated Candidate Plan Set, sorted policy identities, sorted definition identities, sorted profile identities and sorted pairwise-comparison identities.

An empty Candidate Plan Set shall produce a valid deterministic empty Candidate Plan Comparison Set.

No canonical identity may depend on UUIDs, generated timestamps, current clock time, randomness, registration order, object insertion order, localised prose, runtime state or model output.

---

# Ordering

Candidate comparison profiles shall preserve source Candidate Plan structural order.

Pairwise records shall use canonically ordered unordered pairs.

Observations and pairwise results shall use locale-independent code-unit structural ordering.

Ordering shall never express merit, severity, priority, urgency, importance, desirability, feasibility, preference or recommendation.

Do not order relations from “best” to “worst”.

---

# Count-Only Summaries

## Profile Summary

At minimum:

- total observations;
- observations by dimension type;
- observations by policy;
- observations with present values;
- observations with absent values;
- observations with unsupported values;
- reference counts by supported reference type.

## Pairwise Summary

At minimum:

- total dimension results;
- equivalent relations;
- different relations;
- only-left relations;
- only-right relations;
- not-comparable relations;
- indeterminate relations;
- results by dimension type;
- results by policy.

## Comparison Set Summary

At minimum:

- candidates compared;
- profiles created;
- pairwise comparisons created;
- comparison policies active;
- comparison definitions active;
- total observations;
- total pairwise dimension results;
- observations by dimension type;
- pairwise results by relation and outcome;
- candidates with zero observations;
- pairs with zero dimension results;
- unsupported observations;
- not-comparable results;
- indeterminate results.

Summaries shall not contain scores, ranks, preferences, winners, recommendations, approval or rejection.

---

# No Aggregate Preference

Sprint 3.21 shall not produce:

- aggregate score;
- utility score;
- risk score;
- compliance score;
- feasibility score;
- weighted total;
- ranking;
- preferred candidate;
- dominated candidate;
- Pareto frontier;
- recommendation;
- selection.

Mixed pairwise results shall remain mixed and shall not be collapsed into a judgement.

---

# Provenance

Every observation shall preserve coherent source-set identifiers, Candidate Plan and Evaluation identifiers, comparison definition identity, comparison policy identity, canonical source references, reason code and configured origin.

Every pairwise result shall preserve both candidate and evaluation identifiers, definition and policy identities, source values or references, relation, outcome and reason code.

No downstream consumer should need to reconstruct why a comparison exists from descriptive prose.

---

# Validation Requirements

Implement validation for:

- comparison relations;
- comparison outcomes;
- comparison dimension types;
- reason codes;
- policy contracts and metadata;
- comparison definitions and unique identifiers;
- source identity coherence;
- Candidate Plan and Evaluation preservation;
- one profile per candidate;
- pairwise canonical ordering;
- all deterministic identities;
- deterministic ordering;
- duplicate observation, result, profile and pairwise-comparison rejection;
- summary consistency;
- JSON compatibility;
- defensive copying;
- recursive deep freezing;
- replay safety;
- atomic failure.

Validation shall not determine which candidate should be selected.

---

# JSON Compatibility

Reject functions, symbols, `undefined`, `BigInt`, non-finite numbers, cycles, mutable class instances, unsupported collection types, provider-specific objects, unvalidated date objects, errors and promises embedded in canonical output.

Use established repository validation utilities where available.

---

# Immutability

The engine shall not retain mutable references to any upstream artefact, definition, metadata, policy input or unvalidated policy output.

Inputs supplied to policies shall be defensively cloned.

All observations, profiles, pairwise results, pairwise comparisons, summaries and sets shall be recursively frozen before return.

Tests must prove that attempted mutation cannot alter canonical output or upstream artefacts.

---

# Replay Safety

Structurally identical canonical inputs, definitions and policy registrations shall produce structurally identical observations, relations, outcomes, identities, ordering, provenance, summaries, profiles, pairwise comparisons and comparison sets.

Replay shall not depend on process state, clock time, locale, registration order, randomness, caches, provider state or object insertion order.

---

# Atomic Failure

Complete comparison shall fail on malformed or incoherent inputs, mutated or missing candidates, duplicate evaluations, malformed or duplicate policies or definitions, policy exceptions, malformed observations or pairwise results, unsupported vocabularies, invalid reason codes or identities, duplicate canonical artefacts, invalid pair ordering, unresolved mandatory references, invalid ordering or summaries, JSON incompatibility or detected replay instability.

No partial result may be returned.

---

# Empty, Single-Candidate and Zero-Observation Semantics

An empty coherent Candidate Plan Set and Evaluated Candidate Plan Set shall produce a valid immutable empty Candidate Plan Comparison Set with coherent source identities, empty profiles and pairs, deterministic identity, zero-valued summary and policy/definition provenance.

A single candidate shall produce one profile and zero pairwise comparisons. The engine shall not manufacture a synthetic baseline.

A candidate with no applicable observations shall produce a valid zero-observation profile. Zero observations shall not mean equivalent, preferred, approved, compliant or feasible.

---

# Calendar Integration Proof

Extend the production vertical path through Candidate Plan Comparative Analysis.

The integration test shall demonstrate:

- Calendar content does not independently determine comparison dimensions;
- explicit Objectives and Constraints exist;
- at least two explicit Candidate Plan Definitions apply;
- at least two Candidate Plans are deterministically constructed and evaluated;
- explicit comparison definitions determine permitted dimensions;
- candidate profiles and deterministic pairwise comparison are constructed;
- one explicit difference and one explicit equivalence are surfaced;
- absent compatible values produce `not_comparable` where applicable;
- source Candidate Plans and Evaluations remain unchanged;
- no ranking, recommendation, selection, approval or execution occurs;
- comparison identity remains stable across replay.

Also test empty, single-candidate and zero-observation paths, and prove that Calendar narrative changes that do not alter canonical typed inputs do not alter comparison output.

---

# Package Conformance

The comparison package may depend only on Executive Context public contracts, Executive Intent & Constraint public contracts, Candidate Plan public contracts, Candidate Plan Evaluation public contracts, local comparison contracts and established shared validation and identity utilities.

Production comparison code shall not depend on connectors, projection, snapshot, attention, situation, assessment internals, construction or evaluation internals, future reasoning or proposal packages, selection, execution, runtime orchestration, specialists, notifications, UI, API routes, persistence, model providers or external SDKs.

Integration tests may import upstream packages only to prove the vertical architecture.

---

# Upstream Boundary Preservation

No upstream package shall become aware of Candidate Plan Comparative Analysis.

Candidate Plan Construction and Candidate Plan Constraint Evaluation shall not import comparison.

Do not add comparison fields to Candidate Plan or Evaluation contracts merely for convenience. Upstream artefacts must remain comparison-neutral.

---

# Public Exports

Expose approved public comparison contracts only through:

```text
lib/executive-operating-system/planning/comparison/index.ts
```

Do not require downstream consumers to import internal implementation files.

---

# Required Focused Tests

Create focused tests covering:

## Registry

- successful registration;
- cloned and deeply frozen metadata;
- duplicate rejection;
- registration-order independence;
- locale-independent code-unit ordering.

## Input Coherence

- coherent inputs succeed;
- every source identity mismatch fails;
- missing or duplicate Candidate Plan Evaluations fail;
- mutated source Candidate Plans fail;
- malformed or duplicate definitions fail.

## Candidate Profiles

- exactly one profile per candidate;
- source order preserved;
- zero-observation profile valid;
- source plans and evaluations unchanged.

## Comparison Policies

- equivalent and different status counts;
- equivalent and different finding-type counts;
- equivalent, different, left-only and right-only reference sets;
- compatible and incompatible temporal values;
- compatible and incompatible resource values;
- equivalent and different plan structures;
- equivalent and different provenance;
- no semantic inference or preference.

## Pairwise Comparisons

- deterministic pair generation;
- canonical pair order;
- input-order independence;
- each unordered pair appears once;
- no winner, loser, advantage or preference;
- mixed results preserved.

## Identities and Ordering

- every identity is stable;
- policy, definition and reference ordering do not affect identity;
- no generated time or randomness;
- profiles, observations, pairs and results are structurally ordered;
- relation values never control ordering.

## Summaries

- profile, pairwise and set counts are correct;
- counts by dimension, relation, outcome and policy are correct;
- malformed summaries fail;
- no score, rank or recommendation fields exist.

## Immutability and Replay

- all policy inputs are cloned;
- upstream artefacts cannot be mutated;
- all outputs are deeply frozen;
- repeated comparison is structurally equal.

## Atomic Failure

- policy exception, malformed result, duplicate, invalid identity, unsupported vocabulary and malformed reason code each abort the complete comparison;
- no partial set is returned.

## Semantics

- no aggregate score, ranking, preference, recommendation, selection, approval or execution state exists;
- more satisfied findings do not imply preference;
- fewer violated findings do not imply preference;
- lexical order does not imply preference;
- difference does not imply advantage;
- equivalence does not imply suitability.

## Integration and Package Boundaries

- complete Calendar-to-Comparison path;
- explicit difference and equivalence;
- `not_comparable` handling;
- replay stability;
- empty and single-candidate behaviour;
- Calendar prose isolation;
- production imports remain within approved boundaries;
- upstream packages do not import comparison.

---

# Repository Validation

Run at minimum:

```bash
npx vitest run lib/executive-operating-system/planning/comparison
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short --branch
```

Report non-fatal Google Fonts optimisation warnings separately only when the production build otherwise succeeds.

Do not describe a failed build as passed.

---

# Architecture Documentation

Update:

```text
docs/architecture/SYSTEM-ARCHITECTURE.md
```

to place Candidate Plan Comparative Analysis downstream of evaluation and upstream of future Executive Reasoning.

Document clearly that comparison artefacts are descriptive, structural, explicit, deterministic, provenance-preserving, unweighted, unscored, unranked, unselected, unapproved, non-recommended, inert and non-executable.

Document that a difference is not a preference and an equivalence is not a recommendation.

---

# ADR

Create:

```text
docs/architecture/ADR-0016-Deterministic-Candidate-Plan-Comparative-Analysis.md
```

Title:

# ADR-0016 — Deterministic Candidate Plan Comparative Analysis

The ADR shall document:

- architectural purpose and position;
- relation and outcome vocabularies;
- dimension types;
- explicit comparison-definition requirement;
- reason-code strategy;
- candidate-profile and pairwise models;
- canonical unordered-pair ordering;
- treatment of unsupported, one-sided and conflicting values;
- prohibition on narrative interpretation;
- preservation of every candidate and evaluation;
- prohibition on aggregate scores and ranking;
- all deterministic identities and ordering;
- count-only summaries;
- provenance;
- immutable and replay-safe outputs;
- zero-observation, single-candidate and empty-set semantics;
- atomic failure;
- future Executive Reasoning and Governed Action Proposal boundaries;
- non-goals and rejected alternatives.

Rejected alternatives shall include LLM comparison, semantic description comparison, weighted scoring, implicit utility functions, higher/lower-is-better defaults, aggregate compliance or feasibility scores, ranking, winner selection, candidate removal, implicit baseline selection, mutable upstream artefacts, registration-order pair generation, upstream mutation and action execution from comparison policies.

---

# Explicit Non-Goals

Sprint 3.21 shall not introduce:

- Executive Reasoning;
- ranking;
- weighted evaluation;
- scoring;
- utility functions;
- optimisation;
- Pareto analysis;
- preference;
- priority;
- urgency;
- importance;
- desirability;
- overall feasibility or compliance verdicts;
- selection;
- recommendations;
- trade-off resolution;
- approval or rejection decisions;
- Governed Action Proposal;
- scheduling or task creation;
- notifications;
- specialist routing or invocation;
- LLM reasoning, embeddings or semantic comparison;
- runtime orchestration;
- persistence;
- APIs;
- UI;
- external side effects;
- execution;
- automatic remediation;
- rewriting of constraints, objectives, plans or evaluations.

---

# Acceptance Criteria

Sprint 3.21 is complete only when:

- immutable comparison contracts are implemented;
- closed relation and outcome vocabularies are implemented;
- typed comparison dimensions and reason codes are implemented;
- deterministic policy contracts and registry are implemented;
- duplicate policies fail explicitly;
- explicit comparison definitions are implemented;
- deterministic comparison engine and bounded production policies are implemented;
- every evaluated candidate is preserved exactly once;
- source plans and evaluations remain unchanged;
- one profile exists per candidate;
- pairwise comparisons occur only when explicitly configured;
- unordered pairs are canonical and unique;
- equivalence, difference, one-sided presence, not-comparable and indeterminate results are supported;
- no aggregate score, ranking, preference, recommendation, selection or approval decision exists;
- all deterministic identities and structural ordering are implemented;
- count-only summaries are implemented;
- zero-observation, single-candidate and empty-set paths are supported;
- JSON compatibility, defensive copying, deep freezing, replay safety and atomic failure are proven;
- Calendar vertical integration and package-conformance tests pass;
- upstream architecture remains preserved;
- repository tests, lint, typecheck, build and `git diff --check` pass;
- working tree is clean after commit;
- `SYSTEM-ARCHITECTURE.md` is updated;
- ADR-0016 is completed.

---

# Recommended Pull Request Scope

Suggested pull-request title:

```text
Sprint 3.21: Add deterministic Candidate Plan Comparative Analysis
```

Suggested commit title:

```text
feat(eos): add deterministic candidate plan comparative analysis
```

Do not include Executive Reasoning, ranking, recommendation, selection, Governed Action Proposal or execution.

---

# Completion Report

Provide the established completion report with:

## Summary

Describe contracts, vocabularies, definitions, registry, engine, policies, candidate profiles, pairwise comparisons, validation, identities, ordering, summaries, integration and documentation.

## Architectural Compliance

Confirm coherent canonical inputs, unchanged plans and evaluations, typed-only comparison, no prose interpretation, no preference from difference, separation from reasoning/proposal/execution, no ranking/scoring/recommendation and preserved upstream boundaries.

## Key Decisions

Report package placement, vocabularies, dimension and definition models, reason-code model, profile and pairwise models, canonical pair ordering, unsupported/one-sided/conflicting-value handling, all identities, preservation rules, zero-observation/single-candidate/empty-set behaviour, ordering, summaries, provenance and atomic failure.

## Testing

Report every command and exact result, distinguishing successful builds from non-fatal external-resource warnings.

## Files Changed

List every created or modified file with a short description.

## Commit

Provide full hash and title.

## Pull Request

Provide branch, title and URL when available. If the service records the PR but provides no URL, state that precisely.

## Deferred Items

Explicitly list Executive Reasoning, reasoning records, comparative interpretation, ranking, selection, recommendations, Governed Action Proposal, approval workflow, execution, runtime orchestration, specialist invocation, persistence, APIs, UI and LLM integration.

---

# Final Architectural Constraint

Candidate Plan Comparative Analysis ends with an immutable set of deterministic structural comparisons over unchanged evaluated candidates.

A comparison observation is not a judgement.

A comparison relation is not a preference.

A difference is not an advantage.

An equivalence is not approval.

A count is not a score.

A pairwise record is not a contest.

A comparison set is not a recommendation.

This sprint shall never collapse mixed dimensions into an aggregate score, rank candidates, select a preferred option, or determine what should happen next.

Its sole responsibility is to answer:

> How do evaluated Candidate Plans differ across explicit typed comparison dimensions, based only on coherent canonical inputs and registered deterministic comparison policies?
