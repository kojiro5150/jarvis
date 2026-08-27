# Sprint 3.151 — Calendar provenance truthfulness across recall

## Baseline

This sprint was implemented from `ab3228b4972bc0bfa2eca40a217f67a8b3dddaa6`, which was both the current checkout and the locally available `main` baseline.

## Defect and provenance distinction

Sprint 3.150 correctly kept a prior `GovernedContext` out of future model context, but an ordinary follow-up could describe information repeated from a prior visible answer using language such as “I saw those times on your calendar.” That language falsely suggested a current Calendar read.

The only positive proof of current Calendar access remains a server-created, current-turn `GovernedContext` containing a `CalendarContextSource`. Current governed evidence permits current-source language, while reasoning remains limited to its closed projection and may not infer omitted metadata. Calendar facts present only in visible assistant prose are ordinary conversational recollection: they may be repeated, but must be attributed to the earlier response or result and are not authority.

Client fields such as `hasCalendarContext`, `currentCalendarEvidence`, `sourceState`, or `provenance` are not consulted. They cannot establish source state, authorize access, or affect the attribution decision.

## Presentation rules

With current governed evidence, concise language such as “Based on your calendar for tomorrow” or “Your calendar shows two commitments” is allowed. Without it, a bounded recollection should instead say “From the calendar result I reported earlier,” “In my previous response, I reported,” or “The times I gave you earlier were.” It must not say that JARVIS currently sees, just checked, saw, or identified information from Calendar.

The deterministic backstop is deliberately narrow. It requires all of the following:

1. no current Calendar `GovernedContext`;
2. a high-precision Calendar-recollection follow-up;
3. recognizable prior visible Calendar-report prose; and
4. a model response matching a Calendar-specific false-current-source form.

It rewrites only the provenance-bearing phrase and preserves useful answer content. It does not globally rewrite “I can see” or “I saw.” A narrow details follow-up is contained when the prior visible report supplied only schedule intervals: the response states that the earlier result contained times, not meeting details, rather than accepting invented titles or metadata.

## History, fresh reads, and non-authority

Ordinary visible assistant prose remains ordinary conversational history. This sprint does not turn it into governed evidence or standing authority, and does not introduce a provenance ledger or persistence. Existing private-release history boundaries remain unchanged.

A later fresh request such as “What’s on for tomorrow?” still enters the existing Calendar proposal and authority path, asks when required, and acquires only after confirmation. A recall-only follow-up remains on the ordinary model path and constructs no Calendar connector, creates no `PendingAuthorization`, and performs no acquisition. The classifier and history signal are presentation-only and cannot grant or reconstruct authority, suppress an ASK, or act as connector or memory evidence.

## Tests

Regression coverage verifies current-context language remains unchanged; recollection attribution retains times and counts; “I can see” Calendar claims are corrected; non-Calendar phrases are unchanged; recall constructs no connector; fresh reads still ASK; client spoofing is ignored; missing meeting metadata is not invented; and current governed context wins over prior history.

## Explicit non-goals

This sprint does not alter the Calendar projection, authority evaluator, proposal grammar, operation/window semantics, `PendingAuthorization`, connectors, OAuth, Gmail, Drive, Memory, specialist routing, voice transport, client contracts, `/api/chat`, legacy containment, root presentation selection, or the North Star. It adds no governed source, Calendar titles or writes, standing grants, persistent state, proactive acquisition, cross-source synthesis, generalized provenance framework, or semantic fact checker.
