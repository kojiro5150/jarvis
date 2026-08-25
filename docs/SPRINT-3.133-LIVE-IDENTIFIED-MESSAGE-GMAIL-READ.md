# Sprint 3.133 — Live Identified-Message Gmail Read

- **Status:** Implemented
- **Date:** 25 August 2026
- **Scope:** Exact `gmail.read` commands on `/api/lighter/chat`

## Live contract

JARVIS now intercepts the deliberately closed command grammar before Calendar handling, model
invocation, or specialist handoff:

```text
gmail.read <message-id> [field,field]
```

The admitted fields remain the existing governed Gmail vocabulary: `subject`, `snippet`,
`plain_text_body`, `attachment_filenames`, and `attachment_mime_metadata`. The message identifier,
field order, and field set are bound exactly from the raw current user utterance. Duplicate,
unknown, empty, spaced, or otherwise malformed field lists return fixed syntax guidance and do not
fall through to conversational interpretation.

## Execution order

The production path is:

```text
raw current user utterance
→ existing exact gmail.read authority
→ ALLOW
→ existing content-retrieval resource policy
→ existing Google identified-message content connector
→ deterministic requested-field presentation
```

Policy loading and connector construction occur only after authority returns `ALLOW`. Policy denial
does not invoke `retrieveMessage`. Retrieved content is formatted directly by server code and is
never sent to a model. The response cannot propose or execute a DAWNWATCH or other specialist
handoff.

## Preserved boundaries

This sprint reuses the `gmail.read` operation, its `PendingAuthorization`-capable authority seam,
the governed Gmail retrieval adapter, and `GoogleGmailContentConnector`. It adds no Gmail search,
listing, discovery, latest-message selection, natural-language interpretation, thread traversal,
ambient mailbox context, standing authority, send capability, or Calendar behavior change.
