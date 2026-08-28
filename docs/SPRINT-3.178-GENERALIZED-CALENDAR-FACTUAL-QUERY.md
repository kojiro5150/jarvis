# Sprint 3.178 — Generalized Deterministic Calendar Factual Query Grammar

**Status:** Implemented
**Baseline:** merged Sprint 3.177 + 3.177a

## Purpose

Generalize the proven 3.177 factual Calendar path beyond three frozen utterances without crossing the Calendar-title-to-model boundary.

This sprint is a governed lexical grammar, not semantic Calendar interpretation.

## Level 1 contract

Supported factual Calendar language is normalized into a small deterministic query vocabulary:

- next N timed events, maximum 5
- next occurrence of a named event
- named event on a specified weekday
- presence of a named event on a specified weekday

Examples include:

- `When is JARVIS Testing scheduled next?`
- `When am I going shopping?`
- `When am I testing JARVIS again?`
- `Am I at Barwon Health on Monday?`

## Strict token invariant

Matching is strict all-token matching.

After governed query normalization, **every meaningful query token must appear in the Calendar title**. Token order is ignored. A match may not be established from any-token overlap.

For example:

`when am I testing JARVIS again?` → `{test, jarvis}`

- `JARVIS Testing` → match
- `Testing Governance Engineering Approach` → no match

Filler words are stripped from the query only. The title is not semantically reduced to make matching easier.

## Morphology invariant

Morphology normalization is a closed, explicit, hand-maintained table. It is never inferred and never delegated to a general stemming or lemmatization algorithm.

Initial approved equivalences are deliberately small:

- `test / tests / testing` → `test`
- `meeting / meetings` → `meeting`
- `shop / shopping` → `shop`

Any future mapping is a code-reviewed policy change with regression coverage.

## Ambiguity invariant

If more than one distinct Calendar event satisfies the complete deterministic query constraints, JARVIS must not choose one by iteration order, calendar identity, title similarity, or any unstated preference.

Chronology is allowed only where the user explicitly asks for the `next` occurrence.

For non-next query families, multiple matches fail closed with:

`I found more than one Calendar event that matches that wording; please be more specific.`

## Containment boundary

A clearly personal factual Calendar question that does not resolve into the supported Level-1 grammar must not fall through to the ordinary model.

It returns:

`I can check your Calendar for that, but I couldn't resolve the factual query safely from that wording.`

No Calendar acquisition and no model call occur for that refusal.

## Level 2 boundary

Conceptual or relational title interpretation remains deferred.

Examples:

- `When am I next doing some work on JARVIS?`
- `What meetings next week relate to governance work?`
- `What commitments are connected to the project we discussed?`

These must not be approximated by lexical matching and must not place Calendar titles into model context.

Crossing that boundary requires a dedicated model-exposure design, instruction boundary, reply guard, and regression suite.

## Authority and evidence

Recognized Level-1 factual queries continue to require:

fresh explicit Calendar authority → bounded complete acquisition → server-owned factual title projection → deterministic selector → deterministic renderer.

Calendar titles remain outside model context.

## Non-goals

- no semantic title matching
- no fuzzy matching
- no embeddings
- no stemmer or general lemmatizer
- no title-derived priority, urgency, category, or `timeMode`
- no Calendar writes
- no model-generated factual Calendar reply
