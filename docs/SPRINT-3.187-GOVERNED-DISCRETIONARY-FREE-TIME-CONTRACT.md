# Sprint 3.187 — Governed discretionary free-time contract

Status: frozen for implementation

Amended 2026-09-08: weekend opt-in uses a separately user-authored Saturday–Sunday 8:00 AM–6:00 PM envelope. The weekday record remains append-only and unchanged.

## Purpose

Answer the closed request “Do I have any free time this week?” only by combining two independently bounded inputs:

1. a current, conversation-visible, explicitly user-authored discretionary work-availability preference; and
2. a complete authorised Google Calendar read for the exact Melbourne-local week.

Neither input is sufficient alone. Calendar non-occupancy is not availability outside the explicit envelope, and a remembered envelope is not evidence that a time is unoccupied.

## Closed v1 query grammar

The deterministic grammar admits:

- `Do I have any free time this week?`
- `Do I have any free time this week? I need to do some more testing on JARVIS.`
- either form with `, including the weekend` immediately after `this week`.

The query proposes `calendar.read` with purpose `calendar_free_time`. It never grants authority. If the utterance does not independently establish Calendar-read authority, the existing exact confirmation ceremony applies.

## Preference admission

The preference is read from the stable `conversation` durable projection only after Calendar authority succeeds. V1 admits only a current `recoverable_user_continuity` item that:

- has `authorshipSource = user`;
- has semantic class `preference`;
- has an exact `{ statement: string }` payload; and
- deterministically parses as: `my discretionary work-availability window is Monday to Friday, 6:00 PM to 9:00 PM. Weekends are excluded by default and included only when I explicitly request them.`

Weekend inclusion additionally requires a current user-authored preference that deterministically parses as: `my discretionary weekend work-availability window is Saturday and Sunday, 8:00 AM to 6:00 PM.` It supplements rather than replaces the weekday statement. Missing or conflicting weekend preference state fails closed only for a query that explicitly includes the weekend.

Case, Unicode compatibility, and whitespace may be normalised; meaning may not be inferred. No model selects or interprets the preference. Identical duplicate statements may agree. Distinct admitted envelopes conflict and fail closed. Missing, rejected, malformed, model-authored, non-current, or conflicting preference state produces no availability answer.

## Calendar proof

The Calendar read is bounded to `this_week`, uses the existing server-owned pending operation, and requests up to 100 events. A free-time result may be published only when acquisition status is `available` and coverage is `bounded_complete_request`.

Every governed Calendar schedule interval intersecting an admitted daily envelope is conservatively occupied. Overlaps and adjacency are merged before subtraction. Floating-date/all-day intervals occupy each intersecting envelope day. Invalid or unprovable inputs fail closed; absence under partial or legacy-bounded coverage never proves free time.

## Deterministic calculation

- Time zone: `Australia/Melbourne`.
- Default envelope: Monday–Friday, 6:00 PM–9:00 PM.
- Weekend envelopes are included only when the admitted query explicitly requests them and the separate weekend preference is established; Saturday and Sunday use 8:00 AM–6:00 PM.
- Past time is never offered. Each envelope is clipped to the calculation clock.
- Busy intervals are clipped to each envelope, merged, and subtracted.
- Every positive-length remainder is retained; v1 invents no minimum-duration preference.
- Results are chronologically ordered and contain only calculated start/end instants.

## Rendering

The renderer reports “available discretionary time,” identifies the remembered envelope and Melbourne time, lists exact remaining intervals, and states whether weekends were excluded. It must not expose raw memory JSON, Calendar provider identifiers, hidden metadata, or model synthesis. If no interval remains, it says so without claiming broader personal availability.

## Fail-closed outcomes

Missing/conflicting preference, unavailable/partial Calendar evidence, invalid calculation inputs, or an unsupported utterance produce a bounded explanatory refusal. They must not fall through to ordinary-model inference about private availability.

## Acceptance proof

Tests must prove closed grammar, retained pending-operation intent, exact preference admission, rejection of non-user and conflicting state, complete-coverage enforcement, overlap merging, all-day blocking, DST-safe Melbourne envelopes, past clipping, weekend opt-in, deterministic rendering, and live handler containment.
