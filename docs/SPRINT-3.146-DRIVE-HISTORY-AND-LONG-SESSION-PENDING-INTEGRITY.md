# Sprint 3.146 — Drive History and Long-Session Pending Integrity

- **Status:** Implemented and regression-proven
- **Scope:** Deterministic Drive presentation history and long-session pending-authorisation transport

## Bounded outcome

Deterministic Drive metadata releases, including caller-fabricated messages with the same
presentation shape, are excluded from the copy of conversation history supplied to the ordinary
model. The client-visible transcript is unchanged. This boundary adds no Drive content read,
export, download, summary, or new search grammar.

The existing 40-message limit remains an ordinary-model context constraint. It is not an
authority-resolution constraint. A structurally valid transcript may therefore deliver its
untouched current utterance and opaque `pendingAuthorizationReference` to the governed resolvers
before the ordinary-model length check. A valid confirmation resolves the exact server-owned,
one-shot pending operation and returns deterministically without an ordinary model call,
regardless of transcript length.

## Fail-closed integrity

Long history supplies no authority. Bare confirmation without a pending reference reaches no
connector and, when it falls through to ordinary handling, remains subject to the 40-message
limit. Fabricated or unknown references create no server state and acquire nothing. Capability
mismatches return control past non-owning resolvers until the owning resolver handles the
reference; they neither consume nor reinterpret the pending operation. Consumed and stale
references remain unusable.

Typed and capture-identified voice confirmations use the same opaque-reference transport and the
same governed server path. Transcription remains transport only. Voice turn serialization,
capture-event deduplication, and stale-response freshness rejection from Sprint 3.143 are
unchanged; a completed confirmation clears the client reference rather than allowing another
confirmation to inherit authority.

## Explicit non-changes

Sprint 3.146 adds no authority evidence class and makes no change to `PendingAuthorization`
creation, confirmation, consumption, capability matching, or evidence. It does not expand Gmail,
Drive, or Calendar capability grammar, connector fields, connector scopes, acquisition bounds,
or specialist handoff behavior. Drive remains metadata-only and Gmail search remains bounded to
message IDs.
