# Governed Operating Picture — Explicit User-Authored Continuity Capture Verification

**Date:** 1 September 2026  
**Status:** Verified bounded milestone  
**Promotion state:** Live conversational capture → durable Operating Picture persistence → independent database verification → later governed recall

## 1. Proving question

> Can JARVIS persist a continuity item only when the user explicitly asks it to remember something, while preserving the user's authorship and semantic class, preventing model interpretation from becoming authorship or fact, and avoiding ambient transcript capture or new authority?

Within the deliberately bounded first experiment, the answer is now **yes**.

This verification does not authorise ambient memory, background transcript extraction, generic natural-language capture intent, model-authored durable facts, automatic reconciliation, source revalidation, proactive behaviour, or autonomous action.

## 2. Architecture verified

The live production path is:

~~~text
explicit current-turn remember/retain instruction
        ↓
deterministic capture-intent grammar
        ↓
closed semantic classifier
        ↓
deterministic classification validation
        ↓
user-authored append-only capture candidate
        ↓
existing Operating Picture record/version construction
        ↓
existing Supabase append boundary
        ↓
deterministic acknowledgement only after append success
~~~

Later recall uses the already-verified model-facing continuity path:

~~~text
durable Operating Picture continuity
        ↓
purpose-bounded projection
        ↓
closed relevance assessment
        ↓
deterministic validation and exact binding
        ↓
bounded deterministic presentation
~~~

The write and read paths are therefore now joined in production.

## 3. Governing invariants exercised

The verified path preserved the frozen capture and read invariants:

- `USER-CONTINUITY-CAPTURE-01` — capture began only from an explicit current-turn remember instruction.
- `USER-CONTINUITY-CAPTURE-02` — the durable payload preserved the user's statement rather than a model paraphrase or rationale.
- `USER-CONTINUITY-CAPTURE-03` — the live example was stored as `preference`, not promoted to `fact`.
- `USER-CONTINUITY-CAPTURE-04` — persistence reused the existing append-only Operating Picture mechanism.
- `USER-CONTINUITY-CAPTURE-05` — semantic classification passed through the closed validated contract.
- `USER-CONTINUITY-CAPTURE-06` — the new conversational records used `append_only`.
- `USER-CONTINUITY-CAPTURE-07` — capture intent remained deterministic and did not become a model decision.
- `USER-CONTINUITY-CAPTURE-08` — ambiguity remained fail-closed and clarification was bound to the original user statement.
- `USER-CONTINUITY-READ-01` — multiple current admissible user-authored records were not silently reconciled or hidden.

## 4. Implementation sequence

The bounded capture architecture was delivered in small independently reviewable steps:

- PR #496 — closed Narrow Model-Facing Continuity and governed explicit capture.
- PR #497 — froze append-only revision and conflict semantics.
- PR #498 — froze deterministic capture intent and fail-closed semantic ambiguity.
- PR #499 — implemented the explicit capture candidate contract.
- PR #500 — persisted candidates through the existing Operating Picture store and added compile-time authorship/trust proofs.
- PR #501 — added the required closed semantic classifier boundary.
- PR #502 — wired explicit capture into the sole production chat runtime.
- PR #503 — closed the final clarification honesty gap so an unrecognised clarification cannot silently fall through to ordinary model conversation.

The production threshold path is therefore not one large memory feature. Each trust boundary was implemented and verified before the next was connected.

## 5. Live acceptance evidence

### 5.1 First real conversational write

Live JARVIS input:

> Remember that I prefer short status updates.

Live deterministic response:

> Remembered.

Independent Supabase verification then established a real durable row with:

- `record_id = user-continuity:05aaec41-0c69-4f00-8ca4-32d1ac8dfdb4`
- `version_id = 4ebda198-589f-4d6c-8599-1c7bd45dc41c`
- `previous_version_id = null`
- `semantic_class = preference`
- `lifecycle = current`
- `subject_namespace = user_continuity`
- `subject_attribute = preference`
- `revision_semantics = append_only`
- `visibility_purposes = ["conversation"]`
- payload exactly `{"statement":"I prefer short status updates."}`
- `authorship_source = user`
- `provenance_source = null`
- current head exactly equal to the persisted `version_id`

This independently falsified the possibility that the UI success message was merely a conversational claim with no durable write behind it.

### 5.2 Unique capture-to-recall proof

A second live statement was chosen specifically to avoid collision with any previously seeded test fixture:

> Remember that my preferred JARVIS test phrase is cobalt lighthouse.

JARVIS returned:

> Remembered.

A later live recall request:

> What do you remember about my preferred JARVIS test phrase?

returned the same user-authored continuity with explicit preference attribution:

> You previously stated a preference: {"statement":"my preferred JARVIS test phrase is cobalt lighthouse."}

Independent Supabase verification found exactly one matching durable record:

- `record_id = user-continuity:ddfb007b-e14c-4da9-ad71-22d3eba0de24`
- `version_id = fda0cf95-0e2f-4af8-9c1c-ed69f9dedd87`
- `semantic_class = preference`
- `lifecycle = current`
- `subject_namespace = user_continuity`
- `subject_attribute = preference`
- `revision_semantics = append_only`
- `visibility_purposes = ["conversation"]`
- payload exactly `{"statement":"my preferred JARVIS test phrase is cobalt lighthouse."}`
- `authorship_source = user`
- `provenance_source = null`
- current head exactly equal to the persisted `version_id`

This is the first clean production proof that a statement created through ordinary JARVIS conversation can later be retrieved through the governed continuity read path.

## 6. Unplanned duplicate-history test

The first status-update recall rendered the same statement twice.

An exhaustive database query established that this was not duplicate processing of one durable record. Two distinct current rows existed with the same payload:

1. historical seeded verification fixture:
   - `record_id = test:live:conversation:1`
   - recorded 30 August 2026
   - `subject_namespace = user`
   - `revision_semantics = explicit_replacement`

2. genuine conversational capture:
   - `record_id = user-continuity:05aaec41-0c69-4f00-8ca4-32d1ac8dfdb4`
   - recorded 1 September 2026
   - `subject_namespace = user_continuity`
   - `revision_semantics = append_only`

Both were current and visible for conversation.

The read path therefore did not silently choose a winner, remove an admissible current record, or invent latest-wins semantics. This unplanned collision is consistent with `USER-CONTINUITY-READ-01`.

No presentation-equivalence, deduplication, reconciliation, or fixture-deletion work is authorised by this observation.

## 7. Clarification fail-closed correction

Before live acceptance began, direct source review found one threshold-path honesty gap: a valid pending clarification could be consumed by an unrelated next utterance and then fall through to ordinary model conversation without acknowledging that the memory request had been discarded.

PR #503 changed that path so a valid consumed clarification with an unrecognised class reply remains handled and returns a deterministic unsaved-memory response. The reference remains one-shot; nothing is persisted; no class is guessed; ordinary model conversation does not manufacture a memory-success claim.

This correction was merged and CI-verified before the live write tests above.

## 8. Promotion decision

> **Governed Operating Picture — Explicit User-Authored Continuity Capture**
>
> **VERIFIED WITHIN BOUNDED LIVE SCOPE**

The repository may now treat explicit user-authored durable conversational continuity as a proven substrate.

The verified claim is intentionally specific:

> JARVIS can accept an explicit current-turn user instruction to remember a bounded user-authored statement, classify it through a closed fail-closed semantic boundary, persist it as low-trust append-only Operating Picture continuity, independently recover that durable state, and later present the same continuity with semantic class and user authorship preserved.

It must not be shortened into claims such as "JARVIS remembers everything", "JARVIS has automatic memory", "JARVIS knows this is true", or "conversation history is now durable memory".

## 9. Next product direction

This milestone closes a substrate gap. It is not a reason to continue expanding memory by adjacency.

The next work returns to the existing JARVIS product trajectory:

> **everyday executive cognition — awareness, orientation, attention, capacity understanding, planning support, role-aware context, and eventually a stronger voice-first experience**

The immediate next implementation question should be selected from observed everyday executive value, not from whatever Operating Picture mechanism happens to be adjacent in the codebase.

Automatic transcript extraction, embeddings, generic memory, automatic preference replacement, conflict resolution, proactive memory capture, and broad cross-source context remain separate future governance questions and are not the default next sprint.
