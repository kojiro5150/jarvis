# Sprint 3.158 — Bounded Calendar Attention Conversational Renderer

**Status:** Contract + isolated implementation  
**Sprint type:** Next bounded seam after Sprint 3.157  
**Production integration:** Prohibited  
**Baseline:** merged main after Sprint 3.157 (`06d4eb93c0818905bdbb486094b29e1cf242ee83`)

## 1. Purpose

Sprint 3.157 established a structured publication artefact:

```text
CalendarAttentionPolicyMatch
→ CalendarAttentionBrief
```

The next question is:

> Can a deterministic renderer turn `CalendarAttentionBrief` into a concise conversational answer while preserving the exact bounded facts and adding no priority, urgency, cause, recommendation or action?

Sprint 3.158 answers **yes** for the current proving case.

No model is required.

## 2. Scope-discipline decision

The renderer supports exactly one established semantic path:

```text
attention.commitment.start-time-changed@1.0.0
+
commitment.start-time.changed
```

It renders only:

- the fact that a Calendar commitment changed start time;
- the previous start timestamp;
- the current start timestamp.

It does not render titles because the governed Calendar evidence path does not disclose them.

It does not expose internal commitment ids, policy ids, reason codes or provenance references.

## 3. Deterministic templates

One match:

```text
A Calendar commitment changed start time from <previous> to <current>.
```

Multiple matches:

```text
N Calendar commitments changed start time:
- changed start time from <previous> to <current>.
- changed start time from <previous> to <current>.
```

Zero matches:

```text
No Calendar start-time changes matched this bounded check.
```

The zero-match wording is deliberately narrower than:

- "nothing needs your attention";
- "you are all clear";
- "nothing important changed";
- "no action is required".

Those stronger statements are not established by this bounded Calendar policy path.

## 4. Why exact timestamps are preserved

The renderer currently preserves the evidence timestamps exactly as published.

It does not:

- convert them into a system timezone;
- infer the user's timezone;
- reformat them using locale state;
- call a clock;
- convert date-only semantics.

Friendly local-time presentation may be added later only if a governed presentation timezone is explicitly available.

## 5. Fail-closed validation

Before rendering each item, the renderer requires:

- `changeType === "modified"`;
- exact supported policy id/version;
- exact supported reason code;
- exactly one `commitment.id` evidence value;
- exact equality between that evidence identity and `entityId`;
- exactly one `previous.startsAt` value;
- exactly one `current.startsAt` value;
- both start values parse as timestamps;
- previous and current start values differ.

Unsupported policy semantics are rejected rather than generalized.

The renderer does not render `reason.message` directly. It uses its own fixed template, preventing arbitrary upstream prose from becoming conversational output.

## 6. Forbidden semantic additions

The renderer does not add:

- priority;
- urgency;
- severity;
- importance;
- cause;
- recommendation;
- ranking;
- action;
- "should" statements.

It also does not disclose:

- governed entity ids;
- provider ids;
- policy ids;
- reason codes.

## 7. No model role

Repository-level test inspection verifies that the renderer does not import or invoke:

- OpenAI;
- Anthropic;
- text generation helpers;
- the chat handler;
- a clock.

This proving case therefore demonstrates that model-assisted wording is **not necessary** for bounded start-time attention rendering.

## 8. Acceptance proof

Tests prove:

1. one supported match produces the exact deterministic sentence;
2. zero matches use bounded wording;
3. multiple matches use a deterministic list;
4. rendered prose contains no priority/urgency/severity/recommendation/action/importance language;
5. internal entity and policy metadata are not disclosed;
6. unsupported policies fail closed;
7. unsupported reason codes fail closed;
8. identity mismatch fails closed;
9. duplicate/missing/non-string required evidence fails closed;
10. invalid or unchanged timestamps fail closed;
11. no model or runtime-dependent prose source is used.

## 9. Non-goals

Do not add:

- `/api/lighter/chat` wiring;
- user-intent routing;
- previous/current observation persistence;
- Calendar reacquisition;
- authority prompting;
- model invocation;
- reply guard modification;
- full EOS runtime;
- UI;
- voice.

## 10. Resulting architecture

```text
governed Calendar evidence
        ↓
CanonicalCalendarAttentionObservationSet
        ↓
bounded previous/current comparison
        ↓
CalendarAttentionObservationChangeSet
        ↓
start-time Attention Policy semantics
        ↓
CalendarAttentionPolicyMatch
        ↓
CalendarAttentionBrief
        ↓
deterministic bounded renderer
        ↓
safe conversational text
        ↓
production conversational wiring      ← still missing
```

## 11. Architectural result

For this proving case, the minimum path does **not** require an LLM between deterministic attention policy selection and conversational presentation.

This is a positive scope-discipline result:

> If deterministic evidence can be truthfully rendered deterministically, the model does not earn a place in that transformation.

## 12. Next question

The next sprint should audit and implement the minimum production wiring required for:

> "What needs my attention?"

That sprint must resolve the remaining production ownership issue: where the authorised previous observation set comes from and how it may be retained/reused without manufacturing authority or silently reacquiring Calendar data.

Only after that ownership question is resolved should the UI be treated as a valid end-to-end acceptance surface.
