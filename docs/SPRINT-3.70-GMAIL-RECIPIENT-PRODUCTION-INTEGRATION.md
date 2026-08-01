# Sprint 3.70 — Gmail Recipient Production Integration

**Status:** Production Integration  
**Authority:** Sprint 3.69 Governed Gmail Recipient Contract

## Purpose

Connect authoritative Gmail recipient observations to governed DAWNWATCH through the existing
canonical Gmail projection path. This sprint implements the governed contract; it does not reopen
recipient governance, redesign DAWNWATCH, promote DAWNWATCH, change OAuth, or add Gmail scopes.

## Binding production path

```text
Google Gmail candidate queries
  → ordered message-ID union (Governance Engineering first; overlap removed)
  → one metadata-detail fetch per ID
  → retrieval instant captured after the detail response is received
  → canonical Gmail normalization
  → OperationalCommunication recipient evidence
  → narrow production DAWNWATCH bridge
  → governed DAWNWATCH presentation
```

Legacy `EmailMessage` remains a compatibility projection of the same acquisition. It does not gain
recipient fields and is not a canonical recipient authority. Local/mock records cannot establish
authoritative Gmail recipient availability.

## Acquisition contract

Production acquisition SHALL use the existing main-inbox query and Governance Engineering query in
`lib/connectors/google/gmail.ts`. It SHALL combine IDs before detail retrieval using the established
Governance-first `Set` pattern, fetch each selected detail once, and expose that same acquired set to
the legacy and canonical projections. Query membership is acquisition policy only.

List/detail 401 and 403 responses SHALL remain visible as authentication or authorisation failures;
they SHALL NOT become empty successful mailbox observations. A skipped detail is not evidence of no
recipient.

## Canonical normalization contract

The existing canonical normalizer is the sole recipient parser. Address-list parsing SHALL respect
quoted strings, comments, escaped characters, angle addresses, multiple elements, groups, unfolding,
and repeated header occurrences. Canonical values preserve the normalized source-asserted spelling.
A syntactic group is retained as one literal element and is never expanded.

Flattening is deterministic: every `To` occurrence and its elements, then every `Cc` occurrence and
its elements, then every visible `Bcc` occurrence and its elements. Recipient occurrences SHALL NOT
be deduplicated or identity-normalized.

Malformed partial input may retain successfully parsed values, but its evidence state is `unknown`.
Missing or empty headers are also `unknown`.

## Evidence vocabulary

The implemented closed vocabulary is:

* `available` — at least one returned recipient element parsed successfully and no occurrence was
  malformed or ambiguous;
* `not_fetched` — acquisition positively records that applicable detail evidence was not retrieved;
* `not_authorised` — an authoritative failure establishes that access prevented observation;
* `unknown` — absence, omission, empty/malformed input, partial coverage, or another cause cannot be
  distinguished safely.

`none` is reserved and SHALL NOT be emitted.

## Provenance and time

For each detail, `retrievedAt` means the instant the connector finished receiving the authoritative
metadata-detail response. It is not Gmail `Date`, `internalDate`, projection time, state assembly
time, snapshot time, or render time. Source-qualified communication identity, connector retrieval
time, a genuine acquisition snapshot identity, and communication-level provenance SHALL survive to
the production bridge. No recipient field-level provenance subsystem is introduced.

## Governed DAWNWATCH sufficiency

The bridge may supply recipient values capable of producing `available` only for live canonical
observations with non-empty successfully parsed values, stable source-qualified identity, assertion
identity, available Gmail source state, truthful retrieval time, genuine snapshot identity, and no
malformed/ambiguous occurrence or fallback substitution. Partial values remain canonical but are
withheld from the DAWNWATCH semantic-field check so they cannot upgrade coverage.

The only supported claim is:

> At least one asserted recipient value was observed in returned recipient headers for this
> source-qualified communication.

It does not establish delivery, resolved identity, completeness, hidden-recipient absence, mailbox
ownership, or group membership.

## Preserved boundaries

This sprint introduces no canonical recipient roles, `none`, alias resolution, group expansion,
delegated/routed-mailbox interpretation, hidden-recipient inference, Gmail scope, OAuth flow,
DAWNWATCH selector or evaluation change, presentation redesign, or DAWNWATCH promotion.

## Required verification

Tests SHALL cover quoted commas; comments and angle addresses; groups; repeated headers; governed
ordering; duplicate preservation; malformed partial and missing evidence; authorisation failure;
retrieval-time propagation; both candidate queries; pre-fetch ID deduplication and one detail fetch;
local/mock rejection; and end-to-end governed availability. Full validation is `npm test`,
`npm run lint`, `npm run typecheck`, `npm run build`, and `git diff --check`.

Repository validation is isolated evidence only. Real Gmail observations, application restart,
operator-visible behaviour, and promotion remain subsequent Sprint 3.71–3.73 work.
