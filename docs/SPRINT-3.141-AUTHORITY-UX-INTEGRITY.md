# Sprint 3.141 — Authority UX Integrity

## Decision

Authority confirmation UX is owned exclusively by deterministic authority machinery. Ordinary
model output cannot impersonate a governed Calendar or Gmail `ASK`. A server-side reply boundary
neutralizes model-generated confirmation language before it can be presented to the user.

The governed-history placeholders used to withhold deterministic private releases and prior exact
Gmail read requests from ordinary model context are internal model-context artifacts. They are
never user-visible; if an ordinary model returns a current placeholder, the reply boundary removes
it before presentation.

## Preserved authority boundary

Genuine governed Calendar and Gmail `ASK` responses continue to be produced by the existing
deterministic authority paths and are unchanged. Their server-owned pending authorization
references, confirmation handling, acquisition gates, and deterministic releases are not altered
by the ordinary-model reply boundary.

Unsupported weekday Calendar requests, including `Show my calendar Monday`, remain unsupported.
They do not gain a weekday window, create pending Calendar authority, or make a following bare
`yes` authoritative.

## Explicit non-goals

This checkpoint adds no weekday Calendar support, authority grammar, natural-language
`gmail.read`, Drive capability, connector behavior, policy permission, or broader capability
redesign. It changes neither genuine Calendar/Gmail governed `ASK` flows nor the Sprint
3.138–3.140 boundaries.
