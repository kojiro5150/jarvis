# Sprint 3.185.1 — GS002A Live Acceptance Corrections

**Status:** Bounded correction after first live acceptance  
**Baseline:** Sprint 3.185 / Golden Scenario 002A  
**Capability level:** Know only

## Live failures observed

The first real-account GS002A acceptance established two separate defects:

1. ordinary Gmail search and subject release worked, but sender discovery returned the safe generic failure for every tested sender;
2. the natural request `Search my email from the last day.` was widened to a seven-day Gmail search.

Neither defect changed the authority boundary: Gmail acquisition still required explicit current-turn confirmation.

## Correction 1 — sender metadata acquisition

Sprint 3.185 fetched every candidate sender's `From:` metadata concurrently with `Promise.all`.

That created two undesirable properties:

- up to 100 provider metadata reads could be issued as one burst;
- one failed metadata read rejected the entire candidate scan and collapsed it into an opaque sender-resolution failure.

3.185.1 changes this to bounded sequential metadata acquisition.

A failed candidate metadata read:

- does not erase successful evidence already acquired;
- marks the identity scan incomplete;
- prevents uniqueness from being claimed;
- retains a neutral user-facing failure;
- records only the provider/error class server-side, never mailbox content.

Provider truncation and metadata incompleteness remain distinct fail-closed states.

## Correction 2 — temporal scope preservation

The deterministic Gmail time-window parser previously required the literal source word `Gmail`.

Therefore the ordinary phrase:

> `Search my email from the last day.`

fell through to the conversational selector, which correctly selected Gmail but could omit the temporal constraint. The downstream materializer then used its existing seven-day default.

3.185.1 admits the closed source nouns:

- `gmail`
- `email`
- `emails`
- `inbox`

for the already-supported one-day/seven-day search grammar.

It does not broaden the allowed temporal windows.

Standing invariant:

> **Natural wording may remove syntax burden, but it may not silently widen the requested evidence window.**

## Non-goals

No GS002B topic search, full-message read, semantic reasoning, drafting, sending, Contacts access, fuzzy matching, or mailbox mutation is added.
