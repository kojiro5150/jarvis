# Sprint 3.20 — Deterministic Candidate Plan Constraint Evaluation

---

# JARVIS Engineering

This sprint forms part of the Executive Operating System implementation.

The Executive Operating System is built according to the following constitutional hierarchy:

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

Where the existing repository architecture cannot support a required capability without weakening an established boundary, stop and report the architectural conflict rather than introducing hidden semantics or redesigning upstream layers.

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
- comparison before selection
- selection before execution
- unresolved before assumed
- evidence before conclusion
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

The repository can now construct explicit, deterministic, unranked, unevaluated, unapproved and non-executable candidate plans.

No Candidate Plan Constraint Evaluation model exists.

No plan comparison exists.

No plan ranking exists.

No plan selection exists.

No Executive Reasoning exists.

No recommendation exists.

No Governed Action Proposal exists.

No execution boundary exists.

---

# Relationship to the North Star

Candidate Plan Construction answers:

> Which candidate plans can be deterministically constructed from the current Executive Context, explicitly authorised Intent, governing Constraints and explicit registered plan definitions?

The next architectural question is:

> What is the deterministic relationship between each Candidate Plan and the explicit constraints, dependencies, approvals, assumptions and completion conditions that govern it?

This sprint introduces Candidate Plan Constraint Evaluation.

The evaluation layer shall determine only what can be established from canonical typed inputs and explicit evaluation policies.

It shall not determine which plan is best.

It shall not rank plans.

It shall not recommend a plan.

It shall not select a plan.

It shall not approve a plan.

It shall not execute a plan.

---

# Sprint Objective

Implement a deterministic Candidate Plan Constraint Evaluation Layer.

The layer shall consume:

- one immutable Candidate Plan Set;
- the coherent immutable Executive Context;
- the coherent immutable Executive Intent Set;
- the coherent immutable Executive Constraint Set;
- explicit typed evaluation definitions where required;
- registered deterministic evaluation policies.

The layer shall produce:

- one immutable evaluation for each Candidate Plan;
- explicit constraint findings;
- explicit dependency findings;
- explicit approval findings;
- explicit assumption findings;
- explicit completion-condition findings;
- immutable evaluation summaries;
- one immutable Evaluated Candidate Plan Set;
- deterministic identities;
- complete provenance;
- no hidden inference.

The layer shall preserve every Candidate Plan whether its findings are satisfied, unresolved, violated, not applicable or indeterminate.

Evaluation shall annotate candidates.

Evaluation shall not remove, reorder by merit, rank or select candidates.

---

# Architectural Position

Executive Context  
+  
Executive Intent Set  
+  
Executive Constraint Set  
+  
Candidate Plan Set  
↓  
Candidate Plan Evaluation Policies  
↓  
Candidate Plan Evaluation Registry  
↓  
Candidate Plan Evaluation Engine  
↓  
Evaluated Candidate Plan Set  
↓  
Future Candidate Plan Comparison  
↓  
Future Executive Reasoning and Selection  
↓  
Future Governed Action Proposal  
↓  
Future Authorised Execution

Candidate Plan Constraint Evaluation must stop at deterministic findings.

---

# Fundamental Separation

This sprint shall preserve the following separation.

## Candidate Construction

Completed in Sprint 3.19.

Answers:

> Which explicit candidate options can be constructed?

## Constraint Evaluation

This sprint.

Answers:

> What deterministic findings apply to each candidate against its governing structural requirements?

## Candidate Comparison

Future sprint responsibility.

Answers:

> How do evaluated candidates differ across explicit comparison dimensions?

## Executive Reasoning and Selection

Future sprint responsibility.

Answers:

> Which candidate, combination of candidates or decision to defer should be proposed for authorised human consideration?

## Governed Action Proposal

Future sprint responsibility.

Answers:

> What bounded proposal may be presented to the authorised approval or execution boundary?

Constraint Evaluation shall not perform comparison, selection, recommendation or execution work.

---

# Evaluation Philosophy

The evaluation layer shall not force every question into a binary pass or fail.

Canonical findings shall support at least:

- `satisfied`
- `violated`
- `unresolved`
- `not_applicable`
- `indeterminate`

These states are structural evaluation results.

They are not:

- rankings;
- scores;
- recommendations;
- statements of overall feasibility;
- approval decisions;
- evidence that execution is authorised.

The preferred default where canonical evidence is insufficient is:

`unresolved`

or:

`indeterminate`

The engine shall never silently treat missing evidence as satisfaction.

The engine shall never silently treat missing evidence as violation unless an explicit constraint definition establishes that absence itself constitutes violation.

---

# Evaluation Scope

Sprint 3.20 shall support deterministic evaluation of:

- explicit constraint references;
- authority constraints;
- approval constraints;
- governance constraints;
- behavioural constraints;
- privacy constraints;
- execution constraints;
- resource constraints;
- temporal constraints;
- plan dependencies;
- step dependencies;
- assumptions;
- completion conditions;
- canonical evidence requirements.

Only evaluations expressible through typed canonical data and registered deterministic policy logic are permitted.

---

# Architectural Boundaries

Candidate Plan Constraint Evaluation may consume:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Candidate Plan definitions and provenance retained in canonical plans;
- explicit objective references;
- explicit constraint references;
- explicit evidence references;
- explicit assumptions;
- explicit dependencies;
- explicit approval requirements;
- explicit completion conditions;
- canonical Context sections and statistics;
- canonical Situation identifiers;
- canonical Assessment identifiers;
- canonical Attention Record identifiers;
- typed evaluation configuration;
- registered deterministic evaluation policies;
- shared canonical validation and identity utilities.

Candidate Plan Constraint Evaluation shall not consume:

- LLM outputs;
- embeddings;
- semantic similarity;
- free-form reasoning;
- generated recommendations;
- runtime memory;
- external action state not represented canonically;
- specialist output;
- notification state;
- model-provider responses;
- web content;
- untyped prompts;
- inferred authority;
- inferred consent;
- inferred approval;
- inferred resource availability;
- inferred temporal feasibility;
- plan-ranking results;
- plan-selection results.

---

# No Narrative Evaluation

The evaluation layer shall not determine findings by interpreting prose.

Examples of prohibited behaviour:

- interpreting a plan description to infer which constraints apply;
- deciding that an approval is likely because a role name appears in text;
- deciding that a resource constraint is satisfied because a step sounds inexpensive;
- deciding that a temporal constraint is violated based on natural-language dates that have not been canonicalised;
- interpreting an assumption as reasonable;
- using an LLM to judge whether a plan is compliant;
- inferring plan feasibility from calendar or email prose;
- treating a descriptive label as proof of evidence.

Evaluation must rely on explicit typed references, definitions and canonical values.

---

# Package Structure

Create:

```text
lib/executive-operating-system/planning/evaluation/
  types.ts
  registry.ts
  engine.ts
  policies.ts
  validation.ts
  index.ts
```

Focused tests shall live within the same package boundary:

```text
lib/executive-operating-system/planning/evaluation/
  evaluation.test.ts
  calendar-integration.test.ts
  package-conformance.test.ts
```

Do not add evaluation code to:

- Candidate Plan Construction;
- Executive Context;
- Intent;
- Constraint;
- Assessment;
- Situation;
- Attention;
- Snapshot;
- Projection packages.

No package outside the evaluation package may directly construct canonical plan evaluations.

---

# Core Contracts

Implement immutable typed contracts for:

- `PlanEvaluationStatus`
- `PlanEvaluationFindingType`
- `CandidatePlanEvaluationPolicy`
- `CandidatePlanEvaluationPolicyMetadata`
- `CandidatePlanEvaluationInput`
- `CandidatePlanEvaluationDefinition`
- `ConstraintEvaluationFinding`
- `DependencyEvaluationFinding`
- `ApprovalEvaluationFinding`
- `AssumptionEvaluationFinding`
- `CompletionConditionEvaluationFinding`
- `EvidenceEvaluationFinding`
- `CandidatePlanEvaluation`
- `CandidatePlanEvaluationSummary`
- `EvaluatedCandidatePlan`
- `EvaluatedCandidatePlanSetSummary`
- `EvaluatedCandidatePlanSet`
- `CandidatePlanEvaluationRegistry`
- `CandidatePlanEvaluationEngine`

Use established repository naming and identity conventions where applicable.

All public contracts shall be immutable.

All canonical outputs shall be JSON-compatible.

---

# Evaluation Status

Implement a closed status vocabulary.

At minimum:

```text
satisfied
violated
unresolved
not_applicable
indeterminate
```

Definitions:

## Satisfied

Canonical evidence deterministically demonstrates that the evaluated structural requirement is met.

## Violated

Canonical evidence deterministically demonstrates that the evaluated structural requirement is not met.

## Unresolved

The requirement applies, but the canonical inputs do not yet contain sufficient evidence to determine satisfaction or violation.

## Not Applicable

The evaluated requirement does not apply to the candidate under the explicit typed applicability rules.

## Indeterminate

The requirement applies and evidence exists, but the registered deterministic policy cannot reach a valid result because the evidence is internally ambiguous, conflicting or outside the supported evaluation model.

Policies shall not invent additional statuses.

Do not introduce:

- pass;
- fail;
- good;
- bad;
- preferred;
- risky;
- acceptable;
- rejected;
- approved;
- recommended.

---

# Finding Types

At minimum, support typed findings for:

- constraint;
- dependency;
- approval;
- assumption;
- completion condition;
- evidence.

Each finding shall be independently identifiable and traceable.

A finding shall not serve as an overall plan verdict.

---

# Candidate Plan Evaluation Policy

Each evaluation policy shall expose:

- stable policy identifier;
- stable policy version;
- immutable metadata;
- explicit supported finding type or types;
- deterministic applicability evaluation;
- deterministic finding construction.

A policy may:

- inspect typed Candidate Plan structures;
- inspect explicit constraint definitions;
- inspect canonical Context values;
- inspect explicit Intent references;
- inspect explicit evidence references;
- determine whether a requirement applies;
- return one of the closed evaluation statuses;
- attach typed reason codes;
- attach canonical provenance;
- identify missing evidence explicitly.

A policy shall not:

- alter a Candidate Plan;
- create a new Candidate Plan;
- remove a Candidate Plan;
- compare candidates;
- rank candidates;
- assign priority;
- assign urgency;
- assign importance;
- recommend a candidate;
- decide overall feasibility;
- approve a plan;
- invoke an LLM;
- invoke a specialist;
- execute a step;
- schedule a task;
- perform side effects.

---

# Evaluation Policy Metadata

Policy metadata shall contain, at minimum:

- stable identifier;
- version;
- display name;
- description;
- supported finding types;
- origin;
- status.

Metadata shall be:

- validated;
- cloned;
- deeply frozen;
- replay-safe;
- JSON-compatible.

Descriptions shall not contain hidden operational logic.

---

# Evaluation Registry

Implement a deterministic Candidate Plan Evaluation Registry.

The registry shall:

- validate every registered policy;
- validate policy metadata;
- reject empty identifiers;
- reject empty versions;
- reject duplicate policy identifiers;
- permit one active policy registration per identifier unless an established repository versioning convention requires otherwise;
- clone registration metadata;
- deeply freeze canonical registrations;
- return policies in locale-independent code-unit ascending identifier order;
- remain independent of registration order;
- remain replay-safe.

Duplicate identifiers shall fail explicitly.

No last-write-wins behaviour is permitted.

---

# Candidate Plan Evaluation Input

The engine input shall bind exactly one coherent planning and evaluation state.

It shall contain:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- registered evaluation policies;
- explicit evaluation definitions where required.

Validation shall confirm:

- the Intent Set belongs to the supplied Executive Context;
- the Constraint Set belongs to the supplied Executive Context;
- the Candidate Plan Set belongs to the same Executive Context;
- the Candidate Plan Set references the supplied Intent Set;
- the Candidate Plan Set references the supplied Constraint Set;
- every Candidate Plan identity is valid;
- every referenced Objective exists;
- every referenced Constraint exists;
- every referenced canonical evidence object exists where required;
- every evaluation definition is structurally valid;
- every evaluation-definition identifier is unique;
- no mutable input is retained by reference.

Any identity mismatch shall fail atomically.

---

# Evaluated Candidate Plan

An Evaluated Candidate Plan shall contain:

- the immutable original Candidate Plan;
- deterministic evaluation identifier;
- ordered constraint findings;
- ordered dependency findings;
- ordered approval findings;
- ordered assumption findings;
- ordered completion-condition findings;
- ordered evidence findings;
- count-only evaluation summary;
- evaluation provenance.

The original Candidate Plan shall remain structurally unchanged.

The Evaluated Candidate Plan shall not contain:

- overall score;
- overall rank;
- preferred status;
- recommendation;
- approval;
- rejection;
- executable state;
- selected status.

---

# Constraint Evaluation Finding

Each constraint finding shall contain, at minimum:

- stable finding identifier;
- Candidate Plan identifier;
- Constraint identifier;
- Constraint category;
- evaluation status;
- deterministic reason code;
- canonical evidence references;
- missing evidence references where applicable;
- evaluation policy identifier and version;
- source Context, Intent, Constraint and Candidate Plan Set identifiers;
- provenance.

Optional human-readable descriptions may explain a typed reason code, but shall not substitute for the typed result.

A constraint finding shall not state that the overall plan is compliant or non-compliant.

---

# Constraint Applicability

Constraint applicability must be explicit.

A constraint may be evaluated when:

- the Candidate Plan explicitly references it;
- the Candidate Plan category is explicitly governed by it;
- the Constraint scope explicitly includes the referenced Objective, Context, Situation, plan category or step type;
- a registered policy deterministically establishes applicability from typed canonical values.

Constraints shall not be considered applicable solely because their descriptions sound relevant.

Where no explicit applicability relationship exists, the finding may be:

`not_applicable`

or no finding may be emitted, depending on the canonical policy contract.

Choose one repository-wide approach and document it in ADR-0015.

Do not mix both approaches unpredictably.

Preferred initial approach:

- emit findings for explicitly referenced or deterministically applicable constraints;
- do not emit findings for unrelated constraints;
- include evaluated and non-evaluated constraint counts in the summary where useful.

---

# Dependency Evaluation Finding

Each dependency finding shall contain:

- stable finding identifier;
- Candidate Plan identifier;
- dependency identifier;
- dependency type;
- referenced step or canonical object;
- evaluation status;
- reason code;
- evidence references;
- missing evidence references;
- policy provenance.

A dependency may be:

- satisfied;
- violated;
- unresolved;
- not applicable;
- indeterminate.

Dependency evaluation shall not execute or resolve the dependency.

---

# Approval Evaluation Finding

Each approval finding shall contain:

- stable finding identifier;
- Candidate Plan identifier;
- approval requirement identifier;
- approval type;
- authority reference;
- related constraint reference where applicable;
- evaluation status;
- evidence references;
- missing evidence references;
- reason code;
- policy provenance.

Approval states must remain explicit.

A requirement is not satisfied merely because:

- an authorised role exists;
- an authority is named;
- a meeting is scheduled;
- a plan contains an approval step.

Approval may only be marked `satisfied` when canonical evidence explicitly records the approval state through a supported typed contract.

Where no such canonical approval-state contract exists, the result shall normally remain `unresolved`.

This sprint shall not invent an approval-state subsystem solely to create satisfied results.

---

# Assumption Evaluation Finding

Each assumption finding shall contain:

- stable finding identifier;
- Candidate Plan identifier;
- assumption identifier;
- assumption type;
- evaluation status;
- supporting evidence references;
- contradictory evidence references where explicitly represented;
- missing evidence references;
- reason code;
- policy provenance.

Assumptions shall not be judged as:

- sensible;
- plausible;
- likely;
- reasonable.

Evaluation is limited to whether canonical evidence:

- supports;
- contradicts;
- does not resolve;
- does not apply to;

the explicit typed assumption.

Map those structural outcomes to the closed evaluation-status vocabulary.

---

# Completion-Condition Evaluation Finding

Each completion-condition finding shall contain:

- stable finding identifier;
- Candidate Plan identifier;
- completion-condition identifier;
- condition type;
- expected typed state;
- observed canonical state where available;
- evaluation status;
- reason code;
- evidence references;
- missing evidence references;
- policy provenance.

A completion condition may be evaluated structurally.

This does not mean the plan has been executed.

For pre-execution candidate plans, completion conditions will commonly remain:

`unresolved`

That is a valid canonical result.

---

# Evidence Evaluation Finding

Each evidence finding shall contain:

- stable finding identifier;
- Candidate Plan identifier;
- evidence requirement or reference identifier;
- evidence type;
- referenced canonical object;
- evaluation status;
- reason code;
- policy provenance.

Evidence evaluation may establish:

- referenced evidence exists;
- referenced evidence is absent;
- referenced evidence is malformed;
- referenced evidence is outside supported scope;
- referenced evidence is conflicting where conflict is explicitly represented.

It shall not assess narrative persuasiveness or evidentiary quality unless a typed upstream contract explicitly represents those properties.

---

# Reason Codes

Every finding shall contain a deterministic typed reason code.

Reason codes shall be closed or registry-governed.

Examples:

```text
constraint-explicitly-satisfied
constraint-explicitly-violated
required-evidence-missing
approval-state-not-recorded
dependency-reference-resolved
dependency-reference-unresolved
assumption-supported-by-canonical-evidence
assumption-contradicted-by-canonical-evidence
completion-condition-not-yet-observed
constraint-not-applicable-to-plan-scope
conflicting-canonical-evidence
unsupported-evaluation-shape
```

Reason codes shall not encode recommendations.

Reason-code ordering shall be deterministic.

Descriptions may be mapped from reason codes for presentation, but canonical identity shall not depend on localised prose.

---

# Initial Production Evaluation Policies

Implement a deliberately bounded production policy set.

## Policy 1 — Explicit Constraint Reference Evaluation

Evaluate a Candidate Plan’s explicitly referenced constraints.

The policy shall:

- resolve each referenced constraint;
- confirm the constraint exists;
- evaluate only supported typed constraint properties;
- return a canonical finding for each supported reference;
- return `unresolved` where the constraint applies but evidence is insufficient;
- fail on malformed or unresolved canonical identifiers where validation requires resolution.

It shall not infer additional applicable constraints from prose.

---

## Policy 2 — Authority and Approval Evaluation

Evaluate explicit authority and approval requirements.

The policy shall:

- resolve the authority or approval constraint;
- determine whether the Candidate Plan requires approval;
- identify whether explicit approval evidence exists;
- return `satisfied` only where canonical approval evidence supports it;
- otherwise return `unresolved`, `violated`, `not_applicable` or `indeterminate` according to typed evidence.

The policy shall not grant approval.

---

## Policy 3 — Temporal Constraint Evaluation

Evaluate explicit temporal constraints where all relevant temporal values are canonical typed values.

The policy may evaluate:

- not-before boundaries;
- not-after boundaries;
- explicit date intervals;
- explicit duration maxima or minima;
- explicit deadline relationships;
- explicit plan-step temporal requirements.

The policy shall not:

- create a schedule;
- infer duration from prose;
- use the current clock unless the evaluation input explicitly contains a canonical evaluation reference time;
- generate timestamps during evaluation.

Where current-time comparison is required, the canonical reference time must be supplied explicitly and included in identity and provenance.

Prefer avoiding current-time evaluation in this sprint unless an established snapshot time can serve as the canonical reference.

---

## Policy 4 — Resource Constraint Evaluation

Evaluate resource constraints only where both the constraint and Candidate Plan contain compatible typed resource values.

Supported examples may include:

- maximum numeric quantity;
- required resource identifier;
- prohibited resource identifier;
- explicit availability state;
- explicit budget or capacity category represented canonically.

Do not perform estimation.

Do not infer cost, effort or staffing.

Where the plan does not contain sufficient typed resource data, return `unresolved`.

---

## Policy 5 — Dependency Evaluation

Evaluate explicit plan and step dependencies.

The policy shall:

- resolve internal step references;
- resolve canonical object references;
- determine whether required referenced state is present;
- distinguish structural existence from completion;
- retain unresolved status where satisfaction evidence is absent.

Construction-time acyclic dependency validation remains in Sprint 3.19.

This policy evaluates state, not graph validity.

---

## Policy 6 — Assumption Evidence Evaluation

Evaluate explicit Candidate Plan assumptions against canonical evidence references.

The policy shall:

- inspect only typed evidence relationships;
- identify support, contradiction, absence or conflict;
- return the corresponding canonical status and reason code;
- preserve all supporting and contradictory references.

It shall not judge plausibility.

---

## Policy 7 — Completion Condition Evaluation

Evaluate explicit completion conditions against canonical state.

The policy shall:

- compare typed expected state to typed observed state where available;
- return `satisfied`, `violated`, `unresolved`, `not_applicable` or `indeterminate`;
- preserve expected and observed values;
- avoid execution semantics.

A completion condition being satisfied does not mean the Candidate Plan was authorised or executed by JARVIS.

---

## Policy 8 — Behavioural, Governance, Privacy and Execution Boundary Evaluation

Evaluate explicit structural constraints in these categories where the constraint model provides typed rules.

The policy may evaluate:

- prohibited action categories;
- mandatory human approval;
- required role segregation;
- disallowed execution channel;
- required privacy classification;
- required governance record;
- prohibited specialist or provider use.

The policy shall not interpret behavioural constitutions semantically.

Only typed constraint properties are evaluable.

Where the upstream constraint is descriptive only, return `unresolved` or defer evaluation rather than inventing logic.

---

# Policy Scope Discipline

Do not create a universal policy that marks every referenced constraint as satisfied merely because it exists.

Do not treat successful Candidate Plan construction as proof that constraints are satisfied.

Do not treat an explicit plan definition as evidence of approval.

Do not treat an Objective’s active status as evidence that any Candidate Plan is permissible.

Do not generate a single overall verdict from finding counts.

Do not manufacture violations to make evaluation appear substantive.

An evaluation containing mostly unresolved findings may be correct.

---

# Evaluation Process

The engine shall:

1. validate Executive Context;
2. validate Executive Intent Set;
3. validate Executive Constraint Set;
4. validate Candidate Plan Set;
5. verify coherent source identities;
6. validate registered evaluation policies;
7. validate explicit evaluation definitions where supplied;
8. clone all policy inputs;
9. retrieve policies in deterministic order;
10. evaluate each Candidate Plan independently against applicable policies;
11. validate every returned finding;
12. reject unsupported statuses;
13. reject malformed reason codes;
14. reject unresolved canonical references where reference resolution is mandatory;
15. reject duplicate finding identities;
16. order findings deterministically;
17. construct a count-only evaluation summary per Candidate Plan;
18. construct each Evaluated Candidate Plan;
19. order Evaluated Candidate Plans using source Candidate Plan structural order;
20. construct the Evaluated Candidate Plan Set summary;
21. construct a deterministic set identity;
22. deeply freeze the canonical output;
23. validate the final Evaluated Candidate Plan Set;
24. return only after all validation succeeds.

Any failure shall abort the complete evaluation.

No partial Evaluated Candidate Plan Set may be returned.

---

# Candidate Preservation

Every Candidate Plan in the Candidate Plan Set shall appear exactly once in the Evaluated Candidate Plan Set.

Evaluation shall not:

- omit violated candidates;
- omit unresolved candidates;
- omit candidates with no findings;
- duplicate candidates;
- modify the source candidate;
- reorder candidates by evaluation outcome.

If no evaluation policy applies to a candidate, return a valid Evaluated Candidate Plan containing:

- the original Candidate Plan;
- an empty finding collection;
- a zero-valued count-only summary;
- deterministic evaluation identity;
- evaluation-policy provenance.

---

# Finding Identity

Every finding identity shall be deterministic.

It shall derive only from canonical structural inputs such as:

- Candidate Plan identifier;
- finding type;
- referenced constraint, dependency, approval, assumption, completion-condition or evidence identifier;
- evaluation policy identifier;
- evaluation policy version;
- evaluation status;
- reason code;
- sorted canonical evidence identifiers;
- sorted missing-evidence identifiers where represented.

No finding identity may depend on:

- UUIDs;
- generated timestamps;
- current clock time;
- random values;
- registration order;
- object insertion order;
- localised descriptions;
- runtime state;
- model outputs.

Use established repository deterministic identity conventions.

---

# Candidate Plan Evaluation Identity

Each Candidate Plan Evaluation identity shall derive from:

- Candidate Plan identifier;
- Candidate Plan Set identifier;
- Executive Context identifier;
- Executive Intent Set identifier;
- Executive Constraint Set identifier;
- sorted active evaluation-policy identities;
- sorted finding identifiers.

An evaluation with zero findings shall still have a deterministic identity.

---

# Evaluated Candidate Plan Identity

The Evaluated Candidate Plan identity shall derive from:

- source Candidate Plan identifier;
- Candidate Plan Evaluation identifier.

Do not copy the source Candidate Plan identity and treat it as the evaluation identity.

The source candidate and its evaluation are separate canonical artefacts.

---

# Evaluated Candidate Plan Set Identity

The Evaluated Candidate Plan Set identity shall derive from:

- Executive Context identifier;
- Executive Intent Set identifier;
- Executive Constraint Set identifier;
- Candidate Plan Set identifier;
- sorted active evaluation-policy identities;
- sorted Evaluated Candidate Plan identifiers.

An empty Candidate Plan Set shall produce a valid deterministic empty Evaluated Candidate Plan Set.

---

# Ordering

Evaluated Candidate Plans shall preserve the structural order of the source Candidate Plan Set.

Findings shall use deterministic structural ordering.

Recommended finding order:

1. Candidate Plan identifier;
2. finding type;
3. referenced canonical identifier;
4. evaluation policy identifier;
5. evaluation policy version;
6. reason code;
7. finding identifier.

Within finding types, use locale-independent code-unit ascending order.

Ordering shall never express:

- merit;
- severity;
- priority;
- urgency;
- importance;
- desirability;
- feasibility;
- approval likelihood;
- recommendation.

Do not order statuses from “best” to “worst”.

---

# Candidate Plan Evaluation Summary

Each Candidate Plan Evaluation summary shall contain counts only.

At minimum:

- total findings;
- constraint findings;
- dependency findings;
- approval findings;
- assumption findings;
- completion-condition findings;
- evidence findings;
- findings by evaluation status;
- findings by evaluation policy;
- referenced constraints evaluated;
- unresolved evidence references;
- conflicting evidence references where represented.

The summary shall not contain:

- overall compliance;
- overall feasibility;
- overall score;
- risk score;
- rank;
- preferred status;
- recommendation;
- approval result;
- rejection result.

Summary values shall be validated against canonical findings.

---

# Evaluated Candidate Plan Set Summary

The set summary shall contain counts only.

At minimum:

- Candidate Plans evaluated;
- evaluation policies active;
- total findings;
- findings by type;
- findings by status;
- Candidate Plans with zero findings;
- Candidate Plans with one or more violated findings;
- Candidate Plans with one or more unresolved findings;
- Candidate Plans with one or more indeterminate findings;
- Candidate Plans with all emitted findings satisfied;
- constraints referenced;
- objectives represented;
- assumptions evaluated;
- approvals evaluated;
- dependencies evaluated;
- completion conditions evaluated.

These counts are descriptive structural statistics.

They shall not be used to derive ranking or selection.

The phrase “all emitted findings satisfied” shall not be interpreted as overall approval or permissibility.

Document this explicitly.

---

# No Overall Verdict

Sprint 3.20 shall not produce a field such as:

- compliant;
- non-compliant;
- feasible;
- infeasible;
- approved;
- rejected;
- recommended;
- preferred;
- executable;
- decision.

A Candidate Plan may contain mixed findings.

Example:

```text
Authority Constraint: unresolved
Temporal Constraint: satisfied
Resource Constraint: indeterminate
Approval Requirement: unresolved
Dependency: satisfied
```

The evaluation layer shall preserve that structure.

It shall not collapse it into a single verdict.

---

# Provenance

Every finding shall preserve explicit provenance.

At minimum:

- Executive Context identifier;
- Executive Intent Set identifier;
- Executive Constraint Set identifier;
- Candidate Plan Set identifier;
- Candidate Plan identifier;
- referenced requirement identifier;
- evaluation policy identifier and version;
- canonical evidence identifiers;
- missing-evidence identifiers where applicable;
- reason code;
- configured origin.

Every Candidate Plan Evaluation shall preserve:

- source Candidate Plan identity;
- active evaluation-policy identities;
- complete finding identities;
- evaluation-definition identities where used.

No downstream consumer should need to reconstruct why a finding exists from descriptive prose.

---

# Evaluation Reference Time

Avoid generated evaluation timestamps.

If temporal policies require a reference time, use one explicit canonical time source.

Preferred order:

1. an existing canonical Snapshot time;
2. an explicit Context reference time;
3. an explicit evaluation input time supplied as validated configuration.

The selected reference time shall:

- be represented as a canonical validated string;
- be included in evaluation input identity where it affects findings;
- be preserved in provenance;
- remain stable across replay.

Do not call `Date.now()`.

Do not generate an evaluation timestamp as part of canonical identity.

A non-identity metadata timestamp shall not be added unless an established repository contract already permits deterministic source timestamps.

---

# Validation Requirements

Implement validation for:

- evaluation statuses;
- finding types;
- reason codes;
- evaluation policy contracts;
- evaluation policy metadata;
- evaluation definitions;
- unique evaluation-definition identifiers;
- source identity coherence;
- Candidate Plan preservation;
- one evaluation per Candidate Plan;
- constraint references;
- dependency references;
- approval references;
- assumption references;
- completion-condition references;
- evidence references;
- missing-evidence references;
- finding identity;
- Candidate Plan Evaluation identity;
- Evaluated Candidate Plan identity;
- Evaluated Candidate Plan Set identity;
- deterministic ordering;
- duplicate finding rejection;
- duplicate evaluated-candidate rejection;
- summary consistency;
- JSON compatibility;
- defensive copying;
- recursive deep freezing;
- replay safety;
- atomic failure.

Validation shall not determine whether a plan should be selected.

---

# JSON Compatibility

All canonical evaluation outputs shall be JSON-compatible.

Reject:

- functions;
- symbols;
- `undefined`;
- `BigInt`;
- non-finite numbers;
- cyclic references;
- mutable class instances;
- unsupported collection types;
- provider-specific objects;
- unvalidated date objects;
- errors or promises embedded in canonical output.

Use established repository validation utilities where available.

---

# Immutability

The evaluation engine shall not retain mutable references to:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Candidate Plans;
- evaluation definitions;
- policy metadata;
- policy inputs;
- policy outputs before canonical validation.

Inputs supplied to policies shall be defensively cloned.

All findings, evaluations, evaluated candidates, summaries and sets shall be recursively frozen before return.

Tests must prove that attempted mutation cannot alter canonical output or upstream Candidate Plans.

---

# Replay Safety

Given structurally identical:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- evaluation definitions;
- policy registrations;
- explicit reference time where applicable;

the engine shall produce structurally identical:

- findings;
- statuses;
- reason codes;
- identities;
- ordering;
- provenance;
- summaries;
- Evaluated Candidate Plans;
- Evaluated Candidate Plan Set.

Replay shall not depend on:

- process state;
- clock time;
- locale;
- registration order;
- random values;
- runtime caches;
- model-provider state;
- object insertion order.

---

# Atomic Failure

The following shall cause complete evaluation failure:

- malformed Executive Context;
- malformed Intent Set;
- malformed Constraint Set;
- malformed Candidate Plan Set;
- source identity mismatch;
- malformed Candidate Plan;
- malformed evaluation policy;
- duplicate policy identifier;
- malformed evaluation definition;
- duplicate evaluation-definition identifier;
- policy exception;
- malformed applicability result;
- malformed finding;
- unsupported status;
- unsupported reason code;
- invalid finding identity;
- duplicate finding;
- unresolved mandatory canonical reference;
- duplicate Candidate Plan evaluation;
- source Candidate Plan omitted;
- source Candidate Plan duplicated;
- invalid ordering;
- invalid summary;
- JSON incompatibility;
- replay instability detected by validation where supported.

No partial result may be returned.

---

# Empty Candidate Set Semantics

An empty Candidate Plan Set shall produce a valid immutable Evaluated Candidate Plan Set containing:

- coherent source identities;
- an empty evaluated-candidate collection;
- deterministic set identity;
- zero-valued count-only summary;
- active evaluation-policy provenance.

The engine shall not manufacture:

- fallback findings;
- a no-action candidate;
- a warning candidate;
- an overall unresolved verdict.

---

# Zero-Finding Candidate Semantics

A Candidate Plan with no applicable evaluation findings is valid.

The canonical evaluated candidate shall contain:

- the unchanged source Candidate Plan;
- empty ordered finding collections;
- zero-valued evaluation summary;
- deterministic evaluation identity;
- policy provenance.

Zero findings shall not mean:

- approved;
- compliant;
- feasible;
- safe;
- recommended.

---

# Calendar Integration Proof

Extend the production vertical integration path:

Google Calendar Connector  
↓  
Calendar Projection Adapter  
↓  
ProjectionEngine  
↓  
Situational Awareness  
↓  
Snapshot Lifecycle  
↓  
Executive Attention  
↓  
Executive Situation Formation  
↓  
Executive Situation Assessment  
↓  
Executive Context  
↓  
Executive Intent & Constraint Model  
↓  
Candidate Plan Construction  
↓  
Candidate Plan Constraint Evaluation

The integration test shall demonstrate:

- Calendar content does not itself determine evaluation findings;
- an explicit Objective exists;
- an explicit Constraint exists;
- an explicit Candidate Plan Definition applies;
- a Candidate Plan is deterministically constructed;
- a registered evaluation policy evaluates an explicit typed relationship;
- insufficient approval evidence results in `unresolved`;
- a deterministically satisfied structural requirement results in `satisfied`;
- the source Candidate Plan remains unchanged;
- no ranking occurs;
- no recommendation occurs;
- no approval occurs;
- no execution occurs;
- evaluation identity remains stable across replay.

Also test:

- the same vertical path with an empty Candidate Plan Set produces an empty Evaluated Candidate Plan Set;
- a Candidate Plan with no applicable evaluation policy produces a valid zero-finding evaluation;
- Calendar narrative changes that do not alter canonical typed inputs do not alter evaluation output.

---

# Package Conformance

The Candidate Plan Evaluation package may depend only on:

- Executive Context public contracts;
- Executive Intent & Constraint public contracts;
- Candidate Plan public contracts;
- local Candidate Plan Evaluation contracts;
- canonical shared validation utilities;
- canonical identity utilities where already established.

Production evaluation code shall not depend on:

- connectors;
- Projection Adapters;
- ProjectionEngine;
- Snapshot Lifecycle;
- Attention internals;
- Situation internals;
- Assessment internals;
- Candidate Plan internal implementation files outside public exports;
- future comparison packages;
- future reasoning packages;
- selection;
- execution;
- runtime orchestration;
- specialist packages;
- notifications;
- UI;
- API routes;
- persistence;
- model providers;
- external service SDKs.

Integration tests may import upstream packages only to prove the vertical architecture.

Production package-conformance tests shall enforce this boundary.

---

# Upstream Boundary Preservation

No upstream package shall become aware of Candidate Plan Evaluation.

In particular:

- Connectors shall not import evaluation;
- Projection shall not import evaluation;
- Situational Awareness shall not import evaluation;
- Snapshot Lifecycle shall not import evaluation;
- Attention shall not import evaluation;
- Situation Formation shall not import evaluation;
- Assessment shall not import evaluation;
- Executive Context shall not import evaluation;
- Intent & Constraint shall not import evaluation;
- Candidate Plan Construction shall not import evaluation.

Evaluation is strictly downstream of construction.

Do not add evaluation fields to Candidate Plan contracts merely for convenience.

The source Candidate Plan must remain evaluation-neutral.

---

# Public Exports

Expose public evaluation contracts only through:

```text
lib/executive-operating-system/planning/evaluation/index.ts
```

Do not require downstream consumers to import internal implementation files.

Export only:

- approved public types;
- approved production policies;
- registry interfaces;
- evaluation engine interfaces;
- canonical evaluation artefacts required by future comparison or reasoning layers.

Do not export internal validation helpers unless repository conventions require it.

---

# Required Focused Tests

Create focused tests covering at least the following.

## Registry

- policy registration succeeds;
- policy metadata is cloned;
- policy metadata is deeply frozen;
- duplicate policy identifiers fail;
- registration order does not affect retrieval order;
- code-unit ordering is locale-independent.

## Input Coherence

- coherent Context, Intent, Constraint and Candidate Plan Set inputs succeed;
- mismatched Context identity fails;
- mismatched Intent Set identity fails;
- mismatched Constraint Set identity fails;
- malformed Candidate Plan Set fails;
- missing Candidate Plan fails atomically.

## Constraint Evaluation

- explicit satisfied constraint finding;
- explicit violated constraint finding;
- insufficient evidence returns unresolved;
- unrelated constraint is not evaluated or returns not applicable according to chosen ADR semantics;
- malformed constraint reference fails;
- descriptive text alone cannot create applicability.

## Authority and Approval

- explicit approval evidence produces satisfied where supported;
- absent approval evidence produces unresolved;
- named authority alone does not produce satisfied;
- approval requirement does not grant approval;
- approval finding contains no approval decision field.

## Temporal Evaluation

- canonical not-before requirement satisfied;
- canonical not-before requirement violated;
- missing reference time produces unresolved or validation failure according to policy contract;
- no use of current system time;
- replay with the same reference time is stable.

## Resource Evaluation

- compatible typed resource values can be evaluated;
- insufficient resource data produces unresolved;
- resource cost is not inferred from descriptions;
- resource evaluation contains no feasibility score.

## Dependencies

- satisfied typed dependency;
- unresolved dependency state;
- missing mandatory reference fails;
- step existence is not treated as step completion.

## Assumptions

- canonical support produces satisfied;
- canonical contradiction produces violated;
- missing evidence produces unresolved;
- conflicting evidence produces indeterminate;
- plausibility is never evaluated.

## Completion Conditions

- typed expected state matches observed state;
- typed expected state conflicts with observed state;
- no observed state produces unresolved;
- satisfied completion condition does not imply execution or approval.

## Candidate Preservation

- every source Candidate Plan appears exactly once;
- source Candidate Plan is unchanged;
- violated candidates are retained;
- unresolved candidates are retained;
- zero-finding candidates are retained;
- candidate order matches source structural order.

## Identities

- finding identity is stable;
- Candidate Plan Evaluation identity is stable;
- Evaluated Candidate Plan identity is stable;
- Evaluated Candidate Plan Set identity is stable;
- policy registration order does not change identity;
- evidence ordering does not change identity;
- generated time and randomness are absent.

## Ordering

- findings are structurally ordered;
- statuses do not control ordering;
- evaluation outcome does not reorder candidates;
- locale does not affect ordering.

## Summaries

- per-candidate counts are correct;
- set counts are correct;
- counts by status are correct;
- counts by finding type are correct;
- counts by policy are correct;
- malformed summaries fail;
- summaries contain no verdict, rank or recommendation.

## Immutability

- policy inputs are cloned;
- policy cannot mutate Candidate Plan Set;
- policy cannot mutate Candidate Plans;
- returned findings are deeply frozen;
- returned evaluations are deeply frozen;
- returned Evaluated Candidate Plan Set is deeply frozen.

## Replay Safety

- repeated evaluation produces structural equality;
- equivalent registration order produces structural equality;
- equivalent evidence order produces structural equality;
- explicit reference time produces stable results.

## Atomic Failure

- policy exception aborts evaluation;
- malformed finding aborts evaluation;
- duplicate finding aborts evaluation;
- invalid identity aborts evaluation;
- unsupported status aborts evaluation;
- malformed reason code aborts evaluation;
- no partial evaluated set is returned.

## Semantics

- no overall plan verdict exists;
- no ranking exists;
- no recommendation exists;
- no selected status exists;
- no approval decision exists;
- no execution state exists;
- all-satisfied emitted findings do not imply approval;
- missing evidence is not treated as satisfaction.

## Integration

- complete Calendar-to-Evaluated-Candidate path;
- explicit typed constraint relationship is evaluated;
- approval remains unresolved without canonical evidence;
- source Candidate Plan remains unchanged;
- replay is structurally stable;
- empty Candidate Plan Set produces empty evaluated set;
- Calendar prose alone does not affect evaluation.

## Package Boundaries

- production imports remain within approved packages;
- Candidate Plan Construction does not import evaluation;
- upstream packages do not import evaluation;
- comparison, reasoning, execution, runtime, UI, API, specialist and provider imports are prohibited.

---

# Repository Validation

Run all repository-required validation commands.

At minimum:

```bash
npx vitest run lib/executive-operating-system/planning/evaluation
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short --branch
```

If the repository uses a different canonical command, use the repository command and report it exactly.

A non-fatal Google Fonts download or optimisation warning may be reported separately only where:

- compilation succeeds;
- type validation succeeds;
- static generation succeeds;
- the production build succeeds.

Do not describe a failed build as passed.

---

# Architecture Documentation

Update:

```text
docs/architecture/SYSTEM-ARCHITECTURE.md
```

to show:

Executive Context  
+  
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
↓  
Future Candidate Plan Comparison  
↓  
Future Executive Reasoning and Selection

Document clearly that Evaluated Candidate Plans are:

- structurally assessed;
- finding-preserving;
- unranked;
- unselected;
- unapproved;
- non-recommended;
- inert;
- non-executable.

Document that evaluation findings are not an overall plan verdict.

---

# ADR

Create:

```text
docs/architecture/ADR-0015-Deterministic-Candidate-Plan-Constraint-Evaluation.md
```

Title:

# ADR-0015 — Deterministic Candidate Plan Constraint Evaluation

The ADR shall document:

- architectural purpose;
- position downstream of Candidate Plan Construction;
- closed evaluation-status vocabulary;
- reason-code strategy;
- finding types;
- applicability semantics;
- treatment of unrelated constraints;
- treatment of missing evidence;
- treatment of conflicting evidence;
- prohibition on narrative interpretation;
- preservation of every Candidate Plan;
- prohibition on overall verdicts;
- finding identity;
- Candidate Plan Evaluation identity;
- Evaluated Candidate Plan identity;
- Evaluated Candidate Plan Set identity;
- deterministic ordering;
- evaluation reference-time strategy;
- count-only summaries;
- provenance requirements;
- immutable and replay-safe outputs;
- zero-finding candidate semantics;
- empty-set semantics;
- atomic failure;
- future Candidate Plan Comparison boundary;
- future Executive Reasoning boundary;
- non-goals;
- rejected alternatives.

Rejected alternatives shall include:

- LLM-based compliance evaluation;
- narrative constraint interpretation;
- collapsing findings into a single pass/fail result;
- ranking plans during evaluation;
- removing violated candidates;
- automatically rejecting unresolved candidates;
- treating missing evidence as satisfaction;
- treating successful construction as constraint compliance;
- using the current system clock without a canonical reference time;
- mutating Candidate Plans with evaluation fields;
- granting approval because an approval step exists;
- permitting evaluation policies to execute corrective actions.

---

# Explicit Non-Goals

Sprint 3.20 shall not introduce:

- Candidate Plan comparison;
- weighted evaluation;
- scoring;
- ranking;
- priority;
- urgency;
- importance;
- desirability;
- overall feasibility;
- overall compliance verdict;
- plan selection;
- recommendations;
- Executive Reasoning;
- trade-off resolution;
- approval decisions;
- rejection decisions;
- action proposals;
- scheduling;
- task creation;
- notifications;
- specialist routing;
- specialist invocation;
- LLM reasoning;
- embeddings;
- semantic evaluation;
- runtime orchestration;
- persistence;
- APIs;
- UI;
- external side effects;
- execution;
- automatic remediation;
- constraint rewriting;
- objective rewriting;
- Candidate Plan mutation.

---

# Acceptance Criteria

Sprint 3.20 is complete only when:

- immutable evaluation contracts are implemented;
- the closed evaluation-status vocabulary is implemented;
- deterministic reason codes are implemented;
- deterministic evaluation-policy contracts are implemented;
- deterministic policy registry is implemented;
- duplicate policies fail explicitly;
- deterministic evaluation engine is implemented;
- initial production evaluation policies are implemented;
- every source Candidate Plan is preserved exactly once;
- source Candidate Plans remain unchanged;
- explicit constraint findings are supported;
- dependency findings are supported;
- approval findings are supported;
- assumption findings are supported;
- completion-condition findings are supported;
- evidence findings are supported;
- missing evidence remains unresolved rather than satisfied;
- conflicting supported evidence may produce indeterminate;
- no overall plan verdict exists;
- no ranking exists;
- no recommendation exists;
- no approval decision exists;
- deterministic finding identities are implemented;
- deterministic Candidate Plan Evaluation identities are implemented;
- deterministic Evaluated Candidate Plan identities are implemented;
- deterministic Evaluated Candidate Plan Set identity is implemented;
- structural ordering is implemented;
- count-only summaries are implemented;
- zero-finding candidates are supported;
- empty Candidate Plan Sets are supported;
- JSON compatibility is validated;
- defensive copying is implemented;
- deep freezing is implemented;
- replay safety is proven;
- atomic failure is proven;
- Calendar vertical integration passes;
- package-conformance tests pass;
- upstream architecture remains preserved;
- repository tests pass;
- lint passes;
- typecheck passes;
- build passes;
- `git diff --check` passes;
- working tree is clean after commit;
- `SYSTEM-ARCHITECTURE.md` is updated;
- ADR-0015 is completed.

---

# Recommended Pull Request Scope

Prefer one bounded pull request unless repository constraints require a split.

Suggested pull-request title:

```text
Sprint 3.20: Add deterministic Candidate Plan Constraint Evaluation
```

Suggested commit title:

```text
feat(eos): add deterministic candidate plan constraint evaluation
```

Do not include:

- Candidate Plan Comparison;
- Executive Reasoning;
- selection;
- recommendation;
- Governed Action Proposal;
- execution.

---

# Completion Report

Provide the completion report using the established repository structure.

## Summary

Describe:

- evaluation contracts;
- status vocabulary;
- reason codes;
- registry;
- engine;
- production policies;
- finding types;
- validation;
- identities;
- ordering;
- summaries;
- integration;
- documentation.

## Architectural Compliance

Confirm:

- evaluation consumes coherent canonical inputs;
- source Candidate Plans remain unchanged;
- findings rely only on typed canonical evidence;
- missing evidence is not treated as satisfaction;
- evaluation remains separate from comparison;
- comparison remains separate from selection;
- selection remains separate from execution;
- no narrative or LLM evaluation exists;
- no overall verdict exists;
- upstream boundaries remain preserved.

## Key Decisions

Report:

- package placement;
- status vocabulary;
- reason-code model;
- applicability model;
- treatment of unrelated constraints;
- treatment of missing evidence;
- treatment of conflicting evidence;
- finding identity;
- Candidate Plan Evaluation identity;
- Evaluated Candidate Plan identity;
- Evaluated Candidate Plan Set identity;
- candidate-preservation rule;
- zero-finding behaviour;
- empty-set behaviour;
- temporal reference-time strategy;
- ordering;
- summary structure;
- provenance;
- atomic-failure semantics.

## Testing

Report every command and exact result.

Distinguish successful production builds from non-fatal external resource warnings.

## Files Changed

List every created or modified file with a short description.

## Commit

Provide full commit hash and title.

## Pull Request

Provide:

- branch;
- pull-request title;
- URL when available.

If the PR service records the title and body but provides no URL, state that precisely.

## Deferred Items

Explicitly list:

- Candidate Plan Comparison;
- comparative dimensions;
- ranking;
- selection;
- Executive Reasoning;
- recommendations;
- Governed Action Proposal;
- approval workflow;
- execution;
- runtime orchestration;
- specialist invocation;
- persistence;
- APIs;
- UI;
- LLM integration.

---

# Final Architectural Constraint

Candidate Plan Constraint Evaluation ends with an immutable set of deterministic findings attached to unchanged Candidate Plans.

An evaluation finding is not a recommendation.

An evaluation finding is not a ranking.

An evaluation finding is not a decision.

An evaluation finding is not approval.

An evaluation finding is not executable authority.

A collection of satisfied findings does not establish that a Candidate Plan is approved, selected or safe to execute.

This sprint shall never collapse mixed findings into an overall verdict or determine which Candidate Plan should be preferred.

Its sole responsibility is to answer:

> What deterministic constraint, dependency, approval, assumption, completion-condition and evidence findings apply to each Candidate Plan, based only on coherent canonical inputs and registered evaluation policies?