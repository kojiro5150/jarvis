# Gmail Sender-Search Result Continuity — Freeze

**Status:** Frozen before implementation
**Date:** 2 September 2026

## Field observation

After JARVIS uniquely resolved a Gmail sender and returned a bounded list of that sender's messages, a natural follow-up such as `Read the email from Georgia McDonald.` could not bind to those just-returned results. The sender-search result was presentation-only.

## Four-layer classification

1. **Capability exists:** Gmail sender search, bounded message-list references, ordinal reads, named-result reads, and exact Gmail read authority all exist.
2. **Substrate exists:** `GmailMessageListReference` is live and production-proven for recent-message lists.
3. **Live integration exists:** Not for resolved sender-search results. That path returns a bounded subject list but does not create a `GmailMessageListReference`.
4. **Production proof exists:** No. This exact sender-search → result-reference continuity path has not yet been implemented or live-tested.

## Smallest legitimate change

After a sender has been uniquely resolved and the existing bounded sender search returns message IDs, create the existing server-owned `GmailMessageListReference` for those exact ordered IDs.

Because the sender identity has already been deterministically resolved before the provider search, retain that same resolved sender identity against each message in the list reference. Do not reacquire sender metadata and do not infer identity from rendered prose.

## Required behaviour

- `Read the first one.` must resolve against the sender-search result and create separate pending `gmail.read` authority.
- `Read the email from <resolved sender>.` must resolve against the same bounded result.
- If several messages from that sender are present, the named form must fail closed as ambiguous and require position; the ordinal form remains exact.
- A later new result reference supersedes only at the existing client/list-reference transport layer; no new lifecycle mechanism is introduced here.

## Authority invariant

> Result continuity identifies a candidate message; it never authorizes reading it.

The existing separate `gmail.read` confirmation remains mandatory.

## Non-goals

- no new sender search grammar;
- no Gmail drafting, sending, labels, rules, or mailbox mutation;
- no generic governed-result-set migration;
- no Gmail message-list lifecycle redesign;
- no fuzzy identity matching;
- no Drive or Calendar changes;
- no model-mediated identity recovery.

## Acceptance

Before LIVE PASS / FROZEN, prove on the real chat path:

1. sender search resolves a real sender and returns multiple bounded subjects;
2. `Read the first one.` asks for exact read authority and reads the correct first sender-search result after confirmation;
3. `Read the email from <sender>.` over multiple same-sender results fails closed as ambiguous and asks for position;
4. no second Gmail search occurs during either follow-up;
5. forged/expired list references remain fail closed under the already-proven list-reference contract.

A green PR establishes implementation/integration tests only, not production proof.