# Golden Scenario 002 — Scoping Freeze: Find a Specific Email

**Frozen:** 29 August 2026  
**Status:** **SCOPING FREEZE — NOT A BUILD COMMITMENT**  
**Capability level:** **Know only**  
**Shape:** GS002A — Find by sender; GS002B — Find by subject

> **Historical scoping note:** GS002A has since been implemented and live-passed. See `docs/GOLDEN-SCENARIO-002A-LIVE-PASS.md`. GS002B has now been narrowed to literal subject search and separately frozen in `docs/GOLDEN-SCENARIO-002B-SCOPING-FREEZE.md`. It remains a separate proof and is not implied by the GS002A pass.

## Purpose of this freeze

This document freezes one narrow product-scoping decision before implementation.

It does not authorize a build, widen Gmail evidence exposure, create drafting or sending capability, or imply that later email capabilities inherit trust from this scenario.

The burden being targeted is deliberately ordinary:

> **I know this email exists somewhere in my inbox, and finding it manually costs me attention I'd rather spend elsewhere.**

Golden Scenario 002 is split into two separate Level-1 proofs because sender identity resolution and literal subject search have different failure modes and different truth claims.

## Governing product principle

The user should be able to ask naturally:

> **Find the email from Georgia.**

or:

> **Find the email matching “pilot renewal”.**

without learning Gmail query syntax or internal capability names.

JARVIS carries the translation burden.

The governance boundary does not move with the conversational surface.

## Level mapping

Golden Scenario 002 is deliberately **Level 1 — Know only**.

It may:

- interpret the current user utterance into an approved typed Gmail search proposal;
- construct a bounded deterministic provider query;
- resolve sender references against real mailbox sender evidence using closed deterministic rules;
- return bounded provider-backed matches;
- render only deterministic factual statements about those matches.

It may not:

- expose private email content to a model for semantic reasoning;
- infer that a message is semantically “about” a topic;
- read full message content;
- draft a reply;
- recommend what to do;
- send or mutate anything.

Understand, Advise, and Act are not required for this scenario.

## GS002A — Find by sender

### Human burden

> **Find the email from Georgia.**

The user should not need to know the exact email address or write a Gmail `from:` query.

### Core invariant

> **A natural sender reference may resolve only to a real, uniquely identified mailbox sender. Ambiguity between real candidates must be surfaced, never guessed.**

### Sender evidence boundary

Sender resolution draws only on real sender identity evidence already present in the mailbox result surface:

- sender display name;
- sender email address.

Google Contacts is not required for GS002A and is not silently introduced as an additional evidence source.

No model-visible private email metadata is required to choose the matching sender.

### Matching rule

> **Sender reference matching uses the same strict, order-independent, all-tokens-required rule already frozen for Calendar title matching, applied only to real sender display names and addresses. It does not use fuzzy matching, stemming, embedding similarity, or model judgment.**

Consequences:

- `Georgia` may match `Georgia McDonald`;
- `McDonald Georgia` may match `Georgia McDonald`;
- `Georgia McDonald` may match that same sender;
- `Georg` does not match `Georgia`;
- `Georgiaa` does not match `Georgia`;
- if two real sender identities satisfy every required token, JARVIS must ASK rather than choose;
- a model belief that `G. McDonald` probably means `Georgia McDonald` is not identity evidence.

Standing product sentence:

> **Partial natural references are supported by deterministic token matching, not by fuzzy identity inference.**

### Identity ambiguity

Examples of ambiguity include:

- `Georgia McDonald` and `Georgia McDonald-Reyes` both satisfying the required token set;
- the same display name appearing under more than one real sender address;
- a partial reference matching more than one real sender.

When ambiguity survives deterministic matching, JARVIS must surface the real candidates and ask the user to disambiguate.

It must not silently prefer:

- the most recent sender;
- the most frequent sender;
- a contact-book entry;
- a model-inferred identity;
- an address that merely “looks likely”.

### Search and result bound

After unique sender resolution, JARVIS may construct a bounded Gmail sender query against the resolved real identity.

The existing Gmail result bound remains the starting constraint:

- maximum 5 results unless a later contract explicitly changes it;
- provider-backed result ordering unless a different deterministic ordering rule is explicitly frozen.

If multiple messages match the uniquely resolved sender, JARVIS returns the bounded set. It does not silently pick “the one” unless the user's request itself supplies an additional deterministic criterion.

## GS002B — Find by subject

### Human burden

> **Find the email with subject “pilot renewal”.**

The user should not need to know Gmail search syntax.

> **Current refinement:** GS002B is now specifically frozen as literal subject search. See `docs/GOLDEN-SCENARIO-002B-SCOPING-FREEZE.md` for the exact query-construction and quote-rejection contract.

### Core invariant

> **A natural topic reference may become only a bounded deterministic Gmail query. Returned messages may be described as query matches, not as proof that the email is semantically about the topic.**

### Topic evidence boundary

GS002B uses provider search semantics.

It does not require JARVIS to inspect full email bodies or private snippets and decide semantic relevance.

The initial scope is therefore:

- user-supplied topic terms;
- deterministic query construction;
- Gmail provider matching;
- bounded returned results;
- deterministic rendering of the fact that those results matched the query.

### Truthful wording

Allowed factual shape:

> **I found 3 messages matching “pilot renewal”.**

Not earned by this scenario:

> **I found 3 messages about the pilot renewal.**

The first claim reports a provider-backed query match.

The second claim implies semantic understanding and is outside Level 1 unless separately governed and proven.

### Multiplicity and ordering

If several messages match:

- return the bounded set, up to the existing maximum of 5;
- preserve provider-backed ordering unless a different deterministic order is explicitly frozen;
- do not infer importance, best match, or “the one”;
- do not imply completeness beyond the actual bounded search.

If the provider indicates more results exist than are returned, the response must remain truthful about the bounded result set.

## Shared architecture boundary

GS002 extends the existing governed Gmail search family under the 3.180-series architecture.

It is not a parallel Gmail subsystem.

The target path remains:

```text
natural user request
→ typed intent candidate
→ deterministic validation
→ bounded Gmail search proposal
→ existing authority path
→ authorized provider acquisition
→ deterministic result matching / rendering
```

The model may help interpret what operation the user appears to want.

It may not:

- create authority;
- fabricate sender identities;
- inspect private evidence outside the approved Level-1 representation;
- decide semantic relevance;
- manufacture results.

## Relationship to the implementation baseline at freeze time

At the time this scoping document was frozen, the governed Gmail search path was intentionally narrower than GS002:

- `gmail.search` currently admits bounded time-window searches;
- the existing connector is ID-only discovery;
- the current conversational private-operation materializer rejects semantic subject terms;
- natural-language Gmail proposal logic deliberately rejects broader sender/topic forms.

GS002 therefore represents a deliberate future widening of an existing governed path, not evidence that the capability already exists.

No implementation work is authorized by this freeze.

## Explicit non-goals

Golden Scenario 002 does not decide or authorize:

- full email content reads;
- snippet-based semantic reasoning;
- model-visible private email content for match selection;
- Google Contacts integration;
- fuzzy sender matching;
- embedding similarity;
- semantic “aboutness” classification;
- drafting;
- reply composition;
- sending;
- mailbox mutation;
- standing Gmail authority.

## Deferred future capability boundaries

### Reading full content

Reading a selected email is a separate capability because it changes the private-evidence exposure boundary.

### Drafting

Drafting requires an explicit composition contract for model-generated prose intended for a third party.

Existing Level-1 composition rules govern bounded rendering of known facts. They do not by themselves authorize original third-party prose generation.

### Sending

Sending requires a stronger Act payload-integrity contract than Calendar proved.

At minimum, a future send capability must prove:

> **The literal body text approved by the human is the literal body text transmitted to the provider, with no regeneration or mutation between approval and send.**

That proof is not part of GS002.

## Freeze summary

Golden Scenario 002 is frozen as two sequential Level-1 proofs:

### GS002A — Find by sender

> **Natural sender reference → real mailbox identity evidence → strict deterministic all-token resolution → ambiguity surfaced, never guessed → bounded Gmail matches.**

### GS002B — Find by subject

> **Natural subject request → literal user terms → deterministic `subject:"literal terms"` Gmail query → provider-backed subject matches → truthful “matching” language, never unsupported semantic “aboutness”.**

The scenario exists to remove a real everyday cognitive burden without opening private semantic reasoning, recommendation, or action boundaries that the burden does not require.

> **One burden, one proof obligation, one failure mode at a time.**
