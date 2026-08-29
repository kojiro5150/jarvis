# Golden Scenario 002B — Scoping Freeze: Find Email by Subject

**Frozen:** 29 August 2026  
**Status:** **SCOPING FREEZE — NOT A BUILD COMMITMENT**  
**Capability level:** **Know only**  
**Shape:** **Find by literal subject terms**

## Human burden

> **I know roughly what the subject says. Find the matching email without making me manually search Gmail.**

Canonical conversational shape:

> **Find the email with subject pilot renewal.**

The user should not need to know Gmail query syntax.

## Core invariant

> **User-supplied subject terms may become only a bounded deterministic Gmail subject query. Returned messages may be described as subject-query matches, not as proof that the email is semantically about the topic.**

## Evidence and reasoning boundary

GS002B uses Gmail provider search semantics only.

It does not require JARVIS to inspect message bodies or snippets, rank semantic relevance, infer topic meaning, or decide which result is "best".

The initial scope is:

- user-supplied literal subject terms;
- deterministic query construction;
- explicit Gmail search authority;
- Gmail provider matching;
- maximum 5 returned results;
- provider-backed ordering;
- subject-only result release through the existing content policy;
- deterministic factual rendering.

## Exact query-construction rule

Gmail API `messages.list` accepts a `q` parameter using Gmail's advanced search syntax. Gmail supports `subject:` for subject filtering and double quotes for exact word/phrase matching.

GS002B therefore freezes the query shape as:

```text
subject:"<literal user subject terms>"
```

with this non-negotiable rule:

> **User-supplied subject terms are wrapped in Gmail's quoted-phrase syntax before query construction. Any literal double-quote character (`"`) in the supplied term causes the request to be rejected outright — never silently stripped, rewritten, escaped by an undocumented convention, or passed through as-is.**

Consequences:

- `pilot renewal` → `subject:"pilot renewal"`
- `pilot renewal OR from:ceo@example.com` → `subject:"pilot renewal OR from:ceo@example.com"`
- `pilot renewal -draft` → `subject:"pilot renewal -draft"`
- `pilot "renewal"` → **reject before connector invocation**

The user-provided text is never concatenated into an unquoted Gmail query fragment.

JARVIS does not invent or rely on a backslash-escaping convention for embedded quotes because no such convention is frozen by this contract.

## Input validation

Before a query proposal is created, the literal subject term must:

- be non-empty after deterministic whitespace normalization;
- remain within a separately tested bounded length and token count;
- contain no literal double-quote character;
- remain user-supplied literal text rather than model-generated semantic expansion.

Invalid input must fail closed before Gmail connector acquisition.

## Truthful wording

Allowed:

> **I found 3 Gmail messages with subjects matching "pilot renewal".**

Not earned:

> **I found 3 emails about the pilot renewal.**

The first describes a bounded provider-backed subject query.

The second implies semantic topic understanding and is outside GS002B.

## Authority boundary

The natural request creates a typed proposed Gmail subject-search operation.

Before provider acquisition, JARVIS must ask for explicit Gmail search confirmation through the existing server-owned authority path.

Confirmation authorizes only the exact frozen proposal. It does not confer:

- message-body read authority;
- snippet-read authority;
- drafting authority;
- send authority;
- mailbox mutation authority;
- standing Gmail authority.

## Result boundary

After authorization:

- execute the exact bounded subject query;
- request at most 5 results;
- preserve provider-backed order;
- release only allowed subject metadata under the existing resource policy;
- do not expose snippets or bodies;
- do not claim completeness beyond the bounded result set;
- do not infer importance or choose "the one".

## Conversational scope

The canonical GS002B grammar is deliberately narrow.

Supported wording should first prove explicit subject-search intent, such as:

- `Find the email with subject pilot renewal.`
- `Search my email subject for pilot renewal.`
- `Find emails with pilot renewal in the subject.`

The wording `Find the email about pilot renewal` is deliberately **not** silently mapped to subject search in this freeze.

Whether `about` can later be resolved through conversational context without changing the evidence boundary belongs to a separate conversational-nuance proof.

Unsupported phrasing is acceptable. Authority or private-evidence escape is not.

## Explicit non-goals

GS002B does not authorize:

- semantic "aboutness" search;
- body or snippet inspection;
- fuzzy subject similarity;
- stemming;
- embeddings;
- model-generated search expansion;
- best-match ranking;
- automatic result selection;
- ordinal message reading;
- drafting;
- sending;
- mailbox mutation.

## Freeze summary

> **Natural subject request → literal user terms → deterministic validation → `subject:"literal terms"` → explicit Gmail search authority → bounded provider acquisition → subject-only factual result rendering.**

> **Any supplied double quote rejects the proposal before connector invocation.**

> **Matching is a provider-backed subject-query fact, not semantic understanding.**
