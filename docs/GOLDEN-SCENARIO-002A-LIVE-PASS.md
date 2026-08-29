# Golden Scenario 002A — Live Pass: Find by Sender

**Frozen:** 29 August 2026  
**Status:** **LIVE PASS**  
**Capability level:** **Know only**  
**Scenario:** **GS002A — Find a specific email by sender**

## What passed live

GS002A was exercised against the real governed Gmail runtime, not only unit or route fixtures.

The accepted live flow proved all of the following:

1. A partial sender reference can be translated into a bounded Gmail sender-search proposal without granting authority.
2. Gmail acquisition still requires explicit current-turn human confirmation.
3. Sender identity is resolved only from real mailbox sender evidence.
4. When more than one real sender satisfies the strict token rule, JARVIS surfaces the ambiguity and does not guess.
5. A more specific sender reference can deterministically resolve to one real sender.
6. The final Gmail query is bound to that resolved sender identity.
7. Returned results are bounded to at most five messages.
8. The user-facing result releases subject lines only through the existing governed subject-retrieval policy.
9. Snippets, message bodies, Contacts, fuzzy identity inference, semantic relevance, drafting, sending, and mailbox mutation remain outside this scenario.
10. Natural wording variants such as `Find the email from Georgia` and `Find my email from Georgia` reach the same governed sender-search operation.

## Live acceptance evidence

### Ambiguous partial sender

User request:

> `Find the email from Georgia.`

After explicit Gmail confirmation, JARVIS found two distinct real sender identities satisfying the required token and responded by listing both candidates and asking the user to be more specific.

It did not silently choose the newest, most frequent, most likely, or model-preferred sender.

### Unique sender

User request:

> `Find the email from Georgia McDonald.`

After explicit Gmail confirmation, JARVIS resolved the real sender and returned a bounded list of five Gmail subject lines from that sender.

The same result was reproduced with:

> `Find my email from Georgia McDonald.`

### Authority remained separate

The natural request itself created only a proposal.

Gmail acquisition did not occur until the user explicitly confirmed.

An unrecognised utterance in place of confirmation did not manufacture authority; JARVIS asked again for explicit confirmation.

## Governed path now proven

```text
natural sender request
→ bounded sender-reference tokens
→ pending Gmail authority
→ explicit current-turn confirmation
→ bounded provider sender discovery
→ real From-metadata evidence
→ strict all-tokens-required identity resolution
→ ambiguity surfaced or unique sender established
→ exact sender-address Gmail query
→ max 5 results
→ governed subject-only release
→ deterministic factual response
```

## Standing invariants

> **A natural sender reference may resolve only to a real, uniquely identified mailbox sender. Ambiguity between real candidates must be surfaced, never guessed.**

> **Partial natural references are supported by deterministic token matching, not by fuzzy identity inference.**

> **Natural language may remove syntax burden. It may not create authority, fabricate identity, or widen the evidence boundary.**

## Failure modes proved safe

The live acceptance also exposed and closed several implementation defects before this freeze:

- burst sender-metadata acquisition was replaced with bounded sequential acquisition;
- partial metadata failure now marks the identity scan incomplete rather than permitting uniqueness to be claimed;
- natural `email` / `inbox` wording preserves the requested 1d/7d temporal scope;
- `for the last day` is admitted without widening to seven days;
- natural recent-mail search returns the already-governed subject-list representation rather than raw provider IDs;
- `Find my email from ...` is equivalent to the original sender-search wording.

These fixes did not broaden the GS002A evidence or authority boundary.

## What this live pass does not prove

GS002A does not prove or authorize:

- topic search;
- semantic “aboutness”;
- reading message bodies;
- snippet-based reasoning;
- ranking by importance;
- recommendation;
- drafting;
- sending;
- mailbox mutation;
- Contacts integration;
- fuzzy sender resolution;
- standing Gmail authority.

Those capabilities must re-earn trust separately.

## Relationship to GS002B

GS002B remains a separate Level-1 proof:

> **Natural topic reference → bounded deterministic Gmail query → provider-backed matches → truthful “matching” language, never unsupported semantic “aboutness”.**

GS002A passing live does not confer trust on GS002B.

## Freeze statement

> **Golden Scenario 002A is frozen as a live-passed Level-1 capability: natural sender reference → explicit authority → real mailbox identity evidence → deterministic ambiguity/uniqueness resolution → exact sender query → bounded subject-only results.**

The next Gmail product proof may proceed to GS002B without reopening GS002A unless new live evidence demonstrates a regression.
