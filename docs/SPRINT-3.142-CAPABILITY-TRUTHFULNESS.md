# Sprint 3.142 — Capability Truthfulness

## Decision

The ordinary-model reply integrity boundary deterministically corrects false global capability
denials for Calendar/Gmail-related requests that have fallen through to the unsupported ordinary
path. It uses only static knowledge that `calendar.read`, `gmail.search`, and identified-message
`gmail.read` exist.

The fixed corrections are:

- `The governed Calendar path supports calendar.read, but it does not support this request.`
- `The governed Gmail path supports gmail.search and identified-message gmail.read, but it does not support this request.`

These statements represent capability existence and current-path support only. They do not
represent user authority, connector availability, connection state, resource-policy permission,
or execution success. Model output is presentation input and is never authority evidence.

## Integrity boundary

The correction applies only after deterministic governed routing has declined to handle the
current request and an ordinary JARVIS model reply makes a false global denial such as “I don't
have access,” “the capability does not exist,” or a connected/disconnected assertion. It does not
turn model wording into a proposal, an `ASK`, an authority decision, or connector evidence.

The boundary creates no `PendingAuthorization`, calls no Calendar or Gmail connector, and claims
no connected or disconnected state. Unrelated ordinary replies and truthful path-scoped
limitations remain unchanged.

## Preserved boundaries

- Genuine governed Calendar and Gmail `ASK` flows, server-owned pending references,
  confirmations, acquisition gates, and deterministic releases are unchanged.
- `Show my calendar Monday` remains unsupported; no weekday window is added.
- Calendar capability discussion and governed-result recall remain non-acquiring.
- `Show me my emails`, `Check my Gmail`, `Read my latest email`, and `Get my inbox` remain
  non-acquiring unsupported ordinary requests.
- Sprint 3.141 fake-`ASK` neutralization and internal-placeholder suppression remain intact.

## Non-goals

This checkpoint adds no weekday Calendar support, natural-language `gmail.read`, broader Gmail
grammar, Drive capability, connector behavior, full convergence, or North Star change. Correct
capability representation does not broaden authority.
