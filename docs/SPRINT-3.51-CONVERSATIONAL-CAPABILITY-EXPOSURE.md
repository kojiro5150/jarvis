# Sprint 3.51 — Conversational Capability Exposure

`POST /api/chat` retains its legacy conversational path. A request containing no `capability` member still builds the existing operational context, preserves the supplied message history, and uses the existing audited model execution. Neither new EOS service is imported into prompt composition or invoked by that path.

An explicit `capability` member selects one of two closed operations:

* `executive_context` accepts a completed Situational Awareness snapshot and an explicit computation window. It runs `AvailabilityEngine` and then `ConversationContextAdapter`; it returns only the Sprint 3.48 `ExecutiveContext` contract.
* `governed_gmail_retrieval` accepts metadata for one identified email resource and admissible requested fields. It loads deployment policy and delegates to the Sprint 3.50 adapter. The adapter evaluates policy before the identified-message-only connector can run and returns its audit record with permitted, denied, or failed status.

The capability router has no search, selection, thread, attachment-content, summarisation, or arbitrary connector interface. Malformed operations are rejected at the HTTP boundary. Runtime and connector failures are bounded capability outcomes and cannot fall through into either an ungoverned Gmail call or ordinary conversation.

This is a temporary parallel architecture. It proves independent callability and does not establish equivalence, alter briefing behaviour, inject executive facts by default, or authorize retirement of any legacy connector path. Replacement remains deferred until factual comparison demonstrates equivalence.
