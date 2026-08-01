# Governed Gmail Recipient Contract

**Status: Governed**  
**Governance date:** 2026-08-01  
**Evidence base:** Sprint 3.68 at repository snapshot `e3c06a1`

## 1. Purpose

This document is the authoritative governance contract for Gmail recipient observation,
normalization, canonical publication, provenance, absence, coverage, and future production
integration. It supersedes the proposed classifications in Sprint 3.68. Sprint 3.68 remains the
authoritative evidence base, but neither its proposals nor existing code confer implementation
authority.

This contract applies the constitutional publication test independently. A protocol observation
may be published only through its existing owner, with stable identity and provenance and without
turning acquisition policy, delivery, or consumer demand into a communication assertion.

## 2. Scope

This contract governs returned `To`, `Cc`, and `Bcc` observations; their faithful normalization and
flattened canonical representation; ordering, duplicates, malformed input, and absence; literal
aliases and groups; non-inference boundaries; recipient provenance and observation time;
historical coverage; Gmail source scope and errors; DAWNWATCH evidence sufficiency; and the shape
of a future Sprint 3.70 production integration.

It does not govern or authorise connector, scope, OAuth, model, adapter, state, bridge, selector,
DAWNWATCH, test, endpoint, default, or promotion changes. It does not amend an ADR or responsibility
statement.

## 3. Governing Authority

The review applied, in order, the Engineering Constitution, North Star, JESS, Roadmap,
Constitutional Publication Principles, accepted ADRs including ADR-0023, the Operational
Communication Responsibility Statement, Sprint 3.68, the Sprint 3.64 structural precedent, and
current source and tests. The complete Roadmap and Sprint 3.68 audit were read before decisions
were drafted.

The controlling principles are projection before interpretation, evidence-driven canonical
evolution, single responsibility, source-qualified identity, truthful provenance, deterministic
replay, explicit insufficiency, and the prohibition on reconstructing canonical facts from legacy
or consumer state. `OperationalCommunication` already owns asserted recipients; this establishes
the publication owner, not the correctness of every current transformation.

## 4. Existing Evidence

Gmail metadata requests already name `To`, `Cc`, and `Bcc`. The raw detail can retain repeated
named headers. The isolated canonical Gmail normalizer collects those role buckets, applies a
simple comma split, and publishes a flattened `recipients: string[]` with communication-level
provenance. Its tests establish capability, not governance.

Production instead calls the legacy `listRecent()` path. Legacy `EmailMessage` has no recipient
field, `OperationalState` cannot carry recipient assertions, and the DAWNWATCH bridge supplies an
empty array. The resulting `insufficient_coverage` is honest. The canonical observation method is
not production-wired, omits the additional Governance Engineering candidate query used by the
legacy path, and records projection rather than proven retrieval time. Get-level non-401 errors
are skipped without a cause discriminant. Local fallback has no recipient assertion.

## 5. Production Routing Decision

> **Production recipient flow SHALL route through the existing canonical Gmail projection path.**

Sprint 3.70 shall integrate that path after conforming its normalization and evidence outputs to
this contract. It shall not add recipients to `EmailMessage`, duplicate parsing in the legacy
normalizer, or make legacy `OperationalState` the recipient authority. A narrow application bridge
may consume canonical communications and their evidence, but may neither reconstruct them nor use
synthetic bridge identity or assembly time as Gmail observation provenance.

Option A preserves the existing constitutional owner, reuses a tested projection boundary, and
avoids semantic drift. Option B would broaden a legacy heuristic/display model and create a second
normalization authority merely to reduce wiring work. Option C is unnecessary: a narrow consumer
projection is part of integration, not a new source or canonical layer. Sprint 3.70 must avoid
duplicate Gmail fetches when assembling legacy and canonical consumers; one acquired observation
set may feed distinct projections, but the recipient transformation shall have one canonical
implementation.

This routing decision does not declare the current adapter production-conformant and does not
change production today.

## 6. Canonical Recipient Representation

The authorised publication unit is one **normalized, source-asserted address-list element** as a
string compatible with `OperationalCommunication.recipients: string[]`:

* a mailbox element retains its display name (if present) and address syntax; normalization may
  remove transport folding and insignificant outer whitespace but must not resolve identity,
  rewrite aliases, lowercase for identity, or claim deliverability;
* a syntactic RFC group construct is retained as one literal element; its members are not expanded
  into inferred group membership;
* a literal distribution-list mailbox address is an ordinary asserted mailbox value, not evidence
  of members; and
* a whole multi-recipient header value is not one canonical recipient, because it prevents stable
  recipient-value consumption, while an unqualified comma fragment is not a recipient either.

The raw, named header remains a Connector Observation. Canonical publication contains normalized
elements, not a claim that the values identify people, owners, actual delivery targets, or all
recipients.

## 7. `To` / `Cc` / `Bcc` Treatment

All returned occurrences of all three named headers are accepted connector observations. Every
successfully parsed element from any of the three may contribute to canonical `recipients`.
Flattening is authorised because the existing canonical responsibility owns recipients but not
roles.

Role remains connector-observation context. Adding `To`/`Cc`/`Bcc` roles to
`OperationalCommunication` is **Deferred** pending independent consumers, a schema/responsibility
review, and replay/provenance requirements. Sprint 3.70 may retain roles internally long enough to
apply deterministic flattening and diagnose parsing, but shall not publish a new canonical role
field.

Visible `Bcc` is a faithful asserted recipient under the same rules as `To` and `Cc`. A `Cc`-only
or visible-`Bcc`-only observation can support the bounded recipient-value claim. **Absence of a
visible `Bcc` header does not establish that no hidden recipient existed.** No hidden-recipient
inference or recipient-completeness claim is authorised.

## 8. Parsing and Normalization Rules

1. Header names are matched case-insensitively and every returned occurrence is processed.
2. Unconditional `split(",")` is prohibited. Tokenization shall use a standards-aware Internet
   message address-list parser that protects quoted display-name commas, comments, angle-addresses,
   escaped characters, and group syntax.
3. Occurrence boundaries and source element order shall be retained through normalization.
4. Display names are preserved after safe unfolding and insignificant-whitespace normalization;
   they are not decoded into identity assertions. Address validation is syntactic only. DNS,
   mailbox existence, deliverability, ownership, and person resolution are not required or
   authorised.
5. Empty header values and empty list elements are not canonical recipients. They are malformed or
   ambiguous evidence, not `none`.
6. A malformed or ambiguously parsed occurrence does not fail or discard the communication.
   Unambiguously parsed elements may still be published, but the communication's recipient
   coverage is `unknown` and DAWNWATCH is `insufficient_coverage`; a nonempty partial array may not
   upgrade it.
7. Raw malformed text may remain in connector evidence for diagnosis under existing evidence and
   privacy rules, but shall not be placed in canonical `recipients`.

These rules modify the current simple comma-split behavior. Selecting a concrete parser library is
an implementation choice only if its behavior satisfies this normative contract and is covered by
fixtures.

## 9. Ordering and Duplicate Rules

Canonical flattened order is deterministic: all returned `To` occurrences in provider-returned
occurrence order and parsed element order, followed by `Cc` under the same rule, followed by `Bcc`.
This is a governed canonical flattening order, not a claim that cross-role order was asserted by
the sender or has priority significance. Consumers shall not infer rank or salience from it.

Every successfully parsed asserted occurrence is retained. Exact or case-variant duplicates are
not removed. Deduplication is prohibited because no governed equality rule establishes that two
display forms, aliases, or address occurrences are the same assertion. Consequently no email
case-folding, display-name stripping, Unicode equivalence, or provider-specific normalization is
authorised for equality. Consumers may count observations only if their own governed claim makes
occurrence counting relevant; the canonical array itself does not assert unique persons or
mailboxes.

## 10. Alias / Group / Delegation / Routing / Hidden Recipient Boundary

* **Alias:** the literal observed mailbox is publishable. Mapping it to a person, primary address,
  or mailbox owner is rejected on current evidence. A future separately governed authoritative
  identity source would require a new decision; this contract supplies no conditional authority.
* **Group/distribution list:** a literal asserted address or syntactic group construct is
  publishable. Membership expansion is rejected because message headers are not an authoritative
  membership source.
* **Delegation:** a header does not establish delegation, acting authority, or mailbox ownership.
  Delegated-mailbox interpretation is rejected.
* **Routing:** query membership, mailbox delivery, labels, and the Governance Engineering query do
  not assert a recipient. Routed-mailbox interpretation is rejected. The address
  `info@governanceengineering.com.au` is canonical only when a returned recipient header asserts
  it.
* **Hidden recipients:** reconstruction from delivery, query membership, mailbox presence, labels,
  or an absent `Bcc` is rejected.

Literal-value publication and identity interpretation are separate claims. The former does not
authorize the latter.

## 11. Absence-Semantics Vocabulary

Recipient evidence shall carry an explicit state; `[]` shall never carry these meanings implicitly.

| State | Binding definition | Emission rule |
| --- | --- | --- |
| `none` | The authoritative protocol observation affirmatively establishes that no recipient value exists under this contract. | Not presently supportable for Gmail. Missing or empty headers do not prove it. It remains reserved until source semantics and evidence are separately demonstrated. |
| `not_fetched` | The source may contain recipient evidence, but the applicable observation path did not retrieve the message detail or did not request/carry recipient headers. | Future code may emit it when that acquisition fact is positively recorded, including skipped detail where no more precise cause exists. The legacy path is architecturally known to discard/carry none but currently exposes no per-message discriminant. |
| `not_authorised` | Authority or granted scope specifically prevented retrieval of recipient evidence. | Future code may emit it only from a preserved, recipient-relevant 401/403 or equivalent authoritative cause. Current list-level 401/403 may establish source capability unavailability; current get-level handling cannot reliably distinguish this per message. |
| `unknown` | Evidence cannot safely distinguish absence, omission, unsupported provider behavior, empty/malformed parsing, partial retrieval, or another cause. | Default for missing/empty recipient headers, unresolved malformed input, old records, and any ambiguous absence. Re-observation may replace it only with newly recorded evidence. |

Current canonical code effectively emits only a recipient array and therefore emits none of these
states as a runtime discriminant. Current production must continue to interpret its empty bridge
input as unknown/insufficient, not `none`. Local/mock substitution is not an authoritative Gmail
recipient observation: it yields source `unavailable` for current Gmail and cannot emit `none` or
`available`; if described at record level its recipient evidence is `unknown` and identified as
mock.

## 12. DAWNWATCH Evidence-Sufficiency Rule

DAWNWATCH recipient evidence is **`available`** for a communication if and only if:

1. at least one nonempty canonical recipient was successfully and faithfully derived under this
   contract from an actual returned `To`, `Cc`, or visible `Bcc` header;
2. the same observation carries stable source-qualified Gmail message identity,
   communication-level provenance, a truthful connector retrieval observation time, and an
   available Gmail source state;
3. no recipient occurrence in that observation has unresolved malformed or ambiguous parsing;
4. no local/mock, last-good, inferred, query-derived, or unavailable-source substitution supplied
   the value; and
5. the DAWNWATCH item and snapshot retain the canonical reference, assertion identity, source
   identity, and real snapshot/evidence identity required by the presentation contract.

One `To`, `Cc`, or visible `Bcc` value is sufficient. A literal alias, distribution-list address,
or unexpanded syntactic group is sufficient only for its literal value. The exact bounded claim is:

> **At least one asserted recipient value was observed in returned recipient headers for this
> source-qualified communication.**

`available` never means “all actual recipients are known,” “delivery occurred,” or “recipient
identity is resolved.” Hidden-recipient completeness may not be claimed.

DAWNWATCH is **`insufficient_coverage`** when Gmail is available and a communication is represented
but recipient state is `unknown`, `not_fetched`, or reserved `none` without an independently
governed negative-claim rule; when parsing is malformed/ambiguous; when provenance, retrieval time,
canonical assertion identity, or snapshot evidence is missing/synthetic; or when only stale,
historical, partial, or local data exists. One sound communication cannot upgrade another unsound
communication or prove completeness of a requested set.

DAWNWATCH is **`unavailable`** when the required Gmail source reports unavailability, including
connection, refresh, or source-level authorization failure. Local/mock fallback remains explicitly
fallback and cannot upgrade that status. Recipient-level `not_authorised` within an otherwise
available partial source produces `insufficient_coverage` for the communication/request and must
remain visible; if the required source as a whole cannot be observed, the result is `unavailable`.

## 13. Provenance and Observation-Time Rules

Recipients share the communication observation's existing source identity and communication-level
provenance. Field-level provenance is not required and is not authorised merely for DAWNWATCH.
Evidence must establish that recipients came from the same returned header set as that
source-qualified communication.

The canonical source identity shall remain Gmail-qualified and anchored to the stable Gmail or
protocol message identity according to the existing adapter contract. Each downstream assertion
shall retain that canonical reference; it shall not replace it with an unqualified legacy ID.

**Observation time** for recipient evidence is connector retrieval time: the instant the
authoritative message-detail response containing the headers was received. It shall be captured at
the connector boundary. Projection time is the later instant normalization/projection ran and may
not substitute for retrieval time. Gmail message `Date`, Gmail internal date, state assembly time,
snapshot time, and DAWNWATCH rendering time are distinct and shall retain their own meanings.

Current synthetic DAWNWATCH bridge snapshot identities and `state.updatedAt` observation time are
not sufficient for recipient `available`. A real evidence/snapshot identity that links the
canonical observation to the consumer projection is required. Projection may not fabricate a
retrieval time for old observations.

## 14. Historical and Stale Coverage

New support never implies historical completeness. Pre-support, imported, persisted, stale, or
mock records lacking explicit recipient observation evidence remain `unknown` and DAWNWATCH
`insufficient_coverage`. Present source availability alone cannot upgrade them.

An authoritative re-fetch may upgrade an individual record when it produces a new source-qualified
observation satisfying parsing, provenance, retrieval-time, and identity rules. It does not prove
that every historical message was fetched or that a bounded query observed a complete mailbox.
Records outside a current query window, deleted or no longer matching records, and skipped details
remain uncovered.

Future persistence shall store a versioned recipient-normalization/coverage rule identifier,
explicit evidence state, retrieval observation time, source-qualified identity, and provenance so
replay can distinguish old and current semantics. This is a Sprint 3.70 constraint, not authority
to introduce a general field-level evidence system.

## 15. Source-Scope Rules

The canonical adapter's current main-inbox-only candidate scope is insufficient to preserve the
production communication scope already represented by the legacy path, which also queries
Governance Engineering mail. Before recipient-enabled production replacement, Sprint 3.70 shall
make the canonical acquisition scope explicit and include both currently intended candidate
queries unless a separately governed product scope narrows them.

Query membership is acquisition policy only. It may determine which messages are observed but is
not canonical recipient evidence, source attribution, addressing, priority, or significance.
Production may acquire both scopes in one observation operation, de-duplicate message IDs before
detail retrieval, fetch each detail once, and project one canonical communication per stable
source-qualified identity. Overlap shall not duplicate recipients or create divergent observations.
The query and bounded limits prohibit mailbox-wide or historical-completeness claims.

## 16. Error and Authorisation Semantics

| Condition | Recipient evidence consequence | DAWNWATCH consequence |
| --- | --- | --- |
| `messages.list` 401 | Source authentication/refresh unavailable; preserve the cause. | `unavailable` for the required Gmail scope. |
| `messages.list` 403 | `not_authorised` at the affected source scope; do not silently treat it as an empty result. | `unavailable` if the required scope cannot be observed; otherwise mixed/partial scope is `insufficient_coverage`. |
| `messages.get` 401 | Preserve per-message `not_authorised`/refresh cause and source impact. | `unavailable` if source observation cannot continue reliably; otherwise explicit partial `insufficient_coverage`. |
| `messages.get` 403 | `not_authorised` only when the status/cause is retained per message. Current skipped handling is not sufficient. | `insufficient_coverage`, or `unavailable` if systemic. |
| Other get failure or skipped detail | `not_fetched` when the failed acquisition is positively recorded; otherwise `unknown`. | `insufficient_coverage`, or `unavailable` when the source reports systemic failure. |
| Malformed/ambiguous header | `unknown`; valid elements may publish but cannot establish sufficient coverage. | `insufficient_coverage`. |
| Partial message set, query failure, or bounded candidate set | Preserve source-qualified partial coverage; never infer absence. | `insufficient_coverage` for a claim requiring the missing scope/set. |
| Local/mock or last-good substitution | Identify as fallback, never current Gmail recipient evidence. | Gmail remains `unavailable`; fallback cannot produce `available`. |

No new Gmail scope is required or authorised by this contract. Sprint 3.70 may improve error
discrimination and evidence carriage without treating scope expansion as implicit permission.

## 17. Governed Classification Matrix

Every row in Sprint 3.68's matrix receives exactly one outcome below. Reasoning is independent;
the audit proposal is reproduced only for traceability.

| Item | Audit proposal | Final outcome | Final class | Authoritative owner | Final reasoning | Sprint 3.70 consequence |
| --- | --- | --- | --- | --- | --- | --- |
| Raw `To` header | Accepted / Connector Observation | **Accepted** | Connector Observation | Gmail protocol observation | A returned named header is intrinsic, source-asserted, stable within the observation, and useful beyond DAWNWATCH. | Preserve every returned occurrence with source identity. |
| Raw `Cc` header | Accepted / Connector Observation | **Accepted** | Connector Observation | Gmail protocol observation | The role name and value are directly observed and require no interpretation. | Preserve every returned occurrence. |
| Raw `Bcc` header | Accepted / Connector Observation | **Accepted** | Connector Observation | Gmail protocol observation | A visible returned value is authoritative for that value only, never for completeness. | Preserve returned occurrences and the absence warning. |
| Normalized recipient value | Modified / Connector Normalization | **Modified** | Connector Normalization | Gmail projection normalization | Canonical recipients need stable elements, but naive comma splitting corrupts valid syntax. | Implement standards-aware parsing and malformed-state rules. |
| Flattened canonical recipients | Accepted / Canonical OperationalCommunication | **Accepted** | Canonical OperationalCommunication | `OperationalCommunication` | Asserted recipients are expressly owned and flattening is the smallest schema-conformant publication; governed parser/order constraints apply. | Route conformant values to the existing field; add no roles. |
| Recipient role distinction | Deferred / Connector Observation | **Deferred** | None authorised | Connector owns raw role only; no canonical owner | Raw role is evidence, but no independent case justifies expanding canonical responsibility. | Retain internally only; do not add canonical roles. |
| Recipient ordering | Modified / Connector Normalization | **Modified** | Connector Normalization | Gmail projection normalization | Replay requires an explicit order; role-bucket flattening is deterministic but not sender priority. | Use occurrence/element order within `To`, then `Cc`, then `Bcc`. |
| Duplicate handling | Deferred / Connector Normalization | **Modified** | Connector Normalization | Gmail projection normalization | Evidence is sufficient to govern the minimal non-destructive rule: preserve every occurrence; equality-based removal would infer sameness. | Retain duplicates; implement no deduplication. |
| Alias identity resolution | Rejected / None authorised | **Rejected** | None authorised | None | A literal alias does not assert person or primary-mailbox identity. | Publish literal only; perform no resolution. |
| Group expansion | Rejected / None authorised | **Rejected** | None authorised | None | Headers do not establish authoritative membership. | Preserve literal construct/address; do not expand. |
| Delegated-mailbox interpretation | Rejected / None authorised | **Rejected** | None authorised | None | Addressing or delivery does not prove delegation or acting authority. | Do not infer delegation or ownership. |
| Routed-mailbox interpretation | Rejected / None authorised | **Rejected** | None authorised | None | Acquisition query membership is not a communication assertion. | Never turn query/source labels into recipients. |
| Hidden-recipient inference | Rejected / None authorised | **Rejected** | None authorised | None | Reconstruction would manufacture an unobserved identity. | Observe visible Bcc only; make no hidden claim. |
| Recipient observation provenance | Modified / Evidence / Provenance | **Modified** | Evidence / Provenance | Existing communication provenance architecture | Communication-level provenance is sufficient, but retrieval and projection times must be truthful and distinct. | Capture retrieval time and retain canonical evidence identity; add no field-level system. |
| Recipient coverage state | Accepted / Deterministically Derived Consumer State | **Accepted** | Deterministically Derived Consumer State | DAWNWATCH evidence boundary | Coverage describes evidentiary support, not the message, and is deterministic from explicit evidence. | Carry an explicit state; never infer it from array length. |
| Historical recipient coverage | Deferred / Deterministically Derived Consumer State | **Modified** | Deterministically Derived Consumer State | Evidence/consumer coverage policy | The evidence supports a binding conservative rule: old records remain unknown; only authoritative re-observation can upgrade an individual record. | Persist versioned evidence for new observations; do not backfill by assumption. |
| `none` | Deferred / Deterministically Derived Consumer State | **Deferred** | None authorised | None established for Gmail absence | Current provider/header evidence cannot prove affirmative recipient absence. | Reserve the term; do not emit it. |
| `not fetched` | Accepted / Evidence / Provenance | **Accepted** | Evidence / Provenance | Acquisition evidence boundary | A positively recorded omission/fetch failure is a stable fact distinct from message absence. | Emit only from recorded acquisition/carriage facts. |
| `not authorised` | Modified / Evidence / Provenance | **Modified** | Evidence / Provenance | Connector authorization evidence | It is truthful only when an authorization cause and its granularity survive error handling. | Preserve list/get auth causes; do not guess from generic failure. |
| `unknown` | Accepted / Deterministically Derived Consumer State | **Accepted** | Deterministically Derived Consumer State | Evidence-honesty policy | Ambiguity must remain explicit and deterministically follows when no narrower state is proven. | Use as the absence default and permit evidence-led re-observation transition. |
| DAWNWATCH sufficiency | Modified / Deterministically Derived Consumer State | **Modified** | Deterministically Derived Consumer State | Governed DAWNWATCH presentation boundary | Nonempty arrays lack source quality; the bounded observed-value claim requires identity, provenance, retrieval time, parsing integrity, and source availability. | Implement the normative rule in Section 12 only. |

Final totals are **7 Accepted, 7 Modified, 2 Deferred, and 5 Rejected** across 21 rows.

Departures from Sprint 3.68 are explicit: duplicate handling changes from Deferred to Modified
because non-destructive occurrence retention is now governed; historical coverage changes from
Deferred to Modified because a conservative re-observation rule is governable without claiming
completeness. All other row outcomes match the audit proposal. The audit's printed totals
(`8/5/4/4`) do not arithmetically match its 21 displayed rows; this contract counts the rows rather
than perpetuating that clerical inconsistency.

## 18. Deferred Register

Deferred decisions confer no implementation permission:

1. **Canonical recipient roles.** Reconsider only with independently evidenced consumers, an
   `OperationalCommunication` responsibility/schema review, stable role semantics, migration,
   identity, ordering, and provenance rules.
2. **`none`.** Reconsider only with authoritative Gmail/protocol evidence that distinguishes an
   affirmative no-recipient assertion from omission, redaction, unsupported behavior, empty data,
   parsing failure, and hidden delivery.

Unresolved implementation evidence also includes representative Gmail response fixtures/live
evidence for Bcc and unusual syntax, a selected conformant parser, per-message get-error
discrimination, retrieval-time capture, a real snapshot/evidence identity, and explicit dual-query
scope integration. These are constraints and validation needs, not additional Deferred matrix
capabilities.

## 19. Rejected Register

Alias-to-identity resolution, group membership expansion, delegated-mailbox interpretation,
routed-mailbox interpretation, and hidden-recipient inference are rejected. They may not be
implemented under new names, through query membership, labels, delivery facts, consumer
derivations, or compatibility fields. Any future authoritative identity or membership source would
require fresh governance and would not retroactively make the message header assert those facts.

## 20. OperationalCommunication Boundary Preservation

This contract does not reopen unread state, importance, `needsReply`, Gmail/provider/mailbox/source
labels, categories, workflow significance, attention, urgency, tasks, commitments, interpretation,
or executive salience. None may qualify recipient sufficiency, select canonical recipients, infer
identity, establish source scope completeness, or reappear through renamed consumer state.
Recipient array order has no priority or attention meaning.

## 21. Implementation Constraints

> **This contract establishes governance authority only. It does not modify production routing,
> connector behaviour, normalization, canonical projection, OperationalState, DAWNWATCH, or runtime
> evidence sufficiency.**

A future Sprint 3.70 may implement only Accepted and Modified matrix decisions, the Section 5
routing decision, the binding absence and sufficiency vocabularies, and the provenance/error rules.
It shall not implement Deferred or Rejected capabilities. It shall:

* integrate the existing canonical path rather than extend `EmailMessage`;
* ensure a single acquisition can serve consumers without duplicate detail fetches or normalization;
* make both production candidate scopes explicit, de-duplicate by source-qualified message
  identity, and keep query facts noncanonical;
* replace naive comma splitting with conformant parsing and add the necessary fixtures;
* carry explicit coverage, retrieval time, canonical assertion references, source state, and real
  evidence/snapshot identity through a narrow DAWNWATCH projection;
* keep local/mock and last-good data visibly non-authoritative;
* request no new OAuth scope on this authority; and
* preserve all settled model and consumer boundaries.

## 22. Validation Results

Validation completed against this documentation-only change:

| Command | Result |
| --- | --- |
| `npm test` | PASS — 110 test files passed; 533 tests passed and 1 skipped (534 total). |
| `npm exec vitest run -- lib/content-retrieval/gmail.test.ts lib/executive-operating-system/situational-awareness/projection/adapters/gmail/gmail-adapter.test.ts lib/executive-operating-system/situational-awareness/projection/adapters/operational-communication/operational-communication-adapter.test.ts lib/executive-operating-system/situational-awareness/lifecycle/gmail-integration.test.ts lib/dawnwatch-presentation.test.ts lib/dawnwatch-presentation-selection.test.ts lib/dawnwatch-presentation-adapter.test.ts` | PASS — 7 test files passed; 47 tests passed and 1 skipped (48 total). |
| `npm run lint` | PASS — no ESLint warnings or errors. |
| `npm run typecheck` | PASS. |
| `git diff --check` | PASS. |

Validation confirms repository integrity, not production recipient evidence. No live Gmail probe
was run because credentials and stable external mailbox fixtures are not repository-established;
such a probe could not substitute for governed tests.

Repository change inspection must show this document as the sole sprint modification: no connector,
`EmailMessage`, Gmail scope, normalizer, adapter, `OperationalCommunication`, `OperationalState`,
DAWNWATCH, selector, production path, default, or promotion change.

## 23. Constitutional Conclusion

The governed contract chooses canonical integration over legacy duplication, authorises a minimal
faithful standards-aware recipient representation, preserves occurrence evidence rather than
inventing equality, makes absence and insufficiency explicit, reuses communication-level
provenance while requiring truthful retrieval time, and refuses identity, routing, delegation, and
hidden-recipient inference.

Its `available` claim is deliberately bounded to at least one asserted recipient value observed for
a source-qualified communication. It is never a claim of complete recipient knowledge. Historical
and local data remain insufficient until authoritative re-observation supplies evidence. The two
Deferred decisions and five Rejected decisions remain outside Sprint 3.70.

The governance decisions are sufficient to specify **Sprint 3.70 — Gmail Recipient Production
Integration** as an integration/wiring sprint. No implementation or DAWNWATCH promotion is
authorised here.
