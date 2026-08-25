# Sprint 3.125 — Ordinary Chat Private Context Removal

- **Status:** Implemented for ordinary non-capability `/api/chat`
- **Date:** 25 August 2026
- **Scope:** Removal of implicit private prompt context only

## Objective

Stop ordinary non-capability chat requests from building the legacy
`OperationalState` and implicitly placing private Memory, Calendar, Gmail and
Drive-derived state in the model prompt.

## Implementation

The ordinary `/api/chat` branch now assembles its system prompt from the
selected agent instructions and its BOA instruction file only. It does not
call `buildOperationalState()` or `buildContextBlock()`. Audited advisory
execution, request validation, model and audit failure handling, and response
shape remain unchanged. The audit constraint now truthfully records that the
agent and BOA instructions were assembled server-side rather than claiming
that operational context was injected.

The existing explicit `capability` branch remains before ordinary chat
validation and continues to use its bounded capability router and Gmail
content-policy integration unchanged.

## Verification

Route coverage verifies that ordinary chat sends only agent and BOA
instructions into audited execution. It also verifies that the explicit
capability branch retains its existing routing and bypasses ordinary audited
conversation execution. Audit coverage verifies the corrected deterministic
constraint text.

## Explicit non-scope

This sprint does not redesign or remove `OperationalState`, change any of its
other callers, add Gmail, Drive or Memory authority, or change
`/api/lighter/chat`. It does not broaden the capability branch, change agent or
BOA content, remove audited execution, weaken validation, or alter failure
handling. It adds no implicit private replacement context. Clearly non-private
date/time context was not required and therefore was not added.
