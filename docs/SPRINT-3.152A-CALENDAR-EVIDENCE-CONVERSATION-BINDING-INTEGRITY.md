# Sprint 3.152a — Calendar evidence/conversation binding integrity

## Baseline and controls

- **OBSERVED:** Work began from `6d65a96735e5a4ce98ad1162a04d7b0c173829b0`, the expected merge of PR #332. The supplied checkout had no local `main` ref or configured remote, and GitHub CLI had no authentication; therefore remote advancement could not be independently queried from this environment.
- **OBSERVED:** The reported typed Test 3 retained the ordinary statement “My 9 a.m. meeting is the finance review” through ASK/confirmation, then a current governed result exposed only 10:00–11:00 and 15:00–16:00. The model speculatively called the 10:00 commitment the finance review. Its next detail-recall answer was the ordinary-authority neutralization string.
- **OBSERVED:** The acceptance report says voice and typed controls both retained conversation and authority continuity. The defect was consequently shared server reasoning/presentation, not a transport-specific authority failure.
- **OBSERVED:** Two regressions run against a detached baseline worktree both failed: the 9→10 output passed unchanged, and a model-generated Calendar confirmation on “What are the meetings about?” became `That request cannot be authorized through an ordinary model response.`

## Root causes

- **OBSERVED:** On an ALLOW turn, `chat-handler.ts` passed sanitized ordinary history (including the 9 AM statement) beside a timing-only `GovernedContext`. No deterministic current-turn relation existed. The model could therefore invent a cross-source relation, while the ordinary reply guard had no binding state with which to reject it.
- **OBSERVED:** `guardOrdinaryModelReply` evaluated `presentsPrivateAuthorityConfirmation` before Calendar recollection containment. Thus model confirmation prose on a proven detail-recall turn selected `NEUTRALIZED_ORDINARY_AUTHORITY_REPLY`, even though the deterministic authority path had proposed no operation.
- **INFERRED:** Model behavior can vary lexically across voice and typed prompts, but identical accepted server histories now yield the same extraction, exact-clock classification, governed metadata, and output guard.

## Corrective boundary

- **OBSERVED:** The timed-detail parser and normalized clock function used by recall containment are now shared with current-turn binding. Only a preceding user assertion in the bounded `my/the <clock> meeting/commitment is/was <label>` grammar is eligible.
- **OBSERVED:** Server code compares the normalized user clock only with current projected commitment start clocks in `Australia/Melbourne`. Equality binds; 9 versus 10 and 2 versus 3 remain unbound. There is no nearest-time, fuzzy, semantic, or model-selected binding.
- **OBSERVED:** Current `GovernedContext` carries closed `userSuppliedBindings` and `unboundUserSuppliedDetails`. Both explicitly retain user provenance. No title is projected as provider/Calendar metadata, and client-authored context or binding fields remain ignored.
- **OBSERVED:** The bounded specialist instruction permits association only from `userSuppliedBindings`. The current-turn guard independently replaces a response that combines an unbound label with a projected commitment clock, retaining the schedule and explaining the mismatch.
- **OBSERVED:** On no-context recollection turns, deterministic Calendar recollection/detail containment runs before fake authority-UX neutralization. Fresh “What’s on for tomorrow?” still enters the unchanged Calendar evaluator and ASK path.

## Recall provenance

- **OBSERVED:** Recollection-only rewriting now covers the reported families: “I saw two time blocks/slots for tomorrow”, “Based on the calendar data I can see”, “From the calendar data, I only have…”, “The calendar information available to me…”, “from the calendar data I can see”, and “The current calendar information only shows…”. Rewrites are invoked only after `isCalendarRecollection` is established and no current Calendar context exists.
- **OBSERVED:** Current governed turns bypass those historical-attribution rewrites.

## Authority and privacy implications

- **OBSERVED:** Binding metadata is presentation/evidence composition only. This sprint does not change the Calendar authority evaluator, proposal grammar, pending authorization, operation/window, connector, or provider allow-list.
- **OBSERVED:** Recall detail remains an ordinary model turn: no connector, Calendar authority response field, pending reference, proposed operation, or acquisition is created. Fresh read intent remains governed.
- **OBSERVED:** Production code adds no logging of labels, times, history, or provider IDs. Exact fixtures occur only in tests.
- **OBSERVED:** Gmail, Drive, Memory, OAuth, legacy containment, specialist routing, North Star, and branch governance were not broadened.

## Follow-up and unknowns

- **OBSERVED:** Candidate follow-up: “I don't have the ability to access, modify, or interact with your calendar system directly” is capability-inaccurate because governed reads exist after authorization. Generic capability-truthfulness is intentionally outside this sprint.
- **UNKNOWN:** Free-form user statements outside the deliberately bounded assertion grammar remain ordinary conversation but do not bind.
- **UNKNOWN:** A statement with a clock but no date may refer to another day. This sprint implements the required exact-clock rule; adding date identity would require a separately governed design decision.
- **UNKNOWN:** Remote main advancement, issue creation, PR creation, and exact-head GitHub CI require authenticated GitHub access, which was unavailable in the supplied environment at implementation time.
