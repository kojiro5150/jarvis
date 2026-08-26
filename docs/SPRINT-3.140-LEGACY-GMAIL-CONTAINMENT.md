# Sprint 3.140 — Legacy `/api/chat` Gmail Containment

## Decision

Gmail execution is disabled at the legacy `/api/chat` boundary. Gmail remains available through
the governed `/api/lighter/chat` authority flow; this containment makes no global claim about
Gmail connectivity and does not converge the two chat stacks.

The path-scoped response is:

> This Gmail operation is not available through this chat path.

## Bypass proof and containment sequence

Before containment, a local passing regression demonstrated that a client-supplied
`governed_gmail_retrieval` capability caused `/api/chat` to call
`authorizeGmailCapability`, construct `GoogleGmailContentConnector`, and call
`routeChatCapability` without passing through `/api/lighter/chat`. The remote PR history does not
retain that pre-fix regression as a separate commit; this records the concrete local proof without
claiming otherwise.

The containment commit places one deterministic guard immediately after JSON decoding and before
legacy capability parsing. A matching Gmail operation now returns the neutral response above. It
does not call legacy Gmail authorization, construct a connector, enter acquisition routing, invoke
the chat model, or create/consume `PendingAuthorization`. Payload request fields, an opaque pending
reference, and model text that resembles a capability cannot pass or re-enter this guard.

## Verification boundary

The `/api/chat` route regression asserts zero calls to all three legacy Gmail seams:

1. `authorizeGmailCapability` (including pending-authorization creation or consumption);
2. `GoogleGmailContentConnector` construction; and
3. `routeChatCapability` acquisition routing.

The governed `/api/lighter/chat` regression suite remains the unchanged authority baseline. It
continues to cover exact bounded `gmail.search`, natural-language search proposal → `ASK` →
confirmation, exact identified-message `gmail.read [subject]`, separate search/read authority, and
resource policy before connector acquisition.

## Explicit non-goals

This change does not retire `/api/chat`, refactor shared Gmail architecture, add natural-language
Gmail read, broaden fields or policy, add Gmail send/write, start Drive, or alter Calendar,
DAWNWATCH, OperationalState, or the North Star architecture. Once containment and the unchanged
governed baseline are verified, this checkpoint stops.
