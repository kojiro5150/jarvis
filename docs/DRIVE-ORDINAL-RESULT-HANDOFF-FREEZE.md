# Drive Ordinal Result Handoff — Freeze

**Status:** Frozen before implementation
**Date:** 2 September 2026

## Classification

1. **Capability exists:** Drive search and exact Drive read exist.
2. **Substrate exists:** `governed-result-set-reference.ts` already defines `drive.search_results` / `drive_file`, TTL, six-turn budget, same-class supersession, scope close, forged/cross-scope rejection, and exact ordered ordinal resolution.
3. **Live integration exists:** None. No production capability currently uses this generic primitive.
4. **Production proof exists:** None. This milestone will be the first production activation of the primitive anywhere.

## Exact gap

A successful Drive search returns up to five metadata results but creates no server-owned referential scope or result-set reference. Drive read accepts only `drive.read <provider-file-id> [text]`. Therefore a natural follow-up such as `Read the first one.` cannot identify a Drive file from preserved server-owned search order.

## Smallest legitimate implementation

- create/reuse one opaque governed referential scope for the live conversation;
- after every successful Drive search, create a `drive.search_results` result-set reference over the exact returned provider file IDs, including an empty successful result to preserve same-class supersession semantics;
- carry only the opaque scope and result-set handles across the client boundary;
- advance the genuine scope once per subsequent user turn before implicit Drive-reference resolution;
- support only the closed ordinal family already used by the bounded reference grammar: first through fifth / 1st through 5th / one through five, under `read|open|show|summarise`;
- resolve the ordinal server-side with `referenceKind: "drive_file"`;
- convert the resolved file identity into a typed `DriveReadOperation` and a separate server-owned pending authorization;
- execute Drive read only after explicit confirmation resolves that pending operation;
- preserve the existing exact `drive.read <provider-file-id> [text]` path unchanged.

## Authority invariant

> The result-set reference may identify one exact Drive file. Neither the scope handle nor the result-set handle grants read authority.

Explicit confirmation after the ordinal proposal is mandatory. The ordinary model never selects or substitutes a provider file ID.

## Failure behaviour

- fabricated or cross-scope handles: fail closed;
- expired TTL or exhausted six-turn budget: fail closed;
- superseded result set: fail closed;
- out-of-range ordinal: fail closed;
- unsupported anaphora such as `read it` / `read that`: remain under the existing Drive containment guard;
- connector/search failure: create no new result-set state and preserve prior state;
- successful empty Drive search: supersede prior Drive search result state.

## Non-goals

- no Gmail or Calendar migration onto the generic primitive;
- no generic reference-registry refactor;
- no named Drive-file follow-up;
- no fuzzy/anaphoric Drive resolution;
- no Drive write/edit/create/save;
- no change to content policy, MIME policy, OAuth scope, or read byte limits;
- no guard deletion.

## Production-proof requirement

A green PR proves implementation and integration tests only. Before LIVE PASS / FROZEN, real use must prove:

1. Drive search → displayed bounded result → `Read the first one.` → separate read confirmation → exact first file;
2. out-of-range ordinal fails closed;
3. a newer Drive search supersedes the earlier result and the old handle cannot resolve;
4. fabricated/cross-scope reference cannot identify or authorize a file;
5. TTL expiry and six-turn exhaustion fail closed.

Only the bounded Drive ordinal use case is earned by those proofs. Success does not authorize migration of Gmail or Calendar.