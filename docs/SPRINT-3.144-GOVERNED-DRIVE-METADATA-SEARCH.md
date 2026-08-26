# Sprint 3.144 — Governed Drive Metadata Search

## Scope

The first Drive capability is `drive.search`. Its only authority grammar is the
exact explicit command `drive.search <file name>` (for example,
`drive.search Atlas`). Natural-language proposals and an `ASK` flow are not
implemented.

## Contract

Authority is derived from the untouched current JARVIS utterance before the
Google connector is constructed. Typed and transcribed voice turns use that
same canonical server path. Only the Google governed connector may execute;
there is no local-memory fallback.

Execution makes one deterministic Drive `files.list` call under the existing
`drive.metadata.readonly` scope. The name operand is escaped as a Drive query
literal, trashed files are excluded, ordering is fixed, and both the requested
and released result counts are capped at five. Released fields are exactly the
provider file ID, name, MIME type, and modified time. Provider IDs are not
replaced.

The response is deterministic formatting of that metadata. File content,
snippets, summaries, export, download, follow-on reads, model synthesis, and
broader OAuth scopes are outside this sprint. PendingAuthorization, Calendar,
Gmail, model-context isolation, voice turn ordering, and OperationalState
quarantine are unchanged.

## Verification

Tests cover exact grammar, pre-connector authority, safe literal escaping,
deterministic `files.list` parameters, the hard release cap, and preservation of
provider IDs. Capability-truthfulness correction is extended only to describe
the narrow metadata search when an ordinary model falsely denies all Drive
capability; it supplies neither authority nor connector evidence.
