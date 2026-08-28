# Sprint 3.180 — Governed Conversational Intent Architecture

**Status:** Architecture contract for implementation  
**Baseline:** Frozen JARVIS North Star authority architecture + Sprint 3.179 grammar family

## Problem — Nadler

> **What human cognitive burden are we removing?**

JARVIS currently makes the user carry too much of the translation burden between natural intent and machine-recognisable capability grammar.

The user should not need to know:

- which internal capability can answer a question;
- which deterministic phrase shape activates that capability;
- whether Calendar, Gmail, Drive, public web, memory, or another evidence source is the right route;
- which internal specialist exists;
- which exact syntactic formulation preserves the governed path;
- how authority, acquisition, provenance, and evidence publication are implemented.

The burden to remove is:

> **The burden of translating human intent into system syntax, remembering where information lives, and manually orchestrating the governed steps required to move from a question to a truthful answer or action.**

## Product objective — Tony Stark/JARVIS aspiration

The user expresses intent naturally.

JARVIS carries the burden of translating that intent into one or more typed, governed operation proposals.

The user should experience:

```text
USER
"What am I working on next for JARVIS?"

        ↓

JARVIS
understands the request shape
identifies what capability/evidence could answer it
asks for authority only where required
retrieves only authorized evidence
answers from governed evidence
```

The user must not have to learn an internal command language.

This does **not** mean the model becomes the authority engine or the source of truth.

## Constitutional boundary

The frozen North Star remains unchanged:

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

Sprint 3.180 adds a product-side companion:

> **The human should express intent naturally. JARVIS carries the burden of translating that intent into governed operations without transferring the governance burden back to the human.**

And a truthfulness constraint:

> **Conversational fluency may increase. Evidentiary standards do not decrease with it.**

## Architectural separation

Natural-language interpretation and governed execution are distinct.

Target pipeline:

```text
RAW CURRENT USER UTTERANCE
        ↓
CONVERSATIONAL INTENT INTERPRETER
        ↓
TYPED INTENT CANDIDATE
        ↓
DETERMINISTIC ADMISSIBILITY / SCHEMA VALIDATION
        ↓
CAPABILITY PROPOSAL
        ↓
AUTHORITY ENGINE
        ↓
ALLOW / ASK / DENY
        ↓
AUTHORIZED ACQUISITION
        ↓
GOVERNED EVIDENCE / CANONICAL STATE
        ↓
EVIDENCE-BOUND REASONING / SELECTION
        ↓
TRUTHFUL RESPONSE
```

The interpreter may reduce linguistic burden.

It may not collapse the layers beneath it.

## Core invariant

> **The model may interpret what the user appears to want and propose typed operations. It may not create authority, private evidence, execution success, or factual results.**

A model-produced intent candidate is untrusted input to deterministic server validation.

## Generalized intent contract

Sprint 3.180 moves beyond Calendar-specific phrase recognition toward a capability-neutral intent envelope.

Conceptual shape:

```ts
type ConversationalIntentCandidate =
  | {
      kind: "capability_request";
      capability: ApprovedCapability;
      operation: ApprovedOperation;
      subjectTerms?: readonly string[];
      temporalConstraint?: ApprovedTemporalConstraint;
      requestedOutput?: ApprovedOutputShape;
    }
  | {
      kind: "ordinary_conversation";
    }
  | {
      kind: "unsupported";
      reasonClass?: ApprovedUnsupportedClass;
    };
```

This is illustrative until implementation types are frozen.

The model may select only values from server-owned closed enums and schemas.

It cannot invent a capability name, permission, resource identifier, provider ID, evidence class, policy decision, or execution result.

## Deterministic-before-adaptive

Existing high-confidence deterministic routes remain first.

Examples:

- exact governed commands;
- established high-precision Calendar Level-1 queries;
- explicit Gmail or Drive commands;
- pending-authorization confirmation;
- hard denial / policy forms.

The interpreter is for linguistic flexibility where deterministic parsing has not already resolved the request.

It must not override a deterministic interpretation.

## Capability selection

JARVIS may infer **which governed capability would be useful** from the user's current request.

Examples:

```text
"What's my next meeting?"
→ candidate: calendar.read

"Find the document about the JARVIS architecture."
→ candidate: drive.search

"Will it rain in Geelong tomorrow?"
→ candidate: public weather / public web information

"Summarize the email from Rachel."
→ candidate: gmail.search/read sequence
```

Capability selection is not authority.

For private capabilities, the selected operation still returns to the Authority Engine.

Public informational capabilities remain governed by their own availability, provenance, and evidence contracts.

## Current-utterance authority boundary

The interpreter may use broader conversational context for **meaning resolution only when a future context contract explicitly permits it**.

Authority evidence remains separately adjudicated.

Conversation history must never become implicit permission merely because it helped resolve a pronoun or topic.

Examples:

```text
Earlier: "Look at my calendar tomorrow."
Later: "What about Friday?"
```

Context may eventually help interpret what “Friday” refers to.

It does not automatically authorize a new Calendar read for Friday.

## Private semantic evidence boundary

Sprint 3.180 does not automatically authorize unrestricted model access to private titles, email bodies, Drive content, or other private evidence for semantic matching.

There are two distinct interpretation problems:

### A. User-intent interpretation

"What is the user asking JARVIS to do?"

This may be model-assisted before private acquisition.

### B. Private-evidence semantic interpretation

"Which private item does the user's concept refer to?"

This requires a separately governed exposure boundary.

Example:

```text
"When am I next doing something on JARVIS?"
```

Understanding that this likely requires semantic inspection of Calendar titles is an intent problem.

Determining which Calendar event is “something on JARVIS” is a private-evidence semantic problem.

Sprint 3.180 must not collapse A and B.

## Authority UX

JARVIS should ask for authority at the moment a useful private operation has been identified, not ask the user to formulate an authority-specific command.

Desired experience:

```text
USER
"When am I doing something on JARVIS next?"

JARVIS
"I can work that out from your Calendar. May I read the relevant Calendar window?"
```

The authorization prompt is server-owned presentation of a pending typed operation.

The model must not manufacture a permission prompt.

A bare `yes` remains meaningless unless a valid server-owned pending authorization exists.

## Evidence-bound answer contract

After authorization, evidence acquisition and factual publication remain governed.

The answer must be derived from:

- authorized source(s);
- bounded acquisition;
- explicit completeness state where required;
- validated evidence projection;
- approved deterministic or evidence-bound reasoning;
- provenance retained outside ordinary model invention.

The model may phrase an answer where the evidence contract permits it.

It may not introduce unsupported private facts.

## Failure behaviour

The system should fail at the narrowest layer that actually failed.

### Intent unresolved

JARVIS may ask a natural clarification or return an unsupported interpretation response.

It must not pretend the relevant capability is unavailable if the actual problem is unresolved intent.

### Authority missing

ASK through the server-owned authority path.

### Capability unavailable

State the capability limitation truthfully.

### Evidence incomplete

Withhold factual certainty according to the source contract.

### No matching evidence

Say no matching evidence was found.

Do not convert “no match” into a positive prior commitment.

### Public/non-private question

Do not route into a private capability merely because words such as `next` or `again` are present.

## Grammar freeze

Sprint 3.178/3.179 remains as a deterministic compatibility and safety layer.

The deterministic grammar family is a **closed high-confidence fast path, not an extensible natural-language coverage strategy**.

After 3.179d — and especially after 3.180d — parser expansion is maintenance/safety work only. Natural-language growth must not proceed by adding one regex, morphology rule, or synonym for every newly observed paraphrase.

A new deterministic phrase is justified only when it is:

1. a high-confidence stable command surface;
2. required to close a verified authority/evidence/provenance/factual-truthfulness defect; or
3. demonstrably cheaper and safer than adaptive interpretation for a closed form.

Convenience paraphrase coverage alone is not meaningful product progress. Otherwise the request belongs to governed conversational intent interpretation:

```text
natural language
→ bounded interpretation
→ typed intent
→ deterministic governance
```

## Cognitive-burden success test

Every 3.180 implementation increment must answer:

> **What user cognition does this remove?**

Valid burden reductions include:

- remembering exact command syntax;
- knowing which capability owns a task;
- knowing which private source contains the answer;
- coordinating multiple internal specialists;
- translating natural wording into machine grammar;
- remembering which step requires authorization;
- distinguishing availability from authority;
- manually tracking which evidence supports which answer.

Work that only supports another isolated phrase without reducing one of these burdens should not be treated as meaningful 3.180 progress.

## Acceptance principles

Sprint 3.180 is successful only if all of the following remain true.

### Natural phrasing

Materially different paraphrases of the same supported intent can converge on the same typed operation without hand-adding each phrase.

### Authority independence

Equivalent model interpretations do not change the authority standard.

### No authority manufacture

A model-produced candidate never becomes execution authority.

### No evidence manufacture

The model cannot answer private facts before authorized acquisition.

### Public/private separation

A public question such as weather does not become a Calendar query.

### Context non-transitivity

Conversation context can help interpret meaning but cannot silently carry authority.

### Provenance integrity

An older governed result cannot be reassigned to a later contained or unrelated query.

### Voice equivalence

Equivalent spoken and typed requests resolve to the same typed intent and authority outcome, modulo transcription differences.

### User-facing simplicity

The user does not need to know the internal specialist, connector, authority engine, grammar, or operation schema.

## Initial implementation sequence

### 3.180a — Capability-neutral typed intent envelope

Introduce closed server-owned types for conversational intent candidates and deterministic validation.

No new private evidence exposure.

### 3.180b — Capability selection for public vs private informational requests

Prove that weather/public information and Calendar/private information route to distinct typed proposals from varied natural language.

No execution widening.

### 3.180c — Private-operation authority handoff

Bind validated private capability proposals into the existing server-owned pending-authorization architecture.

No model-generated permission UX.

### 3.180d — Evidence-bound completion

Prove that authorized acquisition and answer publication remain source-bound and that unsupported model facts are rejected or deterministically corrected.

### 3.181 — Private Evidence Reasoning Contract

**3.181 owns the private semantic-exposure boundary.**

Only after that explicit exposure contract is designed may JARVIS semantically inspect private Calendar titles, Gmail content, Drive content, or other private evidence to answer conceptual queries such as “something on JARVIS”.

Successful acquisition is not permission for model visibility. No 3.180 selector, authority handoff, result renderer, specialist handoff, or ambient context builder may silently widen the evidence boundary.

3.181 must define purpose, evidence class, representation, item/time bounds, provenance, freshness, persistence, cross-source permissions, allowed reasoning, and prohibited authority effects before Level 2 semantic reasoning begins.

This is not silently included in 3.180a–d.

## Non-goals

- no standing grants inferred from convenience;
- no authority from conversation history;
- no unrestricted private-data context for the interpreter;
- no model-created provider IDs or resource handles;
- no model-generated execution success;
- no removal of deterministic policy or authority gates;
- no semantic Calendar-title exposure by implication;
- no general “agent can use whatever tools it thinks useful” permission model;
- no requirement that the user learn internal capability names.

## Architectural test

The target experience should satisfy both sentences simultaneously:

> **JARVIS understands what I mean without making me speak like a machine.**

and

> **JARVIS still cannot touch private evidence or claim facts without the required independent authority and evidence.**

If an implementation improves one by weakening the other, it is not Sprint 3.180.
