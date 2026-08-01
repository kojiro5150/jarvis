# Sprint 3.87 — Governed Conversational Runtime Integration (Re-attempt)

**Status:** Specification  
**Sprint Type:** Production Integration Behind Selector  
**Default Mode:** LEGACY  
**Promotion Authority:** None  
**Operator Verification:** Not included  
**Output Path:** docs/SPRINT-3.87-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md

---

## 1\. Purpose

Sprint 3.87 re-attempts production integration of the governed conversational runtime into /api/chat.

Sprint 3.80 attempted this integration and correctly returned:

**Integration Incomplete**

The first integration attempt stopped because ordinary chat had no honest lineage identity capable of satisfying the governed conversational input contract.

At that time:

* ordinary /api/chat requests had no conversational thread identity;

* no request or exchange identity existed;

* GovernedConversationalInput required EOS-style runId, sessionId, and interfaceContractId;

* supplying conversational identities through those fields would have falsely implied EOS execution;

* no complete governed conversational projection existed for the live route.

Sprints 3.81–3.86 resolved the lineage and identity blocker.

Sprint 3.86 established and proved that:

* threadId, requestId, and exchangeId are mandatory conversational identities;

* runId, sessionId, and interfaceContractId are optional genuine EOS-context references;

* an ordinary conversational exchange can complete the full isolated governed pipeline with all EOS references absent;

* ConversationalExecutionRecord is the sole authoritative terminal execution record;

* the governed model-invocation, validation, projection, and lineage tracks now compose truthfully in isolation.

Sprint 3.87 shall integrate that corrected architecture into the live conversational route behind an independent selector.

The central integration objective is:

**Permit /api/chat to run the corrected governed conversational pipeline when explicitly configured, while preserving the current legacy path as the unchanged default and retaining an immediate rollback boundary.**

The central constitutional constraint is:

**The route orchestrates the governed architecture. It does not become the owner of conversational projection, evidence derivation, claim classification, model authority, or validation.**

---

## 2\. Sprint Character

This is a production integration sprint.

It may:

* add a dedicated conversational-runtime selector;

* add thin production adapters;

* add a production governed-input orchestration adapter;

* modify app/api/chat/route.ts;

* add integration tests;

* add deterministic response rendering where needed;

* connect existing governed modules to the live route.

It is not:

* a governance sprint;

* an evidence-acquisition redesign sprint;

* a projection redesign sprint;

* a model-governance sprint;

* a promotion sprint;

* an operator-verification sprint;

* a default-flip sprint;

* an authorization to replace the legacy route.

LEGACY remains the default.

GOVERNED is opt-in through explicit deployment configuration only.

---

## 3\. Governing Hierarchy

The sprint shall apply the repository’s established governing hierarchy, including:

1. JARVIS Engineering Constitution

2. JARVIS North Star

3. JARVIS Engineering Specification Standard

4. Constitutional Publication Principles

5. docs/architecture/ROADMAP.md

6. Sprint 3.82 — Governed Conversational Lineage Identity Contract

7. Sprint 3.85 — Governed Conversational Identity Correction Contract

8. Sprint 3.86 — Governed Conversational Identity Correction Implementation

9. Sprint 3.76 — Governed Conversational Runtime Contract

10. Sprint 3.83 — Isolated Conversational Lineage and Projection Implementation

11. Sprint 3.79 — Isolated Governed Conversational Model Invocation

12. Sprint 3.80 — Governed Conversational Runtime Integration

13. Sprint 3.61 — Governed Dashboard Integration

14. Sprint 3.67 — Governed DAWNWATCH Integration

15. Current selector, projection, input, model-invocation, validation, route, and source-acquisition code

16. This Sprint Specification

Sprint 3.82 governs projection ownership and conversational lineage.

Sprint 3.85 governs corrected identity semantics.

Sprint 3.86 supplies the corrected implementation.

Sprint 3.76 governs evidence sufficiency, model ownership, response structure, and validation.

Sprint 3.80 remains the authoritative record of the first integration attempt and its correctly identified blockers.

---

## 4\. Repository Precondition

Before modifying any code:

1. Confirm the intended repository and branch.

2. Record the starting commit.

3. Confirm the working-tree state.

4. Confirm the following governing artefacts exist:

docs/ENGINEERING\_CONSTITUTION.md  
docs/architecture/NORTH\_STAR.md  
docs/architecture/JARVIS-Engineering-Specification-Standard.md  
docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md  
docs/architecture/ROADMAP.md

docs/SPRINT-3.61-GOVERNED-DASHBOARD-INTEGRATION.md  
docs/SPRINT-3.67-GOVERNED-DAWNWATCH-INTEGRATION.md  
docs/SPRINT-3.76-GOVERNED-CONVERSATIONAL-RUNTIME-CONTRACT.md  
docs/SPRINT-3.79-ISOLATED-GOVERNED-CONVERSATIONAL-MODEL-INVOCATION.md  
docs/SPRINT-3.80-GOVERNED-CONVERSATIONAL-RUNTIME-INTEGRATION.md  
docs/SPRINT-3.82-GOVERNED-CONVERSATIONAL-LINEAGE-IDENTITY-CONTRACT.md  
docs/SPRINT-3.83-ISOLATED-CONVERSATIONAL-LINEAGE-AND-PROJECTION-IMPLEMENTATION.md  
docs/SPRINT-3.85-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-CONTRACT.md  
docs/SPRINT-3.86-GOVERNED-CONVERSATIONAL-IDENTITY-CORRECTION-IMPLEMENTATION.md

5. Read all listed governing artefacts completely.

6. Confirm the following current implementation files exist:

app/api/chat/route.ts

lib/dawnwatch-presentation-selection.ts  
lib/dashboard-presentation-selection.ts

lib/governed-conversation/types.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/model-request.ts  
lib/governed-conversation/model-output.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/response-envelope.ts  
lib/governed-conversation/validator.ts  
lib/governed-conversation/lineage-types.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/exchange-lifecycle.ts  
lib/governed-conversation/lineage-repository.ts  
lib/governed-conversation/in-memory-lineage-repository.ts  
lib/governed-conversation/lineage-orchestrator.ts

lib/executive-context/gmail-production-evidence.ts  
lib/chat-capabilities/google-gmail-content.ts

EosReferenceVerifier is not a separate file. It is defined in:

lib/governed-conversation/input.ts

Use that path directly when inspecting the verifier definition, construction requirements, and fail-closed behavior.

7. Inspect app/api/chat/route.ts completely.

8. Trace the real production request path from the client caller into /api/chat.

9. Confirm the current model call remains injected through the existing callModel: callClaude boundary or record the current equivalent.

10. Trace all existing production source acquisition used by /api/chat.

11. Inspect the exact input expected by composeGovernedConversationalProjection.

12. Inspect lib/executive-context/gmail-production-evidence.ts before concluding that the Projection Ownership Integration Gate fails.

Confirm specifically whether its:

projectProductionGmailEvidence

function calls the canonical:

normalizeGmailObservation

and produces genuine:

NormalizedGmailObservation\[\]

rather than raw legacy OperationalState or gmailThreads.

Determine whether this existing governed-shape producer can supply the projection composer’s communicationEvidence input without:

* inventing a new mapping;

* duplicating canonical normalization;

* elevating legacy heuristics;

* bypassing composer ownership;

* reconstructing evidence in /api/chat.

If it can, record that as a **partial Projection Ownership Integration Gate pass for communication evidence only**.

A pass for communication evidence does not establish that the Projection Ownership Integration Gate passes as a whole.

13. Inspect lib/chat-capabilities/google-gmail-content.ts, including the current GoogleGmailContentConnector behavior already used by /api/chat.

Confirm explicitly that this connector is a single-message content-fetch capability that returns raw decoded message content rather than a governed evidence shape directly consumable by the projection composer.

Treat it as potentially relevant to authorised source acquisition.

Do not treat its existence as closing any part of the Projection Ownership Integration Gate unless another existing governed owner normalizes its output into an authorised projection-composer input.

14. Determine whether production already exposes authorised upstream evidence shapes matching every input category required by the Dedicated Conversational Projection Composer.

Assess and report each category independently:

| Projection input category | Existing producer found? | Governed shape confirmed? | Gate status for category |
| :---- | ----: | ----: | :---- |
| communicationEvidence | Yes / No | Yes / No | Pass / Fail / Unresolved |
| calendarEvidence | Yes / No | Yes / No | Pass / Fail / Unresolved |
| memoryPriorityReferences | Yes / No | Yes / No | Pass / Fail / Unresolved |
| sourceEvidence | Yes / No | Yes / No | Pass / Fail / Unresolved |
| connectorAvailability | Yes / No | Yes / No | Pass / Fail / Unresolved |
| conversation history | Yes / No | Yes / No | Pass / Fail / Unresolved |
| governed claim set | Yes / No | Yes / No | Pass / Fail / Unresolved |
| conflicts | Yes / No | Yes / No | Pass / Fail / Unresolved |

A partial pass on one or more evidence categories is not equivalent to the Projection Ownership Integration Gate passing.

The gate passes only if every category required for the production governed request can be supplied through an existing authorised governed shape or an already-governed deterministic owner without semantic invention.

15. Confirm that ordinary /api/chat currently receives no genuine:

    * EOS run;

    * EOS session;

    * EOS interaction contract.

16. Record pre-sprint blob hashes for:

    * app/api/chat/route.ts;

    * lib/context-builder.ts;

    * lib/useAgentConversation.ts;

    * lib/agents/chat-execution.ts;

    * all protected core governed-conversation files whose semantics must remain unchanged.

17. Capture fixed baseline requests and complete HTTP responses from the existing legacy route for later byte-identical regression comparison.

If Sprint 3.86 is unavailable, do not proceed.

If the checked-out source does not contain the corrected Sprint 3.86 identity model, stop and report.

If the production source-acquisition path cannot supply the Dedicated Conversational Projection Composer with already-authorised governed source inputs across all required categories, apply the fail-closed Projection Ownership Integration Gate in Section 9\.

A confirmed partial pass for communicationEvidence through projectProductionGmailEvidence shall be reported accurately but shall not be used to infer that missing calendar, memory/priority, general source-evidence, connector-availability, history, claim, or conflict inputs are also available.

---

## 5\. Binding Production Chain

The governed production path shall follow this exact architecture:

/api/chat request  
    ↓  
CONVERSATIONAL\_RUNTIME\_MODE  
    ├── LEGACY  
    │     ↓  
    │ existing route path unchanged  
    │     ↓  
    │ { reply, agentId }  
    │  
    └── GOVERNED  
          ↓  
      conversational lineage creation  
      threadId / requestId / exchangeId  
          ↓  
      authorised source acquisition  
          ↓  
      Dedicated Conversational Projection Composer  
          ↓  
      GovernedConversationalInput  
      EOS references absent for ordinary chat  
          ↓  
      Sprint 3.79 governed model invocation  
          ↓  
      unchanged deterministic validator  
          ↓  
      validated model envelope or validated safe envelope  
          ↓  
      ConversationalExecutionRecord  
          ↓  
      governed HTTP response  
      { mode: "GOVERNED", agentId, envelope }

This structure is binding.

The route shall not omit, reorder, or internally duplicate these ownership boundaries merely because a shorter path appears easier.

---

## 6\. Architectural Ownership Boundaries

### /api/chat owns

The route may own:

* request parsing;

* authentication and request-shape checks already assigned to it;

* selector resolution;

* dependency orchestration;

* HTTP status;

* HTTP response serialization;

* translating a validated governed result into the governed response discriminant.

### /api/chat does not own

The route shall not own:

* canonical evidence derivation;

* source normalization;

* governed claim construction;

* evidence-status calculation;

* conversational projection composition;

* model interpretation authority;

* validator semantics;

* safe-envelope semantics;

* terminal execution-record semantics.

### Dedicated Conversational Projection Composer owns

The existing composer remains the exclusive owner of deriving:

GovernedConversationalProjection

from authorised upstream governed publications and references.

The composer shall not be copied into the route.

The route shall not recreate its output manually.

### Governed input construction owns

The existing governed-input constructor owns:

* mandatory lineage validation;

* optional EOS-context verification;

* evidence and claim assembly into GovernedConversationalInput;

* fail-closed rejection of fabricated EOS references.

### Governed model invocation owns

The existing Sprint 3.79 pipeline owns:

* model request construction;

* structured output parsing;

* response-envelope construction;

* deterministic validation;

* safe fallback;

* model-attempt and execution metadata.

### Conversational lineage owns

The Sprint 3.83/3.86 architecture owns:

* thread identity;

* request identity;

* exchange identity;

* projection identity;

* attempt identity;

* response-envelope identity;

* terminal execution record.

---

## 7\. New Runtime Selector

Create:

lib/conversational-runtime-selection.ts

Define:

**export type** ConversationalRuntimeMode \= "LEGACY" | "GOVERNED";

**export** **function** selectConversationalRuntimeMode(  
  value: string | undefined,  
): ConversationalRuntimeMode;

Required semantics:

| Configuration value | Result |
| :---- | :---- |
| undefined | LEGACY |
| "" | LEGACY |
| whitespace only | LEGACY |
| "LEGACY" | LEGACY |
| "GOVERNED" | GOVERNED |
| anything else | throw explicit configuration error |

The selector shall follow the exact established Dashboard and DAWNWATCH selector discipline.

It shall not silently normalize:

* lowercase;

* mixed case;

* aliases;

* booleans;

* numeric values;

* unknown strings.

Invalid configuration shall fail explicitly.

---

## 8\. Selector Independence

CONVERSATIONAL\_RUNTIME\_MODE is independent of:

DASHBOARD\_PRESENTATION\_MODE  
DAWNWATCH\_PRESENTATION\_MODE

No selector shall:

* import another selector’s mode value;

* use another environment variable;

* derive its value from another capability;

* alter another capability’s default;

* reuse another capability’s configuration error.

Required tests shall prove:

1. changing Dashboard mode does not alter conversational mode;

2. changing DAWNWATCH mode does not alter conversational mode;

3. changing conversational mode does not alter either presentation selector;

4. all three can be configured independently in the same process;

5. invalid conversational configuration throws without changing the other selectors.

---

## 9\. Projection Ownership Integration Gate

### Named gate

**Projection Ownership Integration Gate**

Before implementing the governed route path, determine whether the current production source-acquisition architecture can supply the existing Dedicated Conversational Projection Composer with already-authorised governed input shapes.

This gate must answer:

1. Which production functions acquire Gmail evidence?

2. Which acquire calendar evidence?

3. Which expose memory or priority references?

4. Which expose connector availability?

5. Which expose conversation history?

6. Which provide claim inputs?

7. Which provide conflict inputs?

8. Are these values already represented in shapes authorised by Sprint 3.82 and consumed by the projection composer?

9. Would the route need to infer or reconstruct governed evidence from legacy OperationalState, gmailThreads, snippets, heuristic fields, or prompt context?

10. Would any new mapping require an ungoverned decision about ownership, provenance, sufficiency, or claim meaning?

### Passing condition

The gate passes only if:

* authorised governed source shapes already exist;

* the route or a thin adapter can pass them to the existing composer without semantic invention;

* no projection logic is duplicated;

* no legacy heuristic is elevated into canonical evidence;

* source ownership and provenance remain intact;

* the composer remains the only projection owner.

### Failing condition

The gate fails if integration requires:

* deriving governed evidence directly inside /api/chat;

* reconstructing projection fields from raw OperationalState;

* treating gmailThreads as governed recipient evidence;

* converting prompt/context-builder output into canonical evidence;

* inventing claim classification;

* inventing source availability;

* filling mandatory projection fields with placeholders;

* bypassing the projection composer;

* creating a second composer;

* extending this sprint into a new evidence-mapping implementation without prior governance.

### Required response to failure

If the gate fails:

* do not implement an ad hoc mapping;

* do not bypass the composer;

* do not weaken the composer’s input type;

* do not route through synthetic fixtures;

* do not complete only the selector/model adapter and claim partial integration.

Return:

**Integration Incomplete**

The completion report shall identify:

* the exact missing governed source shape;

* the current legacy source;

* the owner that would need to produce the governed form;

* why adapting it requires new implementation or governance;

* the smallest next sprint needed to close it.

This is a valid, complete sprint outcome.

---

## 10\. Conversational Lineage Creation

The governed route path shall create genuine conversational lineage for each accepted chat exchange.

At minimum:

threadId  
requestId  
exchangeId

### Thread identity

The integration shall determine how the existing client conversation identity maps to or creates a governed conversational thread.

The thread identity must represent continuity across multiple exchanges where the current interaction genuinely belongs to the same conversation.

It shall not be regenerated arbitrarily for every retry.

It shall not be equated with an EOS session.

### Request identity

Each accepted operator submission shall receive a request identity.

The request identity shall:

* correspond to one accepted request;

* preserve idempotency semantics where an idempotency key exists;

* not imply projection or model success;

* remain linked to the thread.

### Exchange identity

Each governed response lifecycle shall receive an exchange identity after request acceptance and before projection.

The exchange identity shall:

* remain stable across permitted Retry Model A attempts;

* not be an EOS run ID;

* not imply model success;

* remain linked to the request and thread;

* appear in the resulting terminal execution record.

### Creation ownership

Lineage identities shall be constructed using the existing Sprint 3.83/3.86 lineage constructors.

Do not invent route-local identity formats.

Do not create UUIDs inline if that bypasses governed constructor semantics.

---

## 11\. Ordinary Chat EOS Context

Before implementation, confirm directly that the ordinary /api/chat path does not currently have a genuine:

runId  
sessionId  
interfaceContractId

for each conversational request.

Expected ordinary-chat construction:

runId: undefined  
sessionId: undefined  
interfaceContractId: undefined

The governed route shall not:

* manufacture these values;

* derive them from thread/request/exchange identities;

* use agent IDs as substitutes;

* use request IDs as substitutes;

* use route names as substitutes;

* use projection IDs as substitutes.

The EosReferenceVerifier shall be invoked only when genuine EOS-context references are actually supplied.

Absence of EOS context is valid and requires no verification.

If the route unexpectedly receives claimed EOS context, it must pass through the existing fail-closed verifier before governed input construction succeeds.

---

## 12\. Production Governed-Input Adapter

Create a dedicated production adapter under:

lib/governed-conversation/

Recommended path:

lib/governed-conversation/production-input-adapter.ts

The exact path shall be stated in the completion report.

The adapter shall orchestrate:

1. accepted route request;

2. conversational lineage construction;

3. authorised source acquisition;

4. projection-composer input assembly;

5. invocation of the existing Dedicated Conversational Projection Composer;

6. governed-input construction;

7. optional EOS verification only when context exists.

The adapter shall not own:

* source normalization;

* claim semantics;

* evidence-status logic;

* projection derivation;

* model request construction;

* response validation;

* terminal record semantics.

### Expected conceptual interface

**interface** ProductionGovernedConversationInputRequest {  
  **readonly** agentId: string;  
  **readonly** messages: **readonly** ChatMessage\[\];  
  **readonly** threadContext: ProductionThreadContext;  
  **readonly** requestReceivedAt: string;  
  **readonly** referenceTime: string;  
  **readonly** authorisedSources: ProductionGovernedSourceBundle;  
  **readonly** optionalEosContext?: OptionalEosContextReferences;  
}

**interface** ProductionGovernedConversationInputResult {  
  **readonly** threadId: string;  
  **readonly** requestId: string;  
  **readonly** exchangeId: string;  
  **readonly** projection: GovernedConversationalProjection;  
  **readonly** input: GovernedConversationalInput;  
}

Exact names may follow repository conventions.

The interface shall expose governed inputs, not raw provider payloads, where existing architecture already provides those forms.

---

## 13\. Source Acquisition Boundary

The production governed-input adapter may invoke existing source-acquisition functions.

It shall not treat source acquisition and projection derivation as the same responsibility.

The boundary shall be:

connector/source acquisition  
        ↓  
source-specific governed publication or authorised evidence shape  
        ↓  
Dedicated Conversational Projection Composer

It shall not be:

legacy OperationalState  
        ↓  
route guesses what counts as evidence  
        ↓  
hand-built GovernedConversationalInput

The completion report shall provide a source mapping table:

| Required projection area | Production source | Existing governed shape | Adapter action | Owner |
| :---- | :---- | :---- | :---- | :---- |
| Communications | … | … | pass/reference/transform | … |
| Calendar | … | … | pass/reference/transform | … |
| Memory/priorities | … | … | pass/reference/transform | … |
| Connector availability | … | … | pass/reference/transform | … |
| Conversation history | … | … | classify/pass | … |
| Claims | … | … | authorised deterministic construction | … |
| Conflicts | … | … | pass/derive through existing governed owner | … |

Any row requiring new semantic invention fails the Projection Ownership Integration Gate.

---

## 14\. Claim Construction Boundary

The governed projection requires a bounded claim set.

The integration shall use an existing authorised deterministic claim-construction mechanism if one exists.

It shall not let:

* the route;

* the LLM;

* the prompt builder;

* context-builder.ts;

* legacy heuristic ordering

decide claim meaning.

For the Cassie test, the required claim structure includes at minimum:

contact address claim  
importance/significance claim

Expected statuses remain:

contact address  
→ available when governed identity/address evidence is sufficient

importance/significance  
→ unsupported or insufficient\_coverage where no governed significance rule exists

If no authorised production claim-construction mechanism exists for arbitrary chat questions, report that as a specific integration blocker.

Do not create a general natural-language claim parser in this sprint.

---

## 15\. Production Model Adapter

Create a thin production model adapter under:

lib/governed-conversation/

Recommended path:

lib/governed-conversation/production-model-adapter.ts

It shall implement the existing governed model-adapter interface from Sprint 3.79.

It shall:

1. accept the existing GovernedModelRequest;

2. translate it into the existing production model-call input;

3. call the real production callClaude boundary;

4. return the raw provider response expected by the existing parser.

It shall not:

* change prompts beyond the existing governed model request;

* add hidden context;

* inject legacy OperationalState;

* append heuristic data;

* parse output itself;

* validate output;

* construct envelopes;

* override statuses;

* create execution records;

* retry outside governed retry semantics.

The adapter is translation only.

---

## 16\. Model Dependency Injection

The route integration must remain testable without calling the live provider.

Refactor only as narrowly as required so tests can supply a deterministic mock governed model adapter.

The production path shall use the thin callClaude wrapper.

The test path shall inject a deterministic adapter.

Do not add a second model execution architecture.

Do not weaken the existing production callModel injection boundary unnecessarily.

If the route already supports dependency injection through an existing factory or handler constructor, reuse it.

---

## 17\. Route Integration

Modify:

app/api/chat/route.ts

The route shall resolve:

process.env.CONVERSATIONAL\_RUNTIME\_MODE

through:

selectConversationalRuntimeMode

### LEGACY path

When mode is:

LEGACY

or configuration is missing/empty:

* execute the pre-sprint legacy path;

* use the same context building;

* use the same model call;

* use the same parsing;

* use the same error behavior;

* return the same HTTP status;

* return the same headers;

* return the same JSON body:

{  
  "reply": "...",  
  "agentId": "..."  
}

Do not add:

* mode: "LEGACY";

* governed metadata;

* lineage IDs;

* changed error text;

* extra headers;

* new timing fields;

* reordered output properties where byte identity is required.

### GOVERNED path

When mode is:

GOVERNED

the route shall:

1. accept and validate the request;

2. establish conversational thread/request/exchange identity;

3. acquire authorised source evidence;

4. pass authorised evidence into the Dedicated Conversational Projection Composer;

5. construct GovernedConversationalInput;

6. leave EOS references absent for ordinary chat;

7. invoke the existing governed model pipeline through the production adapter;

8. receive a validated model or safe envelope;

9. receive the authoritative ConversationalExecutionRecord;

10. return the governed response discriminant.

Required response shape:

**interface** GovernedChatResponse {  
  **readonly** mode: "GOVERNED";  
  **readonly** agentId: string;  
  **readonly** envelope: GovernedConversationalResponseEnvelope;  
}

The terminal execution record shall not be exposed publicly unless a governing contract already authorises that response surface.

It may be retained internally for future persistence/integration work.

---

## 18\. Discriminated HTTP Response

The route shall expose two intentionally distinct response shapes.

### Legacy

**interface** LegacyChatResponse {  
  **readonly** reply: string;  
  **readonly** agentId: string;  
}

### Governed

**interface** GovernedChatResponse {  
  **readonly** mode: "GOVERNED";  
  **readonly** agentId: string;  
  **readonly** envelope: GovernedConversationalResponseEnvelope;  
}

Do not add a mode field to the legacy response in this sprint.

That would break byte-identical compatibility.

The client integration implications of receiving the governed shape must be evaluated.

If the current client cannot handle the governed response without modification, either:

* make the minimum discriminated-client change required by this integration; or

* report a precise blocker if such a change exceeds authorised scope.

Any client file modified must be explicitly named and justified.

The LEGACY client path must remain unchanged.

---

## 19\. Legacy Byte-Identity Regression Gate

This sprint requires byte-identical legacy HTTP behavior.

Before modification, capture fixed baseline requests and complete responses.

After modification, run the same requests with:

1. CONVERSATIONAL\_RUNTIME\_MODE unset;

2. CONVERSATIONAL\_RUNTIME\_MODE="";

3. CONVERSATIONAL\_RUNTIME\_MODE="LEGACY".

For each, compare:

* HTTP status;

* headers relevant to behavior;

* raw response body bytes;

* JSON property order if serialized output depends on it;

* error behavior;

* model-call input;

* agent selection;

* context-builder output;

* reply text under deterministic mock dependencies.

Required outcome:

pre-sprint legacy response bytes  
\=  
post-sprint unset response bytes  
\=  
post-sprint LEGACY response bytes

If byte identity cannot be established, report:

**Integration Incomplete**

Do not characterize merely equivalent JSON as byte-identical evidence.

---

## 20\. Legacy Code-Path Preservation

The existing legacy implementation should remain structurally intact.

Prefer:

**if** (mode \=== "LEGACY") {  
  **return** existingLegacyHandler(...);  
}

**return** governedHandler(...);

or an equivalent narrow branch that preserves the old behavior.

Do not refactor the legacy path merely to make the new branch elegant.

No cleanup is authorised unless required to expose a testable handler without changing legacy output.

Any movement or extraction of legacy code must have regression evidence proving exact behavior.

---

## 21\. Cassie End-to-End Integration Test

Add a route-level integration test reproducing the real motivating request:

“What’s Cassie’s email? Anything important?”

The test shall execute through the actual route handler in:

CONVERSATIONAL\_RUNTIME\_MODE=GOVERNED

Use deterministic fixtures and a mocked governed model adapter.

The test shall not:

* call the governed modules directly while bypassing the route;

* manually construct the final envelope after route execution;

* use a synthetic EOS run;

* use a synthetic EOS session;

* use a synthetic interaction contract;

* bypass the projection composer;

* inject a completed governed input directly into the route;

* bypass validation.

The test must prove the route performs:

request  
→ selector  
→ lineage  
→ authorised sources  
→ projection composer  
→ governed input  
→ mocked model invocation  
→ parser  
→ unchanged validator  
→ validated/safe envelope  
→ execution record  
→ governed HTTP response

---

## 22\. Cassie Expected Semantics

The Cassie test shall contain sufficient governed evidence for the contact-address claim and insufficient or unsupported evidence for importance.

Expected envelope semantics:

### Address claim

* status: available;

* fact linked to authorised source evidence;

* source reference preserved;

* no invented email address;

* no dependence on unread/important/needsReply heuristics.

### Importance claim

* status: unsupported or insufficient\_coverage, according to the existing governed rules;

* no claim that unread means important;

* no claim that heuristic ordering proves significance;

* uncertainty preserved;

* model interpretation visibly non-authoritative.

### Advisory response

The model may offer bounded next steps only if:

* clearly marked model-owned;

* linked to evidence;

* not presented as approval, decision, or execution;

* accepted by the unchanged validator.

---

## 23\. Safe-Envelope Integration Test

Add at least one governed route test in which the mocked model returns invalid output, such as:

* invented fact;

* heuristic laundering;

* unsupported status upgrade;

* authority violation;

* malformed structured output.

The actual governed pipeline shall:

1. reject the model output through the unchanged validator or parser;

2. construct the existing safe envelope;

3. create the correct authoritative execution record;

4. return a valid governed response;

5. expose no unvalidated raw model prose.

This proves production integration preserves Sprint 3.79’s safe-failure behavior.

---

## 24\. Invalid Selector Test

Required route test:

CONVERSATIONAL\_RUNTIME\_MODE=UNKNOWN

Expected:

* explicit configuration error;

* no silent fallback to legacy;

* no governed execution;

* no model call where configuration resolution occurs before model invocation.

The exact error behavior shall mirror the Dashboard/DAWNWATCH selector precedent.

---

## 25\. Source and Projection Failure Tests

Add tests proving fail-closed behavior when:

### Authorised source unavailable

Where a complete projection can represent unavailability:

* projection remains truthful;

* governed status remains unavailable;

* safe response may proceed;

* no source fact is invented.

### Required governed source shape missing

Where the projection cannot be composed without semantic invention:

* no model call;

* no hand-built projection;

* no legacy evidence fallback;

* explicit failure or Integration Incomplete during implementation if this is a structural production gap.

### Projection composer rejects input

Expected:

* no model call;

* no response claiming governed facts;

* truthful failure handling;

* no fallback to legacy merely because governed projection failed, unless separately governed.

The selector is a mode choice, not an automatic per-request fallback mechanism.

---

## 26\. No Silent Governed-to-Legacy Fallback

When mode is explicitly GOVERNED, the route shall not silently fall back to legacy behavior if:

* source acquisition fails;

* projection fails;

* input construction fails;

* EOS verification fails;

* model output is invalid;

* persistence/reference commit fails;

* validation fails.

Use the governed unavailable/safe-response/failure behavior already authorised.

Silent fallback would make the operator believe the governed path ran when it did not.

A fallback to LEGACY requires a separate explicit deployment configuration change.

---

## 27\. Execution Record Boundary

Every governed route execution shall produce the authoritative:

ConversationalExecutionRecord

through the corrected Sprint 3.86 path.

The route shall not construct:

* a second terminal record;

* a compatibility execution payload;

* an EOS run record;

* a route-local audit record claiming terminal authority.

The route may receive and pass along the execution record internally.

It shall not mutate its semantic contents.

If production persistence is not yet authorised, the route shall not falsely claim durable persistence.

Any use of an in-memory repository must be identified explicitly as non-durable.

---

## 28\. Persistence Boundary

Sprint 3.82 established fail-closed persistence ordering, while Sprint 3.83 supplied only an isolated in-memory reference repository.

Before completing integration, determine whether the live route can truthfully satisfy the required commit ordering with the currently authorised repository implementation.

The route must not claim durable lineage persistence if none exists.

The sprint shall distinguish:

### Runtime orchestration proof

The route can exercise:

* request commit;

* exchange commit;

* projection commit;

* attempt commit;

* envelope commit;

* terminal record commit;

* release ordering

through the existing repository port.

### Production durability

A real durable repository survives process loss and cross-instance execution.

If only the in-memory adapter exists, the completion report must state that integration proves runtime orchestration but not durable production persistence.

If Sprint 3.82 or 3.85 makes durable persistence a prerequisite for any production response release, and the current route cannot satisfy it, this is a blocking integration finding.

Do not weaken fail-closed semantics in the route.

---

## 29\. Client Compatibility

Trace the actual consumer of /api/chat.

Confirm whether it currently expects only:

{  
  "reply": "...",  
  "agentId": "..."  
}

If GOVERNED mode returns a structured envelope, determine the minimum client-side change required to handle the discriminated response.

Any client integration shall:

* preserve legacy parsing unchanged;

* branch only on the governed discriminant;

* render the validated envelope without converting unsupported claims into confident prose;

* preserve uncertainties;

* preserve ownership distinctions;

* avoid hiding safe responses;

* avoid flattening the envelope into one model-like string if that would erase evidence status.

If client support requires a materially new presentation contract, stop and report rather than invent one inside this sprint.

A bounded discriminated-response parser and straightforward existing-field rendering are permitted where no new semantic design is required.

---

## 30\. Expected File Changes

### New files

Expected:

lib/conversational-runtime-selection.ts  
lib/conversational-runtime-selection.test.ts

lib/governed-conversation/production-input-adapter.ts  
lib/governed-conversation/production-input-adapter.test.ts

lib/governed-conversation/production-model-adapter.ts  
lib/governed-conversation/production-model-adapter.test.ts

Equivalent filenames are permitted where clearly justified.

### Modified files

Expected:

app/api/chat/route.ts

Associated route tests may be modified or added.

A client consumer may be modified only if the governed discriminated response cannot otherwise be consumed and the change remains a bounded integration concern.

### Core governed files protected from semantic change

Do not change the semantics of:

lib/governed-conversation/types.ts  
lib/governed-conversation/input.ts  
lib/governed-conversation/evidence-status.ts  
lib/governed-conversation/model-request.ts  
lib/governed-conversation/model-output.ts  
lib/governed-conversation/model-invocation.ts  
lib/governed-conversation/response-envelope.ts  
lib/governed-conversation/validator.ts  
lib/governed-conversation/lineage-types.ts  
lib/governed-conversation/projection-composer.ts  
lib/governed-conversation/exchange-lifecycle.ts  
lib/governed-conversation/lineage-repository.ts  
lib/governed-conversation/lineage-orchestrator.ts

Imports and production composition are authorised.

Semantic redesign is not.

### Legacy support files

Do not modify:

lib/context-builder.ts  
lib/operational-state.ts

unless a change is proven necessary solely to expose unchanged legacy behavior for testing.

Any such change requires byte-identical proof and explicit reporting.

---

## 31\. Explicitly Out of Scope

Do not:

* change the default to GOVERNED;

* promote the governed runtime;

* perform operator verification;

* modify .env.local;

* modify deployment configuration;

* modify Dashboard or DAWNWATCH selectors;

* reopen Sprint 3.82 lineage decisions;

* reopen Sprint 3.85 identity decisions;

* reopen Sprint 3.86 implementation semantics;

* redesign claim classification;

* redesign evidence-status rules;

* change validator semantics;

* add a second projection composer;

* let /api/chat derive canonical evidence;

* reintroduce retired execution-record types;

* manufacture EOS context;

* create general natural-language claim extraction;

* add production database technology unless separately authorised;

* silently fall back from governed to legacy;

* represent an in-memory repository as durable persistence;

* claim operator verification or promotion.

---

## 32\. Required Tests

At minimum, provide tests for:

### Selector

1. missing value → LEGACY;

2. empty value → LEGACY;

3. whitespace → LEGACY;

4. exact LEGACY → LEGACY;

5. exact GOVERNED → GOVERNED;

6. unknown value throws;

7. independence from Dashboard selector;

8. independence from DAWNWATCH selector.

### Legacy route

9. unset selector returns byte-identical baseline response;

10. explicit LEGACY returns byte-identical baseline response;

11. legacy error behavior remains byte-identical;

12. legacy model request remains identical under deterministic dependencies;

13. no governed lineage/projection/model modules execute in LEGACY.

### Governed input and projection

14. real thread/request/exchange identities are constructed;

15. ordinary chat EOS references remain absent;

16. projection composer is invoked;

17. route does not hand-build projection output;

18. authorised source references remain intact;

19. no legacy heuristic becomes governed evidence;

20. missing required governed source shape fails closed.

### Governed model path

21. production adapter translates without adding model logic;

22. mocked governed adapter supports deterministic route testing;

23. existing parser runs;

24. existing validator runs unchanged;

25. valid output produces validated envelope;

26. invalid output produces safe envelope;

27. execution record is ConversationalExecutionRecord.

### Cassie

28. real route handler processes Cassie request;

29. contact address is available with source evidence;

30. importance remains unsupported or insufficient;

31. no unread/important heuristic laundering;

32. no synthetic EOS identity;

33. governed response has exact discriminant.

### Failure

34. invalid selector fails explicitly;

35. projection failure causes no model call;

36. source unavailability remains truthful;

37. invalid EOS reference fails closed if supplied;

38. no silent governed-to-legacy fallback;

39. validation failure exposes no raw invalid output.

### Isolation and regressions

40. Dashboard selector unchanged;

41. DAWNWATCH selector unchanged;

42. protected governed core semantics unchanged;

43. Sprint 3.78 evaluation remains green;

44. Sprint 3.84 historical tests remain green;

45. Sprint 3.86 identity-correction composition remains green;

46. full test suite passes.

---

## 33\. Legacy Byte-Hash and Behavior Evidence

Because app/api/chat/route.ts must change, source blob identity cannot remain unchanged for that file.

Instead require:

### Protected supporting files

Pre/post blob hashes must remain identical for:

lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

and protected EOS runtime files.

### Legacy route behavior

Capture and compare byte-level responses through executable tests.

The completion report shall include:

* baseline fixture identifiers;

* pre-sprint response digests;

* post-sprint unset-mode response digests;

* post-sprint explicit-LEGACY response digests;

* confirmation of equality.

If only semantic JSON equivalence was tested, do not claim byte identity.

---

## 34\. Validation

Run the full repository validation suite:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

No integration-sprint exception applies.

Also run targeted suites for:

* conversational selector;

* production input adapter;

* production model adapter;

* /api/chat legacy regression;

* /api/chat governed integration;

* Cassie route scenario;

* safe-envelope route scenario;

* projection ownership gate;

* source failure;

* selector independence;

* Sprint 3.78 evaluation;

* Sprint 3.84 historical evaluation;

* Sprint 3.86 composition;

* protected blob hashes.

Record exact commands and results.

---

## 35\. Execution Boundary

Sprint 3.87 may establish only repository-level and isolated-runtime integration evidence.

It cannot verify:

* the operator’s current running JARVIS process;

* the operator’s actual .env.local;

* live Gmail behavior;

* live calendar behavior;

* real Claude output;

* multi-instance persistence;

* production deployment configuration;

* browser behavior outside the deterministic test harness.

The strongest permitted conclusion is:

**Integration Complete — Ready for Operator Verification**

The recommendation gate itself remains exactly:

Integration Complete

or:

Integration Incomplete

Do not claim:

* promotion complete;

* governed mode is live for the operator;

* default changed;

* production verified;

* operator verified.

---

## 36\. Success Criteria

Sprint 3.87 is complete when:

* all governing documents have been read;

* the selector exists and defaults to LEGACY;

* selector independence is proven;

* the production model adapter wraps the real provider boundary without new logic;

* production source acquisition is mapped;

* the Projection Ownership Integration Gate passes;

* the route does not become projection owner;

* genuine conversational lineage is created;

* ordinary chat uses no EOS identity;

* governed input is constructed through existing corrected functions;

* the existing projection composer is used;

* the existing model-invocation and validator pipeline is used unchanged;

* the authoritative execution record is produced;

* the governed discriminated response is returned;

* the Cassie route test passes end to end;

* invalid model output returns a safe envelope;

* legacy responses remain byte-identical;

* no silent fallback exists;

* all full validation passes;

* no promotion or operator-verification claim is made.

A valid Integration Incomplete outcome is also complete sprint execution where a real blocking condition is identified precisely and no unauthorised workaround is implemented.

---

## 37\. Completion Report

The completion report shall contain the following sections.

### Repository Precondition

Report:

* repository;

* branch;

* starting commit;

* working-tree state;

* required artefacts;

* source paths confirmed.

### Governing Artefacts Reviewed

List every governing document read.

### Sprint 3.80 Blocker Resolution

State:

* the identity blocker found by Sprint 3.80;

* how Sprints 3.81–3.86 resolved it;

* whether any original blocker remains.

### Projection Ownership Integration Gate

State exactly:

Passed

or:

Failed

If passed, provide the complete production source-to-composer mapping.

If failed, identify the exact missing governed shape and stop condition.

### Selector

Report:

* file path;

* semantics;

* default;

* invalid-value behavior;

* independence evidence.

### Production Chain

Describe the implemented chain from request to governed HTTP response.

Confirm the route orchestrates but does not derive projection evidence.

### Source Acquisition Mapping

Provide the required table:

| Projection area | Production source | Governed shape | Adapter behavior | Owner |
| :---- | :---- | :---- | :---- | :---- |

### Conversational Lineage

Report:

* thread creation/reuse;

* request identity;

* exchange identity;

* retry relationship;

* confirmation that these are not EOS identities.

### EOS Context

State whether ordinary chat currently has genuine EOS context.

Expected:

runId: absent  
sessionId: absent  
interfaceContractId: absent

Report any verifier behavior.

### Production Governed-Input Adapter

Describe:

* path;

* input;

* output;

* composer invocation;

* input-constructor invocation;

* prohibited responsibilities not assumed.

### Production Model Adapter

Describe:

* path;

* real provider boundary wrapped;

* translation performed;

* confirmation that no model/validation logic was duplicated.

### Route Integration

Describe:

* changed route structure;

* legacy branch;

* governed branch;

* response discriminants;

* error handling.

### Legacy Byte-Identity Proof

Report:

* fixture requests;

* pre/post response hashes;

* unset-mode equality;

* explicit-LEGACY equality;

* model-input equality;

* error-response equality.

### Cassie Integration Result

Report:

* route request;

* lineage identities;

* projection identity;

* governed input;

* EOS fields;

* claim statuses;

* model result;

* validator result;

* envelope type;

* execution record;

* HTTP response.

### Safe-Envelope Result

Report the adversarial model case and safe response.

### Persistence Boundary

State:

* repository adapter used;

* which commit ordering was exercised;

* whether persistence is durable;

* any remaining production-storage blocker.

### Client Compatibility

State:

* client consumer inspected;

* whether it required modification;

* exact legacy compatibility;

* governed envelope handling.

### Files Changed

List every new or modified file with one concise reason.

No silent file expansion is permitted.

### Protected Files

List pre/post hashes for:

lib/context-builder.ts  
lib/useAgentConversation.ts  
lib/agents/chat-execution.ts

and protected EOS files.

### Targeted Tests

Report exact targeted commands and results.

### Full Validation

Report exact results for:

npm test  
npm run build  
npm run lint  
npm run typecheck  
git diff \--check

### Execution Boundary

State explicitly that the evidence is repository-level only.

### Outstanding Findings

List:

* projection gaps;

* source-shape gaps;

* persistence limitations;

* client presentation gaps;

* live-provider uncertainties;

* work required before operator verification.

### Production Effect

State:

Sprint 3.87 preserves LEGACY as the default and does not promote the governed conversational runtime.

### Recommendation

Return exactly one:

Integration Complete

or:

Integration Incomplete

No other recommendation wording is permitted.

---

## 38\. Recommendation Gate

### Integration Complete

Use only when:

* the Projection Ownership Integration Gate passes;

* no evidence or projection ownership is recreated in the route;

* selector behavior is correct;

* legacy remains default;

* legacy responses are byte-identical;

* governed lineage is genuine;

* ordinary chat requires no EOS identity;

* the existing projection composer is used;

* the existing governed-input constructor is used;

* the existing model-invocation pipeline is used;

* the validator is unchanged;

* the Cassie route test passes;

* safe-envelope behavior passes;

* the authoritative execution record is produced;

* no silent fallback exists;

* full validation passes;

* the outcome is honestly limited to repository-level integration evidence.

### Integration Incomplete

Use if:

* production lacks an authorised source shape required by the composer;

* the route would need to derive canonical evidence;

* claim construction requires new governance;

* synthetic EOS identity remains necessary;

* the projection composer would need to be bypassed;

* client support requires a new ungoverned presentation contract;

* fail-closed persistence requirements cannot be met;

* legacy byte identity fails;

* the Cassie route cannot complete end to end;

* a protected governed semantic must change;

* a Sprint 3.82/3.85/3.86 decision must be reopened;

* full validation fails because of sprint-created changes.

If incomplete, report the exact blocker with the same precision as Sprint 3.80.

Do not force completion.

---

## 39\. Return Format

Return:

1. Repository Precondition result.

2. Governing artefacts reviewed.

3. Starting repository state.

4. Sprint 3.80 blocker-resolution finding.

5. Projection Ownership Integration Gate result.

6. Production source-to-composer mapping.

7. Selector implementation and independence proof.

8. Conversational lineage implementation.

9. EOS-context finding.

10. Production governed-input adapter.

11. Production model adapter.

12. Route integration.

13. Legacy byte-identity evidence.

14. Cassie route integration result.

15. Safe-envelope route result.

16. Execution-record result.

17. Persistence-boundary finding.

18. Client-compatibility finding.

19. Every changed file with one-line reason.

20. Protected-file blob hashes.

21. Targeted test results.

22. Full validation results.

23. Explicit statement that default remains LEGACY.

24. Explicit statement that no operator verification or promotion occurred.

25. Outstanding findings.

26. Recommended next sprint.

27. Final recommendation gate.

The final line must be exactly one of:

**Integration Complete**

or:

**Integration Incomplete**

---

## 40\. Expected Follow-On

If Sprint 3.87 returns:

**Integration Complete**

the next provisional sprint is:

Sprint 3.88 — Governed Conversational Runtime Operator Verification

Operator verification shall test:

* explicit CONVERSATIONAL\_RUNTIME\_MODE=GOVERNED;

* live route response;

* real source acquisition;

* real governed projection;

* real Claude behavior;

* visible evidence-status preservation;

* Cassie-style real questions;

* rollback to LEGACY;

* no impact on Dashboard or DAWNWATCH.

Promotion remains a later sprint.

If Sprint 3.87 returns:

**Integration Incomplete**

the next sprint shall address only the named blocker.

Do not skip directly to operator verification.

---

## 41\. Engineering Intent

Sprint 3.80 stopped because integration had no truthful identity foundation.

That foundation now exists.

Sprint 3.87 must not solve the old identity problem only to recreate an evidence-ownership problem in its place.

The live route is allowed to coordinate the governed architecture.

It is not allowed to become the architecture.

A successful integration therefore means more than:

* a selector exists;

* tests pass;

* Claude returns JSON;

* the Cassie example produces an answer.

It means the full production path preserves the ownership boundaries already governed:

source owners acquire evidence  
projection composer derives the governed projection  
input constructor preserves lineage and EOS context  
model invocation constrains model output  
validator controls acceptance  
execution record closes the exchange  
route returns the result

If the route cannot supply that chain honestly from the current production sources, the correct result is another precise stop.

If it can, Sprint 3.87 becomes the first real connection between JARVIS’s live conversational surface and the deterministic, evidence-governed architecture built underneath it—while keeping rollback immediate and legacy behavior unchanged.