# Sprint 3.186C — Morning Executive Orientation Production Calendar Composition

**Status:** Implementation for review  
**Baseline:** merged Sprint 3.186B / PR #507 (`9ed68060cbfe407bf78d2db79b9c94ac44d81917`)  
**Chat/runtime rendering changed:** No  
**Model boundary changed:** No  
**Calendar write authority changed:** No

## Purpose

Bind the closed Morning Executive Orientation v1 publication to the existing server-owned Calendar read authority and governed acquisition path without yet exposing the rendered brief through chat.

The proving phrase is deliberately narrow:

> **Give me my morning brief.**

## Proposal and authority

The Calendar proposal grammar now recognises only that exact Morning Brief request shape and creates:

- `capability = calendar.read`;
- `purpose = calendar_morning_brief`;
- one exact `this_week` acquisition window;
- one exact `today` composition sub-window resolved from the same server clock instant.

The proposal remains non-authoritative. Because the proving phrase does not explicitly authorise a Calendar read, the existing authority evaluator returns `ASK` and creates the normal opaque server-owned `PendingAuthorization`.

No Calendar connector is constructed before confirmation.

## Pending-state binding

The existing pending registry stores the whole proposed Calendar operation. For Morning Brief this now includes both:

- the complete weekly acquisition window;
- the exact today sub-window.

Confirmation resolves that stored operation. It does not recompute either window from a later clock.

## Single production acquisition

`calendar_morning_brief` uses the same bounded requested limit as governed weekly allocation: `100`.

After explicit confirmation, production performs one authorised `listBetweenWithCompleteness` weekly read. It does not perform a second hidden read for today.

The existing scoped acquisition adapter already derives from that one acquired event set:

- `factualEvents` through the governed factual Calendar projection;
- `weeklyAllocation` through the governed descriptive allocation publisher;
- completeness/coverage metadata.

## Production composition

`production-morning-executive-orientation.ts` consumes only those already-governed outputs.

It requires:

- source status `available`;
- coverage `bounded_complete_request`;
- the exact `this_week` acquisition window;
- the exact `today` sub-window;
- an observed timestamp;
- governed factual events;
- a governed weekly allocation.

It selects today's timed commitments deterministically by overlap with the stored today window and delegates final validation/construction to the Sprint 3.186B `assembleMorningExecutiveOrientationBrief` boundary.

If any required evidence is absent, partial or inconsistent, composition returns `null`.

## Production result

`resolveProductionCalendarRead` now carries:

- `purpose = calendar_morning_brief`;
- `morningBriefTodayWindow`;
- `morningBrief`.

`morningBrief` remains `null` during ASK/DENY/unavailable/partial states and becomes the structured v1 publication only after authorised complete acquisition and successful fail-closed composition.

## Deliberately not built

This sprint does **not**:

- import or call the Morning Brief renderer from `chat-handler.ts`;
- change `/api/lighter/chat` response behaviour;
- call a model;
- compare attention observations;
- claim no changes;
- inject continuity;
- use Gmail or Drive;
- assess priority, importance, urgency or adequacy;
- recommend or advise;
- create Calendar writes;
- activate the full EOS;
- add voice-specific behaviour.

## Falsification coverage

Tests prove:

1. the proving phrase proposes `calendar_morning_brief` but grants no authority;
2. exact `this_week` and `today` windows are bound at proposal time;
3. ASK performs zero acquisition;
4. confirmation retains the same server-owned windows;
5. exactly one weekly bounded acquisition is performed;
6. the Morning Brief acquisition uses limit `100`;
7. today is selected from the same governed weekly factual event set;
8. out-of-day events are excluded from the day section;
9. complete weekly evidence composes the closed v1 publication;
10. partial weekly coverage withholds the Morning Brief.

## Next bounded step

Production chat wiring and live acceptance remain separate.

The next milestone should make the existing `/api/lighter/chat` path:

`Give me my morning brief.` → ASK → explicit confirmation → existing 3.186C structured publication → existing 3.186B deterministic renderer → response

with no model participation and one live test at a time.