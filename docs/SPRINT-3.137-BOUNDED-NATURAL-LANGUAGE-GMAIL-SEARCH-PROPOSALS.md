# Sprint 3.137 — Bounded Natural-Language Gmail Search Proposals

## Scope

JARVIS may deterministically recognise a high-precision natural-language request to search the
operator's Gmail over only the last day (including the past 24 hours) or last week (including the
past seven days). Recognition creates the existing bounded `gmail.search` operation with
`maxResults=5`; it supplies no authority.

The authority sequence is fixed:

```text
exact gmail.search command → ALLOW
natural-language request → ASK → server-owned PendingAuthorization → explicit confirmation → ALLOW
```

The pending record, rather than conversation history or client data, retains the exact `1d | 7d`
operation. Connector construction and `messages.list` occur only after confirmation. Declines and
unconfirmed responses perform no acquisition. Exact commands continue to use the frozen Sprint
3.136 path directly and do not create pending state.

## Preserved boundaries

The recogniser admits no sender, subject, content term, arbitrary query, unbounded period, or read
request. Search still returns at most five identifiers only. It creates no `gmail.read` authority,
does not retrieve message content, and cannot chain search into read. Gmail reads, Calendar,
specialists (including DAWNWATCH), Drive, Memory, model invocation, policies, and architecture are
unchanged.
