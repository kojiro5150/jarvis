# Sprint 3.58.1 — Legacy Operational State Data Corrections

## Status and boundary

**Status: Complete.** Work began only after the Dashboard Presentation Contract became governed and
authoritative. This correction is confined to the legacy `OperationalState`, legacy chat context,
and the `/api/operational-picture` alias. It does not change `ExecutiveStateSnapshot`, the Executive
Operating System runtime, canonical publication, Dashboard migration, ADR-0007, or a governed
presentation contract.

## Observation 1 — relative dates

### Root cause and evidence

The legacy `/api/chat` route constructs `OperationalState`, converts it to text with
`buildContextBlock`, and appends that block to the model system prompt. Before this correction the
block included the next calendar commitment but supplied no current instant, current date,
timezone, or explicit value for tomorrow. Consequently relative dates were left to model inference
while a calendar weekday was the only concrete temporal context. This supports contextual
inference—and makes calendar influence possible—but does not claim that a particular opaque model
execution can prove which token caused its answer.

### Correction and validation

The context builder now computes an explicit UTC reference time, today, and tomorrow in code. It
includes ISO dates and weekday names and directs the model not to infer relative dates from calendar
commitments. The reference time is injectable for deterministic tests. With a reference time of
`2026-07-30T18:45:00.000Z`, tomorrow is always rendered as `2026-07-31 (Friday)`, even when the next
calendar event is on Tuesday. Previously the prompt contained only that Tuesday commitment and no
deterministic relative-date answer.

## Observation 2 — `updatedAt`

### Root cause and evidence

`buildOperationalState` assigned `updatedAt` from `memory.updatedAt`. The seed memory deliberately
initialised that persistence timestamp with `new Date(0).toISOString()`, and no write had replaced it
in the observed environment. This was neither a serialization failure nor failed date construction:
the operational-picture builder copied the wrong timestamp responsibility from persisted memory.

### Correction and validation

The builder now captures `new Date().toISOString()` after its inputs finish loading, so `updatedAt`
represents construction of that operational picture. A clock-controlled test demonstrates that a
seeded epoch memory timestamp produces the current construction timestamp instead. Direct requests
to `/api/operational-picture` therefore return the request's freshly assembled picture time rather
than the Unix epoch.
