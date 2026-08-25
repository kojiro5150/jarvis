# Sprint 3.122 — Server-Authoritative PendingAuthorization

- **Status:** Implemented in isolation
- **Date:** 25 August 2026
- **Scope:** Move trust for pending authorization from caller-supplied objects to server-owned state

## Objective

Close the trust boundary left by Sprint 3.121. A client must not be able to
construct a value containing a `ProposedOperation` and have that value treated
as an active `PendingAuthorization`. The server is authoritative; a client may
carry only a reference which has no authority by itself.

## Implementation

`lib/lighter-jarvis/pending-authorization.ts` now keeps the trusted
`PendingAuthorization` record in a module-private registry. Creation generates
the identifier on the server, stores the exact proposed operation, and returns
only a frozen `PendingAuthorizationReference` containing that identifier. The
trusted record type and registry are not exported.

Resolution accepts the raw current utterance plus the reference or `null`. It
first validates the transport value at runtime, then looks up the record before
interpreting confirmation or decline. Missing values, non-object values,
arrays, missing or non-string identifiers, empty or blank identifiers and accessor-backed
identifiers fail closed with `ASK` rather than throwing. An unknown or
client-chosen well-formed identifier likewise returns `ASK`, no operation and
no authority evidence. Caller-supplied extra fields are irrelevant: the
operation can come only from the server-owned record. Active confirmation
returns that exact stored operation and immutable evidence; confirmation and
decline atomically replace the active record with a consumed record. Ambiguous
input preserves the canonical server-issued reference.

The registry is deliberately isolated, process-local state. Durable or
distributed persistence and production conversation integration remain future
work.

## Verification

Tests establish:

```text
server creation                     -> opaque reference only
active known reference + confirm    -> ALLOW + exact stored operation + consumed
manufactured unknown record/ref     -> ASK + no operation + no evidence
malformed/missing transport ref      -> ASK + no throw + no authority
consumed reference + confirm        -> ASK + no replay authority
null reference + bare confirmation  -> ASK + no authority
active known reference + decline    -> DENY + consumed + no evidence
active known reference + ambiguous  -> ASK + canonical reference preserved
```

## Explicit non-scope

This sprint does not:

- wire live Calendar acquisition or production conversation routing;
- change `OperationalState`;
- change Gmail, Drive or Memory acquisition;
- add named or standing grants;
- redesign UI or add voice behavior;
- provide durable, multi-process or distributed state;
- broaden the closed `calendar.read` `ProposedOperation` vocabulary.
