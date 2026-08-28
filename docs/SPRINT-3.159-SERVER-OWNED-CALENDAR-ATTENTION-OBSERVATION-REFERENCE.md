# Sprint 3.159 — Server-Owned Calendar Attention Observation Reference

**Status:** Contract + isolated implementation  
**Sprint type:** Production-ownership seam after Sprint 3.158  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.158 (`72cbac0d9c702e10e1f6a485518ddb7989adb6e7`)

## 1. Purpose

Sprint 3.158 completed the deterministic path from bounded Calendar change to safe conversational text.

The remaining production question is:

> Where does the previous authorised Calendar observation set live, and how can a later turn refer to it without making client state authoritative or silently reacquiring Calendar?

Repository inspection found that the live `/api/lighter/chat` transport does **not** currently carry a trustworthy production conversation/session identity suitable for ownership of private observation history.

Therefore Sprint 3.159 does **not** invent one.

## 2. Finding

The current lighter-chat request includes conversational messages, specialist identity and an opaque pending-authorisation reference.

It does not provide a server-verified:

- user id;
- conversation id;
- session id;
- durable thread owner.

Using any of the following as the owner of a prior Calendar observation would be unsafe or misleading:

- the raw client transcript;
- a client-supplied arbitrary session id;
- a process-global "last Calendar observation";
- model history;
- `PendingAuthorization`.

`PendingAuthorization` proves authority for one proposed operation. It is not a history/session identity and must not be repurposed.

This is an **implementation ownership gap**, not a failure of the frozen authority architecture.

## 3. Ownership decision

Sprint 3.159 introduces a server-owned, process-local observation registry with opaque references.

The pattern is:

```text
authorised Calendar observation set
        ↓
server-private registry
        ↓
opaque observation reference
        ↓
client may carry reference
        ↓
later server resolution
```

The client-carried reference contains no observation data and grants no Calendar authority.

Possessing or manufacturing a reference does not establish that any observation exists.

Resolution always consults module-private server state.

## 4. Distinction from authority

`CalendarAttentionObservationReference` is explicitly **non-authoritative**.

It cannot:

- authorise Calendar acquisition;
- replace explicit confirmation;
- create a Calendar read operation;
- widen an authorised window;
- reacquire Calendar;
- prove user identity;
- prove a conversation identity.

It only identifies previously stored canonical observation state inside the current server process.

A future live request that needs current Calendar state must still pass through the existing governed Calendar authority path before acquisition.

## 5. Contract

Implemented in:

`lib/lighter-jarvis/calendar-attention-observation-reference.ts`

Opaque transport shape:

```ts
type CalendarAttentionObservationReference = {
  calendarAttentionObservationReferenceId: string
}
```

Server-owned operations:

- `createCalendarAttentionObservationReference(set)`
- `resolveCalendarAttentionObservationReference(reference)`
- `rotateCalendarAttentionObservationReference({ previousReference, currentSet })`

## 6. Storage semantics

Storage is intentionally:

- module-private;
- process-local;
- non-durable;
- server-owned;
- canonical-observation-only.

No raw Calendar provider object is stored.

No title, description, location, attendee data or other undisclosed field is introduced.

Stored sets are cloned and frozen before retention. Resolved sets are cloned and frozen again before release to the comparison seam.

## 7. Rotation semantics

When a valid previous reference is rotated:

1. the previous server-owned entry is deleted;
2. the current canonical observation set is stored;
3. a new opaque reference is returned.

A fabricated/unknown previous reference cannot delete another entry.

Rotation is the intended bounded retention pattern for future live wiring.

This sprint does not yet wire rotation into `/api/lighter/chat`.

## 8. Why not a global "last observation"

A single process-global previous observation would create cross-conversation ambiguity.

Without a trustworthy owner key, it could cause one request to compare against state created by another request.

The opaque-reference pattern avoids that by requiring possession of a server-issued handle while still refusing to treat the handle itself as authority.

## 9. Why not use the transcript as history ownership

The transcript is client-carried conversational data.

It is valid input for conversational continuity, but it is not a trustworthy owner for private server-side observation state.

Deriving private-state ownership from transcript bytes would allow a caller to manufacture or replay ownership semantics.

Sprint 3.159 therefore keeps observation ownership outside model history.

## 10. Acceptance proof

Tests prove:

1. the client receives only an opaque identifier;
2. observation contents do not appear in the reference;
3. resolution uses server-owned state;
4. fabricated references resolve to null;
5. extra forged client fields are ignored;
6. malformed references fail closed without throwing;
7. resolved state is cloned and immutable;
8. valid rotation invalidates the previous reference;
9. fabricated prior references cannot prevent creation of new state;
10. the registry imports no connector/acquisition/model/history/authority mechanism.

## 11. Non-goals

Do not add:

- `/api/lighter/chat` wiring;
- Calendar acquisition;
- implicit Calendar authority;
- user/session authentication;
- durable database persistence;
- cross-process persistence;
- TTL policy;
- model history integration;
- Attention Brief rendering changes;
- UI;
- voice.

## 12. Resulting architecture

```text
previous authorised Calendar read
        ↓
CanonicalCalendarAttentionObservationSet
        ↓
server-owned opaque observation reference
        │
        │ later turn carries only opaque reference
        ↓
existing Calendar authority gate
        ↓
current authorised Calendar acquisition
        ↓
current canonical observation set
        ↓
resolve previous server state
        ↓
bounded comparison
        ↓
policy match
        ↓
Attention Brief
        ↓
deterministic renderer
        ↓
conversational reply
```

Only the **live wiring** between these already-proven seams remains.

## 13. Next question

Sprint 3.160 should ask:

> How should `/api/lighter/chat` carry the opaque Calendar observation reference through an explicit-authority turn, perform a current authorised read, compare against the referenced prior observation only when compatible, rotate the reference, and return deterministic attention text without giving the reference any authority semantics?

That is the first sprint where the live UI can legitimately become part of acceptance testing.
