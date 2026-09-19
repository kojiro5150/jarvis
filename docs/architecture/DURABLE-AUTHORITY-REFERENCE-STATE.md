# Durable Authority and Reference State — Step C Inventory

**Status:** Authority-bearing durability slice implemented; remaining process-local references classified below.  
**Baseline:** `main` at `b87ddb25ff4a8181206b86a2c4d56296c249c778`  
**Production schema:** Supabase migrations `20260919144222` and `20260919145413`

## Completion rule

Step C does not mean “persist every opaque handle.”

A reference is restart-sensitive for Step C when process loss could change whether an externally consequential operation is eligible to execute, allow a consumed/revoked authority state to reappear, or require reconstruction of authority from client/source/model content.

A process-local reference may remain ephemeral when restart loss can only make an operation unavailable and force a fresh governed acquisition, selection or clarification. Those losses are availability/continuity costs, not authority-state ambiguity.

## Durable authority-bearing state

| State | Production status | Restart property |
|---|---|---|
| Generic `PendingAuthorization` used by governed Calendar/Gmail/Drive acquisition and Gmail invitation-decline re-read | **DURABLE** | 15-minute persisted lifetime; atomic conditional consume; consumed/expired/revoked terminal across runtime restart |
| Calendar move authorization | **DURABLE** | Exact validated move snapshot is persisted with the authorization; confirmation no longer depends on the process-local proposal Map |
| Product Gap resolution/supersession assertions | **ALREADY DURABLE** | Final append-only assertions are Supabase-backed; database identity/duplicate guards remain authoritative |

The durable governance store is operational authority state, not remembered user context. It is deliberately separate from Operating Picture records while reusing the same Supabase server substrate.

## Process-local references that may fail closed on restart

These references currently use process-local state, but loss cannot manufacture or revive authority. Restart makes the user repeat a governed step.

| Reference family | Consequence of restart loss | Step C classification |
|---|---|---|
| Gmail / Drive private-release references | Prior released private content becomes ineligible for dependent follow-up; user must re-read exact resource | Safe availability loss |
| Gmail bounded message-list reference | Named/ordinal selection unavailable; user must search again | Safe availability loss |
| Governed result-set scope/result reference | Drive ordinal selection unavailable; user must search again | Safe availability loss |
| Weather clarification reference | Location-only continuation loses binding; user must restate request | Safe availability loss |
| User-continuity clarification reference | Classification continuation lost; user must restate capture | Safe availability loss |
| Calendar conflict reasoning/advice/preference references | Understand/Advise chain becomes unavailable; fresh governed Calendar reasoning required | Safe availability loss |
| Calendar move proposal reference | Diagnostic/conversational proposal lookup may disappear, but executable authorization contains its own exact persisted snapshot | Safe availability loss |
| Product Gap list/target/supersession selection references | Selection flow is lost and must be restarted; durable assertion cannot be written without a currently resolved server-owned target/pair | Safe availability loss under current closed write grammar |
| Durable-continuity release reference | Prior presentation cannot be treated as active release; fresh governed recall required | Safe availability loss |

## Invariants now enforced

1. An active generic pending authorization survives process replacement until its fixed 15-minute expiry.
2. Consuming authority is an atomic database conditional update.
3. Exactly one concurrent consumer can win.
4. Consumed state remains consumed.
5. Expired state cannot be consumed.
6. Revoked state cannot be consumed.
7. Capability mismatch does not consume the record.
8. Missing persistence fails closed; production never falls back to process memory.
9. Calendar move confirmation reconstructs only from the server-persisted exact validated proposal snapshot.
10. Client/source/model text cannot provide the stored operation payload.

## Production proof

A disposable live Supabase row was created for `pending_authorization / calendar.read`.

Two competing calls to `consume_governance_ephemeral_state` against the same UUID and timestamp returned:

- one `consumed` with the stored server payload;
- one `already_consumed`.

The row was then deleted. The first probe exposed a PL/pgSQL column-name ambiguity in the initial RPC; it failed closed. Migration `20260919145413_fix_governance_ephemeral_consume_qualification.sql` repaired the qualification, after which the unchanged concurrent probe passed.

## Explicit exclusions

This step does not:
- implement named grants;
- make voice a write-approval channel;
- persist ordinary conversation state;
- turn convenience references into authority;
- widen any operation footprint;
- add any new Act capability.

If a future capability makes one of the currently ephemeral reference families authority-bearing, that reference must move into durable governance state before the capability can pass the Act release gate.
