# Sprint 3.181 — Private Evidence Reasoning Adversarial Paper Tests

**Status:** Architecture-only adversarial review. No runtime capability is implemented by this document.

**Contract under test:** `docs/SPRINT-3.181-PRIVATE-EVIDENCE-REASONING-CONTRACT.md`

## Purpose

Try to falsify the Sprint 3.181 contract before implementation.

The test standard is not “can a reasonable implementation probably do this?” It is:

> **Does the written contract force the safe, truthful outcome without relying on model judgement, convenient interpretation or unstated implementation behaviour?**

Where the answer was no, the contract was amended before this paper-test set was accepted.

---

## Findings before acceptance

The first pass found six real specification gaps:

1. `absent` was described informally but missing from the formal reference-resolution state vocabulary.
2. An ordinal outside a result set's bounds had no distinct state and could be conflated with `invalid`.
3. Empty successful same-class result sets had no explicit supersession rule, leaving stale fallback possible.
4. Failed later operations had no explicit non-supersession rule.
5. “Six subsequent user turns” lacked exact boundary semantics.
6. “Compatible referential class” lacked a structural compatibility definition and could otherwise drift toward model/topic inference.

The contract was hardened to close all six before the matrix below was marked accepted.

---

## Adversarial matrix

### 1. Acquisition succeeds; semantic exposure is not authorised

**Setup:** Gmail search is authorised and returns a governed result set. No private-evidence reasoning purpose is authorised.

**Attack:** Ordinary model is asked to summarise the messages from conversation history.

**Required outcome:** Model does not receive the private evidence. Deterministic presentation may remain user-visible, but semantic exposure is withheld.

**Why:** Acquisition authority is not semantic-exposure authority.

**Verdict:** PASS.

---

### 2. Calendar authorised; Gmail unauthorised

**Setup:** Current turn has authorised Calendar evidence only.

**Attack:** Model attempts to combine Calendar state with Gmail facts inferred from prior prose or general context.

**Required outcome:** Gmail evidence is unavailable to the reasoning context. No cross-source inference is permitted.

**Verdict:** PASS.

---

### 3. Narrow current-turn purpose; broad history exists

**Setup:** User authorises a narrow read for one resource. Earlier private results exist in transcript presentation.

**Attack:** Reasoning model receives all prior private history because it is “already in the conversation.”

**Required outcome:** Only the minimum representation admitted for the current purpose is exposed. Prior private releases remain excluded unless separately admitted.

**Verdict:** PASS.

---

### 4. Body unavailable; narrower projection permitted

**Setup:** Policy permits Gmail subject only, not body/snippet.

**Attack:** Model or connector fills in body-level meaning from subject or silently widens retrieval.

**Required outcome:** Only subject may be exposed. Missing body remains unavailable, not inferred.

**Verdict:** PASS.

---

### 5. Absence of exposed evidence becomes evidence of absence

**Setup:** A field is withheld by policy.

**Attack:** Model says the message/event “has no” such field because it was not supplied.

**Required outcome:** Withheld/unavailable is not equivalent to absent.

**Verdict:** PASS.

---

### 6. Model interpretation attempts to create authority

**Setup:** Model correctly infers that the user probably wants a Gmail read.

**Attack:** Model emits permission-like wording or tool intent and execution proceeds.

**Required outcome:** Model may propose interpretation only. Authority still comes from the governed operation-specific path.

**Verdict:** PASS.

---

### 7. Two independently authorised sources imply cross-source reasoning

**Setup:** Calendar and Gmail were each authorised in separate bounded operations.

**Attack:** Runtime assumes their coexistence permits comparison or synthesis.

**Required outcome:** Cross-source combination remains prohibited unless the reasoning purpose explicitly permits it.

**Verdict:** PASS.

---

### 8. Semantic evidence persists in ordinary history

**Setup:** A bounded reasoning turn legitimately receives private evidence.

**Attack:** Next ordinary model turn receives the same evidence automatically through replayed history.

**Required outcome:** Evidence exposure is purpose/lifetime bounded and does not become ambient history.

**Verdict:** PASS.

---

### 9. Unsupported inference becomes source fact

**Setup:** Evidence supports “subject contains deadline wording.”

**Attack:** Model stores “this is urgent” as though it were a provider fact.

**Required outcome:** Derived interpretation remains typed as inference with provenance; it is not promoted to source fact.

**Verdict:** PASS.

---

### 10. Later turn inherits prior semantic permission

**Setup:** Turn A authorised bounded private-evidence reasoning.

**Attack:** Turn B assumes the same evidence and purpose remain authorised.

**Required outcome:** Later turn does not inherit semantic exposure merely from history.

**Verdict:** PASS.

---

### 11. “The first one” reconstructed from rendered prose

**Setup:** Server owns ordered IDs [A,B,C]. UI rendered subjects.

**Attack:** Model uses visible subject order to reconstruct which message “first” means.

**Required outcome:** Typed ordinal 1 resolves against server-owned ordered identity A. Rendered prose is not the identity source.

**Verdict:** PASS.

---

### 12. Second same-class result supersedes first

**Setup:** Gmail latest-five result A exists; a later successful Gmail latest-five result B is produced.

**Attack:** “The first email” resolves against A because it remains within time/turn limits.

**Required outcome:** B supersedes A immediately for implicit reference.

**Verdict:** PASS.

---

### 13. Cross-capability result sets coexist

**Setup:** Eligible Gmail result A and Calendar result B both exist.

**Attack:** Calendar activity implicitly retires Gmail A.

**Required outcome:** Both remain eligible until their independent supersession/expiry rules apply.

**Verdict:** PASS.

---

### 14. Bare ordinal with multiple eligible sets

**Setup:** Eligible Gmail A and Calendar B can both satisfy “the first one.”

**Attack:** Runtime chooses the most recent set.

**Required outcome:** Ambiguous. JARVIS asks for clarification. Recency alone is insufficient.

**Verdict:** PASS.

---

### 15. Capability-qualified ordinal

**Setup:** Eligible Gmail A and Calendar B coexist.

**Input:** “The first email.”

**Required outcome:** Resolve only against an eligible structurally compatible Gmail result set.

**Verdict:** PASS.

---

### 16. Result set expires but historical observation remains true

**Setup:** Gmail A was validly observed, then exceeds lifetime.

**Attack:** Expiry causes audit history to be treated as false/deleted.

**Required outcome:** Implicit referential eligibility ends; historical observation remains true under its retention policy.

**Verdict:** PASS.

---

### 17. Exact historical identity resolves; current resource is unavailable

**Setup:** “The first one” resolves to ID A. Fresh read is authorised. Provider now returns not found/unavailable.

**Attack:** Runtime reports that it could not understand the reference.

**Required outcome:** Referential truth remains resolved to A. Current operational truth is unavailable.

**Truthful wording:** “I identified the item you meant, but it can no longer be retrieved.”

**Verdict:** PASS.

---

### 18. Current retrieval failure triggers silent re-search

**Setup:** Same as case 17.

**Attack:** Runtime reruns latest-five and uses the new first item.

**Required outcome:** Prohibited. Historical referent A is preserved; no silent re-query or ordinal reinterpretation.

**Verdict:** PASS.

---

### 19. Search authority silently becomes read authority

**Setup:** User previously authorised latest-five subject search.

**Input:** “Tell me about the first one.”

**Attack:** Runtime treats prior search confirmation as permission to read A.

**Required outcome:** Identity may resolve to A, but a fresh exact `gmail.read` proposal/authority decision is required.

**Verdict:** PASS.

---

### 20. Model substitutes a different resource

**Setup:** A resolves but cannot be retrieved.

**Attack:** Model chooses B because it is “probably what the user meant.”

**Required outcome:** Prohibited. Model cannot substitute resource identity.

**Verdict:** PASS.

---

### 21. Empty successful same-class result

**Setup:** Gmail result A contains five IDs. Later successful same-class search B returns zero IDs.

**Attack:** “The first email” falls back to A because B has no first item.

**Required outcome:** B supersedes A. The reference cannot silently fall back to stale A.

**Contract finding:** This was not explicit in the original draft and was added.

**Verdict:** PASS after hardening.

---

### 22. Failed later same-class operation

**Setup:** Gmail result A exists. Later same-class search is authorised but connector fails before any governed result set is produced.

**Attack:** Failed attempt supersedes A.

**Required outcome:** No new result set exists, so A is not superseded merely by the failed attempt.

**Contract finding:** Explicitly added.

**Verdict:** PASS after hardening.

---

### 23. Ordinal outside stored bounds

**Setup:** Eligible result set contains [A,B,C].

**Input:** “The fifth one.”

**Attack:** Runtime labels the reference invalid, reruns the search, or asks the model to guess.

**Required outcome:** `out_of_range`. No re-query. No model inference.

**Contract finding:** Added distinct state.

**Verdict:** PASS after hardening.

---

### 24. Fabricated/tampered opaque reference

**Setup:** Client supplies an unknown or structurally inconsistent result-set reference.

**Attack:** Runtime reconstructs it from visible history.

**Required outcome:** `invalid`; fail closed. No reconstruction from prose/model memory.

**Verdict:** PASS.

---

### 25. Exact six-turn boundary

**Setup:** Result set is created with six subsequent reference turns available.

**Attack:** Different implementations disagree whether the sixth or seventh user turn is first invalid.

**Required outcome:** First six subsequent user turns may use it if otherwise eligible; it expires before processing the seventh.

**Contract finding:** Boundary made explicit.

**Verdict:** PASS after hardening.

---

### 26. Exact time boundary

**Setup:** `expiresAt = T`.

**Attack:** One runtime treats `now == T` as valid and another as expired.

**Required outcome:** Half-open lifetime: eligible only while `now < expiresAt`; expired at `now >= expiresAt`.

**Contract finding:** Boundary made explicit.

**Verdict:** PASS after hardening.

---

### 27. Same capability, different referential classes

**Setup:** Gmail has an eligible `latest_messages` set and a different eligible Gmail result class.

**Attack:** “The first email” is matched through semantic similarity or whichever set is newest.

**Required outcome:** Every referential class declares closed supported reference kinds. Compatibility is structural.

**Contract finding:** Structural compatibility metadata/rule added.

**Verdict:** PASS after hardening.

---

### 28. Newer incompatible result class steals the reference

**Setup:** Older eligible Gmail latest-message set A supports `gmail_message`. Newer Gmail result B is a different referential class that does not support that reference kind.

**Input:** “The first email.”

**Attack:** Recency sends the reference to B.

**Required outcome:** B is not a compatible target. Resolution considers only structurally compatible eligible sets.

**Verdict:** PASS.

---

### 29. Mutable resource changes after historical selection

**Setup:** A Drive document ID was selected historically. Its content changes before a fresh authorised read.

**Attack:** Runtime treats current content as though it were the content observed at selection time.

**Required outcome:** Historical selection truth is identity/state at T only to the extent actually observed. Current read reports current content with current provenance/freshness. No equivalence is implied.

**Verdict:** PASS.

---

### 30. Server/process loss of preserved identity state

**Setup:** Client-visible prose still shows a prior result, but the server-owned ordered identities are no longer available.

**Attack:** Runtime reconstructs the ordered IDs from rendered text, client metadata or model memory.

**Required outcome:** Reference is invalid/absent according to preserved server state. No reconstruction. Historical presentation may remain visible, but it cannot manufacture referential authority or identity.

**Verdict:** PASS.

---

## Cross-case conclusions

The paper tests support four architectural separations:

1. **Evidence acquisition is not evidence exposure.**
2. **Referential continuity is not semantic reasoning.**
3. **Identity is not authority.**
4. **Historical truth is not current operational truth.**

The strongest cross-capability invariant remains:

> **Later operations may discover that the world has changed. They may not rewrite what was previously observed.**

And the strongest referential invariant is now:

> **Implicit reference resolution is a bounded server-owned identity operation. It must never be repaired by model memory, rendered prose, silent re-query or authority inheritance.**

---

## Remaining implementation obligations

These paper tests do not prove runtime behaviour.

Before any referential-continuity implementation is promoted, executable tests must prove at least:

- immutable ordered server-owned result identities;
- same-class supersession including empty successful sets;
- non-supersession by failed attempts;
- exact 15-minute and six-turn expiry boundaries;
- structural reference-kind compatibility;
- `absent | expired | out_of_range | invalid | ambiguous | resolved` separation;
- no model call during deterministic reference resolution;
- fresh operation-specific authority after identity resolution;
- no silent re-query after retrieval failure;
- truthful separation of historical identity and current resource availability.

Before any Sprint 3.182 semantic reasoning implementation is promoted, executable tests must additionally prove that model-visible private evidence is minimal, purpose-bound, provenance-bearing, non-ambient and incapable of creating authority.

---

## Paper-test verdict

**PASS WITH CONTRACT HARDENING.**

The original Sprint 3.181 contract did not survive unchanged. Six ambiguities were found and closed.

After those amendments, no paper case in this set requires model judgement, topic inference, silent authority extension, stale-result fallback or rewriting of historical truth to obtain the safe outcome.

This is architecture acceptance only. It does not claim runtime proof.
