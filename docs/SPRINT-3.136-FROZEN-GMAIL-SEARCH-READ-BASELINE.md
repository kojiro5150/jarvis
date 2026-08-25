# Sprint 3.136 — Frozen Gmail Search → Read Regression Baseline

- **Status:** Frozen regression baseline
- **Date:** 25 August 2026
- **Scope:** No capability or architecture change

## Successful live transcript (verbatim)

The successful development/demo validation transcript being frozen is:

```text
User: gmail.search [newer_than:1d]
JARVIS: Gmail message IDs:
- live-message-1
- data-2
- data-3
- data-4
- data-5

User: gmail.read live-message-1 [subject]
JARVIS: Subject: Your Google Account was recovered successfully
```

The transcript is two requests, not a composed operation. The second `User:` line is indispensable:
the search authority has ended, and the returned identifier is only data until that new, exact
`gmail.read` utterance independently establishes read authority.

## Frozen invariants

The end-to-end route regression freezes this already-proven vertical:

```text
exact gmail.search authority
→ messages.list with newer_than:1d and maxResults=5
→ at most five message IDs, with no message content acquisition
→ separate exact gmail.read authority for one returned ID and [subject]
→ development/demo subject-only resource policy
→ one identified-message retrieval
→ deterministic Subject: presentation
```

- Search output is ID-only and cannot authorize, trigger, or parameterize a later read.
- An identifier copied from search, without an exact `gmail.read` command, does not enter policy or
  retrieval. Prior search conversation is not authority evidence for the read.
- The explicit read is independently adjudicated before policy loading and retrieval. The tracked
  development/demo policy admits only `subject`; retrieved snippets and all other fields remain
  unreleased.
- Both governed operations bypass the conversational model and specialist handoff path. Calendar
  connectors are not entered by either command.
- The search window remains the closed `1d | 7d` enum, acquisition remains `messages.list`, and the
  result bound remains five.

This freeze adds no combined search/read capability, implicit selection, natural-language Gmail
interpretation, new field, standing grant, pending authorization behavior, provider operation, or
architectural seam. Calendar and all existing authority behavior remain unchanged.
