# Governed Conversational Lineage Identity Contract

**Status:** Governed  
**Sprint:** 3.82  
**Authority:** JARVIS Architecture  
**Evidence base:** Sprint 3.81  
**Decision date:** 1 August 2026

## 1. Purpose

This contract is the binding authority for the identity, lineage, projection, persistence, failure, and retry semantics of ordinary governed conversation. It converts Sprint 3.81's evidence into decisions without treating that audit's proposals as authority. Its controlling rule is: **identity records what actually occurred**. Content addressability proves equality of governed material; it does not, by itself, prove an event, ownership, authority, or lifecycle.

## 2. Scope

This contract governs EOS and conversational identity relationships; thread, exchange, request, model-attempt, input, projection, source, envelope, execution-record, retry, and failed-request identity; projection ownership; durable lineage; and future implementation boundaries.

It does not implement or integrate any type, composer, route, selector, model adapter, projection, persistence store, or runtime behaviour. It does not alter an ADR or responsibility statement and grants no promotion authority.

## 3. Governing Authority

The review applied, in order, the Engineering Constitution, North Star, JESS, Roadmap, Constitutional Publication Principles, accepted ADRs, applicable responsibility statements, Sprint 3.69, Sprint 3.76, Sprint 3.81, current source and tests, and this sprint specification. The Roadmap, Sprint 3.69, Sprint 3.76, and Sprint 3.81 were read completely. Current source establishes observed behaviour, never semantic permission beyond its governed responsibility.

The twelve-part Identity Governance Test is binding for every identity below: event truth, lifecycle boundary, immediate upstream authority, semantic non-overclaim, stability, failure, retry, persistence, consumer independence, authority transfer, privacy/minimisation, and replay. An implementation that cannot answer all twelve fails this contract.

## 4. Existing Evidence

The repository proves that `ExecutiveRunRecord` is a terminal completed-or-failed EOS publication and that the valid downstream chain is `ExecutiveRunRecord` → `ExecutiveOperationalState` → `ExecutiveSession` → `ExecutiveInteractionContract` → processed result → `ExecutiveApplicationContext`. The composers are deterministic and pure, but their required inputs retain that EOS lineage.

No local production caller joins `POST /api/eos/run` to that downstream composition chain. Ordinary `/api/chat` receives none of those publications and no complete governed conversational projection. Existing governed-conversation identifiers are caller-supplied in isolated fixtures/evaluation; the Gmail snapshot is a bounded source observation, not a cross-source conversational input. No production publication owner or durable governed payload store closes the ordinary-chat lineage today.

These are observations, not permission to manufacture missing publications. No configured upstream remote exists, so claims about unpublished external consumers remain outside repository evidence.

## 5. EOS and Chat Separation Principle

Ordinary conversation is open-ended interaction over governed evidence. EOS deliberation is staged constitutional reasoning toward traceable proposals and governed action boundaries.

Conversational identity, projection, persistence, failure, and retry records **must never imply** Candidate Construction, Candidate Evaluation, Candidate Comparison, Executive Reasoning, a Governed Action Proposal, planning, routing, approval, execution, mutation of an `ExecutiveSession`, EOS runtime completion, or bypass of the canonical foundation. Consuming a conversational publication transfers none of those authorities. An actual EOS publication may be referenced only as contextual evidence under its own identity and meaning.

## 6. Identity-Domain Decision

**Selected: Option A — Separate identity domains.**

> **EOS run identity and conversational-exchange identity are separate.**

An EOS run identity is created only by the constitutional runtime's terminal publisher for an actual completed or failed EOS attempt. A conversational exchange identity is created when one accepted operator request begins its governed response lifecycle, before projection. Neither derives from nor substitutes for the other. Each is persisted, failed, and retried under its own lifecycle. Model attempts and response envelopes descend from the conversational exchange, not an EOS run. Later integration may add a typed contextual reference to a real EOS publication; it may not synthesize an EOS record, borrow its identifier, or turn that reference into exchange identity or authority.

## 7. Lineage Architecture Decision

**Selected: Option 1 — New lightweight conversational lineage publications.**

Sprint 3.83 is authorised to implement, in isolation, distinct immutable publications for a continuing conversational thread, an individual exchange, a request, a complete governed projection and governed input, model-invocation attempts, a validated response envelope, and an execution record. These publications are consumer-independent and must remain meaningful without a model or UI.

The lineage is:

```text
ConversationalThread
  └─ ConversationalRequest
      └─ ConversationalExchange
          ├─ GovernedConversationalProjection → GovernedConversationalInput
          ├─ ModelInvocationAttempt [0..n]
          ├─ ValidatedResponseEnvelope [0..1]
          └─ ConversationalExecutionRecord [terminal]
```

Source snapshots and genuine EOS publications are referenced peers/upstreams where relevant, never prerequisites or identities of ordinary conversation. This lightweight chain confers no EOS deliberative, planning, routing, approval, or execution authority.

## 8. Conversational Thread/Session Identity

A conversational thread identity proves that a continuity container was opened for classified turns; it does not prove an exchange, model call, source observation, or EOS session occurred. The conversational lineage owner creates it before its first accepted request and closes it explicitly or under a future governed retention policy. One thread contains zero or more exchanges.

It remains stable across exchanges, attempts, evidence refreshes, model/provider changes, and assistant changes that do not deliberately fork continuity. It changes for a deliberate new/forked thread or a privacy/authority boundary requiring separation. Agent changes are recorded on exchanges, not silently encoded as a new thread. The identity and minimal metadata persist; sensitive turn content should remain referenced. Existing `ExecutiveSession` is not this identity.

## 9. Conversational Exchange Identity

An exchange proves that one accepted operator request entered one governed response lifecycle. The conversational lineage owner creates it after transport/authentication and minimum request-shape acceptance but **before projection**, allowing projection and later failures to be recorded honestly. Transport payloads rejected before that boundary receive a request-rejection record, not a completed exchange.

One exchange has one request, one governed claim/evidence lifecycle, zero or more attempts, at most one accepted validated envelope, and exactly one terminal execution record. Its identity remains stable through Model A retries. It changes when the operator question, governed evidence or claim set, reference time, source availability, or policy/validation meaning changes. Its existence never means completion, validation, model use, or EOS execution.

## 10. Request Identity

A request identity proves receipt and acceptance of a particular operator submission at the conversational boundary. It is allocated by the conversational lineage owner after authentication and basic shape validation, before exchange/projection creation, and is consumer-independent. One accepted request creates one exchange; transport/idempotency duplicates retain the request and exchange identities. A later deliberate resubmission creates a new request and exchange even if words match.

Pre-acceptance invalid input is durably represented by a minimized request-rejection record with its own rejection/reference identity where audit policy requires; it must not counterfeit an exchange. Request identity changes with a modified operator submission and transfers no authority.

## 11. Model-Invocation Attempt Identity

A model-attempt identity proves one adapter/provider invocation was started for one exchange using one exact governed input and configuration. The governed conversational model-invocation boundary owns it and creates it immediately before the external call; no attempt exists if projection or policy refuses before a call.

Each retry has a new attempt identity and an ordinal/parent exchange link. The record references provider/model configuration, input, start/end observations, parse outcome, failure category, and raw-output retention location or digest subject to minimisation. Configuration changes normally require a new exchange under section 20; a narrowly governed failover configuration pre-authorised in the unchanged exchange policy may be a new attempt. Attempt identity proves neither validated output nor completion and transfers no authority.

## 12. Governed Input Identity

The governed input is the immutable, model-facing structured publication derived from one governed projection and one request. Its identity is content-addressed over canonical structured fields/references, ruleset versions, projection identity, request/exchange lineage, and reference time; it is not the exchange identity. It changes when any semantic model-facing field or canonical reference changes, but not for natural-language rendering, serialization whitespace, or model output.

The dedicated input constructor owns derivation from the projection; the conversational lineage owner supplies the exchange/request references. Input identity proves construction and validation of the bounded input, not model invocation, response acceptance, or EOS execution.

## 13. Governed Conversational Projection

The **Governed Conversational Projection** is authorised. It is the immutable, deterministic, claim-relevant publication supplied before model invocation. It is not raw `OperationalState`, a Gmail snapshot, a prompt, history alone, a model summary, a UI aggregate, EOS reasoning, or a proposal.

It must contain or retain stable references to:

* its identity, schema and evidence-status ruleset; thread, request, and exchange identities; reference and observation/creation times; immediate upstream publications;
* source-qualified Gmail communication/recipient evidence, provenance, retrieval time, availability, status inputs, and compatibility boundaries;
* source-qualified calendar commitments, governed start/end and timezone semantics, provenance, availability, and coverage limits;
* source-qualified memory/priority references, owner, freshness/availability, and separation of operator priorities from derived interpretation;
* each connector's identity, observed availability, observation time, governed failure/authorisation cause, and fallback status;
* stable, classified history references (`operator_provided`, `assistant_prior_output`, `retrieval_reference`) with explicit non-canonical status;
* bounded claim identities/types/materiality, evidence status, source references, unavailable/unsupported states, uncertainty, and conflicts;
* cross-source disagreement identity, source owners, affected claims, and resulting restrictions; and
* applicable policy, compatibility, canonical application-context, and actual EOS publication references.

The canonical body copies only small governed classifications, availability/status facts, claim metadata, policy versions, times required for interpretation, and fields indispensable to a bounded claim. Message bodies, full calendar descriptions, memory documents, credentials, raw provider output, and other sensitive payloads remain behind stable source references unless a field is indispensable and explicitly authorised by source policy.

Projection identity is content-addressed over the canonical governed body/references. It **must change** when governed source evidence or availability, claims, reference time, relevant history references, compatibility context, evidence ruleset, or conflicts change. It does not change for rendering/order that canonicalization defines as irrelevant, UI/prompt wording, or raw model output. The identity proves which complete evidence set was supplied, not that every connector was available; explicit unavailability is complete evidence.

## 14. Projection Ownership

The immediate and sole owner is a **Dedicated Conversational Projection Composer**, implemented as a deterministic isolated boundary. It consumes authorised source/interface publications, classified request/history references, policies, and optional genuine EOS/application-context references. Source owners retain authority over observations; the composer owns only the complete conversational projection.

`/api/chat`, the LLM, prompt builder, `context-builder.ts`, and legacy `OperationalState` are prohibited as owners. The composer must not become a second source-of-truth or execute EOS stages. Claim identification/classification and conflict/status aggregation must be deterministic, versioned inputs or sub-boundaries owned by this composer package; Sprint 3.83 must not delegate them to a model.

## 15. Source Snapshot Relationship

> **A source snapshot identifies one bounded source observation. A governed conversational projection identifies the complete claim-relevant evidence set supplied to one governed exchange.**

A Gmail or calendar snapshot remains independently owned and may be referenced. It cannot substitute for the complete projection whenever another source, availability, history, claim set, status, or conflict is relevant. Cross-source identity is the governed projection identity; no competing aggregate identity is authorised.

## 16. Response-Envelope Identity

A response-envelope identity proves that one structured candidate response for one exchange/input passed deterministic validation, or that the deterministic safe-response constructor produced and validated a refusal after candidate validation failure. It is content-addressed over the canonical validated envelope plus input/exchange and validation-policy references. It is allocated only after validation; malformed/raw model output retains attempt identity only.

There is at most one accepted envelope per exchange. A successful model envelope or validated safe envelope can support `completed`; provider/projection/persistence failure without a validated safe envelope supports `failed`. Validation failure followed by a successfully persisted, validated safe response is a completed-safe-response exchange, not a successful model response. Envelope identity transfers no approval or execution authority.

## 17. Execution-Record Identity

The conversational execution record is the terminal semantic/audit publication for one exchange. Its identity is content-addressed over the exchange disposition and stable references. It proves the recorded lifecycle outcome—not EOS execution or external action—and is distinct from exchange and legacy audit identifiers.

It references thread/request/exchange, projection/input, attempts, accepted envelope if any, validation, source/policy versions, retry links, minimized failure cause, timestamps, and final disposition. Exactly one successfully committed terminal record is authoritative; corrective append-only records may supersede it under future store governance without rewriting history.

## 18. Persistence Lifecycle

The **Conversational Lineage Repository** responsibility owns atomic durable append/transition semantics; Sprint 3.83 may define an isolated port and in-memory/reference adapter, but selection of a production storage technology is deferred to the later integration specification and does not block isolated implementation.

Durable records are required for thread metadata, accepted request/exchange creation, projection and input references, each started attempt, output/parse and validation result, accepted envelope reference, retries, minimized failures, source/policy references, and terminal execution record. Persist references/digests instead of duplicating sensitive content.

The closed lifecycle is:

```text
created → input_projected → model_invocation_started
model_invocation_started → model_output_received | failed
model_output_received → validation_passed | validation_failed
validation_passed → completed
validation_failed → safe_response_created | failed
safe_response_created → completed
created | input_projected → failed
```

Repeated attempts loop from `input_projected` through attempt events without reversing exchange state; the event log retains all attempts. `completed` and `failed` are terminal. Every created exchange requires a terminal record. Projection failure, source-policy refusal, provider failure, validator failure, and persistence failure have distinct codes. A required persistence write failing is fail-closed: no model call before creation/projection commits, no response release before envelope/terminal commit, and no claim of completion. Persistence lineage must never record EOS stages or authority unless referencing a genuine EOS publication.

## 19. Failure Semantics

The exchange identity exists before projection. Input validation rejected before acceptance creates only a minimized rejection record. After exchange creation:

* projection/source failure terminates without a model attempt unless a complete projection can truthfully encode governed unavailability and produce a safe response;
* unsupported claims are explicit projected statuses and may yield a validated safe response;
* adapter/provider failure terminates the attempt and either retries under section 20 or fails the exchange;
* malformed output belongs to its attempt and proceeds to validation failure/safe response where possible;
* validator failure cannot produce a model-authored accepted envelope;
* persistence failure is fail-closed and records/reconciles an indeterminate persistence failure through the repository's recovery journal; it never reports completion.

Failure identity never borrows a failed EOS run or implies Candidate Construction, reasoning, proposal, routing, approval, or execution.

## 20. Retry Semantics

**Selected: Retry Model A — Same exchange, new attempt identity.**

An automatic retry is permitted only when the operator request, governed projection/input (including evidence, claim set, reference time and source availability), and semantic validation policy are unchanged. Each provider call has a distinct attempt identity and ordered link to the same exchange.

A modified question, changed evidence/availability/claim set/reference time, changed compatibility or evidence-status ruleset, or changed semantic validator policy requires a new request/exchange with a causal retry/replay link. A model/provider configuration change also requires a new exchange unless the unchanged input policy pre-authorised an equivalent failover configuration; every such failover remains a new attempt. Retries confer no EOS authority and cannot erase failed attempts.

## 21. Idempotency and Replay

A transport duplicate bearing the same valid idempotency key reuses the existing request/exchange and returns or continues its recorded outcome; it does not start an unlinked attempt. Explicit retry processing uses a new attempt under the same exchange only under section 20. Deterministic replay for comparison creates a new exchange with a shared replay key and `replay_of` reference unless it is explicitly a recovery continuation of the same incomplete exchange.

Content equality never merges lifecycle events. A user repeating identical words later creates a new request/exchange because time, evidence, and intent may differ. Replay records must identify fixed source references and policy versions and transfer no EOS authority.

## 22. Existing EOS Artefact Relationship

* **`ExecutiveRunRecord`:** EOS-only identity. Conversation may reference a genuine relevant run as contextual lineage. No synthetic record and no exchange substitution.
* **`ExecutiveOperationalState`:** EOS operational publication. It may be consumed/referenced when legitimately published; chat neither owns nor reconstructs it, and `latestRun` stays truthful.
* **`ExecutiveSession`:** remains an EOS session publication, unsuitable as conversational thread identity. It may be referenced only when a real session exists. No schema extension is authorised here.
* **`ExecutiveInteractionContract`:** remains an EOS interaction-contract publication. Ordinary conversation does not require it; it may reference/consume a legitimately published contract for interface constraints, but the contract is not thread, exchange, or model-attempt identity. `CHAT` availability alone proves no upstream lineage. No extension/new upstream is authorised here.
* **`ExecutiveApplicationContext`:** remains a projection from a valid processed EOS interaction. It may be an optional referenced input to the dedicated composer; it is neither required nor reconstructed by chat.

References preserve ownership and do not mutate EOS artefacts. Ordinary chat never implies deliberation stages, proposals, planning, routing, approval, execution, or EOS completion.

## 23. Governed Classification Matrix

Sprint 3.81 contained fifteen rows; this contract preserves all of them and separates its combined “individual chat request” evidence into the specification-required request and exchange rows, yielding sixteen decisions.

| Identity or capability | Sprint 3.81 proposal | Final outcome | Final class | Owner | Represented event | Independent reasoning | Implementation consequence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `ExecutiveRunRecord` identity | Accepted; EOS Run Identity | **Accepted** | EOS Run Identity | Constitutional runtime | Terminal completed/failed EOS attempt | Its stage trace and terminal publication truthfully belong to EOS; reuse would overclaim chat execution. | Preserve unchanged; contextual references only. |
| `ExecutiveOperationalState` identity | Modified; none for chat | **Accepted** | EOS Operational Publication Identity | Operational-state composer | Projection of one actual run | A valid identity needs a positive EOS class, not “none”; purity does not detach mandatory run lineage. | Preserve; optional genuine reference, never construct in chat. |
| `ExecutiveSession` identity | Modified; conversational only if authorised | **Accepted** | EOS Session Identity | Session composer | Immutable interaction context over one run-derived state | Current lifecycle proves an EOS session, not continuing conversation; mechanism reuse cannot transfer meaning. | Keep EOS-only; conversational thread is new. |
| `ExecutiveInteractionContract` identity | Accepted; Interface Contract Identity | **Accepted** | EOS Interaction Contract Identity | Interaction-contract composer | Immutable interface/authority contract over EOS session | Content identity is sound, while mandatory upstream prevents ordinary-chat manufacture. | Preserve; optional reference only; no extension. |
| Ordinary conversation thread identity | Deferred; Conversational Session Identity | **Modified** | Conversational Thread Identity | Conversational lineage owner | Continuity container opened | A durable continuity event is necessary and semantically independent of EOS; section 8 now closes its lifecycle. | Implement isolated publication. |
| Individual conversational exchange identity | Audit combined it with request: Modified; Conversational Exchange Identity | **Modified** | Conversational Exchange Identity | Conversational lineage owner | One accepted request's response lifecycle began | Failure-before-model requires a pre-projection event distinct from request receipt and attempts. | Implement isolated exchange publication/lifecycle. |
| Individual request identity | Modified; Conversational Exchange Identity | **Modified** | Conversational Request Identity | Conversational lineage owner | Operator submission accepted | Receipt/idempotency and response lifecycle differ under rejection and replay; the audit class was too broad. | Implement distinct request and rejection lineage. |
| Model-invocation identity | Deferred; Model Invocation Identity | **Modified** | Model Invocation Identity | Model-invocation boundary | One provider call started | Attempt truth and Retry Model A require a child identity; caller strings alone lack ownership. | Implement per-attempt identity/record. |
| Governed conversational input identity | Deferred; Conversational Exchange Identity | **Modified** | Governed Conversational Input Identity | Governed-input constructor | Exact bounded model-facing input constructed | Content publication changes independently of exchange lifecycle and must reference the projection. | Implement deterministic content identity; do not use as exchange ID. |
| Governed conversational projection identity | Deferred; Governed Conversational Projection Identity | **Modified** | Governed Conversational Projection Identity | Dedicated conversational projection composer | Complete claim-relevant evidence set composed | Cross-source completeness needs one owned publication; source snapshots remain authorities, not substitutes. | Implement isolated composer/publication. |
| Gmail source snapshot identity | Accepted; Source Projection Identity | **Accepted** | Source Projection Identity | Gmail acquisition/projection owner | One bounded Gmail observation | Its narrow source truth is useful only by reference and cannot claim other sources. | Preserve and reference when relevant; expose availability explicitly. |
| Cross-source projection identity | Deferred; Governed Conversational Projection Identity | **Modified** | Governed Conversational Projection Identity | Dedicated conversational projection composer | Same complete projection event above | A second aggregate ID would create rival authority; cross-source identity is the governed projection. | Implement no separate competing aggregate. |
| Response-envelope identity | Deferred; Response Envelope Identity | **Modified** | Response Envelope Identity | Validator/safe-envelope publication boundary | Structured response passed deterministic validation | Caller allocation before validation would falsely imply acceptance; raw output remains an attempt. | Implement post-validation content identity, max one accepted per exchange. |
| Execution-record identity | Accepted; Execution Audit Identity | **Accepted** | Execution Record Identity | Conversational Lineage Repository | Terminal conversational disposition committed | Semantic lifecycle audit differs from exchange and EOS execution; current payload informs but does not establish storage. | Implement isolated terminal record/port; do not relabel EOS execution. |
| Retry-attempt identity | Deferred; Conversational Exchange Identity | **Modified** | Retry Attempt Identity | Model-invocation boundary | A subsequent provider call started for unchanged exchange/input | One operator request should not multiply exchanges when governed meaning is unchanged, but attempts must remain visible. | Implement Model A linkage and ordinals. |
| Failed-request identity | Deferred; Execution Audit Identity | **Modified** | Conversational Exchange Identity | Conversational lineage owner/repository | Accepted request's exchange failed, or pre-acceptance request was rejected | Failure must be visible without implying success; pre-acceptance rejection and post-acceptance failure are distinct. | Persist rejection or failed terminal exchange; never synthesize EOS failure. |

**Final counts:** Accepted **6**; Modified **10**; Deferred **0**; Rejected **0**.

### Departures from Sprint 3.81

* `ExecutiveOperationalState` moves from Modified/none-for-chat to Accepted/EOS Operational Publication Identity because “not a chat identity” does not invalidate its truthful EOS class.
* `ExecutiveSession` moves from conditional Modified to Accepted/EOS Session Identity; a separate thread removes the unresolved reuse condition.
* The eight Deferred proposals are resolved as Modified authorised conversational constructs or consolidation rules: thread, model attempt, governed input, governed projection, cross-source projection, envelope, retry, and failed-request.
* The combined request/exchange audit row is split. Request receives its own class; exchange retains the conversational lifecycle class.
* Execution Audit Identity is narrowed to Execution Record Identity so “execution” cannot imply EOS/capability execution.

## 24. Deferred Register

No identity, lineage, projection, failure, or retry semantic needed to specify Sprint 3.83 remains Deferred. Production storage technology and retention durations are intentionally later integration-policy choices: the missing operational environment and retention/privacy policy prevent selection; the isolated port and required durable semantics do not depend on them, so they do **not** block Sprint 3.83. Reconsider them when the integration sprint identifies the production deployment/store and approves a retention policy. External unpublished consumers remain unknown and must be rechecked before integration.

## 25. Rejected Register

The matrix has no Rejected outcome. The following prohibited constructions are binding constraints rather than rejected inventory rows:

| Prohibited construct | False implication / violated principle | Narrow permitted alternative |
| --- | --- | --- |
| Synthetic/borrowed EOS run ID for chat | Claims constitutional stages/terminal runtime occurred; violates event truth | Reference a genuine relevant EOS run contextually. |
| `ExecutiveSession` as thread ID | Claims run-derived EOS session and wrong lifecycle | New conversational thread publication. |
| Gmail/source snapshot as complete projection | Claims unobserved cross-source completeness | Reference it inside the complete projection. |
| Route, prompt, model, or legacy state as projection owner | Creates hidden/second authority and interpretation before projection | Dedicated deterministic composer. |
| Raw/unvalidated model output as envelope | Claims validation and accepted response | Attempt output reference; validated or safe envelope only. |
| Content hash alone as event identity | Collapses distinct lifecycle events | Event identity plus content-addressed publication identities/replay links. |

## 26. Implementation Constraints

> **This contract establishes identity, lineage, projection, persistence, retry, and failure authority only. It does not create or modify any EOS type, conversational type, composer, projection, persistence store, route, selector, model adapter, execution record, or production behaviour.**

Sprint 3.83 may implement only Accepted and Modified decisions, Option A, Option 1, the projection, and governed lifecycle/persistence/retry/failure semantics. It must build isolated lineage/projection modules and tests first. It must not modify `/api/chat`, production selectors, EOS types/composers/runtime, or existing authority; integrate; evaluate/promote; or implement a Deferred/Rejected matter.

The binding sequence is 3.82 contract → 3.83 isolated implementation → 3.84 evaluation → 3.85 integration re-attempt → 3.86 operator verification → 3.87 promotion (numbers may change, separation may not). Ordinary conversational implementation must explicitly encode that it performed no Candidate Construction/Evaluation/Comparison, Executive Reasoning, Governed Action Proposal, planning, routing, approval, execution, session mutation, or EOS completion.

## 27. Validation Results

The repository precondition was satisfied on branch `work` at commit `b665f0dfddd91f271741ef259e080a8141e44758`; the initial working tree was clean and no upstream was configured. Required documents and sources existed. Final command results:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 123 files; 591 passed, 1 skipped |
| Targeted EOS/governed-conversation/chat tests | PASS — 13 files; 53 passed |
| `npm run lint` | PASS — no warnings or errors |
| `npm run typecheck` | PASS |
| `npm run build` | PASS — production build completed; Google Fonts stylesheet download was unavailable and font optimisation was skipped |
| `git diff --check` | PASS |

The final diff must contain only this contract and must show no EOS type/composer/runtime, `/api/chat`, governed-conversation, projection, persistence, selector, test, ADR, responsibility-statement, or production behaviour change.

## 28. Constitutional Conclusion

EOS run identity and conversational-exchange identity are separate. Option 1 truthfully supplies lightweight ordinary-conversation lineage without making chat look like EOS. The dedicated projection composer retains source ownership and complete evidence lineage; persistence makes success, safe refusal, failure, and retries auditable; Model A preserves one operator exchange while exposing every attempt.

None of these identities or references grants or implies Candidate Construction, Candidate Evaluation, Candidate Comparison, Executive Reasoning, a Governed Action Proposal, planning, routing, approval, execution, `ExecutiveSession` mutation, or EOS runtime completion. Human authority and the canonical foundation remain intact.

**Governed Contract Complete.** Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation is authorised. Implementation, evaluation, integration, operator verification, and promotion are not.
