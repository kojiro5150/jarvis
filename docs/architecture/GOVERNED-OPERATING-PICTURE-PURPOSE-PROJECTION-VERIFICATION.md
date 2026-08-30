# Governed Operating Picture — Purpose-Bounded Durable Projection Verification

**Date:** 30 August 2026  
**Status:** Verified bounded milestone  
**Next authorised milestone at time of promotion:** Narrow Model-Facing Continuity

> **Follow-on status:** Narrow Model-Facing Continuity was subsequently implemented and verified within bounded explicit-recall scope. See `GOVERNED-OPERATING-PICTURE-MODEL-CONTINUITY-VERIFICATION.md`. Sections below describing model-facing use as unearned record the boundary that existed when this milestone was promoted; they are historical, not the current roadmap state.

## 1. Proving question

> Can deterministic code select only durable continuity that is legally visible and semantically usable for an explicit purpose, while excluding source-backed records that require revalidation and preserving lifecycle/semantic distinctions?

**Verdict: yes, within the bounded implementation and live acceptance scope described below.**

## 2. Implemented boundary

The milestone was implemented across PRs #483–#487.

- **PR #483:** deterministic purpose projection gate over stable low-trust restart state;
- **PR #484:** payload-free durable metadata preflight;
- **PR #485:** two-stage single-head retrieval where semantic payload is fetched only after purpose/lifecycle/source admission;
- **PR #486:** stable whole-store purpose retrieval with before/after durable head-set equality;
- **PR #487:** server-only read-only live REST verification harness.

Admission requires:

1. explicit requested purpose;
2. exact durable head identity;
3. lifecycle exactly `current`;
4. recovery disposition `recoverable_user_continuity` or `recoverable_model_continuity`;
5. requested purpose present in `visibilityPurposes`.

Records classified as `requires_source_revalidation` are excluded before semantic payload retrieval.

## 3. Retrieval-time privacy and trust properties

Direct tests prove:

- payload-free preflight reads do not select semantic payload;
- hidden records do not trigger semantic payload retrieval;
- stale, superseded and withdrawn records do not trigger semantic payload retrieval;
- governed/source-backed records requiring revalidation do not trigger semantic payload retrieval;
- invalid purpose performs no durable read;
- preflight/provider failure stops before payload retrieval;
- full-row metadata must exactly match admitted preflight metadata;
- only exact durable heads are eligible;
- mixed-time whole-store projections fail closed when the head set changes;
- projection remains low-trust and cannot become `OperatingPictureRecord`, `GovernedEvidence`, or `AuthorityEvidence` by type.

## 4. Live server REST verification

The live verification harness exercised the real local JARVIS server code using `.env.local` configuration and the Supabase server secret. It did not use a public debug route and did not print the secret or raw semantic payload.

### Live Test 1 — durable head discovery

Command:

```bash
npm run verify:operating-picture:live -- heads
```

Observed result:

- `status: found`;
- count: **2**;
- `test:live:record:1` → `11111111-1111-4111-8111-111111111111`;
- `test:live:record:2` → `66666666-6666-4666-8666-666666666666`.

**PASS.**

### Live Test 2 — independent database falsification

An independent Supabase SQL query against `operating_picture_heads` returned the same two record/version pairs exactly.

**PASS.**

### Live Test 3 — payload-free preflight

Command:

```bash
npm run verify:operating-picture:live -- preflight 11111111-1111-4111-8111-111111111111
```

Observed metadata:

- record: `test:live:record:1`;
- semantic class: `user_assertion`;
- lifecycle: `current`;
- visibility purposes: `["test"]`;
- authorship source: `user`;
- provenance source: `null`;
- no semantic payload returned.

**PASS.**

### Live Test 4 — purpose-gated single-head retrieval

Command:

```bash
npm run verify:operating-picture:live -- retrieve test:live:record:1 11111111-1111-4111-8111-111111111111 test
```

Observed result:

- `status: admitted`;
- exact record/version identity preserved;
- purpose: `test`;
- semantic class: `user_assertion`;
- lifecycle: `current`;
- recovery disposition: `recoverable_user_continuity`;
- visibility purposes: `["test"]`;
- raw payload not printed;
- payload represented only by SHA-256 fingerprint `b9e0335b2190572a139c2e480919afa3b178f0aec334285ff2ce1e6533193d42`.

**PASS.**

### Live Test 5 — stable whole-store projection

Command:

```bash
npm run verify:operating-picture:live -- project test
```

Observed result:

- `status: projected`;
- purpose: `test`;
- item count: **1**;
- `test:live:record:1` admitted as `recoverable_user_continuity`;
- `test:live:record:2` excluded with `lifecycle_not_current`;
- the admitted payload fingerprint exactly matched Live Test 4;
- the projection completed the before/after durable head-set stability check successfully.

**PASS.**

## 5. What this milestone proves

The actual production-path shape has now been observed end to end:

```text
JARVIS server
    ↓
Supabase REST
    ↓
bounded durable head discovery
    ↓
payload-free exact-head preflight
    ↓
purpose + lifecycle + recovery/source admission
    ↓
conditional semantic payload retrieval
    ↓
before/after durable head-set stability check
    ↓
low-trust purpose-bounded projection
```

Purpose-bounded durable projection is therefore verified both structurally and operationally within the bounded scope.

## 6. What remains unearned

The following remain explicitly unverified and unauthorised:

- model-facing use of durable projection;
- automatic injection of durable continuity into ordinary conversation;
- model reinterpretation of user/model continuity as fact;
- source reacquisition for `requires_source_revalidation` records;
- automatic chat-memory extraction;
- embeddings/vector search;
- broad connector ingestion;
- cross-source executive synthesis from durable state;
- proactive notification or autonomous action.

## 7. Promotion decision

> **Purpose-Bounded Durable Projection — VERIFIED WITHIN BOUNDED SCOPE**

The next implementation may expose a deliberately narrow purpose-bounded projection to one controlled model-facing context. It may not expose the durable store directly, bypass projection admission, treat user/model continuity as current fact, or include `requires_source_revalidation` records.

That first model-facing experiment is additionally constrained to a **closed, typed model response contract** validated deterministically before presentation. Free-form narrative synthesis directly from projected durable items is not authorised at this stage. Non-conforming model output must fail closed rather than being repaired, loosely interpreted, or presented.

### Next proving question

> Can JARVIS use a narrow purpose-bounded durable projection in model-facing reasoning without promoting remembered user/model continuity into fact, widening visibility, or bypassing source revalidation?