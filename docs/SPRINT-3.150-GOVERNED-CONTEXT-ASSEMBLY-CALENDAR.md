# Sprint 3.150 — Governed Context Assembly Foundation (Calendar)

## Baseline and scope

Implementation started at `c1524a211f03e9089e425f18409e10a8724646e2` (the issue's expected baseline; the checkout has no local `main` ref). Calendar was selected because its existing deterministic conversational release already minimizes evidence to a bounded period and commitment intervals. This implementation covers only `calendar.read`; it does not establish Gmail or Drive readiness.

## Types and closed allow-list

`GovernedContext` is a readonly `{ version: "1"; sources: readonly GovernedContextSource[] }` container. Its sole source variant is currently `CalendarContextSource`: `source: "calendar"`, `capability: "calendar.read"`, `period`, a `window` containing only `start`, `end`, and the literal `Australia/Melbourne` time zone, and `commitments` containing only `start` and `end`.

Projection constructs fresh objects field by field and freezes every container, source, window, commitment, and array. It never spreads or aliases evidence. Titles/summaries, descriptions, locations, attendees, organizers, emails, provider event IDs, calendar IDs, conference data, arbitrary provider metadata, and raw connector payloads are explicitly omitted.

## Construction and model-input contract

The production order remains: raw current utterance → Calendar proposal → deterministic authority adjudication → pending resolution when applicable → ALLOW → connector construction → scoped acquisition → Calendar evidence → closed projection → typed governed context → model invocation → ordinary-model reply guard → response. ASK, DENY, malformed, unavailable, and acquisition-failure paths create no context and do not invoke governed reasoning.

The model call has one distinct optional `governedContext` argument alongside the existing sanitized conversation-history argument. The context is not appended to chat history, represented as a user/assistant message, included in authority evidence, or accepted from the request body. The provider adapter serializes the server-created artifact in a separate system content block with binding instructions: it is authorized evidence for this response only, is not authority for another operation, omitted fields were not supplied and must not be claimed, and hidden Calendar metadata must not be inferred as checked.

## Lifecycle, failure, and invariants

Governed context is a local current-request value. It is not stored in pending authorization, module/client state, transcripts, local storage, or caches. A later ordinary turn receives ordinary sanitized history and no prior governed source; prior natural-language assistant prose remains ordinary history and supplies no Calendar authority.

If authorized acquisition succeeds but model invocation fails, the handler uses the pre-existing deterministic Calendar formatter with the same evidence and window. It performs no second authority evaluation, connector construction, or acquisition and exposes neither errors nor provider fields. Acquisition unavailability remains deterministic and fail-closed.

These rules preserve the constitutional invariant that JARVIS may propose authority-requiring operations but may not manufacture authority. Governed context contains only already-authorized evidence selected by deterministic code; the model cannot select its fields. Calendar grammar, authority evaluation, operation/window semantics, pending schema/transport, connectors, OAuth/scopes, Gmail and Drive capabilities and provenance rules, specialists, voice authority, `/api/chat`, legacy Gmail containment, OperationalState quarantine, branch governance, and North Star remain unchanged.

## Tests and remaining non-goals

Focused tests cover projection closure and freezing, authority-before-acquisition behavior, client injection, successful governed reasoning and history sanitization, reply guarding, single-call fallback, malicious extra fields, and current-turn-only isolation. The existing full suite continues to cover Calendar pending/voice equivalence and cross-capability Gmail, Drive, specialist, pending, legacy, and quarantine regressions.

Remaining non-goals include Gmail/Drive governed context, cross-source synthesis, BRIEF_ME, grants, Memory authority, persistence, autonomous/proactive reads, Calendar titles or writes, email/Drive writes, specialist concealment, runtime or route convergence, generalized context plugins, legacy cleanup, and North Star v0.2.
