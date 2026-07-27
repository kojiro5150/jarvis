# Sprint 3.22 — Bounded Executive Reasoning

---

# JARVIS Engineering

This sprint forms part of the Executive Operating System implementation.

The Executive Operating System is governed by the following hierarchy:

```text
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
```

Every implementation decision in this sprint shall preserve this hierarchy.

Where this sprint specification conflicts with a higher-order constitutional document, the higher-order document prevails.

Where the existing repository architecture cannot support a required capability without weakening an established boundary, stop and report the architectural conflict rather than introducing hidden semantics, implicit authority, opaque inference, or upstream redesign.

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
- bounded interpretation before recommendation
- human authority before machine action
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
- Sprint 3.21 — Candidate Plan Comparative Analysis

Current architecture:

```text
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
↓
Candidate Plan Comparative Analysis
↓
Candidate Plan Comparison Set
```

The repository can now:

- construct explicit candidate plans from typed definitions;
- evaluate each candidate against typed constraints and requirements;
- compare evaluated candidates across explicit typed dimensions;
- preserve candidates as immutable, inert options;
- preserve mixed findings and mixed comparisons;
- expose difference without preference;
- avoid scoring, ranking, selection, recommendation, approval and execution.

No Executive Reasoning layer exists.

No bounded reasoning record exists.

No deterministic reasoning policy registry exists.

No explicit interpretation vocabulary exists.

No reasoning conclusion model exists.

No recommendation exists.

No Governed Action Proposal exists.

No approval workflow exists.

No execution boundary exists.

---

# Relationship to the North Star

Candidate Plan Construction answers:

> Which explicit candidate plans are authorised to exist?

Candidate Plan Constraint Evaluation answers:

> What deterministic findings apply to each candidate?

Candidate Plan Comparative Analysis answers:

> How do evaluated candidates differ across explicit typed dimensions?

The next architectural question is:

> What bounded, provenance-preserving interpretation can be formed from the complete canonical planning graph without selecting, recommending, approving, or executing a plan?

This sprint introduces Bounded Executive Reasoning.

The reasoning layer shall consume the existing canonical artefact graph.

It shall not recreate those artefacts.

It shall not copy the entire graph into a new parallel model.

It shall not introduce a proliferation of intermediate reasoning objects.

It shall produce one compact canonical reasoning record that references upstream artefacts by stable identity and contains only the minimum additional interpretation required by this layer.

---

# Sprint Objective

Implement a bounded Executive Reasoning Layer.

The layer shall consume:

- one immutable Executive Context;
- one coherent Executive Intent Set;
- one coherent Executive Constraint Set;
- one coherent Candidate Plan Set;
- one coherent Evaluated Candidate Plan Set;
- one coherent Candidate Plan Comparison Set;
- explicit typed reasoning definitions;
- registered deterministic reasoning policies.

The layer shall produce:

- one immutable Executive Reasoning Record;
- candidate-scoped reasoning observations;
- cross-candidate reasoning observations;
- unresolved reasoning questions;
- explicit governance boundaries;
- deterministic identities;
- count-only summaries;
- complete provenance;
- no recommendation;
- no selection;
- no approval;
- no execution.

The layer shall focus on consuming and interpreting the existing artefact graph.

It shall avoid introducing unnecessary intermediate types.

---

# Architectural Position

```text
Executive Context
+
Executive Intent Set
+
Executive Constraint Set
+
Candidate Plan Set
+
Evaluated Candidate Plan Set
+
Candidate Plan Comparison Set
↓
Executive Reasoning Definitions
↓
Executive Reasoning Policies
↓
Executive Reasoning Registry
↓
Executive Reasoning Engine
↓
Executive Reasoning Record
↓
Future Governed Action Proposal
↓
Future Human Approval
↓
Future Authorised Execution
```

Executive Reasoning must stop at an advisory reasoning record.

---

# Fundamental Separation

## Candidate Construction

Completed in Sprint 3.19.

Answers:

> Which explicit candidate options can exist?

## Candidate Evaluation

Completed in Sprint 3.20.

Answers:

> What deterministic findings apply to each candidate?

## Candidate Comparison

Completed in Sprint 3.21.

Answers:

> How do evaluated candidates differ?

## Executive Reasoning

This sprint.

Answers:

> What bounded interpretation can be made from the complete canonical planning graph?

## Governed Action Proposal

Future sprint responsibility.

Answers:

> What candidate, combination, deferment, or evidence request may be proposed for authorised human consideration?

## Human Approval

Future responsibility.

Answers:

> What proposal is accepted, rejected, modified, deferred, or returned for more evidence by an authorised human?

## Authorised Execution

Future responsibility.

Answers:

> What approved action may cross the execution boundary?

Executive Reasoning shall not perform proposal, approval or execution work.

---

# Rich Graph Consumption Constraint

The reasoning layer will consume a rich graph of existing canonical objects.

This is expected.

The sprint shall not respond to that complexity by creating a second large graph of derived reasoning artefacts.

The preferred model is:

```text
Existing canonical artefact graph
↓
Reasoning engine
↓
One compact Executive Reasoning Record
```

Not:

```text
Existing canonical artefact graph
↓
Reasoning nodes
↓
Reasoning edges
↓
Reasoning profiles
↓
Reasoning matrices
↓
Reasoning clusters
↓
Reasoning summaries
↓
Reasoning synthesis
```

Only introduce a public type where it represents a stable semantic boundary required by future downstream consumers.

Prefer references over duplication.

Prefer one canonical record over multiple intermediate containers.

Prefer compact observations over restating upstream artefacts.

---

# Reasoning Philosophy

Reasoning is bounded interpretation.

Reasoning is not unrestricted inference.

Reasoning is not recommendation.

Reasoning is not selection.

Reasoning is not approval.

Reasoning is not execution.

Permitted reasoning statements include:

- a candidate has an unresolved approval requirement that remains material to further consideration;
- two candidates differ in temporal structure but the canonical data does not establish which is preferable;
- no candidate currently satisfies a particular explicitly configured reasoning condition;
- the available comparison set contains conflicting evidence that prevents a determinate interpretation;
- a candidate remains within all explicitly represented hard boundaries but still contains unresolved assumptions;
- further evidence is required before a proposal layer could responsibly act;
- multiple candidates remain viable for future human consideration;
- the canonical graph does not support a comparative conclusion on a configured issue.

Prohibited reasoning statements include:

- choose Candidate A;
- Candidate B is best;
- Candidate C should proceed;
- Candidate D is approved;
- Candidate A is optimal;
- Candidate B is safest;
- Candidate C is unacceptable;
- Candidate D will succeed;
- execute Candidate A;
- schedule Candidate B;
- notify the user to take Candidate C.

---

# Reasoning Scope

Sprint 3.22 shall support bounded reasoning over:

- explicit objectives;
- explicit constraints;
- candidate existence;
- candidate evaluation findings;
- unresolved findings;
- violated findings;
- indeterminate findings;
- not-applicable findings;
- comparison equivalences;
- comparison differences;
- one-sided canonical values;
- not-comparable dimensions;
- indeterminate comparisons;
- explicit approvals;
- explicit dependencies;
- explicit assumptions;
- explicit completion conditions;
- explicit evidence references;
- explicit missing evidence;
- explicit conflicting evidence;
- explicit typed temporal values;
- explicit typed resource values;
- explicit governance boundaries;
- explicit reasoning definitions.

No reasoning may depend on narrative interpretation.

---

# Architectural Boundaries

Executive Reasoning may consume:

- Executive Context public contracts;
- Executive Intent Set public contracts;
- Executive Constraint Set public contracts;
- Candidate Plan public contracts;
- Candidate Plan Evaluation public contracts;
- Candidate Plan Comparison public contracts;
- explicit typed reasoning definitions;
- canonical identities;
- canonical statuses;
- canonical relations;
- canonical outcomes;
- canonical reason codes;
- canonical provenance;
- registered deterministic reasoning policies;
- shared canonical validation and identity utilities.

Executive Reasoning shall not consume:

- raw connector payloads;
- Calendar prose;
- email prose;
- document prose;
- LLM outputs;
- embeddings;
- semantic similarity;
- specialist outputs;
- generated recommendations;
- runtime memory;
- external state not represented canonically;
- provider responses;
- web content;
- untyped prompts;
- inferred preference;
- inferred utility;
- inferred risk appetite;
- inferred authority;
- inferred urgency;
- inferred importance;
- hidden weighting;
- future proposal outputs;
- approval state;
- execution state.

---

# No Narrative Interpretation

The reasoning layer shall not interpret descriptions, labels or prose.

Examples of prohibited behaviour:

- inferring that one candidate is more ambitious from its description;
- deciding that a plan is more complex from step labels;
- treating a Calendar title as evidence of importance;
- inferring executive preference from wording;
- treating longer evidence as stronger;
- inferring risk from natural-language adjectives;
- using an LLM to synthesise the reasoning record;
- generating narrative conclusions not supported by typed canonical values.

Human-readable text may explain a typed observation.

It shall not create the observation.

---

# Package Structure

Create:

```text
lib/executive-operating-system/reasoning/
  types.ts
  registry.ts
  engine.ts
  policies.ts
  validation.ts
  index.ts
```

Focused tests shall live within the same package boundary:

```text
lib/executive-operating-system/reasoning/
  reasoning.test.ts
  calendar-integration.test.ts
  package-conformance.test.ts
```

Do not add reasoning implementation to:

- Candidate Plan Construction;
- Candidate Plan Constraint Evaluation;
- Candidate Plan Comparative Analysis;
- Executive Context;
- Intent;
- Constraint;
- Assessment;
- Situation;
- Attention;
- Snapshot;
- Projection packages.

No package outside the reasoning package may directly construct canonical Executive Reasoning Records.

---

# Minimal Public Contract Surface

Implement only the minimum stable public contracts required for this sprint:

- `ExecutiveReasoningStatus`
- `ExecutiveReasoningScope`
- `ExecutiveReasoningObservationType`
- `ExecutiveReasoningReasonCode`
- `ExecutiveReasoningPolicy`
- `ExecutiveReasoningPolicyMetadata`
- `ExecutiveReasoningDefinition`
- `ExecutiveReasoningInput`
- `ExecutiveReasoningObservation`
- `ExecutiveReasoningQuestion`
- `ExecutiveReasoningBoundary`
- `ExecutiveReasoningSummary`
- `ExecutiveReasoningProvenance`
- `ExecutiveReasoningRecord`
- `ExecutiveReasoningRegistry`
- `ExecutiveReasoningEngine`

Do not introduce:

- reasoning graph;
- reasoning node;
- reasoning edge;
- reasoning profile;
- reasoning matrix;
- reasoning cluster;
- reasoning candidate;
- reasoning comparison set;
- reasoning synthesis set;
- recommendation record;
- selection record.

If an internal helper type is useful, keep it private unless a downstream boundary demonstrably requires it.

---

# Executive Reasoning Status

Implement a closed vocabulary:

```text
supported
unsupported
unresolved
indeterminate
not_applicable
```

Definitions:

## Supported

The reasoning observation is fully supported by coherent canonical typed inputs.

## Unsupported

The configured reasoning condition is not supported by the canonical artefact graph.

## Unresolved

Required canonical evidence or authority is absent.

## Indeterminate

Canonical evidence exists but conflicts or cannot support a single deterministic interpretation.

## Not Applicable

The reasoning definition does not apply to the relevant scope.

Do not introduce:

- approved;
- rejected;
- recommended;
- preferred;
- selected;
- feasible;
- infeasible;
- safe;
- unsafe;
- successful;
- unsuccessful.

---

# Executive Reasoning Scope

Implement a closed scope vocabulary:

```text
candidate
cross_candidate
planning_set
governance_boundary
evidence_state
```

Definitions:

## Candidate

The observation concerns exactly one Candidate Plan.

## Cross Candidate

The observation concerns a deterministic relationship among two or more candidates.

## Planning Set

The observation concerns the complete coherent planning set.

## Governance Boundary

The observation concerns explicit authority, approval, prohibition or execution boundaries.

## Evidence State

The observation concerns explicit evidence sufficiency, absence or conflict.

---

# Executive Reasoning Observation Types

Support a bounded closed vocabulary at minimum for:

- objective alignment state;
- constraint boundary state;
- approval boundary state;
- dependency readiness state;
- assumption state;
- completion-condition state;
- evidence sufficiency state;
- evidence conflict state;
- comparison support state;
- comparison limitation state;
- candidate viability state;
- planning-set completeness state;
- proposal-readiness boundary;
- execution-boundary state.

Observation types shall remain descriptive and non-authoritative.

`candidate_viability_state` means only whether a candidate remains available for future consideration under explicit typed conditions.

It shall not mean preferred, recommended or approved.

---

# Executive Reasoning Definitions

Every reasoning observation shall be authorised by an explicit immutable reasoning definition.

Each definition shall contain:

- stable definition identifier;
- stable definition version;
- reasoning scope;
- observation type;
- explicit canonical selectors;
- deterministic applicability configuration;
- supported status outcomes;
- required policy identifier;
- configured origin;
- optional candidate scope;
- optional required evidence references;
- optional required governance boundary references.

Definitions shall not contain:

- weights;
- scores;
- preference direction;
- optimisation goals;
- recommendation templates;
- selection rules;
- approval rules;
- execution instructions;
- unrestricted expressions;
- narrative prompts.

---

# Executive Reasoning Policy

Each reasoning policy shall expose:

- stable policy identifier;
- stable policy version;
- immutable metadata;
- supported scopes;
- supported observation types;
- deterministic applicability evaluation;
- deterministic observation construction;
- deterministic unresolved-question construction where applicable;
- deterministic boundary construction where applicable.

A policy may:

- inspect canonical upstream identities;
- inspect typed findings;
- inspect typed comparison results;
- inspect explicit reference sets;
- inspect typed statuses and relations;
- determine whether a configured reasoning condition is supported;
- surface missing evidence;
- surface conflicting evidence;
- surface unresolved authority;
- preserve explicit mixed states;
- construct bounded questions;
- construct explicit governance boundaries;
- attach typed reason codes;
- preserve provenance.

A policy shall not:

- mutate upstream artefacts;
- construct new Candidate Plans;
- remove Candidate Plans;
- rank candidates;
- assign scores;
- assign weights;
- infer utility;
- infer priority;
- infer urgency;
- recommend;
- select;
- approve;
- reject;
- invoke an LLM;
- invoke a specialist;
- create a task;
- schedule an event;
- send a notification;
- perform side effects.

---

# Reasoning Policy Metadata

Policy metadata shall contain, at minimum:

- stable identifier;
- version;
- display name;
- description;
- supported scopes;
- supported observation types;
- origin;
- status.

Metadata shall be:

- validated;
- defensively cloned;
- deeply frozen;
- replay-safe;
- JSON-compatible.

Descriptions shall not contain hidden recommendation or weighting logic.

---

# Executive Reasoning Registry

Implement a deterministic Executive Reasoning Registry.

The registry shall:

- validate every registered policy;
- validate policy metadata;
- reject empty identifiers;
- reject empty versions;
- reject duplicate policy identifiers;
- clone registration metadata;
- deeply freeze canonical registrations;
- return policies in locale-independent code-unit ascending identifier order;
- remain independent of registration order;
- remain replay-safe.

Duplicate identifiers shall fail explicitly.

No last-write-wins behaviour is permitted.

---

# Executive Reasoning Input

The engine input shall bind exactly one coherent planning graph.

It shall contain:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan Comparison Set;
- registered reasoning policies;
- explicit reasoning definitions.

Validation shall confirm:

- the Intent Set belongs to the supplied Executive Context;
- the Constraint Set belongs to the supplied Executive Context;
- the Candidate Plan Set belongs to the same Executive Context;
- the Candidate Plan Set references the supplied Intent Set;
- the Candidate Plan Set references the supplied Constraint Set;
- the Evaluated Candidate Plan Set references the supplied Candidate Plan Set;
- the Comparison Set references the supplied Evaluated Candidate Plan Set;
- all source Context, Intent, Constraint and Candidate Plan identities agree;
- every Candidate Plan appears exactly once in the Evaluated Candidate Plan Set;
- every Candidate Plan appears exactly once in the Comparison Set profiles;
- source Candidate Plans remain structurally unchanged;
- source Candidate Plan Evaluations remain structurally unchanged;
- all reasoning definitions are valid;
- all reasoning-definition identifiers are unique;
- every referenced policy exists;
- every referenced selector is supported;
- no mutable input is retained by reference.

Any mismatch shall fail atomically.

---

# Executive Reasoning Record

Produce exactly one canonical Executive Reasoning Record for one coherent planning graph.

The record shall contain:

- stable record identifier;
- source Executive Context identifier;
- source Executive Intent Set identifier;
- source Executive Constraint Set identifier;
- source Candidate Plan Set identifier;
- source Evaluated Candidate Plan Set identifier;
- source Candidate Plan Comparison Set identifier;
- ordered reasoning observations;
- ordered unresolved reasoning questions;
- ordered governance boundaries;
- count-only summary;
- active policy identities;
- reasoning-definition identities;
- provenance.

The record shall reference upstream artefacts by stable identity.

It shall not duplicate complete upstream objects.

The record shall not contain:

- selected candidate;
- preferred candidate;
- recommendation;
- approval;
- rejection;
- execution instruction;
- aggregate score;
- rank;
- winner;
- final decision;
- action command.

---

# Executive Reasoning Observation

Each observation shall contain:

- stable observation identifier;
- reasoning definition identifier and version;
- policy identifier and version;
- reasoning scope;
- observation type;
- reasoning status;
- deterministic reason code;
- relevant Candidate Plan identifiers;
- relevant Candidate Plan Evaluation identifiers;
- relevant comparison identifiers;
- relevant canonical evidence references;
- relevant governance-boundary references;
- compact typed observation value;
- provenance.

The observation value shall be compact.

It shall not copy complete Candidate Plans, evaluations or comparison records.

Human-readable explanation is optional and secondary.

Canonical identity shall not depend on explanatory prose.

---

# Executive Reasoning Question

A reasoning question represents an unresolved issue that a future proposal or human authority may need to resolve.

Each question shall contain:

- stable question identifier;
- originating reasoning definition identity;
- policy identity;
- reason code;
- relevant candidate identities;
- required canonical evidence types or references;
- required authority type or boundary where applicable;
- provenance.

Questions shall be typed and bounded.

Permitted examples:

- approval authority unresolved;
- dependency evidence missing;
- conflicting canonical evidence requires resolution;
- no compatible resource value is available;
- completion condition is undefined;
- comparison dimension is not determinable.

Questions shall not be free-form brainstorming prompts.

They shall not ask an LLM to decide what matters.

---

# Executive Reasoning Boundary

A reasoning boundary represents an explicit governance or execution limitation.

Each boundary shall contain:

- stable boundary identifier;
- boundary type;
- source canonical reference;
- applicable candidate identities;
- boundary status;
- deterministic reason code;
- policy identity;
- provenance.

Boundary types may include:

- approval required;
- execution prohibited;
- evidence required;
- authority unresolved;
- dependency unresolved;
- temporal boundary;
- resource boundary;
- privacy boundary;
- governance boundary.

A boundary is not a recommendation.

A boundary may prevent future proposal readiness without rejecting a candidate.

---

# Reason Codes

Every observation, question and boundary shall contain a deterministic typed reason code.

Reason codes shall be closed or registry-governed.

Examples:

```text
objective-support-present
objective-support-absent
hard-constraint-violation-present
hard-constraint-state-unresolved
approval-authority-confirmed
approval-authority-unresolved
dependency-evidence-present
dependency-evidence-missing
assumption-remains-unresolved
completion-condition-present
completion-condition-missing
evidence-sufficient-for-bounded-reasoning
evidence-insufficient-for-bounded-reasoning
evidence-conflict-prevents-determinate-reasoning
comparison-supports-structural-distinction
comparison-does-not-support-preference
comparison-not-determinable
candidate-remains-available-for-consideration
candidate-blocked-by-explicit-boundary
no-candidate-satisfies-configured-condition
multiple-candidates-remain-for-consideration
proposal-boundary-unresolved
execution-boundary-not-crossed
```

Reason codes shall not encode hidden preference.

Canonical identity shall not depend on localised descriptions.

---

# Initial Production Reasoning Policies

Implement a deliberately bounded production policy set.

## Policy 1 — Objective Support Reasoning

Determine whether explicit candidate structures and evaluation findings provide canonical support for configured Objective references.

May produce:

- supported;
- unsupported;
- unresolved;
- indeterminate;
- not applicable.

Shall not determine which candidate best advances an Objective.

---

## Policy 2 — Constraint Boundary Reasoning

Surface explicit hard or configured constraint states.

May identify:

- explicit violated boundary;
- explicit satisfied boundary;
- unresolved boundary;
- indeterminate boundary;
- non-applicable boundary.

Shall not aggregate constraints into overall feasibility.

---

## Policy 3 — Approval and Authority Reasoning

Surface:

- explicit approval requirements;
- confirmed authority references;
- unresolved authority;
- conflicting authority evidence;
- proposal-readiness limitations.

Shall not grant approval.

Shall not infer authority from titles, names or prose.

---

## Policy 4 — Dependency and Assumption Reasoning

Surface:

- unresolved dependencies;
- supported dependencies;
- unresolved assumptions;
- contradicted assumptions;
- missing canonical support.

Shall not predict whether a dependency will be satisfied.

---

## Policy 5 — Evidence Sufficiency Reasoning

Evaluate only configured canonical evidence requirements.

May produce:

- evidence sufficient for the bounded observation;
- evidence missing;
- evidence conflicting;
- evidence not applicable;
- evidence indeterminate.

Shall not infer evidence quality from narrative length or source name.

---

## Policy 6 — Comparison Interpretation Boundary

Consume Candidate Plan Comparison Set results and state only what those results support.

May produce:

- structural distinction supported;
- structural equivalence supported;
- one-sided canonical value present;
- comparison not supported;
- comparison indeterminate;
- comparison does not establish preference.

This policy shall explicitly preserve the boundary:

> Difference is not preference.

---

## Policy 7 — Candidate Availability for Consideration

Determine whether a candidate remains available for future proposal consideration under explicit configured rules.

Permitted statuses:

- remains available for consideration;
- blocked by explicit boundary;
- unresolved;
- indeterminate;
- not applicable.

This policy shall not recommend an available candidate.

It shall not rank available candidates.

---

## Policy 8 — Planning Set Completeness

Reason over the complete planning graph.

May identify:

- no candidates exist;
- one candidate exists;
- multiple candidates exist;
- no candidate satisfies a configured structural condition;
- multiple candidates remain structurally available;
- unresolved questions remain;
- proposal readiness is blocked by explicit boundaries.

This policy shall not create a fallback candidate.

It shall not choose among candidates.

---

# Policy Scope Discipline

Do not create a universal reasoning policy.

Do not create an arbitrary expression evaluator.

Do not interpret prose.

Do not create hidden weights.

Do not aggregate findings into a score.

Do not treat more satisfied findings as better.

Do not treat fewer violated findings as preferred.

Do not treat structural equivalence as suitability.

Do not treat structural difference as advantage.

Do not create a recommendation through reason-code wording.

Do not create a selected-candidate field set to null.

The absence of a recommendation field is the correct design.

---

# Reasoning Process

The engine shall:

1. validate Executive Context;
2. validate Executive Intent Set;
3. validate Executive Constraint Set;
4. validate Candidate Plan Set;
5. validate Evaluated Candidate Plan Set;
6. validate Candidate Plan Comparison Set;
7. verify coherent source identities;
8. verify candidate preservation;
9. verify evaluation preservation;
10. verify comparison-profile preservation;
11. validate reasoning policies;
12. validate reasoning definitions;
13. clone all policy inputs;
14. retrieve policies in deterministic order;
15. evaluate deterministic applicability;
16. construct reasoning observations;
17. construct unresolved questions where authorised;
18. construct governance boundaries where authorised;
19. validate every policy artefact atomically;
20. reject unsupported scopes;
21. reject unsupported observation types;
22. reject unsupported statuses;
23. reject malformed reason codes;
24. reject unresolved mandatory references;
25. reject duplicate observation identities;
26. reject duplicate question identities;
27. reject duplicate boundary identities;
28. order observations structurally;
29. order questions structurally;
30. order boundaries structurally;
31. construct count-only summary;
32. construct deterministic record identity;
33. deeply freeze canonical output;
34. validate final Executive Reasoning Record;
35. return only after all validation succeeds.

Any failure shall abort the complete reasoning operation.

No partial reasoning record may be returned.

---

# Upstream Artefact Preservation

Executive Reasoning shall not:

- omit Candidate Plans;
- mutate Candidate Plans;
- mutate Candidate Plan Evaluations;
- mutate Candidate Plan Comparison Profiles;
- rewrite findings;
- rewrite comparison relations;
- convert not-comparable into unresolved;
- convert unresolved into violated;
- convert indeterminate into recommendation;
- alter upstream ordering;
- add reasoning fields to upstream contracts.

Reasoning observations shall reference upstream artefacts.

They shall not replace them.

---

# Observation Identity

Every reasoning observation identity shall derive only from canonical structural inputs such as:

- Executive Context identifier;
- Candidate Plan identifiers;
- Candidate Plan Evaluation identifiers;
- comparison identifiers;
- reasoning definition identifier and version;
- reasoning scope;
- observation type;
- reasoning status;
- compact canonical value;
- sorted evidence references;
- sorted governance-boundary references;
- reasoning policy identifier and version;
- reason code.

No identity may depend on:

- UUIDs;
- current clock time;
- random values;
- registration order;
- object insertion order;
- localised descriptions;
- runtime state;
- model outputs.

---

# Question Identity

Each question identity shall derive from:

- reasoning definition identity;
- policy identity;
- reason code;
- sorted candidate identities;
- sorted required evidence references or types;
- required authority or boundary reference;
- source planning-graph identities.

---

# Boundary Identity

Each boundary identity shall derive from:

- boundary type;
- source canonical reference;
- sorted applicable candidate identities;
- boundary status;
- policy identity;
- reason code;
- source planning-graph identities.

---

# Executive Reasoning Record Identity

The Executive Reasoning Record identity shall derive from:

- Executive Context identifier;
- Executive Intent Set identifier;
- Executive Constraint Set identifier;
- Candidate Plan Set identifier;
- Evaluated Candidate Plan Set identifier;
- Candidate Plan Comparison Set identifier;
- sorted active reasoning-policy identities;
- sorted reasoning-definition identities;
- sorted observation identities;
- sorted question identities;
- sorted boundary identities.

An empty reasoning record shall still have a deterministic identity.

---

# Ordering

Observations shall use deterministic structural ordering.

Recommended observation order:

1. reasoning scope;
2. observation type;
3. Candidate Plan identifier where applicable;
4. reasoning definition identifier;
5. policy identifier;
6. policy version;
7. observation identifier.

Questions shall be ordered by:

1. required authority or evidence type;
2. Candidate Plan identifier where applicable;
3. reasoning definition identifier;
4. policy identifier;
5. question identifier.

Boundaries shall be ordered by:

1. boundary type;
2. Candidate Plan identifier where applicable;
3. source canonical reference;
4. policy identifier;
5. boundary identifier.

Ordering shall never express:

- merit;
- severity;
- urgency;
- priority;
- importance;
- desirability;
- feasibility;
- preference;
- recommendation.

---

# Count-Only Summary

The Executive Reasoning Summary shall contain counts only.

At minimum:

- total observations;
- observations by scope;
- observations by type;
- observations by status;
- observations by policy;
- total unresolved questions;
- questions by reason code;
- total governance boundaries;
- boundaries by type;
- candidates referenced;
- candidates remaining available for consideration;
- candidates blocked by explicit boundaries;
- candidates with unresolved reasoning;
- candidates with indeterminate reasoning;
- planning-set observations;
- evidence-state observations.

The summary shall not contain:

- score;
- rank;
- preference;
- winner;
- recommendation;
- selected candidate;
- approval;
- rejection;
- action;
- confidence percentage;
- utility.

Counts shall be validated against canonical record contents.

---

# No Aggregate Conclusion

Sprint 3.22 shall not produce:

- final conclusion;
- overall verdict;
- preferred candidate;
- recommended candidate;
- selected candidate;
- best option;
- aggregate score;
- utility score;
- risk score;
- feasibility score;
- compliance score;
- weighted synthesis;
- approval decision;
- rejection decision;
- action instruction.

Mixed reasoning states shall remain visible.

Example:

```text
Candidate A:
- objective support: supported
- approval boundary: unresolved
- dependency state: supported
- evidence state: indeterminate

Candidate B:
- objective support: supported
- approval boundary: supported
- dependency state: unresolved
- comparison preference: unsupported
```

The reasoning layer shall not collapse this into:

> Candidate B should be chosen.

---

# Provenance

Every reasoning observation shall preserve:

- source Executive Context identity;
- source Executive Intent Set identity;
- source Executive Constraint Set identity;
- source Candidate Plan Set identity;
- source Evaluated Candidate Plan Set identity;
- source Candidate Plan Comparison Set identity;
- relevant Candidate Plan identities;
- relevant evaluation identities;
- relevant comparison identities;
- reasoning definition identity;
- policy identity;
- canonical evidence references;
- canonical governance references;
- reasoning status;
- reason code;
- configured origin.

Every question and boundary shall preserve equivalent source provenance.

No downstream consumer should need to reconstruct why a reasoning artefact exists from explanatory prose.

---

# Validation Requirements

Implement validation for:

- reasoning statuses;
- reasoning scopes;
- observation types;
- reason codes;
- reasoning policy contracts;
- reasoning policy metadata;
- reasoning definitions;
- unique reasoning-definition identifiers;
- source identity coherence;
- Candidate Plan preservation;
- Candidate Plan Evaluation preservation;
- Candidate Plan Comparison preservation;
- observation identities;
- question identities;
- boundary identities;
- record identity;
- deterministic ordering;
- duplicate observation rejection;
- duplicate question rejection;
- duplicate boundary rejection;
- summary consistency;
- JSON compatibility;
- defensive copying;
- recursive deep freezing;
- replay safety;
- atomic failure.

Validation shall not determine which candidate should be proposed.

---

# JSON Compatibility

All canonical reasoning outputs shall be JSON-compatible.

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

The reasoning engine shall not retain mutable references to:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan Comparison Set;
- Candidate Plans;
- Candidate Plan Evaluations;
- comparison profiles;
- reasoning definitions;
- policy metadata;
- policy inputs;
- policy outputs before canonical validation.

Inputs supplied to policies shall be defensively cloned.

All observations, questions, boundaries, summaries, provenance and reasoning records shall be recursively frozen before return.

Tests must prove attempted mutation cannot alter canonical output or upstream artefacts.

---

# Replay Safety

Given structurally identical:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan Comparison Set;
- reasoning definitions;
- policy registrations;

the engine shall produce structurally identical:

- observations;
- questions;
- boundaries;
- statuses;
- reason codes;
- identities;
- ordering;
- provenance;
- summaries;
- Executive Reasoning Record.

Replay shall not depend on:

- process state;
- current clock time;
- locale;
- registration order;
- random values;
- runtime caches;
- model-provider state;
- object insertion order.

---

# Atomic Failure

The following shall cause complete reasoning failure:

- malformed Executive Context;
- malformed Intent Set;
- malformed Constraint Set;
- malformed Candidate Plan Set;
- malformed Evaluated Candidate Plan Set;
- malformed Candidate Plan Comparison Set;
- source identity mismatch;
- Candidate Plan mutation detected;
- Candidate Plan Evaluation mutation detected;
- comparison-profile mismatch;
- malformed reasoning policy;
- duplicate policy identifier;
- malformed reasoning definition;
- duplicate reasoning-definition identifier;
- policy exception;
- malformed applicability result;
- malformed observation;
- malformed question;
- malformed boundary;
- unsupported scope;
- unsupported observation type;
- unsupported status;
- invalid reason code;
- invalid identity;
- duplicate observation;
- duplicate question;
- duplicate boundary;
- invalid ordering;
- invalid summary;
- unresolved mandatory canonical reference;
- JSON incompatibility.

No partial Executive Reasoning Record may be returned.

---

# Empty Candidate Set Semantics

A coherent empty Candidate Plan Set, empty Evaluated Candidate Plan Set and empty Candidate Plan Comparison Set shall produce a valid immutable Executive Reasoning Record containing:

- coherent source identities;
- zero candidate-scoped observations unless explicitly authorised by a planning-set definition;
- optional planning-set observation that no candidates exist;
- no synthetic candidate;
- no fallback recommendation;
- no selected null candidate;
- deterministic record identity;
- zero-valued count-only summary except for authorised planning-set observations;
- active reasoning-policy provenance;
- reasoning-definition provenance.

---

# Single-Candidate Semantics

A set containing one candidate may produce:

- candidate-scoped observations;
- planning-set observations;
- governance boundaries;
- unresolved questions;
- no cross-candidate preference;
- no synthetic comparator;
- no recommendation.

The absence of another candidate shall not be treated as failure.

---

# Zero-Observation Semantics

A coherent graph with no applicable reasoning definitions shall produce a valid Executive Reasoning Record containing:

- coherent source identities;
- empty observation collection;
- empty question collection;
- empty boundary collection;
- zero-valued summary;
- deterministic identity;
- policy provenance;
- definition provenance.

Zero observations shall not mean:

- approved;
- rejected;
- feasible;
- preferred;
- recommended;
- ready for execution.

---

# Calendar Integration Proof

Extend the production vertical integration path:

```text
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
↓
Candidate Plan Comparative Analysis
↓
Bounded Executive Reasoning
```

The integration test shall demonstrate:

- Calendar prose does not independently create reasoning;
- explicit Objectives exist;
- explicit Constraints exist;
- at least two Candidate Plans are constructed;
- both are evaluated;
- both are compared;
- explicit reasoning definitions determine permitted interpretation;
- the reasoning record references upstream artefacts rather than duplicating them;
- one supported candidate-scoped observation is produced;
- one unresolved or indeterminate observation is produced;
- one cross-candidate observation preserves the boundary that difference does not establish preference;
- one governance boundary or unresolved question is produced;
- no recommendation occurs;
- no selection occurs;
- no approval occurs;
- no execution occurs;
- source artefacts remain unchanged;
- reasoning identity remains stable across replay.

Also test:

- empty candidate graph;
- single-candidate graph;
- zero applicable reasoning definitions;
- Calendar narrative changes that do not alter canonical typed inputs do not alter reasoning output.

---

# Package Conformance

The Executive Reasoning package may depend only on:

- Executive Context public contracts;
- Executive Intent & Constraint public contracts;
- Candidate Plan public contracts;
- Candidate Plan Evaluation public contracts;
- Candidate Plan Comparison public contracts;
- local Executive Reasoning contracts;
- canonical shared validation utilities;
- canonical identity utilities where already established.

Production reasoning code shall not depend on:

- connectors;
- Projection Adapters;
- ProjectionEngine;
- Snapshot Lifecycle;
- Attention internals;
- Situation internals;
- Assessment internals;
- Candidate Plan Construction internal implementation files;
- Candidate Plan Evaluation internal implementation files;
- Candidate Plan Comparison internal implementation files;
- future proposal packages;
- approval packages;
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

No upstream package shall become aware of Executive Reasoning.

In particular:

- Connectors shall not import reasoning;
- Projection shall not import reasoning;
- Situational Awareness shall not import reasoning;
- Snapshot Lifecycle shall not import reasoning;
- Attention shall not import reasoning;
- Situation Formation shall not import reasoning;
- Assessment shall not import reasoning;
- Executive Context shall not import reasoning;
- Intent & Constraint shall not import reasoning;
- Candidate Plan Construction shall not import reasoning;
- Candidate Plan Constraint Evaluation shall not import reasoning;
- Candidate Plan Comparative Analysis shall not import reasoning.

Reasoning is strictly downstream of comparison.

Do not add reasoning fields to Candidate Plan, Evaluation or Comparison contracts for convenience.

---

# Public Exports

Expose public reasoning contracts only through:

```text
lib/executive-operating-system/reasoning/index.ts
```

Export only:

- approved public types;
- approved production policies;
- registry interfaces;
- reasoning engine interfaces;
- canonical Executive Reasoning Record artefacts required by the future proposal layer.

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

- coherent full planning graph succeeds;
- mismatched Context identity fails;
- mismatched Intent Set identity fails;
- mismatched Constraint Set identity fails;
- mismatched Candidate Plan Set identity fails;
- mismatched Evaluated Candidate Plan Set identity fails;
- mismatched Candidate Plan Comparison Set identity fails;
- missing candidate evaluation fails;
- missing comparison profile fails;
- mutated Candidate Plan fails;
- mutated evaluation fails;
- malformed reasoning definition fails;
- duplicate reasoning-definition identifier fails.

## Minimal Record Shape

- exactly one Executive Reasoning Record is produced;
- upstream objects are referenced by identity;
- complete upstream objects are not duplicated;
- no unnecessary public intermediate graph types exist;
- zero-observation record is valid.

## Objective Support

- explicit support produces `supported`;
- absent support produces `unsupported`;
- missing evidence produces `unresolved`;
- conflicting evidence produces `indeterminate`;
- no best-candidate conclusion exists.

## Constraint Boundaries

- explicit violation is surfaced;
- explicit satisfaction is surfaced;
- unresolved state is preserved;
- not-applicable state is preserved;
- no aggregate feasibility verdict exists.

## Approval and Authority

- explicit approval requirement is surfaced;
- explicit authority evidence is recognised;
- missing authority produces unresolved question or boundary;
- authority is not inferred from names or titles;
- no approval is granted.

## Dependencies and Assumptions

- supported dependency;
- unresolved dependency;
- unresolved assumption;
- conflicting assumption evidence;
- no prediction is made.

## Evidence Sufficiency

- configured evidence present;
- configured evidence missing;
- conflicting evidence;
- irrelevant evidence omitted;
- narrative length does not affect status.

## Comparison Interpretation Boundary

- structural difference can be supported;
- structural equivalence can be supported;
- not-comparable remains not determinable;
- indeterminate remains indeterminate;
- difference does not create preference;
- equivalence does not create recommendation.

## Candidate Availability

- candidate remains available for consideration;
- candidate blocked by explicit boundary;
- candidate unresolved;
- multiple candidates may remain available;
- no candidate is ranked;
- no candidate is recommended.

## Planning Set

- empty candidate set;
- single candidate;
- multiple candidates;
- no candidate satisfies configured condition;
- multiple candidates remain for consideration;
- no fallback candidate is manufactured.

## Questions and Boundaries

- unresolved evidence question is typed;
- unresolved authority question is typed;
- governance boundary is typed;
- duplicate questions fail;
- duplicate boundaries fail;
- free-form brainstorming prompts are absent.

## Identities

- observation identity is stable;
- question identity is stable;
- boundary identity is stable;
- record identity is stable;
- policy registration order does not change identity;
- reasoning-definition order does not change identity;
- evidence-reference order does not change identity;
- generated time and randomness are absent.

## Ordering

- observations are structurally ordered;
- questions are structurally ordered;
- boundaries are structurally ordered;
- statuses do not control ordering;
- candidates are not reordered by merit;
- locale does not affect ordering.

## Summaries

- counts by scope are correct;
- counts by type are correct;
- counts by status are correct;
- counts by policy are correct;
- question counts are correct;
- boundary counts are correct;
- malformed summaries fail;
- summaries contain no score, rank or recommendation.

## Immutability

- policy inputs are cloned;
- policy cannot mutate upstream graph;
- policy cannot mutate Candidate Plans;
- policy cannot mutate Evaluations;
- policy cannot mutate Comparisons;
- returned observations are deeply frozen;
- returned questions are deeply frozen;
- returned boundaries are deeply frozen;
- returned reasoning record is deeply frozen.

## Replay Safety

- repeated reasoning produces structural equality;
- equivalent registration order produces structural equality;
- equivalent definition order produces structural equality;
- equivalent reference order produces structural equality.

## Atomic Failure

- policy exception aborts reasoning;
- malformed observation aborts reasoning;
- malformed question aborts reasoning;
- malformed boundary aborts reasoning;
- duplicate observation aborts reasoning;
- duplicate question aborts reasoning;
- duplicate boundary aborts reasoning;
- invalid identity aborts reasoning;
- unsupported status aborts reasoning;
- malformed reason code aborts reasoning;
- no partial record is returned.

## Semantics

- no aggregate score exists;
- no ranking exists;
- no preferred status exists;
- no recommendation exists;
- no selected status exists;
- no approval decision exists;
- no execution instruction exists;
- supported does not mean recommended;
- unsupported does not mean rejected;
- blocked does not mean permanently rejected;
- difference does not imply advantage;
- equivalence does not imply suitability.

## Integration

- complete Calendar-to-Reasoning path;
- at least two candidates are represented;
- one supported observation;
- one unresolved or indeterminate observation;
- one comparison-boundary observation;
- one question or governance boundary;
- source graph remains unchanged;
- replay is stable;
- empty graph is valid;
- single-candidate graph is valid;
- Calendar prose alone does not affect reasoning.

## Package Boundaries

- production imports remain within approved packages;
- Candidate Plan Construction does not import reasoning;
- Evaluation does not import reasoning;
- Comparison does not import reasoning;
- upstream packages do not import reasoning;
- proposal, approval, execution, runtime, UI, API, specialist and provider imports are prohibited.

---

# Repository Validation

Run all repository-required validation commands.

At minimum:

```bash
npx vitest run lib/executive-operating-system/reasoning
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

Do not describe a terminated or incomplete build as passed.

Do not describe a repository-wide test run as passed unless Vitest emits its final successful completion summary.

---

# Architecture Documentation

Update:

```text
docs/architecture/SYSTEM-ARCHITECTURE.md
```

to show:

```text
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
Candidate Plan Comparative Analysis
↓
Candidate Plan Comparison Set
↓
Bounded Executive Reasoning
↓
Executive Reasoning Record
↓
Future Governed Action Proposal
↓
Future Human Approval
↓
Future Authorised Execution
```

Document clearly that Executive Reasoning Records are:

- bounded;
- advisory;
- explicit;
- deterministic;
- provenance-preserving;
- compact;
- reference-based;
- unweighted;
- unscored;
- unranked;
- unselected;
- unapproved;
- non-recommended;
- inert;
- non-executable.

Document that reasoning consumes the existing artefact graph without recreating it.

Document that a supported observation is not a recommendation.

Document that an unresolved boundary is not a rejection.

---

# ADR

Create:

```text
docs/architecture/ADR-0017-Bounded-Executive-Reasoning.md
```

Title:

# ADR-0017 — Bounded Executive Reasoning

The ADR shall document:

- architectural purpose;
- position downstream of Candidate Plan Comparative Analysis;
- position upstream of Governed Action Proposal;
- rich graph consumption strategy;
- minimal public contract strategy;
- one-record canonical output;
- reference-over-duplication principle;
- reasoning-status vocabulary;
- reasoning-scope vocabulary;
- observation-type vocabulary;
- explicit reasoning-definition requirement;
- reason-code strategy;
- observation model;
- unresolved-question model;
- governance-boundary model;
- prohibition on narrative interpretation;
- treatment of unsupported conditions;
- treatment of missing evidence;
- treatment of conflicting evidence;
- treatment of comparison limitations;
- candidate availability semantics;
- proposal-readiness boundary;
- prohibition on aggregate conclusions;
- prohibition on scores;
- prohibition on ranking;
- prohibition on recommendation;
- observation identity;
- question identity;
- boundary identity;
- reasoning-record identity;
- deterministic ordering;
- count-only summaries;
- provenance requirements;
- immutable and replay-safe outputs;
- zero-observation semantics;
- single-candidate semantics;
- empty-set semantics;
- atomic failure;
- future Governed Action Proposal boundary;
- future human approval boundary;
- future execution boundary;
- non-goals;
- rejected alternatives.

Rejected alternatives shall include:

- LLM-generated reasoning records;
- semantic interpretation of descriptions;
- duplicating the complete upstream artefact graph;
- introducing a reasoning graph, matrix or cluster model;
- weighted synthesis;
- aggregate scores;
- implicit utility functions;
- hidden preference logic;
- ranking candidates;
- selecting a candidate;
- recommending a candidate;
- granting approval;
- treating unresolved as rejection;
- treating supported as recommendation;
- inferring authority from titles;
- mutating Candidate Plans, Evaluations or Comparisons;
- permitting reasoning policies to perform side effects;
- combining reasoning and Governed Action Proposal in one layer.

---

# Explicit Non-Goals

Sprint 3.22 shall not introduce:

- Governed Action Proposal;
- candidate recommendation;
- candidate ranking;
- candidate selection;
- weighted reasoning;
- scoring;
- utility functions;
- optimisation;
- preference;
- priority;
- urgency;
- importance;
- desirability;
- overall feasibility;
- overall compliance verdict;
- final decision;
- approval;
- rejection;
- execution;
- scheduling;
- task creation;
- notifications;
- specialist routing;
- specialist invocation;
- LLM reasoning;
- embeddings;
- semantic interpretation;
- runtime orchestration;
- persistence;
- APIs;
- UI;
- external side effects;
- automatic remediation;
- constraint rewriting;
- objective rewriting;
- Candidate Plan mutation;
- Candidate Plan Evaluation mutation;
- Candidate Plan Comparison mutation;
- a second derived reasoning graph;
- unnecessary intermediate public artefacts.

---

# Acceptance Criteria

Sprint 3.22 is complete only when:

- immutable reasoning contracts are implemented;
- the closed reasoning-status vocabulary is implemented;
- the closed reasoning-scope vocabulary is implemented;
- bounded observation types are implemented;
- deterministic reason codes are implemented;
- deterministic reasoning-policy contracts are implemented;
- deterministic reasoning registry is implemented;
- duplicate policies fail explicitly;
- explicit reasoning definitions are implemented;
- deterministic reasoning engine is implemented;
- bounded production reasoning policies are implemented;
- one compact Executive Reasoning Record is produced;
- the existing artefact graph is referenced rather than duplicated;
- unnecessary intermediate public types are avoided;
- source Candidate Plans remain unchanged;
- source Candidate Plan Evaluations remain unchanged;
- source Candidate Plan Comparisons remain unchanged;
- candidate-scoped observations are supported;
- cross-candidate observations are supported;
- planning-set observations are supported;
- evidence-state observations are supported;
- governance boundaries are supported;
- unresolved questions are supported;
- supported, unsupported, unresolved, indeterminate and not-applicable states are preserved;
- no aggregate conclusion exists;
- no score exists;
- no ranking exists;
- no preference exists;
- no recommendation exists;
- no selection exists;
- no approval exists;
- no execution exists;
- deterministic observation identities are implemented;
- deterministic question identities are implemented;
- deterministic boundary identities are implemented;
- deterministic Executive Reasoning Record identity is implemented;
- structural ordering is implemented;
- count-only summaries are implemented;
- zero-observation records are supported;
- single-candidate graphs are supported;
- empty candidate graphs are supported;
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
- ADR-0017 is completed.

---

# Recommended Pull Request Scope

Prefer one bounded pull request unless repository constraints require a split.

Suggested pull-request title:

```text
Sprint 3.22: Add bounded Executive Reasoning
```

Suggested commit title:

```text
feat(eos): add bounded executive reasoning
```

Do not include:

- Governed Action Proposal;
- recommendation;
- selection;
- approval;
- execution.

---

# Completion Report

Provide the completion report using the established repository structure.

## Summary

Describe:

- reasoning contracts;
- status and scope vocabularies;
- reasoning definitions;
- registry;
- engine;
- production policies;
- compact reasoning record;
- observations;
- questions;
- boundaries;
- validation;
- identities;
- ordering;
- summaries;
- integration;
- documentation.

## Architectural Compliance

Confirm:

- reasoning consumes one coherent canonical planning graph;
- the existing graph is referenced rather than duplicated;
- unnecessary intermediate public artefacts were avoided;
- source Candidate Plans remain unchanged;
- source Candidate Plan Evaluations remain unchanged;
- source Candidate Plan Comparisons remain unchanged;
- observations rely only on typed canonical values;
- descriptions and Calendar prose are not interpreted;
- supported does not mean recommended;
- difference does not become preference;
- reasoning remains separate from proposal;
- proposal remains separate from approval;
- approval remains separate from execution;
- no scoring, ranking, recommendation, selection, approval or execution exists;
- upstream boundaries remain preserved.

## Key Decisions

Report:

- package placement;
- minimal public contract surface;
- one-record output model;
- reference-over-duplication strategy;
- reasoning-status vocabulary;
- reasoning-scope vocabulary;
- observation-type model;
- reasoning-definition model;
- reason-code model;
- observation model;
- unresolved-question model;
- governance-boundary model;
- treatment of missing evidence;
- treatment of conflicting evidence;
- treatment of comparison limitations;
- candidate-availability semantics;
- observation identity;
- question identity;
- boundary identity;
- record identity;
- zero-observation behaviour;
- single-candidate behaviour;
- empty-set behaviour;
- ordering;
- summary structure;
- provenance;
- atomic-failure semantics.

## Testing

Report every command and exact result.

Distinguish:

- a complete passing test run;
- a terminated test run;
- a complete passing build;
- a terminated or incomplete build;
- non-fatal external resource warnings.

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

- Governed Action Proposal;
- proposal records;
- recommendations;
- ranking;
- selection;
- human approval workflow;
- execution;
- runtime orchestration;
- specialist invocation;
- persistence;
- APIs;
- UI;
- LLM integration.

---

# Final Architectural Constraint

Bounded Executive Reasoning ends with one immutable, compact, provenance-preserving Executive Reasoning Record over the unchanged canonical planning graph.

A reasoning observation is not a recommendation.

A supported condition is not approval.

An unsupported condition is not rejection.

An unresolved question is not a decision.

A governance boundary is not an execution instruction.

A candidate remaining available for consideration is not a selected candidate.

A reasoning record is not a Governed Action Proposal.

This sprint shall consume the rich existing artefact graph without recreating it, avoid unnecessary intermediate public types, preserve mixed states, and never determine what action should be taken.

Its sole responsibility is to answer:

> What bounded interpretation is supported by the coherent canonical Executive Context, Intent, Constraints, Candidate Plans, Evaluations and Comparisons, without recommending, selecting, approving or executing an action?
