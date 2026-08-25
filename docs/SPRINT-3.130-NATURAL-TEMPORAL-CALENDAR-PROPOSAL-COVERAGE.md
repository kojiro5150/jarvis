# Sprint 3.130 — Natural Temporal Calendar Proposal Coverage

- **Status:** Implemented
- **Date:** 25 August 2026

## Scope

The deterministic Calendar proposal recognizer accepts a bounded set of
high-precision personal-schedule questions for `today`, `tomorrow`,
`this morning`, `this afternoon`, `this evening`, and `this week`. Covered
forms include:

- “What’s on for tomorrow?”
- “What do I have tomorrow?”
- “What have I got tomorrow?”
- “What appointments do I have tomorrow?”
- “What’s scheduled tomorrow?”
- the corresponding supported today and daypart substitutions.

These phrases propose only the closed `calendar.read` operation. A proposal is
not authority: absent explicit current-utterance authority, the route returns
`ASK` and an opaque `PendingAuthorization` reference. Calendar acquisition can
start only when a later explicit confirmation carries that exact reference.
The reference is one-shot and is consumed by confirmation.

## Deliberate high-precision exception

“What’s happening tomorrow?” is intentionally not recognized. “Happening” can
refer to public events, news, general activity, or a personal schedule, so it
does not meet this recognizer’s high-precision personal-Calendar threshold.
It remains ordinary conversation rather than silently becoming a private-data
proposal. This is a precision boundary, not a grant to another capability.

## Route guarantees

Before confirmation, recognized natural schedule questions:

- do not call the conversational model;
- do not return a DAWNWATCH handoff;
- do not introduce Gmail scope; and
- do not construct or execute a Calendar connector.

After confirmation with the exact pending reference, only the bounded Calendar
read executes. Calendar evidence is formatted deterministically without being
sent to the model, and reuse of the consumed reference fails closed.

## Explicit non-scope

- no Gmail authority or acquisition;
- no DAWNWATCH routing or behavior change;
- no change to explicit Calendar authority evaluation;
- no broader semantic or model-based intent classification;
- no Calendar write capability.
