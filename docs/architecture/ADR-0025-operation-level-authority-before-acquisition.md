# ADR-0025: Operation-Level Authority Before Private Acquisition

- **Status:** Accepted
- **Date:** 2026-08-25
- **Owner:** JARVIS Architecture
- **Scope:** Private-data authority, acquisition ordering and production migration
- **Governing baseline:** `docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md`

## Context

JARVIS has accumulated strong deterministic governance machinery across specialist coordination, governed conversational claims, content retrieval policy, source evidence publication and capability routing.

However, the live legacy conversational and briefing paths still contain eager private-data acquisition. On `main`, `buildOperationalState()` concurrently invokes Memory, Calendar, Gmail and Drive loaders. Those loaders may call private connectors before a specific operation has been adjudicated for the current user purpose.

This produces a structural mismatch:

```text
legacy path
request
  ↓
buildOperationalState()
  ↓
Memory + Calendar + Gmail + Drive acquisition
  ↓
reasoning / presentation
```

The frozen authority architecture requires:

```text
target path
request
  ↓
ProposedOperation
  ↓
Authority Engine
  ↓
resource policy
  ↓
capability availability
  ↓
authorized acquisition only
  ↓
governed evidence / canonical state
  ↓
reasoning / presentation
```

The issue is not that private connectors exist or that canonical state is undesirable. The issue is that acquisition authority and state assembly are currently fused in legacy paths.

## Decision

JARVIS shall move to **operation-level authority before private acquisition**.

Every private authority-requiring operation must be represented explicitly and adjudicated independently before the relevant private connector or acquisition adapter is invoked.

The model may propose an operation. The proposal is not authority evidence.

A positive user-authority decision must arise only from an admissible authority evidence class defined by the North Star. Resource policy may further prohibit or restrict an otherwise authorized operation, but policy admissibility alone must not manufacture user authorization.

## Architectural ordering

For private operations, the canonical ordering is:

```text
ProposedOperation
      ↓
USER AUTHORITY
      ↓
RESOURCE POLICY
      ↓
CAPABILITY AVAILABILITY
      ↓
EXECUTION / ACQUISITION
      ↓
EVIDENCE
```

The following states must remain distinct:

- authorization exists;
- resource policy permits processing;
- a connector/capability is available;
- execution succeeds;
- governed evidence is produced.

No one state may substitute for another.

## Per-operation adjudication

Authority is adjudicated independently per operation.

Example:

```text
calendar.read → ALLOW
gmail.search  → ASK
drive.read    → ASK
```

A single allowed operation must not cause unrelated private reads to ride along through a broad context builder.

## Current implementation anchor

The first isolated implementation is `lib/lighter-jarvis/calendar-read-authority.ts`.

It establishes a closed `ProposedOperation` for `calendar.read`, evaluates the raw current user utterance independently, records immutable explicit-utterance evidence for `ALLOW`, and defaults to `ASK` when explicit authority is not established.

This implementation is intentionally isolated. It does not invoke connectors and therefore does not yet make the production runtime compliant with this ADR.

## Existing acquisition machinery to reuse

The governed Calendar acquisition path already exposes `CalendarAcquisitionPort` and `acquireGovernedCalendarEvidence()` in:

`lib/governed-conversation/calendar-evidence-acquisition-adapter.ts`

The next Calendar integration step must gate this existing seam. It must not invent a parallel Calendar acquisition abstraction.

Expected proof:

```text
AuthorityDecision = ASK or DENY
→ acquireGovernedCalendarEvidence() not invoked
→ CalendarAcquisitionPort.listUpcoming() not called

AuthorityDecision = ALLOW
→ governed Calendar acquisition may run
```

## OperationalState migration

`OperationalState` may remain temporarily as a legacy presentation/acquisition aggregate while migration proceeds.

`buildOperationalState()` must not become the new Authority Engine and must not be placed behind a single broad authorization decision, because it currently acquires multiple private sources together.

The target is to separate:

1. authorized source acquisition; and
2. state assembly from already-authorized evidence.

Conceptually:

```text
AUTHORIZED ACQUISITION
Calendar / Gmail / Drive / Memory evidence
            ↓
STATE ASSEMBLY
            ↓
Operational or canonical state publication
```

This ADR does not require an immediate rewrite of the `OperationalState` type. It requires acquisition authority to move upstream before production paths depend on private source content.

## Connector status

Connector authentication, stored credentials and availability are not operation authority.

Status observation should not itself trigger private content acquisition where a status-only path is available.

The architecture must preserve the distinction:

```text
Is the connector authenticated?
Is the capability available?
Is this specific operation authorized for this purpose?
```

## Named and standing grants

Named grants and standing grants are future positive authority sources defined by the North Star.

They must be explicit, bounded, inspectable and revocable. They must not be inferred from repeated usage or model confidence.

A future `BRIEF_ME_GRANT` may authorize a bounded set of read operations for constructing the requested brief. Until such a grant exists, the legacy behaviour of reading Calendar, Gmail, Drive and Memory together must not be described as v0.1-compliant authority behaviour.

## Pending authorization

A future `PendingAuthorization` shall bind a user confirmation to one exact proposed operation and scope.

Bare confirmation without a valid pending authorization shall not create authority.

## Relationship to existing governed-conversation machinery

This ADR composes with, rather than replaces, existing deterministic machinery:

- claim-boundary recognition provides a proven bounded deterministic recognition pattern;
- governed Calendar evidence acquisition provides an existing acquisition seam;
- Gmail content-retrieval policy provides mature resource-policy enforcement;
- agent coordination provides an existing deterministic bounded-authority pattern.

These mechanisms are related precedents but are not themselves the operation-level Authority Engine.

## Historical documents and supersession

Historical sprint specifications, audits and ADRs are not rewritten by this decision.

They remain evidence of the architecture and implementation state at the time they were accepted.

Where an older document assumes eager private acquisition, blanket monitoring, persistent named-specialist user interaction or another authority model that conflicts with the v0.1 North Star, this ADR and the v0.1 North Star govern future implementation.

## Consequences

### Positive

- private-data access becomes independently auditable;
- model reasoning cannot manufacture execution authority;
- connection and authorization are kept separate;
- ambiguous language fails closed to `ASK`;
- capability expansion cannot inherit authority transitively;
- existing governed acquisition and policy machinery can be reused.

### Cost

- legacy runtime paths require staged migration;
- some previously frictionless eager reads will require explicit grants or confirmation;
- operation vocabularies and grant stores must be introduced deliberately;
- state assembly must eventually consume authorized evidence rather than acquire everything itself.

## Rejected alternatives

### Treat connector connection as authority

Rejected. OAuth consent and stored credentials establish technical access, not purpose-bound user authority.

### Treat read-only operations as inherently safe

Rejected. Private read access can disclose sensitive information and therefore remains authority-requiring.

### Let model confidence infer consent

Rejected. Probabilistic interpretation is not admissible authority evidence.

### Put one authority decision in front of `buildOperationalState()`

Rejected. The builder currently fans out to multiple private sources, violating per-operation non-transitivity.

### Create a second Calendar acquisition layer

Rejected. The existing governed Calendar acquisition adapter is the correct seam to gate.

## Migration sequence

The intended migration sequence is:

1. isolated `calendar.read` authority adjudication — **implemented**;
2. authority-gated governed Calendar acquisition;
3. deterministic `PendingAuthorization`;
4. live conversational Calendar integration;
5. separate private acquisition from legacy state assembly;
6. extend operation-level authority to Gmail, Drive and Memory;
7. implement bounded named/standing grants, including briefing authority;
8. complete one-JARVIS user-facing migration and retire authority-bypassing legacy paths.

Progress is tracked in `docs/AUTHORITY-MIGRATION-STATUS.md`.
