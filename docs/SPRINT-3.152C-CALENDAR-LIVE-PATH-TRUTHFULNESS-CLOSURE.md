# Sprint 3.152c — Calendar live-path truthfulness closure

## Baseline

**OBSERVED:** This sprint starts from merged main `67e7e2ff4640b591aaa888c57ee3e03619155584` (PR #334, Sprint 3.152b).

**FROZEN AUTHORITY RULE:** JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.

This sprint does not redesign Calendar authority, pending authorization, connector acquisition, provider projection, exact-time binding, recall authority, or user-detail provenance.

## Final live acceptance evidence after 3.152b

The six hard-reset live tests produced one clean pass and five presentation/truthfulness failures. The core authority and binding invariants still held:

- fresh Calendar reads required ASK → Yes;
- 10 AM user detail bound only to the exact 10 AM commitment;
- 9 AM user detail did not bind to 10 AM or 3 PM;
- mismatch presentation remained 9:00 AM;
- recall did not silently acquire fresh Calendar authority.

Remaining failures were ordinary-fact misclassification, current-possession language on recall, and projection/source wording drift.

## Root causes

**OBSERVED — ordinary fact presentation:** `guardOrdinaryModelReply` classified the narrow timed user fact correctly, but then selected different corrective replies according to model output. The same user fact could therefore become a write-path refusal, read-capability statement, or ordinary acknowledgement depending on model wording.

**OBSERVED — canonical schedule-only mismatch:** `hasPriorVisibleCalendarReport` recognized the server's canonical `Tomorrow you have N commitments:` response, while `SCHEDULE_ONLY_CALENDAR_REPORT` recognized only the `Based on your calendar...` family. Equivalent timing-only evidence therefore produced different recall containment state.

**OBSERVED — residual live provenance wording:** the final live suite produced bounded wording not covered by 3.152b, including `From your calendar, I can see`, `I can only see`, and a bare `I just saw:` list.

**OBSERVED — projection/source drift:** a live reply described subject/description information as not visible `in the calendar data`, which exceeds what omission from the governed projection proves.

## Bounded corrections

1. A successfully classified narrow timed Calendar fact now deterministically returns the ordinary user-provided acknowledgement. Model wording cannot convert the same fact into authority UX, capability denial, or a write/update path.
2. The schedule-only recognizer now accepts the canonical server presentation family as well as the existing `Based on your calendar...` family.
3. Historical attribution covers the exact final-live recall wording families.
4. Projection-absence containment covers the observed `visible in the calendar data` source-level wording.
5. Route-level regressions reproduce the exact final-live failures through the shared typed/voice chat handler.

## Classification

**IMPLEMENTATION IMPLICATION.** No policy gap is demonstrated. No true architecture failure is demonstrated.

The deterministic Calendar authority architecture remains frozen.

## Acceptance requirement

Before merge, repeat the same six hard-reset live tests against the deployed branch/preview. Passing unit and route fixtures are necessary but not sufficient evidence of production closure.
