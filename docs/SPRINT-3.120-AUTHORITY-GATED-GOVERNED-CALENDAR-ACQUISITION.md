# Sprint 3.120 — Authority-Gated Governed Calendar Acquisition

- **Status:** Implemented in isolation
- **Date:** 25 August 2026
- **Scope:** `calendar.read` authority-to-acquisition composition only

## Objective

Compose the PR1 `calendar.read` authority evaluator with the existing governed
Calendar acquisition seam so private Calendar acquisition occurs only after an
`ALLOW` decision.

## Implemented boundary

`lib/lighter-jarvis/calendar-read-authorized-acquisition.ts`:

1. evaluates the existing closed `calendar.read` proposed operation against the
   raw current user utterance;
2. returns immediately for `ASK` or `DENY`, publishing no source evidence;
3. invokes the existing `acquireGovernedCalendarEvidence()` function only for
   `ALLOW`;
4. retains the authority decision separately from acquisition results.

The implementation reuses `CalendarAcquisitionPort`. It creates no connector,
Calendar acquisition port or Calendar evidence publisher abstraction.

## Verification

Tests prove:

```text
explicit current-user Calendar read → ALLOW → governed acquisition may run
ambiguous current utterance          → ASK   → connector is not called
DENY decision                        → DENY  → connector is not called
```

## Explicit non-scope

This sprint does not:

- change production chat or conversational routing;
- change `OperationalState` or its legacy acquisition behaviour;
- introduce pending authorization, named grants or standing grants;
- change the PR1 authority policy or evidence vocabulary;
- broaden authority to Gmail, Drive, Memory or Calendar writes.

## Migration status

The isolated `calendar.read` acquisition gate is complete. Production Calendar
routing through this gate remains incomplete and must be delivered separately.
