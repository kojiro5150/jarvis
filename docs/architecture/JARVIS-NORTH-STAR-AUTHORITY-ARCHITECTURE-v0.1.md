# JARVIS North Star & Authority Architecture v0.1

- **Status:** Frozen architectural baseline
- **Version:** 0.1
- **Date:** 25 August 2026
- **Owner:** JARVIS Architecture
- **Scope:** Product identity, authority, private-data acquisition and governed capability execution

## Purpose

This document defines the architectural North Star for JARVIS authority and product behaviour.

It is intentionally concise. Detailed implementation history belongs in sprint specifications, audits and ADRs. This document states the governing invariants that future implementation must satisfy.

Where historical repository documents conflict with this document on authority, acquisition or user-facing specialist behaviour, the historical documents remain accurate records of the architecture at the time they were written but are superseded by this baseline for future development.

## Product North Star

JARVIS is one persistent intelligence with one coherent user-facing identity.

The user should be able to speak naturally to JARVIS without knowing which internal component, specialist, engine or capability performs the work.

Internal specialist machinery may remain where it provides useful behavioural or domain boundaries. It must not require the user to understand or manually coordinate an internal cast of named AI colleagues.

**UX test:** if a user must know that an internal specialist exists in order to ask JARVIS naturally, the product boundary has failed even if the internal governance is otherwise correct.

JARVIS should be composed, highly competent, economical, non-sycophantic, evidence-conscious, comfortable disagreeing, proactive when useful and quiet when not.

## Constitutional authority rule

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

A model-proposed operation is never evidence of authorization for that operation.

The architecture therefore separates three questions:

```text
JARVIS
What would help?
        ↓
PROPOSED OPERATION
        ↓
AUTHORITY ENGINE
Is there independent authority?
        ↓
ALLOW / ASK / DENY
        ↓
CAPABILITY
Can the permitted operation be performed under its evidence, policy and failure contract?
        ↓
RESULT
```

Reasoning may be probabilistic. Authority adjudication must be deterministic and independently evidenced.

## Authority is non-transitive and non-inheritable

Authorization for one operation, resource, capability, turn or result never constitutes authorization for another unless an independent applicable authority source explicitly provides it.

Examples:

- `gmail.read` does not authorize `gmail.send`.
- `drive.read` does not authorize `drive.share`.
- `calendar.read` in one turn does not automatically authorize `calendar.read` in a later unrelated turn.
- A public search result that suggests another private source might be useful does not authorize access to that private source.
- A model's explanation of why an operation would help does not authorize that operation.

Every new authority-requiring operation returns to adjudication.

## Admissible authority evidence classes

The Authority Engine may consider only the following evidence classes. No other evidence class may manufacture authority.

### 1. Explicit utterance evidence

Deterministic, high-precision recognition against the **raw current user utterance**.

The recognizer is intentionally incomplete. Ambiguity must not be converted into authority.

Examples:

```text
"What's on my calendar tomorrow?"
→ explicit calendar.read evidence

"How does tomorrow look?"
→ no explicit calendar.read evidence
→ ASK if JARVIS proposes calendar.read
```

Conversation history may inform reasoning but is not a substitute for current authority evidence.

### 2. Named capability grants

A deliberately defined operation bundle bound to a named user-requested purpose or trigger.

A named grant must have an explicit and inspectable footprint. It must not mean "whatever context JARVIS finds relevant".

Conceptual example:

```text
BRIEF_ME_GRANT
  calendar.read
  gmail.search/read
  drive.search/read
  memory.read
```

The grant applies only to the bounded purpose for which it was established and does not authorize unrelated writes or later unrelated reuse.

### 3. Standing grants

Persistent, inspectable and revocable authority deliberately established by the user.

Standing grants must never be inferred from repeated behaviour, historical usage, convenience or model confidence.

### 4. Pending authorization confirmation

A deterministic confirmation bound to one exact previously proposed operation.

A bare confirmation such as `yes` has no authority meaning unless a valid `PendingAuthorization` exists. Confirmation consumes only the bound pending operation; authority does not spill into other operations.

### 5. Resource policy

Hard deterministic system policy that may prohibit, restrict or elevate an operation regardless of user or model intent.

Resource policy is not symmetric with positive user authority. A policy result such as `external_processing_permitted` means the resource is policy-admissible if otherwise authorized; it must not by itself manufacture user authorization.

## ALLOW / ASK / DENY

Authority is adjudicated per proposed operation.

- **ALLOW** — independent applicable authority exists and no applicable policy prohibits the operation.
- **ASK** — the operation may be useful, but applicable authority has not been established.
- **DENY** — an applicable hard rule prohibits the operation or requires refusal rather than clarification.

Default behaviour under ambiguity is **ASK**, not inferred consent.

An authorized operation cannot carry unauthorized operations with it.

## Public and private acquisition

"Read-only" is not an authority classification.

Public informational acquisition and private-data acquisition are different governance classes.

Private acquisition includes sources such as Calendar, Gmail, Drive and other private documents or accounts. Private acquisition requires purpose-bound authority before the source is invoked.

**Connection status is not authority.** OAuth consent, connector availability and stored credentials indicate that an operation may technically be possible; they do not establish authority for a specific purpose or turn.

## Authority, policy, availability and execution are distinct

For private operations, the system must keep at least these states separate:

```text
A. USER AUTHORITY
May JARVIS perform this operation for this purpose?

B. RESOURCE POLICY
Is this resource/content permitted under applicable policy?

C. CAPABILITY AVAILABILITY
Can the connector or capability technically perform it?

D. EXECUTION RESULT
Did the authorized, permitted operation actually succeed?
```

Execution requires the relevant authority and policy conditions to be satisfied and the capability to be available.

Authorization must not be inferred from policy admissibility, connector availability or execution success.

## Authority before acquisition

Private data must not be acquired merely because a downstream model or state builder might find it useful.

Target order:

```text
raw current utterance / typed user intent
        ↓
ProposedOperation
        ↓
Authority Engine
        ↓
resource policy
        ↓
capability availability
        ↓
AUTHORIZED ACQUISITION
        ↓
governed evidence / canonical state
        ↓
reasoning and presentation
```

This supersedes legacy eager-acquisition patterns for future architecture.

## Canonical state and acquisition

Canonical state models may remain valuable. Authority to populate them must exist upstream of acquisition.

State assembly and private acquisition must not remain fused when that fusion causes one authorized source to trigger unrelated private reads.

The target distinction is:

```text
AUTHORIZED ACQUISITION
        ↓
STATE ASSEMBLY
        ↓
CANONICAL STATE
```

not:

```text
STATE BUILDER
        ↓
fetch whatever it needs
```

## Voice equivalence

Voice and typed interaction must produce the same authority result for equivalent user language.

A transcription channel is an input transport, not an authority source. The fact that speech was transcribed does not strengthen or weaken authority.

## Canonical adversarial cases

The following are architectural regressions and must remain testable:

### Explicit read

```text
current utterance: "What's on my calendar tomorrow?"
proposed operation: calendar.read
→ ALLOW
```

### Ambiguous request

```text
current utterance: "How does tomorrow look?"
JARVIS proposes calendar.read
→ ASK
→ Calendar connector not called
```

### Prior-context inheritance attack

```text
calendar mentioned earlier
current utterance: "What should I do?"
JARVIS proposes calendar.read
→ ASK
```

### Bare confirmation without pending authority

```text
current utterance: "yes"
no PendingAuthorization
→ no operation becomes authorized
```

### Exact pending confirmation

```text
PendingAuthorization(calendar.read, bounded scope)
current utterance: "yes"
→ only that exact pending operation may become authorized
→ pending authorization consumed
```

### Non-transitive capability expansion

```text
authorized operation yields useful evidence
model proposes an additional private operation
→ additional operation returns to adjudication
```

## One-JARVIS capability orchestration

The user-facing architecture is:

```text
USER ↔ JARVIS
```

Internally, JARVIS may use governed capabilities for evidence retrieval, market intelligence, adversarial reasoning, engineering, operational projection, writing, research and other bounded functions.

Internal capability names do not themselves confer authority and should not become a user coordination burden.

Historical named specialist machinery may be retained, refactored or retired according to implementation needs. The product direction is one coherent JARVIS identity.

## Current implementation status at v0.1 freeze

This section is descriptive, not normative, and must be kept synchronized with `docs/AUTHORITY-MIGRATION-STATUS.md`.

Implemented on `main`:

- isolated deterministic `calendar.read` authority adjudication;
- raw-current-utterance explicit authority evidence;
- `ALLOW | ASK | DENY` decision vocabulary;
- immutable positive authority evidence for explicit Calendar reads;
- fail-closed `ASK` behaviour for ambiguity, prior-context cases, negation and mixed read/write wording;
- existing governed Calendar evidence acquisition machinery;
- existing deterministic governed-conversation claim-boundary machinery;
- existing Gmail content resource-policy machinery.

Not yet implemented as a complete production authority path:

- authority-gated Calendar acquisition;
- general `PendingAuthorization`;
- named grants;
- standing grants;
- `BRIEF_ME_GRANT`;
- general multi-operation Authority Engine;
- authority-before-acquisition migration for Gmail, Drive and Memory;
- removal of eager private-data acquisition from legacy `buildOperationalState()` paths;
- complete one-JARVIS user-facing migration.

## Change control

This document is frozen at v0.1.

Implementation discoveries should first be classified as:

1. implementation implication;
2. policy gap; or
3. architectural failure.

Only a genuine architectural failure should require a new North Star version. Implementation work must not silently edit constitutional meaning to fit existing code.
