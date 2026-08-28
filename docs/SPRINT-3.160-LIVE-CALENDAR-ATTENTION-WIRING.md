# Sprint 3.160 — Live Calendar Attention Wiring

**Status:** Production wiring implemented  
**Sprint type:** First live end-to-end attention path  
**Baseline:** merged main after Sprint 3.159 (`bffa18fe489fab2e2e2091a5d6e498fb6e6f9557`)

## 1. Purpose

Sprints 3.154–3.159 proved each bounded seam independently:

```text
governed Calendar evidence
→ canonical observation
→ previous/current comparison
→ deterministic attention policy
→ bounded Attention Brief
→ deterministic conversational renderer
→ server-owned opaque prior-observation reference
```

Sprint 3.160 wires those seams into the live `/api/lighter/chat` path for the first time.

The proving user question is:

> **What needs my attention?**

## 2. Bounded meaning of the question

This sprint does **not** claim to answer all possible meanings of “attention”.

For this proving path, the phrase means:

> perform a bounded check of **today's authorised Calendar observation** for same-identity commitment **start-time changes** relative to the previous compatible authorised baseline.

No other source or attention policy is implied.

The operation carries `purpose: "calendar_attention"` only as a non-authoritative presentation intent. Its capability remains:

`calendar.read`

## 3. Authority remains unchanged

The initial question does not itself grant Calendar authority.

The live sequence is:

```text
YOU: What needs my attention?
JARVIS: Please explicitly confirm that I may read your Calendar.
YOU: Yes.
```

Only the existing server-owned `PendingAuthorization` resolution may turn that proposal into an `ALLOW`.

The attention-purpose marker:

- does not grant authority;
- does not bypass confirmation;
- does not widen the Calendar window;
- does not alter the capability;
- does not acquire data.

## 4. Why the window is “today”

The existing attention comparison requires compatible coverage.

A rolling “next seven days from now” window changes on every request and therefore cannot truthfully be compared under the current exact-coverage invariant.

Sprint 3.160 therefore maps the exact proving phrase to the existing deterministic `today` Calendar window.

Within the same Melbourne-local day, repeated authorised checks have stable bounds.

Across a day boundary, the old and new coverage differ. The path rotates the baseline and says it cannot compare the incompatible windows.

## 5. First authorised check

When no valid prior observation reference exists, the current authorised Calendar evidence becomes the baseline.

The deterministic response is:

```text
I have established a bounded Calendar baseline for today. A later authorised check can compare against it for start-time changes.
```

The response also returns a new opaque:

`calendarAttentionObservationReference`

The client retains only that opaque reference.

It does not receive stored observation contents.

## 6. Later authorised check

On a later request, the client may carry the opaque observation reference alongside the independently governed authority turn.

After a new Calendar read is explicitly authorised:

1. the server resolves the old observation reference against server-owned state;
2. the current governed evidence is projected into a canonical observation set;
3. previous/current sets are compared;
4. only the start-time attention policy is selected;
5. a bounded Attention Brief is published;
6. the deterministic renderer produces the reply;
7. the old observation reference is rotated to the new current baseline.

The observation reference is never treated as authority.

## 7. Example changed-start response

```text
A Calendar commitment changed start time from 2026-08-28T01:00:00.000Z to 2026-08-28T01:30:00.000Z.
```

No model is used.

No Calendar title is disclosed.

No priority, urgency, severity, cause, recommendation or action is inferred.

## 8. Example no-match response

```text
No Calendar start-time changes matched this bounded check.
```

This does not mean:

- nothing needs attention;
- nothing important happened;
- no action is required;
- the Calendar is conflict-free.

It means only that the currently implemented deterministic start-time policy produced no match.

## 9. Incompatible baseline

If the previous and current bounded Calendar windows are incompatible, the server does not force a comparison.

It rotates to the current baseline and responds:

```text
I have a current Calendar baseline, but the previous baseline covered a different bounded window, so I cannot compare them.
```

## 10. Live transport

The JARVIS client now carries two conceptually separate opaque references:

- `pendingAuthorizationReference` — server-owned operation authority workflow;
- `calendarAttentionObservationReference` — non-authoritative prior-observation state.

They are not interchangeable.

The observation reference is retained by the client across the ASK/confirmation sequence and is updated only when the server returns a new observation reference.

## 11. Model boundary

The attention route returns before ordinary conversational model invocation.

Tests prove the model is not called for:

- initial authority ASK;
- baseline establishment;
- later start-time comparison.

The user-facing response is deterministic.

## 12. Acceptance proof

Tests cover:

1. “What needs my attention?” proposes `calendar.read` with `purpose: calendar_attention`;
2. the proposal maps to the stable `today` window;
3. the question itself receives `ASK`, not `ALLOW`;
4. no acquisition occurs before explicit confirmation;
5. attention purpose survives the server-owned pending-authority turn;
6. first authorised read establishes an opaque baseline;
7. provider title is not disclosed;
8. a later authorised read compares against the server-owned baseline;
9. a start-time change renders deterministically;
10. zero matches use bounded wording;
11. incompatible windows rotate rather than force comparison;
12. the observation reference rotates after a successful current read;
13. the model is not invoked in the live attention path.

## 13. Manual UI acceptance test

After this branch is running locally:

1. ask JARVIS: **What needs my attention?**
2. verify JARVIS asks permission to read Calendar;
3. answer **Yes**;
4. verify JARVIS says it established today's bounded baseline;
5. change the start time of an existing event in today's Google Calendar without changing its event identity;
6. ask again: **What needs my attention?**
7. verify JARVIS asks permission again;
8. answer **Yes**;
9. verify JARVIS reports the old and new start timestamps and does not invent title, priority, urgency, cause, recommendation or action.

## 14. Non-goals

Sprint 3.160 does not add:

- proactive/background Calendar monitoring;
- durable observation persistence;
- cross-device observation history;
- user/session authentication;
- event titles to governed attention output;
- added/removed event attention policies;
- end-time-only attention;
- conflict detection;
- priority ranking;
- recommendation;
- autonomous action;
- model-generated attention prose.

## 15. Result

For the first time, the real everyday question:

> **What needs my attention?**

has a live, authority-gated, deterministic, end-to-end proving path in JARVIS.

Its meaning is deliberately narrow and explicit rather than broader than the evidence architecture can support.
