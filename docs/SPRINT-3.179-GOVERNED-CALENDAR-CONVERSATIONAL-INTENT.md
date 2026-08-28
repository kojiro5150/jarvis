# Sprint 3.179 — Governed Calendar Conversational Intent Interpretation

**Status:** Implemented for review  
**Baseline:** merged Sprint 3.178 + 3.178b + 3.178c

## Purpose

Move JARVIS one step closer to authentic conversation without weakening the frozen authority architecture.

The model may help interpret **what the user is asking**. It may not infer private Calendar facts, manufacture authority, search Calendar titles, or produce the factual Calendar answer.

## Governing invariant

> **The model may interpret the user's current wording into an approved operation proposal. It may not infer private facts, grant authority, or produce the factual answer.**

This sits beneath the frozen North Star:

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**

## Runtime order

1. deterministic Level-1 Calendar grammar
2. bounded conversational-intent candidate detection
3. title-free model interpretation of the **current utterance only**
4. deterministic server validation of the proposed query
5. server-owned Calendar read proposal
6. fresh explicit Calendar authority
7. bounded complete Calendar acquisition
8. deterministic factual title selection
9. deterministic factual renderer

If any adaptive interpretation step fails, the system fails closed to the existing neutral containment path when the wording is clearly a personal Calendar factual request.

## Deterministic-before-adaptive invariant

Any utterance already recognized by the Sprint 3.178 deterministic grammar must bypass the conversational interpreter completely.

Examples that remain model-free:

- `When's my next JARVIS test?`
- `When do I next go shopping?`
- `What time is the interview on Tuesday?`
- `Do I have an LLEGC meeting next week?`

## Initial adaptive scope

The only adaptive proposal currently accepted is:

```json
{"kind":"next_title_match","terms":["literal","tokens"]}
```

or:

```json
{"kind":"unsupported"}
```

No other query kinds are accepted in Sprint 3.179.

The candidate utterance must contain an explicit `next` or `again` cue.

## Model exposure boundary

The conversational interpreter receives:

- one system instruction
- the current user utterance only

It does **not** receive:

- Calendar events
- Calendar titles
- Calendar IDs
- label IDs
- `timeMode`
- attendees
- recurrence
- conversation history
- governed Calendar context
- pending authorization state
- authority evidence

## Server validation

Model output is non-authoritative and untrusted.

Before a proposed query can become a Calendar operation, code verifies:

- the output is valid JSON;
- the query kind is in the closed schema;
- there is an explicit `next` or `again` cue;
- every proposed search token is present in the current user utterance after the existing frozen morphology mapping;
- grammatical scaffolding cannot become a title anchor;
- additional fields outside the closed schema are rejected;
- empty and over-broad term arrays are rejected.

The model may omit conversational scaffolding. It may not invent synonyms, categories, names, urgency, priority, or hidden attributes.

## Conversational form vs semantic title inference

Sprint 3.179 interprets **conversational form**, not private-title meaning.

In scope:

- `Can you tell me when the JARVIS test is again?`
  - may become `{ kind: "next_title_match", terms: ["jarvis", "test"] }`

Still out of scope:

- `When am I next doing some work on JARVIS?`
- `What meetings relate to Governance Engineering?`
- `When is something connected to my lived experience role?`

Those statements require conceptual or relational interpretation of what Calendar titles *mean*. They remain behind a future Level-2 private-title semantic exposure boundary.

## Truthfulness invariant

The conversational model never answers the Calendar fact.

A successful interpreted proposal still requires:

fresh explicit authority → complete bounded provider evidence → deterministic selection → deterministic renderer.

A failed interpretation cannot fall through into an ordinary model-generated Calendar answer.

## Robustness matrix

The regression suite distinguishes three classes:

### Deterministic Level 1

Must remain model-free.

### Conversational literal-title paraphrase

May invoke the bounded intent interpreter once, then must use the normal server-owned authority and deterministic evidence path.

### Relational / conceptual Calendar wording

Interpreter may classify it as unsupported, but Calendar acquisition and ordinary-model Calendar answering remain blocked.

Non-Calendar questions such as `When will it rain again?` may be examined by the title-free intent interpreter, but an `unsupported` result leaves them eligible for ordinary conversation rather than Calendar containment.

## Non-goals

- no Calendar-title exposure to the model
- no embeddings over Calendar titles
- no semantic title matching
- no synonym expansion
- no model-generated Calendar fact
- no model-generated authority
- no reuse of prior authority
- no Calendar writes
- no title-derived category, priority, urgency, importance, adequacy, or recommendation
