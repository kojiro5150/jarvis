\# Sprint 3.26 — Situational Awareness Assembly

\#\# Document Authority

This sprint specification operates beneath the following governing hierarchy:

\`\`\`text  
Engineering Constitution  
        ↓  
JARVIS North Star  
        ↓  
JESS  
        ↓  
Accepted Architectural Decision Records  
        ↓  
Sprint Specifications  
        ↓  
Implementation  
\`\`\`

Where this specification conflicts with a higher-order constitutional document, the higher-order document prevails.

Implementation convenience shall not override architectural authority.

\---

\# Constitutional Status

Sprint 3.26 establishes the canonical assembly boundary between projected observations and executive interpretation.

It defines how validated ProjectionArtifacts are assembled into a coherent Situational Awareness snapshot.

This sprint does not introduce executive reasoning.

It does not introduce prioritisation.

It does not introduce DAWNWATCH.

It does not redefine the Executive Operating System.

The permanent responsibility boundary is:

\`\`\`text  
Connectors acquire observations.

Projection Adapters translate observations.

Projection Engine integrates artifacts.

Situational Awareness assembles observed executive reality.

Executive Operating System interprets executive reality.  
\`\`\`

Situational Awareness shall remain descriptive before it becomes interpretive.

\---

\# Sprint Objective

Implement one deterministic Situational Awareness assembly path:

\`\`\`text  
ProjectionArtifactSet  
        ↓  
SituationalAwarenessEngine  
        ↓  
ExecutiveStateSnapshot  
        ↓  
Existing Executive Operating System  
\`\`\`

The objective is to prove that canonical ProjectionArtifacts can be assembled into one stable, immutable and replayable representation of executive reality.

The objective is not to determine what the executive should do.

\---

\# Architectural Purpose

The Projection Engine answers:

\> What canonical observations exist?

Situational Awareness Assembly answers:

\> What is the current observed situation represented by those observations?

The Executive Operating System later answers:

\> What does that situation mean for the executive?

These questions shall remain architecturally separate.

\---

\# Core Architectural Principle

Situational Awareness is an organised representation of observed reality.

It is not:

\- a recommendation;  
\- a judgement;  
\- a priority ranking;  
\- a risk determination;  
\- an executive briefing;  
\- a summary produced by a language model;  
\- a substitute for human interpretation.

The assembler may organise observations.

It shall not assign meaning beyond explicitly defined deterministic semantics.

\---

\# Architectural Position

The completed observation pathway shall become:

\`\`\`text  
External Provider  
        ↓  
Connector  
        ↓  
Provider-Neutral Observation  
        ↓  
Projection Adapter  
        ↓  
ProjectionArtifact  
        ↓  
Projection Engine  
        ↓  
ProjectionArtifactSet  
        ↓  
SituationalAwarenessEngine  
        ↓  
ExecutiveStateSnapshot  
        ↓  
Executive Scenario / Runtime Configuration  
        ↓  
Executive Operating System  
\`\`\`

No connector-specific representation shall enter Situational Awareness.

No executive reasoning shall enter the assembler.

\---

\# Situational Awareness Responsibilities

The Situational Awareness layer may:

\- validate ProjectionArtifact inputs;  
\- organise artifacts by canonical type;  
\- preserve provenance;  
\- preserve lifecycle state;  
\- preserve temporal relationships;  
\- identify explicit deterministic conflicts;  
\- identify explicit deterministic gaps;  
\- construct a stable snapshot identity;  
\- publish immutable snapshots;  
\- support deterministic replay.

The Situational Awareness layer shall not:

\- infer priority;  
\- infer urgency;  
\- infer importance;  
\- infer intent;  
\- infer strategic value;  
\- infer hidden relationships;  
\- recommend actions;  
\- resolve executive trade-offs;  
\- rank commitments;  
\- call a language model;  
\- fetch external data;  
\- mutate source systems;  
\- introduce stochastic behaviour.

\---

\# Situational Awareness Snapshot

A ExecutiveStateSnapshot shall represent one deterministic view of observed executive reality at a defined lifecycle point.

Conceptually, it may contain:

\`\`\`text  
ExecutiveStateSnapshot  
├── identity  
├── observedAt  
├── commitments  
├── availability  
├── projects  
├── roles  
├── people  
├── communications  
├── risks  
├── source health  
├── provenance  
├── explicit conflicts  
└── explicit gaps  
\`\`\`

Only artifact categories supported by existing canonical contracts shall be populated.

The sprint shall not expand the canonical model merely to fill every conceptual category.

Unsupported categories shall remain absent or explicitly empty according to existing repository conventions.

\---

\# Snapshot Identity

Every ExecutiveStateSnapshot shall possess a stable deterministic identity.

Snapshot identity shall derive only from constitutionally defined inputs, such as:

\- lifecycle observation time;  
\- previous snapshot identity where already required by the existing model;  
\- canonical artifact identities;  
\- canonical artifact content;  
\- assembly contract version.

Snapshot identity shall not depend upon:

\- current system time;  
\- execution order;  
\- memory address;  
\- process identity;  
\- locale;  
\- filesystem order;  
\- network state;  
\- random values.

Identical canonical inputs shall produce identical snapshot identity.

\---

\# Snapshot Time

The assembler shall not invent time.

The snapshot observation time shall be supplied through the existing lifecycle boundary or another explicit canonical input.

The assembler shall not call the system clock to determine:

\- observedAt;  
\- createdAt;  
\- snapshot identity;  
\- conflict recency;  
\- commitment status.

Where temporal interpretation requires a reference time, that reference time shall be supplied explicitly.

\---

\# Assembly Semantics

Assembly shall be deterministic and non-destructive.

The assembler may:

\- group artifacts;  
\- order artifacts;  
\- index artifacts;  
\- expose canonical relationships already present in artifacts;  
\- report deterministic integrity conditions.

The assembler shall preserve:

\- source identity;  
\- artifact identity;  
\- provenance;  
\- lifecycle;  
\- timestamps;  
\- explicit references;  
\- canonical metadata.

The assembler shall not rewrite artifact meaning.

\---

\# Deterministic Organisation

Artifacts shall be organised through explicit canonical rules.

Organisation shall not depend upon:

\- provider response order;  
\- adapter execution order;  
\- object insertion order;  
\- locale-sensitive sorting;  
\- filesystem enumeration;  
\- runtime discovery.

Where collections are ordered, the ordering rule shall be explicit.

Stable canonical identity shall be the default final tie-breaker.

\---

\# Explicit Relationships

The assembler may expose relationships only where those relationships are already explicit in canonical artifacts.

Examples may include:

\- a commitment explicitly referencing a project;  
\- a commitment explicitly referencing a role;  
\- an artifact explicitly referencing a person;  
\- a source-health artifact explicitly referring to a connector source.

The assembler shall not infer relationships from:

\- titles;  
\- names;  
\- attendees;  
\- temporal proximity;  
\- shared words;  
\- repeated source metadata;  
\- language-model interpretation.

Absence of an explicit relationship shall remain absence.

\---

\# Conflict Semantics

Sprint 3.26 may identify only deterministic structural conflicts.

Examples may include:

\- overlapping blocking commitments;  
\- duplicate canonical artifact identity;  
\- contradictory explicit lifecycle states for the same canonical identity;  
\- references to canonical entities that are absent where the contract requires resolution;  
\- incompatible availability states at the same defined interval.

A structural conflict is an observed condition.

It is not an executive judgement.

The assembler shall not determine:

\- which commitment should win;  
\- which conflict matters most;  
\- whether the executive should cancel an event;  
\- whether a conflict is acceptable;  
\- whether a risk requires intervention.

Those are downstream responsibilities.

\---

\# Gap Semantics

The assembler may expose deterministic information gaps where an expected canonical relationship is explicitly unresolved.

A gap may include:

\- missing referenced entity;  
\- absent provenance required by the canonical contract;  
\- unsupported artifact category;  
\- incomplete lifecycle chain;  
\- unknown availability where the canonical model explicitly represents unknown.

A gap shall not be inferred merely because the system would prefer more information.

The assembler shall distinguish between:

\- invalid input;  
\- absent optional information;  
\- explicit unknown state;  
\- unresolved required reference.

\---

\# Immutability

Published ExecutiveStateSnapshots shall be recursively immutable.

Immutability shall apply to:

\- snapshot identity;  
\- metadata;  
\- artifact collections;  
\- indexes;  
\- conflicts;  
\- gaps;  
\- provenance views;  
\- nested canonical values.

The assembler shall not expose mutable references to:

\- input ProjectionArtifacts;  
\- ProjectionArtifactSet internals;  
\- previous snapshots;  
\- runtime configuration;  
\- internal indexes;  
\- test fixtures.

Defensive copying shall be used where required.

\---

\# Atomic Assembly

Situational Awareness assembly shall be atomic.

\`\`\`text  
All inputs valid  
        ↓  
Publish complete ExecutiveStateSnapshot  
\`\`\`

\`\`\`text  
Any required input invalid  
        ↓  
Publish no snapshot  
        ↓  
Return explicit deterministic failure  
\`\`\`

The assembler shall not publish a partially assembled snapshot unless a future specification explicitly introduces degraded assembly semantics.

Degraded assembly is outside Sprint 3.26.

\---

\# Deterministic Replay

The SituationalAwarenessEngine shall support offline deterministic replay.

Replay shall require only:

\- fixed ProjectionArtifacts;  
\- fixed lifecycle inputs;  
\- fixed assembly configuration where explicitly permitted;  
\- fixed contract versions.

Replay shall not require:

\- connectors;  
\- provider SDKs;  
\- network access;  
\- credentials;  
\- current system time;  
\- persistence;  
\- language models;  
\- mutable external state.

Identical replay inputs shall produce structurally identical snapshots, conflicts, gaps and failure results.

\---

\# Deliberately Narrow Scope

Sprint 3.26 shall initially assemble only canonical artifact types already supported by the repository.

The sprint shall prioritise:

\- commitments;  
\- availability;  
\- source provenance;  
\- lifecycle state;  
\- explicit references;  
\- deterministic temporal conflicts.

It shall not attempt to model the entire executive environment.

The success criterion is:

\> one coherent, deterministic Situational Awareness snapshot assembled from canonical observations.

The success criterion is not:

\> a complete executive briefing.  
..  
\---

\# Canonical Snapshot Contract

The Situational Awareness Snapshot is the canonical representation of observed executive reality.

It is the sole publication produced by the Situational Awareness Assembly layer.

The snapshot shall be:

\- deterministic;  
\- immutable;  
\- replayable;  
\- structurally complete;  
\- provenance-preserving;  
\- independent of executive interpretation.

The snapshot shall not contain recommendations, priorities or inferred meaning.

\---

\# Snapshot Structure

Conceptually, the ExecutiveStateSnapshot consists of:

\`\`\`text  
ExecutiveStateSnapshot  
├── snapshot identity  
├── lifecycle metadata  
├── observed executive state  
├── canonical artifact collections  
├── deterministic indexes  
├── explicit relationships  
├── explicit conflicts  
├── explicit information gaps  
├── provenance summary  
└── assembly metadata  
\`\`\`

Every section shall be derived exclusively from canonical ProjectionArtifacts.

No provider-specific structures shall appear within the snapshot.

\---

\# Assembly Pipeline

Assembly shall occur through the following deterministic sequence.

\`\`\`text  
ProjectionArtifactSet  
        ↓  
Input Validation  
        ↓  
Canonical Ordering  
        ↓  
Relationship Resolution  
        ↓  
Conflict Detection  
        ↓  
Gap Detection  
        ↓  
Snapshot Construction  
        ↓  
Snapshot Validation  
        ↓  
Immutable Publication  
\`\`\`

Failure at any stage shall prevent publication.

\---

\# Input Validation

The assembler shall validate every ProjectionArtifact before assembly.

Validation shall confirm:

\- canonical identity;  
\- artifact type;  
\- lifecycle state;  
\- provenance;  
\- required timestamps;  
\- JSON-compatible values;  
\- immutable representation.

Invalid artifacts shall terminate assembly.

The assembler shall not repair invalid artifacts.

\---

\# Canonical Ordering

Artifacts shall be organised using explicit deterministic ordering rules.

Ordering shall never depend upon:

\- connector execution order;  
\- adapter publication order;  
\- insertion order;  
\- locale;  
\- filesystem enumeration;  
\- runtime scheduling.

Where no domain-specific ordering exists, canonical identity shall determine ordering.

Ordering shall remain identical across deterministic replay.

\---

\# Relationship Resolution

Relationship resolution shall expose only relationships already represented explicitly within canonical artifacts.

Examples include:

\- commitment → project;  
\- commitment → role;  
\- commitment → person;  
\- artifact → source;  
\- artifact → previous canonical entity.

Relationship resolution shall not infer:

\- project membership;  
\- ownership;  
\- stakeholder importance;  
\- organisational hierarchy;  
\- behavioural intent.

Explicit relationships shall remain unchanged.

Absent relationships shall remain absent.

\---

\# Conflict Detection

The assembler may detect only deterministic structural conflicts.

Conflict detection shall identify conditions such as:

\- duplicate canonical identity;  
\- overlapping blocking commitments;  
\- incompatible lifecycle values;  
\- conflicting explicit availability;  
\- invalid required references.

Conflict detection shall not determine:

\- severity;  
\- importance;  
\- executive priority;  
\- recommended action;  
\- acceptable trade-offs.

Conflicts describe observed structural conditions only.

\---

\# Conflict Record

Each conflict shall contain:

\- conflict identifier;  
\- conflict type;  
\- participating artifact identities;  
\- deterministic rule violated;  
\- supporting provenance;  
\- observation timestamp.

Conflict records shall be immutable.

Conflict identifiers shall remain stable across deterministic replay.

\---

\# Information Gap Detection

The assembler may identify explicit information gaps.

Gap detection shall report:

\- unresolved required references;  
\- unsupported artifact categories;  
\- incomplete provenance;  
\- explicitly unknown values;  
\- missing canonical entities required by contract.

Gap detection shall distinguish between:

\- optional absence;  
\- required absence;  
\- explicit unknown;  
\- invalid input.

The assembler shall not speculate about missing information.

\---

\# Deterministic Indexes

The snapshot may expose indexes for efficient downstream access.

Indexes may include:

\- commitments by identity;  
\- commitments by lifecycle;  
\- commitments by temporal ordering;  
\- artifacts by type;  
\- artifacts by source;  
\- explicit relationships.

Indexes are implementation aids.

Indexes shall not alter canonical meaning.

Indexes shall be reproducible during replay.

\---

\# Provenance Preservation

Situational Awareness shall preserve complete provenance.

Every published observation shall remain traceable to:

\- provider;  
\- connector source;  
\- adapter;  
\- source observation;  
\- ProjectionArtifact;  
\- assembly version.

Assembly shall never discard provenance.

The assembler may aggregate provenance summaries but shall preserve individual provenance records.

\---

\# Snapshot Validation

Prior to publication, the snapshot shall be validated.

Validation shall confirm:

\- snapshot identity;  
\- artifact consistency;  
\- deterministic ordering;  
\- relationship integrity;  
\- conflict integrity;  
\- provenance completeness;  
\- immutable representation.

Publication shall occur only after successful validation.

\---

\# Failure Taxonomy

Assembly failures shall be explicit.

Minimum categories include:

\#\# Artifact Validation Failure

Input ProjectionArtifact violates the canonical contract.

\#\# Relationship Resolution Failure

A required explicit reference cannot be resolved.

\#\# Duplicate Artifact Failure

Multiple artifacts possess the same canonical identity.

\#\# Conflict Construction Failure

A structural conflict cannot be represented according to the canonical conflict contract.

\#\# Snapshot Validation Failure

The assembled snapshot fails canonical validation.

\#\# Configuration Failure

Explicit deterministic assembly configuration cannot be resolved.

Failures shall remain deterministic and reproducible.

\---

\# Atomic Publication

Snapshot publication shall be atomic.

\`\`\`text  
All stages succeed  
        ↓  
Publish immutable snapshot  
\`\`\`

\`\`\`text  
Any stage fails  
        ↓  
Publish nothing  
        ↓  
Return deterministic failure  
\`\`\`

Partial snapshot publication is outside Sprint 3.26.

\---

\# Snapshot Equality

Replay equality shall be based upon canonical structural equality.

Property insertion order shall not affect equality.

Ordered collections shall preserve constitutional ordering.

Semantically identical snapshots shall compare equal across replay.

\---

\# Existing Architecture Preservation

Sprint 3.26 shall preserve:

\- ProjectionArtifact contracts;  
\- ProjectionArtifactSet lifecycle semantics;  
\- Projection Engine behaviour;  
\- Calendar Projection Adapter behaviour;  
\- Executive Scenario contracts;  
\- Executive Operating System runtime.

Situational Awareness Assembly consumes existing canonical artifacts.

It shall not redefine upstream architecture.

\---

\# Verification Requirements

The implementation shall demonstrate:

\- deterministic snapshot construction;  
\- deterministic conflict detection;  
\- deterministic gap detection;  
\- immutable publication;  
\- replay equality;  
\- Projection Engine compatibility;  
\- Executive Operating System compatibility.

Repository verification shall include:

\`\`\`bash  
npm test  
npm run lint  
npm run typecheck  
npm run build  
git diff \--check  
\`\`\`

Where the repository uses a different canonical typecheck command, that command shall be used and reported accurately.

\---

\# Constitutional Principle

Projection Adapters answer:

\> "What happened?"

Situational Awareness answers:

\> "What exists?"

The Executive Operating System answers:

\> "What does it mean?"

These responsibilities shall remain permanently distinct.  
..  
\---

\# Repository Architecture

Sprint 3.26 establishes the permanent repository boundary for Situational Awareness Assembly.

Situational Awareness is a distinct architectural layer.

It is neither part of the Projection Engine nor part of the Executive Operating System.

The repository shall preserve this separation permanently.

\---

\# Architectural Layer

Situational Awareness occupies the constitutional boundary between canonical observations and executive interpretation.

\`\`\`text  
ProjectionArtifactSet  
        ↓  
SituationalAwarenessEngine  
        ↓  
ExecutiveStateSnapshot  
        ↓  
Executive Operating System  
\`\`\`

Only the ExecutiveStateSnapshot shall cross this boundary.

ProjectionArtifacts remain internal implementation inputs.

\---

\# Package Responsibilities

The Situational Awareness package owns:

\- snapshot contracts;  
\- assembly logic;  
\- deterministic organisation;  
\- explicit relationship resolution;  
\- structural conflict detection;  
\- deterministic information-gap detection;  
\- snapshot validation;  
\- snapshot publication;  
\- snapshot replay;  
\- package documentation;  
\- assembly-specific tests.

The package shall not own:

\- connector implementation;  
\- Projection Adapter implementation;  
\- ProjectionArtifact construction;  
\- executive reasoning;  
\- orchestration;  
\- persistence;  
\- user interfaces;  
\- language-model interaction.

\---

\# Public Contracts

Situational Awareness shall expose only stable public contracts.

Public contracts may include:

\- ExecutiveStateSnapshot;  
\- snapshot metadata;  
\- snapshot identity;  
\- conflict contracts;  
\- gap contracts;  
\- assembly result contracts;  
\- assembly failure contracts.

Internal indexes and implementation structures shall remain private.

Consumers shall depend only upon published contracts.

\---

\# Assembly Interface

Every Situational Awareness implementation shall expose one deterministic assembly interface.

Conceptually:

\`\`\`text  
ProjectionArtifactSet  
        ↓  
assemble()  
        ↓  
ExecutiveStateSnapshot  
\`\`\`

Assembly is the sole constitutional responsibility.

\---

\# Snapshot Identity

Every ExecutiveStateSnapshot shall possess:

\- snapshot identifier;  
\- snapshot version;  
\- assembly version;  
\- observed lifecycle point;  
\- canonical artifact summary.

Snapshot identity shall remain immutable after publication.

Stable identity supports:

\- deterministic replay;  
\- audit;  
\- provenance;  
\- executive reproducibility.

\---

\# Assembly Metadata

Every snapshot shall publish deterministic metadata describing:

\- assembly version;  
\- canonical contract version;  
\- artifact count;  
\- artifact categories;  
\- conflict count;  
\- information-gap count;  
\- provenance summary.

Metadata exists to support transparency.

Metadata shall not influence assembly behaviour.

\---

\# Repository Boundaries

Situational Awareness shall not import:

\- connector SDKs;  
\- provider APIs;  
\- authentication;  
\- Projection Adapter implementation details;  
\- Executive Operating System policy;  
\- executive reasoning;  
\- orchestration;  
\- UI components;  
\- persistence.

Likewise, downstream architectural layers shall not depend upon assembler implementation details.

The snapshot remains the sole published boundary.

\---

\# Canonical Package Layout

The repository shall preserve clear architectural separation.

\`\`\`text  
connectors/  
        ↓  
projection-adapters/  
        ↓  
projection-engine/  
        ↓  
situational-awareness/  
        ↓  
executive-operating-system/  
        ↓  
executive-modules/  
\`\`\`

Each layer depends only upon the immediately preceding published contracts.

Circular dependencies are prohibited.

\---

\# Constitutional Repository Rules

Situational Awareness shall never become:

\- a Projection Engine;  
\- an Executive Operating System;  
\- a reasoning engine;  
\- a planner;  
\- an orchestration framework;  
\- a language-model wrapper.

Its purpose is singular:

To assemble canonical observations into a deterministic representation of executive reality.

Repository evolution shall preserve this responsibility.

\---

\# Future Evolution

Future assembly capabilities may include:

\- richer artifact categories;  
\- richer deterministic relationships;  
\- explicit organisational structures;  
\- environmental state;  
\- connector health;  
\- enterprise topology;  
\- cross-source integrity checks.

Future evolution shall preserve:

\- deterministic assembly;  
\- explicit provenance;  
\- immutable publication;  
\- replay;  
\- structural conflict detection;  
\- structural information-gap detection.

Future work shall not redefine the constitutional responsibility of Situational Awareness.

\---

\# Architectural Decision Records

Material architectural changes affecting Situational Awareness shall be recorded through Architectural Decision Records.

Implementation convenience shall never establish architectural precedent.

Where uncertainty exists:

\- preserve existing architecture;  
\- document the issue;  
\- create an ADR only where a genuine architectural decision is required.

\---

\# Architectural Constraints

The following responsibilities shall remain permanently distinct.

Connectors acquire observations.

Projection Adapters translate observations.

Projection Engine integrates canonical observations.

Situational Awareness assembles observed executive reality.

Executive Operating System interprets observed executive reality.

Executive modules consume executive interpretation.

No architectural layer shall assume the constitutional responsibilities of another.

This separation is fundamental to the long-term architecture of JARVIS.

\---

\# Future Consumers

The ExecutiveStateSnapshot is intended to become the canonical input for future executive modules.

Examples include:

\- DAWNWATCH;  
\- MARCUS;  
\- STEVE;  
\- PHDSS Executive Mode;  
\- Executive Briefing;  
\- Notification Engine;  
\- Decision Support modules.

Future consumers shall depend upon the published snapshot contract.

They shall not access ProjectionArtifacts directly unless a separate constitutional specification explicitly permits it.

The snapshot therefore becomes the single authoritative representation of executive reality within JARVIS.  
..  
\---

\# Validation Architecture

Validation is a constitutional boundary.

No ProjectionArtifactSet shall be assembled before validation.

No ExecutiveStateSnapshot shall be published before validation.

Validation shall remain deterministic, explicit and side-effect free.

The validation lifecycle is:

\`\`\`text  
ProjectionArtifactSet  
        ↓  
Input Validation  
        ↓  
Canonical Organisation  
        ↓  
Relationship Resolution  
        ↓  
Conflict Detection  
        ↓  
Gap Detection  
        ↓  
Snapshot Construction  
        ↓  
Snapshot Validation  
        ↓  
Immutable Publication  
\`\`\`

Failure at any stage shall terminate assembly.

\---

\# ProjectionArtifact Validation

The SituationalAwarenessEngine shall validate every ProjectionArtifact received from the Projection Engine.

Validation shall verify:

\- canonical identity;  
\- artifact type;  
\- lifecycle state;  
\- provenance completeness;  
\- deterministic timestamps;  
\- immutable representation;  
\- JSON-compatible values;  
\- canonical contract compliance.

Validation shall reject:

\- duplicate canonical identities;  
\- malformed timestamps;  
\- invalid provenance;  
\- unsupported artifact types;  
\- non-deterministic values;  
\- mutable artifact references.

Validation shall not:

\- repair artifacts;  
\- infer missing values;  
\- modify upstream artifacts;  
\- silently discard invalid artifacts.

\---

\# Relationship Validation

Only explicit canonical relationships shall be validated.

Validation shall confirm:

\- referenced entities exist where required;  
\- explicit references resolve deterministically;  
\- canonical identifiers remain valid;  
\- relationship targets satisfy the published contract.

Relationship validation shall not infer relationships.

\---

\# Conflict Validation

Conflict detection shall validate structural consistency only.

Supported conflict categories include:

\- overlapping blocking commitments;  
\- duplicate artifact identity;  
\- incompatible lifecycle states;  
\- contradictory availability;  
\- unresolved required references.

Conflict validation shall not determine:

\- severity;  
\- executive importance;  
\- scheduling preference;  
\- recommended action.

Conflict records describe observed structure only.

\---

\# Gap Validation

Gap detection shall distinguish between:

\- optional absence;  
\- explicit unknown;  
\- unresolved required reference;  
\- invalid input.

Information gaps shall be deterministic.

The assembler shall not speculate about missing information.

\---

\# Snapshot Validation Result

Validation shall produce an explicit deterministic result.

Validation results shall identify:

\- snapshot identity where available;  
\- validation outcome;  
\- failing stage;  
\- failing rule;  
\- stable failure code;  
\- explanatory message.

Stable failure codes support replay and operational diagnosis.

\---

\# Assembly Semantics

Assembly shall be deterministic.

Assembly may:

\- organise artifacts;  
\- group canonical entities;  
\- preserve explicit relationships;  
\- expose deterministic indexes;  
\- expose structural conflicts;  
\- expose structural gaps.

Assembly shall not:

\- reinterpret artifacts;  
\- infer intent;  
\- infer organisational meaning;  
\- infer strategic significance;  
\- alter provenance.

\---

\# Deterministic Ordering

Snapshot publication shall use explicit deterministic ordering.

Ordering shall not depend upon:

\- adapter execution order;  
\- connector order;  
\- filesystem order;  
\- insertion order;  
\- locale-sensitive comparison;  
\- runtime scheduling.

Canonical identity shall be the default tie-breaker.

\---

\# Snapshot Identity Validation

Snapshot identity shall derive exclusively from deterministic canonical inputs.

Identity shall never depend upon:

\- current time;  
\- random values;  
\- process identity;  
\- memory location;  
\- runtime sequence.

Identical canonical inputs shall produce identical snapshot identity.

\---

\# Atomic Assembly

Assembly shall be atomic.

\`\`\`text  
All inputs valid  
        ↓  
Publish immutable snapshot  
\`\`\`

\`\`\`text  
Any validation failure  
        ↓  
Publish nothing  
        ↓  
Return deterministic failure  
\`\`\`

Partial snapshots are outside Sprint 3.26.

\---

\# Immutability

Published ExecutiveStateSnapshots shall be recursively immutable.

The assembler shall not expose mutable references to:

\- ProjectionArtifacts;  
\- ProjectionArtifactSets;  
\- internal indexes;  
\- conflict records;  
\- gap records;  
\- provenance structures.

Defensive copying shall be used where required.

\---

\# Replay Guarantees

Offline replay shall require only:

\- ProjectionArtifacts;  
\- deterministic assembly configuration;  
\- contract versions;  
\- lifecycle inputs.

Replay shall not require:

\- connectors;  
\- adapters;  
\- authentication;  
\- provider SDKs;  
\- persistence;  
\- system time;  
\- language models;  
\- network access.

Identical inputs shall produce identical:

\- snapshot identity;  
\- snapshot structure;  
\- ordering;  
\- conflicts;  
\- gaps;  
\- provenance;  
\- validation results.

\---

\# Replay Fixtures

Sprint 3.26 shall introduce deterministic fixtures representing assembled executive situations.

Fixtures shall include:

\- a single commitment;  
\- multiple independent commitments;  
\- overlapping commitments;  
\- conflicting availability;  
\- unresolved required references;  
\- empty but valid executive state.

Invalid fixtures shall include:

\- duplicate artifact identity;  
\- malformed artifact;  
\- invalid provenance;  
\- unresolved required relationship;  
\- unsupported artifact type.

Fixtures shall remain:

\- local;  
\- immutable;  
\- deterministic;  
\- credential-free;  
\- suitable for repeated replay.

\---

\# Test Architecture

Testing shall prove architectural behaviour.

The suite shall include:

\#\# Assembly Tests

Verify deterministic snapshot construction.

\#\# Validation Tests

Verify invalid artifacts fail deterministically.

\#\# Relationship Tests

Verify explicit relationships only.

\#\# Conflict Tests

Verify deterministic structural conflict detection.

\#\# Gap Tests

Verify deterministic gap reporting.

\#\# Identity Tests

Verify stable snapshot identity.

\#\# Ordering Tests

Verify deterministic ordering.

\#\# Immutability Tests

Verify published snapshots cannot be mutated.

\#\# Replay Tests

Verify identical replay output.

\#\# EOS Integration Tests

Verify snapshot compatibility with the existing Executive Operating System.

\---

\# Existing Contract Preservation

Sprint 3.26 shall preserve:

\- ProjectionArtifact contracts;  
\- ProjectionArtifactSet lifecycle semantics;  
\- Projection Engine interfaces;  
\- Calendar Projection Adapter interfaces;  
\- Executive Scenario contracts;  
\- Executive Operating System runtime.

Only the Situational Awareness boundary shall be introduced.

No upstream contracts shall be expanded merely to simplify implementation.

\---

\# Verification Requirements

Before completion, Codex shall execute:

\`\`\`bash  
npm test  
npm run lint  
npm run typecheck  
npm run build  
git diff \--check  
\`\`\`

If the repository uses an alternative typecheck command, that command shall be used and reported accurately.

Focused verification shall additionally include:

\- Situational Awareness tests;  
\- Projection Engine integration tests;  
\- replay tests;  
\- Executive Operating System integration tests.

\---

\# Acceptance Criteria

Sprint 3.26 is complete only when all of the following are satisfied.

\#\# Architectural Acceptance

\- One SituationalAwarenessEngine exists.  
\- One immutable ExecutiveStateSnapshot contract exists.  
\- Assembly remains independent of executive reasoning.  
\- No connector or adapter responsibilities enter the assembler.  
\- Existing EOS architecture remains unchanged.

\#\# Deterministic Acceptance

\- Stable snapshot identity.  
\- Stable ordering.  
\- Stable conflict detection.  
\- Stable gap detection.  
\- Stable replay.

\#\# Validation Acceptance

\- Invalid artifacts fail explicitly.  
\- Duplicate identities fail explicitly.  
\- Partial publication is impossible.  
\- No silent repair occurs.

\#\# Repository Acceptance

\- Clear package boundary.  
\- Stable public contracts.  
\- No runtime discovery.  
\- No connector dependencies.  
\- No UI or persistence.

\#\# Testing Acceptance

\- Assembly tests pass.  
\- Conflict tests pass.  
\- Gap tests pass.  
\- Replay tests pass.  
\- EOS integration tests pass.  
\- Complete repository verification passes.

\---

\# Explicit Non-Goals

Sprint 3.26 shall not:

\- perform executive reasoning;  
\- produce recommendations;  
\- infer priorities;  
\- infer strategic importance;  
\- implement DAWNWATCH;  
\- implement MARCUS;  
\- implement STEVE;  
\- implement notifications;  
\- implement planning;  
\- redesign the Projection Engine;  
\- redesign the Executive Operating System.

These exclusions are deliberate constitutional scope controls.  
..  
\---

\# Document Status

Sprint 3.26 is an implementation specification.

It establishes the first production Situational Awareness Assembly layer within the JARVIS Executive Operating System.

This specification defines the constitutional implementation boundaries for deterministic assembly of canonical executive state.

It does not redefine:

\- Connectors;  
\- Projection Adapters;  
\- Projection Engine;  
\- Executive Operating System;  
\- Executive Scenarios.

\---

\# Codex Implementation Instruction

You are implementing Sprint 3.26 in the JARVIS repository.

Your responsibility is to implement this specification faithfully while preserving the constitutional architecture already established by:

\- the Engineering Constitution;  
\- the JARVIS North Star;  
\- JESS;  
\- accepted Architectural Decision Records;  
\- Sprint 3.24.2;  
\- Sprint 3.24.2a;  
\- Sprint 3.25;  
\- the deterministic Executive Operating System.

Where implementation convenience conflicts with constitutional architecture, constitutional architecture shall prevail.

\---

\# Implementation Objective

Implement one deterministic Situational Awareness Assembly layer.

The implementation shall demonstrate one complete deterministic assembly path:

\`\`\`text  
ProjectionArtifactSet  
        ↓  
SituationalAwarenessEngine  
        ↓  
ExecutiveStateSnapshot  
        ↓  
Existing Executive Operating System  
\`\`\`

The objective is to prove the assembly boundary.

The objective is not to implement executive reasoning.

\---

\# Required Working Method

Before modifying the repository:

1\. Read this specification completely.  
2\. Review Sprint 3.25.  
3\. Review existing ProjectionArtifact contracts.  
4\. Review existing ProjectionArtifactSet lifecycle semantics.  
5\. Review the Projection Engine.  
6\. Review Executive Scenario architecture.  
7\. Trace the current observation lifecycle through EOS.

Do not redesign existing architecture unless a demonstrable constitutional defect prevents implementation.

\---

\# Required Implementation Order

Implement in the following order:

1\. Snapshot contract.  
2\. Assembly interface.  
3\. Input validation.  
4\. Deterministic ordering.  
5\. Relationship resolution.  
6\. Conflict detection.  
7\. Gap detection.  
8\. Snapshot identity.  
9\. Snapshot validation.  
10\. Immutable publication.  
11\. Replay fixtures.  
12\. Tests.  
13\. Documentation.  
14\. ADR only if genuinely required.

Each stage shall remain independently reviewable.

\---

\# Scope Constraints

This sprint shall implement only:

\- ExecutiveStateSnapshot;  
\- SituationalAwarenessEngine;  
\- deterministic assembly;  
\- deterministic conflict detection;  
\- deterministic gap detection;  
\- validation;  
\- replay support;  
\- tests;  
\- documentation.

Do not implement:

\- executive reasoning;  
\- DAWNWATCH;  
\- MARCUS;  
\- STEVE;  
\- notification engines;  
\- planning;  
\- scheduling optimisation;  
\- language-model reasoning;  
\- priority inference;  
\- recommendation engines;  
\- orchestration;  
\- persistence;  
\- UI.

Those belong to later architectural work.

\---

\# Architectural Constraints

Maintain the following separation.

Projection Engine

\- integrates canonical observations.

Situational Awareness

\- assembles canonical executive reality.

Executive Operating System

\- interprets executive reality.

Executive Modules

\- consume executive interpretation.

These responsibilities shall remain distinct.

\---

\# Existing Architecture Must Remain Intact

Do not modify:

\- ProjectionArtifact contracts;  
\- ProjectionArtifactSet lifecycle semantics;  
\- Projection Engine behaviour;  
\- Calendar Projection Adapter behaviour;  
\- Executive Scenario contracts;  
\- Executive Operating System runtime.

The assembler shall integrate into the existing repository.

It shall not require downstream redesign.

\---

\# Deterministic Guarantees

The implementation shall preserve deterministic:

\- validation;  
\- ordering;  
\- assembly;  
\- conflict detection;  
\- gap detection;  
\- identity;  
\- replay;  
\- publication.

No implementation may depend upon:

\- current time;  
\- randomness;  
\- locale;  
\- filesystem order;  
\- connector execution order;  
\- external services;  
\- language models.

\---

\# Testing Requirements

Add focused tests proving:

\- deterministic assembly;  
\- validation;  
\- explicit relationship resolution;  
\- deterministic conflict detection;  
\- deterministic gap detection;  
\- snapshot identity;  
\- immutable publication;  
\- replay equality;  
\- Executive Operating System compatibility.

Run the complete repository verification suite before completion.

\---

\# Documentation Requirements

Update documentation only where required.

Document:

\- package ownership;  
\- repository boundaries;  
\- snapshot contract;  
\- assembly responsibilities;  
\- deterministic behaviour;  
\- replay support.

Do not rewrite unrelated sprint specifications.

\---

\# Completion Report

Return a structured report containing:

\#\# 1\. Sprint Summary

State whether Sprint 3.26 is:

\- fully implemented;  
\- implemented with documented limitations;  
\- partially implemented.

\---

\#\# 2\. Architecture

Describe the implemented execution path.

\`\`\`text  
ProjectionArtifactSet  
        ↓  
SituationalAwarenessEngine  
        ↓  
ExecutiveStateSnapshot  
        ↓  
Executive Operating System  
\`\`\`

\---

\#\# 3\. Requirement Traceability

Map every major requirement to:

\- implementation;  
\- tests;  
\- completion status.

\---

\#\# 4\. Files Changed

Separate:

\- contracts;  
\- implementation;  
\- fixtures;  
\- tests;  
\- documentation;  
\- ADRs.

\---

\#\# 5\. Architectural Preservation

Explicitly confirm preservation of:

\- ProjectionArtifact contracts;  
\- ProjectionArtifactSet;  
\- Projection Engine;  
\- Calendar Projection Adapter;  
\- Executive Scenario Framework;  
\- Executive Operating System;  
\- deterministic replay;  
\- backward compatibility.

\---

\#\# 6\. Deterministic Guarantees

Explain how the implementation preserves:

\- stable snapshot identity;  
\- stable ordering;  
\- immutable publication;  
\- structural equality;  
\- deterministic conflict detection;  
\- deterministic gap detection;  
\- replay.

\---

\#\# 7\. Verification Evidence

Report exact results for:

\- focused Situational Awareness tests;  
\- Projection Engine integration tests;  
\- replay tests;  
\- Executive Operating System integration tests;  
\- complete repository test suite;  
\- lint;  
\- typecheck;  
\- build;  
\- git diff \--check.

\---

\#\# 8\. Deferred Work

Identify work intentionally left for future sprints, including:

\- DAWNWATCH;  
\- Executive Modules;  
\- planning;  
\- recommendations;  
\- priority inference;  
\- orchestration;  
\- notification engine;  
\- richer artifact categories;  
\- future executive reasoning.

Do not claim future capabilities have been implemented.

\---

\# Sprint Completion Standard

Sprint 3.26 is complete when the repository demonstrates that canonical ProjectionArtifacts can be assembled into one deterministic, immutable, replayable ExecutiveStateSnapshot without introducing executive reasoning, connector behaviour or Projection Adapter responsibilities into the assembly layer.

The snapshot shall become the single canonical representation of observed executive reality.

Generalisation is intentionally deferred.

The success criterion is one production-quality assembly layer that faithfully bridges the Projection Engine and the Executive Operating System while preserving all existing constitutional architecture.  
