# JARVIS System Architecture

## Purpose

JARVIS is a personal AI operating environment that coordinates specialised capabilities across situational awareness, research, communication, engineering, collaboration, reflection and governance reasoning.

It is not designed as a single all-purpose persona. Its architecture separates orchestration from bounded specialist work.

## Current system layers

### 1. Interface layer

The Next.js application under `app/` and `components/` provides:

- the command interface;
- specialist selection and display;
- conversation presentation;
- operational status and briefing surfaces;
- memory editing;
- microphone capture and other interaction utilities.

### 2. API layer

Routes under `app/api/` currently expose:

- chat execution;
- Google OAuth start, callback and disconnect operations;
- memory access;
- operational picture access;
- operational state access.

API routes must remain thin. Domain behaviour should live in `lib/` modules rather than accumulating inside route handlers.

### 3. Orchestration and specialist layer

Specialists are defined under `lib/agents/` and registered through `lib/agents/index.ts`.

Permanent specialist behaviour is defined under `lib/agents/constitutions/`. The constitution registry composes a versioned shared constitutional layer with each role-specific constitution and validates that constitutional authority does not exceed the existing runtime contract. Behavioural Constitutions are the authoritative behavioural architecture, but Sprint 3.9 does not use them as a new runtime prompt source.

Validated constitutions can be projected into the Behavioural Capability Matrix:

```text
Behavioural Constitutions
        ↓
Compliance Validation
        ↓
Behavioural Capability Matrix
        ↓
Behavioural Collaboration Graph
        ↓
Behavioural Architecture Diagnostics
        ↓
Future Constitutional Documentation Generation
        ↓
Future Constitutional Compiler
        ↓
Future Runtime
```

The Behavioural Capability Matrix is descriptive, not operational. It is a deterministic, immutable view of constitutionally declared missions, responsibilities, authority boundaries, collaboration partners and outputs. Constitutions remain the only behavioural source of truth: consumers must rebuild the matrix after constitutional changes and must never edit it directly. This layer creates no prompts, routing, execution or orchestration, and the current runtime does not consume it.

The **Behavioural Collaboration Graph** consumes that matrix as its immediate architectural input. Every matrix capability becomes a lightweight node, including specialists with no incoming or outgoing relationship. Each declared collaboration partner becomes a directed edge from the declaring specialist to that partner. Direction is preserved: a declaration from A to B neither creates nor implies B to A. Reciprocity is derived only when both directed declarations exist, so asymmetric constitutional relationships remain asymmetric.

Nodes retain matrix order, while edges use source node order followed by target node order. This canonical ordering makes the representation deterministic; it is not priority, precedence, workflow or execution order. The graph is deeply immutable so consumers cannot turn a derived view into an editable configuration surface.

**Behavioural Collaboration Topology:** The Behavioural Collaboration Graph is a deterministic projection of constitutionally declared collaboration relationships. It describes collaboration topology but does not activate, route, schedule, delegate, sequence or execute work.

A collaboration edge expresses a constitutionally declared relationship. It does not activate, route, schedule, sequence, delegate or execute work. In particular, collaboration is not authority, delegation, handoff, dependency, execution sequence, implied reciprocity or inferred similarity.

The Behavioural Collaboration Graph is a projection. It is not an independent configuration surface and must not become a second source of behavioural truth. Behavioural Constitutions remain authoritative; topology changes must originate there, pass through compliance and the Capability Matrix, and then be reproduced by rebuilding the graph. The graph is descriptive only, and no runtime or orchestration component currently consumes it.

The **Behavioural Architecture Diagnostics** layer consumes the Capability Matrix and Collaboration Graph rather than raw constitutional prose. This preserves the derivation boundary: constitutions remain the ultimate source of truth, while the matrix, graph and diagnostics report are deterministic projections that cannot be edited as alternative architecture.

Diagnostics differ from compliance. Compliance evaluates mandatory constitutional source rules; diagnostics describe directly observable structure in valid projections. Isolation, asymmetry, reciprocal relationships, disconnected components and permitted empty collections can be deliberate. An `information` diagnostic is a neutral observation. An `attention` diagnostic merits human interpretation, but it is not a constitutional compliance failure and does not independently authorise a runtime response. Ordinary diagnostics therefore never block startup or runtime.

Component analysis uses weak connectivity solely to group nodes for observation. It does not erase directed graph semantics or introduce reachability, centrality or operational analysis. Reports use controlled messages and canonical matrix-based ordering, and are deeply immutable at runtime. No health, maturity, quality, readiness or risk score exists because the architecture provides no normative basis for one.

**Diagnostics Without Authority:** Behavioural Architecture Diagnostics identify deterministic structural characteristics of constitutional projections. They do not alter, repair, rank, approve, reject or enforce the behavioural architecture. The layer also does not optimise, infer relationships, recommend changes or produce runtime instructions.

The architecture distinguishes:

- **Executive agents:** JARVIS and DAWNWATCH. These maintain situational awareness and coordinate work.
- **Specialist agents:** ORACLE, GECKO, HERALD, STEVE, CO-WORK, MARCUS and PHDSS. These operate within bounded functions.

JARVIS should select, frame and hand off work. It should not silently absorb every specialist function into its own prompt.

### 4. Context layer

`lib/context-builder.ts` constructs the relevant view of shared operational state for each agent.

The governing principle is:

> There is one operational state, but each specialist receives an explicit, purpose-appropriate view of it.

Context selection should be deterministic and inspectable. Specialists should not receive all available personal information by default.

### 5. Operational-state layer

`lib/operational-state.ts` and related hooks/routes represent the current structured state of the system.

This state should become the canonical source for active priorities, projects, commitments, signals and system status. Presentation components should consume this state rather than independently infer it.

### 6. Memory layer

`lib/memory/` provides the schema, seed data and local storage behaviour for persistent user context.

Memory is distinct from operational state:

- **Memory** contains durable user context and preferences.
- **Operational state** contains current work, priorities and changing conditions.

Local memory data is runtime state and must not be committed to Git.

### 7. Connector layer

`lib/connectors/` provides provider-neutral connector interfaces and Google-specific implementations for Gmail, Calendar and Drive.

Connector code should:

- isolate vendor-specific behaviour;
- return normalised domain types;
- handle authentication failures explicitly;
- avoid embedding presentation logic;
- require explicit authority before external write actions are introduced.

### 8. Model-access layer

`lib/claude.ts` currently encapsulates model access.

The application should depend on an internal model interface rather than spread provider-specific calls across components or routes. This preserves the option to introduce model selection, evaluation and fallback behaviour later.

## Core runtime flow

1. The user enters a request through the interface.
2. JARVIS or the selected specialist is resolved through the agent registry.
3. The context builder creates that agent's permitted view of memory and operational state.
4. The chat API assembles the system prompt, context and conversation.
5. The model produces a response.
6. The interface presents the response and relevant status information.
7. Future governed hand-offs or actions must be represented explicitly rather than hidden inside prose.

Sprint 3.9 preserves this runtime flow and the existing `assembleAgentSystemPrompt()` order. Constitution loading and validation do not alter prompt text, routing, execution gates, audit behaviour, APIs or model invocation.

## Executive Operating System: situational awareness

Sprint 3.11 begins a product-layer phase distinct from the Behavioural Operating System. Behavioural architecture defines how specialists are constituted, validated and related. The Situational Awareness Model defines the bounded operational facts currently represented about the user's world:

```text
Engineering Constitution
        ↓
North Star
        ↓
Behavioural Constitutions
        ↓
Compliance
        ↓
Capability Matrix
        ↓
Collaboration Graph
        ↓
Behavioural Diagnostics
════════════════════════════════════════
Executive Operating System
════════════════════════════════════════
Situational Awareness Model
        ↓
Projection Engine
        ↓
Future Decision Surface
        ↓
Future Attention Engine
        ↓
Future Behavioural Router
        ↓
Future Specialist Reasoning
        ↓
Future Execution
        ↓
Future Continuity
```

### Current Operational Truth, Not Remembered Conversation

> Situational Awareness represents the bounded operational facts currently relevant to the user's work. It is not a transcript, memory store, embedding index or reconstruction of past conversation.

The model is a projection, not an authoritative or independently editable source. Approved operational systems remain authoritative for their own facts. Bounded source states preserve availability and observation metadata without connector payloads, credentials, freshness calculations or claims. Raw email and document contents, sensitive records, conversation histories and general memories stay outside this data-minimised boundary.

Identity, roles, projects, commitments, waiting items, explicit source- or user-assigned priorities, active work and current context are represented as readonly plain data. Explicit priority is a supplied operational fact, not future Attention Engine ranking. Dates and instants are supplied ISO 8601 / RFC 3339 strings; the model does not read time or calculate lateness, urgency, conflicts or staleness.

`createSituationalAwareness` remains the sole model-construction boundary: it validates already-supplied facts and references, applies known-empty collection and unknown-context defaults, copies accepted data and deeply freezes the projection. The Projection Engine now owns the preceding observation boundary. Explicitly registered adapters produce canonical Projection Artifacts; the engine defensively copies and freezes them, validates them without constructing temporary snapshots, merges entity categories without interpretation, validates the merged input, rejects irreconcilable conflicts, orders entities and source states by stable identifier, and invokes `createSituationalAwareness` exactly once for each successful completed snapshot.

```text
Authoritative source
        ↓
Projection Adapter (observe and normalise)
        ↓
Projection Artifact (entities + provenance + availability)
        ↓
Structural and domain validation
        ↓
Deterministic merge
        ↓
createSituationalAwareness()
        ↓
Immutable Situational Awareness snapshot
        ↓
Explicit snapshot envelope (identifier + observation boundary)
        ↓
Snapshot Lifecycle (canonical structural comparison)
        ↓
Immutable deterministic change set
```

The Projection Engine is connector-neutral and runtime-neutral. Registration is explicit, adapter execution and merged collections have stable identifier ordering, and identical artifacts therefore yield identical JSON-compatible snapshots independently of registration order. Projection Artifacts retain full artifact-level provenance. Final snapshots retain bounded source-level provenance—source identifier, source kind, observation timestamp and availability—in the existing source-state collection; PR1 entities do not retain per-entity provenance. Exact duplicate observations are deduplicated, while same-ID observations that cannot jointly satisfy PR1 invariants fail deterministically. The deterministic-rejection architecture exposes no `MergeResult` or `MergeConflict` contract. No raw connector payload, credential or inferred operational significance enters the snapshot.

> The Situational Awareness Model describes what is currently represented as true. It does not determine what matters, what should happen next, which specialist should contribute or whether any action should be executed.

Successive canonical states enter the Snapshot Lifecycle only after projection. The lifecycle compares stable identifiers and canonical values, preserves previous/current records and source observation context, and reports additions, removals and modifications in deterministic order. It performs change detection, not reasoning: absence means only “present previously, absent currently,” never confirmed deletion. Interpretation, attention, action and runtime orchestration remain downstream and are not introduced by the lifecycle.

```text
Connectors
    ↓
Projection Adapters
    ↓
ProjectionArtifacts
    ↓
ProjectionEngine
    ↓
SituationalAwareness Snapshot
    ↓
Snapshot Lifecycle
    ↓
Deterministic Change Set
    ↓
Attention Policies
    ↓
Executive Attention Engine
    ↓
Executive Attention Queue
    ↓
Situation Formation Policies
    ↓
Executive Situation Engine
    ↓
Immutable Executive Situation Set
    ↓
Future Interpretation → Future Planning → Future Authorised Action
```

Observation is not interpretation, and a change is not importance. The Executive Attention Layer consumes only canonical lifecycle changes and selects those matching explicit deterministic policies. Inclusion is a policy match, not a decision, recommendation, alert, or plan. Queue order is structural and must never be interpreted downstream as priority or severity. The immutable queue introduces no behavioural routing, specialist invocation, persistence, UI, runtime consumer, or action.

Situation Formation is the next deterministic boundary. It groups Attention Records only when registered policies expose a shared canonical entity, explicit parent relationship, or explicit project/role reference; every unmatched record becomes a singleton. Every record belongs to exactly one immutable Executive Situation, and any competing claim aborts formation rather than selecting a winner. Situation and set ordering is structural, identities derive only from snapshot, policy, and sorted Attention Record identifiers, and membership retains the complete originating record plus its formation reason. The layer neither interprets a situation nor ranks, recommends, plans, routes, persists, or acts upon it.

## Architectural boundaries

## Candidate Plan Construction

```text
Executive Context
        +
Executive Intent Set
        +
Executive Constraint Set
        ↓
Candidate Plan Construction
        ↓
Immutable Candidate Plan Set
        ↓
Candidate Plan Constraint Evaluation
        ↓
Immutable Evaluated Candidate Plan Set
        ↓
Future Candidate Plan Comparison
        ↓
Future Executive Reasoning and Selection
```

Candidate Plan Construction instantiates only explicit, typed definitions admitted by registered deterministic policies. Calendar and email prose do not create plans. The resulting candidates are options: they are unranked, unevaluated, unapproved, inert, and non-executable. Constraint references record a configured relationship and are not compliance outcomes. An empty set is a valid deterministic result. Evaluation, comparison, selection, recommendations, action proposals, and execution remain downstream.

Candidate Plan Constraint Evaluation consumes the coherent Context, Intent Set, Constraint Set, and Candidate Plan Set. It annotates every unchanged candidate with independently identifiable typed findings. Evaluated candidates are structurally assessed and finding-preserving, but remain unranked, unselected, unapproved, non-recommended, inert, and non-executable. Missing evidence remains unresolved, conflicting typed evidence may be indeterminate, and unrelated constraints emit no finding. Finding counts are structural statistics: neither a finding nor an all-satisfied collection is an overall plan verdict. Comparison and Executive Reasoning remain future downstream boundaries.

### JARVIS

Responsible for:

- interpreting user intent;
- maintaining the overall operational picture;
- choosing whether specialist help is required;
- framing hand-offs;
- synthesising outputs when more than one specialist contributes.

Not responsible for:

- pretending to possess every specialist's expertise;
- taking consequential external action without authority;
- replacing PHDSS governance reasoning;
- concealing uncertainty or routing decisions.

### Specialists

Responsible for:

- performing work within a declared domain;
- using only the context required for that domain;
- identifying uncertainty and missing information;
- returning results in a form JARVIS or the user can act on.

Not responsible for:

- silently expanding their own mandate;
- modifying shared state without an explicit contract;
- taking external actions merely because a connector exists.

## Near-term target architecture

Sprint 2 should move towards:

- typed routing decisions;
- explicit hand-off envelopes;
- a registry-driven specialist capability model;
- structured action proposals separated from model prose;
- audit events for routing, context selection and action approval;
- provider-neutral model invocation;
- tests around context isolation and orchestration behaviour.

## Non-functional requirements

JARVIS should be:

- **Legible:** a developer can identify where behaviour belongs.
- **Bounded:** specialists and connectors have explicit authority limits.
- **Testable:** routing, context construction and data normalisation can be tested without the UI.
- **Recoverable:** `main` remains a deployable baseline and changes are reviewable.
- **Private by default:** secrets, OAuth tokens, memory and runtime state are never stored in the repository.
- **Human-governed:** consequential decisions and external actions remain subject to explicit human authority.
