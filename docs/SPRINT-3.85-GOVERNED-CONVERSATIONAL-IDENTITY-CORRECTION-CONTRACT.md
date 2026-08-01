# Sprint 3.85 — Governed Conversational Identity Correction Contract

**Status:** Binding governance decision  
**Sprint Type:** Governance Decision / Architectural Correction Contract  
**Implementation Authority:** None  
**Reviewed branch:** `work`  
**Reviewed commit:** `33b8f144025191701df6202acb8f5c2fe0648a1d`

## 1. Recommendation

**Correction Contract Complete**

This contract selects one conversational-first input identity model and one authoritative terminal record. A future isolated correction-implementation sprint is required before production integration resumes. Identity represents the event that actually occurred; ordinary conversation never manufactures EOS identity.

## 2. Repository precondition result

The intended repository was `/workspace/jarvis`, on branch `work`, at commit `33b8f144025191701df6202acb8f5c2fe0648a1d`. The initial working tree was clean. Every required governing artefact and implementation file was present. Current source had not materially corrected the Sprint 3.84 incompatibilities.

### Governing artefacts reviewed completely

1. `docs/ENGINEERING_CONSTITUTION.md`
2. `docs/architecture/NORTH_STAR.md`
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`
5. `docs/architecture/ROADMAP.md`
6. `docs/SPRINT-3.69-GOVERNED-GMAIL-RECIPIENT-CONTRACT.md`
7. `docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md`
8. `docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md`
9. `docs/SPRINT-3.84-CONVERSATIONAL-LINEAGE-AND-PROJECTION-EVALUATION.md`

The review applied the authority hierarchy stated in the Sprint 3.85 specification. Later binding identity governance controls earlier implementation assumptions.

### Repository evidence reviewed

The exact definitions, constructors, repositories, orchestrator, and direct consumers of `GovernedConversationalInput`, `GovernedInputConstruction`, `GovernedExecutionRecordPayload`, `ConversationalExecutionRecord`, `GovernedConversationalProjection`, and `GovernedInputReference` were inspected in:

* `lib/governed-conversation/types.ts`
* `lib/governed-conversation/input.ts`
* `lib/governed-conversation/execution-record.ts`
* `lib/governed-conversation/model-invocation.ts`
* `lib/governed-conversation/lineage-types.ts`
* `lib/governed-conversation/projection-composer.ts`
* `lib/governed-conversation/lineage-repository.ts`
* `lib/governed-conversation/in-memory-lineage-repository.ts`
* `lib/governed-conversation/lineage-orchestrator.ts`

Repository-wide symbol searches also covered `model-request.ts`, `response-envelope.ts`, `validator.ts`, fixtures, parallel evaluation, lineage fixtures, all governed-conversation tests, and the Sprint 3.83 and 3.84 specifications. The current input constructor still requires `runId`, `sessionId`, and `interfaceContractId`. Its model pipeline produces `GovernedExecutionRecordPayload`; the lineage repository independently commits `ConversationalExecutionRecord` as the exchange terminal record.

## 3. Architectural context and integrity

Sprint 3.77/3.79 established deterministic evidence status, bounded model input/output, model-owned interpretation, non-authoritative advice, deterministic validation, safe-envelope behavior, and evidence/ownership summaries. Sprint 3.82/3.83 later established truthful conversational thread, request, exchange, projection, governed-input, attempt, envelope, and terminal-record lineage. Sprint 3.84 proved that the tracks cannot truthfully compose at their current identity boundary.

This contract corrects governance only. It does not alter runtime behavior, source code, tests, routes, EOS publications, model authority, validation authority, persistence technology, or production integration. It intentionally authorizes a later sprint to replace false mandatory input assumptions and retire the competing payload.

### Core principles

* **Event truth:** an identity names the event that occurred.
* **Identity Integrity:** one immutable identity corresponds to one immutable canonical object.
* **Explicit lineage:** references do not transfer the identity or authority of their targets.
* **No synthetic EOS:** ordinary chat creates no EOS run, session, or interaction contract.
* **Single terminal authority:** one conversational exchange has one authoritative terminal record.
* **Preserved validation:** identity correction cannot weaken evidence status, bounded model authority, or deterministic validation.

## 4. Sprint 3.84 findings reconfirmed

| Blocking finding | Current evidence | Reconfirmation |
| --- | --- | --- |
| Mandatory `runId` cannot truthfully receive `exchangeId` | `GovernedConversationalInput` and `GovernedInputConstruction` still require `runId`; the projection supplies `exchangeId` instead | **Present** |
| Mandatory `sessionId` cannot truthfully receive `threadId` | The input types still require `sessionId`; lineage independently defines `threadId` | **Present** |
| Mandatory `interfaceContractId` has no conversational equivalent | The input types still require it; projection and lineage types publish no conversational equivalent | **Present** |
| Two terminal record responsibilities conflict | Model invocation returns `GovernedExecutionRecordPayload`; lineage repository commits `ConversationalExecutionRecord` | **Present** |

These are architectural identity conflicts, not adapter gaps.

## 5. `runId` conflict: independent analysis

### Conflict and governing principle

An ordinary exchange is a conversational lifecycle event, while an EOS run attests to EOS deliberation. Substitution would violate event truth and Sprint 3.82's domain separation.

### Option evaluation

* **Option A — Retype:** truthful if the field is renamed or discriminated, but it discards the useful, already-governed meaning of `runId` as a genuine EOS reference. A discriminated union also adds structure without need because EOS is supplementary context rather than an alternative kind of conversation.
* **Option B — Optional/contextual:** preserves `runId`'s EOS meaning, removes the false construction prerequisite, and makes `exchangeId` the mandatory conversational execution identity. It requires adding conversational lineage to the corrected input and migrating callers, but creates no new runtime concept.
* **Option C — Two input types:** can be truthful, but falsely suggests an EOS-context conversation is not also a conversational exchange. It duplicates construction surfaces and increases downstream branching even though both cases use the same evidence/model/validation pipeline.

Option A is rejected because replacing or discriminating the EOS field is more semantic churn than retaining it as a precise reference. Option C is rejected because EOS context is optional metadata on one conversational execution model, not a separate input domain.

**Run Identity Decision: Option B**

After correction, `exchangeId` is mandatory and is the input's conversational execution identity. `runId` is an optional contextual reference and may exist only when it names a genuine EOS run.

## 6. `sessionId` conflict: independent analysis

### Conflict and governing principle

A conversational thread is a continuity container for conversational requests and exchanges. An EOS session is a run-derived EOS lifecycle publication. They are superficially similar persistence concepts but do **not** represent the same event, lifecycle, or authority.

### Option evaluation

* **Option A — Retype:** could introduce `threadId`, but consuming the old field would erase the valid EOS-session-reference meaning or require a discriminator.
* **Option B — Optional/contextual:** makes `threadId` mandatory under its truthful name and preserves `sessionId` solely as a genuine EOS-session reference. This aligns exactly with the thread/exchange lineage already implemented.
* **Option C — Two input types:** truthfully separates fields but duplicates an otherwise identical governed-input pipeline and incorrectly models EOS context as mutually exclusive with conversational lineage.

Option A is rejected because the current name retains a valid meaning for genuine EOS context and must not be overloaded. Option C is rejected because every governed conversational input remains keyed to a conversational thread, including one that references EOS.

**Session Identity Decision: Option B**

After correction, `threadId` is mandatory. `sessionId` is an optional contextual reference and may exist only when it names a genuine EOS session. A `threadId` must never populate `sessionId`.

## 7. `interfaceContractId` conflict: independent analysis

### Conflict and governing principle

No governed conversational interface-contract publication exists. Construction convenience cannot create an event or publication that governance and runtime did not establish.

### Option evaluation

* **Option A — Retype:** would require inventing a conversational interface-contract meaning or using an existing lineage identity for a different purpose. Neither is necessary because thread, request, exchange, projection, and policy identities already define construction context.
* **Option B — Optional/contextual:** retains the field only for a genuine EOS interaction contract. Conversational-only construction needs no substitute; its context is mechanically established by its mandatory lineage, projection, reference time, claims, evidence, and policy references.
* **Option C — Two input types:** avoids manufacture but creates a redundant type split solely because one case has an optional reference.

Option A is rejected because there is no authorised conversational equivalent to retype into the field. Option C is rejected because optional genuine EOS context does not change the governed input's conversational nature or downstream processing contract.

**Interface Contract Identity Decision: Option B**

After correction, `interfaceContractId` is an optional contextual reference and may exist only when it names a genuine EOS interaction contract. Conversational-only input has no corresponding field and manufactures no equivalent.

## 8. Cross-field coherence decision

Options B/B/B form one coherent model: a single conversational-first governed input always carries truthful conversational lineage and may carry an optional, validated EOS context reference. The three EOS identifiers are not independently mix-and-match values. When any EOS reference is supplied, construction must verify it as a genuine canonical publication and verify the claimed relationships among the supplied EOS references. Missing EOS references do not invalidate ordinary conversation.

The corrected input has these identity groups:

1. **Mandatory conversational lineage:** `threadId`, `requestId`, `exchangeId`, `projectionId`, and the governed `inputId`/`governedInputId` identity.
2. **Optional EOS context:** `runId`, `sessionId`, and `interfaceContractId`, each retaining only its EOS meaning and carried as contextual references.
3. **Evidence lineage:** canonical source references and evidence/claim status owned by the projection/input.

The input constructor must reject mismatched thread/request/exchange/projection relationships, reject non-genuine EOS references, and reject any attempt to derive EOS identity from conversational identity. The existing evidence-status, model-request, envelope, and validator stages consume the corrected common input without gaining identity authority.

## 9. Construction preconditions

### Conversational-only execution

Construction is valid only when all of the following exist and agree:

* a real `threadId`;
* the accepted `requestId` belonging to that thread;
* the `exchangeId` belonging to that request and thread;
* the governed `projectionId` belonging to that exchange;
* one deterministic governed input identity derived under the governed-input publication rules;
* explicit reference time, question, claims, source/evidence context, and applicable policy/ruleset references.

`runId`, `sessionId`, and `interfaceContractId` are absent. Synthesis of any of them is forbidden.

### EOS-context conversation

The same conversational identities and construction data remain mandatory. The input may additionally reference canonical, pre-existing EOS artefacts. Each EOS identifier is contextual only; it does not key the conversation, replace any conversational identity, or prove that this exchange performed an EOS stage. The constructor must accept an EOS reference only with repository-verifiable genuine-publication provenance and coherent EOS lineage. It must fail closed when a supplied EOS claim cannot be verified.

### Projection identity boundary

`projectionId` identifies the governed conversational projection. It is not a Gmail/source snapshot identity, EOS run identity, exchange identity, or replacement for missing EOS context. The exchange, its projection, the projection's source evidence, and optional EOS context remain distinguishable publications and references.

## 10. Execution-record options: independent analysis

The Constitutional Publication Principles' **Identity Integrity** principle states: “One immutable identity shall correspond to one immutable canonical object. A publication identity must not alias multiple distinguishable published bodies.” Terminal authority must therefore reside in exactly one immutable canonical object for an exchange.

### Record Option 1 — Retire `GovernedExecutionRecordPayload`

This makes `ConversationalExecutionRecord` the canonical terminal publication and extends it, or its canonical referenced metadata publications, with the still-required evidence, validation, ownership, refusal, segment, retrieval-policy, source-availability, agent, and model-execution metadata. It preserves the Sprint 3.83 lifecycle/repository identity and eliminates the older EOS-shaped rival. Cost: the Sprint 3.79 return contract and payload constructor must migrate.

This option best satisfies Identity Integrity: one `executionRecordId` identifies one canonical terminal record, keyed to one exchange, while metadata is contained or canonically referenced without creating another terminal authority.

### Record Option 2 — Retire `ConversationalExecutionRecord`

This could be made truthful only by redesigning `GovernedExecutionRecordPayload` around conversational lineage and then rebuilding the Sprint 3.83 repository lifecycle around it. It discards the already-implemented exchange-keyed terminal invariant and requires more correction than Option 1. It weakens Identity Integrity during migration because the retained object's established EOS-shaped body and identity meaning must be transformed into a distinguishable conversational body.

### Record Option 3 — Governed responsibility split

A split could assign terminal disposition to one object and metadata to another, but the present objects both package terminal results. Preserving both would require a new publication boundary and synchronization rules without a separate consumer requirement. It weakens Identity Integrity by distributing the proof of one terminal event across two execution-record identities and risks ambiguous or divergent terminal bodies.

### Record Option 4 — Canonical record plus projection/view

This can satisfy Identity Integrity if the view has an explicitly different publication identity and no terminal authority. It nonetheless preserves a compatibility surface whose current EOS-required shape cannot truthfully project conversational-only exchanges. With no established separate consumer, the view adds migration and identity machinery without benefit. It would weaken Identity Integrity relative to Option 1 by retaining an easily confused second execution-record-shaped publication.

Options 2, 3, and 4 are rejected for the reasons above. They either replace more truthful implemented lineage, distribute authority, or retain an unnecessary rival shape.

**Execution Record Decision: Record Option 1**

`ConversationalExecutionRecord` is the sole authoritative terminal execution record for every governed conversational exchange, including an EOS-context conversation. `GovernedExecutionRecordPayload` and `constructExecutionRecordPayload` are to be retired by the correction sprint. No compatibility copy is authoritative.

## 11. Execution-record coherence review

1. **Authoritative ordinary-exchange record:** `ConversationalExecutionRecord`.
2. **Key:** its immutable `executionRecordId`, with mandatory `threadId`, `requestId`, and `exchangeId` lineage; repository uniqueness remains one terminal record per `exchangeId`.
3. **Terminal disposition owner:** `ConversationalExecutionRecord` alone.
4. **Validator outcome owner:** the canonical conversational record records the terminal validation outcome and validator/result reference.
5. **Evidence status and source summaries owner:** the canonical conversational record contains immutable summaries or canonical references to them. Source publications retain source-fact authority.
6. **Model attempts:** ordered `attemptIds` reference immutable `ModelInvocationAttempt` publications; model metadata is stored or referenced without becoming terminal authority.
7. **Genuine EOS context:** optional canonical EOS references are recorded as context, never as the record's identity or proof of stages performed by chat.
8. **Two apparently authoritative terminal records:** **No.**
9. **Synthetic EOS identity required by a retained structure:** **No.**

The canonical record must be committed before response release. Invalid output still results in deterministic validation and a governed safe response or failure disposition; model output cannot alter evidence status, ownership, or authority.

## 12. Source-of-truth and model boundaries

The conversational lineage repository owns conversational terminal-record persistence and uniqueness. Source systems own their evidence publications. The governed projection owns the complete bounded evidence projection for the exchange. The model owns only visibly marked interpretation and advisory text. The deterministic validator owns acceptance. EOS repositories own EOS identities; conversational code can only reference verified EOS publications.

Identity correction does not reopen Sprint 3.76/3.79 controls: evidence status precedes invocation, model input remains bounded, output remains structured, advice remains non-authoritative, and validation fails closed.

## 13. Migration and versioning decision

The corrected `GovernedConversationalInput` is a **versioned successor**, not an in-place reinterpretation of the old schema. The correction sprint must introduce a new schema version and then migrate all internal consumers atomically before retiring the old authoritative surface.

* Existing synthetic fixtures must migrate to real synthetic conversational `threadId`, `requestId`, `exchangeId`, `projectionId`, and governed-input lineage. Their fake EOS `runId`, `sessionId`, and `interfaceContractId` values must be removed unless the fixture explicitly models genuine EOS context.
* Sprint 3.78 evidence and behavior scenarios remain semantically valid because their questions, evidence statuses, conflicts, ownership, safe handling, and expected validation do not depend on EOS identity. Their construction data must migrate.
* Sprint 3.79's provider-neutral model-request content, parser, envelope, and validator can remain structurally unchanged except for the identity fields/references they expose or propagate.
* `invokeGovernedConversationModel` must stop creating and returning an independently authoritative `GovernedExecutionRecordPayload`. It must expose model-attempt/envelope/validation material needed by the lineage orchestrator to construct the sole canonical record.
* `constructExecutionRecordPayload` and `GovernedExecutionRecordPayload` require retirement. The conversational terminal-record constructor requires modification to accept or canonically reference all still-required metadata.
* A temporary legacy input type may exist only inside the isolated migration and must be explicitly non-authoritative, inaccessible to production integration, and incapable of treating synthetic EOS values as genuine references.
* No compatibility execution record may be committed or presented as terminal authority. Backward compatibility ends where it would preserve a false identity claim.

The migration must preserve one independently testable common evidence/model/validation pipeline and add no second input variant or execution-record concept.

## 14. Rejected register

| Rejected construction or alternative | Binding reason |
| --- | --- |
| Put `exchangeId` into `runId` without semantic change | It asserts an EOS run that did not occur and aliases two event domains. |
| Put `threadId` into `sessionId` without semantic change | Thread and EOS session have different owners, triggers, and lifecycles. |
| Manufacture `interfaceContractId` for ordinary chat | No governed conversational equivalent exists; fabrication would create false publication lineage. |
| Manufacture an EOS run solely for input construction | Type satisfaction cannot attest that EOS deliberation occurred. |
| Treat conversation as evidence of EOS deliberation | Conversation proves no candidate construction, executive reasoning, constraint evaluation, proposal, or EOS terminal stage. |
| Leave both execution-record types authoritative for one terminal disposition | It duplicates terminal authority and violates Identity Integrity. |
| Undocumented adapter that renames identifiers | Renaming conceals rather than corrects semantic identity. |
| Weaken validator or evidence status for integration | Identity incompatibility grants no authority to reduce epistemic or validation controls. |
| Run Option A | It creates needless retyping/discrimination and loses precise optional EOS-reference semantics. |
| Run Option C | It duplicates input types for contextual metadata. |
| Session Option A | It overloads or removes a valid EOS-session reference name. |
| Session Option C | It incorrectly makes EOS context a separate conversational domain. |
| Interface Option A | It requires an unauthorised conversational equivalent. |
| Interface Option C | It creates a type split solely for an optional reference. |
| Record Option 2 | It replaces more truthful exchange lineage and transforms an EOS-shaped canonical body. |
| Record Option 3 | It distributes one terminal proof across competing execution-record identities. |
| Record Option 4 | It retains an unnecessary execution-record-shaped view with high confusion and migration cost. |

## 15. Deferred register

The following are outside this governance sprint and receive no implementation authority:

* implementation of this contract in an isolated correction sprint;
* production integration into `/api/chat`;
* production selector design;
* durable conversational-lineage persistence technology and recovery/outbox design;
* delivery-disposition representation;
* operator verification and promotion;
* broader semantic fact-invention detection;
* comparator citation specificity;
* unrelated conversational capability expansion;
* retention and production deployment policy.

None of these deferrals changes the four binding decisions.

## 16. Final classification matrix

| Issue | Final Outcome | Architectural Class | Binding Decision | Implementation Consequence |
| --- | --- | --- | --- | --- |
| `runId` conflict | Modified | Identity | Option B | Add mandatory `exchangeId`; make `runId` a verified optional EOS reference in the versioned successor. |
| `sessionId` conflict | Modified | Identity | Option B | Add mandatory `threadId`; make `sessionId` a verified optional EOS reference. |
| `interfaceContractId` conflict | Modified | Identity | Option B | Make it a verified optional EOS reference; create no conversational substitute. |
| Competing execution records | Modified | Execution lineage | Record Option 1 | Make `ConversationalExecutionRecord` canonical and retire the payload/constructor. |

## 17. Validation results

The complete repository validation sequence passed:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 132 test files passed; 634 tests passed and 1 skipped. |
| `npm run build` | PASS — production build completed; the unavailable Google Fonts stylesheet caused font optimisation to be skipped without failing the build. |
| `npm run lint` | PASS — no warnings or errors. |
| `npm run typecheck` | PASS. |
| `git diff --check` | PASS. |

Repository checks confirmed that only this Sprint 3.85 document changed; no production, governed-conversation, EOS, route, selector, or test file changed. All four blockers have explicit decisions, each identity conflict selects exactly one option, the record conflict selects exactly one option, the decisions pass the coherence review, the Rejected and Deferred registers are present, the classification matrix covers every blocker, and implementation is explicitly future work.

## 18. Acceptance criteria and implementation boundary

This contract is complete because it makes all four decisions, establishes mechanical construction validity, eliminates false EOS prerequisites, assigns one terminal authority, preserves Identity Integrity and deterministic validation, specifies migration, and leaves implementation to a future isolated sprint.

No implementation was authorized or performed by Sprint 3.85.

No production source, governed-conversation implementation, EOS implementation, route, selector, or test was modified. The sole changed file is:

`docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md`

## 19. Next step

The next step is **Sprint 3.86 — Isolated Governed Conversational Identity Correction Implementation**. It must implement the versioned B/B/B input model and Record Option 1, migrate fixtures and internal consumers, preserve model/validator authority, and validate the corrected tracks in isolation. Production integration may resume only after that implementation passes its independent evaluation.

## 20. Completion report

### Identity decisions

Run Identity Decision: Option B  
Session Identity Decision: Option B  
Interface Contract Identity Decision: Option B

### Execution record decision

Execution Record Decision: Record Option 1

### Identity Integrity compliance

Record Option 1 assigns one immutable `executionRecordId` to one immutable canonical `ConversationalExecutionRecord` for one terminal exchange. Record Option 2 would mutate the meaning/body of the older EOS-shaped authority; Record Option 3 would distribute one terminal fact between rivals; Record Option 4 would retain a second execution-record-shaped publication without an established distinct consumer. Retiring the payload removes aliasing and ambiguity.

### Coherence finding

One mandatory conversational identity chain keys input and terminal lineage. Optional verified EOS references add context without replacing that chain. One record owns terminal disposition and incorporates or references evidence, validation, ownership, and attempt metadata. No stage needs synthetic EOS identity.

### Implementation authority

> No implementation was authorized or performed by Sprint 3.85.

### Final recommendation gate

**Correction Contract Complete**
