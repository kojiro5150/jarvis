# Sprint 3.185.10 — Gmail Ordinal Selection Containment

**Status:** Post-live GS002A follow-up containment correction  
**Trigger:** Live acknowledgement-prefixed ordinal selection failure

## Live defect

After a governed sender search returned a bounded subject-only list, the user said:

> `Yes, the first one.`

The existing deny-only classifier recognized ordinal selections such as `the first one`, but not the same selection prefixed by an acknowledgement.

The turn therefore reached the ordinary model, which fabricated mailbox facts including message counts, dates, thread interpretation, and an offer to expose content.

## Invariant

> **Selection language referring to previously governed Gmail evidence must never reach the ordinary model merely because it includes an acknowledgement prefix.**

## Correction

The Gmail evidence follow-up classifier now recognizes acknowledgement-prefixed ordinal selections, including:

- `Yes, the first one.`
- `Yes, the second one.`
- `Yes, the third email.`
- `Yes please, the fourth one.`

These remain deny-only containment signals. They do not identify a provider message, create Gmail-read authority, or implement ordinal message reading.

The deterministic response remains:

> I can't read or identify a prior Gmail message from ordinary model context. Reading a selected message requires a separate governed Gmail read request and authority.

## Scope

This does not add ordinal Gmail reading, automatic message selection, body access, snippet access, topic search, drafting, sending, or mailbox mutation.
