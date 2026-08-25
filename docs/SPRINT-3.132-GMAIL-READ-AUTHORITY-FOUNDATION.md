# Sprint 3.132 — Gmail Read Authority Foundation

- **Status:** Implemented for one identified message
- **Date:** 25 August 2026
- **Scope:** Authority-gate the existing `/api/chat` governed Gmail content-retrieval path

## Why resource policy was insufficient

The existing Gmail resource-policy adapter answers whether a particular identified resource and
field may be processed in the configured environment. That policy remains necessary, but it is not
positive evidence that the user requested a read. Treating a permitted resource as user authority
would collapse two independent decisions and allow acquisition without an applicable user act.

Sprint 3.132 therefore introduces a closed operation:

```text
gmail.read {
  resourceId: one non-empty Gmail message identifier,
  requestedFields: one exact, non-empty, duplicate-free subset of the governed Gmail field vocabulary
}
```

The operation permits neither message discovery nor substitution of its identifier or field set.

## Trusted authority source and ordering

Positive explicit authority comes only from the actual raw current user utterance in the request's
validated chat `messages`. Operation metadata inside `body.capability` is caller-supplied and is not
an authority source. The exact explicit form is
`gmail.read <resourceId> [field,field]`; both parameters must match the proposed operation.

The production order is fixed:

```text
actual current raw user utterance
→ exact gmail.read authority adjudication
→ ALLOW
→ Gmail resource-policy evaluation
→ identified-message acquisition
```

`ASK`, `DENY`, malformed references and fabricated references stop before Gmail connector
construction. Authority adjudication is deterministic and does not invoke a conversational model.

## PendingAuthorization binding

An ambiguous initial request creates a server-owned `PendingAuthorization` containing the complete
exact `gmail.read` operation. Only its opaque identifier crosses the client boundary. A later actual
raw user utterance such as `confirm`, `yes` or `no` is resolved against that server record. On
confirmation, replacement `resourceId` or requested-field metadata in the capability payload is
ignored: execution uses the server-stored message identifier and exact field set.

## Resource policy and acquisition guarantees

After authority, the existing `GmailContentRetrievalAdapter` remains the sole resource-policy seam.
It evaluates policy before invoking the connector. `retrieval_prohibited`,
`approved_environment_only`, `redacted_processing_only`, missing or invalid policy, and unmatched
policy all produce zero `retrieveMessage` calls. Connector construction itself occurs only after
`ALLOW`.

This foundation supports retrieval of exactly one already identified Gmail message. It does not
provide Gmail search, listing, discovery, query expansion, thread traversal or ambient mailbox use.

## Explicit non-scope

Sprint 3.132 does not add or change:

- Gmail search, listing or discovery;
- broader conversational Gmail access or ambient mailbox context;
- a DAWNWATCH private briefing or any DAWNWATCH behavior;
- `BRIEF_ME_GRANT`, standing grants or named grants;
- Drive authority or acquisition;
- Memory authority or acquisition;
- Gmail resource-policy semantics; or
- Calendar authority or acquisition.
