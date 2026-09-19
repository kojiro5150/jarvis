# Public-Web Claim Provenance V1 — Frozen Contract

**Status:** Frozen before implementation  
**Date:** 19 September 2026  
**Scope:** Claim-level provenance for JARVIS public-web research responses only.

## Problem

JARVIS already preserves the provider's complete tool-enabled response as `ClaudeResult.content`, but the current public-web path reduces retrieved web evidence to a boolean through `hasPublicWebSearchEvidence` and publishes `result.text`.

That proves only that web search occurred. It does not preserve which retrieved source supports which published claim, and it cannot distinguish a directly source-supported statement from model synthesis at presentation time.

The motivating live Product Gap is research on AI scribes in Australian hospitals: precise statistics, named organisations, regulatory claims and adoption figures were returned without claim-level source attribution or a visible distinction between sourced evidence and synthesis.

## Provider facts this contract relies on

For Anthropic server web search:

1. A `web_search_tool_result` block contains structured search results.
2. Search-result entries expose provider-returned source metadata including `url`, `title`, and `page_age` when available.
3. Response text blocks may carry a `citations` array.
4. Citation entries bind source metadata to the specific text segment they support and include provider-returned fields including `url`, `title`, and `cited_text`.
5. Provider `encrypted_content` and `encrypted_index` fields are opaque transport/provider state. JARVIS must never decode, interpret, or treat them as factual evidence.

The runtime implementation must validate actual provider data defensively. Absence, malformed fields, or provider-shape drift must fail closed rather than be repaired by model inference.

## Canonical boundary

V1 does **not** ask a model to invent a citation graph.

The canonical source of claim provenance is the provider-returned relationship between:

- response text segments;
- citations attached to those segments; and
- source URLs present in the same turn's raw `web_search_tool_result` evidence.

A citation is admissible only when its URL exactly matches a URL present in the same turn's admitted web-search results.

## V1 canonical structures

The implementation may choose exact TypeScript names, but the semantic structure is frozen as:

```text
PublicWebSource
- url
- title
- pageAge?          // provider metadata only; never inferred

PublicWebCitation
- sourceUrl         // must resolve to an admitted PublicWebSource
- title             // provider-returned citation title
- citedText         // provider-returned cited excerpt, bounded and unmodified

PublicWebTextSegment
- text
- provenance:
    - source_derived + one-or-more admitted citations
    OR
    - synthesis + zero admitted citations
```

No hidden model judgment may upgrade `synthesis` to `source_derived`.

## Invariants

### CP-01 — Same-turn source admission

Every citation used as provenance must resolve by exact URL to a source actually returned in the same public-web turn.

A citation URL that is absent from that turn's web-search results is inadmissible.

### CP-02 — Claim-level binding

Provenance attaches to the exact provider text segment carrying the citation, not to the answer as a whole.

A source retrieved somewhere in the turn does not automatically support every statement in the response.

### CP-03 — Synthesis remains synthesis

A text segment with no admitted citation is classified as synthesis.

Synthesis may interpret, compare, explain or connect admitted evidence, but it must not be presented as directly source-derived merely because sourced material exists elsewhere in the turn.

### CP-04 — No fabricated provenance

JARVIS must never construct, repair, infer, normalize into existence, or accept a URL/title/source identity that is not present in provider-returned same-turn evidence.

If citation/source binding fails, that citation is rejected.

### CP-05 — Important unsupported factual claims fail closed

Where the requested research answer materially depends on a factual claim and that claim is not bound to admitted evidence, JARVIS must omit the claim or state that the retrieved evidence did not establish it.

A fluent unsupported claim must not be upgraded by model confidence.

### CP-06 — Opaque provider state stays opaque

`encrypted_content`, `encrypted_index`, and equivalent provider-opaque fields may be retained or replayed only as required by the provider contract.

They are never parsed, displayed as evidence, hashed into semantic identity, used for factual comparison, or treated as provenance.

### CP-07 — Presentation remains proportional

Claim-level provenance must not turn every answer into a source dump.

For a simple one-fact answer, compact source attribution is sufficient.

For multi-claim research, enough claim-level attribution must remain visible that a user can tell which source supports which important factual claim and which passages are synthesis.

### CP-08 — Source class is descriptive, not model-invented

V1 may expose provider/source identity and may use deterministic domain or explicitly retrieved publisher metadata.

It must not let the model silently label a source `peer-reviewed`, `government`, `vendor`, `regulator`, or similar unless that classification is itself deterministically established from admitted evidence.

## Required acceptance scenario

A controlled public-web result contains:

- Source A;
- Source B;
- factual text segment A with a citation to Source A;
- factual text segment B with a citation to Source B; and
- a synthesis text segment with no citation.

V1 passes only if:

1. Source A and Source B are admitted from the raw same-turn search results.
2. Segment A is source-derived and bound only to its admitted citation(s).
3. Segment B is source-derived and bound only to its admitted citation(s).
4. The synthesis segment remains explicitly distinguishable as synthesis.
5. A fabricated citation to Source C, absent from raw search results, is rejected.
6. Malformed or missing provider source metadata does not get repaired by model inference.
7. Opaque encrypted provider fields are ignored semantically.

## Non-goals

V1 does not:

- create a general evidence graph;
- create durable provenance across turns;
- infer support relationships from semantic similarity;
- infer source quality from prose or domain reputation;
- score source credibility;
- summarize or rewrite `cited_text`;
- decode provider-opaque fields;
- add write authority;
- change private Gmail, Drive or Calendar provenance;
- unify public-web provenance with governed private-source evidence;
- claim that an uncited synthesis statement is false merely because it is synthesis.

## Promotion rule

This contract may move from frozen design to implementation only through deterministic tests over provider-shaped `ClaudeResult.content`.

The first implementation test must replace the repository's current empty `web_search_tool_result.content: []` mocks with a realistic provider-shaped result containing source metadata and text-block citations.

Production proof must then demonstrate, on a real research query, that visible source attribution corresponds only to URLs actually present in that turn's raw provider search results.

Until that proof exists, claim-level public-web provenance is not production-proven.
