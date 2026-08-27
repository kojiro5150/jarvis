# Sprint 3.152 — Voice Calendar recall runtime-path audit

## Scope and baseline

The inspected checkout was exactly `85429cd19f3980744aea37d2eff466c746334cd0`, the expected merge of PR #331. No local `main` ref or Git remote was present, so `HEAD` was the only available actual-main identity; it had not advanced relative to the supplied expected SHA. This sprint does not alter PR #331, connector authority, Calendar operations/windows, GovernedContext projection, Gmail, Drive, Memory, `/api/chat`, routing, OAuth, or legacy containment.

## Live evidence supplied to the audit

**OBSERVED (operator evidence):** Three independent hard-reset voice runs correctly performed fresh Calendar ASK, confirmation-authorized read, later fresh-read ASK, binding of a user-supplied 10 AM project-review detail, rejection of an unrelated 9 AM finance-review detail, and hidden-metadata containment. They nevertheless emitted respectively “I just saw…”, “From the calendar data I can access…”, and “The calendar evidence I have access to…”. The functional/authority behavior passed; historical provenance wording failed.

## Static production runtime trace

**OBSERVED:** `useVoiceSession` trims a successful transcription and assigns a monotonically increasing capture-event ID. `UnifiedOpsConsole` observes that `VoiceTurn`, enqueues it, and `VoiceTurnQueue` deduplicates by ID. Its promise tail does not release turn N+1 until the async handler for N settles. `voiceTurnHandlerRef.current` invokes the same `submitMessage` used by typed sends. `submitMessage` adds the user message, calls `fetch("/api/lighter/chat")`, applies the opaque pending-authorization response, adds the assistant reply, and resolves.

**OBSERVED (pre-fix):** Request history was constructed from `conversations[specialist.id]` captured by the React render that created `submitMessage`. The response used `setConversations`, then the handler resolved. Queue serialization therefore proved network/application ordering but did not prove a React render commit or a refreshed handler closure before the next delivery. Typed sends used the same stale-capable source, although ordinary UI interaction usually gives React time to commit.

**OBSERVED (server):** `/api/lighter/chat` validates the body and derives `currentUserUtterance` from the last user message. On the ordinary model branch it combines `isCalendarRecallFollowUp` with `hasPriorVisibleCalendarReport`, computes schedule-only/detail flags, explicitly supplies `hasCurrentCalendarGovernedContext: false`, and calls `guardOrdinaryModelReply`. The guard attempts historical attribution and then applies fail-closed detail containment. Complete-history regressions prove this transition directly through the metadata-only `calendarRecallDiagnostics` seam.

## Reproduction and root cause

**OBSERVED:** A pre-fix regression failed because `submitMessage` contained no synchronous accepted-history source and read render state. A deterministic race then modeled an async response, synchronous response acceptance, and the immediately queued next request without assuming a React commit. This establishes the implementation defect: the queue’s settlement boundary ended after scheduling React state, not after making the accepted assistant reply synchronously available to transport history.

**INFERRED:** This defect is sufficient to explain a live recall request that omits its immediately preceding Calendar assistant report, making `priorCalendarReportPresent` and `isCalendarRecollection` false and bypassing attribution. The repository has no captured live request body, so it is not claimed as direct proof of what a particular deployment transmitted.

**OBSERVED:** Complete-history server fixtures also exposed two narrowly bounded residual forms in supplied live model output: optional “just” in the existing “I saw … on your calendar” family, and the “From the calendar data I can access…” current-source form. They failed before correction even with all recollection flags true. The existing families were minimally extended only after those exact complete-history failures; no Calendar request/recall intent matcher was added.

## Correction and invariants

**OBSERVED:** `ConversationTransportHistory` is now the synchronous transport source. Accepted user and assistant messages are appended before the React rendering mirror is scheduled. Both voice and typed `submitMessage` calls use it, and handoff synthesis also mirrors accepted assistant output into it. The race regression proves the turn-C body order: Calendar request, ASK response, “Yes”, Calendar result, recall question; the immediately preceding assistant result is present. A parity regression proves identical typed and voice accepted sequences create identical request histories.

The store carries only roles, presentation text, and an error display bit. `ClientAuthorityTurnState` remains a separate opaque-reference transport. The client does not construct a `ProposedOperation`, decision, grant, GovernedContext, connector result, or provenance authority. No production logging was added; the server diagnostic seam returns counts, ordered roles, and booleans only when called, and never logs or exposes raw history by itself.

## Server fixture findings

**OBSERVED:** With the exact 28 August report and “What times did you just see?”, prior report recognition and recall recognition are true, current Calendar GovernedContext is false, recollection is true, the ordinary guard is invoked, and the supplied “I just saw…” reply becomes historical attribution.

**OBSERVED:** With the 10 AM project-review statement, report, and “What are the meetings about?”, the detail binds to a visible interval, schedule-only containment is not asserted, no current GovernedContext exists, and “From the calendar data I can access…” is historically rewritten.

**OBSERVED:** With an unrelated 9 AM finance-review statement and a 10 AM/3 PM report, the detail does not bind, schedule-only is true, and fabricated meeting detail is replaced by the timing-only limitation. These are ordinary-branch pure regressions: no connector is invoked and no authority is created. Existing route/authority suites cover fresh-read ASK, opaque-reference spoof rejection, and no-connector behavior.

## Privacy, deployment identity, and unknowns

**OBSERVED:** No private-content production diagnostics or commit-SHA endpoint was introduced. Repository search found no established safe deployed build-identity surface. `app/page.tsx` can select a presentation root through deployment configuration, so an alternate root remains possible.

**UNKNOWN:** The exact SHA/configuration of the live deployment; whether it served a stale build; which presentation mode it served; and the actual live `messages[]` role/count sequence. Resolving these requires deployment metadata or privacy-safe live flags. **UNKNOWN:** Whether every free-form future model sentence is covered; this sprint corrects only two forms proven by exact complete-history regressions.

## Classification summary

* **OBSERVED:** stale render-state request construction existed and is removed; the deterministic race and exact server regressions pass after correction.
* **INFERRED:** missing prior assistant history likely explains at least some supplied live escapes.
* **UNKNOWN:** deployed-runtime identity and the contents/metadata of the three historical live requests.
