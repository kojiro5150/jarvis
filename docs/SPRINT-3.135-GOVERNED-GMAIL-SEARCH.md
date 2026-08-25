# Sprint 3.135 — Governed Gmail Search

## Scope

Sprint 3.135 adds one distinct discovery capability with exactly two admitted commands:

- `gmail.search [newer_than:1d]`
- `gmail.search [newer_than:7d]`

The exact, raw current-user utterance is the sole authority evidence. Search authority is not
`gmail.read` authority: neither prior conversation, capability metadata, a returned identifier, nor
an existing read grant can authorize discovery or content retrieval.

## Deterministic boundary

A valid operation always requests at most five results. The connector constructs the Gmail provider
query from the authorized `1d` or `7d` enum and passes `maxResults=5`; callers cannot provide Gmail
`q`. Discovery uses only `messages.list` and releases only `message.id` values. It does not call
`messages.get`, request metadata, or inspect a subject, snippet, or body.

The lighter JARVIS route handles valid searches and malformed `gmail.search` commands before the
Calendar path, Gmail read path, model invocation, or specialist routing. Syntax validation and
adjudication happen before connector construction. Search results are deterministically presented
as data, do not create authority, and never chain into `gmail.read`.

## Non-goals

This slice does not add natural-language mailbox search, arbitrary Gmail query syntax, pagination,
search-to-read composition, PendingAuthorization for search, wider result counts, or any change to
identified-message Gmail reads, Calendar reads, policy evaluation, or existing pending operations.
