# **Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation**

## **Status**

**Implementation — Isolated**

Sprint 3.83 implements the conversational identity, lineage, projection, lifecycle, retry, and repository boundaries authorised by Sprint 3.82.

This sprint creates new isolated modules under:

lib/governed-conversation/

It does not connect those modules to the live conversational runtime.

This sprint is not:

* an `/api/chat` integration sprint;  
* an EOS runtime sprint;  
* a selector sprint;  
* a production-persistence sprint;  
* a model-invocation redesign sprint;  
* an operator-verification sprint;  
* a promotion sprint.

The live conversational route and all EOS runtime publications shall remain unchanged.

---

## **Architectural Context**

This sprint shall be executed under the repository constitutional hierarchy.

Authority order:

1. Engineering Constitution  
2. `docs/architecture/NORTH_STAR.md`  
3. JESS — JARVIS Engineering Specification Standard  
4. `docs/architecture/ROADMAP.md`  
5. Constitutional Publication Principles  
6. Accepted Architecture Decision Records  
7. Existing responsibility statements  
8. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`  
9. `docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md`  
10. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`  
11. Current governed-conversation modules and tests  
12. Current EOS identity types and composers  
13. This Sprint Specification

Sprint 3.82 is the sole authority for lineage, identity, projection, lifecycle, persistence, retry, and failure semantics.

Sprint 3.77 remains the isolation and deterministic-runtime precedent.

Current implementation convenience shall not expand Sprint 3.82.

---

## **Repository Precondition**

Before implementation:

1. Confirm the intended repository and branch.  
2. Record the starting commit.  
3. Confirm the working tree is clean.  
4. Confirm the following documents exist:

docs/architecture/ROADMAP.md  
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md  
docs/SPRINT-3.77-ISOLATED-GOVERNED-CONVERSATIONAL-RUNTIME-IMPLEMENTATION.md  
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md

5. Confirm the current governed-conversation modules exist:

lib/governed-conversation/types.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/response-envelope.ts  
lib/governed-conversation/validator.ts  
lib/governed-conversation/model-request.ts  
lib/governed-conversation/model-output.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/execution-record.ts

6. Confirm the protected live files exist:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts

7. Locate and record every EOS runtime file under:

lib/executive-operating-system/

that shall remain outside this sprint.

8. Read Sprint 3.82 completely before creating any new type.  
9. Read Sprint 3.77 completely as the isolation precedent.  
10. Read the Roadmap completely.  
11. Record pre-sprint blob SHAs for:  
    * `app/api/chat/route.ts`;  
    * `lib/context-builder.ts`;  
    * `lib/useAgentConversation.ts`;  
    * all EOS runtime entry, session, interaction, operational-state, and run-record files identified as protected.  
12. Confirm no existing module already claims ownership of:  
    * conversational thread identity;  
    * conversational exchange identity;  
    * governed conversational projection;  
    * conversational lineage persistence.

If Sprint 3.82 is unavailable:

* do not reconstruct its decisions from reports;  
* do not infer identity semantics;  
* do not proceed.

Return:

> **Implementation Incomplete — Governed Lineage Contract Unavailable**

If implementation requires reopening any Sprint 3.82 decision, stop and report rather than extending scope.

---

## **Objective**

Implement, in complete isolation:

1. the six conversational lineage identity types;  
2. deterministic identity constructors;  
3. the Dedicated Conversational Projection Composer;  
4. the governed exchange lifecycle state machine;  
5. Retry Model A attempt linkage;  
6. new-exchange boundary evaluation;  
7. the Conversational Lineage Repository port;  
8. an in-memory reference repository;  
9. fail-closed orchestration and commit sequencing;  
10. comprehensive deterministic tests.

---

## **Binding Identity-Domain Rule**

Sprint 3.82 selected:

Option A — Separate identity domains

Therefore:

> EOS run identity and conversational-exchange identity are formally separate.

No module created in this sprint shall:

* construct an `ExecutiveRunRecord`;  
* reuse an EOS run ID as a conversational exchange ID;  
* extend `ExecutiveSession`;  
* extend `ExecutiveInteractionContract`;  
* require an EOS publication for ordinary chat lineage;  
* imply Candidate Construction, Candidate Evaluation, Candidate Comparison, Executive Reasoning, Governed Action Proposal, routing, approval, execution, or EOS completion.

A real EOS publication may appear only as an optional typed contextual reference.

---

## **Binding Lineage Architecture**

Sprint 3.82 selected:

Option 1 — New lightweight conversational lineage publications

The implemented lineage shall be:

ConversationalThread  
  └─ ConversationalRequest  
      └─ ConversationalExchange  
          ├─ GovernedConversationalProjection  
          │    └─ GovernedConversationalInput  
          ├─ ModelInvocationAttempt \[0..n\]  
          ├─ ValidatedResponseEnvelope \[0..1\]  
          └─ ConversationalExecutionRecord \[exactly 1 terminal\]

Source snapshots and real EOS publications may be referenced.

They are not prerequisites or identity substitutes.

---

## **Scope**

### **In Scope**

Sprint 3.83 shall implement:

* conversational lineage types;  
* identity constructors;  
* deterministic canonicalisation;  
* projection composition;  
* projection identity;  
* exchange lifecycle state machine;  
* lifecycle events;  
* attempt ordinals and links;  
* retry eligibility;  
* new-exchange boundary detection;  
* repository port;  
* in-memory repository;  
* fail-closed commit orchestration;  
* isolation tests;  
* lineage, lifecycle, projection, retry, persistence, and failure tests.

### **Out of Scope**

Sprint 3.83 shall not:

* modify `/api/chat`;  
* modify `context-builder.ts`;  
* modify `useAgentConversation.ts`;  
* modify any EOS runtime file;  
* modify `ExecutiveSession`;  
* modify `ExecutiveInteractionContract`;  
* modify Sprint 3.77 evidence-status semantics;  
* modify Sprint 3.77 response-envelope semantics;  
* modify Sprint 3.77 validator semantics;  
* modify Sprint 3.79 model-invocation semantics;  
* add a selector;  
* add an endpoint;  
* call a model;  
* integrate production persistence;  
* select a database;  
* use Supabase;  
* use filesystem persistence;  
* modify current conversational behaviour;  
* perform operator verification;  
* promote anything.

---

## **Authoritative Output Paths**

### **Sprint specification**

docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md

### **Lineage identity types and constructors**

lib/governed-conversation/lineage-types.ts

### **Projection composer**

lib/governed-conversation/projection-composer.ts

### **Exchange lifecycle**

lib/governed-conversation/exchange-lifecycle.ts

### **Retry semantics**

lib/governed-conversation/retry-policy.ts

### **Lineage repository port**

lib/governed-conversation/lineage-repository.ts

### **In-memory reference repository**

lib/governed-conversation/in-memory-lineage-repository.ts

### **Fail-closed sequencing coordinator**

lib/governed-conversation/lineage-orchestrator.ts

### **Tests**

lib/governed-conversation/lineage-types.test.ts  
lib/governed-conversation/projection-composer.test.ts  
lib/governed-conversation/exchange-lifecycle.test.ts  
lib/governed-conversation/retry-policy.test.ts  
lib/governed-conversation/lineage-repository.test.ts  
lib/governed-conversation/lineage-orchestrator.test.ts  
lib/governed-conversation/lineage-isolation.test.ts

Equivalent consolidation is permitted only if all responsibilities and tests remain clearly separated.

No production import is authorised.

---

# **Part I — Conversational Lineage Types**

## **Closed Publication Types**

Implement the following six lineage publications:

1. `ConversationalThread`  
2. `ConversationalRequest`  
3. `ConversationalExchange`  
4. `ModelInvocationAttempt`  
5. `ValidatedConversationalResponseEnvelopeReference`  
6. `ConversationalExecutionRecord`

These types shall be immutable after publication.

Use readonly fields and freeze returned publication objects where consistent with repository convention.

---

## **1\. Conversational Thread Identity**

A `ConversationalThread` proves:

> A continuity container was opened for classified conversational turns.

It does not prove:

* a request was accepted;  
* an exchange began;  
* a source was observed;  
* a model was called;  
* a response was produced;  
* an EOS session existed.

Required fields shall include at minimum:

interface ConversationalThread {  
  threadId: string;  
  schemaVersion: string;  
  openedAt: string;  
  status: "open" | "closed";  
  closedAt?: string;  
  continuityPolicyId: string;  
  optionalAgentContext?: string;  
  optionalParentThreadId?: string;  
}

Exact names may align with repository conventions.

The thread ID shall remain stable across:

* multiple exchanges;  
* model retries;  
* evidence refreshes;  
* provider changes;  
* assistant/agent changes that do not intentionally fork continuity.

A deliberate thread fork or privacy/authority boundary shall require a new thread identity.

No sensitive conversation content shall be embedded in the thread identity body.

---

## **2\. Conversational Request Identity**

A `ConversationalRequest` proves:

> One operator submission passed authentication and minimum request-shape acceptance.

It does not prove:

* projection succeeded;  
* a model was invoked;  
* a response was validated;  
* the exchange completed.

Required fields shall include:

interface ConversationalRequest {  
  requestId: string;  
  schemaVersion: string;  
  threadId: string;  
  acceptedAt: string;  
  requestContentReference: string;  
  requestDigest: string;  
  idempotencyKey?: string;  
  operatorIdentityReference?: string;  
  agentId?: string;  
}

Raw operator text shall not be required inside the publication when a stable reference and digest suffice.

A modified operator submission creates a new request identity.

A valid transport duplicate with the same idempotency key reuses the existing request identity.

---

## **3\. Conversational Exchange Identity**

A `ConversationalExchange` proves:

> One accepted operator request entered one governed response lifecycle.

The exchange identity shall be created:

after authentication and minimum request acceptance  
before projection

It does not prove:

* projection succeeded;  
* a model was called;  
* validation passed;  
* a response was released;  
* the exchange completed.

Required fields shall include:

interface ConversationalExchange {  
  exchangeId: string;  
  schemaVersion: string;  
  threadId: string;  
  requestId: string;  
  createdAt: string;  
  currentState: ConversationalExchangeState;  
  referenceTime: string;  
  validationPolicyId: string;  
  evidencePolicyId: string;  
  retryPolicyId: string;  
  optionalReplayOfExchangeId?: string;  
  optionalRealEosReferences?: RealEosContextReference\[\];  
}

The exchange ID remains stable across Retry Model A attempts.

A new exchange is required when any binding semantic input changes under the retry rules below.

---

## **4\. Model Invocation Attempt Identity**

A `ModelInvocationAttempt` proves:

> One provider/model invocation was started for one exchange using one exact governed input and configuration.

It shall be created immediately before the external call boundary.

No attempt identity shall exist if processing stops before a model call.

Required fields shall include:

interface ModelInvocationAttempt {  
  attemptId: string;  
  schemaVersion: string;  
  exchangeId: string;  
  governedInputId: string;  
  ordinal: number;  
  startedAt: string;  
  completedAt?: string;  
  providerConfigurationReference: string;  
  outcome:  
    | "started"  
    | "output\_received"  
    | "provider\_failed"  
    | "parse\_failed"  
    | "validation\_failed"  
    | "accepted";  
  parentAttemptId?: string;  
  outputDigest?: string;  
  failureCode?: string;  
}

Each retry receives:

* the same exchange identity;  
* a new attempt identity;  
* the next ordinal;  
* a link to the previous attempt where applicable.

Attempt identity shall not imply validation or completion.

---

## **5\. Response-Envelope Identity**

A response-envelope identity proves:

> One structured response envelope for one exchange passed deterministic validation, or the deterministic safe-response constructor produced a validated safe envelope.

It shall exist only after validation passes.

It shall never be constructed for:

* raw model output;  
* malformed output;  
* unparsed output;  
* an envelope whose validation failed;  
* an uncommitted response candidate.

Required reference publication:

interface ValidatedConversationalResponseEnvelopeReference {  
  responseEnvelopeId: string;  
  schemaVersion: string;  
  exchangeId: string;  
  governedInputId: string;  
  validationPolicyId: string;  
  validationResultId: string;  
  envelopeDigest: string;  
  envelopeKind: "model\_response" | "safe\_response";  
  validatedAt: string;  
}

At most one accepted envelope may exist per exchange.

The existing Sprint 3.77 response-envelope type remains authoritative for content.

This new type records lineage and validated publication identity only.

---

## **6\. Execution-Record Identity**

A `ConversationalExecutionRecord` proves:

> The terminal lifecycle outcome recorded for one conversational exchange.

It does not prove EOS execution or external action.

Required fields shall include:

interface ConversationalExecutionRecord {  
  executionRecordId: string;  
  schemaVersion: string;  
  threadId: string;  
  requestId: string;  
  exchangeId: string;  
  projectionId?: string;  
  governedInputId?: string;  
  attemptIds: string\[\];  
  acceptedEnvelopeId?: string;  
  finalDisposition:  
    | "completed"  
    | "completed\_safe\_response"  
    | "failed";  
  terminalState: "completed" | "failed";  
  validationOutcome?: "passed" | "failed";  
  failureCategory?: ConversationalFailureCategory;  
  failureCode?: string;  
  createdAt: string;  
  completedAt: string;  
  policyReferences: string\[\];  
  sourceReferences: string\[\];  
}

Exactly one authoritative terminal execution record shall exist per exchange.

The in-memory repository shall enforce this uniqueness.

---

## **Request-Rejection Record**

Sprint 3.82 authorises a minimized rejection record for input rejected before exchange creation.

Implement a separate type only if required to represent pre-acceptance failure honestly:

interface ConversationalRequestRejectionRecord {  
  rejectionId: string;  
  schemaVersion: string;  
  receivedAt: string;  
  rejectionCode: string;  
  requestDigest?: string;  
  idempotencyKey?: string;  
}

It shall not contain an exchange ID.

It shall not imply that a governed exchange began.

---

# **Part II — Deterministic Identity Construction**

## **Identity Rules**

All lineage identities shall be deterministic over their canonical governed identity bodies.

Identity generation shall:

* recursively sort object keys;  
* preserve semantically meaningful array order;  
* exclude mutable runtime-only object references;  
* include schema and policy versions where they affect meaning;  
* exclude UI wording;  
* exclude raw model prose where a digest/reference suffices;  
* exclude raw sensitive content where a stable digest/reference suffices.

Use existing repository hashing utilities where suitable.

Do not create a competing hashing implementation unnecessarily.

---

## **Event Identity versus Content Identity**

Identity constructors shall preserve the contract distinction:

> Content equality does not automatically merge lifecycle events.

Thread, request, exchange, attempt, and execution-record identities represent events.

A repeated operator request at a later time normally creates a new request and exchange even when the request digest matches.

Deterministic constructors may therefore include:

* accepted/created time;  
* idempotency key;  
* explicit event nonce supplied by the caller;  
* another governed event discriminator.

Do not use random generation hidden inside pure constructors.

Any event discriminator shall be explicit input.

Projection and governed-input identities may remain content-addressed because they identify immutable publications.

---

## **Constructor Preconditions**

Constructors shall validate required event semantics.

Examples:

* exchange creation requires an accepted request;  
* attempt creation requires a committed projected input;  
* response-envelope identity requires validation outcome `passed`;  
* execution record requires a terminal exchange state;  
* failed records shall not carry a successful accepted envelope unless the final disposition is a validated completed-safe-response outcome.

Invalid construction shall fail explicitly.

---

# **Part III — Dedicated Conversational Projection Composer**

## **Exclusive Ownership**

Create:

lib/governed-conversation/projection-composer.ts

The composer is the immediate and sole owner of the Governed Conversational Projection.

It shall be:

* pure;  
* deterministic;  
* immutable;  
* independently testable;  
* model-independent;  
* UI-independent;  
* route-independent;  
* EOS-runtime-independent.

It shall not import:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/operational-state.ts  
lib/connectors/email-message.ts

It shall not consume raw `OperationalState` or raw `gmailThreads`.

---

## **Projection Input**

Define a typed input composed only of authorised upstream publications and references.

At minimum:

interface GovernedConversationalProjectionInput {  
  schemaVersion: string;  
  evidenceRulesetId: string;  
  compatibilityRulesetId: string;  
  claimClassificationRulesetId: string;

  threadId: string;  
  requestId: string;  
  exchangeId: string;

  referenceTime: string;  
  createdAt: string;

  sourceEvidence: GovernedSourceEvidenceInput\[\];  
  connectorAvailability: GovernedConnectorAvailabilityInput\[\];  
  calendarEvidence: GovernedCalendarEvidenceInput\[\];  
  communicationEvidence: GovernedCommunicationEvidenceInput\[\];  
  memoryPriorityReferences: GovernedMemoryPriorityReference\[\];

  compatibilityContext: CompatibilityContext\[\];  
  conversationHistory: GovernedConversationTurn\[\];  
  claims: GovernedClaimInput\[\];  
  conflicts: GovernedConflictInput\[\];

  optionalApplicationContextReferences?: string\[\];  
  optionalRealEosReferences?: RealEosContextReference\[\];  
}

The exact shape shall reuse Sprint 3.77 types where applicable.

Do not duplicate existing claim, evidence-status, source-reference, history-classification, conflict, or compatibility types.

---

## **Projection Output**

Define:

interface GovernedConversationalProjection {  
  projectionId: string;  
  schemaVersion: string;  
  evidenceRulesetId: string;  
  compatibilityRulesetId: string;  
  claimClassificationRulesetId: string;

  threadId: string;  
  requestId: string;  
  exchangeId: string;

  referenceTime: string;  
  createdAt: string;

  upstreamPublicationReferences: GovernedPublicationReference\[\];  
  sourceEvidenceReferences: GovernedSourceReference\[\];  
  connectorAvailability: GovernedConnectorAvailability\[\];  
  calendarEvidence: GovernedCalendarProjectionReference\[\];  
  communicationEvidence: GovernedCommunicationProjectionReference\[\];  
  memoryPriorityReferences: GovernedMemoryPriorityReference\[\];

  compatibilityContext: CompatibilityContext\[\];  
  conversationHistory: GovernedConversationTurn\[\];  
  claims: GovernedClaimInput\[\];  
  conflicts: GovernedConflict\[\];

  optionalApplicationContextReferences: string\[\];  
  optionalRealEosReferences: RealEosContextReference\[\];  
}

The output shall retain the mandatory Sprint 3.82 contents while minimising copied data.

---

## **Mandatory Projection Contents**

The projection shall retain:

### **Identity and lineage**

* projection identity;  
* schema version;  
* evidence-status ruleset;  
* compatibility ruleset;  
* claim-classification ruleset;  
* thread identity;  
* request identity;  
* exchange identity;  
* reference time;  
* creation time;  
* immediate upstream references.

### **Gmail evidence**

* source-qualified communication identity;  
* governed recipient evidence reference;  
* provenance reference;  
* retrieval time;  
* source availability;  
* evidence-status inputs;  
* compatibility boundary.

### **Calendar evidence**

* source-qualified commitment identity;  
* governed start/end semantics;  
* timezone;  
* provenance;  
* source availability;  
* coverage limits.

### **Memory and priorities**

* source-qualified memory or priority references;  
* source owner;  
* freshness;  
* availability;  
* classification distinguishing operator-provided priorities from derived interpretation.

### **Connector availability**

* connector/source identity;  
* availability;  
* observation time;  
* governed failure or authorisation cause;  
* fallback status.

### **Conversation history**

* classified turns or stable references;  
* `operator_provided`;  
* `assistant_prior_output`;  
* `retrieval_reference`;  
* explicit non-canonical ownership.

### **Governed claim set**

* claim identity;  
* claim type;  
* materiality;  
* evidence status;  
* source references;  
* unsupported/unavailable state;  
* uncertainty;  
* conflicts.

### **Cross-source conflict**

* conflict identity;  
* source owners;  
* affected claims;  
* status restriction.

---

## **Projection Data Minimisation**

The projection shall copy only small governed fields required for bounded interpretation.

It shall not copy:

* full email bodies;  
* complete calendar descriptions;  
* full memory documents;  
* credentials;  
* access tokens;  
* raw provider payloads;  
* raw attachments;  
* raw model output;  
* unrestricted conversation transcripts.

For those values, retain:

* stable source reference;  
* content digest where authorised;  
* content kind;  
* policy reference;  
* retrieval/availability state.

Required tests shall prove at minimum:

1. an email body supplied to fixture construction is not present in the projection output;  
2. a calendar description supplied to fixture construction is not present in the projection output;  
3. stable references remain;  
4. the projection identity changes when a relevant reference or digest changes;  
5. the projection identity does not change merely because excluded raw text changes while its governed reference remains unchanged.

---

## **Projection Identity Sensitivity**

The projection ID must change when any governed semantic input changes, including:

* source evidence;  
* source availability;  
* claim set;  
* claim materiality;  
* reference time;  
* relevant history references;  
* compatibility context;  
* evidence ruleset;  
* claim-classification ruleset;  
* cross-source conflicts;  
* policy references.

It shall not change for:

* UI wording;  
* prompt wording;  
* natural-language rendering;  
* raw model output;  
* excluded raw sensitive content where references/digests remain unchanged;  
* canonical key ordering.

---

## **Projection Validation**

The composer shall reject:

* missing thread/request/exchange lineage;  
* mismatched lineage identities;  
* duplicate claim identities;  
* claim source references not present in source/upstream references;  
* conflicts referring to unknown claims;  
* compatibility context represented as governed evidence;  
* prior assistant output represented as canonical evidence;  
* raw sensitive content in prohibited fields;  
* missing source availability;  
* missing required ruleset identities;  
* synthetic EOS references;  
* any attempt to use an EOS run identity as the exchange identity.

---

# **Part IV — Exchange Lifecycle State Machine**

## **Closed States**

Implement:

type ConversationalExchangeState \=  
  | "created"  
  | "input\_projected"  
  | "model\_invocation\_started"  
  | "model\_output\_received"  
  | "validation\_passed"  
  | "validation\_failed"  
  | "safe\_response\_created"  
  | "completed"  
  | "failed";

No additional state is authorised.

---

## **Permitted Transitions**

Implement exactly:

created → input\_projected  
created → failed

input\_projected → model\_invocation\_started  
input\_projected → failed

model\_invocation\_started → model\_output\_received  
model\_invocation\_started → failed

model\_output\_received → validation\_passed  
model\_output\_received → validation\_failed

validation\_passed → completed

validation\_failed → safe\_response\_created  
validation\_failed → failed

safe\_response\_created → completed

`completed` and `failed` are terminal.

No transition may leave a terminal state.

No backward transition is permitted.

---

## **Lifecycle Events**

Each transition shall produce an immutable event containing:

interface ConversationalLifecycleEvent {  
  eventId: string;  
  exchangeId: string;  
  from: ConversationalExchangeState;  
  to: ConversationalExchangeState;  
  occurredAt: string;  
  eventCode: string;  
  attemptId?: string;  
  projectionId?: string;  
  responseEnvelopeId?: string;  
  failureCategory?: ConversationalFailureCategory;  
  failureCode?: string;  
}

Event IDs shall be deterministic over their canonical event bodies and explicit event discriminator.

---

## **Failure Categories**

Implement the contract’s distinct failure categories:

type ConversationalFailureCategory \=  
  | "projection"  
  | "source"  
  | "provider"  
  | "malformed\_output"  
  | "validation"  
  | "persistence";

Where necessary, include:

request\_rejected  
policy\_refusal

only if already authorised by Sprint 3.82 and clearly distinguished from exchange failure.

Each failure category shall have at least one test path.

---

## **Failure Semantics**

### **Projection failure**

May occur from:

created → failed

unless the projection truthfully represents source unavailability and supports a governed safe response.

### **Source failure**

May produce:

* a complete projection containing `unavailable`, followed by safe response; or  
* exchange failure where no complete governed projection can be committed.

### **Provider failure**

Occurs after an attempt started.

It may:

* start a permitted retry under Retry Model A; or  
* transition to `failed`.

### **Malformed output**

Belongs to one attempt.

It proceeds to:

model\_output\_received → validation\_failed

then:

validation\_failed → safe\_response\_created

or:

validation\_failed → failed

### **Validation failure**

Shall never produce a model-authored accepted envelope.

A validated safe envelope may lead to `completed`.

### **Persistence failure**

Is fail-closed.

It shall not report completion or release a response.

---

# **Part V — Retry Model A**

## **Binding Retry Model**

Implement:

Retry Model A — Same exchange, new attempt identity

An automatic retry is authorised only when all of the following remain unchanged:

* operator request identity;  
* operator question;  
* governed projection identity;  
* governed input identity;  
* evidence;  
* source availability;  
* claim set;  
* claim materiality;  
* reference time;  
* compatibility context;  
* evidence-status ruleset;  
* semantic validation policy.

Each retry shall have:

* the same exchange identity;  
* a new attempt identity;  
* an incremented ordinal;  
* the same governed input identity;  
* a link to the previous attempt;  
* preserved failed-attempt history.

---

## **New Exchange Boundary**

A new request and exchange are required when any of these change:

* operator question;  
* accepted request body;  
* governed source evidence;  
* source availability;  
* governed claim set;  
* claim materiality;  
* reference time;  
* compatibility context;  
* evidence-status ruleset;  
* claim-classification ruleset;  
* validation policy;  
* provider/model configuration, unless the unchanged exchange policy explicitly pre-authorised an equivalent failover configuration.

Repeated wording alone does not justify exchange reuse.

A later deliberate resubmission creates a new request and exchange.

---

## **Retry Decision Function**

Create a pure function similar to:

function determineRetryDisposition(  
  previous: ConversationalAttemptContext,  
  next: ConversationalAttemptContext  
):  
  | { kind: "same\_exchange\_new\_attempt" }  
  | { kind: "new\_exchange\_required"; reasons: RetryBoundaryReason\[\] };

The function shall return all material reasons requiring a new exchange.

It shall not silently select one reason.

---

## **Attempt Ordinal Rules**

* first attempt ordinal is `1`;  
* each later attempt increments by exactly one;  
* ordinals are unique within an exchange;  
* an attempt cannot skip an ordinal;  
* attempt IDs remain distinct even if provider configuration and input are identical;  
* failed attempts remain queryable and cannot be overwritten.

---

# **Part VI — Conversational Lineage Repository**

## **Repository Responsibility**

Create a port:

lib/governed-conversation/lineage-repository.ts

The repository owns:

* atomic append and transition semantics;  
* uniqueness;  
* lineage consistency;  
* idempotency;  
* terminal-record enforcement;  
* ordered attempt storage;  
* fail-closed commit results.

It does not own:

* claim classification;  
* evidence status;  
* projection derivation;  
* model invocation;  
* model interpretation;  
* response validation;  
* EOS publications.

---

## **Port Interface**

Define a precise port suitable for later production implementation.

At minimum:

interface ConversationalLineageRepository {  
  createThread(thread: ConversationalThread): Promise\<CommitResult\>;  
  closeThread(  
    threadId: string,  
    closedAt: string  
  ): Promise\<CommitResult\>;

  commitAcceptedRequest(  
    request: ConversationalRequest  
  ): Promise\<CommitResult\>;

  commitRequestRejection(  
    rejection: ConversationalRequestRejectionRecord  
  ): Promise\<CommitResult\>;

  createExchange(  
    exchange: ConversationalExchange  
  ): Promise\<CommitResult\>;

  commitProjection(  
    exchangeId: string,  
    projection: GovernedConversationalProjection,  
    governedInputReference: GovernedInputReference  
  ): Promise\<CommitResult\>;

  startAttempt(  
    attempt: ModelInvocationAttempt  
  ): Promise\<CommitResult\>;

  completeAttempt(  
    attempt: ModelInvocationAttempt  
  ): Promise\<CommitResult\>;

  commitValidatedEnvelope(  
    envelope: ValidatedConversationalResponseEnvelopeReference  
  ): Promise\<CommitResult\>;

  transitionExchange(  
    event: ConversationalLifecycleEvent  
  ): Promise\<CommitResult\>;

  commitTerminalRecord(  
    record: ConversationalExecutionRecord  
  ): Promise\<CommitResult\>;

  getThread(threadId: string): Promise\<ConversationalThread | null\>;  
  getRequest(requestId: string): Promise\<ConversationalRequest | null\>;  
  getExchange(exchangeId: string): Promise\<ConversationalExchangeAggregate | null\>;  
  getByIdempotencyKey(  
    idempotencyKey: string  
  ): Promise\<ConversationalRequest | null\>;  
}

Equivalent method grouping is permitted if semantics remain explicit.

---

## **Commit Result**

Every write shall return a structured result:

type CommitResult \=  
  | {  
      committed: true;  
      commitId: string;  
      committedAt: string;  
    }  
  | {  
      committed: false;  
      failure:  
        | "conflict"  
        | "duplicate"  
        | "invalid\_transition"  
        | "lineage\_mismatch"  
        | "terminal\_record\_exists"  
        | "repository\_unavailable";  
      detail: string;  
    };

A failed commit shall never be treated as successful.

---

## **Atomicity Requirements**

The repository shall atomically enforce:

* one request to one exchange;  
* one exchange to one thread;  
* attempt ordinal uniqueness;  
* at most one accepted envelope per exchange;  
* exactly one authoritative terminal record;  
* no transition after terminal state;  
* no model attempt before committed projection/input;  
* no accepted envelope before validation;  
* no completion before envelope and terminal record requirements are satisfied;  
* idempotency-key reuse of the original request/exchange.

---

## **In-Memory Reference Repository**

Implement:

lib/governed-conversation/in-memory-lineage-repository.ts

It shall:

* implement the complete port;  
* use no external storage;  
* use no filesystem;  
* use no database;  
* use no Supabase;  
* maintain deterministic query and ordering behaviour;  
* simulate repository failure through injected hooks for testing;  
* return immutable copies or frozen records;  
* enforce every repository invariant.

The in-memory implementation is a reference adapter.

It is not production persistence.

---

# **Part VII — Fail-Closed Commit Ordering**

## **Binding Ordering**

Implement the following guarantees as executable sequencing logic:

request accepted and committed  
        ↓  
exchange created and committed  
        ↓  
projection and governed-input references committed  
        ↓  
model call may begin  
        ↓  
attempt start committed  
        ↓  
model invoked  
        ↓  
attempt result committed  
        ↓  
candidate envelope validated  
        ↓  
validated envelope committed  
        ↓  
terminal execution record committed  
        ↓  
response may be released

No model call may occur before:

* request commit;  
* exchange commit;  
* projection/input commit;  
* attempt-start commit.

No response may be released before:

* validated envelope commit;  
* terminal execution-record commit.

---

## **Lineage Orchestrator**

Create:

lib/governed-conversation/lineage-orchestrator.ts

The orchestrator shall be isolated and dependency-injected.

It shall coordinate:

* repository commits;  
* projection composer;  
* model-call callback boundary;  
* validation callback boundary;  
* safe-envelope callback boundary;  
* response-release callback boundary.

It shall not import:

* `callClaude`;  
* `executeAuditedChat`;  
* `/api/chat`;  
* a production audit store;  
* an EOS runtime.

Suggested dependency shape:

interface ConversationalLineageOrchestratorDependencies {  
  repository: ConversationalLineageRepository;  
  composeProjection: typeof composeGovernedConversationalProjection;  
  constructGovernedInput: GovernedInputConstructor;  
  invokeModel: GovernedModelInvocationPort;  
  validateEnvelope: GovernedEnvelopeValidatorPort;  
  constructSafeEnvelope: GovernedSafeEnvelopePort;  
  releaseResponse: GovernedResponseReleasePort;  
  now: () \=\> string;  
}

Tests shall use deterministic injected dependencies.

---

## **Response Release Result**

The orchestrator shall make release explicit:

interface ConversationalReleaseResult {  
  released: boolean;  
  exchangeId: string;  
  responseEnvelopeId?: string;  
  executionRecordId?: string;  
  blockedBy?: string;  
}

A persistence failure shall return:

released: false

The orchestrator shall never call `releaseResponse` after a failed required commit.

---

## **Required Commit-Failure Tests**

Simulate failure at each point:

1. accepted-request commit;  
2. exchange-creation commit;  
3. projection/input commit;  
4. attempt-start commit;  
5. attempt-result commit;  
6. validated-envelope commit;  
7. terminal-execution-record commit.

For each:

* confirm no forbidden later action occurs;  
* confirm whether a model invocation occurred;  
* confirm whether a response was released;  
* confirm lifecycle state;  
* confirm failure category;  
* confirm no false completion record exists.

---

# **Part VIII — Required Tests**

## **Identity Semantics Tests**

### **Thread identity**

Prove:

* thread creation does not imply an exchange;  
* multiple exchanges can reference one thread;  
* a deliberate fork creates a new thread;  
* raw history content is not embedded in identity.

### **Request identity**

Prove:

* request exists after acceptance;  
* idempotency duplicate reuses identity;  
* modified submission creates a new identity;  
* rejected pre-acceptance input creates no exchange.

### **Exchange identity**

Prove:

* exchange identity is created before projection;  
* exchange identity survives retries;  
* exchange identity does not imply model invocation or completion;  
* changed evidence or reference time requires a new exchange.

### **Attempt identity**

Prove:

* no attempt exists before model invocation begins;  
* each retry receives a new attempt identity;  
* ordinal linkage is correct;  
* failed attempts remain preserved.

### **Response-envelope identity**

Prove:

* it cannot be constructed from unvalidated output;  
* it cannot be constructed when validation failed;  
* it can be constructed after successful validation;  
* it can represent a validated safe envelope;  
* only one accepted envelope exists per exchange.

### **Execution-record identity**

Prove:

* only terminal exchanges can produce the record;  
* exactly one authoritative terminal record exists;  
* completed-safe-response differs from successful model response;  
* failed execution does not imply EOS failure.

---

## **Lifecycle Tests**

Test every permitted transition.

Test every prohibited transition.

Test terminal-state enforcement.

Include one complete successful path:

created  
→ input\_projected  
→ model\_invocation\_started  
→ model\_output\_received  
→ validation\_passed  
→ completed

Include one validated safe-response path:

created  
→ input\_projected  
→ model\_invocation\_started  
→ model\_output\_received  
→ validation\_failed  
→ safe\_response\_created  
→ completed

Include failure paths for:

* projection;  
* source;  
* provider;  
* malformed output;  
* validation;  
* persistence.

---

## **Retry Tests**

Prove:

* same exchange plus new attempt for unchanged governed input;  
* ordinal increments;  
* previous attempt is retained;  
* modified question requires new exchange;  
* changed evidence requires new exchange;  
* changed claim set requires new exchange;  
* changed reference time requires new exchange;  
* changed validation policy requires new exchange;  
* pre-authorised equivalent provider failover may remain one exchange only when explicitly represented in unchanged policy;  
* an ungoverned provider change requires a new exchange.

---

## **Projection Tests**

Prove:

* the composer consumes only authorised governed inputs;  
* raw `OperationalState` is not accepted;  
* raw `gmailThreads` are not accepted;  
* source evidence remains source-qualified;  
* conversation history remains non-canonical;  
* prior assistant output cannot become evidence;  
* compatibility context remains non-authoritative;  
* claims retain deterministic status;  
* conflicts retain affected-claim linkage;  
* source unavailability is representable;  
* a Gmail snapshot cannot substitute for the full projection;  
* optional genuine EOS references remain contextual only.

---

## **Data-Minimisation Tests**

At minimum:

### **Message body**

Supply a raw fixture body to the upstream fixture boundary.

Prove:

* the full body is absent from the projection;  
* a stable message/content reference remains;  
* content kind remains explicit;  
* changing only the excluded raw body does not change the projection if the governed reference/digest is unchanged;  
* changing the governed digest/reference changes projection identity.

### **Calendar description**

Supply a full calendar description.

Prove:

* the description is absent from the projection;  
* the commitment reference and governed temporal fields remain;  
* changing excluded description text alone does not change identity;  
* changing the governed reference or temporal meaning changes identity.

---

## **Repository Tests**

Prove:

* thread uniqueness;  
* request idempotency;  
* one request to one exchange;  
* one accepted envelope per exchange;  
* one terminal record per exchange;  
* attempt ordinal uniqueness;  
* no transition after terminal state;  
* immutable returned records;  
* lookup consistency;  
* simulated repository unavailability;  
* atomic rejection of invalid lineage.

---

## **Fail-Closed Tests**

For every simulated commit failure, prove:

| Failure point | Model invoked? | Response released? | Completion recorded? |
| ----- | ----- | ----- | ----- |
| Request commit | No | No | No |
| Exchange commit | No | No | No |
| Projection/input commit | No | No | No |
| Attempt-start commit | No | No | No |
| Attempt-result commit | May have occurred | No | No |
| Envelope commit | May have occurred | No | No |
| Terminal-record commit | May have occurred | No | No |

No test may accept a response release before both final commits.

---

# **Part IX — Isolation Requirement**

## **Forward Isolation**

The completion report shall include direct search evidence proving that none of the new modules are imported by:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/  
components/  
lib/executive-operating-system/

At minimum run an equivalent of:

rg \-n \\  
  "lineage-types|projection-composer|exchange-lifecycle|retry-policy|lineage-repository|in-memory-lineage-repository|lineage-orchestrator" \\  
  app/api/chat \\  
  lib/context-builder.ts \\  
  lib/useAgentConversation.ts \\  
  lib/agents \\  
  components \\  
  lib/executive-operating-system

Expected result:

zero production imports

---

## **Reverse Isolation**

Prove that no new Sprint 3.83 module imports:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/  
lib/executive-operating-system/

The new modules may import existing governed-conversation types and pure functions.

They shall not import EOS runtime types merely to mimic or reuse their identity semantics.

If a genuine EOS contextual reference type is required, define the narrowest local reference shape or use an already neutral reference type without importing runtime execution authority.

---

## **Blob-Hash Proof**

Record pre- and post-sprint blob SHAs for:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts

Also record blob SHAs for protected EOS files, including at minimum:

lib/executive-operating-system/runtime/types.ts  
lib/executive-operating-system/executive-session/types.ts  
lib/executive-operating-system/executive-session/composer.ts  
lib/executive-operating-system/executive-interaction/types.ts  
lib/executive-operating-system/executive-interaction/composer.ts  
lib/executive-operating-system/operational-state/types.ts  
lib/executive-operating-system/operational-state/composer.ts

The post-sprint SHAs shall match the pre-sprint SHAs exactly.

---

## **Existing Governed Core Immutability**

Confirm no semantic modification to:

lib/governed-conversation/types.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/response-envelope.ts  
lib/governed-conversation/validator.ts  
lib/governed-conversation/model-request.ts  
lib/governed-conversation/model-output.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/execution-record.ts

A non-semantic export addition is permitted only if essential, independently reviewed, and explicitly reported.

No validation or evidence-status rule may be weakened.

---

# **Part X — Deferred and Rejected Boundaries**

Sprint 3.83 shall not implement:

* production storage technology;  
* database schema;  
* Supabase;  
* filesystem persistence;  
* `/api/chat` integration;  
* claim classification by a model;  
* source acquisition;  
* raw Gmail or calendar normalisation;  
* automatic retrieval;  
* selector logic;  
* operator verification;  
* promotion;  
* EOS session extension;  
* EOS interaction-contract extension;  
* EOS run subtypes;  
* synthetic EOS publication;  
* UI rendering;  
* retention-policy enforcement beyond the minimal thread status fields;  
* corrective-record production workflow beyond the reference port’s semantic allowance.

If any is required to make the isolated implementation work:

**stop and report.**

Do not implement it as an incidental dependency.

---

## **Validation**

Run the full repository validation suite:

npm test  
npm run lint  
npm run typecheck  
npm run build  
git diff \--check

The full suite is mandatory.

No isolation-only or implementation-only exception applies.

Also run all targeted tests covering:

* lineage identities;  
* constructor preconditions;  
* lifecycle transitions;  
* failure categories;  
* retry semantics;  
* projection composition;  
* projection identity sensitivity;  
* data minimisation;  
* repository invariants;  
* fail-closed sequencing;  
* response release;  
* isolation;  
* protected blob hashes.

Validation shall confirm:

* no `/api/chat` change;  
* no `context-builder` change;  
* no client-hook change;  
* no EOS change;  
* no Sprint 3.77/3.79 semantic change;  
* no selector;  
* no endpoint;  
* no model call;  
* no production persistence;  
* no current runtime behaviour change.

---

## **Success Criteria**

Sprint 3.83 is complete when:

* Sprint 3.82 has been read completely;  
* Sprint 3.77 has been read completely;  
* the Roadmap has been read completely;  
* all six lineage identity publications exist;  
* every identity reflects its contract-defined event;  
* response-envelope identity cannot exist before validation;  
* the Dedicated Conversational Projection Composer exists;  
* the composer consumes only authorised governed inputs;  
* the projection retains all mandatory contents;  
* the projection excludes raw sensitive content;  
* the lifecycle state machine implements only authorised transitions;  
* both terminal states are enforced;  
* each failure category has a real tested path;  
* Retry Model A is implemented;  
* new-attempt versus new-exchange boundaries are deterministic;  
* the repository port is complete;  
* the in-memory adapter enforces invariants;  
* fail-closed ordering is executable and tested;  
* no model call occurs before required pre-call commits;  
* no response is released before envelope and terminal commits;  
* no Deferred or Rejected item is implemented;  
* isolation is proven in both directions;  
* protected blob hashes remain identical;  
* full validation passes.

---

## **Deliverables**

Produce:

1. this specification at:

docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md

2. isolated lineage modules under:

lib/governed-conversation/

3. deterministic unit and orchestration tests;  
4. no production integration;  
5. no real persistence;  
6. a completion report using the required format.

---

## **Return Format**

Return one completion report containing the following sections.

### **Executive Summary**

State:

* what isolated lineage and projection architecture was implemented;  
* whether Sprint 3.82 was implemented without expansion;  
* whether fail-closed sequencing was proven;  
* whether any blocker remains;  
* whether any live runtime changed.

### **Authoritative Repository State**

Report:

* repository;  
* branch;  
* starting commit;  
* final commit if created;  
* working-tree status;  
* remote/upstream limitations.

### **Governing Artefacts Reviewed**

Confirm complete review of:

* Engineering Constitution;  
* North Star;  
* JESS;  
* Roadmap;  
* Sprint 3.76;  
* Sprint 3.77;  
* Sprint 3.82;  
* applicable ADRs and responsibility statements;  
* current governed-conversation modules;  
* protected EOS modules.

### **Lineage Types**

Report each implemented identity:

ConversationalThread  
ConversationalRequest  
ConversationalExchange  
ModelInvocationAttempt  
ValidatedConversationalResponseEnvelopeReference  
ConversationalExecutionRecord

For each state:

* represented event;  
* creation boundary;  
* prohibited implication;  
* stability boundary;  
* failure/retry meaning.

### **Identity Construction**

Describe:

* canonicalisation;  
* event discriminator;  
* content-addressed versus event identity;  
* schema/policy version sensitivity;  
* constructor preconditions;  
* sensitive-content minimisation.

### **Projection Composer**

Describe:

* input shape;  
* output shape;  
* exclusive owner;  
* mandatory contents;  
* source references;  
* claim/status handling;  
* conversation-history classification;  
* conflict representation;  
* optional real EOS references;  
* projection identity sensitivity.

### **Data Minimisation**

Report proof for:

* message bodies;  
* calendar descriptions;  
* memory/raw document payloads where tested;  
* stable references;  
* digest/reference identity sensitivity.

### **Exchange Lifecycle**

Report:

* closed state vocabulary;  
* permitted transitions;  
* terminal-state enforcement;  
* lifecycle event identity;  
* success path;  
* safe-response path;  
* failure paths.

### **Retry Model A**

Report:

* attempt ordinals;  
* parent linkage;  
* same-exchange conditions;  
* new-exchange conditions;  
* preserved failed attempts;  
* idempotency/replay boundary.

### **Lineage Repository**

Describe:

* port methods;  
* atomicity guarantees;  
* uniqueness constraints;  
* terminal-record enforcement;  
* in-memory reference adapter;  
* simulated failure support;  
* confirmation that no production storage was selected.

### **Fail-Closed Ordering**

Report evidence that:

request/exchange/projection committed before model call  
validated envelope and terminal record committed before response release

Provide the result of each simulated commit failure.

### **Failure Coverage**

Report exact tests for:

* projection failure;  
* source failure;  
* provider failure;  
* malformed output;  
* validation failure;  
* persistence failure.

### **Isolation Proof**

Provide direct forward and reverse search results.

Confirm zero contact with:

app/api/chat/route.ts  
lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/  
lib/executive-operating-system/  
components/

### **Blob-Hash Evidence**

Report pre/post blob SHAs for all protected files.

Confirm exact equality.

### **Files Changed**

List every created or modified file and why.

### **Targeted Tests**

Report exact targeted-test results for:

* identities;  
* projection;  
* lifecycle;  
* retry;  
* repository;  
* orchestration;  
* isolation.

### **Full Validation**

Report exact results for:

npm test  
npm run lint  
npm run typecheck  
npm run build  
git diff \--check

### **Deferred and Rejected Boundary**

Explicitly confirm no implementation of:

* production persistence;  
* `/api/chat` integration;  
* selector;  
* model-based claim classification;  
* EOS extension;  
* synthetic EOS publication;  
* automatic retrieval;  
* operator verification;  
* promotion.

### **Change Confirmation**

Explicitly confirm:

* isolated modules only;  
* no chat change;  
* no context-builder change;  
* no client-hook change;  
* no EOS change;  
* no core governed semantic change;  
* no model call;  
* no production storage;  
* no production behaviour change.

### **Outstanding Issues**

List:

* production repository/storage work;  
* future integration dependencies;  
* retention-policy decisions;  
* recovery-journal limitations;  
* any Deferred Sprint 3.82 item encountered;  
* evaluation questions for Sprint 3.84.

### **Recommendation**

Return exactly one of:

Implementation Complete

or:

Implementation Incomplete

No other recommendation wording is permitted.

`Implementation Complete` means the governed conversational lineage, projection, lifecycle, retry, and reference persistence architecture exists and is tested in isolation.

It does not mean it has been evaluated against production conditions, integrated into `/api/chat`, operator-verified, or promoted.

---

## **Expected Follow-On**

If Sprint 3.83 returns:

Implementation Complete

the provisional next step is:

Sprint 3.84 — Conversational Lineage and Projection Evaluation

Sprint 3.84 shall evaluate:

* identity truthfulness;  
* lifecycle completeness;  
* retry boundaries;  
* projection completeness;  
* projection data minimisation;  
* repository fail-closed guarantees;  
* compatibility with the existing governed conversational runtime.

Production integration remains later:

3.85 — Re-attempt Governed Conversational Runtime Integration  
3.86 — Operator Verification  
3.87 — Promotion

Numbering may shift if Sprint 3.83 exposes additional required work.

The staged separation remains binding.

---

## **Engineering Intent**

Sprint 3.80 failed for the correct reason: the governed conversational runtime had no honest production lineage.

Sprint 3.82 established that the answer is not to borrow EOS identity.

Ordinary conversation is its own governed event:

* a thread establishes continuity;  
* a request records accepted operator input;  
* an exchange begins a governed response lifecycle;  
* a projection records the evidence actually supplied;  
* attempts record model calls;  
* validation determines whether an envelope may exist;  
* the execution record closes the lifecycle.

Those records may reference a real EOS run.

They must never pretend one occurred.

Sprint 3.83 implements that architecture beside the live route, not inside it.

The most important guarantee is not that every object has an ID.

It is that every ID truthfully records what happened, and that no model call or response release can outrun the lineage commits required to make that claim honest.

