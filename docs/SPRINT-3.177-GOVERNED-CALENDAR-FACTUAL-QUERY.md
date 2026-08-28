# Sprint 3.177 — Governed Calendar Title Projection & Deterministic Factual Query

**Status:** Implemented
**Baseline:** merged Sprint 3.176

## Nadler problem

> What human cognitive burden are we removing?

Remove the low-value burden of opening Calendar, scanning multiple calendars, visually locating the right event, and reconstructing basic schedule facts that can be answered safely from provider evidence.

Initial accepted questions:

- `What are my next 5 meetings?`
- `When is my next LLEGC meeting?`
- `What time is the interview on Tuesday?`

## Boundary

`CalendarEvent.title` has existed at the connector layer, but governed Calendar model context has deliberately excluded title text.

Sprint 3.177 does **not** cross that boundary.

Title may enter a closed server-owned factual projection for deterministic matching and deterministic presentation. It must not enter governed model context, ordinary model history, semantic classification, priority inference, authority reasoning, or write logic.

## Deterministic factual projection

The factual projection contains only:

- `title`
- `start`
- `end`
- `calendarName`

It deliberately excludes provider IDs, label IDs, `timeMode`, status, recurrence metadata, attendee state, and raw provider objects.

Only timed events are published into this factual surface.

## Query grammar

The sprint adds a closed deterministic parser for:

- next 1–5 timed Calendar events
- next named meeting by title-token match
- named event on a specified weekday by title-token match

Matching is normalized token matching, not semantic interpretation.

`When is my next LLEGC meeting?` becomes an AND-token query for `llegc` + `meeting`, allowing a provider title such as `LLEGC September Meeting` to match without model inference.

## Authority and acquisition

All factual queries still propose `calendar.read` and require fresh explicit Calendar authority.

The exact factual selector is retained inside the server-owned pending operation.

Factual queries use a bounded 100-event next-seven-days read. Publication of a factual answer requires `bounded_complete_request`; partial or legacy bounded acquisition withholds the answer.

## Selection

- `next_events`: chronological deterministic selection, maximum 5
- `next_title_match`: earliest deterministic match
- `title_match_on_weekday`: deterministic title-token + Melbourne weekday filter
- equal earliest named matches fail closed as ambiguous
- multiple same-weekday matches fail closed as ambiguous

## Rendering

Replies are built entirely by deterministic server code.

Hard acceptance condition:

`expect(model).not.toHaveBeenCalled()`

Adversarial regression:

`title = "URGENT Board Crisis — Deep Work"`

Even where the source event has `timeMode = routine`, the renderer may surface the provider title but must not fabricate `Priority: urgent`, `Mode: Deep Work`, category, urgency, or any other title-derived judgment.

## Model-history boundary

Deterministic factual Calendar releases are treated as governed private releases and replaced with the existing private-result placeholder before any later ordinary model turn.

This means title may be visible to the user without becoming model-visible on a later conversational turn.

The same boundary now explicitly recognizes current- and next-week deterministic allocation releases as private Calendar output.

## Deferred semantic-title boundary

A future capability that genuinely requires interpretive matching over title text or prior conversational context — for example:

> What meetings next week relate to the governance work we discussed?

is a new model-exposure boundary.

That capability must not place Calendar title text into model context until it has a dedicated instruction boundary, deterministic reply guard, and regression suite preventing title-derived fabrication of mode, priority, category, urgency, or other unsupported attributes.

That guard is deliberately **not** built in Sprint 3.177 because the model is structurally absent from the factual-query path.

## Non-goals

- no semantic title matching
- no title-based `timeMode` classification
- no priority or urgency inference
- no meeting-quality judgment
- no adequacy scoring
- no Calendar writes
- no model-generated factual Calendar reply

## Exit condition

`basic factual Calendar question` → closed proposal → fresh authority → bounded complete acquisition → server-owned title projection → deterministic selector → deterministic renderer → user-visible answer, with title never entering model context.