# Sprint 3.121 — Isolated PendingAuthorization Confirmation

- **Status:** Implemented in isolation
- **Date:** 25 August 2026
- **Scope:** Deterministic confirmation of one active, exact pending operation

## Objective

Introduce the first general `PendingAuthorization` confirmation mechanism
without changing production conversation routing or private acquisition.

## Implemented boundary

`lib/lighter-jarvis/pending-authorization.ts` defines an immutable active
authorization bound to an identifier, one closed proposed operation and its
bounded acquisition scope. Its public resolver accepts only:

1. the raw current user utterance; and
2. the active `PendingAuthorization`, or `null`.

The resolver itself deterministically recognizes a closed set of standalone
confirmations. Callers cannot provide a `confirmed` boolean, an `ALLOW`
decision, replacement operation or replacement scope. On confirmation, the
resolver returns the exact operation and scope held by the pending value,
records the raw utterance as immutable authority evidence, and consumes the
pending value by returning `null`.

Without both an explicit current confirmation and an active pending value, the
result is `ASK`, no operation or scope is released, and no authority evidence
is created. Non-confirming utterances preserve the active pending value.

## Verification

Tests prove:

```text
active exact pending + standalone confirmation → ALLOW + exact bound operation/scope + consumed
no active pending    + bare confirmation       → ASK   + no authority
active exact pending + refusal/ambiguity       → ASK   + pending preserved
active exact pending + expanded request        → ASK   + pending preserved
```

## Explicit non-scope

This sprint does not:

- create pending authorizations from ambiguous production requests;
- persist pending values in conversation state;
- change production chat routing or `OperationalState`;
- invoke Calendar or any other private connector;
- add named grants, standing grants or new capability vocabulary;
- broaden `calendar.read` authority policy.

Production creation, persistence and routing remain later migration work.
