# Sprint 3.123 — Live Authority-Gated Calendar Read

- **Status:** Implemented for the bounded JARVIS conversational route
- **Date:** 25 August 2026
- **Scope:** Production `calendar.read` acquisition ordering only

## Objective

Integrate the existing `calendar.read` authority machinery into the live
lighter JARVIS conversation path without broadening the operation or private
data surface.

## Implementation

The route resolves a supplied server-authoritative pending reference before
any model invocation. A confirmed exact pending operation and a direct,
explicit Calendar read both enter the existing governed Calendar acquisition
seam through its authority gate. Acquisition uses the production Calendar
factory and fixed production bounds of five events and seven days; those
bounds are not caller-controlled operation parameters.

An ambiguous Calendar reference creates server-owned pending state and returns
only its opaque reference. `ASK`, `DENY`, malformed or unknown references, and
an invalid supplied reference return before connector construction, Calendar
acquisition, and model invocation. Standalone confirmation or decline wording
without a supplied pending reference remains ordinary conversation and does
not enter the Calendar authority flow. Governed
Calendar evidence is rendered by a bounded deterministic server response after
`ALLOW`; it is not supplied to a model in this sprint. The proposal boundary
can identify a temporal schedule question such as `How does tomorrow look?`
as a possible `calendar.read`, but that proposal supplies no authority and
therefore produces `ASK`.

The console retains only the opaque pending reference returned by the server
and transports it across the next typed or voice turn. It never receives or
constructs the bound operation.

## Verification

Tests establish direct explicit acquisition, pending confirmation acquisition,
and zero acquisition for `ASK`, `DENY`, invalid references, and bare confirmation.
Route coverage separately proves pending resolution precedes the model call.

## Explicit non-scope

This sprint does not change Gmail, Drive or Memory acquisition,
`OperationalState`, named or standing grants, Calendar writes, or the closed
`calendar.read` operation with parameterized scope. It does not make the
process-local pending registry durable or migrate legacy conversation paths.
