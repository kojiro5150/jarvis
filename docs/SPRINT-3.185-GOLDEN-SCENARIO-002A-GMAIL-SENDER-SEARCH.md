# Sprint 3.185 — Golden Scenario 002A: Governed Gmail Sender Search

**Status:** Implementation increment  
**Baseline:** Golden Scenario 002 scoping freeze  
**Capability level:** Know only

## Burden

> **Find the email from Georgia.**

The user should not need to know the sender's exact address or Gmail query syntax.

## Invariant

> **A natural sender reference may resolve only to a real, uniquely identified mailbox sender. Ambiguity between real candidates must be surfaced, never guessed.**

Partial natural references are supported through the same strict, order-independent, all-tokens-required containment rule already used by Calendar factual title matching.

No fuzzy matching, stemming, embedding similarity, model judgment, or Contacts lookup is introduced.

## Governed path

```text
natural sender request
→ deterministic sender-reference parser
→ typed gmail.search sender proposal
→ server-owned pending authorization
→ explicit current-turn confirmation
→ bounded Gmail provider sender-candidate query
→ From-header metadata only
→ strict all-token identity resolution
→ unique address OR ambiguity / fail-closed
→ exact provider search by resolved address
→ existing subject-only resource-policy gate
→ deterministic bounded reply
```

The model never receives mailbox sender metadata, subjects, provider IDs, or query results.

## Identity evidence

GS002A uses real Gmail `From:` metadata only:

- display name when supplied by the provider;
- sender email address.

The same real address appearing on multiple messages is one sender identity.

Two different addresses remain distinct identities even when their display names are equal.

## Bounded completeness rule

A partial sender reference cannot be declared unique from an arbitrarily truncated mailbox sample.

The first implementation therefore scans at most **100 provider-matched messages** for sender identity evidence.

If the provider reports additional matching messages beyond that bound, identity uniqueness is **not proven** and the operation fails closed with a request for a more specific sender reference.

This is deliberately less convenient than guessing.

The later message-result list remains bounded to the existing Gmail maximum of **5**.

## Truth and release boundary

Sender identity resolution is deterministic server-side matching.

After unique sender resolution, message subjects are released only through the existing subject-only content-retrieval policy path.

No snippet, body, attachment, or semantic email content is exposed by this sprint.

## Failure behavior

- no real matching sender → say no sender was found;
- more than one distinct real sender → surface the real candidates and ask for specificity;
- identity scan incomplete at the 100-message bound → do not claim uniqueness;
- provider acquisition failure → do not fabricate a sender or result;
- subject policy denied/failed → report that messages were found but subjects cannot safely be released;
- pending authorization replay/fabrication → existing fail-closed authority behavior remains unchanged.

## Non-goals

- topic search (GS002B);
- Google Contacts;
- semantic sender identity inference;
- snippets or bodies;
- full message reads;
- drafting;
- sending;
- mailbox mutation;
- standing Gmail authority.

## Acceptance

This increment is acceptable only if:

1. existing Calendar strict token matching remains behaviorally unchanged;
2. `Georgia` matches `Georgia McDonald`;
3. `McDonald Georgia` matches `Georgia McDonald`;
4. `Georg` and `Georgiaa` do not match `Georgia`;
5. two real addresses matching the same partial reference produce ambiguity;
6. an incomplete identity scan cannot produce a unique match;
7. acquisition occurs only after explicit pending-authorization confirmation;
8. exact resolved address is used for the final provider search;
9. no more than five message results are returned;
10. only policy-permitted subjects are released;
11. lint, standalone typecheck, full tests, and production build all pass.
