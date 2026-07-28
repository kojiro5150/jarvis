# Sprint 3.25 — First Production Projection Adapter

## Calendar Projection Adapter

**Specification Type:** Implementation Sprint Specification  
**Architectural Layer:** External Observation Projection  
**Repository Status:** Ready for implementation  
**Predecessor:** Sprint 3.24.2a — Executive Scenario Framework  
**Primary Objective:** Prove that real connector observations can enter the canonical Executive Operating System through deterministic ProjectionArtifacts without connector logic leaking into the projection model, Projection Engine or executive runtime.

---

# Document Authority and Codex Instruction

This document is the authoritative implementation specification for Sprint 3.25.

Codex shall implement this sprint exactly within the architectural boundaries established by:

1. the Engineering Constitution;
2. the JARVIS North Star;
3. JESS;
4. accepted Architectural Decision Records;
5. completed Executive Operating System sprint specifications;
6. Sprint 3.24.2 and Sprint 3.24.2a;
7. this specification.

Where implementation convenience conflicts with constitutional architecture, constitutional architecture shall prevail.

Codex shall not redesign prior work unless implementation reveals a demonstrable architectural defect.

Any genuine architectural ambiguity that cannot be resolved from the governing hierarchy shall be documented explicitly rather than resolved through undocumented implementation behaviour.

---

# Constitutional Status

Sprint 3.25 establishes the first production observation boundary of the JARVIS Executive Operating System.

The sprint does not add executive reasoning.

It does not change the Projection Engine.

It does not change Situational Awareness.

It does not change the Executive Operating System runtime.

It proves that observations originating in a real external system can be transformed into canonical, validated and provenance-bearing ProjectionArtifacts through a narrow deterministic adapter.

The enduring architectural distinction is:

> Connectors observe external systems.

> Projection Adapters translate connector observations into canonical executive observations.

> The Projection Engine integrates canonical observations.

> The Executive Operating System interprets the resulting executive situation.

These responsibilities shall remain separate.

---

# Sprint Objective

Sprint 3.25 shall implement one production Projection Adapter:

> **CalendarProjectionAdapter**

The adapter shall convert existing calendar connector output into validated ProjectionArtifacts representing executive commitments, availability and source provenance.

The sprint shall demonstrate the complete path from connector observation to canonical executive input without introducing connector-specific knowledge into downstream architectural layers.

The sprint succeeds when a deterministic Calendar Projection Adapter can:

- accept a defined calendar observation contract;
- validate the supplied observations;
- translate calendar events into canonical ProjectionArtifacts;
- preserve source provenance;
- produce stable identifiers;
- represent relevant time information;
- represent availability through explicit deterministic rules;
- reject invalid or unsupported observations explicitly;
- supply its output through the existing Projection Engine contract;
- support deterministic replay without external network access.

---

# Core Architectural Question

Sprint 3.25 exists to answer one architectural question:

> Can a real external observation source be projected into the canonical Situational Awareness model without connector behaviour leaking into the model, engine or runtime?

The implementation shall answer this through one complete vertical slice.

It shall not attempt to anticipate every future connector or observation type.

Calendar is selected because it is:

- structurally bounded;
- already represented by an existing connector boundary;
- deterministic enough for replay;
- directly relevant to executive commitments and availability;
- rich enough to test identity, time, provenance and lifecycle;
- easier to verify against source observations than inferred email, project or priority state.

---

# Architectural Position

The Calendar Projection Adapter occupies one precise position in the JARVIS architecture:

```text
Google Calendar
        ↓
Calendar Connector
        ↓
Calendar Connector Observation
        ↓
CalendarProjectionAdapter
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
        ↓
Situational Awareness
        ↓
Executive Scenario or Live Runtime Input
        ↓
Executive Operating System
```

The adapter is a translation boundary.

It is not a connector.

It is not a Projection Engine.

It is not a reasoning stage.

It is not an executive policy component.

It is not an orchestration mechanism.

---

# Architectural Responsibilities

The Calendar Projection Adapter owns only the deterministic translation of validated calendar observations into canonical ProjectionArtifacts.

It may:

- validate calendar observation structure;
- normalise supported deterministic representations;
- derive stable projection identifiers from source identity;
- map calendar events to executive commitments;
- preserve event timing;
- preserve source provenance;
- represent explicitly defined availability state;
- emit deterministic ProjectionArtifactSets;
- reject unsupported or invalid input.

It shall not:

- fetch calendar data;
- authenticate with Google;
- refresh connector tokens;
- infer executive priority;
- infer urgency;
- infer strategic significance;
- infer project membership;
- infer personal roles;
- infer hidden intent;
- decide whether an event should be attended;
- resolve calendar conflicts;
- recommend executive action;
- modify the Projection Engine;
- modify the Executive Operating System;
- persist external observations;
- call an LLM;
- introduce stochastic behaviour.

---

# Governing Separation of Concerns

The following boundaries are permanent.

## Connector responsibility

The connector is responsible for acquiring external calendar observations.

The connector may know:

- Google Calendar APIs;
- authentication;
- pagination;
- provider-specific response formats;
- synchronisation state;
- external identifiers.

The connector shall not construct executive meaning.

## Adapter responsibility

The adapter is responsible for translating connector observations into canonical ProjectionArtifacts.

The adapter may know:

- the connector observation contract;
- the canonical ProjectionArtifact contract;
- deterministic calendar translation rules.

The adapter shall not know:

- executive reasoning policy;
- runtime orchestration;
- downstream action selection;
- presentation logic.

## Projection Engine responsibility

The Projection Engine is responsible for integrating valid ProjectionArtifacts into canonical Situational Awareness.

It shall not know:

- Google Calendar response formats;
- provider authentication;
- connector pagination;
- adapter-specific mapping logic.

## Executive Operating System responsibility

The Executive Operating System is responsible for interpreting the resulting executive situation.

It shall not know:

- which connector produced an observation;
- how provider-specific data was translated;
- how calendar APIs operate;
- how an adapter obtained its input.

Source provenance may remain available for transparency and audit, but provider-specific implementation behaviour shall not influence executive reasoning unless a later constitutional specification explicitly permits it.

---

# Deliberately Narrow Sprint Scope

Sprint 3.25 shall project only:

- calendar events as executive commitments;
- source provenance;
- source and projection identifiers;
- relevant timestamps;
- deterministic availability state;
- event lifecycle state where explicitly represented by source data;
- optional role or project references only where supplied through explicit deterministic configuration.

Sprint 3.25 shall not project:

- inferred priority;
- inferred urgency;
- inferred importance;
- inferred organisational role;
- inferred project association;
- attendee sentiment;
- relationship significance;
- behavioural recommendations;
- email-derived context;
- meeting preparation requirements;
- travel requirements;
- workload estimates;
- inferred conflict resolution.

Absence of these capabilities is intentional.

The first production adapter exists to prove architectural translation, not semantic intelligence.

---

# Sprint Completion Principle

Sprint 3.25 is complete when one production adapter proves the architectural boundary end to end.

It is not complete because a general adapter framework exists.

It is not improved by adding multiple adapters.

It is not improved by anticipating every future projection source.

The sprint shall prefer one deeply validated vertical slice over premature generalisation.

The governing implementation principle is:

> **First prove that one real observation source can enter the constitutional architecture correctly. Generalise only from evidence produced by that implementation.**

---

# Constitutional Hierarchy

Sprint 3.25 shall be interpreted according to the constitutional hierarchy established for the JARVIS repository.

```text
Engineering Constitution
        ↓
North Star
        ↓
JESS
        ↓
Sprint Specifications
        ↓
Architectural Decision Records
        ↓
Repository Implementation
```

Repository implementation shall remain the consequence of constitutional architecture rather than the source of architectural truth.

---

# Engineering Principles

## Architecture Before Implementation

Projection Adapter architecture shall be established before adapter implementation.

The repository shall not generalise from hypothetical future adapters.

Instead, a single production adapter shall establish the architectural precedent from which future adapter abstractions may emerge.

## Deterministic Before Adaptive

Projection Adapters transform observations.

They do not interpret observations.

Every supported source observation shall produce identical ProjectionArtifacts when supplied with identical input.

No adapter shall introduce stochastic behaviour.

## Translation Before Reasoning

Projection Adapters exist solely to translate one representation into another.

Executive reasoning begins only after canonical ProjectionArtifacts enter the Projection Engine.

Adapters shall therefore remain behaviourally neutral.

## Explicit Provenance Before Convenience

Every ProjectionArtifact shall preserve explicit source provenance.

Future repository users shall always be able to determine:

- where an observation originated;
- which adapter produced it;
- when it was observed;
- which source identifier generated it.

No ProjectionArtifact shall lose provenance information during translation.

## Validation Before Projection

Invalid observations shall never enter the Projection Engine.

Validation shall occur before ProjectionArtifact construction.

The adapter shall reject unsupported observations explicitly rather than silently repairing them.

## Behaviour Before Orchestration

Projection Adapters define deterministic translation behaviour.

They do not orchestrate execution.

Execution order remains the responsibility of higher architectural layers.

---

# Current Repository Status

Previous sprints established:

- ProjectionArtifact contracts;
- Projection Engine;
- Situational Awareness;
- Executive Operating System;
- deterministic runtime;
- Executive Scenario Framework;
- deterministic replay;
- canonical execution reports.

Sprint 3.25 introduces the first production observation pathway.

Rather than constructing synthetic ProjectionArtifacts for testing, the repository shall now demonstrate deterministic translation from an external connector into the canonical executive observation model.

This is the first production-quality observation boundary within the JARVIS architecture.

---

# Calendar Observation Philosophy

A calendar event is not an executive commitment.

A calendar event is an external observation.

The Calendar Projection Adapter exists to translate that observation into a canonical representation understood by the Executive Operating System.

The distinction is fundamental.

Google Calendar represents events according to Google’s provider model.

The Executive Operating System reasons about executive commitments according to the canonical ProjectionArtifact model.

Neither model shall leak into the other.

---

# Canonical Observation Model

The Calendar Projection Adapter accepts one observation model.

It emits one canonical model.

```text
Calendar Observation
        ↓
Validation
        ↓
Normalisation
        ↓
ProjectionArtifact Construction
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
```

Every stage shall be deterministic.

Every transformation shall be reproducible.

Every ProjectionArtifact shall preserve constitutional identity and provenance.

---

# Observation Contract

The adapter shall consume a deterministic Calendar Observation contract.

The observation contract represents external state.

It shall contain only externally observable information.

Typical observation fields include:

- source identifier;
- event identifier;
- title;
- start time;
- end time;
- event status;
- organiser;
- attendees;
- availability indicator;
- source timestamps;
- source metadata.

The observation contract shall not contain:

- executive reasoning;
- inferred priority;
- inferred organisational significance;
- inferred project membership;
- inferred behavioural recommendations;
- executive state.

---

# ProjectionArtifact Construction

The adapter shall translate validated observations into canonical ProjectionArtifacts.

ProjectionArtifacts shall contain only information required by downstream architectural layers.

Each ProjectionArtifact shall include:

- canonical projection identifier;
- artifact type;
- observation timestamp;
- source provenance;
- stable source identifier;
- translated commitment data;
- deterministic availability representation;
- validation status.

ProjectionArtifacts shall not contain:

- provider-specific implementation logic;
- authentication state;
- API response structures;
- connector paging information;
- runtime configuration.

---

# Stable Identity Strategy

Every ProjectionArtifact shall possess a stable canonical identity.

Identity shall remain stable across deterministic replay.

Projection identifiers shall be derived deterministically from:

- source provider;
- source identifier;
- observation identity.

Identity shall not depend upon:

- execution order;
- runtime configuration;
- repository state;
- processing timestamps;
- memory location.

Stable identity enables:

- deterministic replay;
- duplicate detection;
- future incremental updates;
- auditability.

---

# Provenance Model

Every ProjectionArtifact shall preserve explicit provenance.

Minimum provenance includes:

- connector source;
- adapter identity;
- source observation identifier;
- observation timestamp;
- projection timestamp;
- translation version.

Future repository users shall always be able to trace an executive observation back to its original external source.

Provenance is an enduring constitutional requirement.

---

# Availability Semantics

Calendar availability shall be represented explicitly.

The adapter shall translate supported provider availability values into canonical executive availability states.

The mapping shall be deterministic.

Availability shall never be inferred.

Unsupported provider values shall fail validation unless explicitly recognised by the adapter specification.

The Projection Engine shall consume canonical availability rather than provider-specific representations.

---

# Failure Semantics

Projection failure shall be deterministic.

Unsupported observations shall fail validation before ProjectionArtifact construction.

Malformed observations shall fail validation before ProjectionArtifact construction.

Unknown provider values shall fail explicitly.

Projection failure shall never produce partially valid ProjectionArtifacts.

Failure shall remain:

- explicit;
- reproducible;
- observable;
- explainable.

Repository integrity takes precedence over projection convenience.

---

# Translation Guarantees

The Calendar Projection Adapter guarantees:

- deterministic translation;
- deterministic validation;
- deterministic identity;
- deterministic provenance;
- deterministic ProjectionArtifact construction;
- deterministic replay.

The adapter does not guarantee:

- semantic correctness of source data;
- completeness of external observations;
- executive interpretation;
- organisational policy.

The adapter preserves reality.

The Executive Operating System determines meaning.

---

# Canonical Translation Rules

The Calendar Projection Adapter shall implement one deterministic translation from validated Calendar Observations into canonical ProjectionArtifacts.

The same validated observation shall always produce the same ProjectionArtifact.

Translation rules shall be explicit.

No implementation-defined behaviour shall exist.

---

# Translation Pipeline

Every observation shall pass through the following deterministic stages.

```text
Calendar Observation
        ↓
Structural Validation
        ↓
Semantic Validation
        ↓
Canonical Normalisation
        ↓
Stable Identity Construction
        ↓
ProjectionArtifact Construction
        ↓
ProjectionArtifact Validation
        ↓
ProjectionArtifactSet Publication
```

Each stage shall either:

- succeed completely; or
- fail explicitly.

Partial translation is prohibited.

---

# Structural Validation

Structural validation verifies that the observation satisfies the published Calendar Observation contract.

Structural validation shall verify:

- required fields exist;
- supported data types;
- supported timestamp formats;
- supported availability values;
- identifier presence;
- required provenance information.

Structural validation shall not infer missing information.

Missing required information shall fail validation.

---

# Semantic Validation

Semantic validation verifies that the observation is internally consistent.

The adapter shall reject observations where, for example:

- end time precedes start time;
- identifiers are empty;
- timestamps are invalid;
- unsupported event status values exist;
- unsupported availability values exist.

Semantic validation concerns consistency rather than executive meaning.

---

# Canonical Normalisation

Following successful validation, observations shall be normalised into canonical internal representations.

Normalisation may include:

- timestamp standardisation;
- canonical availability values;
- canonical event status values;
- canonical identifier formatting.

Normalisation shall never change the observable meaning of the source observation.

Normalisation shall never introduce inferred information.

---

# Stable Projection Identity

Each ProjectionArtifact shall receive a deterministic projection identifier.

Projection identifiers shall remain identical across repeated execution.

Identity shall depend only upon stable observation characteristics.

Identity shall never depend upon:

- processing order;
- runtime configuration;
- repository state;
- system clock;
- memory allocation;
- execution environment.

Stable identity is a constitutional requirement supporting:

- replay;
- audit;
- provenance;
- future incremental projection.

---

# Commitment Projection

Calendar events shall be projected into executive commitments.

The adapter shall preserve:

- commitment identity;
- commitment timing;
- commitment source;
- commitment lifecycle;
- commitment provenance.

The adapter shall not determine:

- commitment importance;
- commitment priority;
- commitment urgency;
- commitment desirability.

Executive commitments describe observed reality.

Meaning is determined later.

---

# Availability Projection

Availability shall be represented using canonical executive availability states.

Translation shall be table-driven.

Every supported provider value shall map deterministically to one canonical value.

Unsupported provider values shall fail validation.

Availability shall never be inferred.

---

# Provenance Construction

Every ProjectionArtifact shall include complete provenance.

Minimum provenance shall identify:

- source provider;
- adapter implementation;
- adapter version;
- observation identifier;
- observation timestamp;
- translation timestamp;
- projection identifier.

Provenance shall remain immutable after publication.

---

# ProjectionArtifact Validation

Following construction, every ProjectionArtifact shall be validated before publication.

Validation shall verify:

- canonical identity;
- required metadata;
- provenance completeness;
- timestamp validity;
- supported artifact type;
- deterministic construction.

Invalid ProjectionArtifacts shall never be published.

---

# ProjectionArtifactSet Publication

Only validated ProjectionArtifacts may enter a ProjectionArtifactSet.

Publication shall be deterministic.

Artifact ordering shall use explicit deterministic comparison rules.

Implementation shall not depend upon:

- filesystem ordering;
- locale-sensitive sorting;
- insertion order;
- provider response order.

Future replay shall therefore produce identical ProjectionArtifactSets.

---

# Failure Behaviour

Failure shall be deterministic.

Translation shall terminate immediately when validation fails.

The adapter shall report:

- validation stage;
- failing field;
- validation rule;
- failure reason.

The adapter shall never:

- silently repair observations;
- silently discard observations;
- substitute default values;
- publish partially valid artifacts.

Repository integrity shall always take precedence over convenience.

---

# Replay Guarantees

The Calendar Projection Adapter shall support deterministic replay.

Repeated translation of identical observations shall produce:

- identical ProjectionArtifact identities;
- identical ProjectionArtifact content;
- identical provenance;
- identical validation outcomes;
- identical ProjectionArtifactSet ordering.

Replay determinism shall be demonstrated through automated testing.

---

# Future Compatibility

Future Projection Adapters shall preserve this translation model.

Additional adapters may introduce additional ProjectionArtifact types.

They shall not alter:

- deterministic translation;
- validation-before-publication;
- provenance preservation;
- stable identity;
- explicit failure semantics;
- canonical ProjectionArtifact construction.

Sprint 3.25 therefore establishes the constitutional translation model for every future observation source.

---

# Governing Principle

Projection Adapters do not interpret observations.

Projection Adapters preserve observations.

The Projection Engine integrates observations.

The Executive Operating System determines executive meaning.

These responsibilities shall remain permanently separated.

---

# Repository Architecture

Sprint 3.25 establishes the permanent repository boundary for Projection Adapters.

Projection Adapters are a distinct architectural layer.

They are neither connectors nor components of the Projection Engine.

The repository shall preserve this separation permanently.

---

# Architectural Layer

Projection Adapters occupy the constitutional boundary between external observation and canonical executive observation.

```text
External Provider
        ↓
Connector
        ↓
Connector Observation
        ↓
Projection Adapter
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
        ↓
Situational Awareness
        ↓
Executive Operating System
```

Only ProjectionArtifacts cross the adapter boundary.

No provider-specific representations shall pass beyond the adapter.

---

# Package Responsibilities

The Projection Adapter package owns:

- adapter contracts;
- observation validation;
- deterministic translation;
- ProjectionArtifact construction;
- provenance construction;
- stable identity generation;
- adapter-specific tests.

The package shall not own:

- connector implementation;
- runtime configuration;
- Projection Engine behaviour;
- executive reasoning;
- orchestration;
- persistence;
- user interfaces.

---

# Public Contracts

Projection Adapters shall expose only stable public contracts.

Public contracts may include:

- adapter interfaces;
- observation contracts;
- translation results;
- validation results;
- adapter metadata.

Internal implementation details shall remain private.

Consumers shall depend only upon public contracts.

---

# Adapter Interface

Every Projection Adapter shall implement one deterministic interface.

Conceptually:

```text
Observation
        ↓
validate()
        ↓
translate()
        ↓
ProjectionArtifactSet
```

The interface shall not expose provider-specific implementation behaviour.

Translation remains the sole public responsibility.

---

# Adapter Registration

Projection Adapters shall be explicitly registered.

Registration shall be deterministic.

Discovery shall not depend upon:

- filesystem enumeration;
- reflection;
- runtime scanning;
- dependency ordering.

Repository publication shall determine adapter availability.

Future adapters shall therefore become available only through explicit repository change.

This requirement does not authorise a general adapter registry in Sprint 3.25. Explicit static publication of the Calendar Projection Adapter is sufficient.

---

# Adapter Identity

Every Projection Adapter shall possess:

- adapter identifier;
- adapter name;
- adapter version;
- supported observation type;
- supported provider;
- supported ProjectionArtifact types.

Adapter identity shall remain immutable after publication.

Stable identity supports:

- provenance;
- replay;
- audit;
- repository evolution.

---

# Adapter Metadata

Every adapter shall publish deterministic metadata describing:

- supported provider;
- supported observation contract;
- supported ProjectionArtifact contract;
- translation version;
- implementation version.

Metadata exists to support repository transparency.

Metadata shall not influence translation behaviour.

---

# Repository Boundaries

Projection Adapters shall not import:

- Executive Operating System policy;
- executive orchestration;
- executive decision logic;
- UI components;
- persistence layers;
- connector authentication;
- external provider SDK behaviour beyond the published observation contract.

Likewise, downstream architectural layers shall not import adapter implementation details.

Translation remains a one-way boundary.

---

# Canonical Package Layout

The repository shall maintain clear separation between:

```text
connectors/
        ↓
projection-adapters/
        ↓
projection-engine/
        ↓
situational-awareness/
        ↓
executive-operating-system/
```

Each layer shall depend only upon published contracts appropriate to its responsibility.

Circular dependencies are prohibited.

---

# Constitutional Repository Rules

Projection Adapters shall never become:

- miniature Projection Engines;
- connector wrappers;
- reasoning engines;
- orchestration frameworks.

They exist for one purpose:

Deterministic translation of external observations into canonical executive observations.

Repository evolution shall preserve this responsibility.

---

# Future Adapter Evolution

Future adapters may support:

- Email;
- Tasks;
- GitHub;
- Google Drive;
- Slack;
- Microsoft Teams;
- Microsoft Outlook;
- CRM systems;
- EMR platforms;
- Financial systems;
- Custom enterprise connectors.

Future adapters shall inherit the constitutional model established by Sprint 3.25.

They shall not redefine:

- deterministic translation;
- validation-before-publication;
- stable identity;
- provenance;
- replay;
- failure semantics.

Only observation contracts and translation rules shall vary between adapters.

---

# Architectural Decision Records

Material architectural decisions affecting Projection Adapters shall be recorded through ADRs.

Implementation convenience shall never establish constitutional precedent.

Where uncertainty exists:

- preserve existing architecture;
- document the issue;
- create an ADR where necessary.

Repository implementation shall remain the consequence of architecture rather than its source.

---

# Architectural Constraints

The following responsibilities shall remain permanently separate.

Connectors acquire observations.

Projection Adapters translate observations.

Projection Engine integrates observations.

Situational Awareness organises observations.

Executive Operating System interprets observations.

No layer shall assume the constitutional responsibilities of another.

This separation is fundamental to the architecture of JARVIS.

---

# Validation Architecture

Validation is a constitutional boundary.

No Calendar Observation shall be translated before validation.

No ProjectionArtifact shall be published before validation.

Validation shall remain deterministic, explicit and side-effect free.

The validation lifecycle is:

```text
Calendar Observation
        ↓
Observation Validation
        ↓
Canonical Normalisation
        ↓
ProjectionArtifact Construction
        ↓
ProjectionArtifact Validation
        ↓
ProjectionArtifactSet Publication
```

Failure at any stage shall terminate projection.

---

# Calendar Observation Validation

The Calendar Projection Adapter shall validate every observation against the published Calendar Observation contract.

Validation shall include:

- required field presence;
- identifier validity;
- timestamp validity;
- start and end consistency;
- supported lifecycle status;
- supported availability value;
- provenance completeness;
- JSON-compatible values;
- deterministic configuration references where present.

Validation shall reject:

- empty canonical identifiers;
- malformed timestamps;
- missing required provenance;
- end times earlier than start times;
- unsupported provider values;
- executable values or callbacks;
- non-deterministic values;
- undocumented extension fields where strict validation applies.

Validation shall not:

- fetch missing data;
- infer replacement values;
- modify source systems;
- silently remove unsupported fields;
- substitute defaults unless the specification explicitly defines them.

---

# Observation Validation Result

Observation validation shall produce an explicit deterministic result.

A validation result shall identify:

- whether validation passed;
- the observation identifier where available;
- the failing field or path;
- the violated rule;
- a stable failure code;
- an explanatory message.

Validation messages may assist engineering diagnosis.

Stable failure codes shall support deterministic testing and future operational reporting.

The adapter shall not expose raw provider exceptions as its constitutional failure contract.

---

# Normalisation Rules

Normalisation shall occur only after successful validation.

Permitted normalisation may include:

- converting supported timestamps into the repository’s canonical timestamp representation;
- converting recognised provider lifecycle values into canonical lifecycle states;
- converting recognised availability values into canonical availability states;
- trimming identifier representations where the contract explicitly permits it;
- ordering deterministic collections where source order is not constitutionally meaningful.

Normalisation shall not:

- alter event meaning;
- infer omitted values;
- reinterpret tentative attendance as confirmed commitment;
- infer priority from event title, attendees or duration;
- resolve contradictory source data;
- collapse distinct source events into one observation without an explicit identity rule.

Normalised observations shall remain traceable to their source representation.

---

# ProjectionArtifact Validation

Constructed ProjectionArtifacts shall be validated against the existing canonical ProjectionArtifact contract.

The adapter shall not create a parallel artifact contract.

Artifact validation shall verify:

- artifact identity;
- artifact type;
- required temporal values;
- canonical commitment representation;
- availability representation;
- provenance completeness;
- supported lifecycle state;
- JSON compatibility;
- immutability requirements;
- compatibility with the existing Projection Engine.

ProjectionArtifact validation shall occur before set publication.

A constructed but invalid artifact shall never be returned as partial success.

---

# Batch Semantics

Where the adapter receives multiple Calendar Observations, batch behaviour shall be explicit.

The default Sprint 3.25 behaviour shall be atomic.

```text
All observations valid
        ↓
Publish complete ProjectionArtifactSet
```

```text
Any observation invalid
        ↓
Publish no ProjectionArtifactSet
        ↓
Return explicit deterministic failure
```

The adapter shall not silently publish the valid subset of a failed input batch.

Atomic publication protects replay integrity and prevents downstream systems from mistaking incomplete projection for complete observed reality.

Partial-success processing is outside Sprint 3.25.

---

# Duplicate Observation Semantics

Duplicate source observation identity shall be rejected within the same projection input.

The adapter shall not silently:

- retain the first;
- retain the last;
- merge duplicates;
- assign replacement identifiers.

Duplicate identity is an integrity failure.

Future incremental synchronisation may define update and supersession semantics through a separate sprint.

Sprint 3.25 shall not infer those semantics.

---

# Deterministic Ordering

ProjectionArtifactSet ordering shall be deterministic.

Ordering shall not depend upon:

- provider response order;
- object insertion order;
- filesystem order;
- locale-sensitive comparison;
- runtime environment;
- connector pagination sequence.

Where the canonical contract requires ordered publication, artifacts shall be ordered using an explicit code-unit comparison over stable canonical identity unless an existing repository rule specifies another deterministic ordering.

Temporal sorting may be used only where the contract explicitly defines timestamp order as constitutionally meaningful.

Any tie-break rule shall be explicit and deterministic.

---

# Immutability

Published adapter outputs shall be immutable.

Immutability shall apply to:

- adapter metadata;
- validated normalised observations where publicly exposed;
- ProjectionArtifacts;
- provenance objects;
- ProjectionArtifactSets;
- validation results;
- translation results.

Recursive immutability shall be used where nested values are exposed.

The adapter shall not return mutable references to:

- connector input;
- shared fixtures;
- runtime configuration;
- internal translation state.

Defensive copying shall be used where necessary to prevent external mutation.

---

# Failure Taxonomy

Sprint 3.25 shall establish explicit failure categories.

At minimum:

## Observation Contract Failure

The observation does not satisfy the required structure.

Examples include missing identifiers or malformed values.

## Observation Semantic Failure

The observation is structurally valid but internally inconsistent.

Examples include an end time preceding a start time.

## Unsupported Source Value

The provider supplied a recognised field with a value outside the adapter’s supported mapping.

## Duplicate Observation Identity

More than one observation in the same translation input possesses the same canonical source identity.

## Projection Construction Failure

A validated observation cannot be translated according to the specified deterministic mapping.

## Projection Validation Failure

A constructed artifact does not satisfy the canonical ProjectionArtifact contract.

## Configuration Reference Failure

An optional deterministic role or project reference cannot be resolved from the explicitly supplied adapter configuration.

Failure categories shall be stable enough for testing and operational diagnosis.

---

# Error Boundary

Provider-specific errors belong to the connector.

Projection errors belong to the adapter.

Projection Engine errors belong to the Projection Engine.

Executive runtime errors belong to the Executive Operating System.

The Calendar Projection Adapter shall not disguise one architectural failure as another.

For example:

- an authentication failure is not a projection failure;
- a malformed connector observation is a projection validation failure;
- an invalid ProjectionArtifact is not a connector failure;
- an executive reasoning failure is not an adapter failure.

Accurate failure ownership is required for transparent operations and audit.

---

# Deterministic Replay

The Calendar Projection Adapter shall support offline deterministic replay.

Replay inputs shall consist of:

- fixed Calendar Observations;
- fixed deterministic adapter configuration;
- fixed adapter version;
- fixed canonical contracts.

Replay shall not require:

- Google Calendar access;
- authentication credentials;
- network access;
- the current system time;
- mutable external state;
- filesystem discovery;
- stochastic services.

Identical replay inputs shall produce identical:

- validation results;
- normalised observations;
- projection identifiers;
- ProjectionArtifacts;
- provenance;
- artifact ordering;
- translation result status.

---

# Replay Fixtures

Sprint 3.25 shall introduce focused replay fixtures representing supported calendar observations.

Fixtures shall include at least:

- a timed confirmed commitment;
- an all-day commitment where supported by the existing canonical model;
- a cancelled event lifecycle state;
- a free or non-blocking event;
- multiple events supplied in non-canonical source order;
- optional deterministic role or project mapping where included in sprint scope.

Invalid fixtures shall include at least:

- missing source identity;
- malformed timestamp;
- end before start;
- unsupported availability value;
- unsupported lifecycle value;
- duplicate source identity.

Fixtures shall be:

- local;
- immutable;
- provider-neutral beyond the published connector observation contract;
- free of credentials and personal information;
- suitable for repeated execution.

---

# Test Architecture

Testing shall prove architectural behaviour rather than incidental implementation detail.

The Sprint 3.25 test suite shall include:

## Contract Tests

Verify that valid Calendar Observations satisfy the observation contract and invalid observations fail with explicit classifications.

## Translation Tests

Verify exact deterministic mapping from supported observations to canonical ProjectionArtifacts.

## Identity Tests

Verify stable projection identity across repeated translation and independence from input ordering.

## Provenance Tests

Verify complete immutable provenance and traceability to the original source observation.

## Availability Tests

Verify every supported provider availability mapping and rejection of unsupported values.

## Lifecycle Tests

Verify deterministic mapping of supported event lifecycle states.

## Atomicity Tests

Verify that one invalid observation prevents publication of the complete batch.

## Ordering Tests

Verify deterministic ordering independent of connector or source response order.

## Immutability Tests

Verify that inputs, outputs, nested provenance and published sets cannot be mutated through exposed references.

## Replay Tests

Verify that repeated execution produces structurally identical results.

## Boundary Tests

Verify that the adapter does not require connector SDKs, credentials, network access, executive runtime policy, UI or persistence.

## Integration Tests

Verify that the produced ProjectionArtifactSet is accepted through the existing Projection Engine contract without modifying the engine.

---

# Canonical Equality

Deterministic replay comparison shall use canonical structural equality.

Object property insertion order shall not affect equality.

Array ordering shall remain significant where arrays represent constitutionally ordered collections.

Tests shall distinguish between:

- semantically identical objects with different property insertion order; and
- constitutionally different arrays with different item ordering.

Naïve serialisation-order equality shall not define constitutional equivalence.

---

# Existing Contract Preservation

Sprint 3.25 shall preserve all existing:

- ProjectionArtifact contracts;
- ProjectionArtifactSet contracts;
- Projection Engine interfaces;
- Situational Awareness contracts;
- Executive Scenario contracts;
- EOS runtime interfaces;
- replay fixtures;
- public exports.

A new adapter-specific contract may be introduced only for the Calendar Observation boundary.

Downstream contracts shall not be modified merely to simplify adapter implementation.

Where the existing canonical model cannot represent a source value, the adapter shall either:

- reject that value explicitly; or
- document the gap for a later architectural decision.

It shall not silently expand downstream contracts.

---

# Verification Requirements

Before completion, Codex shall run the repository’s canonical verification commands.

At minimum:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

Where the repository uses a different canonical typecheck command, Codex shall use that command and report it accurately.

Codex shall also run:

- focused Calendar Projection Adapter tests;
- relevant Projection Engine tests;
- relevant deterministic replay tests;
- `git diff --check`.

All checks shall pass before completion.

A remote asset warning that does not fail compilation may be reported accurately, but it shall not be misrepresented as a successful fetch.

---

# Acceptance Criteria

Sprint 3.25 is complete only when all following criteria are satisfied.

## Architectural Acceptance

- One Calendar Projection Adapter exists.
- The adapter occupies a distinct repository boundary between connector observations and the Projection Engine.
- Connector acquisition logic remains outside the adapter.
- Provider-specific representations do not pass into the Projection Engine.
- Executive reasoning does not enter the adapter.
- No alternative Projection Engine or EOS runtime path is introduced.

## Contract Acceptance

- A typed Calendar Observation contract exists.
- Supported lifecycle and availability values are explicit.
- The adapter consumes the observation contract rather than a live provider SDK response.
- Existing ProjectionArtifact contracts remain unchanged unless a demonstrated architectural defect is separately governed.

## Deterministic Acceptance

- Identical observations and configuration produce identical output.
- Projection identity is stable.
- Artifact ordering is deterministic.
- Translation does not depend on system time, network state, locale or input ordering.
- Canonical equality is used for replay verification.

## Validation Acceptance

- Observations are validated before translation.
- Constructed artifacts are validated before publication.
- Unsupported values fail explicitly.
- Duplicate source identity fails explicitly.
- Invalid batches do not produce partial publication.
- No silent repair or default substitution occurs outside explicit specification rules.

## Provenance Acceptance

- Every ProjectionArtifact identifies its source provider.
- Every ProjectionArtifact identifies its source observation.
- Every ProjectionArtifact identifies the producing adapter and translation version.
- Provenance is immutable.
- Provenance remains sufficient for deterministic source traceability.

## Repository Acceptance

- The implementation has a clear package boundary.
- Public exports are deliberate.
- No dynamic filesystem discovery is introduced.
- No connector SDK dependency is required by the adapter package.
- No credentials, network access, persistence or UI dependency is introduced.
- Package documentation explains ownership and non-goals.

## Testing Acceptance

- Focused adapter tests pass.
- Invalid observation tests pass.
- Availability and lifecycle mapping tests pass.
- Identity and ordering tests pass.
- Atomic failure tests pass.
- Immutability tests pass.
- Replay tests pass.
- Projection Engine integration tests pass.
- Complete repository test, lint, typecheck and build verification passes.

---

# Explicit Non-Goals

Sprint 3.25 shall not:

- build a universal Projection Adapter Framework;
- add a general adapter registry;
- add dynamic adapter discovery;
- add multiple production adapters;
- fetch data from Google Calendar;
- implement authentication;
- implement token management;
- implement connector synchronisation;
- persist observations or ProjectionArtifacts;
- implement incremental update reconciliation;
- implement deletion or tombstone policy beyond explicit lifecycle projection;
- infer priority, urgency or strategic significance;
- infer relationships from attendee lists;
- infer project or role association;
- change the Projection Engine;
- change Situational Awareness;
- change the EOS runtime;
- add UI;
- add LLM behaviour;
- introduce stochastic processing;
- redesign Sprint 3.24.2 or Sprint 3.24.2a.

These exclusions are deliberate scope controls.

---

# Completion Report Requirements

Codex shall return a structured completion report containing the following sections.

## 1. Completion Classification

Classify the sprint as:

- fully implemented;
- implemented with narrow documented limitations;
- partially implemented with unresolved architectural blockers.

## 2. Architecture Implemented

Describe the completed path:

```text
Calendar Observation
        ↓
CalendarProjectionAdapter
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
```

State explicitly where connector responsibility ends and adapter responsibility begins.

## 3. Contract Traceability

Map each normative requirement to:

- implementation file;
- test coverage;
- completion status;
- any residual limitation.

## 4. Files Changed

List each changed file and explain why it was necessary.

Separate:

- contracts;
- implementation;
- fixtures;
- tests;
- documentation;
- ADRs.

## 5. Architectural Preservation

Confirm explicitly that the implementation preserved:

- existing ProjectionArtifact contracts;
- the existing Projection Engine;
- Situational Awareness;
- the canonical EOS runtime;
- Executive Scenario contracts;
- deterministic replay;
- golden fixtures;
- runtime-configuration separation;
- backward compatibility.

## 6. Deterministic Guarantees

Report how the implementation ensures:

- stable identity;
- stable ordering;
- canonical equality;
- immutable publication;
- atomic failure;
- offline replay.

## 7. Verification Evidence

Report exact results for:

- focused adapter tests;
- relevant Projection Engine tests;
- replay tests;
- complete test suite;
- lint;
- typecheck;
- build;
- `git diff --check`.

## 8. Residual Matters

Identify any:

- unsupported source values;
- canonical model gaps;
- future incremental-sync requirements;
- intentionally deferred adapter framework work;
- architectural decisions requiring a later ADR.

Do not claim future adapter capabilities as completed.

---

# Document Status

Sprint 3.25 is an implementation specification.

It establishes the first production Projection Adapter within the JARVIS Executive Operating System.

This specification defines the constitutional implementation boundaries for that adapter.

It does not redefine previous architectural layers.

---

# Codex Implementation Instruction

You are implementing Sprint 3.25 in the JARVIS repository.

Your responsibility is to implement this specification faithfully while preserving the constitutional architecture already established by:

- the Engineering Constitution;
- the JARVIS North Star;
- JESS;
- accepted Architectural Decision Records;
- the existing Projection Engine;
- Sprint 3.24.2;
- Sprint 3.24.2a;
- the deterministic Executive Operating System.

Where implementation convenience conflicts with constitutional architecture, constitutional architecture shall prevail.

---

# Implementation Objective

Implement one production-quality Projection Adapter:

**CalendarProjectionAdapter**

The implementation shall demonstrate one complete deterministic translation path:

```text
Calendar Observation
        ↓
CalendarProjectionAdapter
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
```

The objective is to prove the architectural boundary.

The objective is not to build an adapter framework.

---

# Required Working Method

Before modifying the repository:

1. Read this specification completely.
2. Review the existing ProjectionArtifact contracts.
3. Review the Projection Engine implementation.
4. Review Sprint 3.24.2 and Sprint 3.24.2a.
5. Review relevant ADRs.
6. Trace the existing ProjectionArtifact lifecycle through to the Executive Operating System.

Do not redesign any existing component unless a demonstrable architectural defect prevents implementation.

---

# Required Implementation Order

Implement in the following order:

1. Calendar Observation contract.
2. Adapter contracts.
3. Validation.
4. Stable identity.
5. Provenance.
6. Translation.
7. ProjectionArtifact construction.
8. ProjectionArtifact validation.
9. ProjectionArtifactSet publication.
10. Replay fixtures.
11. Tests.
12. Documentation.
13. ADR only if genuinely required.

Each stage shall remain independently reviewable.

---

# Scope Constraints

This sprint shall implement only:

- one Calendar Projection Adapter;
- one observation contract;
- deterministic translation;
- validation;
- stable identity;
- provenance;
- replay support;
- tests;
- documentation.

Do not implement:

- Gmail adapters;
- Drive adapters;
- GitHub adapters;
- Teams adapters;
- Slack adapters;
- EMR adapters;
- CRM adapters;
- adapter discovery;
- plugin loading;
- adapter registry;
- runtime orchestration;
- UI;
- persistence;
- authentication;
- connector synchronisation;
- live Google Calendar integration.

Those belong to later architectural work.

---

# Architectural Constraints

Maintain the following separation.

Connector:

- acquires observations.

Projection Adapter:

- validates observations;
- translates observations;
- constructs ProjectionArtifacts.

Projection Engine:

- integrates ProjectionArtifacts.

Executive Operating System:

- interprets executive state.

These responsibilities shall not overlap.

---

# Existing Architecture Must Remain Intact

Do not modify:

- ProjectionArtifact contracts unless an architectural defect requires it;
- Projection Engine behaviour;
- Executive Scenario contracts;
- Situational Awareness;
- Executive Operating System runtime;
- deterministic replay architecture.

The adapter shall integrate with the existing repository.

It shall not require downstream redesign.

---

# Deterministic Guarantees

The implementation shall preserve deterministic:

- validation;
- translation;
- identity;
- ordering;
- provenance;
- replay;
- ProjectionArtifact publication.

No implementation may depend upon:

- current time;
- locale;
- filesystem order;
- network state;
- randomness;
- provider SDK behaviour;
- external services.

---

# Testing Requirements

Add focused tests proving:

- observation validation;
- translation correctness;
- stable identity;
- provenance preservation;
- lifecycle mapping;
- availability mapping;
- deterministic ordering;
- immutable publication;
- atomic failure;
- replay determinism;
- Projection Engine compatibility.

Run the repository verification suite before completion.

---

# Documentation Requirements

Update documentation only where required.

Document:

- adapter ownership;
- repository boundaries;
- observation contract;
- deterministic translation;
- replay support.

Do not rewrite unrelated sprint specifications.

---

# Completion Report

Return a structured report containing:

## 1. Sprint Summary

State whether Sprint 3.25 is:

- fully implemented;
- implemented with documented limitations;
- partially implemented.

## 2. Architecture

Describe the implemented execution path:

```text
Calendar Observation
        ↓
CalendarProjectionAdapter
        ↓
ProjectionArtifactSet
        ↓
Projection Engine
```

## 3. Requirement Traceability

Map each major requirement to:

- implementation;
- tests;
- completion status.

## 4. Files Changed

Separate:

- contracts;
- implementation;
- fixtures;
- tests;
- documentation;
- ADRs.

## 5. Architectural Preservation

Explicitly confirm preservation of:

- ProjectionArtifact contracts;
- Projection Engine;
- Situational Awareness;
- Executive Scenario Framework;
- Executive Operating System;
- deterministic replay;
- backward compatibility.

## 6. Verification

Report results for:

- focused adapter tests;
- replay tests;
- repository test suite;
- lint;
- typecheck;
- build;
- `git diff --check`.

## 7. Deferred Work

Identify work intentionally left for future sprints, including:

- additional Projection Adapters;
- Adapter Registry;
- connector integration;
- live provider synchronisation;
- incremental projection updates;
- projection reconciliation.

Do not claim future capabilities have been implemented.

---

# Sprint Completion Standard

Sprint 3.25 is complete when the repository demonstrates that one real external observation source can be translated into canonical ProjectionArtifacts through a deterministic, replayable, validated Projection Adapter without introducing connector behaviour into the Projection Engine or Executive Operating System.

Generalisation is intentionally deferred.

The success criterion is one production-quality architectural vertical slice, not a comprehensive adapter ecosystem.

---

# Final Architectural Constraint

Connectors acquire external observations.

Projection Adapters preserve and translate those observations.

The Projection Engine integrates canonical observations.

The Executive Operating System interprets executive reality.

Sprint 3.25 shall prove this boundary through one production-quality Calendar Projection Adapter and nothing broader.
