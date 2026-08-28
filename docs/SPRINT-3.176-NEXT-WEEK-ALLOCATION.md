# Sprint 3.176 — Next-Week Allocation

**Status:** Implemented
**Sprint type:** Bounded temporal extension
**Baseline:** merged Sprint 3.175

## Purpose

Adds `next_week` to the closed governed Calendar period vocabulary so `How is next week allocated?` follows the same authority, completeness, arithmetic, and deterministic-rendering path as `this_week`.

Before this sprint, that utterance fell outside the Calendar proposal boundary and could fall through to ordinary model/handoff handling.

## Bounded window

`next_week` resolves to next Monday 00:00 through the following Monday 00:00 in `Australia/Melbourne`, using the existing civil-time/DST-safe boundary logic.

For Friday 28 August 2026 the exact window is Monday 31 August 00:00 through Monday 7 September 00:00 Melbourne time.

## Proposal and authority

`How is next week allocated?` proposes `calendar.read` with `purpose = calendar_weekly_allocation` and `period = next_week`.

It grants no authority. Fresh explicit Calendar confirmation remains required, and the server-owned pending operation preserves the exact next-week bounds and purpose.

## Weekly acquisition bound

Ordinary Calendar reads keep the existing five-event bound. Weekly allocation reads use a bounded maximum of 100 events.

This is required because a normal week can contain five broad day-job blocks plus specific carve-outs. The larger request bound does not weaken completeness: partial acquisition, continuation, target failure, or merge truncation still withholds weekly publication.

## Publication and rendering

The governed `calendar_weekly_time_allocation` publication now permits the closed weekly set `this_week | next_week` and carries the period explicitly.

Arithmetic and coverage truth are unchanged: mode minutes plus semantic-unavailable minutes must reconcile to resolved occupied time, and coverage must be `bounded_complete_request`.

The deterministic renderer reuses the same fixed mode rows and changes only the heading to `Next week's resolved Calendar allocation:` for `next_week`. No model participates.

## Real-pattern regression

The live-path regression models five Barwon Health 09:00–16:00 routine blocks plus a one-hour self-care event nested inside Monday.

Expected result: 34h routine + 1h self-care = 35h total, not 36h. The test uses six events, proving the weekly path is no longer accidentally constrained by the generic five-event bound.

## Frozen invariants

1. `next_week` is a closed governed Calendar period.
2. It resolves Monday-to-Monday in Australia/Melbourne.
3. Fresh explicit Calendar authority is still required.
4. The pending operation preserves exact bounds and purpose.
5. Weekly allocation is bounded to at most 100 events.
6. A larger bound does not manufacture completeness.
7. Partial acquisition still withholds publication.
8. Sprint 3.173 overlap precedence is unchanged.
9. Sprint 3.174 arithmetic and coverage truth gates are unchanged.
10. Sprint 3.175 deterministic rendering remains model-free.
11. No adequacy judgment, recommendations, or Calendar writes.

## Exit condition

`How is next week allocated?` → governed `next_week` window → fresh authority → bounded complete weekly acquisition → overlap-resolved allocation → governed publication → deterministic next-week rendering.