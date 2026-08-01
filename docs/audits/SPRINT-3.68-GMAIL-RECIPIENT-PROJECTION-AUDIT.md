# Sprint 3.68 — Gmail Recipient Projection Audit

**Status:** Audit complete; governance proposal only  
**Audit date:** 2026-08-01  
**Repository snapshot:** `/workspace/jarvis`, branch `work`, commit
`ed3ad55eb38818731fd45746a6ed8fd585622c46`

> **Evidence convention.** “Observed” means current source, “tested” means an executable repository
> test, “governed” means an accepted governing artefact, “inferred” means a conclusion from two or
> more repository facts, and “unknown” means that this checkout cannot support a safe conclusion.

## 1. Executive Summary

All required precondition files are present. The audit finds **multiple boundaries**, but not the
acquisition gap described in the Roadmap. The Google connector already requests `To`, `Cc`, and
`Bcc` through `messages.get(format=metadata)`, and its raw detail represents arbitrary named
headers. More importantly, a separate, tested Gmail projection adapter already extracts all three,
splits and flattens them, and publishes the resulting values as canonical
`OperationalCommunication.recipients`.

The live DAWNWATCH path does not consume that adapter. `OperationalState` consumes the legacy
`GmailConnector.listRecent()` path; `normalizeGmailMessage` reads only `Subject`, `From`, and
`Date`; `EmailMessage` has no recipients; and `buildProductionDawnwatchInput` deliberately supplies
`recipients: []`. Thus the production gap is primarily **runtime-path/normalization and bridge
projection**, with additional **coverage, provenance, and governance** gaps. It is not established
that a new Gmail fetch or scope is required.

The existing canonical responsibility naturally owns faithfully observed recipient values.
However, the already-implemented Gmail adapter embodies ungoverned or incompletely governed choices:
comma splitting, role flattening, role-bucket ordering, duplicate handling, empty/absent collapse,
and an “available” artifact even when recipient coverage is unknown. Sprint 3.69 must govern those
semantics before any production change. This audit neither ratifies the existing adapter choices nor
authorises implementation.

## 2. Authoritative Repository State

| Item | Evidence |
|---|---|
| Repository | Local checkout at `/workspace/jarvis` |
| Branch | `work` |
| Commit | `ed3ad55eb38818731fd45746a6ed8fd585622c46` (`docs: add JARVIS roadmap — BOA/GE-informed phase plan`) |
| Initial working tree | Clean (`git status --short` emitted no entries) |
| Required preconditions | All eleven files named by Sprint 3.68 exist |
| Reachability | `HEAD` follows local history containing merge commit `f338e0e` (PR #134); no local upstream tracking branch is configured |
| Remote limitation | `git remote -v` emitted no remotes, so hosting-service freshness, remote reachability, and divergence cannot be verified |

The checked-out snapshot, not unverified hosting state, is the evidence boundary for this audit.

## 3. Governing Artefacts Reviewed

The following were read before interpreting source:

* the complete Engineering Constitution, North Star, JESS, and Roadmap;
* Constitutional Publication Principles;
* ADR-0006 (Projection Before Interpretation), ADR-0023 (Evidence-Driven Canonical Evolution),
  and ADR-0025 (Engineering Workflow);
* the complete `OperationalCommunication` responsibility statement;
* Sprint 3.63 and its audit counterpart, Sprint 3.64, Sprint 3.65, Sprint 3.67, and the Sprint
  3.67.1 production-evidence correction (there is no Sprint 3.66 document in this snapshot);
* the Sprint 3.42 email generality record, Sprint 3.43 communication audit, and Sprint 3.46 Gmail
  adapter specification where needed to interpret the existing projection.

The controlling conclusions are: projection records authoritative observations without
interpretation; canonical expansion is evidence-led; evidence storage is separate from canonical
state; and `OperationalCommunication` already owns asserted recipients while excluding labels,
read state, importance, workflow, and interpretation.

## 4. Current Gmail Acquisition Path

### 4.1 Legacy operational path

1. `GoogleGmailConnector.listRecent(limit = 5)` obtains the current access token.
2. `messages.list` runs two queries: the main inbox query
   `in:inbox -category:promotions -category:social -in:spam -in:trash`, and the routed Governance
   Engineering query `to:info@governanceengineering.com.au -in:spam -in:trash`.
3. IDs are de-duplicated, Governance Engineering attribution wins on overlap, and at most
   `limit * 2` IDs are fetched.
4. Each `messages.get` uses `format=metadata` and requests, in order, `Message-ID`, `From`, `To`,
   `Cc`, `Bcc`, `Date`, `In-Reply-To`, `References`, and `Subject`.
5. `normalizeGmailMessage` reads only `Subject`, `From`, and `Date`; all recipient and reply header
   observations cease to be represented at this normalization boundary.
6. Priority heuristics sort the resulting `EmailMessage[]`, then the list is trimmed to `limit`.
7. `buildOperationalState` places those messages in `OperationalState.gmailThreads`; the production
   DAWNWATCH bridge maps every one to `recipients: []`.

The Governance Engineering query is candidate-set and source-label evidence only. It does not prove
that the observed message metadata asserts that address as a recipient.

### 4.2 Canonical projection path

`GoogleGmailConnector.listOperationalObservations(limit = 50)` is a second public method not present
in the legacy `GmailConnector` interface. It runs only the main-inbox query, fetches the same
metadata detail, shallow-freezes each detail, and returns the observations. The
`GmailProjectionAdapter` consumes this path, normalizes `To`, `Cc`, and `Bcc`, and publishes canonical
communications. Tests and a live-probe test exist, but repository search found runtime construction
only in tests/live probe—not in `buildOperationalState` or the production DAWNWATCH call chain.

Consequently, the canonical adapter already preserves recipient values in isolation, but that
capability is not the production bridge DAWNWATCH receives.

### 4.3 Authority and errors

OAuth requests `gmail.readonly` together with Calendar read-only and Drive metadata read-only.
There is no recipient-specific or proposed new scope. A `messages.list` 401 throws
`refresh_failed`; a list 403 becomes `insufficientScope`, and if both legacy queries are forbidden
the connector throws `not_connected`. Other list failures return an empty candidate set. A
`messages.get` 401 throws, but every other non-success—including 403—is logged and skipped as
`null`. `OperationalState` catches Google failures and substitutes local mock messages while
reporting Gmail `unavailable` or `refresh_required`.

Source proves that the configured authority is `gmail.readonly` and that metadata is requested
through that path. It does **not** prove, without a live response fixture/probe result, that every
requested recipient header is returned for every message. It also cannot distinguish a skipped
detail caused by authorization from other `messages.get` failures.

## 5. Current Recipient Evidence Inventory

| Evidence/capability | Requested | Raw detail / headers | Parsed | Legacy `EmailMessage` | Canonical adapter | Production DAWNWATCH |
|---|---:|---:|---:|---:|---:|---:|
| `To` | Yes | Name/value header | Canonical path only | No | Yes, flattened | No |
| `Cc` | Yes | Name/value header | Canonical path only | No | Yes, flattened | No |
| `Bcc` | Yes | Name/value header | Canonical path only | No | Yes, flattened if returned | No |
| Recipient role | Source header name distinguishes it | Yes | Used as a collection bucket | No | Discarded | No |
| Multiple header occurrences | Representation permits them | Yes | All recipient occurrences accepted | No | Flattened | No |
| Header value/order | Raw header array retains returned order | Yes | Comma-split and trimmed | No | Transformed | No |
| Recipient observation time | No `retrievedAt` assignment | Optional type only | No | `receivedAt` is message time, not retrieval time | Adapter-level `projectedAt` only | `state.updatedAt` synthetic source observation |
| Local/mock recipient | Not applicable | Seed record has no field | No | No | Local source cannot use Gmail adapter | Empty |

No Google connector normalization test uses a mocked fetch response to assert request parameters or
returned `Bcc`; request behavior is observed in source. Gmail adapter fixtures test `To` and `Cc`,
but not `Bcc`, empty headers, malformed address lists, duplicate recipients, or display names
containing commas.

## 6. Source / Normalization / Projection Trace

| Layer | Current evidence and transition | Recipient disposition |
|---|---|---|
| Gmail query | Main inbox candidates; legacy additionally includes `to:info@...` candidates | **Not applicable** as addressing proof |
| `messages.list` | Returns IDs only; limit applied per query | **Unavailable** |
| `messages.get` | Metadata format; all nine named headers requested | **Preserved if returned** |
| Raw detail type | `payload.headers?: readonly {name,value}[]` | **Preserved**, role identifiable by name |
| Legacy header helper | Case-insensitive `find`, used only for Subject/From/Date | Recipient evidence **discarded/not read** |
| `normalizeGmailMessage` | Produces legacy display/heuristic shape | **Discarded** |
| `EmailMessage` / connector interface | No recipient or recipient-coverage field | **Unavailable to consumers** |
| Local normalization | Synthesizes fields from title/from/detail/waiting duration | Recipient evidence **unavailable** |
| Canonical Gmail normalizer | Collects every To, then Cc, then Bcc; comma-splits, trims, drops empty tokens | **Transformed and flattened** |
| Gmail projection adapter | Publishes flattened values to canonical `recipients` | **Preserved after transformation** |
| Projection provenance | Source, adapter, projected time, availability; connector facts serialized in metadata | Communication-level evidence **preserved**, no recipient field-level assertion |
| `OperationalState` | Carries only `EmailMessage[]`; rebuilt on each request | Recipient evidence **unavailable** |
| DAWNWATCH production bridge | Explicit `recipients: []`; Gmail source tied to `state.updatedAt` and synthetic snapshot ID | Recipient evidence **discarded upstream / represented as insufficient** |
| Governed DAWNWATCH | Requires sender, nonempty recipient array, parseable sent time per item | Current communications become **`insufficient_coverage`** |

There is therefore no presentation-layer loss after `DawnwatchPresentationInput`: its recipient
array is retained. The empty array enters at the production bridge because the bridge's actual
input type cannot supply an authoritative value.

## 7. OperationalCommunication Responsibility Analysis

Observed recipient header values satisfy the existing responsibility's basic admission test: they
are protocol assertions about the communication; remain useful outside DAWNWATCH; and
`OperationalCommunication` expressly owns asserted recipients and observed array order. Faithful
publication therefore appears to fulfil an existing responsibility rather than create a new one.

That authority does not automatically govern the existing Gmail normalizer's representation.
Splitting an RFC-style mailbox list on every comma can alter quoted display names; grouping all
`To` before all `Cc` before all `Bcc` creates an ordering rule; flattening removes roles; filtering
empty tokens collapses malformed/empty/absent states; and no duplicate policy is explicit. These
are contract decisions, not mere proof that recipients are owned.

The constitutional test yields:

1. Raw named headers are authoritative protocol observations when actually returned.
2. Address values describe the communication, not connector organization.
3. Faithful values have general consumers beyond DAWNWATCH.
4. Asserted recipients are already owned.
5. Alias resolution, group expansion, mailbox ownership, delegation, routing, and hidden-recipient
   reconstruction require evidence or inference beyond the header.
6. Communication-level source identity/provenance exists; field-level provenance does not.
7. Current absence has no stable meaning.
8. Faithful values do not broaden responsibility; role semantics and identity interpretation may.
9. DAWNWATCH coverage status is consumer state, not a canonical communication fact.
10. Sprint 3.69 governance is required before changing production behavior.

Legacy Gmail heuristics are orthogonal. Recipient acquisition is coupled to source-label attribution
and priority sorting in `listRecent`, but unread, important, needs-reply, labels, query membership,
and source-label significance remain constitutionally excluded.

## 8. `To` / `Cc` / `Bcc` Analysis

* **Distinguishability:** all three are independently requested and identifiable case-insensitively
  by header name in the raw array. Separating them does not require a new fetch or scope in the
  current code, but exposing roles through `EmailMessage` or canonical state would require a
  contract/type change.
* **Occurrences:** raw representation and `headers()` permit multiple occurrences of each recipient
  header. Unlike identity and relationship headers, recipient duplicates are not rejected.
* **Ordering:** each header's returned order and token order survive locally, but normalization
  concatenates role buckets in fixed `To` → `Cc` → `Bcc` order. It does not preserve arbitrary
  interleaving in `payload.headers`. Whether protocol semantics require global header ordering is
  unknown.
* **Parsing:** canonical normalization performs only `split(",")`, trim, and empty-token removal.
  It does not implement mailbox syntax, validate addresses, decode names, or protect quoted commas.
* **Flattening:** the current canonical array requires flattening because it has no role property.
  Faithful flattened asserted values are within existing ownership, but the precise boundary and
  ordering must be governed.
* **Roles:** `OperationalCommunication` owns recipients but does not name To/Cc/Bcc roles. Adding
  roles canonically would broaden its current schema/semantics and requires separate governance.
* **Bcc limitation:** if Gmail returns a visible `Bcc`, it can be independently read. An absent
  `Bcc` cannot establish that no hidden/routed recipient existed.

## 9. Alias / Group / Delegated / Routed / Hidden Recipient Analysis

| Case | Protocol can assert | JARVIS currently knows | Boundary |
|---|---|---|---|
| Alias | The literal mailbox value in a returned header | Only that asserted value | Do not map alias to a person/mailbox owner without governed authoritative identity evidence |
| Group/distribution list | The literal group address, if present | The group address, not membership | Do not expand membership |
| Delegated mailbox | A literal header value may name a mailbox | No delegation/acting-user relation | Interpretation deferred |
| Routed mailbox | Query membership shows Gmail selected the message | Query/routing fact is not message addressing | Do not turn `to:info@...` query match or delivery into a recipient assertion |
| Visible Bcc | Literal returned Bcc value | That value only | May be observed; role handling needs governance |
| Hidden recipient | Delivery/routing may suggest one exists | No authoritative identity from current metadata | Inference rejected |

Aliases and group addresses can be sufficient *literal observed recipient values* without being
sufficient evidence about the people behind them. This distinction is essential: value coverage
must not become identity-resolution coverage.

## 10. Recipient Evidence-Sufficiency Analysis

The current DAWNWATCH predicate—sender truthy, `recipients.length > 0`, parseable sent time—is
necessary but not sufficient to establish authoritative recipient coverage. It cannot distinguish
an observed, valid value from a mock, malformed comma fragment, inferred address, partial header
return, or historical shape lacking observation metadata.

**Proposed non-authoritative rule:** a communication is recipient-evidence-sufficient only when
(a) at least one non-empty recipient value is faithfully derived from a recipient header actually
returned in that authoritative message observation; (b) the observation shares source-qualified
message identity and available source observation provenance; (c) the connector did not substitute
local/mock data or report source unavailability; and (d) parsing did not encounter an unresolved
malformed or ambiguous value. Completeness across hidden recipients must not be claimed. The claim
should be “at least one asserted recipient was observed,” not “all actual recipients are known.”

| Scenario | Proposed result | Reason |
|---|---|---|
| One observed `To` | Sufficient for the bounded “one asserted recipient observed” claim | Direct value plus evidence |
| Multiple observed recipients | Sufficient, subject to governed parser/order policy | Direct values |
| `Cc` only | Potentially sufficient | Canonical responsibility says recipients, not only To |
| Visible `Bcc` only | Potentially sufficient | Direct assertion; no completeness claim |
| No recipient header returned | Insufficient/unknown | Absence is ambiguous |
| Header present but empty | Insufficient | No recipient value; malformed versus none unresolved |
| Malformed value | Insufficient | Array length must not bless a fragment |
| Group address | Sufficient only for literal group address | No member claim |
| Alias address | Sufficient only for literal alias | No identity claim |
| Connector unavailable | Unavailable | No authoritative observation |
| Source available, recipient observation unavailable | Insufficient coverage | Communication may exist; recipient evidence does not |
| Pre-support/stale record | Insufficient unless re-observed with evidence | Shape age is not evidence |
| Local seeded/mock email | Insufficient | Seed schema has no authoritative recipient observation |

## 11. Recipient Provenance Analysis

The existing architecture naturally supports **communication-observation-level provenance**:
canonical source-qualified ID (`google-gmail:<Message-ID>`), provider/source kind, adapter identity,
adapter `projectedAt`, and source availability. Executive snapshot assembly can additionally carry
snapshot identity and artifact provenance. DAWNWATCH uses its own item `sourceId`/`assertionId` and
source `observedAt`/`snapshotId` evidence vocabulary.

Recipient values can share the authoritative communication observation's provenance if the future
contract guarantees they came from that same returned header set. Repository evidence does not
demonstrate a need for field-level provenance machinery, and this audit does not propose one.

There are current weaknesses:

* `GoogleGmailMessageDetail` has no `retrievedAt`; the optional observation property is never set.
* `projectedAt` is caller-injected and proves adapter projection time, not Gmail retrieval time.
* Connector provenance is serialized into `ProjectionArtifact.metadata`; it includes Gmail ID,
  optional thread/internal date/retrieval time, and heuristic facts, but no per-recipient assertion.
* Production DAWNWATCH uses legacy IDs as assertion IDs, `state.updatedAt` as observation time, and
  a deterministic synthetic snapshot string. Those are bridge evidence, not canonical Gmail
  observation/snapshot identity.

Sprint 3.69 should first reuse communication-level provenance and define truthful observation-time
semantics. It should not invent field-level evidence storage merely to improve DAWNWATCH.

## 12. Historical Coverage Analysis

No durable Google communication or canonical `ExecutiveStateSnapshot` store is wired into the
production path found by repository search. `buildOperationalState()` calls connectors fresh on
each request and explicitly has no cache. Local `memory.gmailThreads` is durable JSON-backed mock
content, but it is not an authoritative Gmail history and has no recipient values.

Therefore there are no persisted old Google `EmailMessage` shapes to migrate in this production
path. Future observations could gain recipients when re-fetched, but retroactive completeness is
not guaranteed: legacy `listRecent` returns only five after prioritized selection; the canonical
method defaults to 50; both depend on current main-inbox query membership; the Governance
Engineering query is absent from the canonical method; details can be skipped; and Gmail retention
or message/query changes are outside repository evidence.

Any genuinely stale, imported, mock, or future persisted record lacking recipient-observation
evidence must remain `insufficient_coverage`. New support cannot silently prove historical
completeness.

## 13. Absence Semantics — `none` / `not fetched` / `not authorised` / `unknown`

| State | Can current JARVIS establish it? | Current manifestation |
|---|---|---|
| `none` | **No**, for recipients generally | Empty/absent headers are flattened to `[]`, but there is no assertion that authoritative source declared no recipient |
| `not fetched` | Partially at architecture level, not per message | Legacy `EmailMessage` did not read already-requested values; local/mock never requests them; no runtime field records this state |
| `not authorised` | Only for list-level Gmail capability in some cases | Both list queries returning 403 lead to `not_connected`; a get-level 403 is only skipped and becomes indistinguishable |
| `unknown` | Yes, as the only safe interpretation of most absence | Missing/empty returned header, non-401 get failure, local fallback, and `recipients: []` do not carry a discriminant |

An empty JavaScript array currently means either canonical normalization found no non-empty tokens
or the DAWNWATCH bridge had no field at all. It must not be renamed `none`.

## 14. Two-Axis Classification Matrix

All outcomes below are **proposed**, not authoritative.

| Recipient field/capability | Current evidence | Proposed governance outcome | Proposed architectural class | Existing authority | Reasoning | Evidence gap / next governance question |
|---|---|---|---|---|---|---|
| Raw `To` header | Requested; named raw header | Accepted | Connector Observation | Protocol observation | Intrinsic asserted addressing | Define presence/empty semantics |
| Raw `Cc` header | Requested; named raw header | Accepted | Connector Observation | Protocol observation | Independently distinguishable | Define presence/empty semantics |
| Raw `Bcc` header | Requested; named raw header | Accepted | Connector Observation | Protocol observation | Faithful only if returned | State incompleteness explicitly |
| Normalized recipient value | Existing comma-split values | Modified | Connector Normalization | Partial | Values owned; parser is not robustly governed | Parser/validation contract |
| Flattened canonical recipients | Already projected in isolated adapter | Accepted | Canonical OperationalCommunication | Explicit responsibility | Smallest existing destination | Govern flatten/order/duplicates first |
| Recipient role distinction | Raw names retained, canonical role lost | Deferred | Connector Observation | No canonical role authority | Observation exists; canonical meaning undecided | Preserve only in connector or amend canonical schema? |
| Recipient ordering | Header/token order partly retained; bucket order imposed | Modified | Connector Normalization | Canonical arrays retain observed order | Current output is transformed order | Define which order is “observed” |
| Duplicate handling | Duplicates retained silently | Deferred | Connector Normalization | None explicit | Deduplication could alter assertion | Retain or deduplicate, and by what equality? |
| Alias identity resolution | Literal alias only | Rejected | None authorised | None | Requires identity inference | Could later authoritative identity source justify it? |
| Group expansion | Literal group only | Rejected | None authorised | None | Membership not observed | Separate future identity governance only |
| Delegated-mailbox interpretation | No delegation evidence | Rejected | None authorised | None | Delivery/address does not prove delegation | None for recipient implementation |
| Routed-mailbox interpretation | GE query/source label only | Rejected | None authorised | None | Query membership is not header assertion | Keep attribution noncanonical |
| Hidden-recipient inference | Delivery can suggest, not identify | Rejected | None authorised | Explicit non-inference principles | Would manufacture evidence | None; visible Bcc remains separate |
| Recipient observation provenance | Shares artifact/communication provenance | Modified | Evidence / Provenance | Existing provenance architecture | Field-level system not justified | Define retrieval versus projection time |
| Recipient coverage state | No runtime discriminant | Accepted | Deterministically Derived Consumer State | DAWNWATCH evidence rules | Coverage is a claim about evidence, not message | Define truthful finite vocabulary |
| Historical recipient coverage | No durable Google history; bounded re-fetch | Deferred | Deterministically Derived Consumer State | None explicit | Completeness cannot be established | Contract stale/imported/future persisted records |
| `none` | Cannot currently establish | Deferred | Deterministically Derived Consumer State | None | Empty is ambiguous | What source evidence could assert none? |
| `not fetched` | Legacy/local path fact, not represented | Accepted | Evidence / Provenance | Evidence-honesty principles | Must not collapse into none | At what boundary is it recorded? |
| `not authorised` | Partial list-level signal only | Modified | Evidence / Provenance | Existing auth errors | Get failures collapse causes | Define granularity without new scope |
| `unknown` | Safe current absence meaning | Accepted | Deterministically Derived Consumer State | Evidence-honesty principles | Preserves ambiguity | Define transition after re-observation |
| DAWNWATCH sufficiency | Currently array length plus other fields | Modified | Deterministically Derived Consumer State | Governed presentation boundary | Array length lacks observation quality | Adopt bounded observed-recipient claim |

**Classification counts:** Accepted **8**, Modified **5**, Deferred **4**, Rejected **4**.
The consequential rows are flattened canonical recipients (naturally owned but not implementation
authority), normalized values/order (existing adapter choices need governance), and all inferred
identity/routing rows (rejected).

## 15. Gap and Boundary Register

| Gap | Classification | Consequence |
|---|---|---|
| Legacy normalization ignores requested recipient headers | Normalization | `EmailMessage` cannot expose acquired evidence |
| Canonical Gmail adapter is isolated from production DAWNWATCH path | Runtime projection/integration | Existing isolated capability does not close live gap |
| Local/mock schema has no recipient assertion | Acquisition/evidence | Local fallback cannot provide governed coverage |
| Role flattening and naive comma parsing | Governance/normalization | Existing adapter output may not be faithful for all syntax |
| No recipient coverage discriminant | Coverage | Empty/absent/failure collapse |
| Get-level errors are skipped | Acquisition/provenance | Authorization versus transient/provider failure unknown |
| Retrieval time absent | Provenance | Projection/assembly time substitutes for observation time |
| Bounded, query-dependent, non-persistent observations | Historical coverage | Retroactive completeness cannot be claimed |
| Roadmap says a new live fetch is required | Documentation drift | Source shows headers already requested and canonical adapter already parses them |

The Roadmap's sequence remains useful, but Sprint 3.69 should govern integration of an existing
observation/projection capability rather than assume recipient headers are not fetched.

## 16. Non-Authoritative Sprint 3.69 Governance Proposal

> **NON-AUTHORITATIVE — GOVERNANCE REVIEW REQUIRED**

Sprint 3.69 should decide, without presuming implementation:

1. the exact canonical unit: literal asserted header value, parsed mailbox value, or another
   faithful representation compatible with existing `recipients: string[]`;
2. whether flattening `To`/`Cc`/`Bcc` is required and whether roles remain connector-only or require
   a separately justified canonical amendment;
3. a standards-aware parsing/validation rule, malformed-input failure semantics, display-name
   treatment, order, multiple occurrences, and duplicate policy;
4. visible Bcc semantics and an explicit prohibition on completeness/hidden-recipient inference;
5. literal-only handling of aliases and groups, and rejection/deferment of identity resolution,
   membership expansion, delegation, routing, and mailbox ownership;
6. an absence/evidence vocabulary distinguishing observed value, unknown, not fetched, unavailable,
   and authorization failure, including which states can actually be emitted;
7. DAWNWATCH's bounded evidence claim and why nonempty array length alone is insufficient;
8. reuse of communication-level provenance, truthful observation/retrieval time, assertion and
   snapshot identities, and whether existing bridge placeholders are adequate;
9. historical/stale/query-window limits and re-observation behavior;
10. Google error behavior and local/mock fallback behavior, without requesting new scope;
11. whether production should consume the existing canonical Gmail adapter, extend the legacy
    model, or use another governed bridge—while avoiding duplicate Gmail fetches and divergent
    normalization;
12. tests needed for Bcc, repeated headers, quoted commas, malformed/empty headers, duplicates,
    unavailable/unauthorized source, mock input, and stale coverage.

This proposal does not declare the current adapter governed, accepted for production, or ready for
implementation.

## 17. Validation Results

Validation was run against the documentation-only change:

| Command | Result |
|---|---|
| `npm test` | PASS — 110 files; 533 passed and 1 skipped (534 total) |
| Targeted Vitest command (Google Gmail adapter, canonical communication adapter, lifecycle Gmail integration, email normalization, DAWNWATCH presentation and selection) | PASS — 6 files; 43 passed and 1 skipped (44 total) |
| `npm run lint` | PASS — no ESLint warnings or errors |
| `npm run typecheck` | PASS |
| `git diff --check` | PASS |

No live Gmail probe was run because `GMAIL_LIVE_PROBE=1` requires credentials and external mailbox
state not established by this repository snapshot. This limits claims about actual provider return
behavior, not the audited request or source transformation.

## 18. Outstanding Evidence Gaps

* No captured live response or fetch-level fixture proves which recipient headers Gmail returns for
  representative incoming, sent, delegated, routed, or Bcc messages under this account.
* No test covers Bcc, repeated recipient headers, quoted display-name commas, malformed values,
  empty values, or duplicates.
* Repository evidence cannot distinguish absent header from provider omission or message semantics.
* Get-level 403 is not distinguished from other non-401 failures.
* The intended relationship between the already-built canonical Gmail adapter and the legacy
  production `OperationalState` bridge is not governed.
* The canonical method omits the Governance Engineering candidate query used by `listRecent`; the
  desired source scope is unresolved.
* No repository Sprint 3.66 artefact exists; later documents establish that evaluation occurred,
  but this audit cannot review a missing specification/report directly.
* Remote freshness and reachability cannot be verified because no remote/upstream is configured.

Change confirmation: no Google Gmail connector code, local/mock connector code, `EmailMessage`
type, Gmail scope, projection adapter, `OperationalCommunication`, `OperationalState`,
`ExecutiveStateSnapshot`, DAWNWATCH file, selector, default, or production behavior changed. No
DAWNWATCH promotion or operator verification occurred. The only deliverable is this audit.

## 19. Recommendation

**Audit Complete — Governance Review Required**

The evidence base is sufficient for Sprint 3.69 to decide binding representation, absence,
provenance, coverage, and integration semantics. It is not implementation authority and does not
mean DAWNWATCH is ready for promotion.
