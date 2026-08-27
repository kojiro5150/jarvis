# Sprint 3.151a — Calendar live provenance containment

## Purpose

This post-merge correction contains two presentation defects observed in production after Sprint 3.151:

1. recall-only replies could say “I saw … on your calendar for tomorrow” or “the calendar information I saw,” despite having no current Calendar `GovernedContext`; and
2. schedule-only containment could discard an explicit meeting detail that the user had supplied in visible conversation.

The authority architecture behaved correctly in both cases. No connector ran during recall, no current governed evidence existed, and a fresh Calendar request still entered the existing authority flow. The defect was solely how ordinary model output represented visible conversational history.

## Recollection language containment

Without current Calendar `GovernedContext`, narrowly Calendar-qualified claims in these families are historically attributed:

- “I saw [time blocks, commitments, or these times] on/in your calendar for tomorrow …”;
- “I identified [the same bounded items] on/in your calendar for tomorrow …”; and
- “The calendar information/result I saw [showed] …”.

This is not a global rewrite of “I saw.” References to a previous message, pasted text, a note, or ordinary understanding remain unchanged. With current governed Calendar evidence, legitimate current-source wording remains unchanged.

## User-supplied conversational detail

Visible details explicitly supplied by the user remain ordinary conversational evidence. For example, “My 10 AM meeting is the project review” may be reused on a later detail follow-up, attributed to what the user said earlier. It must not be represented as Calendar evidence.

The deterministic schedule-only response remains fail-closed when the visible report contains only intervals and the user supplied no explicitly timed meeting detail whose normalized 12-hour clock time matches an interval start in the most recent recognizable report. It blocks model-invented titles. A matching statement such as “My 10 AM meeting is the project review” can prevent the canned response from erasing bound information; an unrelated time, a generic untimed detail, or a match found only in an older report cannot. This is not semantic entity resolution, fuzzy temporal reasoning, or a provenance database.

## Invariants

- Recall never constructs or acquires a connector and never creates authority.
- Prior visible Calendar prose is recollection, not current evidence or hidden metadata.
- A fresh read request still requires `ASK` under the unchanged Calendar authority semantics.
- Client-provided provenance-like fields cannot create current `GovernedContext`.

## Non-goals

This sprint does not change Calendar proposal grammar, authority evaluation, `calendar.read`, read windows, pending authorization, connector construction/acquisition, governed projection, OAuth, Gmail, Drive, Memory, voice, client contracts, `/api/chat`, legacy containment, operational state, specialist routing, branch governance, or the North Star. It introduces no new capability sprint.
