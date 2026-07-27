# Sprint 3.23 — Governed Action Proposal

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

Where the existing repository architecture cannot support a required capability without weakening an established boundary, stop and report the architectural conflict rather than introducing hidden semantics, implicit authority, opaque inference, unrestricted recommendation, accidental execution authority, or upstream redesign.

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
- proposal before human approval
- human approval before authorised execution
- unresolved before assumed
- bounded proposal before action
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
- Sprint 3.22 — Bounded Executive Reasoning

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
↓
Bounded Executive Reasoning
↓
Executive Reasoning Record
```

The repository can now:

- construct explicit candidate plans from typed definitions;
- evaluate each candidate against typed constraints and requirements;
- compare evaluated candidates across explicit typed dimensions;
- form bounded, deterministic, provenance-preserving reasoning observations;
- preserve unresolved questions and governance boundaries;
- identify candidate availability for future consideration;
- avoid scoring, ranking, recommendation, selection, approval and execution.

No Governed Action Proposal layer exists.

No proposal record exists.

No proposal-kind vocabulary exists.

No proposal-readiness model exists.

No explicit proposal condition model exists.

No proposal authority requirement model exists.

No human approval workflow exists.

No execution authorisation exists.

No execution boundary crossing exists.

---

# Relationship to the North Star

Candidate Plan Construction answers:

> Which explicit candidate plans are authorised to exist?

Candidate Plan Constraint Evaluation answers:

> What deterministic findings apply to each candidate?

Candidate Plan Comparative Analysis answers:

> How do evaluated candidates differ across explicit typed dimensions?

Bounded Executive Reasoning answers:

> What bounded interpretation is supported by the coherent canonical planning graph?

The next architectural question is:

> What bounded, reviewable proposal may be placed before an authorised human without selecting, approving, or executing an action?

This sprint introduces Governed Action Proposal.

The proposal layer shall consume the existing Executive Reasoning Record and the canonical planning graph identities it references.

It shall formulate explicit reviewable proposals.

It shall not decide.

It shall not approve.

It shall not execute.

It shall not mutate upstream artefacts.

It shall not silently collapse multiple valid candidates into a single preferred option.

---

# Sprint Objective

Implement a deterministic Governed Action Proposal layer.

The layer shall consume:

- one immutable Executive Reasoning Record;
- one coherent Executive Context;
- one coherent Executive Intent Set;
- one coherent Executive Constraint Set;
- one coherent Candidate Plan Set;
- one coherent Evaluated Candidate Plan Set;
- one coherent Candidate Plan Comparison Set;
- explicit typed proposal definitions;
- registered deterministic proposal policies.

The layer shall produce:

- one immutable Governed Action Proposal Set;
- zero or more explicit Governed Action Proposals;
- proposal conditions;
- required human authority;
- required evidence;
- unresolved proposal questions;
- proposal boundaries;
- deterministic identities;
- count-only summaries;
- complete provenance;
- no approval;
- no execution.

The layer shall formulate reviewable proposal artefacts from bounded reasoning.

It shall not substitute for human judgement.

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
+
Executive Reasoning Record
↓
Proposal Definitions
↓
Proposal Policies
↓
Proposal Registry
↓
Governed Action Proposal Engine
↓
Governed Action Proposal Set
↓
Future Human Approval
↓
Future Authorised Execution
```

Governed Action Proposal must stop before approval.

---

# Fundamental Separation

## Executive Reasoning

Completed in Sprint 3.22.

Answers:

> What bounded interpretation is supported?

## Governed Action Proposal

This sprint.

Answers:

> What explicit proposal may be placed before an authorised human for consideration?

## Human Approval

Future sprint responsibility.

Answers:

> What proposal is accepted, rejected, modified, deferred, or returned for further evidence by an authorised human?

## Authorised Execution

Future sprint responsibility.

Answers:

> What approved action may cross the execution boundary?

Proposal is not approval.

Approval is not execution.

---

# Proposal Philosophy

A proposal is an explicit artefact for human consideration.

A proposal may:

- nominate one candidate for consideration;
- nominate multiple candidates for consideration;
- preserve multiple candidates without preference;
- request further evidence;
- request authority confirmation;
- propose deferment;
- propose conditional consideration;
- propose no action pending resolution;
- propose escalation to an authorised human;
- propose candidate combination only where an explicit deterministic combination definition exists.

A proposal shall not:

- claim to be a decision;
- claim to be approved;
- issue an execution command;
- trigger a connector;
- create a calendar event;
- send an email;
- invoke a specialist;
- mutate a candidate plan;
- rank candidates;
- assign a score;
- infer preference;
- infer authority;
- infer user intent beyond canonical inputs;
- perform unrestricted natural-language recommendation.

---

# Proposal versus Recommendation

A governed proposal may place a candidate before a human.

That does not make the candidate recommended.

The distinction shall remain explicit.

Permitted:

> Candidate A is proposed for human consideration subject to approval X and evidence Y.

Prohibited:

> Candidate A is the best option.

Permitted:

> Candidates A and B remain available for human consideration.

Prohibited:

> Candidate A should be chosen over Candidate B.

Permitted:

> Further evidence is proposed before any candidate is considered.

Prohibited:

> Do not proceed because the system rejects all options.

---

# Minimal Public Contract Surface

Implement only the minimum stable public contracts required for this sprint:

- `GovernedActionProposalStatus`
- `GovernedActionProposalKind`
- `GovernedActionProposalScope`
- `GovernedActionProposalReasonCode`
- `GovernedActionProposalConditionType`
- `GovernedActionProposalAuthorityType`
- `GovernedActionProposalPolicy`
- `GovernedActionProposalPolicyMetadata`
- `GovernedActionProposalDefinition`
- `GovernedActionProposalInput`
- `GovernedActionProposalCondition`
- `GovernedActionProposalAuthorityRequirement`
- `GovernedActionProposalQuestion`
- `GovernedActionProposalBoundary`
- `GovernedActionProposal`
- `GovernedActionProposalSummary`
- `GovernedActionProposalProvenance`
- `GovernedActionProposalSet`
- `GovernedActionProposalRegistry`
- `GovernedActionProposalEngine`

Do not introduce:

- approval record;
- decision record;
- execution record;
- action command;
- task;
- schedule;
- runtime directive;
- selected candidate field on upstream artefacts;
- proposal graph;
- proposal matrix;
- proposal ranking table;
- utility score;
- confidence score.

Keep helper types private unless a downstream stable boundary demonstrably requires them.

---

# Package Structure

Create:

```text
lib/executive-operating-system/proposal/
  types.ts
  registry.ts
  engine.ts
  policies.ts
  validation.ts
  index.ts
```

Focused tests:

```text
lib/executive-operating-system/proposal/
  proposal.test.ts
  calendar-integration.test.ts
  package-conformance.test.ts
```

Do not add proposal implementation to:

- reasoning;
- comparison;
- evaluation;
- planning construction;
- context;
- intent;
- constraints;
- assessment;
- situation;
- attention;
- snapshot;
- projection packages.

No package outside the proposal package may directly construct canonical Governed Action Proposal Sets.

---

# Governed Action Proposal Status

Implement a closed vocabulary:

```text
draft
ready_for_human_review
blocked
unresolved
not_applicable
```

Definitions:

## Draft

A structurally valid proposal exists but still contains explicit unresolved conditions or questions.

## Ready for Human Review

The proposal is structurally complete enough to be presented to an authorised human.

This status does not mean approved.

## Blocked

An explicit canonical boundary prevents the proposal from reaching human review in its current form.

Blocked does not mean permanently rejected.

## Unresolved

The proposal cannot yet be fully formed because required canonical evidence, authority, or definition is missing or conflicting.

## Not Applicable

The proposal definition does not apply.

Do not introduce:

- approved;
- rejected;
- selected;
- executed;
- successful;
- failed;
- recommended;
- preferred.

---

# Governed Action Proposal Kind

Implement a closed vocabulary at minimum:

```text
consider_candidate
consider_multiple_candidates
defer_pending_evidence
request_authority_confirmation
request_human_arbitration
propose_conditional_consideration
preserve_options
no_action_pending_resolution
consider_explicit_combination
```

Definitions:

## Consider Candidate

Place exactly one explicit candidate before an authorised human for review.

This is not selection or recommendation.

## Consider Multiple Candidates

Place two or more explicit candidates before an authorised human without ranking.

## Defer Pending Evidence

Propose deferment until explicit evidence requirements are met.

## Request Authority Confirmation

Propose confirmation of authority before further consideration.

## Request Human Arbitration

Propose human resolution of conflicting or indeterminate canonical states.

## Propose Conditional Consideration

Place one or more candidates before a human subject to explicit conditions.

## Preserve Options

Maintain multiple candidates without reducing the decision space.

## No Action Pending Resolution

Propose no execution or advancement until explicit unresolved boundaries are addressed.

## Consider Explicit Combination

Place a deterministically constructed candidate combination before a human only where an explicit combination definition already exists.

This sprint shall not invent combinations dynamically.

---

# Governed Action Proposal Scope

Implement a closed vocabulary:

```text
single_candidate
multiple_candidates
planning_set
evidence_resolution
authority_resolution
governance_escalation
```

The scope shall remain structural.

It shall not encode preference.

---

# Proposal Definitions

Every proposal shall be authorised by an explicit immutable proposal definition.

Each definition shall contain:

- stable definition identifier;
- stable definition version;
- proposal kind;
- proposal scope;
- explicit source reasoning selectors;
- explicit candidate selectors;
- deterministic applicability configuration;
- required proposal status outcomes;
- required policy identifier;
- configured origin;
- optional required evidence references;
- optional required authority references;
- optional required condition definitions;
- optional explicit candidate-combination identifier.

Definitions shall not contain:

- weights;
- scores;
- ranking criteria;
- recommendation prompts;
- unrestricted expressions;
- approval decisions;
- execution instructions;
- hidden defaults;
- narrative preference.

---

# Proposal Policy

Each proposal policy shall expose:

- stable policy identifier;
- stable policy version;
- immutable metadata;
- supported proposal kinds;
- supported proposal scopes;
- deterministic applicability evaluation;
- deterministic proposal construction;
- deterministic condition construction;
- deterministic question construction where authorised;
- deterministic boundary construction where authorised.

A policy may:

- inspect the Executive Reasoning Record;
- inspect referenced canonical source identities;
- inspect typed reasoning observations;
- inspect typed reasoning questions;
- inspect typed reasoning boundaries;
- inspect candidate availability states;
- inspect explicit approval requirements;
- inspect explicit evidence requirements;
- formulate bounded proposal artefacts;
- attach typed conditions;
- attach required human authority;
- preserve multiple candidates;
- preserve unresolved states;
- preserve indeterminate states;
- construct proposal questions;
- construct proposal boundaries;
- preserve provenance.

A policy shall not:

- mutate reasoning;
- mutate candidate plans;
- mutate evaluations;
- mutate comparisons;
- infer a preference;
- rank candidates;
- assign scores;
- approve;
- reject;
- execute;
- invoke an LLM;
- invoke a specialist;
- create a task;
- schedule an event;
- send a notification;
- perform side effects.

---

# Proposal Policy Metadata

Policy metadata shall contain, at minimum:

- stable identifier;
- version;
- display name;
- description;
- supported proposal kinds;
- supported proposal scopes;
- origin;
- status.

Metadata shall be:

- validated;
- defensively cloned;
- deeply frozen;
- replay-safe;
- JSON-compatible.

Descriptions shall not contain hidden ranking or approval semantics.

---

# Proposal Registry

Implement a deterministic Governed Action Proposal Registry.

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

# Governed Action Proposal Input

The engine input shall bind exactly one coherent planning and reasoning graph.

It shall contain:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan Comparison Set;
- Executive Reasoning Record;
- registered proposal policies;
- explicit proposal definitions.

Validation shall confirm:

- the Intent Set belongs to the supplied Executive Context;
- the Constraint Set belongs to the supplied Executive Context;
- the Candidate Plan Set belongs to the same Executive Context;
- the Candidate Plan Set references the supplied Intent Set;
- the Candidate Plan Set references the supplied Constraint Set;
- the Evaluated Candidate Plan Set references the supplied Candidate Plan Set;
- the Candidate Plan Comparison Set references the supplied Evaluated Candidate Plan Set;
- the Executive Reasoning Record references all six coherent upstream artefacts;
- all source identities agree;
- every candidate referenced by reasoning exists;
- every evaluation referenced by reasoning exists;
- every comparison referenced by reasoning exists;
- all proposal definitions are valid;
- all proposal-definition identifiers are unique;
- every referenced proposal policy exists;
- every source reasoning selector is supported;
- no mutable input is retained by reference.

Any mismatch shall fail atomically.

---

# Governed Action Proposal

Each proposal shall contain:

- stable proposal identifier;
- proposal definition identifier and version;
- proposal policy identifier and version;
- proposal kind;
- proposal scope;
- proposal status;
- deterministic reason code;
- relevant Candidate Plan identifiers;
- relevant Executive Reasoning observation identifiers;
- relevant Executive Reasoning question identifiers;
- relevant Executive Reasoning boundary identifiers;
- explicit proposal conditions;
- explicit authority requirements;
- explicit evidence requirements;
- explicit unresolved questions;
- explicit proposal boundaries;
- compact typed proposal payload;
- provenance.

The proposal shall not contain:

- approval decision;
- execution command;
- selected candidate field;
- rank;
- score;
- utility;
- hidden preference;
- unsupported prose-generated rationale;
- connector action;
- runtime directive.

---

# Governed Action Proposal Condition

Each condition shall contain:

- stable condition identifier;
- condition type;
- condition status;
- source canonical reference;
- applicable candidate identities;
- required evidence references where applicable;
- required authority references where applicable;
- deterministic reason code;
- proposal policy identity;
- provenance.

Condition types may include:

- evidence required;
- approval required;
- dependency resolution required;
- assumption resolution required;
- temporal prerequisite;
- resource prerequisite;
- governance prerequisite;
- privacy prerequisite;
- human arbitration required;
- comparison limitation acknowledged.

Conditions shall remain explicit and typed.

---

# Authority Requirement

Each authority requirement shall contain:

- stable authority-requirement identifier;
- authority type;
- source governance reference;
- applicable proposal identifier;
- applicable candidate identifiers;
- requirement status;
- deterministic reason code;
- provenance.

Authority types may include:

- human executive;
- delegated approver;
- governance body;
- policy owner;
- risk owner;
- privacy authority;
- financial authority;
- operational authority.

Authority shall never be inferred from a person's name, title, email address, or Calendar description.

Authority must be explicitly represented canonically.

---

# Proposal Question

A proposal question represents an issue that must be answered before approval or execution can occur.

Each question shall contain:

- stable question identifier;
- proposal definition identity;
- proposal policy identity;
- reason code;
- relevant proposal identity;
- relevant candidate identities;
- required canonical evidence types or references;
- required authority type or reference where applicable;
- provenance.

Questions shall be bounded and typed.

They shall not be free-form brainstorming prompts.

---

# Proposal Boundary

A proposal boundary represents a limitation on proposal readiness, approval, or future execution.

Each boundary shall contain:

- stable boundary identifier;
- boundary type;
- boundary status;
- source reasoning reference;
- applicable proposal identity;
- applicable candidate identities;
- deterministic reason code;
- provenance.

Boundary types may include:

- human review required;
- approval required;
- evidence unresolved;
- authority unresolved;
- governance escalation required;
- execution prohibited;
- temporal boundary;
- resource boundary;
- privacy boundary;
- legal boundary.

A proposal boundary is not a rejection.

---

# Governed Action Proposal Set

Produce exactly one canonical Governed Action Proposal Set for one coherent planning and reasoning graph.

The set shall contain:

- stable set identifier;
- source Executive Context identifier;
- source Executive Intent Set identifier;
- source Executive Constraint Set identifier;
- source Candidate Plan Set identifier;
- source Evaluated Candidate Plan Set identifier;
- source Candidate Plan Comparison Set identifier;
- source Executive Reasoning Record identifier;
- ordered Governed Action Proposals;
- count-only summary;
- active proposal-policy identities;
- proposal-definition identities;
- provenance.

The set shall not contain:

- approved proposal;
- selected proposal;
- selected candidate;
- execution instruction;
- action command;
- winner;
- aggregate score;
- final decision.

---

# Reason Codes

Every proposal, condition, authority requirement, question and boundary shall contain a deterministic typed reason code.

Reason codes shall be closed or registry-governed.

Examples:

```text
candidate-available-for-human-consideration
multiple-candidates-available-without-preference
proposal-conditions-present
proposal-blocked-by-explicit-boundary
proposal-unresolved-evidence
proposal-unresolved-authority
proposal-ready-for-human-review
human-arbitration-required
evidence-required-before-review
approval-required-before-execution
authority-confirmation-required
comparison-does-not-establish-preference
preserve-options-without-selection
defer-until-evidence-resolved
no-action-until-boundary-resolved
explicit-combination-authorised
explicit-combination-not-authorised
execution-boundary-not-crossed
```

Reason codes shall not encode hidden recommendation or approval.

---

# Initial Production Proposal Policies

Implement a deliberately bounded production policy set.

## Policy 1 — Single Candidate Consideration

May produce a `consider_candidate` proposal where:

- exactly one candidate is explicitly available for consideration;
- configured reasoning conditions are met;
- no explicit blocking boundary prevents human review.

The policy shall not call the candidate preferred or recommended.

---

## Policy 2 — Multiple Candidate Consideration

May produce a `consider_multiple_candidates` proposal where:

- two or more candidates remain available;
- no deterministic preference exists;
- the proposal preserves all included candidates without ranking.

---

## Policy 3 — Conditional Consideration

May produce a `propose_conditional_consideration` proposal where:

- one or more candidates remain available;
- explicit conditions must be met;
- conditions are represented canonically;
- human review remains required.

---

## Policy 4 — Evidence Resolution

May produce:

- `defer_pending_evidence`;
- `no_action_pending_resolution`;
- typed evidence conditions;
- typed evidence questions.

The policy shall not infer missing evidence from narrative absence alone.

---

## Policy 5 — Authority Confirmation

May produce:

- `request_authority_confirmation`;
- authority requirements;
- unresolved authority questions;
- governance boundaries.

The policy shall not grant authority.

---

## Policy 6 — Human Arbitration

May produce `request_human_arbitration` where:

- reasoning is indeterminate;
- canonical evidence conflicts;
- comparison cannot support a deterministic interpretation;
- governance authority must resolve a dispute.

The policy shall not resolve the dispute itself.

---

## Policy 7 — Preserve Options

May produce `preserve_options` where:

- multiple candidates remain valid for future consideration;
- reasoning does not establish a preference;
- reduction of the option set would be unsupported.

---

## Policy 8 — Explicit Combination Consideration

May produce `consider_explicit_combination` only where:

- a deterministic combination already exists as a canonical Candidate Plan or explicit combination definition;
- all source candidates are identified;
- the combination does not require narrative invention;
- explicit conditions and boundaries are preserved.

This policy shall not dynamically merge plans.

---

# Policy Scope Discipline

Do not create a universal proposal policy.

Do not create a generic recommendation engine.

Do not create an arbitrary expression evaluator.

Do not create hidden weights.

Do not count satisfied findings and call the highest candidate recommended.

Do not convert fewer violations into preference.

Do not treat readiness for human review as approval.

Do not treat a single candidate as automatically selected.

Do not treat preservation of options as indecision.

Do not create null approval fields for future use.

The absence of approval and execution fields is intentional.

---

# Proposal Process

The engine shall:

1. validate Executive Context;
2. validate Executive Intent Set;
3. validate Executive Constraint Set;
4. validate Candidate Plan Set;
5. validate Evaluated Candidate Plan Set;
6. validate Candidate Plan Comparison Set;
7. validate Executive Reasoning Record;
8. verify coherent source identities;
9. verify candidate preservation;
10. verify evaluation preservation;
11. verify comparison preservation;
12. verify reasoning-reference integrity;
13. validate proposal policies;
14. validate proposal definitions;
15. clone all policy inputs;
16. retrieve policies in deterministic order;
17. evaluate deterministic applicability;
18. construct proposals;
19. construct proposal conditions where authorised;
20. construct authority requirements where authorised;
21. construct proposal questions where authorised;
22. construct proposal boundaries where authorised;
23. validate every policy artefact atomically;
24. reject unsupported proposal kinds;
25. reject unsupported proposal scopes;
26. reject unsupported statuses;
27. reject malformed reason codes;
28. reject invalid candidate references;
29. reject invalid reasoning references;
30. reject duplicate proposal identities;
31. reject duplicate condition identities;
32. reject duplicate authority-requirement identities;
33. reject duplicate question identities;
34. reject duplicate boundary identities;
35. order proposals structurally;
36. construct count-only summary;
37. construct deterministic set identity;
38. deeply freeze canonical output;
39. validate final Governed Action Proposal Set;
40. return only after all validation succeeds.

Any failure shall abort the complete proposal operation.

No partial proposal set may be returned.

---

# Upstream Artefact Preservation

Governed Action Proposal shall not:

- mutate Executive Reasoning Record;
- mutate Candidate Plans;
- mutate Candidate Plan Evaluations;
- mutate Candidate Plan Comparisons;
- rewrite reasoning observations;
- rewrite reasoning questions;
- rewrite reasoning boundaries;
- convert unresolved into approved;
- convert blocked into rejected;
- alter upstream ordering;
- add proposal fields to upstream contracts.

Proposal artefacts shall reference upstream canonical identities.

They shall not replace upstream artefacts.

---

# Proposal Identity

Every proposal identity shall derive only from canonical structural inputs such as:

- source planning-graph identities;
- Executive Reasoning Record identity;
- proposal definition identifier and version;
- proposal policy identifier and version;
- proposal kind;
- proposal scope;
- proposal status;
- sorted Candidate Plan identifiers;
- sorted reasoning observation identifiers;
- sorted reasoning question identifiers;
- sorted reasoning boundary identifiers;
- sorted condition identities;
- sorted authority-requirement identities;
- sorted proposal-question identities;
- sorted proposal-boundary identities;
- compact canonical payload;
- reason code.

No identity may depend on:

- UUIDs;
- current clock time;
- random values;
- policy registration order;
- object insertion order;
- localised descriptions;
- runtime state;
- model outputs.

---

# Condition Identity

Each condition identity shall derive from:

- condition type;
- condition status;
- source canonical reference;
- sorted candidate identities;
- sorted required evidence references;
- sorted required authority references;
- proposal policy identity;
- reason code;
- source proposal identity components.

---

# Authority Requirement Identity

Each authority-requirement identity shall derive from:

- authority type;
- source governance reference;
- sorted candidate identities;
- requirement status;
- reason code;
- source proposal identity components.

---

# Proposal Question Identity

Each proposal-question identity shall derive from:

- proposal definition identity;
- proposal policy identity;
- reason code;
- sorted candidate identities;
- sorted required evidence references or types;
- required authority type or reference;
- source proposal identity components.

---

# Proposal Boundary Identity

Each proposal-boundary identity shall derive from:

- boundary type;
- boundary status;
- source reasoning reference;
- sorted candidate identities;
- reason code;
- source proposal identity components.

---

# Proposal Set Identity

The Governed Action Proposal Set identity shall derive from:

- Executive Context identifier;
- Executive Intent Set identifier;
- Executive Constraint Set identifier;
- Candidate Plan Set identifier;
- Evaluated Candidate Plan Set identifier;
- Candidate Plan Comparison Set identifier;
- Executive Reasoning Record identifier;
- sorted active proposal-policy identities;
- sorted proposal-definition identities;
- sorted proposal identities.

An empty proposal set shall still have a deterministic identity.

---

# Ordering

Proposals shall use deterministic structural ordering.

Recommended proposal order:

1. proposal scope;
2. proposal kind;
3. first Candidate Plan identifier where applicable;
4. proposal definition identifier;
5. proposal policy identifier;
6. proposal policy version;
7. proposal identifier.

Conditions shall be ordered by:

1. condition type;
2. source canonical reference;
3. first Candidate Plan identifier;
4. condition identifier.

Authority requirements shall be ordered by:

1. authority type;
2. source governance reference;
3. first Candidate Plan identifier;
4. authority-requirement identifier.

Questions shall be ordered by:

1. required authority or evidence type;
2. first Candidate Plan identifier;
3. proposal definition identifier;
4. question identifier.

Boundaries shall be ordered by:

1. boundary type;
2. source reasoning reference;
3. first Candidate Plan identifier;
4. boundary identifier.

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

The Governed Action Proposal Summary shall contain counts only.

At minimum:

- total proposals;
- proposals by kind;
- proposals by scope;
- proposals by status;
- proposals by policy;
- total conditions;
- conditions by type;
- total authority requirements;
- authority requirements by type;
- total proposal questions;
- questions by reason code;
- total proposal boundaries;
- boundaries by type;
- candidates referenced;
- proposals ready for human review;
- proposals blocked;
- proposals unresolved;
- proposals preserving multiple options;
- proposals requiring evidence;
- proposals requiring authority confirmation;
- proposals requiring human arbitration.

The summary shall not contain:

- score;
- rank;
- preference;
- winner;
- recommendation;
- approval;
- rejection;
- selected candidate;
- action command;
- confidence percentage;
- utility.

Counts shall be validated against canonical proposal contents.

---

# No Aggregate Decision

Sprint 3.23 shall not produce:

- final decision;
- approved proposal;
- rejected proposal;
- selected proposal;
- selected candidate;
- best option;
- aggregate score;
- utility score;
- risk score;
- feasibility score;
- recommendation;
- execution instruction.

Mixed proposal states shall remain visible.

Example:

```text
Proposal A:
- kind: consider_candidate
- status: draft
- candidate: Candidate A
- condition: approval required
- evidence: present
- authority: unresolved

Proposal B:
- kind: preserve_options
- status: ready_for_human_review
- candidates: Candidate A, Candidate B
- preference: absent
```

The proposal layer shall not collapse this into:

> Candidate A should proceed.

---

# Provenance

Every proposal shall preserve:

- source Executive Context identity;
- source Executive Intent Set identity;
- source Executive Constraint Set identity;
- source Candidate Plan Set identity;
- source Evaluated Candidate Plan Set identity;
- source Candidate Plan Comparison Set identity;
- source Executive Reasoning Record identity;
- relevant Candidate Plan identities;
- relevant evaluation identities;
- relevant comparison identities;
- relevant reasoning observation identities;
- relevant reasoning question identities;
- relevant reasoning boundary identities;
- proposal definition identity;
- proposal policy identity;
- canonical evidence references;
- canonical governance references;
- proposal status;
- reason code;
- configured origin.

Every condition, authority requirement, question and boundary shall preserve equivalent source provenance.

No downstream approval consumer should need to reconstruct why a proposal exists from explanatory prose.

---

# Validation Requirements

Implement validation for:

- proposal statuses;
- proposal kinds;
- proposal scopes;
- condition types;
- authority types;
- reason codes;
- proposal policy contracts;
- proposal policy metadata;
- proposal definitions;
- unique proposal-definition identifiers;
- source identity coherence;
- Candidate Plan preservation;
- Candidate Plan Evaluation preservation;
- Candidate Plan Comparison preservation;
- Executive Reasoning Record integrity;
- proposal identities;
- condition identities;
- authority-requirement identities;
- proposal-question identities;
- proposal-boundary identities;
- proposal-set identity;
- deterministic ordering;
- duplicate proposal rejection;
- duplicate condition rejection;
- duplicate authority-requirement rejection;
- duplicate question rejection;
- duplicate boundary rejection;
- summary consistency;
- JSON compatibility;
- defensive copying;
- recursive deep freezing;
- replay safety;
- atomic failure.

Validation shall not decide whether a proposal should be approved.

---

# JSON Compatibility

All canonical proposal outputs shall be JSON-compatible.

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

The proposal engine shall not retain mutable references to:

- Executive Context;
- Executive Intent Set;
- Executive Constraint Set;
- Candidate Plan Set;
- Evaluated Candidate Plan Set;
- Candidate Plan Comparison Set;
- Executive Reasoning Record;
- Candidate Plans;
- Candidate Plan Evaluations;
- comparison profiles;
- reasoning observations;
- reasoning questions;
- reasoning boundaries;
- proposal definitions;
- policy metadata;
- policy inputs;
- policy outputs before canonical validation.

Inputs supplied to policies shall be defensively cloned.

All proposals, conditions, authority requirements, questions, boundaries, summaries, provenance and proposal sets shall be recursively frozen before return.

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
- Executive Reasoning Record;
- proposal definitions;
- policy registrations;

the engine shall produce structurally identical:

- proposals;
- conditions;
- authority requirements;
- questions;
- boundaries;
- statuses;
- reason codes;
- identities;
- ordering;
- provenance;
- summaries;
- Governed Action Proposal Set.

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

The following shall cause complete proposal failure:

- malformed Executive Context;
- malformed Intent Set;
- malformed Constraint Set;
- malformed Candidate Plan Set;
- malformed Evaluated Candidate Plan Set;
- malformed Candidate Plan Comparison Set;
- malformed Executive Reasoning Record;
- source identity mismatch;
- Candidate Plan mutation detected;
- Candidate Plan Evaluation mutation detected;
- comparison-profile mismatch;
- reasoning-reference mismatch;
- malformed proposal policy;
- duplicate policy identifier;
- malformed proposal definition;
- duplicate proposal-definition identifier;
- policy exception;
- malformed applicability result;
- malformed proposal;
- malformed condition;
- malformed authority requirement;
- malformed proposal question;
- malformed proposal boundary;
- unsupported proposal kind;
- unsupported proposal scope;
- unsupported status;
- invalid reason code;
- invalid identity;
- duplicate proposal;
- duplicate condition;
- duplicate authority requirement;
- duplicate question;
- duplicate boundary;
- invalid ordering;
- invalid summary;
- unresolved mandatory canonical reference;
- JSON incompatibility.

No partial Governed Action Proposal Set may be returned.

---

# Empty Candidate Set Semantics

A coherent empty Candidate Plan Set, empty Evaluated Candidate Plan Set, empty Candidate Plan Comparison Set and valid Executive Reasoning Record shall produce a valid immutable Governed Action Proposal Set containing:

- coherent source identities;
- zero candidate-consideration proposals unless explicitly authorised by a planning-set definition;
- optional `no_action_pending_resolution` proposal;
- no synthetic candidate;
- no fallback recommendation;
- no selected null candidate;
- deterministic set identity;
- zero-valued count-only summary except for authorised planning-set proposals;
- active proposal-policy provenance;
- proposal-definition provenance.

---

# Single-Candidate Semantics

A graph containing one candidate may produce:

- `consider_candidate`;
- `propose_conditional_consideration`;
- `defer_pending_evidence`;
- `request_authority_confirmation`;
- `request_human_arbitration`;
- `no_action_pending_resolution`;
- no synthetic comparator;
- no ranking;
- no automatic selection;
- no approval.

The absence of another candidate shall not itself create preference.

---

# Zero-Proposal Semantics

A coherent graph with no applicable proposal definitions shall produce a valid Governed Action Proposal Set containing:

- coherent source identities;
- empty proposal collection;
- zero-valued summary;
- deterministic identity;
- policy provenance;
- definition provenance.

Zero proposals shall not mean:

- approved;
- rejected;
- no action authorised;
- ready for execution;
- no human review required.

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
↓
Governed Action Proposal
```

The integration test shall demonstrate:

- Calendar prose does not independently create a proposal;
- explicit Objectives exist;
- explicit Constraints exist;
- at least two Candidate Plans are constructed;
- both are evaluated;
- both are compared;
- an Executive Reasoning Record is produced;
- explicit proposal definitions determine permitted proposals;
- one proposal preserving multiple candidates without preference is produced;
- one conditional or unresolved proposal is produced;
- one authority requirement, evidence condition, question, or boundary is produced;
- no approval occurs;
- no rejection occurs;
- no execution occurs;
- no Calendar event is created;
- no notification is sent;
- no specialist is invoked;
- source artefacts remain unchanged;
- proposal-set identity remains stable across replay.

Also test:

- empty candidate graph;
- single-candidate graph;
- zero applicable proposal definitions;
- Calendar narrative changes that do not alter canonical typed inputs do not alter proposal output.

---

# Package Conformance

The proposal package may depend only on:

- Executive Context public contracts;
- Executive Intent & Constraint public contracts;
- Candidate Plan public contracts;
- Candidate Plan Evaluation public contracts;
- Candidate Plan Comparison public contracts;
- Executive Reasoning public contracts;
- local Governed Action Proposal contracts;
- canonical shared validation utilities;
- canonical identity utilities where already established.

Production proposal code shall not depend on:

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
- Executive Reasoning internal implementation files;
- future approval packages;
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

No upstream package shall become aware of Governed Action Proposal.

In particular:

- Connectors shall not import proposal;
- Projection shall not import proposal;
- Situational Awareness shall not import proposal;
- Snapshot Lifecycle shall not import proposal;
- Attention shall not import proposal;
- Situation Formation shall not import proposal;
- Assessment shall not import proposal;
- Executive Context shall not import proposal;
- Intent & Constraint shall not import proposal;
- Candidate Plan Construction shall not import proposal;
- Candidate Plan Constraint Evaluation shall not import proposal;
- Candidate Plan Comparative Analysis shall not import proposal;
- Executive Reasoning shall not import proposal.

Proposal is strictly downstream of reasoning.

Do not add proposal fields to upstream contracts for convenience.

---

# Public Exports

Expose public proposal contracts only through:

```text
lib/executive-operating-system/proposal/index.ts
```

Export only:

- approved public types;
- approved production policies;
- registry interfaces;
- proposal engine interfaces;
- canonical Governed Action Proposal artefacts required by the future human approval layer.

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

- coherent full planning and reasoning graph succeeds;
- mismatched Context identity fails;
- mismatched Intent Set identity fails;
- mismatched Constraint Set identity fails;
- mismatched Candidate Plan Set identity fails;
- mismatched Evaluated Candidate Plan Set identity fails;
- mismatched Candidate Plan Comparison Set identity fails;
- mismatched Executive Reasoning Record identity fails;
- invalid candidate reference fails;
- invalid reasoning observation reference fails;
- invalid reasoning question reference fails;
- invalid reasoning boundary reference fails;
- malformed proposal definition fails;
- duplicate proposal-definition identifier fails.

## Minimal Set Shape

- exactly one Governed Action Proposal Set is produced;
- upstream artefacts are referenced by identity;
- complete upstream objects are not duplicated;
- no approval or execution artefacts exist;
- zero-proposal set is valid.

## Single Candidate Consideration

- explicit candidate availability can produce a proposal;
- proposal status is deterministic;
- required conditions are preserved;
- no recommendation exists;
- no approval exists.

## Multiple Candidate Consideration

- multiple candidates can be proposed together;
- source ordering does not create rank;
- candidates remain unranked;
- difference does not create preference;
- no winner exists.

## Conditional Consideration

- evidence condition is attached;
- approval condition is attached;
- dependency condition is attached;
- unresolved condition preserves draft or unresolved status;
- condition does not become execution instruction.

## Evidence Resolution

- missing evidence produces deferment or no-action proposal where authorised;
- present evidence does not automatically approve;
- conflicting evidence produces unresolved or arbitration proposal;
- narrative length does not affect outcome.

## Authority Confirmation

- explicit authority requirement is surfaced;
- missing authority produces unresolved proposal;
- authority is not inferred from names or titles;
- no authority is granted.

## Human Arbitration

- conflicting canonical evidence can produce arbitration proposal;
- indeterminate comparison can produce arbitration proposal;
- arbitration proposal does not resolve the conflict;
- no preferred candidate is created.

## Preserve Options

- multiple candidates may remain preserved;
- no candidate is ranked;
- no candidate is selected;
- option preservation is deterministic.

## Explicit Combination

- existing explicit combination may be proposed;
- absent combination definition prevents combination proposal;
- plans are not dynamically merged;
- combination proposal remains subject to human review.

## Conditions, Questions and Boundaries

- evidence condition is typed;
- approval condition is typed;
- authority requirement is typed;
- proposal question is typed;
- proposal boundary is typed;
- duplicate conditions fail;
- duplicate authority requirements fail;
- duplicate questions fail;
- duplicate boundaries fail.

## Identities

- proposal identity is stable;
- condition identity is stable;
- authority-requirement identity is stable;
- question identity is stable;
- boundary identity is stable;
- proposal-set identity is stable;
- policy registration order does not change identity;
- definition order does not change identity;
- candidate-reference order does not change identity;
- generated time and randomness are absent.

## Ordering

- proposals are structurally ordered;
- conditions are structurally ordered;
- authority requirements are structurally ordered;
- questions are structurally ordered;
- boundaries are structurally ordered;
- statuses do not control ordering;
- candidates are not reordered by merit;
- locale does not affect ordering.

## Summaries

- counts by kind are correct;
- counts by scope are correct;
- counts by status are correct;
- counts by policy are correct;
- condition counts are correct;
- authority requirement counts are correct;
- question counts are correct;
- boundary counts are correct;
- malformed summaries fail;
- summaries contain no score, rank, recommendation or approval.

## Immutability

- policy inputs are cloned;
- policy cannot mutate reasoning;
- policy cannot mutate Candidate Plans;
- policy cannot mutate Evaluations;
- policy cannot mutate Comparisons;
- returned proposals are deeply frozen;
- returned conditions are deeply frozen;
- returned authority requirements are deeply frozen;
- returned questions are deeply frozen;
- returned boundaries are deeply frozen;
- returned proposal set is deeply frozen.

## Replay Safety

- repeated proposal construction produces structural equality;
- equivalent registration order produces structural equality;
- equivalent definition order produces structural equality;
- equivalent reference order produces structural equality.

## Atomic Failure

- policy exception aborts proposal construction;
- malformed proposal aborts;
- malformed condition aborts;
- malformed authority requirement aborts;
- malformed question aborts;
- malformed boundary aborts;
- duplicate proposal aborts;
- duplicate condition aborts;
- duplicate authority requirement aborts;
- duplicate question aborts;
- duplicate boundary aborts;
- invalid identity aborts;
- unsupported status aborts;
- malformed reason code aborts;
- no partial proposal set is returned.

## Semantics

- no aggregate score exists;
- no ranking exists;
- no preferred status exists;
- no recommendation exists;
- no approval exists;
- no rejection exists;
- no selected candidate exists;
- no execution instruction exists;
- ready for human review does not mean approved;
- blocked does not mean rejected;
- draft does not mean inferior;
- consider candidate does not mean recommend candidate;
- preserve options does not mean indecision.

## Integration

- complete Calendar-to-Proposal path;
- at least two candidates are represented;
- one preserve-options or multiple-candidate proposal;
- one unresolved or conditional proposal;
- one authority requirement, evidence condition, question, or boundary;
- source graph remains unchanged;
- replay is stable;
- empty graph is valid;
- single-candidate graph is valid;
- Calendar prose alone does not affect proposal output.

## Package Boundaries

- production imports remain within approved packages;
- Candidate Plan Construction does not import proposal;
- Evaluation does not import proposal;
- Comparison does not import proposal;
- Reasoning does not import proposal;
- upstream packages do not import proposal;
- approval, execution, runtime, UI, API, specialist and provider imports are prohibited.

---

# Repository Validation

Run all repository-required validation commands.

At minimum:

```bash
npx vitest run lib/executive-operating-system/proposal
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
Governed Action Proposal
↓
Governed Action Proposal Set
↓
Future Human Approval
↓
Future Authorised Execution
```

Document clearly that Governed Action Proposals are:

- explicit;
- deterministic;
- reviewable;
- provenance-preserving;
- conditional where required;
- authority-aware;
- evidence-aware;
- unweighted;
- unscored;
- unranked;
- unapproved;
- non-executable;
- inert until human review;
- incapable of crossing the execution boundary.

Document that a proposal is not a recommendation.

Document that ready for human review is not approval.

Document that blocked is not rejection.

Document that candidate inclusion is not selection.

---

# ADR

Create:

```text
docs/architecture/ADR-0018-Governed-Action-Proposal.md
```

Title:

# ADR-0018 — Governed Action Proposal

The ADR shall document:

- architectural purpose;
- position downstream of Executive Reasoning;
- position upstream of human approval;
- proposal-versus-recommendation distinction;
- proposal-versus-approval distinction;
- proposal-versus-execution distinction;
- minimal public contract strategy;
- one-set canonical output;
- proposal-status vocabulary;
- proposal-kind vocabulary;
- proposal-scope vocabulary;
- explicit proposal-definition requirement;
- proposal-policy model;
- reason-code strategy;
- proposal model;
- condition model;
- authority-requirement model;
- proposal-question model;
- proposal-boundary model;
- preservation of multiple candidates;
- treatment of single-candidate proposals;
- treatment of evidence deferment;
- treatment of unresolved authority;
- treatment of indeterminate reasoning;
- explicit combination semantics;
- prohibition on dynamic plan merging;
- prohibition on ranking;
- prohibition on scoring;
- prohibition on recommendation;
- prohibition on approval;
- prohibition on execution;
- proposal identity;
- condition identity;
- authority-requirement identity;
- question identity;
- boundary identity;
- proposal-set identity;
- deterministic ordering;
- count-only summaries;
- provenance requirements;
- immutable and replay-safe outputs;
- zero-proposal semantics;
- single-candidate semantics;
- empty-set semantics;
- atomic failure;
- future human approval boundary;
- future execution boundary;
- non-goals;
- rejected alternatives.

Rejected alternatives shall include:

- LLM-generated proposals;
- semantic interpretation of descriptions;
- implicit preference;
- ranking candidates;
- scoring candidates;
- recommending a candidate;
- automatically selecting a candidate;
- granting approval;
- rejecting proposals;
- executing proposals;
- merging candidates dynamically;
- inferring authority from titles;
- treating readiness for review as approval;
- treating blocked as rejection;
- treating a single candidate as selected;
- permitting proposal policies to perform side effects;
- combining proposal and approval in one layer;
- combining proposal and execution in one layer.

---

# Explicit Non-Goals

Sprint 3.23 shall not introduce:

- human approval workflow;
- approval record;
- rejection record;
- selected proposal;
- selected candidate;
- final decision;
- execution;
- action commands;
- scheduling;
- task creation;
- notifications;
- specialist routing;
- specialist invocation;
- LLM proposal generation;
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
- Executive Reasoning mutation;
- scores;
- ranks;
- weights;
- utility functions;
- optimisation;
- hidden preference;
- recommendation;
- approval;
- rejection;
- dynamic candidate combination.

---

# Acceptance Criteria

Sprint 3.23 is complete only when:

- immutable proposal contracts are implemented;
- the closed proposal-status vocabulary is implemented;
- the closed proposal-kind vocabulary is implemented;
- the closed proposal-scope vocabulary is implemented;
- condition types are implemented;
- authority types are implemented;
- deterministic reason codes are implemented;
- deterministic proposal-policy contracts are implemented;
- deterministic proposal registry is implemented;
- duplicate policies fail explicitly;
- explicit proposal definitions are implemented;
- deterministic proposal engine is implemented;
- bounded production proposal policies are implemented;
- one canonical Governed Action Proposal Set is produced;
- upstream artefacts are referenced rather than duplicated;
- source Candidate Plans remain unchanged;
- source Evaluations remain unchanged;
- source Comparisons remain unchanged;
- source Executive Reasoning Record remains unchanged;
- single-candidate proposals are supported;
- multiple-candidate proposals are supported;
- conditional proposals are supported;
- deferment proposals are supported;
- authority-confirmation proposals are supported;
- human-arbitration proposals are supported;
- preserve-options proposals are supported;
- explicit-combination proposals are bounded;
- proposal conditions are supported;
- authority requirements are supported;
- proposal questions are supported;
- proposal boundaries are supported;
- no aggregate conclusion exists;
- no score exists;
- no ranking exists;
- no preference exists;
- no recommendation exists;
- no selection exists;
- no approval exists;
- no rejection exists;
- no execution exists;
- deterministic proposal identities are implemented;
- deterministic condition identities are implemented;
- deterministic authority-requirement identities are implemented;
- deterministic question identities are implemented;
- deterministic boundary identities are implemented;
- deterministic proposal-set identity is implemented;
- structural ordering is implemented;
- count-only summaries are implemented;
- zero-proposal sets are supported;
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
- ADR-0018 is completed.

---

# Recommended Pull Request Scope

Prefer one bounded pull request unless repository constraints require a split.

Suggested pull-request title:

```text
Sprint 3.23: Add Governed Action Proposal
```

Suggested commit title:

```text
feat(eos): add governed action proposal
```

Do not include:

- human approval;
- approval record;
- recommendation;
- selection;
- execution.

---

# Completion Report

Provide the completion report using the established repository structure.

## Summary

Describe:

- proposal contracts;
- status, kind and scope vocabularies;
- proposal definitions;
- registry;
- engine;
- production policies;
- proposal set;
- proposals;
- conditions;
- authority requirements;
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

- proposal consumes one coherent canonical planning and reasoning graph;
- upstream artefacts are referenced rather than duplicated;
- source Candidate Plans remain unchanged;
- source Candidate Plan Evaluations remain unchanged;
- source Candidate Plan Comparisons remain unchanged;
- source Executive Reasoning Record remains unchanged;
- proposals rely only on typed canonical values;
- descriptions and Calendar prose are not interpreted;
- candidate inclusion does not become recommendation;
- ready for human review does not become approval;
- blocked does not become rejection;
- proposal remains separate from approval;
- approval remains separate from execution;
- no scoring, ranking, recommendation, selection, approval, rejection or execution exists;
- upstream boundaries remain preserved.

## Key Decisions

Report:

- package placement;
- minimal public contract surface;
- one-set output model;
- proposal-status vocabulary;
- proposal-kind vocabulary;
- proposal-scope vocabulary;
- proposal-definition model;
- proposal-policy model;
- reason-code model;
- proposal model;
- condition model;
- authority-requirement model;
- proposal-question model;
- proposal-boundary model;
- treatment of missing evidence;
- treatment of conflicting evidence;
- treatment of unresolved authority;
- preservation-of-options semantics;
- explicit-combination semantics;
- proposal identity;
- condition identity;
- authority-requirement identity;
- question identity;
- boundary identity;
- proposal-set identity;
- zero-proposal behaviour;
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

- human approval workflow;
- approval records;
- rejection records;
- selected proposals;
- selected candidates;
- authorised execution;
- runtime orchestration;
- specialist invocation;
- persistence;
- APIs;
- UI;
- LLM integration.

---

# Final Architectural Constraint

Governed Action Proposal ends with one immutable, deterministic, provenance-preserving Governed Action Proposal Set.

A proposal is not a recommendation.

A proposal ready for human review is not approved.

A blocked proposal is not rejected.

A candidate included in a proposal is not selected.

A condition is not an execution command.

An authority requirement is not authority granted.

A proposal question is not a decision.

A proposal boundary is not execution.

A proposal set cannot cross the human approval boundary.

This sprint shall formulate explicit reviewable proposals from bounded Executive Reasoning while preserving multiple options, explicit conditions, unresolved questions, governance boundaries and human authority.

Its sole responsibility is to answer:

> What bounded proposal may be placed before an authorised human for consideration, without recommending, selecting, approving, rejecting or executing an action?
