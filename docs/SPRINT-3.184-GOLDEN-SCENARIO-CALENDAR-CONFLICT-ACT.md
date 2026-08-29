# Sprint 3.184 — Golden Scenario 001: First Bounded Act Capability

**Status:** Architecture contract only. No Level-4 implementation claim.

## Purpose

Define the first **Act** proof after live Know, Understand and Advise passes.

User instruction:

> `Okay, do it.`

Act is the first Golden Scenario level that may change external state.

## Core invariant

> **A recommendation is not authority. A confirmation is not execution. A successful write is not completion until the external state is independently verified.**

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

## Current prerequisite gap

The live Google Calendar connector is currently read-only.

Current OAuth scope:

```text
https://www.googleapis.com/auth/calendar.readonly
```

The current connector exposes Calendar reads only.

Therefore the first real Act proof requires an explicit Calendar-write capability and a Google OAuth scope migration before a live write can succeed.

Act must not be represented as implemented or live-tested while the runtime still holds only `calendar.readonly`.

## OAuth scope migration

The first write-capable Google grant should add:

```text
https://www.googleapis.com/auth/calendar.events
```

while retaining the existing Gmail and Drive read-only scopes.

This scope migration requires fresh Google consent. Existing tokens do not gain write authority retroactively.

The UI must not claim Calendar write capability until the stored Google grant actually includes the required Calendar events scope.

Reconnect is therefore an expected one-time migration step for the first live Act test.

## Exact action supported

The first Act proof supports exactly one mutation:

> move the deep-work event referenced by the successful `CalendarAdviceReference` to the exact recommended candidate start/end.

No other mutation is admitted.

Not supported in this proof:

- accepting or declining the invitation;
- moving the invitation;
- creating a new event;
- deleting an event;
- changing title, description, attendees, recurrence, reminders, Calendar, label, colour or visibility;
- moving any event other than the exact recommended deep-work source event;
- choosing a different target slot.

## Advice continuity

`CalendarAdviceReference` is required to begin Act.

It preserves server-side:

- exact source deep-work canonical identity;
- exact recommended candidate start/end;
- full duration;
- recommendation type;
- preference kind;
- Advise-time observedAt.

The advice reference remains non-authoritative.

If it is absent, invalid or expired, Act fails closed and does not reconstruct the recommendation from rendered prose or model memory.

## User instruction is not final approval

The first natural instruction:

> `Okay, do it.`

means:

> construct and validate the exact mutation proposal from the eligible advice reference.

It does **not** authorize the Calendar write.

This distinction is deliberate because current state must be rechecked before the user confirms an exact operation.

## Typed mutation proposal

Conceptual server-owned proposal:

```text
CalendarMoveProposal
  capability: calendar.event.move
  source
    commitmentReference
    calendarId
    eventId
    expectedStart
    expectedEnd
  target
    start
    end
  durationMinutes
  adviceReference
  proposalObservedAt
```

The proposal is immutable and non-authoritative.

The client receives only an opaque `CalendarMoveProposalReference`.

Raw provider IDs and proposal internals remain server-owned.

## First current-state recheck — before exact confirmation

On `Okay, do it.`, JARVIS must perform a fresh authorised Calendar read before asking for final write confirmation.

The read must establish:

- the exact source deep-work event still exists by canonical identity;
- its current start/end still equal the recommendation assumptions;
- its governed `timeMode` is still `deep_work`;
- the exact candidate target interval is still free under complete bounded coverage;
- the target interval preserves the full duration.

If any relevant state differs:

- do not create an executable proposal;
- preserve Know and Advise history;
- report that current state changed;
- require a new recommendation from current state.

The old recommendation is stale, not retroactively false.

## Read authority for Act validation

Advice does not inherit Calendar read authority.

`Okay, do it.` does not silently authorize a read.

For this first proof JARVIS may therefore need to ask:

> `Please explicitly confirm that I may re-read your Calendar to validate the exact move before I ask for write approval.`

Only after explicit read confirmation may the first validation read occur.

## Exact write-confirmation prompt

After the first current-state recheck passes, JARVIS may present exactly one mutation:

For the live 7:00–8:30 PM → 8:30–10:00 PM scenario:

> `I can move the deep-work block from 7:00 PM–8:30 PM to 8:30 PM–10:00 PM. Please explicitly confirm this exact Calendar change.`

This prompt must be generated from the server-owned proposal.

It must not be model-authored.

## Pending write authority

The exact proposal is stored server-side behind an opaque pending write-authorization reference.

Final confirmation such as:

> `Yes.`

applies only to that exact proposal.

It does not grant standing Calendar write authority.

It does not authorize a changed event, changed target slot or alternate mutation.

Any materially different proposal requires fresh explicit confirmation.

## Immediate pre-write re-verification

After the exact confirmation is received and immediately before the Google write, JARVIS must re-read current state again.

This second recheck must prove:

- exact source identity still exists;
- source start/end still match proposal expectations;
- source remains `deep_work`;
- exact target slot remains free;
- complete bounded coverage still supports the availability claim.

If state changed after confirmation:

- consume/invalidate the confirmation;
- do not write;
- report current-state divergence;
- generate no silent replacement proposal;
- require a new recommendation/proposal/confirmation sequence.

## Write execution

Only after:

```text
eligible advice reference
→ fresh validation read
→ exact immutable move proposal
→ explicit exact confirmation
→ immediate pre-write re-read
→ deterministic proposal/current-state match
```

may the runtime call the Google Calendar write connector.

The first write operation must target the exact `calendarId` + `eventId` resolved from the canonical commitment identity.

The request may change only:

```text
start
end
```

to the exact proposal values.

All unrelated event fields must remain untouched.

## Google write semantics

The first provider operation should use one narrowly scoped event update against:

```text
PATCH /calendar/v3/calendars/{calendarId}/events/{eventId}
```

with only the new start/end payload required by the event's existing time representation.

A provider 2xx response is not sufficient for JARVIS to say `Done`.

## Post-write external verification

Immediately after the write, JARVIS must perform an independent Google Calendar read.

The verification must prove:

- the exact canonical source event still exists;
- its start equals the proposed target start;
- its end equals the proposed target end;
- duration remains unchanged;
- the provider-backed event identity is the same event;
- the read occurred after the write attempt.

The write response itself cannot serve as the verification read.

## Completion language

`Done` is permitted only after post-write verification succeeds.

Successful response:

> **Done — the deep-work block is now 8:30 PM–10:00 PM, verified against Google Calendar.**

The completion wording is deterministic.

The model does not originate execution truth.

## Verification failure

If the provider write returns success but the independent read does not verify the exact target state:

JARVIS must not say `Done`.

Permitted response:

> `The Calendar write was attempted, but I could not verify the exact final state, so I won't claim completion.`

This is an execution result requiring operator attention, not permission to retry silently.

## Provider failure

If Google rejects or fails the write:

- do not say `Done`;
- do not silently retry;
- report that the exact Calendar change was not completed;
- preserve the historical recommendation/proposal record.

## No model in authority or execution truth

The model may not:

- create the move proposal;
- select provider event identity;
- grant read authority;
- grant write authority;
- reinterpret `Yes` as approval for anything other than the exact pending proposal;
- decide whether pre-write state matches;
- decide whether the provider write succeeded;
- decide whether external verification passed;
- generate an alternate target slot after divergence.

## Historical/current-state invariant

Act has three distinct temporal records:

```text
Know observation
→ historical conflict truth

Advise observation
→ historical recommendation basis

Act validation / pre-write / post-write observations
→ current execution truth at each boundary
```

No later observation rewrites an earlier one.

## First live test state

For the next live proof, use a fresh Golden Scenario after the Act build.

Example:

```text
pending invite: 6:30–7:30 PM
deep work:     7:00–8:30 PM
candidate:     8:30–10:00 PM
```

After Advise succeeds, the user says:

> `Okay, do it.`

Expected progression:

```text
JARVIS
Please explicitly confirm that I may re-read your Calendar to validate the exact move before I ask for write approval.

USER
Yes.

JARVIS
I can move the deep-work block from 7:00 PM–8:30 PM to 8:30 PM–10:00 PM. Please explicitly confirm this exact Calendar change.

USER
Yes.

[immediate pre-write read]
[exact Google write]
[independent post-write read]

JARVIS
Done — the deep-work block is now 8:30 PM–10:00 PM, verified against Google Calendar.
```

## Required executable tests

Before live acceptance, tests must prove at least:

1. `Okay, do it.` requires an eligible advice reference;
2. rendered recommendation prose cannot recreate an absent advice reference;
3. expired advice reference fails closed;
4. `Okay, do it.` creates no write authority;
5. first Act validation requires fresh Calendar read authority;
6. previous read authority is not inherited;
7. exact source identity is resolved only from server-owned advice state;
8. exact provider calendarId/eventId are derived deterministically from canonical identity;
9. source event must still exist;
10. source start/end must still match recommendation assumptions;
11. source must still be governed `deep_work`;
12. exact target must still preserve duration;
13. exact target must be free under complete bounded coverage;
14. partial coverage cannot validate proposal;
15. first validation read creates one immutable move proposal only;
16. opaque proposal reference leaks no provider ID or times;
17. write-confirmation wording is deterministic from proposal;
18. write confirmation binds only to the exact proposal;
19. fabricated pending write reference fails closed;
20. consumed write confirmation cannot be replayed;
21. pre-write read occurs after exact confirmation;
22. pre-write changed source fails closed;
23. pre-write newly occupied target fails closed;
24. changed state consumes/invalidate prior confirmation;
25. no alternate target is silently generated;
26. write connector is unreachable before exact confirmation and successful pre-write recheck;
27. write connector receives exact calendarId/eventId;
28. write payload changes only start/end;
29. no model call is used to authorize or execute the write;
30. provider failure returns no `Done`;
31. provider success triggers an independent post-write read;
32. verification read must occur after write attempt;
33. verification requires same canonical source identity;
34. verification requires exact target start/end;
35. verification requires unchanged duration;
36. unverified provider success returns no `Done`;
37. only verified exact external state can produce `Done`;
38. completion sentence is deterministic;
39. successful Act mutates one event only;
40. invitation state remains untouched;
41. unrelated event fields remain untouched;
42. no standing Calendar write authority is created;
43. no recommendation is regenerated inside Act;
44. no model-originated event identity enters the execution path;
45. route-level test proves read ASK → validation → exact write ASK → confirmation → pre-write read → write → post-write read → Done;
46. route-level test proves divergence after confirmation prevents write;
47. live Google scope check fails closed when only `calendar.readonly` is granted;
48. OAuth migration test requires the write-capable Calendar events scope before write connector activation.

## Exit condition

Sprint 3.184 passes only when one real Golden Scenario can move through:

```text
verified recommendation
→ fresh current-state validation
→ exact immutable mutation proposal
→ exact human confirmation
→ immediate pre-write re-verification
→ one exact Google Calendar mutation
→ independent post-write Google read
→ verified exact target state
→ truthful Done
```

without inherited authority, stale execution, model-created execution truth or silent proposal substitution.

> **Act earns completion only after the external world proves it.**