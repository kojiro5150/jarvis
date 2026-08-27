# Sprint 3.154 — Governed Evidence to Canonical Attention Observation Contract

**Status:** Contract + isolated implementation  
**Sprint type:** One named missing seam from Sprint 3.153  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.153 audit (`4055e8a71e05e5b268b8bd164a6721f949275c8f`)  
**Primary proving source:** governed Calendar evidence

## 1. Purpose

Sprint 3.153 found the earliest missing Executive Cognition seam:

```text
already-authorised governed Calendar evidence
→ ?
→ canonical attention observation
```

The existing EOS `CalendarProjectionAdapter` cannot own this transition because it owns a Calendar connector and performs acquisition through `listUpcoming()`. Reusing it after the governed conversational route has already acquired Calendar evidence would either reacquire the source or disguise already-acquired evidence behind a connector-shaped wrapper.

This sprint governs and implements only the missing semantic boundary.

## 2. Scope-discipline rule

The output contract must contain only fields demonstrated necessary for the first attention capability.

For the proving case of a commitment start-time change, the necessary observation is:

- stable commitment identity;
- observed start timestamp;
- bounded end timestamp already present in the governed evidence;
- explicit observation time;
- timezone;
- source reference;
- provenance reference;
- coverage boundary;
- disclosure policy reference.

No other field earns inclusion.

## 3. Critical contract decision

Do **not** map governed Calendar evidence directly into `OperationalCommitment` in this sprint.

`OperationalCommitment` currently requires fields including:

- `title`;
- `kind`;
- `status`;
- `roleIds`;
- `projectIds`.

The governed conversational Calendar evidence publication intentionally exposes schedule interval metadata and does not carry those semantics.

Populating the full canonical commitment would therefore require one or more of:

- title invention;
- status invention;
- role/project invention;
- reacquisition from the connector;
- disclosure widening.

All are prohibited.

The correct output is a smaller observation contract whose fields are completely supported by the already-governed evidence.

## 4. Contract

Implemented in:

`lib/governed-conversation/calendar-attention-observation.ts`

```ts
interface CanonicalCalendarAttentionObservation {
  id: string
  startsAt: string
  endsAt: string
  observedAt: string
  timezone: string
  sourceReference: GovernedSourceReference
  provenanceReference: string
  coverageLimit: string
  policyReference: string
}
```

The observation identifier is the existing governed `commitmentReference`.

No parallel synthetic identity is created.

## 5. Transformation

`projectGovernedCalendarAttentionObservations()`:

- accepts only an existing array of `GovernedCalendarEvidenceInput`;
- performs no connector call;
- performs no source acquisition;
- validates stable identity and RFC 3339 timestamps;
- rejects unavailable evidence;
- rejects duplicate commitment identity;
- rejects reversed intervals;
- copies only allow-listed evidence-backed fields;
- orders output deterministically by stable id;
- freezes the output and source references.

It does not:

- add a title;
- infer scheduled/cancelled status;
- infer role/project association;
- infer priority;
- infer urgency;
- infer meaning;
- rank observations;
- compare observations;
- create snapshots;
- call the Attention Engine;
- persist state;
- render conversation.

## 6. Why this is not another pipeline stage

This contract is not an attempt to restore the historical EOS pipeline under a new name.

It is the minimum semantic translation demanded by the real question:

```text
governed evidence
→ stable comparable observation
```

The next architecture decision must still be driven by the capability need.

This sprint does not imply that the full `SituationalAwareness` / `OperationalCommitment` model must sit on the eventual production path if doing so would require unsupported fields.

## 7. Isolated acceptance proof

Tests must prove:

1. an already-governed Calendar evidence record maps to one minimal observation;
2. the governed commitment identity is preserved directly;
3. source/provenance/policy/coverage references survive;
4. no title, status, role or project fields appear;
5. duplicate identity fails closed;
6. unavailable evidence fails closed;
7. malformed timestamps fail closed;
8. reversed intervals fail closed;
9. ordering is deterministic;
10. output is immutable.

## 8. Production non-goals

Do not modify:

- `/api/lighter/chat`;
- Calendar authority;
- PendingAuthorization;
- Calendar connector calls;
- Calendar disclosure policy;
- GovernedContext;
- EOS runtime;
- `OperationalCommitment`;
- Situational Awareness lifecycle;
- Attention Policies;
- snapshot persistence;
- Attention Brief;
- voice;
- UI.

No production caller is added in this sprint.

## 9. Resulting architecture state

After this sprint:

```text
governed Calendar acquisition
        ↓
governed Calendar evidence
        ↓
CanonicalCalendarAttentionObservation   ← proven isolated seam
        ↓
previous/current observation ownership  ← still missing
        ↓
change detection
        ↓
Executive Attention
        ↓
Attention Brief                         ← still missing
```

This closes only Blocker 1 from Sprint 3.153.

## 10. Next question

The next sprint should not automatically wire this observation into the full EOS runtime.

It should govern the second missing seam:

> **Who owns the previous canonical attention observation, and under what compatibility rules may two observation sets be compared?**

That is a snapshot/history ownership question, not a reasoning question.
