# Sprint 3.121 — Isolated PendingAuthorization Confirmation

- **Status:** Implemented in isolation
- **Date:** 25 August 2026
- **Scope:** Deterministic one-shot resolution of one active, exact pending operation

## Objective

Introduce the first general `PendingAuthorization` confirmation mechanism
without changing production conversation routing or private acquisition.

## Implemented boundary

`lib/lighter-jarvis/pending-authorization.ts` defines an immutable active
authorization bound to an identifier and exactly one instance of the existing
closed `ProposedOperation` representation. It invents no additional scope
shape. Its public resolver accepts only:

1. the raw current user utterance; and
2. the active `PendingAuthorization`, or `null`.

The resolver itself deterministically recognizes a closed set of standalone
confirmations. Callers cannot provide a `confirmed` boolean, an `ALLOW`
decision or replacement operation. On confirmation, the resolver returns the
exact operation held by the pending value, records the raw utterance as
immutable authority evidence, and consumes the pending value by returning
`null`.

Without both an explicit current confirmation and an active pending value, the
result is `ASK`, no operation is released, and no authority evidence is
created. A consumed pending object is tracked internally and cannot be replayed
to mint another `ALLOW`, even if a caller retained it.

An explicit standalone decline returns `DENY`, creates no authority evidence
and consumes the pending authorization. Ambiguous and non-matching replies
return `ASK` and preserve it.

## Verification

Tests prove:

```text
active exact pending + standalone confirmation → ALLOW + exact bound operation + consumed
consumed pending     + later confirmation      → ASK   + no authority
active exact pending + explicit decline        → DENY  + consumed + no authority
active exact pending + ambiguous reply         → ASK   + pending preserved
no active pending    + bare confirmation       → ASK   + no authority
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
