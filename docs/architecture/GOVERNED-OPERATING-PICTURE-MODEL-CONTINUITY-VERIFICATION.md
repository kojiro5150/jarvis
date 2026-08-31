# Governed Operating Picture — Narrow Model-Facing Continuity Verification

**Date:** 30 August 2026  
**Status:** Verified bounded milestone  
**Next authorised milestone:** Explicit User-Authored Continuity Capture

## 1. Proving question

> Can JARVIS use a narrow purpose-bounded durable projection in model-facing reasoning without promoting remembered user/model continuity into fact, widening visibility, or bypassing source revalidation?

**Verdict: yes, within the bounded implementation and live acceptance scope described below.**

## 2. Implemented boundary

The milestone was implemented across PRs #489–#495.

- **PR #489:** froze the missing closed-output invariant as `MODEL-CONTINUITY-05`;
- **PR #490:** added the deterministic projection-to-model-context adapter and closed relevance response contract;
- **PR #491:** added one bounded model relevance assessment over only the current question and already-admitted continuity context;
- **PR #492:** resolved validated opaque continuity IDs back to exact server-side bindings and projected a bounded displayable continuity object;
- **PR #493:** added deterministic attribution-preserving rendering with no model-authored presentation prose;
- **PR #494:** integrated explicit durable recall into the sole `/api/lighter/chat` runtime behind a closed recall grammar;
- **PR #495:** replaced prompt-only JSON compliance with a dedicated required Anthropic `continuity_relevance` tool boundary, while retaining deterministic validation.

The resulting production path is:

~~~text
explicit recall request
        ↓
purpose-bounded durable projection
purpose = conversation
        ↓
deterministic model continuity context
        ↓
opaque continuity:n identifiers
        ↓
required closed continuity_relevance tool
        ↓
deterministic output validation
        ↓
exact server-side binding resolution
        ↓
bounded continuity presentation
        ↓
deterministic attributed rendering
~~~

## 3. Model-facing input boundary

The first experiment exposes only records already admitted to the explicit `conversation` purpose.

For each admitted item, the model receives only:

- opaque `continuity:n` identity;
- semantic class;
- recovery disposition;
- low-trust semantic value.

It does not receive:

- durable record ID;
- durable version ID;
- unrestricted durable history;
- the durable store;
- source-backed records quarantined as `requires_source_revalidation`;
- trust-bearing evidence, authority, provenance, verification, or completion types.

The first experiment admits only recoverable low-trust continuity classes:

~~~text
user-authored:
  user_assertion
  preference
  plan
  commitment
  decision

model-authored:
  inference
  recommendation
  open_question
~~~

`fact` is not admitted through this continuity boundary.

## 4. Closed model output boundary

The production relevance classifier is not an ordinary free-form model call.

Anthropic is required to call exactly one named tool:

~~~text
continuity_relevance
~~~

Its schema admits only:

- `responseType = continuity_relevance`;
- `relevance = relevant | not_relevant`;
- `relevantItemIds` drawn from the exact opaque continuity IDs supplied for that turn;
- no additional properties.

The tool result is then validated again by deterministic JARVIS code.

Narrative text, malformed output, extra fields, out-of-vocabulary values, unknown IDs, duplicate IDs, internally inconsistent relevance/ID combinations, zero tool calls, multiple tool calls, or the wrong tool fail closed.

This satisfies `MODEL-CONTINUITY-05`: model output shape is enforced by both the provider-facing contract and deterministic validation before presentation.

## 5. Deterministic presentation boundary

A valid model relevance result can select an already-admitted continuity item. It cannot author the final wording.

Server-side binding resolution re-checks the exact opaque-ID-to-durable-ID mapping created with the admitted context. Durable identity is stripped again before presentation.

The renderer uses fixed attribution such as:

- `You previously stated a preference: ...`
- `A prior model open question recorded: ...`

It does not paraphrase, summarize, infer from, or promote the remembered value into fact.

A rejected resolution produces no presentation. A valid `not_relevant` assessment produces no remembered-content text.

## 6. Sole-runtime integration boundary

The first live recall grammar is deliberately closed:

- `What do you remember about …?`
- `What have I told you about …?`
- `Show me what you remember about …`
- `Do you remember what I said about …?`

These phrases bypass the generic conversational capability selector so the continuity relevance classifier remains the only model call used for durable recall.

Existing Calendar, Gmail and Drive authority handling remains structurally earlier in the runtime.

Ordinary non-recall conversation does not invoke durable projection retrieval.

Explicit recall also does not fall through to ordinary conversational Claude when durable continuity cannot be established. It fails closed instead of allowing the model to improvise a plausible memory.

## 7. Live acceptance

### Live Test 1 — real `conversation` purpose projection

A live fixture was appended through the governed Supabase RPC:

- record: `test:live:conversation:1`;
- version: `77777777-7777-4777-8777-777777777777`;
- semantic class: `preference`;
- lifecycle: `current`;
- authorship source: `user`;
- visibility purpose: `conversation`;
- payload: `{"statement":"I prefer short status updates."}`.

Command:

~~~bash
npm run verify:operating-picture:live -- project conversation
~~~

Observed result:

- `status: projected`;
- purpose: `conversation`;
- item count: **1**;
- `test:live:conversation:1` admitted as `recoverable_user_continuity`;
- `test:live:record:1` excluded with `purpose_not_visible`;
- `test:live:record:2` excluded with `lifecycle_not_current`.

**PASS.**

This directly demonstrated that the real server → Supabase REST path admitted only the record visible to `conversation` and did not widen visibility from the pre-existing `test` fixture.

### Live Test 2 — sole-runtime durable recall

Command:

~~~bash
curl -sS \
  -X POST http://localhost:3000/api/lighter/chat \
  -H 'content-type: application/json' \
  --data '{
    "specialistId": "jarvis",
    "messages": [
      {
        "role": "user",
        "content": "What do you remember about status updates?"
      }
    ]
  }'
~~~

Before PR #495, the request failed closed with:

~~~text
modelContinuity.status = unavailable
~~~

That failure exposed the remaining production weakness: prompt-only JSON compliance at the model boundary. PR #495 replaced it with the required closed Anthropic tool contract.

After PR #495 merged, the same live request was repeated. The first post-merge invocation again returned the deterministic `unavailable` state. The immediately following identical invocation rendered successfully:

~~~text
Relevant remembered context:
- You previously stated a preference: {"statement":"I prefer short status updates."}
~~~

with:

~~~text
modelContinuity.status = rendered
~~~

The fail-closed response therefore behaved correctly, but the first post-merge transient means this milestone does **not** claim perfect provider/runtime availability.

### Live Test 3 — repeatability

The exact same curl request was then executed twice more without changing the fixture or request.

Both returned the same deterministic rendered continuity and:

~~~text
modelContinuity.status = rendered
~~~

Together with the successful invocation at the end of Live Test 2, this produced **three consecutive identical successful renders** after the transient `unavailable` response.

**PASS, with the reliability limitation recorded above.**

## 8. What this milestone proves

Within the bounded explicit-recall scope, JARVIS has now demonstrated live that:

1. model access begins only after a stable purpose-bounded durable projection;
2. records outside the `conversation` purpose remain excluded;
3. user continuity retains user authorship and semantic class rather than becoming fact;
4. durable identity remains server-side and is replaced with opaque turn-local IDs at the model boundary;
5. the model may only return a closed relevance decision through a required tool contract;
6. deterministic code validates that result before it can affect presentation;
7. selection resolves only against the exact server-side bindings created with the admitted context;
8. final presentation is deterministic and attribution-preserving;
9. model output does not become evidence, authority, provenance, verification, completion proof, or fresh source truth;
10. explicit recall fails closed rather than falling through to ordinary model-authored memory.

The proving question is therefore answered **yes within this bounded scope**.

## 9. What remains unearned

This milestone does **not** prove or authorise:

- automatic chat-memory extraction;
- ambient continuity injection on every ordinary turn;
- free-form model synthesis directly from durable continuity;
- automatic source revalidation;
- broad connector ingestion;
- embeddings or vector search;
- semantic search over unrestricted history;
- cross-source executive synthesis from durable state;
- model-authored capture of user intent as though the user had stated it;
- proactive notifications;
- autonomous action;
- perfect provider/runtime availability.

The observed transient `unavailable` response remains part of the verification record. It is evidence that fail-closed behaviour works; it is not evidence that the provider boundary is perfectly reliable.

## 10. Promotion decision

> **Governed Operating Picture — Narrow Model-Facing Continuity**
>
> **VERIFIED WITHIN BOUNDED SCOPE**

The implementation may now be treated as a proven substrate for later Operating Picture work. Its explicit-recall grammar and closed relevance-only model contract remain deliberate scope boundaries, not temporary defects to remove casually.

## 11. Next proving question

The next authorised milestone is deliberately narrower than automatic memory:

> **Governed Operating Picture — Explicit User-Authored Continuity Capture**

Proving question:

> Can JARVIS persist a continuity item only when the user explicitly asks it to remember something, while preserving the user's authorship and semantic class, preventing model interpretation from becoming authorship or fact, and avoiding ambient transcript capture or new authority?

The first capture experiment must not use background extraction, embeddings, generic transcript summarisation, model-authored durable facts, or inferred standing authority.

Capture intent for that first experiment is deterministic rather than model-decided: only an explicit, closed remember/retain command surface may enter the capture path. Any later adaptive intent detector would be a separate governed boundary.

Semantic classification must also fail closed. If exactly one admissible user-continuity class cannot be established, no append occurs and JARVIS must seek clarification. Model uncertainty or ambiguity may not be coerced into a permanent append-only class.

It is also constrained to `append_only` revision semantics. Contradictory later captures remain separate historical user-authored records. Automatic supersession, explicit replacement, latest-wins behaviour, or contradiction resolution are intentionally deferred until their own governed reference-resolution work.

That deferral is preserved at retrieval and presentation as well as at capture. If two or more current contradictory user-authored records are all visible and admissible for the same purpose, later projection or presentation work may not silently select only the newest record, omit an admissible conflicting record, or imply that recency establishes truth. Reconciliation must be explicit and separately governed; absent that mechanism, the conflict itself is part of the honest continuity state.
