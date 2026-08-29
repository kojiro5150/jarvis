# Sprint 3.185.5 — Post-Freeze Gmail Question-Form Scope Correction

**Status:** Bounded post-freeze language-surface correction  
**Baseline:** Golden Scenario 002A LIVE PASS  
**Capability level:** Know only

## Live regression observed

After GS002A was frozen, the live phrasing:

> `What are my emails from the last day?`

did not enter the deterministic recent-mail grammar.

It instead fell through to the generic conversational capability selector. That selector correctly identified Gmail search, but the downstream materializer did not preserve the literal `last day` constraint and used its existing seven-day default.

That created an impermissible scope widening:

> **1 day requested → 7 days proposed**

## Correction

A separate deterministic question-form grammar now admits only the already-supported bounded windows:

- `What are my emails from the last day?` → `1d`
- `What are my emails from the last week?` → `7d`

The same closed temporal aliases remain available:

- day / 24 hours;
- week / 7 days.

A request outside those windows remains unsupported by this grammar:

- `What are my emails from the last month?` → no bounded proposal.

The question form maps directly to the existing governed `subject_list` proposal and still requires explicit Gmail confirmation before acquisition.

## Invariant

> **Natural wording may remove syntax burden, but it may not silently widen or lose the user's requested evidence window.**

## Boundaries unchanged

This correction does not reopen the GS002A sender-search contract and does not add:

- topic search;
- semantic relevance;
- snippets or message bodies;
- Contacts;
- fuzzy matching;
- drafting;
- sending;
- mailbox mutation;
- standing Gmail authority.

GS002B remains the next separate proof.
