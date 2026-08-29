# Sprint 3.183 — Golden Scenario 001: First Bounded Advise Capability

**Status:** Architecture contract only. No Level-3 implementation claim.

## Purpose

Define the first **Advise** proof after the live Know and Understand passes.

User intent:

> `What would you do?`

The proof is deliberately narrow: produce one recommendation only when the recommendation can be grounded in:

- the already-governed conflict;
- a fresh current Calendar read;
- one deterministic candidate slot;
- the exact duration of the deep-work block;
- one explicit user preference sufficient to choose the trade-off.

Advise is not Act.

## Core invariant

> **Availability is a fact. Recommendation is a judgment. They must remain different epistemic types.**

> **A recommendation may use authority-approved current evidence. It may not create authority to act on that recommendation.**

## Why the conflict alone is insufficient

The established conflict proves only that a pending invitation overlaps an existing deep-work block.

It does **not** establish:

- that the invitation matters more;
- that deep work matters more;
- that either event is protected;
- that either event should move;
- that a later slot is available;
- that moving the work block preserves the user's goals.

Therefore the question `What would you do?` cannot legitimately produce `keep the invitation` from the conflict alone.

If no explicit preference or policy supplies the missing trade-off rule, JARVIS must not recommend.

## First supported explicit preference

The first Advise implementation supports one bounded, user-supplied preference:

```text
prefer_keep_invitation_if_full_deep_work_preserved_later
```

Natural-language examples may include:

- `I'd rather keep the invitation if I can still get the full deep-work block in afterwards.`
- `Keep the invitation if you can preserve all the deep work later.`

The preference is not inferred from:

- accepting meetings in the past;
- Calendar titles;
- timeMode;
- model memory;
- generic productivity assumptions.

For this first proof the preference must be established explicitly in the current Advise interaction.

## Missing preference behaviour

If the user asks only:

> `What would you do?`

and no eligible explicit preference exists, JARVIS must not guess.

Permitted response:

> `I can give you a recommendation, but I don't yet have a legitimate basis for choosing which commitment should yield. If your preference is to keep the invitation when the full deep-work block can be preserved later, say so and I can evaluate that option.`

This is a Level-3 boundary response, not a recommendation.

No Calendar read is required merely to discover that the choice rule is missing.

## Current-state requirement

Once the explicit preference is established, Advise requires a **fresh Calendar read**.

The historical Know/Understand observation remains historically true, but it is not sufficient for current availability.

The existing Calendar reasoning reference grants no Calendar read authority.

Therefore:

```text
explicit Advise preference
→ typed advice intent
→ fresh Calendar read proposal
→ ASK
→ explicit user confirmation
→ ALLOW
→ current governed Calendar acquisition
```

No prior Calendar read authority is inherited.

## Current situation re-check

The fresh read must establish, by canonical identity, that the relevant current situation still supports the advice calculation.

At minimum:

- the pending invitation is still present;
- the deep-work block is still present;
- the deep-work block still has governed `timeMode: deep_work`;
- its current start/end are known;
- its current duration is deterministically computed;
- bounded Calendar coverage is complete for the candidate-slot window.

If the relevant current state has materially changed, JARVIS does not recommend from stale assumptions.

The earlier Know observation remains historically valid.

## First deterministic candidate slot

To avoid hidden ranking or open-ended schedule search, the first Advise proof evaluates exactly one candidate.

The candidate is:

> **the slot beginning immediately when the current deep-work block ends, with duration equal to the full current deep-work block duration.**

For the fixed live scenario:

```text
deep-work block: 6:00–7:30 PM
duration: 90 minutes
candidate slot: 7:30–9:00 PM
```

For the architecture-document example:

```text
deep-work block: 1:30–3:00 PM
duration: 90 minutes
candidate slot: 3:00–4:30 PM
```

This rule creates a candidate only. It does not recommend it.

## Candidate availability fact

The candidate is `free` only when a complete bounded current Calendar observation proves that no timed event overlaps the candidate interval.

Overlap is deterministic:

```text
event.start < candidate.end
AND
event.end > candidate.start
```

Touching boundaries do not conflict.

`candidate slot is free` is a governed factual claim.

It must carry:

- candidate start;
- candidate end;
- duration minutes;
- observedAt;
- complete coverage state;
- provenance/source references sufficient to audit the current Calendar observation.

A partial or bounded-incomplete read cannot support a `free` claim.

## Candidate-state outcomes

At minimum:

```text
free
occupied
current_situation_changed
insufficient_coverage
invalid
```

`occupied` does not automatically trigger search for another slot in the first proof.

That would widen candidate generation beyond the frozen scope.

## Exact model-visible Advise evidence

Only after current evidence and the explicit preference are established may one bounded recommendation call occur.

Model-visible projection:

```text
CalendarConflictAdviseEvidence
  currentConflict
    pendingInvitationPresent: true
    deepWorkPresent: true
    deepWorkDurationMinutes
  candidate
    start
    end
    durationMinutes
    availability: free
    observedAt
  userPreference
    kind: prefer_keep_invitation_if_full_deep_work_preserved_later
  provenance
    historicalConflictReference
    currentAvailabilityObservationReference
```

The model does not receive:

- event titles;
- Calendar names;
- provider IDs;
- organiser/attendee lists beyond the already-governed pending state needed upstream;
- arbitrary surrounding events;
- email or Drive;
- priority/urgency/importance;
- protected status;
- inferred goals;
- alternate candidate slots;
- action authority;
- mutation capability.

## Exact recommendation task

If all of the following are true:

- current conflict remains valid;
- deep-work duration is known;
- deterministic immediate-post-block candidate is free;
- explicit preference is `prefer_keep_invitation_if_full_deep_work_preserved_later`;

the bounded model may classify:

```text
recommendationType: keep_invitation_move_deep_work_to_candidate
```

The model may also return:

```text
recommendationType: insufficient_basis
```

No other recommendation type is admitted in the first proof.

## Closed output contract

Conceptual schema:

```text
CalendarConflictAdviseResult
  recommendationType:
    keep_invitation_move_deep_work_to_candidate
    insufficient_basis
  authorityEffect: none
```

The model does not generate:

- a different time;
- a different event;
- a mutation proposal;
- an approval state;
- execution instructions.

The runtime owns the exact candidate interval.

Any extra fields, alternate times, priority language, protected-work claims or authority effects fail closed.

## User-facing response

The response must separate fact from advice.

Permitted successful response shape:

> **Current Calendar fact:** `7:30–9:00 PM is free in the bounded current Calendar read.`

> **Recommendation:** `Given your preference to keep the invitation when the full deep-work block can be preserved, I'd keep the invitation and move the deep-work block to 7:30–9:00 PM.`

The exact wording may be made conversational, but the factual and advisory components must remain distinguishable.

## No recommendation when the candidate is not free

If the deterministic candidate is occupied:

JARVIS may say:

> `The immediate 90-minute slot after the deep-work block is not free, so I don't yet have a supported recommendation under this first advice rule.`

It must not silently search for, rank or recommend another slot.

## Historical versus current truth

Advise uses two temporal layers:

```text
historical Gate-K conflict
→ remains historically true

fresh Advise-time Calendar observation
→ controls current availability and current source-event state
```

A changed current Calendar does not invalidate the earlier Know pass.

## Recommendation reference for Act continuity

A successful recommendation must be preserved server-side behind an opaque, non-authoritative `CalendarAdviceReference`.

That record must preserve at least:

- recommendation type;
- exact source deep-work canonical identity;
- exact candidate start/end;
- deep-work duration;
- explicit preference kind;
- current evidence observedAt;
- provenance references.

The client receives only the opaque handle.

The recommendation reference is historical advice state, not current execution truth.

It grants no Calendar write authority.

Act must re-check current state independently.

## Recommendation reference lifetime

For conversational continuity, the first recommendation reference uses:

> **15 minutes or six subsequent user turns, whichever occurs first.**

Expiry prevents implicit continuation but does not rewrite the historical recommendation.

## Authority effects

None.

> **Advice creates no authority.**

A successful recommendation may not:

- authorize Calendar mutation;
- create an approved mutation;
- satisfy future confirmation;
- bypass current-state re-verification;
- imply `do it` is already authorized.

## Failure states

At minimum:

```text
missing_preference
ask_calendar_authority
current_situation_changed
insufficient_coverage
candidate_occupied
model_failed
model_invalid
resolved
```

No failure state may manufacture another candidate or inherit authority.

## Required executable tests

Before live acceptance, tests must prove:

1. bare `What would you do?` cannot recommend without an explicit preference;
2. missing preference triggers no Calendar acquisition;
3. explicit supported preference is typed without private evidence exposure;
4. preference interpretation cannot create Calendar authority;
5. Advise requests a fresh Calendar read even when Know/Understand references exist;
6. previous Calendar read authority is not inherited;
7. current read rechecks both relevant events by canonical identity;
8. changed/absent relevant event fails stale-current-situation rather than rewriting history;
9. deep-work duration is computed deterministically from current timestamps;
10. candidate start is exactly current deep-work end;
11. candidate duration exactly equals current deep-work duration;
12. touching event boundary does not occupy candidate;
13. positive overlap does occupy candidate;
14. candidate `free` requires complete bounded coverage;
15. partial coverage cannot publish `free`;
16. only one candidate is created;
17. no alternate-slot search occurs when candidate is occupied;
18. model receives only admitted Advise evidence;
19. model receives no titles or provider IDs;
20. model receives no arbitrary Calendar neighbours;
21. model receives explicit preference as preference, not source fact;
22. model may return only the two closed recommendation types;
23. model cannot invent another time;
24. model cannot create importance, urgency, priority or protected status;
25. model cannot create authority;
26. malformed/extra-field output fails closed;
27. model failure does not trigger another Calendar read;
28. factual availability and recommendation remain separate in the response;
29. successful recommendation creates one opaque CalendarAdviceReference;
30. opaque advice handle leaks no event identity, times or recommendation details;
31. advice reference is non-authoritative;
32. recommendation reference uses 15-minute/six-turn bounded continuity;
33. route-level test proves ASK → ALLOW fresh Calendar read before recommendation;
34. route-level test proves recommendation from current availability plus explicit preference;
35. no Calendar mutation function is reachable from the Advise resolver.

## First live acceptance sequence

After implementation, reuse a fresh Golden Scenario conflict and complete Understand first.

Then:

```text
YOU
What would you do?

JARVIS
I can give you a recommendation, but I don't yet have a legitimate basis for choosing which commitment should yield. If your preference is to keep the invitation when the full deep-work block can be preserved later, say so and I can evaluate that option.

YOU
I'd rather keep the invitation if I can still get the full deep-work block in afterwards.

JARVIS
Please explicitly confirm that I may read your Calendar to evaluate that option.

YOU
Yes.

JARVIS
Current Calendar fact: 7:30–9:00 PM is free.
Recommendation: Given your preference to keep the invitation when the full deep-work block can be preserved, I'd keep the invitation and move the deep-work block to 7:30–9:00 PM.
```

For the 1:30–3:00 PM architecture example, the candidate is 3:00–4:30 PM.

## Exit condition

Sprint 3.183 passes only when one real Golden Scenario can move through:

```text
historical governed conflict
→ explicit user trade-off preference
→ fresh authorised current Calendar read
→ deterministic single candidate
→ complete current availability fact
→ one bounded recommendation classification
→ fact/advice-separated response
→ opaque non-authoritative advice reference
```

without inventing preference, ranking alternatives, granting authority or entering Act.

> **Advise earns one recommendation of trust. Act starts from zero trust again.**