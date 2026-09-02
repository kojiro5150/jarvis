# Gmail Named Result Handoff — Product Gap #19 Freeze

**Status:** Frozen before implementation  
**Date:** 2 September 2026  
**Scope:** One bounded conversational handoff only: a named reference to one message in the immediately preserved recent Gmail result set.

## Field observation

After an authorised recent-Gmail search displayed a bounded ordered result containing Raman Bhola, the natural follow-up:

> Read the email from Raman Bhola.

did not bind that name to the already-returned bounded result. The existing ordinal path such as "Read the first one" works.

## Four-layer classification

1. **Capability exists:** Yes, identified-message Gmail read exists and requires separate exact read authority.
2. **Substrate exists:** Yes, recent Gmail subject-list results already create a server-owned opaque `GmailMessageListReference`; exact ordinal selection already resolves against it. Sender identity parsing and ambiguity resolution also exist for a separate sender-search clarification path.
3. **Live integration exists:** Partial. The list reference and ordinal resolver are live. The sender-disambiguation reference is also live, but only for clarifying a new sender search. No live resolver binds a sender name to one resource inside the preserved recent-message list.
4. **Production proof exists:** No for named-result handoff. The exact observed named follow-up has not been supported or live-verified.

## Verified architectural gap

The live recent-message result retains only ordered message IDs in server-owned `gmail-message-list-reference.ts`. The sender names shown to the user are released presentation and are not retained in that trusted list state.

Therefore the named handoff must **not**:

- recover identity from rendered assistant prose;
- trust conversation history as provider identity;
- trigger a silent fresh Gmail search;
- reuse sender-search clarification state as though it identified a message in the prior list; or
- treat possession of an opaque list reference as read authority.

The original metadata acquisition already retrieved each result's sender and subject. The smallest legitimate extension is to retain the parseable sender identity beside each ordered message ID inside the existing module-private list state, while keeping the client reference opaque.

## V1 closed grammar

V1 supports only an explicit named read family over a current Gmail message-list reference:

- `Read the email from <sender reference>.`
- `Open the email from <sender reference>.`
- `Show me the email from <sender reference>.`
- `Summarise the email from <sender reference>.`

The sender reference is matched using the existing strict token discipline against only sender identities preserved in that bounded result.

No general anaphora, fuzzy matching, semantic matching, Contacts lookup, or mailbox-wide identity inference is added.

## Deterministic resolution

Given a genuine active `GmailMessageListReference`:

- zero matching list items → fail closed as not found in the bounded result;
- exactly one matching list item → construct an exact identified-message `gmail.read` proposal for that stored message ID;
- more than one matching list item → fail closed as ambiguous and require the user to select by displayed position or make a new bounded request;
- expired/fabricated reference → fail closed and require retrieval of a fresh bounded result.

The model does not select the message and never receives provider identity to manufacture the operation.

## Authority invariant

> Named result resolution identifies a candidate message; it does not authorize reading it.

A successful name match must create the same separate server-owned pending `gmail.read` authorization used by the proven ordinal path. The identical closed confirmation grammar applies. No Gmail search authority, read authority, or standing authority is inherited from the earlier list.

## Lifecycle and provenance

The existing list-reference TTL remains unchanged. The new sender binding lives only inside the same module-private server-owned list record.

The client receives no sender identity, provider message ID, or additional authority-bearing state in the opaque reference.

## Explicit non-goals

This milestone does not add:

- Gmail drafting, reply composition, sending, forwarding, labels, rules, or mailbox mutation;
- a new sender search;
- fuzzy person resolution;
- Contacts;
- arbitrary "that email" or pronoun resolution;
- migration to `governed-result-set-reference`;
- Gmail message-list lifecycle redesign;
- Drive or Calendar reference work;
- cross-source reasoning; or
- broader Gmail read authority.

## Acceptance

The implementation is not production-proven until the real chat path demonstrates:

1. authorised recent-Gmail search returns a result containing one uniquely matching sender;
2. `Read the email from <that sender>.` produces a separate exact Gmail read confirmation request without another search;
3. confirmation reads the exact bounded message;
4. a name matching more than one displayed result fails closed;
5. a name absent from the bounded result fails closed;
6. a fabricated or expired list reference cannot identify or authorize a message.

One green PR proves implementation/integration tests only. The live cases above are required before this capability can be marked **LIVE PASS / FROZEN**.
