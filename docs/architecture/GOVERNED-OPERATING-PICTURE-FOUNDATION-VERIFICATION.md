# Governed Operating Picture — Foundation Verification Record

**Date:** 30 August 2026  
**Status:** Historical foundation verification; Store Parity & Restart Durability was subsequently verified on 30 August 2026. See `GOVERNED-OPERATING-PICTURE-STORE-PARITY-RESTART-VERIFICATION.md`.  
**Scope:** Records what has actually been implemented and directly verified. This document does not claim that model-facing durable memory, automatic capture, embeddings, broad connector ingestion, or proactive cognition are complete.

## 1. Architectural question

> Can JARVIS retain continuity about the user's operating world without allowing persistence, model prose, stale state, or remembered authority to become a new source of truth?

The verified foundation answers this only for the bounded semantic, lifecycle, versioning, replacement, and durable-storage layers described below.

## 2. Semantic and lifecycle foundation — verified

The in-memory foundation was built through the Governed Operating Picture PR sequence and verified individually, as a combined suite, against the whole repository, and through a production build.

Verified properties include:

- closed semantic classes: `fact`, `user_assertion`, `inference`, `plan`, `commitment`, `decision`, `preference`, `recommendation`, `open_question`;
- explicit lifecycle states: `current`, `stale`, `superseded`, `withdrawn`;
- stable subject identity separated from revision semantics;
- explicit revision modes: `append_only`, `explicit_replacement`, `authoritative_snapshot`;
- separate explicit-replacement and authoritative-snapshot proof boundaries;
- typed supersession transitions with no generic public supersede escape hatch;
- immutable version history rather than record overwrite;
- server-owned exact-head store semantics;
- exact explicit-replacement references, one-shot confirmation and stale-head rejection;
- nested authority/proof-bearing payload exclusion;
- governed-source plans, commitments and decisions requiring governed evidence plus provenance rather than caller-selected pseudo-governed labels.

### Verification evidence

- Operating Picture runtime suite: **24/24 tests passed** before the final semantic-containment PR.
- Whole-repository regression at that checkpoint: **1,844 tests passed, 1 skipped**.
- Production Next.js build completed successfully.
- Final semantic trust containment landed in PR #472 and the subsequent live UI smoke test exposed an unrelated ordinary-conversation/web-failure fallback bug, fixed separately in PR #473.

## 3. Supabase persistence foundation — verified live

PR #474 introduced a deliberately low-trust durable representation and an append-only Supabase schema. The database was then applied manually to the dedicated JARVIS Supabase project and verified directly in the live SQL environment.

Verified live database properties:

- `operating_picture_versions` exists with Row Level Security enabled;
- `operating_picture_heads` exists with Row Level Security enabled;
- zero browser-facing policies exist for either table;
- version rows have live `UPDATE` and `DELETE` rejection triggers;
- `append_operating_picture_version(...)` exists and is `SECURITY DEFINER`;
- initial append succeeds;
- a second initial version for the same logical record is rejected with `record_already_exists`;
- a transition from a non-existent previous version is rejected with `previous_version_not_found`;
- an attempted lifecycle transition that mutates non-lifecycle semantic data is rejected with `transition_invalid`;
- a valid `current → stale` transition succeeds when all non-lifecycle fields are preserved exactly;
- immutable history remains present after head advancement;
- the head pointer moves to the new version;
- a later transition attempt from the old non-head version is rejected with `previous_version_not_current_head`.

## 4. Persistence trust boundary

The durable representation intentionally stores semantic payload plus lifecycle, subject, visibility, authorship and provenance metadata without serialising reusable authority, policy proof, verification proof, completion proof, or TypeScript trust brands.

> **Persistence preserves governed history. It does not recreate trust.**

A row read from Supabase is durable data. It is not automatically `GovernedEvidence`, fresh provider truth, authority, policy proof, verification proof, or completion proof.

## 5. What was not yet earned at this checkpoint

The following were explicitly unverified and unauthorised when this foundation record was frozen. Store parity, low-trust durable reads, bounded head discovery and stable restart recovery were subsequently verified in the next milestone record:

- restart recovery into the server-owned store;
- parity between the in-memory store contract and durable persistence under all append/reject/head/history cases;
- read-side reconstruction from persisted rows;
- purpose-bounded durable retrieval;
- model-facing Operating Picture continuity;
- automatic extraction from ordinary chat;
- embeddings/vector search;
- broad Calendar/Gmail/Drive ingestion;
- cross-source executive synthesis from durable state;
- proactive notifications or autonomous action.

## 6. Historical next milestone

> **Governed Operating Picture — Store Parity & Restart Durability**

This was the next authorised build at the time of this record. It has since been completed and promoted to verified bounded status.

### Current proving question

> Can JARVIS restart and recover the same governed Operating Picture state without persistence manufacturing trust or diverging from the in-memory contract?

### Explicit exclusions

No model retrieval, embeddings, automatic chat-memory extraction, broad connector ingestion, proactive behaviour, autonomous action, or generic ambient-memory API.

## 7. Governing invariants

The next milestone is governed by the existing `OPERATING-PICTURE-01` through `OPERATING-PICTURE-10` rules plus:

> **PERSISTENCE-TRUST-01:** A persisted row is durable data/history, not a trust-bearing value. Reading data from storage must never by itself construct `GovernedEvidence`, `AuthorityEvidence`, policy proof, verification proof, completion proof, or fresh provider truth.

> **STORE-PARITY-01:** Durable persistence must reproduce the already-verified Operating Picture append/reject/head/history semantics. A persistence adapter may not create a second semantic source of truth or silently weaken lifecycle, identity, replacement, staleness, or replay invariants.

> **RESTART-DURABILITY-01:** After process restart, JARVIS may recover only the durable Operating Picture state that was validly persisted. Restart recovery must not revive consumed authority, pending approval, stale references, model-only context, or any process-local governance state.

## 8. Promotion decision

**Foundation promoted to verified bounded status.**

This promotion remains valid historical evidence. The later Store Parity & Restart Durability milestone is recorded separately and does not retroactively change what this foundation record proved at the time.