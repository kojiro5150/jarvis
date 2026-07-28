# ADR-0001: Canonical Executive Operating System Runtime

- **Status:** Accepted
- **Date:** 2026-07-28
- **Owner:** JARVIS Architecture
- **Scope:** Constitutional runtime composition
- **Implementation:** Sprint 3.31 and later

## Constitutional basis

This decision is governed by the following authorities, each within its documented scope:

- `docs/ENGINEERING_CONSTITUTION.md` governs engineering principles and repository evolution. In
  particular, it requires preserved human authority, deterministic contracts, explicit execution
  authority, loose coupling, transparency, architectural simplicity and progressive evolution.
- `docs/architecture/NORTH_STAR.md` governs JARVIS's enduring purpose and desired executive
  capability: adaptive reasoning, collaborative specialist intelligence and trusted execution that
  reduces cognitive burden while preserving human judgement.
- `DESIGN_CONSTITUTION.md` governs user-facing behaviour and interaction. It requires JARVIS to act
  as an orchestrator, report operational state, distinguish facts, inferences, recommendations and
  unknowns, and leave final judgement with the human.
- Accepted ADRs govern specific architectural decisions within those higher authorities. In
  particular, `docs/architecture/ADR-0019-executive-operating-system-runtime-integration.md`
  establishes deterministic runtime orchestration, explicit input boundaries, immutable stage
  products, ordered tracing and replay.
- Sprint specifications implement accepted architecture. They must not override it.

The Engineering Constitution's formal repository hierarchy remains authoritative. The North Star
and Design Constitution are described here as governing authorities by scope, not as additions to
or changes to that hierarchy.

## Executive decision

JARVIS shall have one constitutional execution lineage from projected observation through
awareness, deliberation, governed routing and authorised execution to an immutable audit record.

**The current engines shall be composed, not duplicated.**

The objective is not to replace independently valid deterministic engines. The runtime shall
compose their constitutional publications in one explicit order, preserve their identities and
authority boundaries, and publish their complete evidence lineage.

The canonical lineage shall be:

```text
ProjectionArtifactSet
        ↓
ExecutiveStateSnapshot
        ↓
ExecutiveContextSnapshot
        ↓
SnapshotChangeSet
        ↓
ExecutiveAttentionQueue
        ↓
ExecutiveSituationSet
        ↓
SituationAssessmentSet
        ↓
ExecutiveDeliberationContext
        ↓
IntentSet
        ↓
ConstraintSet
        ↓
CandidatePlanSet
        ↓
PlanEvaluationSet
        ↓
PlanComparisonSet
        ↓
ExecutiveReasoningRecord
        ↓
GovernedActionProposalSet
        ↓
ExecutiveCapabilityRoutingPlan
        ↓
ExecutiveCapabilityInvocationHandoff
        ↓
CapabilityInvocationEnvelope
        ↓
CapabilityInvocationRecord
        ↓
CapabilityExecutionResult
        ↓
ExecutiveRunRecord
```

The runtime coordinator shall own sequence, boundary validation, identity continuity, atomic final
publication and audit composition. It must not acquire observations, reproduce stage-owned domain
logic, assess evidence, recommend action, grant approval, determine capability eligibility, select
an implementation outside invocation policy, or perform the delegated operation.

## Runtime Consumption

`ExecutiveRunRecord` is the terminal constitutional runtime publication. The runtime terminates
after publishing it; no Operational Layer projection is inserted into the constitutional sequence.

`ExecutiveOperationalState` begins the Operational Layer and consumes only the terminal run record.
Future executive systems consume `ExecutiveOperationalState` rather than runtime publications
directly. Runtime publications remain immutable, retain their existing ownership, and are neither
reconstructed nor modified by operational consumers.

```text
Constitutional Runtime

ExecutiveRunRecord
──────────────────────── Runtime Boundary
ExecutiveOperationalState

Operational Layer
```

This boundary documents consumption only. It changes no constitutional publication, ownership,
sequencing, or runtime responsibility.

## Architectural invariants

### Authority Invariant

Every constitutional publication shall have exactly one owner.

Every owner shall publish exactly one authority.

No later stage may recreate, replace, reinterpret or silently supersede an earlier constitutional
publication.

Later stages may only reference, derive, constrain, evaluate, reason, route, invoke, execute or
publish according to their explicitly bounded constitutional role.

In this invariant, *reinterpret* does not prohibit downstream assessment or reasoning about an
earlier publication. It prohibits a later stage from reconstructing, modifying, claiming ownership
of, or presenting a substitute as the earlier stage's canonical publication.

### Constitutional Publication Principle

Every architectural stage shall exist to publish a canonical constitutional artefact.

The artefact, not the stage implementation, is the contract consumed by later stages.

**Stages execute. Publications endure.**

This principle governs the existing architectural artefacts, including:

- `ProjectionArtifact`;
- `ExecutiveStateSnapshot`;
- `ExecutiveContextSnapshot`;
- `ExecutiveAttentionQueue`;
- `ExecutiveSituationSet`;
- `SituationAssessmentSet`;
- `ExecutiveDeliberationContext`;
- `IntentSet`;
- `ConstraintSet`;
- `CandidatePlanSet`;
- `ExecutiveReasoningRecord`;
- `GovernedActionProposalSet`;
- `ExecutiveCapabilityRoutingPlan`;
- `CapabilityInvocationEnvelope`;
- `CapabilityInvocationRecord`;
- `CapabilityExecutionResult`; and
- `ExecutiveRunRecord`.

Implementations, registries and storage systems may change without changing the authority of the
publication contract they implement.

### Non-Reconstruction Rule

No stage may reconstruct the canonical publication of an earlier stage from lower-level inputs
when that publication is available.

Consequently:

- reasoning may consume an `ExecutiveStateSnapshot`, but must not rebuild executive state from
  `ProjectionArtifact` instances;
- assessment may consume an `ExecutiveContextSnapshot`, but must not recreate descriptive context;
- the browser may render a state view, but must not become a second state authority; and
- the runtime coordinator may compose publications, but must not recreate stage-owned domain logic.

### Identity and replay

Every publication must have a stable identity derived from, or unambiguously bound to, its immutable
inputs, relevant contract and policy versions, and explicit time boundaries. A downstream
publication must retain the identities of the upstream publications on which its authority depends.

Deterministic stages must not read an implicit clock, use randomness, depend on locale ordering or
query external systems. Acquisition and projection remain outside the deterministic runtime
boundary. Identical deterministic replay inputs shall produce identical deterministic publication
identities.

### Human authority

Governed proposals may recommend bounded action. They do not constitute a human decision or grant
execution authority. Human approval must remain separate, explicit and auditable wherever the
governing proposal or execution policy requires it.

No routing, invocation or execution publication may obscure responsibility, authority or
accountability. JARVIS shall advise and execute delegated action; the human retains judgement and
final decision authority.

### BOA alignment

This composition implements Behavioural Orchestration Architecture through behavioural and
functional role segregation, bounded authority, explicit handoff contracts, epistemic discipline,
transparent synthesis and execution, and preserved human authority. Each stage contributes within
its constitution rather than accumulating general authority, while the orchestrator coordinates
those bounded contributions without replacing specialist expertise.

## Canonical runtime architecture

### Runtime diagram

```text
Observation
      │
      ▼
Projection
      │
      ▼
State
      │
      ▼
Context
      │
      ▼
Snapshot Lifecycle
      │
      ▼
Attention
      │
      ▼
Situations
      │
      ▼
Assessment
      │
      ▼
Deliberation
      │
      ▼
Intent
      │
      ▼
Constraints
      │
      ▼
Candidate Plans
      │
      ▼
Evaluation
      │
      ▼
Comparison
      │
      ▼
Reasoning
      │
      ▼
Governed Proposal
      │
      ▼
Capability Routing
      │
      ▼
Invocation Handoff
      │
      ▼
Invocation Envelope
      │
      ▼
Invocation Record
      │
      ▼
Execution Result
      │
      ▼
Executive Run Record
```

### Stage contracts

| Stage | Owner | Inputs | Publication | Bounded responsibility | Replay and audit identity |
| --- | --- | --- | --- | --- | --- |
| Acquisition | Source connector | Credentials, source query and observation boundary | Source records | Retrieve source data without executive interpretation | Connector and version, query, boundary and frozen source identity |
| Projection | Source projection package | Source records and adapter configuration | `ProjectionArtifact` set | Map source data into canonical observations | Artifact IDs, adapter ID and version, projection boundary |
| State assembly | Situational-awareness assembly | Projected observations and lifecycle input | `ExecutiveStateSnapshot` | Validate and assemble canonical state, relationships, conflicts, gaps and provenance | State snapshot and lifecycle identities |
| Descriptive context | Executive context engine | State snapshot and reference time | `ExecutiveContextSnapshot` | Publish deterministic structural and source-derived context | Context ID, state ID, reference time and rule versions |
| Lifecycle comparison | Situational-awareness lifecycle | Previous and current lifecycle publications | Change set | Describe change between immutable observations | Previous/current lifecycle identities and change identity |
| Attention | Attention engine | Change set and policy registry | `ExecutiveAttentionQueue` | Select changes requiring executive attention | Queue ID, change identities and policy versions |
| Situation formation | Situation engine | Attention queue | `ExecutiveSituationSet` | Form bounded situations | Set and situation IDs, formation policy versions |
| Situation assessment | Assessment engine | Situation set and inherited evidence | `SituationAssessmentSet` | Assess situation characteristics under deterministic policies | Assessment identities, observation IDs and policy versions |
| Deliberation context | EOS context engine | Assessment set | `ExecutiveDeliberationContext` | Shape assessed material for deliberation | Context ID, assessment ID and policy versions |
| Intent | Intent engine | Deliberation context and configuration | `IntentSet` | Publish bounded objectives | Intent-set ID and context/configuration identities |
| Constraints | Constraint engine | Deliberation context and configuration | `ConstraintSet` | Publish deterministic limits and authority boundaries | Constraint-set ID and context/configuration identities |
| Candidate planning | Candidate planning engine | Deliberation context, intent, constraints and definitions | `CandidatePlanSet` | Construct bounded alternatives | Candidate-set, definition and policy identities |
| Evaluation | Evaluation engine | Candidates and governing deliberation publications | Evaluated candidate set | Evaluate candidates independently | Evaluated-set, candidate-set and policy identities |
| Comparison | Comparison engine | Evaluated candidates and upstream planning publications | Candidate comparison set | Compare alternatives without deciding for the human | Comparison-set and evaluated-set identities |
| Reasoning | Reasoning engine | Complete bounded deliberation record | `ExecutiveReasoningRecord` | Explain evidence, questions and decision boundaries | Reasoning ID and all referenced publication/policy identities |
| Governed proposals | Proposal engine | Reasoning and complete planning record | `GovernedActionProposalSet` | Recommend bounded action and state authority requirements | Proposal-set, proposal, reasoning and policy identities |
| Capability routing | Capability router | Exact context, governed proposal scope, scenario, policy, rules and registry | `ExecutiveCapabilityRoutingPlan` | Determine capability eligibility | Routing-plan, context, state, proposal, scenario, rule and policy identities |
| Invocation handoff | Invocation handoff | Routing plan, exact context, routed member and execution policy | `CapabilityInvocationEnvelope` | Issue an envelope for one already-routed member | Envelope, plan-member, context, policy and registry identities |
| Invocation | Capability invoker | Issued envelope, context, policy, registry and reference time | `CapabilityInvocationRecord` or failure | Enforce policy, resolve implementation, invoke once and validate result | Invocation, envelope, implementation and policy identities |
| Execution | Capability implementation | Bounded invocation context | `CapabilityExecutionResult` | Perform only the delegated operation | Result, invocation and implementation identities |
| Run publication | Runtime coordinator | All stage publications | `ExecutiveRunRecord` | Validate and publish the complete execution and audit lineage | Run ID, replay input identity and all publication identities |

### State ownership

`ExecutiveStateSnapshot` shall be the single canonical runtime state boundary.

`ProjectionArtifact` instances remain canonical observations. Lifecycle snapshots remain canonical
lifecycle publications. Neither is a co-equal owner of executive state. A projection describes an
observation; a lifecycle snapshot establishes observation continuity; the state snapshot assembles
the canonical executive state publication.

`OperationalState` may remain temporarily as a presentation or acquisition aggregate during the
implementation sequence. It must not remain a constitutional state authority, and downstream
stages must not treat it as interchangeable with `ExecutiveStateSnapshot`.

### Context ownership

The architecture shall retain two distinct context concepts:

1. `ExecutiveContextSnapshot` is the canonical descriptive, state-derived context publication. It
   describes source coverage, entities, relationships, conflicts, gaps, deterministic conditions
   and calculations without assessing executive significance or recommending action.
2. `ExecutiveDeliberationContext`, also referred to as **Deliberation Context**, is the distinct
   assessment-derived publication used by intent, constraints, planning, evaluation, comparison,
   reasoning and proposals.

These concepts must not be merged merely because current implementation names overlap. The
descriptive context answers *what context exists around the observed state*. Deliberation Context
answers *what assessed material is available for bounded deliberation*.

The canonical architectural name for the assessment-derived concept shall be
`ExecutiveDeliberationContext`. This ADR does not rename any file or implementation symbol.

Intent and constraints shall be sibling derivations from the same Deliberation Context. Neither
publication silently governs the construction of the other.

### Run modes

The runtime may execute only the stages required by the selected constitutional run mode:

- **awareness-only** ends after the required awareness and context publications;
- **deliberation** ends after governed proposals; and
- **governed execution** continues through routing, invocation and execution.

Run modes must not weaken stage order, authority, evidence or validation. They exist to ensure that
reasoning depth remains proportionate to task complexity.

### Package responsibility table

| Package or surface | Canonical responsibility | Must not own |
| --- | --- | --- |
| `lib/executive-operating-system/situational-awareness/projection` | Canonical projection contracts and deterministic projection | Source acquisition, executive interpretation or routing |
| Source connector packages | Source-specific acquisition | Projection authority, executive state or deliberation |
| Source projection adapter packages | Source-specific transformation into projection artefacts | Runtime orchestration or recommendation |
| `lib/executive-operating-system/situational-awareness/assembly` | `ExecutiveStateSnapshot` publication | Acquisition, attention or assessment |
| `lib/executive-operating-system/situational-awareness/lifecycle` | Lifecycle publications and change comparison | Executive state or relevance selection |
| `lib/executive-context` | `ExecutiveContextSnapshot` publication | Assessment, planning, routing or execution |
| `lib/executive-operating-system/attention` | Executive attention selection | Situation formation or recommendation |
| `lib/executive-operating-system/situations` | Bounded situation formation | Assessment or planning |
| `lib/executive-operating-system/assessment` | Deterministic situation assessment | Planning, routing or execution |
| `lib/executive-operating-system/context` | `ExecutiveDeliberationContext` publication | Descriptive context, executive state or routing |
| `lib/executive-operating-system/intent` intent engine | `IntentSet` publication | Constraints, planning or approval |
| `lib/executive-operating-system/intent` constraint engine | `ConstraintSet` publication | Intent, routing or execution |
| `lib/executive-operating-system/planning/candidates` | Candidate plan construction | Evaluation, selection or execution |
| `lib/executive-operating-system/planning/evaluation` | Independent candidate evaluation | Comparison, decision or execution |
| `lib/executive-operating-system/planning/comparison` | Candidate comparison | Human decision or execution |
| `lib/executive-operating-system/reasoning` | Bounded reasoning, questions and evidence interpretation | Hidden decision-making, routing or execution |
| `lib/executive-operating-system/proposal` | Governed recommendation and authority requirements | Human approval, routing or execution |
| Executive capability registry | Capability definitions and dependencies | Implementation selection or invocation |
| Executive capability router | Sole capability eligibility decision | Execution policy, envelope issuance or invocation |
| Invocation handoff | Sole invocation-envelope issuance | Routing eligibility or execution permission |
| Capability implementation registry | Implementation metadata and deterministic precedence | Capability routing eligibility |
| Capability invoker | Execution-policy enforcement, implementation resolution, bounded invocation, result validation and invocation record | Proposal formation, routing or delegated domain work |
| Capability implementation | Delegated operation | Routing, authority expansion or run composition |
| `lib/executive-operating-system/runtime` | Stage sequence, validation, identity continuity and audit composition | Connector work, domain decisions, approval, routing logic or capability work |
| EOS transport API | Serialisation and transport of explicit runtime inputs and results | Hidden defaults, connector work or authority invention |
| Operational-state API and read model | Presentation of canonical operational publications | Executive state construction or a parallel state model |
| Chat API and context presentation | Conversation transport and bounded presentation of constitutional publications | State ownership, routing or direct execution authority |
| Briefing presentation | Deterministic rendering of canonical awareness and recommendation publications | Independent recommendation authority |
| Specialist execution transport | Submission of user intent or approval to governed execution | Direct capability eligibility or implementation authority |
| Execution audit persistence and API | Storage and retrieval of audit publications | Run identity, routing, execution or audit truth creation |
| Browser components | Render canonical views and submit user intent or approval | State, reasoning, routing, invocation or execution authority |

## Authority boundaries

### Proposals and approval

A `GovernedActionProposalSet` shall recommend bounded action and state its conditions and authority
requirements. It must not claim approval or execution authority.

Where approval is required, the human approval publication or identity must be explicit and bound
into the execution lineage. Approval must not be inferred from a proposal, routing decision, UI
navigation or invocation request.

### Routing

The capability router alone shall own capability eligibility. Routing authority begins when the
router evaluates the exact `ExecutiveContextSnapshot`, governed proposal scope, registered
scenario, capability registry, routing policy, routing rules and dependencies. It ends when the
router publishes `ExecutiveCapabilityRoutingPlan`.

No caller, coordinator, handoff, invoker, specialist, implementation or browser surface may assert,
reconstruct or silently modify routed or unresolved capability status.

### Invocation handoff

The handoff shall own issuance of `CapabilityInvocationEnvelope`. It may select only one member
already published as routed, validate its dependencies and bind the plan, context, proposal,
routing evidence, execution policy and registry identities.

The handoff owns neither routing nor execution permission. It must not infer eligibility, select an
implementation or grant authority.

### Invocation and execution

The invoker shall own:

- validation that the envelope came from the canonical handoff;
- execution-policy enforcement;
- compatible and permitted implementation resolution;
- one bounded invocation;
- result and timeout validation; and
- `CapabilityInvocationRecord` or immutable failure publication.

Execution authority begins only after envelope, identity, compatibility and execution-policy
validation. The selected implementation owns only the delegated operation. It must not broaden its
task, scope, dependencies or authority. Its execution authority ends when that bounded operation
returns or throws.

Result validation and record publication remain invoker governance responsibilities; they do not
extend the implementation's authority.

### Runtime coordination

The runtime coordinator shall invoke stage owners in canonical order, validate publication
boundaries, preserve identity and evidence, and assemble the audit record. It must not make or
recreate state, assessment, planning, routing, approval, implementation or domain-execution
decisions.

### User-facing surfaces

Browser, briefing and specialist surfaces shall consume constitutional publications or
deterministic presentation views derived from them. They must not form parallel state, reasoning,
routing, invocation, execution or audit authorities.

The user interface may retain its interaction design while its server-side composition changes.
Conversational requests shall select the minimum appropriate run mode. Operational briefings shall
render canonical awareness and, where advice is shown, governed recommendation evidence.
Specialist delegation shall occur through capability routing. Governed execution shall occur
through the handoff and invoker. Execution audit shall be a view over the complete run lineage.

## Evidence and audit model

### Epistemic contract

Every material runtime claim shall carry, directly or by immutable reference, one of the following
epistemic classifications:

| Classification | Meaning | Canonical origin |
| --- | --- | --- |
| **Observed** | Directly represented by a source observation | Projection |
| **Configured** | Explicit rule, policy, registry, definition, user constraint or authority configuration | Configuration or registry owner |
| **Derived** | Deterministically calculated from identified inputs under a versioned rule | Deriving stage |
| **Recommendation** | Normative advice that a human may accept, reject or modify | Reasoning or governed proposal stage |
| **Unknown** | Explicit absence, ambiguity, conflict, insufficiency or unresolved condition | Any validating or deriving stage |

This taxonomy is an enduring epistemic contract. It shall persist through assessment, reasoning,
routing, invocation, execution, audit and presentation. Presentation must not promote a derived or
recommended statement to an observation, and model output must not silently become canonical
evidence.

Evidence must identify its subject, upstream publication or evidence identities, and the governing
rule or policy where applicable. `Configured`, `Derived` and `Recommendation` evidence must retain
the relevant rule, policy or definition identity. `Unknown` must remain explicit rather than being
discarded at a later stage.

No confidence score shall be introduced without governed semantics that define its meaning,
calculation and permitted use. In the absence of such semantics, stages must publish evidence and
uncertainty without inventing a score.

### Executive Run Record

`ExecutiveRunRecord` shall be the immutable audit root for one constitutional run. It shall contain
and extend the existing ordered stage trace rather than replace it.

- The stage trace is the ordered diagnostic execution sequence. It records stage order, input and
  output publication identities, status, validation and failure location.
- The Executive Run Record is the higher-order audit publication. It binds replay inputs, contract
  and policy identities, all successful stage publications, authority evidence, failures,
  invocation and execution results, and presentation/audit links.

The record shall contain or immutably reference, as applicable to the selected run mode:

```text
ExecutiveRunRecord
  run identity and contract version
  run mode and outcome
  replay input identity
    projection artefact identities
    previous lifecycle identity
    observed and reference times
    configuration, registry, policy and scenario identities
  constitutional publications
    ExecutiveStateSnapshot
    ExecutiveContextSnapshot
    lifecycle change set
    ExecutiveAttentionQueue
    ExecutiveSituationSet
    SituationAssessmentSet
    ExecutiveDeliberationContext
    IntentSet
    ConstraintSet
    CandidatePlanSet and evaluation/comparison publications
    ExecutiveReasoningRecord
    GovernedActionProposalSet
    ExecutiveCapabilityRoutingPlan
    ExecutiveCapabilityInvocationHandoff
    CapabilityInvocationEnvelope
    CapabilityInvocationRecord
    CapabilityExecutionResult
  human approval identity where required
  evidence index
    Observed
    Configured
    Derived
    Recommendation
    Unknown
  ordered stage trace
  immutable failures
  linked conversational and specialist activity records
```

Successful partial publications shall remain available when a later stage fails. A failure shall be
a first-class immutable publication and must retain the failed stage, reason, input publication and
supporting evidence identities.

Final successful publication shall be atomic for the selected run mode: no completed run record may
be published until every stage required by that mode succeeds. Atomic final publication does not
discard successful partial publications or failure evidence.

The deterministic run identity shall be derived from immutable replay inputs, relevant contract and
runtime versions, explicit time boundaries and run mode. External capability results may have their
own contract-defined identities while retaining their deterministic request and invocation lineage.

## Consequences and alternatives

### Consequences

#### Benefits

- JARVIS has one authoritative state and execution lineage.
- Descriptive context remains separate from assessment-derived deliberation.
- Each publication and authority has one owner.
- Routing evidence cannot be fabricated by callers or implementations.
- Execution policy remains distinct from routing policy and human approval.
- Every execution can be traced to observations, configuration, derivation, recommendation and
  unknowns.
- Browser, briefing, specialist and audit surfaces share the same constitutional reality.
- Deterministic replay remains possible through explicit inputs, policies, registries and time.

#### Costs

- Runtime results and persisted audit publications shall be larger.
- Stage contracts must retain more identity and evidence references.
- Existing integration boundaries require sequenced migration.
- Contributors must preserve the distinction between descriptive context and Deliberation Context.
- Presentation aggregates and direct execution routes cannot remain parallel architectural
  authorities.

#### Risks and controls

| Risk | Required control |
| --- | --- |
| Coordinator absorbs domain logic | Enforce package ownership and stage-specific contract tests |
| Evidence references become inconsistent | Apply the common epistemic taxonomy and immutable identities |
| Approval becomes implicit | Require explicit approval identity where proposal or policy requires it |
| Deliberation Context becomes a second state | Prohibit acquisition and canonical state ownership in that package |
| UI migration creates a new authority | Keep user-facing payloads as views over constitutional publications |
| Replay identity is confused with storage identity | Canonical content identity must remain distinct from persistence keys |

### Alternatives considered

#### Preserve a parallel deterministic runtime and attach routing after deliberation

Rejected. This would retain multiple state and context authorities and force callers or compatibility
layers to coordinate identities. It conflicts with deterministic contracts, loose coupling and the
Authority Invariant.

#### Use Deliberation Context as the descriptive context

Rejected. Assessment-derived sections cannot replace the source-aware, state-derived descriptive
boundary without collapsing observation and interpretation.

#### Use `ExecutiveContextSnapshot` as Deliberation Context

Rejected. Descriptive context does not own assessed, decision-oriented material required by intent,
planning and reasoning. Combining the concepts would give one publication overlapping authorities.

#### Route external action before deliberation

Rejected as the governed-execution architecture. Final action routing must fulfil an explicit
governed proposal; routing before intent, constraints, reasoning and proposal would permit execution
without the required reasoning and authority record. Bounded specialist contribution during
reasoning does not grant external execution authority.

#### Permit callers to submit routing conclusions or invocation envelopes

Rejected. A caller-authored routing status or envelope would create a second routing authority and
allow governance evidence to be asserted rather than derived.

#### Expand the ordered stage trace into the entire audit model

Rejected. Diagnostic order and higher-order audit lineage are distinct responsibilities. Retaining
the trace inside `ExecutiveRunRecord` preserves both without overloading either contract.

#### Make a user-interface operational aggregate the canonical state

Rejected. A presentation or acquisition aggregate does not own the canonical observation,
lifecycle, conflict, gap, provenance and replay boundaries required of executive state.

#### Replace all runtime and browser surfaces in one change

Rejected. Incremental, reviewable composition reduces migration risk. Each cut-over must remove the
superseded authority rather than retain a compatibility layer.

## Decision Durability

Implementation technologies, package locations, models, storage systems and interfaces may change.
Unless this ADR is superseded, the following decisions shall remain stable:

- one canonical state boundary;
- descriptive context distinct from Deliberation Context;
- one owner per constitutional publication;
- one capability-routing authority;
- explicit, bounded execution authority;
- retained human judgement and explicit approval where required;
- complete epistemic and audit lineage; and
- browser and specialist surfaces as consumers of constitutional publications rather than parallel
  authorities.

Changes to these invariants require an ADR that explicitly supersedes this decision. Ordinary
refactoring, package migration or interface replacement must preserve them.

## Implementation Sequence

No numbering conflict exists in the repository for the Sprint 3.31–3.38 programme at the time of
this decision. The following sequence is architectural implementation guidance. Each sprint shall
remain independently reviewable and must not introduce compatibility layers or speculative
capabilities.

### Sprint 3.31 — Canonical awareness and context composition

**Objective:** Establish one runtime prefix from projection through descriptive context.

**Bounded changes:**

1. Treat the runtime projection artefact input as state-assembly input.
2. Compose state assembly and retain `ExecutiveStateSnapshot`.
3. Derive `ExecutiveContextSnapshot` from that exact state and explicit reference time.
4. Derive lifecycle comparison from the assembled state publication.
5. Add state and descriptive-context trace entries and identity propagation.
6. Add deterministic replay, boundary failure and immutability tests.

**Exclusions:** Browser composition, capability routing and execution shall remain out of scope.

**Exit contract:** No EOS run may reach attention without state and descriptive context publications
created within that same run.

### Sprint 3.32 — Deliberation Context boundary

**Objective:** Establish the distinct assessment-derived context authority.

**Bounded changes:**

1. Establish the existing assessment-derived EOS context contract as
   `ExecutiveDeliberationContext` in architectural and public type semantics.
2. Preserve its position after assessment.
3. Retain state, descriptive-context, assessment and supporting-evidence identities.
4. Require intent, constraints and later deliberation stages to consume that exact publication.
5. Update architecture and integration tests with the implementation change.

**Exclusions:** This sprint shall not merge descriptive and deliberative context or rename files
solely for cosmetic consistency.

**Exit contract:** Every deliberation publication proves its assessment, descriptive-context and
state lineage.

### Sprint 3.33 — Governed proposal-to-routing composition

**Objective:** Make the canonical router a runtime stage.

**Bounded changes:**

1. Add explicit scenario, routing-policy and capability-registry identities to runtime
   configuration.
2. Define the deterministic relationship between a governed proposal and the capability requirement
   being routed.
3. Invoke the capability router after governed proposals.
4. Retain routed, unresolved, dependency, rule, condition, proposal, context and state identities.
5. Add routing success, unresolved, dependency, rejection and replay tests.

**Exclusions:** No caller-authored routing conclusion or compatibility routing contract may be
introduced.

**Exit contract:** Every routing plan is produced from an exact governed proposal and exact canonical
context within the same run.

### Sprint 3.34 — Canonical invocation and execution record

**Objective:** Complete governed execution within the runtime lineage.

**Bounded changes:**

1. Supply the runtime-created routing plan and context to the canonical handoff.
2. Select only an explicitly routed capability bound to the governed proposal.
3. Bind explicit approval identity where required.
4. Issue the invocation envelope and invoke through execution policy and implementation registry.
5. Retain the invocation record, immutable failure and validated execution result.
6. Add policy denial, implementation failure, timeout, evidence-preservation and replay tests.

**Exclusions:** The runtime coordinator shall not acquire routing, implementation-selection or
delegated-operation logic.

**Exit contract:** No implementation may be invoked through EOS without a canonical routing plan,
issued envelope and execution-policy decision.

### Sprint 3.35 — Executive Run Record

**Objective:** Establish one immutable audit root.

**Bounded changes:**

1. Publish `ExecutiveRunRecord` and include the existing ordered stage trace.
2. Index every constitutional publication, authority identity and epistemic classification.
3. Publish immutable partial and failure records.
4. Link specialist and model activity audits without making them the audit root.
5. Persist and retrieve the higher-order record.
6. Add identity, immutability, failure, audit-linkage and security-boundary tests.

**Exclusions:** Storage-provider choice must not redefine canonical run identity.

**Exit contract:** An auditor can traverse any result to its observations, configuration, reasoning,
proposal, routing, approval and implementation.

### Sprint 3.36 — Operational briefing integration

**Objective:** Move the browser operational view onto canonical state and awareness publications.

**Bounded changes:**

1. Derive the operational read model from canonical state, context, attention, assessment and
   governed recommendation publications.
2. Preserve the existing user-interface design and practical presentation payload.
3. Render explicit unknowns and source status honestly.
4. Switch the operational-state API to the canonical read model.
5. Remove the old state-building authority after all its consumers move.

**Exclusions:** The briefing renderer shall not acquire independent recommendation authority.

**Exit contract:** Dashboard and EOS consume the same state identity.

### Sprint 3.37 — Conversational runtime integration

**Objective:** Make conversation a constitutional runtime consumer.

**Bounded changes:**

1. Select the minimum appropriate run mode for each request using explicit deterministic metadata
   where practical.
2. Build specialist and model presentation context from canonical publications.
3. Preserve behavioural constitutions and bounded specialist scope.
4. Link every response to an Executive Run.
5. Prevent model output from becoming canonical evidence without its governed publication boundary.
6. Remove direct parallel operational-state construction from chat.
7. Add factual, briefing, recommendation, delegation and failure-path integration tests.

**Exclusions:** Conversation must not become a routing or state authority.

**Exit contract:** Conversation is an interaction surface over EOS, not an alternative runtime.

### Sprint 3.38 — Governed execution and audit cut-over

**Objective:** Remove the final production parallel execution lineage.

**Bounded changes:**

1. Route the existing execution interaction through canonical governed invocation.
2. Render execution status and audit fields from the Executive Run and linked invocation
   publications.
3. Make execution-history APIs read models over Executive Run records.
4. Remove direct specialist execution authority when no consumer depends on it.
5. Verify approval, rejection, delegation, execution and audit behaviour end to end.

**Exclusions:** No user-interface redesign is required.

**Exit contract:** Conversation, briefing, delegation, execution and audit traverse the same
constitutional execution lineage.

## Acceptance criteria

Implementation of this ADR is complete only when:

1. Every run has exactly one `ExecutiveStateSnapshot`.
2. Every `ExecutiveContextSnapshot` identifies that exact state snapshot.
3. Attention cannot be published before state, descriptive context and lifecycle comparison.
4. `ExecutiveDeliberationContext` cannot be mistaken for descriptive context or canonical state.
5. Every deliberation publication retains its state, context, assessment and applicable policy
   lineage.
6. Every routed capability is present in the runtime-created aggregate routing plan.
7. No caller-authored status, flag or envelope can grant routing authority.
8. Every invocation envelope preserves proposal, context, state, scenario, routing-policy, rule,
   condition, dependency, execution-policy and registry identities.
9. Every implementation invocation is permitted by an explicit execution policy.
10. Required human approval is explicit, identifiable and auditable.
11. Every execution result belongs to exactly one invocation and one Executive Run.
12. Every material claim is classified as Observed, Configured, Derived, Recommendation or Unknown.
13. Browser and specialist surfaces consume canonical publications rather than form parallel
    authorities.
14. Identical deterministic replay inputs produce identical deterministic publication identities.
15. Runtime coordination contains no connector, domain reasoning, routing-rule, approval or
    capability-implementation logic.
16. A failed later stage retains every successful earlier publication and emits an immutable failure.
17. Final successful publication is atomic for the selected run mode.

## Appendix A — Current Repository Diagnosis

This appendix records the verified repository state at the date of this ADR. It is diagnostic and
transitional; it does not define the enduring architecture above.

### Independently valid lineages

The repository contains independently valid deterministic packages for projection, state assembly,
descriptive context, attention, situations, assessment, assessment-derived context, intent,
constraints, candidate planning, evaluation, comparison, reasoning, proposals, capability routing,
invocation handoff and capability invocation.

`docs/architecture/ADR-0019-executive-operating-system-runtime-integration.md` established a
deterministic runtime beginning with a validated projection artefact set and ending with governed
proposals. It intentionally deferred human approval, authorised execution, chat integration,
persistence and multi-source runtime assembly.

### State and context bypass

`lib/executive-operating-system/runtime/engine.ts` currently calls projection and lifecycle
construction directly before attention. Its result contract in
`lib/executive-operating-system/runtime/types.ts` publishes the older situational-awareness and
lifecycle objects, then the assessment-derived EOS `ExecutiveContext`.

The runtime does not yet compose
`lib/executive-operating-system/situational-awareness/assembly` or `lib/executive-context` into its
main run. Consequently `ExecutiveStateSnapshot` and `ExecutiveContextSnapshot` exist outside the
principal attention-to-proposal lineage.

The two current context packages are not duplicate implementations of one concept:

- `lib/executive-context` derives descriptive structural context directly from
  `ExecutiveStateSnapshot`; and
- `lib/executive-operating-system/context` derives policy-shaped, planning-oriented context from
  `SituationAssessmentSet`.

Their overlapping names obscure distinct responsibilities. The enduring architecture names the
latter `ExecutiveDeliberationContext` without renaming implementation files in this ADR.

### Capability composition

`lib/executive-operating-system/executive-capabilities/router.ts` publishes the aggregate canonical
`ExecutiveCapabilityRoutingPlan` from `ExecutiveContextSnapshot` and registered routing inputs.

`lib/executive-operating-system/executive-capabilities/invocation/handoff.ts` now provides a
deterministic router-to-invoker boundary. It validates the exact context and state identities,
selects only an already-routed capability, preserves routing-rule, condition and dependency
evidence, and issues the invocation envelope.

`lib/executive-operating-system/executive-capabilities/invocation/invoker.ts` rejects envelopes not
issued by that handoff and owns execution-policy validation, implementation resolution, bounded
invocation, result validation and invocation-record publication.

`lib/executive-operating-system/runtime/engine.ts` exposes an additive invocation path, but the main
run does not yet derive `ExecutiveStateSnapshot`, `ExecutiveContextSnapshot` or the routing plan.
The additive path accepts routing and context as execution input rather than publishing them as
stages of one run. The canonical handoff is therefore sound in isolation but not yet fully composed
with the constitutional runtime lineage.

### User-facing parallel lineage

`lib/operational-state.ts` currently aggregates memory and connector data for browser use.
`lib/context-builder.ts` serialises that aggregate into model context. `lib/briefing.ts` derives
briefing and recommendation text directly from the same aggregate. `app/api/chat/route.ts` composes
those browser-oriented paths with model invocation.

These surfaces provide the current user experience but do not preserve the complete constitutional
state, context and evidence lineage. During migration, `OperationalState` may remain a transitional
presentation/acquisition aggregate. It must not become or remain a co-equal executive-state owner.

### Execution audit

`lib/agents/execution-audit.ts` records specialist/model activity, requested and granted authority,
approval, status and model metadata. The ordered EOS trace in
`lib/executive-operating-system/runtime/types.ts` records deterministic stage execution through
governed proposals.

Neither currently acts as the higher-order audit root joining state, descriptive context,
deliberation, routing, envelope, invocation and execution result. `ExecutiveRunRecord` shall join
these existing diagnostic and activity records without erasing their bounded purposes.

### Required cut-over principle

Each implementation sprint shall replace the relevant parallel authority directly at its
constitutional boundary. It must not introduce an adapter or compatibility layer that allows both
old and new publications to remain authoritative. Transitional presentation shapes may persist only
as views over the canonical publication once their cut-over is complete.
