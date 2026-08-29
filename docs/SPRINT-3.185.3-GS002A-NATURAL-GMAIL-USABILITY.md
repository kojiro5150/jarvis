# Sprint 3.185.3 — GS002A Natural Gmail Usability Corrections

**Status:** Bounded live-acceptance cleanup  
**Capability level:** Know only

## Live findings

Two remaining usability gaps were observed after GS002A sender search passed against the real Gmail account:

1. `Find my email from Georgia.` missed the deterministic sender grammar even though `Find the email from Georgia.` worked;
2. natural recent-mail requests correctly preserved the one-day window but returned raw Gmail message IDs rather than the already-governed subject-list representation.

## Correction 1 — sender wording

The closed sender grammar now accepts `my` alongside `the`:

- `Find the email from Georgia.`
- `Find my email from Georgia.`

Both materialize to the same bounded GS002A sender-search proposal.

No fuzzy matching, semantic interpretation, Contacts lookup, or authority widening is introduced.

## Correction 2 — useful natural recent-mail output

Natural bounded time-window requests now propose the existing `subject_list` result mode:

> `Search my email for the last day.`

After explicit confirmation, the operation still performs the same bounded Gmail search and still returns at most five results, but the deterministic human-facing representation is the policy-permitted subject list.

The explicit machine-style command remains unchanged:

> `gmail.search [newer_than:1d]`

It remains ID-only for compatibility and low-level verification.

Standing product rule:

> **Natural Gmail search should return the smallest useful human-readable factual representation, not provider identifiers.**

## Boundaries unchanged

This sprint does not add topic search, semantic relevance, snippets, message bodies, drafting, sending, Contacts, mailbox mutation, or standing Gmail authority.
