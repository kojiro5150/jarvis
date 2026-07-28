# **Sprint-3.27-Executive-Context-Engine**

## **Document Authority**

This sprint specification operates beneath the following governing hierarchy:

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

Where this specification conflicts with a higher-order constitutional document, the higher-order document prevails.

Implementation convenience shall not override architectural authority.

---

# **Constitutional Status**

Sprint 3.27 establishes the canonical deterministic context boundary between observed executive state and executive interpretation.

It defines how an immutable `ExecutiveStateSnapshot` may be transformed into structured, derived executive context without introducing recommendations, prioritisation, judgement or stochastic reasoning.

The permanent responsibility boundary becomes:

Connectors acquire observations.

Projection Adapters translate observations.

Projection Engine integrates canonical observations.

Situational Awareness Engine assembles observed executive reality.

Executive Context Engine derives deterministic contextual views.

Executive Operating System coordinates executive interpretation.

Executive Modules perform constitutionally bounded specialist work.

The Executive Context layer shall remain descriptive and computational.

It shall not become interpretive merely because it derives higher-order structures from state.

---

# **Sprint Objective**

Implement one deterministic Executive Context path:

ExecutiveStateSnapshot  
        ↓  
ExecutiveContextEngine  
        ↓  
ExecutiveContextSnapshot  
        ↓  
Existing Executive Operating System

The objective is to prove that canonical executive state can be transformed into one stable, immutable and replayable representation of deterministic executive context.

The objective is not to determine what the executive should do.

---

# **Architectural Purpose**

The Projection Engine answers:

> What canonical observations exist?

The Situational Awareness Engine answers:

> What is the observed executive state?

The Executive Context Engine answers:

> What deterministic structures and conditions can be derived from that state?

The Executive Operating System later answers:

> Which executive capabilities should interpret that context?

Executive Modules later answer:

> What constitutionally bounded analysis or action is required?

These questions shall remain architecturally distinct.

---

# **Core Architectural Principle**

Executive context is a deterministic derived view of canonical executive state.

It is not:

* a recommendation;  
* a priority ranking;  
* a judgement;  
* a strategic interpretation;  
* a risk determination;  
* a behavioural inference;  
* an executive briefing;  
* a plan;  
* a language-model summary;  
* a substitute for human authority.

The engine may calculate and organise what is explicitly derivable.

It shall not decide what derived conditions mean.

---

# **Naming**

The canonical implementation concepts shall be:

ExecutiveContextEngine  
ExecutiveContextSnapshot

`ExecutiveContextSnapshot` is preferred over the broader term `ExecutiveContext` because the publication is:

* immutable;  
* lifecycle-bound;  
* deterministic;  
* replayable;  
* derived from one defined `ExecutiveStateSnapshot`;  
* suitable for audit and comparison.

The term “context” may describe the architectural layer.

The published canonical contract shall be `ExecutiveContextSnapshot`.

---

# **Architectural Position**

The completed pipeline shall become:

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
ExecutiveContextEngine  
        ↓  
ExecutiveContextSnapshot  
        ↓  
Executive Scenario / Runtime Configuration  
        ↓  
Executive Operating System  
        ↓  
Executive Modules

No provider-specific representation shall enter Executive Context.

No connector behaviour shall enter Executive Context.

No executive recommendation or specialist reasoning shall enter the Executive Context Engine.

---

# **Architectural Caution**

Executive Context shall not be defined as:

> What is relevant?

“Relevance” ordinarily requires an objective, role, preference, decision frame or interpretive judgement.

Sprint 3.27 shall instead define Executive Context as:

> Deterministic structures, measures and conditions derivable from canonical executive state under explicit rules.

The engine may report:

commitmentCount \= 8

It shall not report:

importantCommitmentCount \= 3

unless “important” is already an explicit canonical source value and the engine merely preserves or counts it.

The engine may report:

availableMinutes \= 45

It shall not report:

insufficient preparation time

unless a future constitutional contract defines the required threshold and meaning.

---

# **Executive Context Responsibilities**

The Executive Context layer may:

* validate `ExecutiveStateSnapshot` inputs;  
* preserve source snapshot identity;  
* derive deterministic counts;  
* derive deterministic durations;  
* derive deterministic temporal groupings;  
* derive deterministic availability windows;  
* derive deterministic occupancy measures;  
* derive deterministic lifecycle summaries;  
* derive deterministic source and provenance summaries;  
* derive explicit reference groupings;  
* identify deterministic contextual conditions;  
* expose calculation evidence;  
* construct stable context identity;  
* publish immutable context snapshots;  
* support deterministic replay.

The Executive Context layer shall not:

* infer priority;  
* infer urgency;  
* infer importance;  
* infer intent;  
* infer sentiment;  
* infer strategic value;  
* infer executive preference;  
* infer stakeholder significance;  
* infer behavioural meaning;  
* recommend actions;  
* rank commitments;  
* resolve trade-offs;  
* optimise schedules;  
* generate briefings;  
* invoke a language model;  
* fetch external data;  
* mutate source systems;  
* introduce stochastic behaviour.

---

# **Deliberately Narrow Scope**

Sprint 3.27 shall derive context only from canonical fields already available in the repository after Sprint 3.26.

The sprint shall not expand upstream canonical contracts merely to enable richer context.

Initial context may therefore be limited to:

* artifact and entity counts;  
* lifecycle counts;  
* explicit role and project groupings;  
* explicit unknown-value counts;  
* conflict and gap summaries;  
* source and provenance coverage;  
* observation-age calculations where all reference times are explicitly supplied;  
* temporal summaries supported by existing timestamps;  
* availability summaries supported by existing canonical state.

Where the current model lacks:

* commitment end times;  
* blocking markers;  
* availability intervals;  
* explicit workload weights;  
* priority;  
* richer project state;  
* communication state;

the Executive Context Engine shall not invent them.

---

# **Executive Context Snapshot**

An `ExecutiveContextSnapshot` shall represent one deterministic derived view of one canonical `ExecutiveStateSnapshot`.

Conceptually:

ExecutiveContextSnapshot  
├── identity  
├── sourceStateIdentity  
├── observedAt  
├── lifecycle  
├── entitySummary  
├── commitmentContext  
├── availabilityContext  
├── projectContext  
├── roleContext  
├── sourceContext  
├── provenanceContext  
├── conflictContext  
├── gapContext  
├── deterministicConditions  
└── derivationMetadata

Only sections supported by existing canonical contracts shall be populated.

Unsupported sections shall remain absent or explicitly empty according to repository conventions.

---

# **Source State Preservation**

Every `ExecutiveContextSnapshot` shall identify the exact `ExecutiveStateSnapshot` from which it was derived.

The context publication shall preserve:

* source snapshot identity;  
* source snapshot version;  
* source observation time;  
* source lifecycle identity;  
* previous lifecycle identity where present;  
* assembly version where available;  
* context derivation version.

The Executive Context Engine shall not reconstruct executive state independently.

It shall consume one validated `ExecutiveStateSnapshot`.

---

# **Context Identity**

Every `ExecutiveContextSnapshot` shall possess a stable deterministic identity.

Context identity shall derive exclusively from constitutionally defined inputs, including:

* source `ExecutiveStateSnapshot` identity;  
* canonical source state content where required;  
* explicit context reference time;  
* deterministic context rules;  
* context contract version;  
* context engine version.

Context identity shall not depend upon:

* current system time;  
* execution order;  
* memory address;  
* process identity;  
* locale;  
* filesystem order;  
* network state;  
* random values.

Identical canonical inputs and context rules shall produce identical context identity.

---

# **Context Time**

The Executive Context Engine shall not invent time.

All temporal calculations shall use explicit canonical inputs.

A reference time may be supplied where required to calculate:

* elapsed durations;  
* future versus past groupings;  
* observation age;  
* availability windows;  
* temporal buckets.

The engine shall not call the system clock.

The reference time shall participate in identity where it changes derived output.

---

# **Derivation Semantics**

Context derivation shall be deterministic, explicit and non-destructive.

The engine may:

* count;  
* group;  
* index;  
* calculate durations;  
* calculate ratios;  
* calculate coverage;  
* calculate explicit temporal distance;  
* calculate explicit occupancy;  
* preserve explicit relationships;  
* classify values through constitutionally defined thresholds.

The engine shall preserve:

* canonical state meaning;  
* state identity;  
* source identities;  
* provenance;  
* lifecycle;  
* timestamps;  
* explicit references;  
* unknown values;  
* conflicts;  
* gaps.

The engine shall not rewrite canonical state.

---

# **Deterministic Measures**

Permitted measures may include:

totalArtifactCount  
commitmentCount  
projectCount  
roleCount  
sourceCount  
conflictCount  
gapCount  
unknownValueCount  
artifactsByType  
entitiesByLifecycle  
artifactsBySource  
relationshipsByType  
provenanceCoverage

Where supported by canonical timestamps:

pastItemCount  
currentItemCount  
futureItemCount  
oldestObservationAge  
newestObservationAge

Where supported by canonical intervals:

occupiedDuration  
availableDuration  
availabilityWindowCount  
longestAvailabilityWindow

A measure shall be introduced only where:

* every required input is canonical;  
* the formula is explicit;  
* ordering is deterministic;  
* edge cases are defined;  
* tests prove replay equality.

---

# **Deterministic Classification**

The engine may classify a measure only where classification thresholds are explicit, versioned and constitutionally governed.

For example:

commitmentDensity:  
  LOW  
  MODERATE  
  HIGH

shall not be introduced merely because the labels appear useful.

Such classification requires:

* a defined numerator;  
* a defined denominator;  
* defined temporal scope;  
* explicit threshold values;  
* explicit boundary behaviour;  
* versioned configuration;  
* a clear statement that the label is structural rather than evaluative.

Sprint 3.27 should prefer publishing raw deterministic measures over introducing premature labels.

---

# **Explicit Relationships**

The Executive Context Engine may group or summarise only relationships already explicit in the `ExecutiveStateSnapshot`.

Examples include:

* commitments grouped by explicit project reference;  
* commitments grouped by explicit role reference;  
* artifacts grouped by explicit source;  
* conflicts grouped by participating artifact identities;  
* gaps grouped by explicit canonical field or entity.

The engine shall not infer relationships from:

* titles;  
* names;  
* attendees;  
* language similarity;  
* temporal proximity;  
* shared source;  
* repeated terminology;  
* language-model interpretation.

Absence of an explicit relationship shall remain absence.

---

# **Contextual Conditions**

The engine may expose deterministic contextual conditions where they are direct consequences of explicit rules.

Examples may include:

HAS\_CONFLICTS  
HAS\_INFORMATION\_GAPS  
HAS\_UNKNOWN\_VALUES  
HAS\_MULTIPLE\_SOURCES  
HAS\_UNRESOLVED\_REFERENCES  
EMPTY\_EXECUTIVE\_STATE

These conditions describe structure.

They shall not imply severity, priority or required action.

A condition record shall contain:

* stable condition identifier;  
* condition type;  
* deterministic rule;  
* supporting canonical identities;  
* supporting values;  
* source snapshot identity;  
* context observation time.

---

# **Conflict Context**

Sprint 3.27 shall not independently redetect or reinterpret conflicts already published by the Situational Awareness Engine.

The Executive Context Engine may derive deterministic summaries such as:

* total conflict count;  
* conflicts by type;  
* participating artifact count;  
* conflicts by source;  
* whether any conflicts exist.

It shall not determine:

* severity;  
* executive importance;  
* which conflict should be resolved first;  
* whether a conflict is acceptable;  
* recommended remediation.

The original immutable conflict records shall remain authoritative.

---

# **Gap Context**

Sprint 3.27 shall not speculate about missing information.

It may derive deterministic summaries from existing gap records, including:

* total gap count;  
* gaps by type;  
* gaps by source;  
* gaps by canonical entity;  
* whether required-reference gaps exist;  
* whether explicit unknowns exist.

It shall distinguish:

* invalid input;  
* optional absence;  
* explicit unknown;  
* unresolved required reference;  
* unsupported canonical category.

The original immutable gap records shall remain authoritative.

---

# **Provenance Context**

The Executive Context Engine may derive transparent provenance measures.

Examples include:

* number of contributing sources;  
* number of artifacts by source;  
* number of artifacts with complete provenance;  
* number of distinct adapters represented;  
* provenance coverage ratio where the denominator is explicitly defined.

It shall not infer source trustworthiness, authority or reliability unless those values already exist as explicit canonical fields.

---

# **Calculation Evidence**

Every derived measure or condition shall be auditable.

Where practical, a derived context value shall expose:

* calculation rule identifier;  
* input identities;  
* input values;  
* output value;  
* context rule version.

The engine need not duplicate the entire source snapshot inside every calculation record.

It shall preserve enough evidence for deterministic reconstruction and verification.

---

# **Canonical Ordering**

All Executive Context collections shall use explicit deterministic ordering.

Ordering shall not depend upon:

* state object insertion order;  
* source execution order;  
* locale-sensitive sorting;  
* filesystem enumeration;  
* runtime discovery;  
* process scheduling.

Canonical identity shall be the default final tie-breaker.

Code-unit comparison shall be preferred where consistent with existing repository conventions.

---

# **Immutability**

Published `ExecutiveContextSnapshot` objects shall be recursively immutable.

Immutability shall apply to:

* context identity;  
* metadata;  
* summaries;  
* measures;  
* indexes;  
* conditions;  
* relationship views;  
* conflict summaries;  
* gap summaries;  
* provenance summaries;  
* calculation evidence;  
* nested canonical values.

The engine shall not expose mutable references to:

* the source `ExecutiveStateSnapshot`;  
* source artifacts;  
* source conflicts;  
* source gaps;  
* runtime configuration;  
* internal indexes;  
* test fixtures.

Defensive copying shall be used where required.

---

# **Atomic Derivation**

Executive Context derivation shall be atomic.

All inputs valid  
        ↓  
Publish complete ExecutiveContextSnapshot

Any required input invalid  
        ↓  
Publish no context snapshot  
        ↓  
Return explicit deterministic failure

The engine shall not publish a partial context snapshot.

Degraded context publication is outside Sprint 3.27.

---

# **Deterministic Replay**

The `ExecutiveContextEngine` shall support offline deterministic replay.

Replay shall require only:

* fixed `ExecutiveStateSnapshot`;  
* fixed explicit reference time where required;  
* fixed context configuration where permitted;  
* fixed contract versions;  
* fixed derivation rules.

Replay shall not require:

* connectors;  
* Projection Adapters;  
* provider SDKs;  
* network access;  
* credentials;  
* persistence;  
* current system time;  
* language models;  
* mutable external state.

Identical replay inputs shall produce structurally identical:

* context identity;  
* summaries;  
* measures;  
* conditions;  
* ordering;  
* evidence;  
* failure results.

---

# **Validation Architecture**

Validation is a constitutional boundary.

No `ExecutiveStateSnapshot` shall be contextualised before validation.

No `ExecutiveContextSnapshot` shall be published before validation.

The lifecycle shall be:

ExecutiveStateSnapshot  
        ↓  
Input Validation  
        ↓  
Canonical State Reading  
        ↓  
Deterministic Derivation  
        ↓  
Context Organisation  
        ↓  
Condition Construction  
        ↓  
Context Validation  
        ↓  
Immutable Publication

Failure at any stage shall terminate derivation.

---

# **Input Validation**

The engine shall validate:

* source state identity;  
* lifecycle metadata;  
* explicit observation time;  
* canonical state structure;  
* immutable or defensively copied representation;  
* conflict and gap integrity;  
* provenance integrity;  
* JSON-compatible values;  
* contract version compatibility.

The engine shall not:

* repair state;  
* infer missing values;  
* modify the source snapshot;  
* discard invalid values silently;  
* bypass existing canonical constructors.

---

# **Snapshot Validation**

Before publication, validation shall confirm:

* deterministic context identity;  
* source-state linkage;  
* measure integrity;  
* ordering integrity;  
* relationship integrity;  
* condition integrity;  
* evidence integrity;  
* metadata completeness;  
* recursively immutable representation.

Publication shall occur only after successful validation.

---

# **Failure Taxonomy**

Minimum deterministic failure categories shall include:

## **Source Snapshot Validation Failure**

The supplied `ExecutiveStateSnapshot` violates its canonical contract.

## **Unsupported Contract Version**

The context engine cannot deterministically process the supplied snapshot version.

## **Derivation Failure**

A deterministic measure cannot be calculated under its published rule.

## **Condition Construction Failure**

A contextual condition cannot be represented according to contract.

## **Context Identity Failure**

A deterministic context identity cannot be produced.

## **Context Validation Failure**

The completed context snapshot fails canonical validation.

## **Configuration Failure**

Explicit deterministic context configuration is invalid or unresolved.

Failures shall include:

* failing stage;  
* stable failure code;  
* deterministic rule;  
* explanatory message;  
* source snapshot identity where available.

---

# **Existing Architecture Preservation**

Sprint 3.27 shall preserve:

* ProjectionArtifact contracts;  
* ProjectionArtifactSet lifecycle semantics;  
* Projection Engine behaviour;  
* Calendar Projection Adapter behaviour;  
* Situational Awareness Engine behaviour;  
* ExecutiveStateSnapshot contract;  
* Executive Scenario contracts;  
* Executive Operating System runtime;  
* deterministic replay;  
* backward compatibility.

Executive Context consumes the published `ExecutiveStateSnapshot`.

It shall not redefine upstream architecture.

---

# **EOS Integration**

Sprint 3.27 shall introduce the Executive Context boundary without requiring a redesign of the Executive Operating System.

Where EOS currently consumes an `ExecutiveStateSnapshot`, implementation shall first determine the least invasive compatible integration.

Acceptable approaches may include:

* an additive EOS input path accepting `ExecutiveContextSnapshot`;  
* a boundary adapter preserving existing EOS runtime contracts;  
* structural inclusion of the source state within context where constitutionally appropriate;  
* compatibility tests demonstrating unchanged legacy behaviour.

The implementation shall not remove or silently reinterpret existing EOS inputs.

Any material change to the EOS public contract requires explicit architectural justification and, where necessary, an ADR.

---

# **Repository Architecture**

Executive Context shall be a distinct architectural package.

Canonical package flow:

connectors/  
        ↓  
projection-adapters/  
        ↓  
projection-engine/  
        ↓  
situational-awareness/  
        ↓  
executive-context/  
        ↓  
executive-operating-system/  
        ↓  
executive-modules/

The exact physical layout may follow existing repository conventions, but the architectural boundary shall remain explicit.

---

# **Package Responsibilities**

The Executive Context package owns:

* context contracts;  
* deterministic derivation logic;  
* deterministic summaries;  
* deterministic measures;  
* contextual conditions;  
* calculation evidence;  
* context validation;  
* context identity;  
* immutable publication;  
* replay;  
* package documentation;  
* focused tests.

The package shall not own:

* connector implementation;  
* Projection Adapter implementation;  
* ProjectionArtifact construction;  
* Situational Awareness assembly;  
* executive reasoning;  
* specialist behaviour;  
* orchestration;  
* persistence;  
* UI;  
* notifications;  
* language-model interaction.

---

# **Public Contracts**

The package may expose:

* `ExecutiveContextSnapshot`;  
* `ExecutiveContextEngine`;  
* context metadata;  
* measure contracts;  
* condition contracts;  
* evidence contracts;  
* derivation input contracts;  
* success contracts;  
* failure contracts.

Internal indexes and calculation helpers shall remain private.

Consumers shall depend only upon stable published contracts.

---

# **Assembly Interface**

The engine shall expose one deterministic derivation interface.

Conceptually:

ExecutiveStateSnapshot  
        ↓  
derive()  
        ↓  
ExecutiveContextSnapshot

The repository may use `assemble()` if required for naming consistency, but `derive()` is preferred because the engine computes deterministic values rather than merely grouping state.

The implementation shall use one public verb consistently.

---

# **Replay Fixtures**

Sprint 3.27 shall add deterministic fixtures representing:

* empty valid executive state;  
* one commitment;  
* multiple independent commitments;  
* explicit project and role relationships;  
* state with conflicts;  
* state with gaps;  
* state with multiple provenance sources;  
* state containing explicit unknown values;  
* state with temporal values sufficient for supported calculations.

Invalid fixtures shall include:

* malformed source snapshot identity;  
* unsupported version;  
* malformed lifecycle metadata;  
* invalid conflict record;  
* invalid gap record;  
* invalid provenance;  
* non-JSON-compatible value;  
* invalid deterministic configuration.

Fixtures shall remain:

* local;  
* immutable;  
* credential-free;  
* deterministic;  
* suitable for repeated replay.

---

# **Test Architecture**

Testing shall prove constitutional behaviour.

## **Contract Tests**

Verify `ExecutiveContextSnapshot` and result contracts.

## **Input Validation Tests**

Verify invalid source snapshots fail deterministically.

## **Derivation Tests**

Verify counts, groupings and supported measures.

## **Relationship Tests**

Verify only explicit relationships are used.

## **Condition Tests**

Verify deterministic structural conditions.

## **Identity Tests**

Verify stable context identity.

## **Ordering Tests**

Verify canonical ordering.

## **Immutability Tests**

Verify published context cannot be mutated.

## **Replay Tests**

Verify identical replay output.

## **Non-Inference Tests**

Verify no priority, urgency, importance, intent or inferred relationship is introduced.

## **EOS Integration Tests**

Verify compatibility with the existing Executive Operating System.

## **Backward Compatibility Tests**

Verify existing state-driven runtime paths remain valid unless intentionally and explicitly migrated.

---

# **Acceptance Criteria**

Sprint 3.27 is complete only when all criteria are satisfied.

## **Architectural Acceptance**

* One `ExecutiveContextEngine` exists.  
* One immutable `ExecutiveContextSnapshot` contract exists.  
* Context derives only from `ExecutiveStateSnapshot`.  
* Executive reasoning remains outside the engine.  
* Situational Awareness behaviour remains unchanged.  
* Existing EOS architecture remains compatible.

## **Deterministic Acceptance**

* Stable context identity.  
* Stable ordering.  
* Stable measures.  
* Stable conditions.  
* Stable calculation evidence.  
* Stable replay.

## **Validation Acceptance**

* Invalid state fails explicitly.  
* Unsupported versions fail explicitly.  
* Partial publication is impossible.  
* No silent repair occurs.  
* No system clock is used.

## **Semantic Acceptance**

* Only explicit relationships are grouped.  
* No priority is inferred.  
* No urgency is inferred.  
* No importance is inferred.  
* No intent is inferred.  
* No recommendation is produced.  
* Raw measures are preferred over ungoverned evaluative labels.

## **Repository Acceptance**

* Clear package boundary.  
* Stable public contracts.  
* No connector dependency.  
* No provider dependency.  
* No UI.  
* No persistence.  
* No LLM dependency.  
* No circular dependency.

## **Testing Acceptance**

* Contract tests pass.  
* Derivation tests pass.  
* Condition tests pass.  
* Non-inference tests pass.  
* Replay tests pass.  
* EOS integration tests pass.  
* Full repository verification passes.

---

# **Explicit Non-Goals**

Sprint 3.27 shall not:

* implement DAWNWATCH;  
* implement MARCUS;  
* implement STEVE;  
* implement PHDSS Executive Mode;  
* perform executive reasoning;  
* recommend actions;  
* infer priorities;  
* infer urgency;  
* infer importance;  
* infer strategic value;  
* infer sentiment;  
* perform planning;  
* optimise scheduling;  
* generate notifications;  
* generate executive briefings;  
* introduce persistence;  
* introduce UI;  
* invoke a language model;  
* redesign the Projection Engine;  
* redesign the Situational Awareness Engine;  
* redesign the Executive Operating System.

These exclusions are deliberate constitutional scope controls.

---

# **Verification Requirements**

Before completion, Codex shall run:

npm test  
npm run lint  
npm run typecheck  
npm run build  
git diff \--check

Where the repository has no `typecheck` script, the canonical available TypeScript command shall be used and reported accurately.

Focused verification shall additionally include:

* Executive Context tests;  
* Situational Awareness integration tests;  
* deterministic replay tests;  
* EOS integration tests;  
* backward-compatibility tests.

Any environment-related build warning shall be reported accurately and distinguished from compilation failure.

---

# **Implementation Instruction for Codex**

You are implementing Sprint 3.27 in the JARVIS repository.

Implement one narrow deterministic path:

ExecutiveStateSnapshot  
        ↓  
ExecutiveContextEngine  
        ↓  
ExecutiveContextSnapshot  
        ↓  
Existing Executive Operating System

Before modifying the repository:

1. Read this specification completely.  
2. Review the Engineering Constitution.  
3. Review the JARVIS North Star.  
4. Review JESS.  
5. Review accepted ADRs.  
6. Review Sprint 3.25.  
7. Review Sprint 3.26.  
8. Review `ExecutiveStateSnapshot`.  
9. Review the existing Situational Awareness package.  
10. Trace the current EOS input path.  
11. Identify the least invasive compatible integration boundary.

Do not redesign existing architecture unless a demonstrable constitutional defect prevents implementation.

---

# **Required Implementation Order**

Implement in this order:

1. Context contract.  
2. Derivation input and result contracts.  
3. Context engine interface.  
4. Input validation.  
5. Canonical ordering.  
6. Deterministic measures.  
7. Explicit relationship summaries.  
8. Conflict and gap summaries.  
9. Structural conditions.  
10. Context identity.  
11. Context validation.  
12. Immutable publication.  
13. Replay fixtures.  
14. Focused tests.  
15. EOS integration.  
16. Documentation.  
17. ADR only where genuinely required.

Each stage shall remain independently reviewable.

---

# **Completion Report**

Return a structured report containing:

## **1\. Sprint Summary**

State whether Sprint 3.27 is:

* fully implemented;  
* implemented with documented limitations;  
* partially implemented.

## **2\. Architecture**

Describe the implemented path:

ExecutiveStateSnapshot  
        ↓  
ExecutiveContextEngine  
        ↓  
ExecutiveContextSnapshot  
        ↓  
Executive Operating System

## **3\. Requirement Traceability**

Map every major requirement to:

* implementation;  
* tests;  
* completion status.

## **4\. Files Changed**

Separate:

* contracts;  
* implementation;  
* fixtures;  
* tests;  
* documentation;  
* ADRs.

## **5\. Architectural Preservation**

Explicitly confirm preservation of:

* ProjectionArtifact;  
* ProjectionArtifactSet;  
* Projection Engine;  
* Calendar Projection Adapter;  
* Situational Awareness Engine;  
* ExecutiveStateSnapshot;  
* Executive Scenario Framework;  
* Executive Operating System;  
* deterministic replay;  
* backward compatibility.

## **6\. Deterministic Guarantees**

Explain:

* stable context identity;  
* stable ordering;  
* deterministic measures;  
* deterministic conditions;  
* immutable publication;  
* structural equality;  
* replay.

## **7\. Non-Inference Evidence**

Explain how implementation prevents:

* priority inference;  
* urgency inference;  
* importance inference;  
* intent inference;  
* relationship inference;  
* recommendations;  
* hidden use of current time.

## **8\. Verification Evidence**

Report exact results for:

* focused Executive Context tests;  
* Situational Awareness integration tests;  
* replay tests;  
* EOS integration tests;  
* complete repository tests;  
* lint;  
* typecheck;  
* build;  
* `git diff --check`.

## **9\. Residual Limitations**

Identify limitations imposed by existing canonical contracts.

Do not invent missing upstream semantics.

## **10\. Deferred Work**

Identify intentionally deferred work, including:

* DAWNWATCH;  
* MARCUS;  
* STEVE;  
* executive reasoning;  
* recommendations;  
* priority inference;  
* planning;  
* orchestration;  
* notification engine;  
* persistence;  
* UI;  
* richer canonical context;  
* future specialist modules.

---

# **Sprint Completion Standard**

Sprint 3.27 is complete when the repository demonstrates that one canonical `ExecutiveStateSnapshot` can be transformed into one deterministic, immutable and replayable `ExecutiveContextSnapshot` without introducing executive judgement, recommendation, priority inference, connector behaviour or stochastic reasoning.

The Executive Context layer shall make canonical state easier for downstream systems to consume.

It shall not decide what that state means.

The success criterion is one production-quality context engine that preserves the constitutional boundary between observed executive reality and executive interpretation.

