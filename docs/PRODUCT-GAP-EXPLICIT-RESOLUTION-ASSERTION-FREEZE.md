# Product Gap Explicit Resolution Assertion — Freeze

**Status:** Frozen before implementation
**Date:** 2 September 2026
**Scope:** One explicit user-authored `active → resolved` assertion over one exactly selected durable JARVIS Product Gap record.

> **Follow-on status:** This bounded lifecycle assertion was subsequently implemented, repaired after live preparation exposed a canonical-purpose mismatch, and directly verified through the live JARVIS and Supabase paths. It is now **LIVE PASS / FROZEN** within the exact scope defined here. See `PRODUCT-GAP-EXPLICIT-RESOLUTION-ASSERTION-LIVE-PASS.md`. The pre-implementation statements below remain as the historical proving contract.

## Proving question

> Can JARVIS let the user explicitly mark one exact durable Product Gap as resolved while preserving the original append-only record, preventing model-selected targets or inferred lifecycle writes, and retaining the complete historical relationship?

This milestone governs that question only. It does not create generic memory editing, replacement, reconciliation or workflow management.

## Verified current-state gap

Current `main` was verified at `49e085f6b3dbb5ceb1c65f19d87fd356e6d2efe4` before this freeze.

The existing boundaries cannot safely implement Product Gap resolution by reuse:

1. `USER-CONTINUITY-CAPTURE-06` requires conversational captures to use `append_only` revision semantics.
2. `createUserContinuityCaptureRecord` persists each captured Product Gap under the `user_continuity` namespace with `revision: "append_only"`.
3. `proveExplicitReplacementSupersession` returns `null` unless the prior record uses `explicit_replacement`.
4. `applyExplicitReplacementSupersession` independently rejects records whose revision semantics are not `explicit_replacement`.
5. Current Product Gap enumeration renders matching statements but returns no opaque ordered-list reference, no exact selected-record reference and no lifecycle-write capability.
6. The durable projection admits current records individually. It has no derived effective-status overlay joining an original Product Gap to a later resolution assertion.

Therefore Product Gap resolution is not dormant supersession wiring. It requires a separate append-only relationship and a separately governed deterministic target-selection path.

## Governing decision

`USER-CONTINUITY-CAPTURE-06` remains unchanged.

The original Product Gap record remains:

- immutable;
- `revision = append_only`;
- historically inspectable;
- attributable to its original user-authored statement; and
- never rewritten to say `resolved`.

Resolution is represented by a new user-authored append-only decision record that references the exact original record:

```text
original Product Gap record
  namespace = user_continuity
  revision = append_only
        │
        └── exact targetRecordId
              │
              ▼
Product Gap resolution assertion
  namespace = product_gap_resolution
  class = decision
  revision = append_only
  value.status = resolved
  authorship.source = user
```

The resolution assertion does not supersede, replace, withdraw or mutate the original. A later deterministic projection may derive the original's **effective Product Gap status** as `resolved`; the underlying record lifecycle remains unchanged.

## Deterministic three-stage user path

### Stage 1 — bounded candidate preparation

The only v1 preparation utterance is:

> `Show me the active JARVIS product gaps for resolution.`

The server retrieves current conversation-visible user-authored records whose exact stored statement begins with `JARVIS product gap`.

It returns a maximum of ten numbered candidates in deterministic durable projection order and creates an opaque `ProductGapResolutionListReference` containing the exact ordered record IDs. The client receives no durable record ID.

If more candidates remain, the response exposes the exact command:

> `Show me the next JARVIS product gaps for resolution.`

Pagination must remain server-owned and deterministic. It must not re-rank candidates through model relevance or semantic similarity.

### Stage 2 — exact positional target selection

Supported v1 selection grammar is closed and whole-utterance anchored:

- `Select product gap <1-10> for resolution.`
- `Select the <first-tenth> product gap for resolution.`

Selection resolves only against the active opaque list reference. A successful selection displays the exact stored Product Gap statement and creates an opaque `ProductGapResolutionTargetReference` bound server-side to that record's immutable identity.

Natural descriptions such as `the Drive gap`, quoted fragments, fuzzy similarity, model classification and assistant-prose recovery are unsupported in v1.

### Stage 3 — explicit resolution assertion

Supported v1 resolution grammar is closed and whole-utterance anchored:

- `Mark this product gap as resolved.`
- `Resolve this product gap.`

Only the untouched current-user utterance may trigger the write. A model response, task summary, historical transcript statement, acknowledgement, paraphrase or implied completion cannot do so.

The exact resolution command consumes the active target reference before persistence is attempted. It appends one new user-authored resolution assertion. A success response may be returned only after durable append success.

## Reference lifecycle

Both references are non-authoritative identifiers stored in module-private server state.

### List reference

- opaque client handle;
- maximum ten exact ordered Product Gap record IDs per page;
- 15-minute TTL;
- valid only for Product Gap resolution selection;
- fabricated, unknown, expired, out-of-range and wrong-class input fails closed;
- a successful target selection consumes that list reference;
- server entries may remain physically present until consumption or TTL cleanup, but consumed entries cannot resolve again.

### Target reference

- opaque client handle bound to one exact immutable Product Gap record ID and the exact selected head-version ID;
- 15-minute TTL;
- one-shot consumption;
- selecting a different target through a carried prior target reference consumes the prior target before issuing the new one;
- fabricated, unknown, expired, consumed, wrong-class and already-effectively-resolved targets fail closed;
- possession is not authorship or authority; only the closed current-user resolution utterance authors the assertion.

Consuming a target reference does not establish that the target remains eligible. Immediately before persistence, the server must read a fresh durable snapshot and revalidate that:

- the target record still exists;
- its current head is the exact head version bound into the target reference;
- it remains a current, conversation-visible, user-authored Product Gap;
- no valid resolution assertion already targets it; and
- no integrity failure prevents a unique effective-status decision.

A target that changed, disappeared, left the active set or was resolved after its reference was issued is stale and fails closed. The earlier candidate-list or target-reference snapshot cannot authorize a write against outdated durable state.

No Gmail, Drive, Calendar or generic governed result-set reference is reused. Surface similarity does not establish lifecycle parity.

## Resolution assertion contract

The new append-only assertion must contain only the minimum deterministic relationship:

- its own unique record ID;
- `class = decision`;
- `subject.namespace = product_gap_resolution`;
- `subject.entity = <exact target Product Gap record ID>`;
- `subject.attribute = status`;
- `subject.revision = append_only`;
- `value.status = resolved`;
- `value.targetRecordId = <exact target Product Gap record ID>`;
- `authorship.source = user`;
- `authorship.statedAt = <server-observed current-turn time>`;
- conversation visibility only.

The assertion must not claim why the gap was resolved, which PR fixed it, that production proof exists, or that evidence was independently verified. Those may be documented elsewhere but cannot be inferred into the user's lifecycle assertion.

The resolution assertion uses one deterministic internal record identity derived from the exact target record ID, for example `product-gap-resolution:<sha256(targetRecordId)>`. This identity is never exposed to the client. It provides a persistence-level one-target/one-assertion collision boundary rather than relying only on an earlier read-before-write check.

Duplicate resolution is fail-closed. V1 creates at most one effective resolution assertion per target and adds no reopening transition.

This rule covers three distinct cases:

1. **Sequential duplicate:** the same already-resolved target is selected or submitted again later.
2. **Stale independent reference:** two list/target flows select the same active original before either writes; after the first succeeds, the second must fail fresh-state revalidation.
3. **Concurrent race:** two resolution writes pass preflight before either observes the other. Both derive the same assertion record identity, so the durable append boundary permits at most one initial assertion; the losing append returns a deterministic duplicate/stale failure and must not report success.

An assertion targeting a missing, malformed, non-Product-Gap or otherwise ineligible original is rejected. Multiple honestly preserved resolution attempts are **not** a supported v1 history model: only the one successful user-authored assertion is durable Product Gap resolution state. Failed later attempts may be operationally logged, but they are not persisted as resolution assertions.

## Effective-status projection

Current Product Gap presentation may derive a closed view status:

- `active` — an eligible original Product Gap has no valid current resolution assertion targeting it;
- `resolved` — exactly one valid current user-authored resolution assertion targets the exact original record.

Projection must fail closed rather than hide history when:

- multiple valid resolution assertions target the same record;
- an assertion targets a missing, non-Product-Gap or non-user-authored record;
- target identity or authorship is malformed;
- the assertion is not append-only; or
- durable snapshot/head integrity is unavailable.

The Stage 1 **active Product Gap** preparation view excludes effectively resolved originals and excludes resolution assertions from the candidate list.

V1 adds one separate closed historical request:

> `Show me the JARVIS product gap resolution history.`

That deterministic view is bounded to ten original Product Gap records per page. It displays each exact original statement with derived `active` or `resolved` status. For a resolved record it also displays that status as derived from an explicit user-authored resolution assertion and its timestamp. It does not expose internal record IDs, infer reasons or collapse either durable record. The exact pagination command is:

> `Show me the next JARVIS product gap resolution history page.`

Neither active preparation nor historical presentation mutates durable history.

The existing broad request `Show me everything you remember about JARVIS product gaps.` remains the established undifferentiated captured-gap enumeration until a later implementation PR deliberately changes its presentation contract. This freeze does not silently redefine that request or misdescribe it as lifecycle-aware history.

## Authority and trust invariant

> A model may help discuss whether work appears complete. It may never choose the durable target or author the user's lifecycle decision.

This is the lifecycle equivalent of `USER-CONTINUITY-CAPTURE-02` and `USER-CONTINUITY-CAPTURE-07`:

- stored lifecycle content remains the user's explicit act, not a model paraphrase;
- lifecycle-write intent remains deterministic, not a model decision;
- repository state, merged PRs, tests, documentation and live evidence do not automatically resolve a Product Gap;
- a target reference identifies one record but does not itself authorize or author the write.

## Required RED sequence

Before implementation, tests must prove current code cannot satisfy the contract:

1. Product Gap enumeration returns no opaque ordered-list reference.
2. No deterministic selection path can bind an ordinal to one exact Product Gap record.
3. No resolution-target reference exists.
4. Existing explicit-replacement proof rejects an `append_only` Product Gap.
5. No append-only resolution assertion can be constructed or persisted.
6. Sequential duplicate resolution has no governed rejection path.
7. Two independently issued references can become stale against a later resolution with no fresh-target revalidation contract.
8. Concurrent writes have no deterministic one-target/one-assertion persistence collision boundary.
9. Missing or otherwise ineligible targets have no resolution-assertion rejection contract.
10. Current projection cannot derive active versus resolved Product Gap status.
11. Resolution-shaped language can fall through without a governed lifecycle-write boundary.

RED evidence must precede production implementation. Tests written only after the new path exists are insufficient.

## Acceptance

Implementation is not production-proven until the real path demonstrates:

1. the bounded preparation command returns server-owned numbered candidates;
2. Drive ordinal continuity and Gmail Product Gap #19 can each be selected positionally;
3. the exact selected stored statement is displayed before any resolution write;
4. resolving one cannot resolve or hide the other;
5. a different target selection invalidates the prior carried target;
6. fabricated, expired, consumed, out-of-range and wrong-class references fail closed;
7. ambiguous natural descriptions and unsupported trigger paraphrases create no write;
8. the resolution command appends exactly one user-authored decision assertion;
9. sequential duplicate resolution fails closed;
10. two independently issued references to the same original permit only the first successful resolution;
11. a concurrent two-writer persistence test produces exactly one durable assertion and at most one success response;
12. missing, changed-head and otherwise ineligible targets fail closed;
13. both original records remain `append_only` and unchanged;
14. the active preparation view excludes the two effectively resolved records;
15. the closed resolution-history view returns each original plus its explicit resolution relationship; and
16. hard refresh/restart recovery preserves the same effective-status result from durable state.

One green implementation PR proves code integration only. Direct live write, independent durable-row inspection, later recall and restart-shaped recovery are required before this milestone may be marked **LIVE PASS / FROZEN**.

## Explicit exclusions

This milestone does not add:

- any change to `USER-CONTINUITY-CAPTURE-06`;
- `explicit_replacement`, `authoritative_snapshot` or lifecycle mutation of captured Product Gaps;
- semantic phrase-to-record matching;
- model-selected targets or model-authored resolution;
- direct resolution from broad recall or assistant prose;
- bulk resolution;
- correction, supersession, withdrawal, reopening or arbitrary status vocabulary;
- automatic resolution from GitHub, documentation, tests or production evidence;
- generalized record relationships or workflow orchestration;
- deletion, deduplication or rewriting of Product Gap history;
- changes to Gmail, Drive or Calendar reference architecture; or
- resolution of the three open Gmail observations merely because they are recorded in documentation.

## Sequencing decision

The next implementation PR must begin with a RED-only commit and recorded failing run bounded to the missing contracts above. Production implementation follows in later commits only after those regressions demonstrate the current structural absence; the final PR must return the full repository to green. Drive and Gmail #19 are the first two real acceptance targets; no other Product Gap lifecycle transitions are authorized by this freeze.
