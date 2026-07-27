# JARVIS Engineering

This instruction defines Sprint 3.14 for the JARVIS repository.

JARVIS is being built according to the following architectural hierarchy:

1. Engineering Constitution
2. North Star
3. JARVIS Engineering Specification Standard (JESS)
4. Sprint Specifications
5. Behavioural Constitutions
6. Architecture Decision Records
7. Compliance and Validation
8. Executive Operating System
9. Runtime

Higher layers govern lower layers.

No sprint may redefine behaviour, authority, architectural boundaries or quality requirements established by a higher layer.

The runtime consumes the constitutional and architectural layers. It does not redefine them.

Where this sprint specification conflicts with the Engineering Constitution, North Star, JESS, an accepted ADR or an established canonical contract:

1. stop implementation;
2. identify the conflict explicitly;
3. report the affected requirement;
4. propose the smallest compliant resolution;
5. do not silently reinterpret the higher-order document.

---

# Mandatory Engineering Principles

The following principles are mandatory throughout Sprint 3.14:

- architecture before implementation
- deterministic before adaptive
- typed before dynamic
- validation before enforcement
- observation before interpretation
- attention before planning
- behaviour before orchestration
- explicit policy before embedded judgement
- provenance before assertion
- explanation before elevation
- immutable canonical outputs
- explicit failure before silent repair
- provider independence
- runtime consumes architecture
- backward compatibility unless intentionally changed
- small, independently reviewable pull requests
- tests verify architectural properties, not merely code coverage

Do not redesign stable architecture unless there is a demonstrable architectural defect.

Do not introduce stochastic behaviour merely because the new layer is called “attention”.

---

# Current Repository Status

The following foundations are complete, merged, validated and considered stable.

## Constitutional and Governance Layer

- Engineering Constitution
- North Star
- JESS
- Behavioural Constitutions
- Architecture Decision Record process
- engineering validation workflow
- remediation workflow
- package-boundary conformance testing

## Agent and Execution Layer

- specialist registry
- behavioural constitutions
- capability matrix
- collaboration graph
- router
- coordinator
- execution planner
- execution API
- execution audit
- execution audit persistence

These existing execution capabilities must not be invoked, extended or coupled to the new attention layer in this sprint.

## Executive Operating System

- Operational State
- canonical Situational Awareness model
- immutable canonical construction
- deterministic validation
- defensive copying
- replay safety
- provider-independent canonical state

## Projection Infrastructure

- ProjectionArtifact
- ProjectionAdapter contract
- ProjectionRegistry
- ProjectionEngine
- deterministic merge
- deterministic conflict rejection
- stable collection ordering
- exactly-once Situational Awareness construction
- construction-boundary tests
- package-boundary conformance tests

## Production Projection Adapters

Sprint 3.12 introduced:

- CalendarProjectionAdapter
- deterministic event-to-commitment mapping
- calendar-qualified stable identifiers
- recurrence-instance identity
- cancellation handling
- duplicate detection
- provenance
- availability
- registry integration
- canonical ProjectionEngine integration

ADR-0007 governs:

```text
Connector
    ↓
Projection Adapter
    ↓
ProjectionArtifact
    ↓
ProjectionEngine
    ↓
SituationalAwareness
```

## Snapshot Lifecycle

Sprint 3.13 introduced:

- typed Situational Awareness snapshot contracts
- explicit snapshot identity
- explicit RFC 3339 observation time
- canonical snapshot construction
- deterministic structural equality
- chronology validation
- provider-independent comparison
- added, removed and modified change classification
- unchanged counts
- deterministic code-unit ordering
- defensive copying
- deeply frozen change sets
- JSON replay safety
- Calendar integration proof
- package-boundary conformance tests

ADR-0008 governs:

```text
SituationalAwareness snapshot A
        +
SituationalAwareness snapshot B
        ↓
Deterministic Change Set
```

The current verified baseline is:

- 31 test files passing
- 232 tests passing
- lint passing
- TypeScript passing
- production build passing
- clean working tree

Treat this baseline as stable.

---

# Sprint 3.14 — Executive Attention Layer

## Sprint Intent

The Observation Layer is now structurally complete.

JARVIS can:

1. receive external observations;
2. translate them through bounded Projection Adapters;
3. construct canonical Situational Awareness;
4. create explicit snapshots;
5. determine what canonically changed between snapshots.

Sprint 3.14 begins the first bounded selective layer above observation.

The purpose of this sprint is to introduce the **Executive Attention Layer**.

The Executive Attention Layer consumes deterministic change sets and applies explicit, typed and deterministic attention policies to determine which changes qualify for elevation into a bounded attention queue.

It must not infer importance through an LLM.

It must not decide what the user should do.

It must not create a plan.

It must not trigger execution.

It must not silently rank arbitrary observations using opaque judgement.

It must answer only:

> Which canonical changes satisfy an explicit attention policy, and why?

---

# Relationship to the North Star

The North Star requires JARVIS to support a coherent, trustworthy and inspectable executive operating environment.

Observation alone is insufficient.

A real executive environment contains more information than should be presented at once.

The system therefore requires an explicit boundary between:

```text
Everything that changed
```

and:

```text
The subset that satisfies governed criteria for attention
```

This sprint advances the North Star by making that selection:

- explicit
- deterministic
- attributable
- inspectable
- replayable
- policy-governed
- provider-independent

The intended architecture is:

```text
External observations
        ↓
Projection Adapters
        ↓
ProjectionArtifacts
        ↓
ProjectionEngine
        ↓
SituationalAwareness
        ↓
Snapshot Lifecycle
        ↓
Deterministic Change Set
        ↓
Executive Attention Layer
        ↓
Attention Queue
        ↓
Future interpretation, planning and authorised action
```

The Executive Attention Layer is not a reasoning engine.

It is a governed selection mechanism.

---

# Sprint Objective

Implement a deterministic, immutable and provider-independent Executive Attention Layer that:

- consumes a canonical SituationalAwarenessChangeSet;
- evaluates registered deterministic Attention Policies;
- produces zero or more explicit Attention Records;
- preserves the relationship to the originating canonical change;
- records which policy matched;
- records why the change was elevated;
- produces a stable, validated and replay-safe Attention Queue;
- resolves duplicate policy matches deterministically;
- remains independent of connectors and projection adapters;
- remains independent of LLMs;
- remains independent of planning;
- remains independent of runtime orchestration;
- remains independent of execution.

The core operation should conceptually resemble:

```text
SituationalAwarenessChangeSet
        +
AttentionPolicyRegistry
        ↓
ExecutiveAttentionEngine
        ↓
ExecutiveAttentionQueue
```

---

# Naming

Use terminology consistent with the existing repository.

Preferred architectural names:

- `AttentionPolicy`
- `AttentionPolicyRegistry`
- `ExecutiveAttentionEngine`
- `AttentionRecord`
- `ExecutiveAttentionQueue`

Codex may use a more repository-consistent naming variation if required, but must preserve the conceptual distinction between:

- policies;
- registry;
- evaluation engine;
- attention records;
- queue.

Do not call a policy an “agent”.

Do not call the engine a “reasoner”.

Do not call an attention result a “decision”.

Do not call the queue a “plan”.

---

# Architectural Position

The Executive Attention Layer belongs inside the Executive Operating System.

It sits after deterministic snapshot comparison and before any future interpretation or planning layer.

```text
SituationalAwarenessChangeSet
        ↓
Executive Attention Layer
        ↓
ExecutiveAttentionQueue
```

The layer must consume only canonical lifecycle outputs.

It must not:

- query connectors;
- invoke Projection Adapters;
- construct ProjectionArtifacts;
- construct SituationalAwareness;
- compare snapshots;
- query a database;
- inspect raw Google Calendar payloads;
- invoke specialist agents;
- invoke the coordinator;
- invoke the execution planner;
- call tools;
- perform runtime scheduling.

---

# Core Separation of Responsibilities

## Snapshot Lifecycle

Determines:

> What canonically changed?

## Attention Policy

Defines:

> Which explicit characteristics qualify a canonical change for attention?

## Attention Policy Registry

Defines:

> Which approved policies are available for evaluation, in what deterministic order?

## Executive Attention Engine

Determines:

> Which registered policies match each canonical change?

## Executive Attention Queue

Represents:

> Which changes were elevated, under which policies, and for which explicit reasons?

## Future Interpretation Layer

May later determine:

> What does this change mean in context?

## Future Planning Layer

May later determine:

> What options or actions should be considered?

## Future Execution Layer

May later determine:

> Which authorised action should be performed?

Sprint 3.14 must implement only the policy, registry, engine and queue boundary.

---

# Scope

Sprint 3.14 may implement:

- typed Attention Policy contracts;
- deterministic policy evaluation;
- policy metadata;
- policy registry;
- registry validation;
- a small initial production policy set;
- attention reason contracts;
- attention record contracts;
- attention queue contracts;
- deterministic queue construction;
- duplicate-match handling;
- stable ordering;
- explicit validation;
- immutable outputs;
- replay-safe JSON-compatible outputs;
- lifecycle integration tests;
- Calendar-derived integration proof;
- package-boundary conformance tests;
- public API exports;
- architecture documentation;
- ADR-0009.

Sprint 3.14 must not implement:

- LLM-based salience;
- semantic classification;
- arbitrary importance scoring;
- machine-learned ranking;
- natural-language summarisation;
- personal preference learning;
- planning;
- recommendations;
- task generation;
- notifications;
- alerts;
- DAWNWATCH briefing generation;
- specialist handoff;
- runtime orchestration;
- persistence;
- historical analytics;
- UI;
- API routes;
- autonomous action.

---

# Recommended Delivery Strategy

Prefer small, independently reviewable pull requests.

## PR1 — Attention Contracts, Registry and ADR

Implement:

- policy contract;
- policy metadata;
- registry;
- attention reason type;
- attention record type;
- attention queue type;
- validation rules;
- public package boundary;
- ADR-0009;
- architecture documentation updates.

No runtime integration.

No planning.

No LLMs.

## PR2 — Executive Attention Engine

Implement:

- deterministic policy evaluation;
- canonical change traversal;
- match collection;
- duplicate-match handling;
- stable queue ordering;
- summary counts;
- defensive copying;
- deep freezing;
- focused unit tests.

## PR3 — Initial Policies and Lifecycle Integration Proof

Implement the smallest justified policy set and demonstrate:

```text
Calendar observations A and B
        ↓
Calendar Projection Adapter
        ↓
ProjectionEngine
        ↓
Snapshots
        ↓
Change Set
        ↓
Executive Attention Layer
        ↓
Attention Queue
```

Codex may combine PR2 and PR3 if the result remains small, coherent and reviewable.

Do not combine unrelated future capabilities.

---

# Executive Attention Definition

Within Sprint 3.14, attention means:

> A canonical change that satisfies one or more explicit deterministic policies and is therefore selected for downstream inspection.

Attention does not mean:

- important in an absolute sense;
- urgent;
- risky;
- recommended;
- actionable;
- requiring notification;
- requiring intervention;
- requiring execution;
- preferred by the user;
- semantically significant.

An Attention Record represents a policy match, not an executive judgement.

---

# Attention Policy Contract

Introduce a typed deterministic policy contract.

A conceptual form is:

```ts
interface AttentionPolicy {
  readonly id: string;
  readonly version: string;
  readonly description: string;
  readonly appliesTo: readonly AttentionChangeDomain[];

  evaluate(
    change: CanonicalAttentionChange,
    context: AttentionEvaluationContext
  ): AttentionPolicyResult;
}
```

The exact shape must follow repository conventions and JESS.

A policy should be:

- explicit;
- immutable;
- deterministic;
- side-effect free;
- synchronous unless the current architecture strongly requires otherwise;
- JSON-describable through metadata;
- independent of connectors;
- independent of runtime state;
- independent of the system clock;
- independent of external services.

A policy must not:

- mutate input;
- access environment variables;
- query persistence;
- perform network requests;
- invoke LLMs;
- read user interface state;
- call another engine;
- trigger execution;
- depend on policy registration order unless explicitly governed.

---

# Policy Identity

Every policy must have:

- a stable non-empty identifier;
- an explicit version;
- a human-readable description;
- an explicit supported change domain or domains.

Policy identifiers must be stable across runs.

Do not generate policy identifiers dynamically.

Suggested convention:

```text
attention.commitment.cancelled
attention.commitment.time-changed
attention.source.unavailable
```

Follow existing naming conventions if the repository establishes another pattern.

Policy version must be explicit.

A simple version such as:

```text
1
```

or:

```text
1.0.0
```

is acceptable if consistent with repository conventions.

Do not build migration infrastructure in this sprint.

---

# Policy Metadata

Policy metadata should be inspectable without executing the policy.

A likely contract may include:

```ts
interface AttentionPolicyMetadata {
  readonly id: string;
  readonly version: string;
  readonly description: string;
  readonly appliesTo: readonly AttentionChangeDomain[];
}
```

Optional metadata should be added only when justified.

Do not introduce speculative fields such as:

- owner;
- organisation;
- risk tier;
- confidence;
- machine-learning model;
- escalation team;
- notification channel.

---

# Policy Evaluation Result

A policy evaluation must produce an explicit result.

Conceptually:

```ts
type AttentionPolicyResult =
  | {
      readonly matched: false;
    }
  | {
      readonly matched: true;
      readonly reason: AttentionReason;
    };
```

The result must not depend on exceptions for normal non-matching behaviour.

A non-match is a valid result.

Exceptions should be reserved for malformed input, invalid policy construction or broken invariants.

---

# Attention Reason

Every matched policy must produce a structured reason.

The reason must explain the deterministic basis of elevation.

A conceptual structure:

```ts
interface AttentionReason {
  readonly code: string;
  readonly message: string;
  readonly evidence: readonly AttentionEvidence[];
}
```

The precise structure must remain bounded and JSON-compatible.

The reason should include:

- stable reason code;
- concise human-readable explanation;
- explicit canonical evidence from the change where useful.

Examples:

```text
commitment.status.changed-to-cancelled
commitment.start-time.changed
source.availability.changed-to-unavailable
```

The reason must not include inferred claims.

Bad:

```text
This is probably urgent.
```

Good:

```text
The commitment status changed from scheduled to cancelled.
```

Bad:

```text
This cancellation will disrupt the user’s day.
```

Good:

```text
A previously scheduled commitment is now absent or cancelled according to the canonical record.
```

Prefer evidence that references canonical fields rather than restating whole records.

---

# Canonical Attention Change Input

The engine must evaluate canonical lifecycle changes.

Do not require policies to understand the complete change-set container if they only evaluate one change at a time.

Introduce a typed internal or public representation that preserves:

- canonical domain;
- change type;
- stable entity identifier where applicable;
- previous value where applicable;
- current value where applicable;
- originating previous snapshot identifier;
- originating current snapshot identifier.

A conceptual form:

```ts
interface CanonicalAttentionChange<T> {
  readonly domain: AttentionChangeDomain;
  readonly changeType: "added" | "removed" | "modified";
  readonly entityId?: string;
  readonly previous?: T;
  readonly current?: T;
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
}
```

Avoid using `unknown` broadly where the canonical domain can be typed explicitly.

Prefer discriminated unions for supported domains.

---

# Supported Change Domains

The attention architecture should be capable of representing every canonical Situational Awareness change domain.

Use the actual model names.

Likely domains include:

- identity;
- context;
- roles;
- projects;
- commitments;
- waiting items;
- priorities;
- active work;
- sources.

Do not introduce policies for all domains merely to demonstrate coverage.

The engine must traverse all supported domains correctly, but the initial policy set may remain narrow.

---

# Initial Production Policy Set

Implement the smallest useful deterministic set.

The initial set should primarily prove the architecture using calendar-derived commitments and canonical source availability.

Recommended policies follow.

## Policy 1 — Commitment Cancellation

Elevate a commitment when its canonical status changes from a non-cancelled state to a cancelled state.

This must be based only on an explicit canonical status field.

Do not infer cancellation from title text.

Do not infer cancellation solely from removal unless the canonical model explicitly establishes removal as cancellation.

Possible reason:

```text
A commitment changed from scheduled to cancelled.
```

## Policy 2 — Commitment Start-Time Change

Elevate a commitment when the stable identifier remains the same and the canonical start timestamp changes.

Possible reason:

```text
The commitment start time changed from <previous> to <current>.
```

Do not label this as “rescheduled” unless the canonical model supports that exact statement.

A changed start time may be described as:

```text
start time changed
```

## Policy 3 — Commitment Removal

Elevate a commitment that was present previously and is absent currently.

The reason must preserve bounded absence semantics.

Possible reason:

```text
The commitment was present in the previous snapshot and is absent from the current snapshot.
```

Do not call it:

- deleted;
- cancelled;
- completed;
- resolved.

## Policy 4 — Source Became Unavailable

Elevate a source when canonical availability changes from available to unavailable.

Use the actual source availability vocabulary.

Possible reason:

```text
The source availability changed from available to unavailable.
```

Do not infer an outage or connector failure.

## Optional Policy 5 — New Commitment

A new commitment may be elevated if useful for proving added-change behaviour.

However, avoid flooding the queue.

If included, document that the policy deterministically selects all newly observed commitments.

Do not classify them as important.

The preferred initial policy set is Policies 1–4.

Do not add policy proliferation in this sprint.

---

# Policy Registry

Introduce an `AttentionPolicyRegistry` or equivalent.

The registry must:

- accept valid policies;
- expose policies deterministically;
- reject duplicate policy identifiers and versions according to a documented rule;
- prevent mutation after canonical construction or registration boundary;
- preserve stable policy ordering;
- remain independent of connectors and runtime.

A likely rule is:

```text
Policy identity = policy id + policy version
```

Decide explicitly whether two versions of the same policy may coexist.

Recommended Sprint 3.14 rule:

- reject duplicate `id`;
- allow only one active version of a policy in one registry;
- require the caller to construct a different registry to use another version.

This is simpler and avoids ambiguous multiple evaluation.

Document the decision in ADR-0009.

---

# Registry Ordering

Policy evaluation ordering must be deterministic.

Preferred order:

1. policy identifier using locale-independent code-unit ascending order;
2. version only as a secondary field if coexistence is permitted.

Do not depend on:

- JavaScript object insertion order;
- file import order;
- registration call order;
- locale-sensitive comparison.

The same registry contents must produce the same evaluation order regardless of registration input order.

---

# Registry Validation

Reject:

- empty identifiers;
- empty versions;
- empty descriptions where descriptions are required;
- unsupported domains;
- duplicate policy identifiers;
- mutable or malformed policy definitions where detectable;
- policies without deterministic evaluation contracts.

Do not execute a policy during registration merely to test it.

Do not silently replace an existing policy.

Do not silently retain the first duplicate.

---

# Executive Attention Engine

Implement a bounded deterministic engine.

A conceptual API may resemble:

```ts
function constructExecutiveAttentionQueue(
  changeSet: SituationalAwarenessChangeSet,
  registry: AttentionPolicyRegistry,
  input: ExecutiveAttentionInput
): ExecutiveAttentionQueue;
```

The exact constructor pattern should follow existing architecture.

The engine must:

1. validate the change set;
2. validate or consume a canonical registry;
3. flatten canonical changes in a documented domain order;
4. evaluate applicable policies only;
5. collect matched policy results;
6. construct canonical Attention Records;
7. resolve duplicates deterministically;
8. order the queue deterministically;
9. calculate summary counts;
10. defensively copy output;
11. deeply freeze output.

The engine must not:

- modify the change set;
- modify policy definitions;
- invoke the current clock;
- generate random values;
- infer missing fields;
- catch and suppress invalid policy behaviour;
- rank by hidden significance;
- call downstream systems.

---

# Attention Record Contract

Introduce a typed immutable Attention Record.

A conceptual form:

```ts
interface AttentionRecord {
  readonly attentionId: string;
  readonly policy: {
    readonly id: string;
    readonly version: string;
  };
  readonly domain: AttentionChangeDomain;
  readonly changeType: "added" | "removed" | "modified";
  readonly entityId?: string;
  readonly reason: AttentionReason;
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
  readonly previous?: JsonValue;
  readonly current?: JsonValue;
}
```

Use typed canonical values rather than broad `JsonValue` where practical.

An Attention Record must preserve enough information to:

- identify the source change;
- identify the matching policy;
- explain the match;
- inspect prior and current canonical values where relevant;
- replay the output.

It must not contain:

- a recommended action;
- a priority score;
- an urgency score;
- a confidence score;
- a specialist assignment;
- an execution request;
- a notification command.

---

# Attention Record Identity

Attention identifiers must be deterministic or explicitly supplied.

Do not generate UUIDs.

Do not use randomness.

Do not use the current timestamp.

Preferred strategy:

derive the identifier deterministically from explicit stable components such as:

```text
current snapshot id
+
change domain
+
entity identifier or scalar key
+
change type
+
policy id
+
policy version
```

A plain deterministic compound identifier is acceptable.

A content hash is not required.

Example:

```text
attention:<currentSnapshotId>:commitments:<entityId>:modified:<policyId>:<version>
```

Ensure escaping or encoding rules prevent ambiguity.

Document the exact construction rule.

Identical change set and registry inputs must produce identical Attention Record identifiers.

---

# Duplicate Policy Matches

Multiple policies may match the same canonical change.

The system must preserve distinct policy matches unless the contracts explicitly define aggregation.

Recommended Sprint 3.14 behaviour:

- one Attention Record per unique change and policy;
- multiple policies matching one change create multiple records;
- exact duplicate matches from the same policy are invalid or deterministically deduplicated;
- queue summaries distinguish attention records from unique elevated changes.

Do not merge unrelated policy reasons into opaque combined prose.

Do not discard a valid second policy match.

---

# Queue Contract

Introduce a canonical Executive Attention Queue.

A conceptual form:

```ts
interface ExecutiveAttentionQueue {
  readonly queueId: string;
  readonly previousSnapshotId: string;
  readonly currentSnapshotId: string;
  readonly policySet: readonly AttentionPolicyReference[];
  readonly records: readonly AttentionRecord[];
  readonly summary: ExecutiveAttentionSummary;
}
```

The exact structure must remain small and justified.

The queue must represent the result of one evaluation boundary.

It must not act like a mutable work queue.

Despite the term “queue”, it is a canonical immutable output.

No dequeue, acknowledge, resolve, assign or execute operations belong in this sprint.

---

# Queue Identity

The queue identifier must be explicit or deterministic.

Recommended strategy:

```text
attention-queue:<previousSnapshotId>:<currentSnapshotId>:<policySetIdentity>
```

The policy set identity may be derived deterministically from sorted policy identifiers and versions.

Do not introduce hashing unless needed to keep identifiers bounded.

If a compound identifier becomes impractically large, use a documented deterministic digest based on canonical policy references.

Do not imply cryptographic integrity.

---

# Policy Set Recording

The queue should record which policy versions participated in evaluation.

This allows later inspection of why two evaluations may differ.

Record policy references in stable order.

Example:

```ts
interface AttentionPolicyReference {
  readonly id: string;
  readonly version: string;
}
```

Do not embed executable policy functions in queue output.

---

# Attention Summary

Include deterministic summary counts.

A likely structure:

```ts
interface ExecutiveAttentionSummary {
  readonly evaluatedChanges: number;
  readonly elevatedChanges: number;
  readonly attentionRecords: number;
  readonly matchedPolicies: number;
  readonly byDomain: Readonly<Record<AttentionChangeDomain, number>>;
  readonly byChangeType: {
    readonly added: number;
    readonly removed: number;
    readonly modified: number;
  };
}
```

Keep summaries explicit and bounded.

Define carefully:

- `evaluatedChanges`: number of canonical added, removed and modified changes considered;
- `elevatedChanges`: number of unique canonical changes matched by at least one policy;
- `attentionRecords`: number of change-policy records;
- `matchedPolicies`: number of distinct policies producing at least one match.

Do not add:

- severity;
- risk;
- urgency;
- importance;
- confidence;
- actionability;
- recommendation score.

---

# Queue Ordering

Queue ordering must be deterministic.

Recommended record order:

1. canonical domain order;
2. stable entity identifier or scalar domain key;
3. change type in explicit order;
4. policy identifier;
5. policy version.

Define an explicit change-type order, for example:

```text
added
modified
removed
```

or:

```text
removed
modified
added
```

The specific order matters less than documenting and testing it.

Do not sort by:

- inferred importance;
- reason message;
- registration order;
- source API order;
- locale-sensitive comparison;
- timestamps unless explicitly part of the contract.

---

# Domain Traversal Order

Define a stable domain traversal order matching the canonical Situational Awareness model.

For example:

1. identity;
2. context;
3. roles;
4. projects;
5. commitments;
6. waiting items;
7. priorities;
8. active work;
9. sources.

Use the actual canonical model order.

Do not derive domain order from object key enumeration.

---

# Change-Type Handling

The engine must support:

- added;
- removed;
- modified.

Unchanged entities are not present in the lifecycle change arrays and must not be reconstructed merely for policy evaluation.

Do not introduce attention records for unchanged counts.

A future periodic-review policy would require a separate specification.

---

# Scalar Changes

Identity and context may be scalar-object changes rather than entity collections.

The attention architecture must support policies that apply to these domains.

Use stable scalar keys such as:

```text
identity
context
```

Do not invent entity identifiers for scalar changes beyond a documented canonical key.

No initial identity or context policy is required unless needed for test coverage.

---

# Policy Applicability

Policies should declare applicable domains and optionally applicable change types.

The engine should not invoke a commitment policy against a source change.

A conceptual metadata extension may include:

```ts
readonly changeTypes?: readonly AttentionChangeType[];
```

Add this only if it improves explicitness without unnecessary complexity.

Policy applicability must be deterministic.

A policy that does not apply should not be executed.

---

# Policy Context

Keep the policy evaluation context minimal.

A policy may need:

- previous snapshot identifier;
- current snapshot identifier;
- canonical domain;
- change type.

It should not receive:

- full connector data;
- runtime state;
- user preferences;
- system clock;
- other policies;
- database handles;
- agent registry;
- execution capabilities.

Do not provide the full Situational Awareness snapshots unless a documented policy requirement justifies it.

Sprint 3.14 policies should evaluate local canonical changes.

Cross-change and cross-domain policies are outside scope unless the existing architecture makes them unavoidable.

---

# No Hidden Scoring

Do not implement numerical attention scoring in Sprint 3.14.

A score invites undocumented assumptions about:

- relative importance;
- severity;
- urgency;
- ordering;
- weighting.

Selection is binary at this stage:

```text
policy matched
```

or:

```text
policy did not match
```

Queue ordering is structural, not importance-based.

A future governed prioritisation layer may introduce explicit scoring under a separate ADR and sprint.

---

# No Natural-Language Generation

Reason messages must be deterministic templates.

Do not use an LLM.

Do not use free-form generated prose.

For example:

```ts
`The commitment start time changed from ${previous.start} to ${current.start}.`
```

is acceptable if values are canonical and safely formatted.

Reason text must remain stable for identical input.

Tests should verify reason codes and key evidence rather than depending only on full prose where minor wording may evolve.

---

# Provenance

Attention Records must preserve the canonical path back to the underlying change.

At minimum include:

- previous snapshot identifier;
- current snapshot identifier;
- canonical domain;
- change type;
- entity identifier or scalar key;
- policy identifier;
- policy version.

Where previous and current canonical entities contain provenance, preserve them without alteration if included in the Attention Record.

Do not construct new source claims.

The attention layer does not replace source provenance with policy provenance.

Both are different:

```text
Source provenance:
Why JARVIS observed the entity
```

```text
Policy provenance:
Why JARVIS elevated the change
```

Preserve that distinction.

---

# Validation

Validation must be explicit and deterministic.

Validate:

- change-set structure;
- previous and current snapshot identifiers;
- policy registry;
- policy identifiers;
- policy versions;
- supported domains;
- supported change types;
- policy results;
- reason codes;
- reason evidence;
- generated attention identifiers;
- queue identifiers;
- JSON compatibility;
- duplicate records;
- summary consistency.

Do not silently:

- repair malformed policies;
- invent versions;
- invent identifiers;
- discard malformed matches;
- coerce unsupported domains;
- suppress duplicate policy errors;
- omit invalid records;
- convert non-JSON values.

---

# Policy Failure Behaviour

A policy throwing an exception is not a valid non-match.

Recommended behaviour:

- fail the evaluation explicitly;
- identify the failing policy;
- preserve deterministic error text;
- do not produce a partial canonical queue.

Do not silently skip a broken policy.

Do not catch all errors and continue.

Atomic queue construction is preferred:

```text
all policy evaluation succeeds
        ↓
canonical queue produced
```

or:

```text
any policy evaluation fails
        ↓
no canonical queue produced
```

Document this in ADR-0009.

---

# JSON Compatibility

All canonical attention outputs must be plain JSON-compatible values.

Do not expose:

- functions;
- class instances;
- `Map`;
- `Set`;
- `Date`;
- `BigInt`;
- `undefined`;
- symbols;
- circular references.

Policy definitions may contain evaluation functions internally, but policy metadata and all queue outputs must remain serialisable.

The registry itself does not need to be serialisable if it contains executable policy functions.

Its stable metadata representation should be serialisable.

---

# Immutability

All canonical outputs must be immutable.

The Executive Attention Queue constructor must:

- defensively copy all included canonical values;
- defensively copy policy references;
- defensively copy reason evidence;
- deeply freeze Attention Records;
- deeply freeze record collections;
- deeply freeze summary objects;
- deeply freeze the queue.

Mutating:

- the original change-set candidate;
- a policy metadata candidate;
- a reason candidate;
- a prior or current entity candidate

must not mutate the queue.

Policies must receive immutable or defensively isolated input.

---

# Replay Safety

The queue must support:

```text
ExecutiveAttentionQueue
        ↓ serialize
JSON
        ↓ parse
queue candidate
        ↓ canonical constructor
ExecutiveAttentionQueue
```

Reconstruction must preserve canonical equality.

If the architecture uses a queue constructor, all parsed candidates must pass through it.

Likewise, Attention Records should be replayable through the canonical queue boundary.

Do not require policy functions to replay an existing queue.

Queue replay validates canonical output, not policy re-execution.

---

# Determinism

The following must hold:

```text
identical change set
+
identical policy set
        ↓
identical queue
```

This includes:

- identical queue identifier;
- identical policy references;
- identical Attention Record identifiers;
- identical record ordering;
- identical reason codes;
- identical reason evidence;
- identical summary counts;
- byte-equivalent JSON under the same canonical serializer.

No randomness.

No implicit clock.

No environment dependence.

No locale-sensitive sorting.

No network access.

No LLM calls.

---

# Idempotence

Evaluating the same change set with the same registry repeatedly must produce an equivalent queue.

Repeated evaluation must not:

- append duplicate state;
- mutate the registry;
- mutate the change set;
- alter policy counters;
- generate different identifiers;
- depend on previous engine runs.

Policies must be pure.

---

# Empty Queue Behaviour

A valid change set may produce no Attention Records.

This is a successful result.

An empty queue should still contain:

- queue identifier;
- previous snapshot identifier;
- current snapshot identifier;
- evaluated policy references;
- deterministic zero-valued summary;
- empty frozen records array.

Do not treat “nothing requires attention under these policies” as an error.

---

# Package Placement

Follow repository conventions.

A likely structure is:

```text
lib/
  executive-operating-system/
    situational-awareness/
      attention/
        types.ts
        policy.ts
        registry.ts
        engine.ts
        queue.ts
        policies/
          commitment-cancelled.ts
          commitment-start-time-changed.ts
          commitment-removed.ts
          source-became-unavailable.ts
          index.ts
        index.ts
        policy.test.ts
        registry.test.ts
        engine.test.ts
        queue.test.ts
        calendar-integration.test.ts
        package-conformance.test.ts
```

An alternative location directly beneath the Executive Operating System may be justified:

```text
lib/
  executive-operating-system/
    attention/
```

Choose the placement that most accurately represents the established package architecture.

The preferred conceptual relationship is that attention consumes Situational Awareness lifecycle output but remains its own EOS capability.

Do not place the attention engine inside:

- connectors;
- Projection Adapters;
- ProjectionEngine;
- snapshot comparison;
- agent runtime;
- execution planner;
- UI;
- API routes.

---

# Public API

Export stable attention contracts through the appropriate Executive Operating System public boundary.

Potential exports:

- `AttentionPolicy`;
- `AttentionPolicyMetadata`;
- `AttentionPolicyResult`;
- `AttentionPolicyRegistry`;
- `AttentionReason`;
- `AttentionRecord`;
- `ExecutiveAttentionQueue`;
- queue constructor;
- engine evaluation function or engine constructor;
- initial production policies;
- relevant validation error types if consistent with repository conventions.

Do not publicly export:

- mutable registry internals;
- comparison accumulators;
- internal sorting helpers;
- unchecked constructors;
- raw policy maps;
- implementation-only discriminators.

---

# Snapshot Lifecycle Integration

The attention layer must consume the existing canonical change-set contract without modifying it.

Do not add attention-specific fields to the lifecycle change set.

Do not make snapshot comparison aware of attention policies.

The dependency direction must remain:

```text
Attention Layer
        imports
Snapshot Lifecycle public contracts
```

Never:

```text
Snapshot Lifecycle
        imports
Attention Layer
```

---

# Calendar Integration Proof

Add a focused integration test using the production architecture.

The test must use:

- calendar connector-neutral observations;
- CalendarProjectionAdapter;
- ProjectionRegistry;
- ProjectionEngine;
- canonical Situational Awareness construction;
- canonical snapshot construction;
- deterministic snapshot comparison;
- Attention Policy Registry;
- Executive Attention Engine;
- canonical queue construction.

The scenario should include:

1. one unchanged commitment;
2. one newly added commitment;
3. one removed commitment;
4. one commitment whose start time changed;
5. one commitment whose explicit status changed to cancelled, if supported without conflicting identifiers;
6. a stable recurring-event instance identifier;
7. a source availability change if practical within canonical contracts.

The resulting queue should demonstrate:

- cancellation policy match;
- start-time-change policy match;
- removal policy match;
- source-unavailable policy match where included;
- no record for unchanged commitment;
- no inferred reason;
- deterministic ordering;
- deterministic queue identity;
- identical repeated evaluation.

Do not mock away canonical constructors.

Do not bypass the registry.

Do not bypass ProjectionEngine.

Do not create attention directly from raw calendar events.

---

# Package-Boundary Conformance

Add conformance tests proving:

- connectors do not import attention packages;
- Projection Adapters do not import attention packages;
- ProjectionEngine does not import attention packages;
- snapshot lifecycle does not import attention packages;
- attention packages do not import connector packages;
- attention packages do not import runtime orchestration;
- attention packages do not import execution planner or execution API;
- attention packages do not import UI or API routes;
- initial policies consume canonical attention change contracts only.

All repository filesystem scans must remain bounded to `process.cwd()`.

Do not recurse above the repository root.

Exclude standard generated directories according to existing repository conventions.

---

# Initial Policy Requirements in Detail

## Commitment Cancellation Policy

Match only when:

- domain is commitments;
- change type is modified;
- previous and current values exist;
- previous status is not cancelled;
- current status is cancelled.

Do not match:

- an added cancelled commitment unless separately specified;
- a removed commitment;
- a title containing “cancelled”;
- an absent current record.

Reason evidence should include:

- commitment identifier;
- previous status;
- current status.

## Commitment Start-Time Change Policy

Match only when:

- domain is commitments;
- change type is modified;
- previous and current values exist;
- stable entity identifier is unchanged by lifecycle correspondence;
- previous start timestamp differs structurally from current start timestamp.

Do not infer why it changed.

Reason evidence should include:

- commitment identifier;
- previous start;
- current start.

If all-day commitments use a different canonical field, respect the current model rather than inventing conversion.

## Commitment Removal Policy

Match only when:

- domain is commitments;
- change type is removed;
- previous value exists;
- current value is absent according to the canonical change contract.

Reason evidence should include:

- commitment identifier;
- previous canonical status where available;
- previous start time where useful.

Reason language must explicitly state bounded absence semantics.

## Source Became Unavailable Policy

Match only when:

- domain is sources;
- change type is modified;
- previous and current values exist;
- previous availability is the canonical available state;
- current availability is the canonical unavailable state.

Do not match an unavailable source merely because its observation timestamp changed.

Do not infer outage, authentication failure or connector defect.

Reason evidence should include:

- source identifier;
- previous availability;
- current availability.

---

# Policy Tests

Each initial policy must have focused tests covering:

- valid match;
- valid non-match;
- wrong domain;
- wrong change type;
- missing required previous value;
- missing required current value;
- adjacent but non-matching canonical state;
- deterministic reason;
- deterministic evidence;
- no mutation of input;
- stable policy metadata;
- JSON-compatible metadata.

---

# Registry Tests

Test:

- valid construction;
- empty registry if allowed;
- stable ordering independent of input order;
- duplicate identifier rejection;
- invalid identifier;
- invalid version;
- invalid description;
- unsupported domain;
- defensive copying;
- immutable metadata output;
- deterministic policy references;
- repeated retrieval returns equivalent ordering;
- no silent replacement.

---

# Engine Tests

Test:

- empty change set;
- no matching policies;
- one change matched by one policy;
- one change matched by multiple policies;
- multiple changes matched by one policy;
- multiple domains;
- policy applicability filtering;
- deterministic traversal;
- deterministic record identifiers;
- deterministic queue identifier;
- deterministic record ordering;
- deterministic summaries;
- duplicate policy match handling;
- policy exception causes atomic failure;
- malformed policy result fails explicitly;
- malformed reason fails explicitly;
- registry input order does not affect output;
- repeated evaluation produces equivalent queue;
- no mutation of change set;
- no mutation of registry;
- no implicit timestamp;
- no randomness.

---

# Queue Construction Tests

Test:

- valid canonical queue;
- deeply frozen output;
- defensive copying;
- JSON serialization;
- replay through canonical constructor;
- invalid queue identifier;
- invalid snapshot identifiers;
- malformed policy reference;
- malformed Attention Record;
- duplicate Attention Record identifier;
- inconsistent summary;
- non-JSON-compatible reason evidence;
- deterministic error messages;
- empty queue;
- multi-policy queue.

---

# Summary Tests

Verify:

- evaluated change count;
- unique elevated change count;
- total Attention Record count;
- matched policy count;
- per-domain counts;
- per-change-type counts;
- multiple policies matching one change do not inflate unique elevated change count;
- unmatched changes remain included only in evaluated counts;
- empty inputs produce zero counts.

Do not derive counts from mutable post-construction state.

---

# Ordering Tests

Construct equivalent inputs with:

- different policy registration order;
- different change-array input order where canonical validation permits;
- different object-key insertion order;
- multiple identifiers with uppercase, lowercase, digits and punctuation.

Verify locale-independent code-unit ordering.

Do not use `localeCompare()` unless configured in a fully deterministic repository-approved manner.

Prefer an explicit comparator such as:

```ts
a < b ? -1 : a > b ? 1 : 0
```

where appropriate.

---

# Immutability Tests

After queue construction:

- attempt to mutate the original change-set candidate;
- attempt to mutate policy metadata candidates;
- attempt to mutate reason evidence candidates;
- attempt to mutate previous and current entity candidates;
- attempt to mutate queue records;
- attempt to mutate queue summaries;
- confirm the canonical output remains unchanged and frozen.

Use repository conventions for strict-mode mutation assertions.

---

# Replay Tests

Test:

```text
queue
    ↓ JSON.stringify
JSON
    ↓ JSON.parse
candidate
    ↓ canonical constructor
queue
```

Verify canonical equality.

Then evaluate the original change set and registry again and verify that the reconstructed queue is equivalent to the newly evaluated queue.

Do not require executable policy reconstruction from queue JSON.

---

# Architecture Documentation

Update system architecture documentation to show:

```text
Connectors
    ↓
Projection Adapters
    ↓
ProjectionArtifacts
    ↓
ProjectionEngine
    ↓
SituationalAwareness
    ↓
Snapshots
    ↓
Deterministic Change Set
    ↓
Attention Policies
    ↓
Executive Attention Engine
    ↓
Executive Attention Queue
    ↓
Future Interpretation
    ↓
Future Planning
    ↓
Authorised Action
```

Documentation must clearly state:

- observation is not interpretation;
- change is not importance;
- attention is not planning;
- attention is not a decision;
- queue inclusion means a deterministic policy matched;
- queue ordering is structural, not priority-based;
- downstream systems must not treat queue order as severity.

---

# ADR Requirement

Create:

```text
ADR-0009 — Executive Attention Layer and Deterministic Attention Policies
```

The ADR must document the following.

## Context

- the Observation Layer can now construct and compare canonical snapshots;
- change sets may contain more information than should be surfaced downstream;
- selection must not be embedded in connectors, adapters or snapshot comparison;
- opaque LLM salience would undermine determinism and inspectability;
- future DAWNWATCH, planning and specialist systems require a governed attention boundary.

## Decision

- introduce an Executive Attention Layer within the Executive Operating System;
- consume canonical change sets only;
- define explicit deterministic Attention Policies;
- register policies through a bounded registry;
- evaluate policies through a provider-independent engine;
- produce immutable, replay-safe Attention Queues;
- require every Attention Record to identify its policy and structured reason;
- preserve one record per unique policy and canonical change;
- use structural ordering rather than inferred priority;
- reject policy failure atomically;
- prohibit LLMs, planning, runtime orchestration and execution.

## Policy Identity Decision

Document:

- stable identifier;
- explicit version;
- one active version per identifier in a registry;
- duplicate rejection;
- deterministic registry ordering.

## Attention Identity Decision

Document deterministic construction of:

- Attention Record identifiers;
- queue identifiers;
- policy-set identity if used.

## Absence Semantics

Document that commitment removal means:

> present previously and absent currently

It does not mean:

- deleted;
- cancelled;
- completed;
- resolved.

## Consequences

Positive:

- governed attention selection;
- provider independence;
- inspectable policy reasons;
- deterministic replay;
- future specialist and briefing systems can consume a common queue;
- policy additions do not require rewriting the engine;
- attention logic remains separate from observation and planning.

Trade-offs:

- no adaptive prioritisation;
- no user preference learning;
- multiple policy matches may produce multiple records;
- structural queue order does not communicate importance;
- policies must be authored and governed explicitly;
- no persistence or acknowledgement lifecycle yet.

## Rejected Alternatives

Reject:

- embedding attention rules inside Snapshot Lifecycle;
- embedding rules in ProjectionEngine;
- connector-specific alerts;
- adapter-specific prioritisation;
- LLM-generated salience;
- hidden numerical scoring;
- direct transition from change set to planning;
- direct transition from attention match to execution;
- mutable runtime queue;
- combining persistence with this sprint.

---

# JESS Compliance

Before implementation, inspect the current JESS document and comply with its requirements for:

- specification interpretation;
- naming;
- typed contracts;
- deterministic behaviour;
- immutability;
- validation;
- package boundaries;
- error handling;
- testing;
- documentation;
- completion reporting;
- pull-request scope.

Do not rely solely on this instruction where JESS is more specific.

Any conflict must be reported before implementation.

---

# Non-Goals

The following are explicitly outside Sprint 3.14:

- attention scoring;
- severity scoring;
- urgency scoring;
- importance ranking;
- confidence scoring;
- risk classification;
- machine learning;
- LLM evaluation;
- natural-language summaries;
- DAWNWATCH briefing generation;
- daily briefing UI;
- notifications;
- alerts;
- email delivery;
- Slack delivery;
- mobile push;
- calendar polling;
- background jobs;
- runtime scheduling;
- queue persistence;
- acknowledgement workflow;
- assignment workflow;
- resolution workflow;
- suppression workflow;
- snoozing;
- user preference learning;
- organisation-specific configuration UI;
- planning;
- task creation;
- specialist routing;
- specialist handoff;
- autonomous execution;
- API routes;
- UI components;
- Email Projection Adapter;
- Drive Projection Adapter;
- GitHub Projection Adapter;
- Contacts Projection Adapter.

Do not add “small helpful extras” from this list.

---

# Deliverables

Sprint 3.14 should produce:

- typed Attention Policy contract;
- typed policy metadata;
- deterministic policy result contract;
- structured Attention Reason contract;
- Attention Policy Registry;
- deterministic Executive Attention Engine;
- typed immutable Attention Record;
- typed immutable Executive Attention Queue;
- deterministic Attention Record identity;
- deterministic queue identity;
- stable policy and queue ordering;
- deterministic summary counts;
- initial commitment and source policies;
- explicit validation;
- defensive copying;
- deep freezing;
- replay-safe JSON output;
- unit tests;
- lifecycle integration tests;
- Calendar production integration proof;
- package-boundary conformance tests;
- public API exports;
- ADR-0009;
- system architecture documentation update;
- completion report.

---

# Acceptance Criteria

Sprint 3.14 is complete only when every applicable criterion below is satisfied.

## Constitutional Compliance

- Engineering Constitution preserved.
- North Star advanced without reinterpretation.
- JESS followed.
- Behavioural Constitutions unaffected.
- accepted ADRs preserved.
- no authority transferred to the attention layer.
- no runtime behaviour introduced.

## Architectural Compliance

- attention consumes canonical lifecycle change sets only.
- connectors remain unaware of attention.
- adapters remain unaware of attention.
- ProjectionEngine remains unaware of attention.
- Snapshot Lifecycle remains unaware of attention.
- attention does not import connector packages.
- attention does not import execution or runtime orchestration.
- attention policies are separate from the engine.
- policy registry is separate from queue construction.
- future planning remains downstream.
- no persistence is embedded.

## Policy Compliance

- every policy has stable identity.
- every policy has explicit version.
- every policy declares supported domains.
- every policy is deterministic.
- every policy is side-effect free.
- every policy returns an explicit match or non-match.
- every match has a structured reason.
- duplicate policy identifiers fail explicitly.
- policy failures fail evaluation atomically.

## Deterministic Behaviour

- identical change set and policy set produce identical queue.
- registry input order does not affect output.
- change-array input order does not affect canonical output where valid.
- Attention Record identifiers are stable.
- queue identifiers are stable.
- queue ordering is stable.
- summary counts are stable.
- reason codes and evidence are stable.
- no randomness.
- no implicit clock.
- no locale-dependent sorting.
- no network access.
- no LLM calls.

## Functional Behaviour

- commitment cancellation is elevated when explicitly represented.
- commitment start-time change is elevated.
- commitment removal is elevated with bounded absence semantics.
- source unavailability transition is elevated.
- unchanged commitments are not elevated.
- unrelated changes remain unmatched.
- multiple policy matches are preserved as separate records.
- empty matches produce a valid empty queue.
- summaries distinguish records from unique elevated changes.
- Calendar-derived change sets evaluate correctly.

## Validation and Integrity

- malformed change sets fail explicitly.
- malformed policy metadata fails explicitly.
- malformed policy results fail explicitly.
- malformed reasons fail explicitly.
- duplicate records fail explicitly.
- inconsistent summaries fail explicitly.
- non-JSON-compatible output fails explicitly.
- inputs are defensively copied.
- outputs are deeply frozen.
- replay is stable.
- no partial queue is returned after policy failure.

## Documentation Compliance

- ADR-0009 created.
- architecture pipeline updated.
- attention explicitly distinguished from importance, planning and action.
- queue ordering documented as non-priority ordering.
- removal semantics documented.
- policy identity and version rules documented.
- initial policies documented.

## Engineering Quality

- focused policy tests pass.
- registry tests pass.
- engine tests pass.
- queue tests pass.
- replay tests pass.
- Calendar integration test passes.
- package-conformance tests pass.
- all existing tests pass.
- lint passes.
- `npx tsc --noEmit` passes.
- production build passes.
- `git diff --check` passes.
- working tree is clean after commit.
- pull request remains small and independently reviewable.
- completion report accurately states all test results and warnings.

---

# Required Codex Workflow

Before implementation:

1. Read the Engineering Constitution.
2. Read the North Star.
3. Read JESS.
4. Read ADR-0007.
5. Read ADR-0008.
6. Read the current System Architecture document.
7. Inspect the Situational Awareness canonical model.
8. Inspect snapshot lifecycle contracts and constructors.
9. Inspect `SituationalAwarenessChangeSet`.
10. Inspect CalendarProjectionAdapter.
11. Inspect ProjectionRegistry and ProjectionEngine.
12. Inspect existing registry patterns elsewhere in the repository.
13. Inspect current validation, deep-freeze and JSON compatibility utilities.
14. Inspect package-boundary conformance tests.
15. Confirm the actual canonical status and source availability vocabularies.
16. Identify any specification conflict or missing canonical field.
17. Propose the smallest compliant implementation plan.
18. Implement only after the architecture has been inspected.

Do not generate files before reviewing governing documents and existing contracts.

Do not invent canonical fields that do not exist.

If a recommended initial policy cannot be implemented because the canonical model does not expose the required field:

1. do not infer the field;
2. do not modify the canonical model casually;
3. report the limitation;
4. implement the remaining compliant policies;
5. propose a separate bounded model change only if architecturally necessary.

---

# Completion Report Format

At completion, provide a concise but complete report using the following sections.

## Summary

Describe:

- what was implemented;
- where the Executive Attention Layer sits architecturally;
- which contracts were added;
- how policy evaluation works;
- which initial policies were implemented;
- how determinism and immutability were preserved;
- how lifecycle and Calendar integration were demonstrated.

## Architectural Compliance

Confirm:

- Engineering Constitution preserved;
- North Star preserved;
- JESS followed;
- connector boundary preserved;
- adapter boundary preserved;
- ProjectionEngine boundary preserved;
- Snapshot Lifecycle boundary preserved;
- policy and engine separation preserved;
- no LLMs introduced;
- no planning introduced;
- no runtime orchestration introduced;
- no execution introduced.

## Key Decisions

List:

- package placement;
- policy identity rule;
- policy version rule;
- registry duplicate rule;
- registry ordering rule;
- Attention Record identity strategy;
- queue identity strategy;
- queue ordering rule;
- duplicate-match policy;
- atomic failure behaviour;
- summary count definitions;
- removal semantics;
- initial policy set;
- ADR created.

## Testing

Report exact results for:

```bash
npx vitest run <attention package path>
npm test
npm run lint
npx tsc --noEmit
npm run build
git diff --check
git status --short
```

Do not report a command as passing unless it was run successfully.

Report environmental warnings separately from failures.

For the production build, distinguish:

- compilation or static-generation failure;
- non-fatal external network warning;
- successful build with skipped external optimisation.

## Files Changed

List every changed file and its role.

## Commit and Pull Request

Provide:

- branch name;
- commit hash;
- commit title;
- pull-request title;
- pull-request URL if available.

## Deferred Items

List any policy or requirement deferred because the existing canonical model did not support it.

Do not claim unsupported behaviour was implemented.

---

# Final Engineering Constraint

Sprint 3.14 must not make JARVIS decide what the user should do.

It must establish a governed and inspectable selection layer:

```text
What canonically changed
        ↓
Which explicit policies matched
        ↓
Why each change was elevated
        ↓
Immutable Executive Attention Queue
```

Future systems may interpret, prioritise, plan, brief or act on that queue.

Sprint 3.14 must only construct it correctly.

