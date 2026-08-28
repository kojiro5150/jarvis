# Sprint 3.180b — Public/private capability selection

## Problem

Reduce the user's need to know which internal capability owns a request while preserving the North Star separation between interpretation, authority, acquisition, and truth.

## Change

After existing deterministic governed routes have had first refusal, JARVIS may invoke a bounded current-utterance-only selector for likely capability requests.

The selector:

- receives only the current utterance;
- returns only the closed Sprint 3.180a intent envelope;
- cannot carry authority, provider IDs, private evidence, execution state, or results;
- must use literal subject tokens supplied by the user;
- is gated so ordinary conversation does not incur an extra selector call.

Initial capability classes:

- public information;
- Calendar;
- Gmail;
- Drive.

## Deterministic first

Existing governed Calendar, Gmail, Drive, and pending-authorization paths remain first.

3.180b does not override or replace a deterministic result.

## Runtime outcomes

A validated public-information request receives a server-owned truthful state:

> I recognized that as a public-information request, but public lookup is not yet available in this runtime.

A validated private request that did not already match an existing governed path receives a source-specific truthful state saying that natural-language handoff to that governed authority path is not yet wired.

Neither response creates pending authorization or invokes a connector.

## Provenance correction

Live testing showed that a public weather question immediately after Calendar containment could inherit the previous containment provenance response.

Containment provenance is now scoped to deictic follow-ups to the contained turn. A new unrelated question such as weather does not inherit that state.

## Non-goals

- no public search execution;
- no weather provider;
- no new Gmail/Drive/Calendar authority;
- no private semantic title/content exposure;
- no conversation-history authority;
- no model-generated facts.

## Acceptance

- `Will it rain in Geelong tomorrow?` selects public information, not Calendar.
- The same question after a contained Calendar turn still selects public information.
- `What are my last five emails?` selects Gmail rather than producing a false global Gmail-unavailable claim.
- No selector result authorizes or executes the selected capability.
- Existing governed Drive/Calendar routes remain first and unchanged.
