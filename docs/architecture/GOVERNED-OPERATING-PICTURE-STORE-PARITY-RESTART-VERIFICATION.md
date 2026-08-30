# Governed Operating Picture — Store Parity & Restart Durability Verification

**Date:** 30 August 2026  
**Status:** Verified bounded milestone  
**Next authorised milestone:** Purpose-Bounded Durable Projection

## 1. Proving question

> Can JARVIS restart and recover durable Operating Picture continuity without persistence manufacturing trust, reviving process-local authority, or silently accepting inconsistent durable state?

**Verdict: yes, within the bounded implementation described below.**

The milestone does not prove that persisted governed facts become trusted again after restart. It proves the opposite boundary: persisted rows remain low-trust durable history, restart recovery classifies what may survive as continuity, and governed-source records remain subject to source revalidation before they can regain trusted status.

## 2. Verified implementation sequence

- **PR #476:** extracted a closed `OperatingPictureStore` contract and instance-owned in-memory implementation while preserving the legacy module facade.
- **PR #477:** added low-trust Supabase version/head/history reads, exact row validation, chain reconstruction, integrity failure handling, and compile-time barriers against trust rehydration.
- **PR #478:** classified restart recovery into `recoverable_user_continuity`, `recoverable_model_continuity`, and `requires_source_revalidation`.
- **PR #479:** added bounded durable-head discovery so a fresh process does not depend on process-local record IDs.
- **PR #480:** added all-record restart snapshot recovery with before/after head-set stability checks so mixed-time recovery fails closed.
- **PR #481:** directly verified recovery-scope limits, including exact-bound acceptance, max+1 rejection, and provider over-page rejection.

## 3. Store parity and durable-read properties

Directly tested properties include:

- fresh in-memory store instances preserve append/reject/head/history behaviour;
- separate store instances do not share process-global state;
- a fresh process begins with no accidental in-memory continuity;
- persisted rows are validated before use rather than cast into trusted records;
- exact version reads return only low-trust `PersistedOperatingPictureVersion` values;
- durable history is reconstructed from head identity and `previous_version_id`, not provider response order;
- missing heads, orphaned predecessors, disconnected branches, duplicate IDs, malformed semantic/source shapes, and provider failures fail closed;
- persisted rows cannot be assigned to `OperatingPictureRecord`, `GovernedEvidence`, or `AuthorityEvidence` by type.

## 4. Restart recovery properties

After restart:

- user-authored assertions/preferences/plans/commitments/decisions may survive as historical user continuity;
- model-authored inferences/recommendations/open questions may survive only as low-trust model continuity;
- persisted `fact` records require source revalidation;
- governed-source plan/commitment/decision records require source revalidation;
- durable not-found/integrity/provider failures propagate rather than being converted into invented recovery;
- recovered continuity cannot be assigned to trust-bearing Operating Picture/evidence/authority types.

## 5. Stable all-record snapshot

A full restart snapshot is accepted only when:

1. the durable head set is discovered;
2. every discovered record history is recovered;
3. every recovered head exactly matches the originally discovered head;
4. the durable head set is discovered again;
5. the before/after head sets are identical.

Any record added, removed, or advanced during recovery produces `recovery_snapshot_changed` rather than a mixed-time snapshot.

An empty snapshot is accepted only when the store is empty both before and after the recovery check.

## 6. Bounded head discovery

Production defaults remain:

- page size: **250**;
- maximum durable heads: **10,000**.

Direct tests now prove:

- exact configured maximum is accepted;
- maximum + 1 is rejected with `recovery_scope_exceeded`;
- provider responses larger than the requested page size are rejected with `persistence_integrity_failure`.

The final post-loop guard remains defensive redundancy; under normal integer pagination an overflowing full page reaches the accumulated-head guard first. No synthetic claim is made that unreachable control flow was independently exercised.

## 7. What this milestone does not prove

The following remain unearned:

- persisted governed facts becoming trusted without source reacquisition;
- automatic repopulation of the high-trust in-memory `OperatingPictureStore`;
- generic durable memory access by the model;
- automatic extraction from ordinary chat;
- embeddings/vector search;
- broad Calendar/Gmail/Drive ingestion;
- cross-source executive synthesis from durable state;
- proactive notification or autonomous action.

## 8. Promotion decision

> **Store Parity & Restart Durability — VERIFIED WITHIN BOUNDED SCOPE**

The next implementation may build a deterministic, purpose-bounded projection over the recovered low-trust snapshot. It may not treat `requires_source_revalidation` records as current facts, bypass visibility rules, or expose the whole durable store to a model.

### Next proving question

> Can deterministic code select only the durable continuity that is legally visible and semantically usable for an explicit purpose, while excluding source-backed records that require revalidation and preserving lifecycle/semantic distinctions?