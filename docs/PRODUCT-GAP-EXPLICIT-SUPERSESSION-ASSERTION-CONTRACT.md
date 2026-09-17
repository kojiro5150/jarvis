# Product Gap explicit supersession assertion — frozen contract

**Status:** **LIVE PASS / FROZEN** on 17 September 2026. Implemented in PR #573 and promoted only after the exact production relationship and both lifecycle projections were inspected. See `PRODUCT-GAP-EXPLICIT-SUPERSESSION-ASSERTION-LIVE-PASS.md`.

## Scope

This capability records one explicit user-authored `superseded_by` relationship between:

- one exactly selected active Product Gap whose factual diagnosis is wrong; and
- one exactly selected existing Product Gap that replaces it with the accurate diagnosis.

The first proving case is the historical claim that successful `Reply exactly with control test complete` showed the Gmail-action misclassification depended on earlier Gmail conversation state. Direct source inspection and the decisive control later established that the utterance itself contained both `reply` and `Gmail`; the earlier diagnosis is therefore superseded, not resolved.

## Core invariant

Supersession is not resolution. The target was not a defect that became fixed; its content was replaced by a more accurate statement. Neither durable Product Gap is edited, deleted, re-authored or lifecycle-mutated. JARVIS appends one separate user-authored decision assertion:

```text
target Product Gap --superseded_by--> exact successor Product Gap
```

The successor's effective resolution status is independent. Selecting it as a successor never reactivates, resolves or otherwise changes it.

## Closed interaction

The only supported production sequence is:

1. `Show me the active JARVIS product gaps for supersession.`
2. `Select product gap N for supersession.`
3. `Select product gap N as successor.`
4. `Mark this product gap as superseded.`

Lists contain at most ten numbered records per page. Paging uses `Show me the next JARVIS product gap supersession candidates.` All binding is positional against opaque server-owned state. No model chooses or infers either record.

## Persistence

The assertion is a user-authored append-only decision with:

- namespace `product_gap_supersession`;
- attribute `successor`;
- relationship `superseded_by`;
- exact target record ID;
- exact successor record ID and selected head version;
- deterministic internal assertion identity derived from the target record ID.

The client receives only one opaque staged reference with a 15-minute TTL. It contains no durable record IDs. The final reference is one-shot.

Immediately before append, JARVIS revalidates that:

- both exact records still exist at the selected heads;
- both are user-authored append-only Product Gaps;
- target and successor differ;
- the target remains active, neither resolved nor already superseded;
- a deterministic assertion-ID collision has not occurred.

## Projection

A valid supersession assertion removes only its target from the active Product Gap projection. History preserves:

- the original target statement with derived `superseded` status;
- the exact successor statement with its independently derived status;
- the append-only assertion linking them.

Invalid, duplicate, orphaned or structurally malformed assertions fail the entire lifecycle projection closed.

## Explicit exclusions

This contract does not authorize:

- a general `corrected` status;
- duplicate detection or weather-gap deduplication;
- splitting a mixed-scope Product Gap;
- semantic similarity or model-authored record selection;
- bulk reconciliation;
- treating `resolved` as a substitute for `superseded`;
- mutation of either original Product Gap;
- arbitrary supersession outside the closed Product Gap path.

The accurate-but-duplicated weather records and the mixed long-session/Gmail-routing record remain untouched.

## Acceptance

Repository tests must prove:

1. exact target and successor selection uses only opaque state and closed ordinals;
2. the real item-5 shape can select the wrong diagnosis and the exact accurate successor;
3. an already-resolved successor remains resolved and unchanged;
4. the target leaves the active projection only after a separate append succeeds;
5. target and successor originals remain unchanged;
6. descriptive targeting and model selection are contained before any ordinary-model call;
7. missing, expired, wrong-stage, replayed, fabricated and out-of-range references fail closed;
8. changed heads, missing records, self-supersession, resolved targets, duplicate and concurrent writes fail closed;
9. resolution cannot later close an already-superseded target;
10. no schema migration or general lifecycle broadening occurs.

Production promotion additionally required the exact historical wrong diagnosis to disappear from the active view, remain visible as superseded in history, point to the exact accurate diagnosis, and leave that successor's existing status unchanged. That proof passed on 17 September 2026.
