# Sprint 3.99 — Governed Connector Availability Conversational Evidence Publication Contract

**Status:** Specification  
**Sprint Type:** Governance Decision / Publication Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.88 — Governed Conversational Production Evidence Audit  
**Direct Structural Precedents:** Sprints 3.96, 3.97, and 3.98

## 1. Recommendation

**Decision:** Approve this governed Connector Availability conversational evidence publication contract.

Connector Availability is a genuine narrow publication/wiring gap. Existing production status is mechanically mature, but it lacks governed observation time and explicit fallback publication.

The selected architecture is a deterministic bounded publication from the existing production connector-status result plus the loader result that establishes fallback truth. Observation time is captured once when each connector load resolves. The governed scope is exactly:

```text
calendar
gmail
drive
```

This contract does not reopen Gmail or Calendar acquisition governance, does not promote local compatibility data into governed source evidence, and authorizes no implementation.

## 2. Repository Precondition

| Item | Confirmed result |
| --- | --- |
| Repository | `/workspace/jarvis` |
| Branch | `work` |
| Starting commit | `eaaf0aea08ab30a8f2da18a11b51f285dc761e73` |
| Starting working tree | Clean |
| Sprint 3.96 | Present in history |
| Sprint 3.97 | Present in history |
| Sprint 3.98 | Present in history |
| Sprint 3.88 audit | Present |
| Constitutional Publication Principles | Present |
| `ConnectorStatus` | Current production type confirmed |
| `getConnectorStatuses()` | Current production function confirmed |
| `GovernedConnectorAvailabilityInput` | Exact current definition confirmed |
| Production governed publisher | None found |
| `/api/chat` | Unchanged |

The repository evidence agrees materially with this contract's premises.

## 3. Governing Artefacts Reviewed

The following artefacts were read completely:

1. `docs/ENGINEERING_CONSTITUTION.md`;
2. `docs/architecture/NORTH_STAR.md`;
3. `docs/architecture/JARVIS-Engineering-Specification-Standard.md`;
4. `docs/CONSTITUTIONAL-PUBLICATION-PRINCIPLES.md`;
5. `docs/architecture/ROADMAP.md`;
6. `docs/audits/SPRINT-3.88-GOVERNED-CONVERSATIONAL-PRODUCTION-EVIDENCE-AUDIT.md`;
7. `docs/SPRINT-3.96-GOVERNED-GMAIL-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md`;
8. `docs/SPRINT-3.97-GOVERNED-CALENDAR-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md`;
9. `docs/SPRINT-3.98-GOVERNED-MEMORY-PRIORITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md`;
10. `lib/connectors/types.ts`;
11. `lib/connectors/index.ts`;
12. `lib/operational-state.ts`;
13. `lib/connectors/calendar.ts`;
14. `lib/connectors/gmail.ts`;
15. `lib/connectors/drive.ts`; and
16. `lib/governed-conversation/projection-composer.ts`.

Repository-wide searches inspected `ConnectorStatus`, `getConnectorStatuses`, `connectorStatuses`, `calendarStatus`, `gmailStatus`, `driveStatus`, every `Local*Connector`, `GovernedConnectorAvailabilityInput`, and `connectorAvailability`.

The governing order is the Engineering Constitution, North Star, Engineering Specification Standard, Constitutional Publication Principles, Roadmap, Sprint 3.88, Sprints 3.96–3.98, current production source, the governed projection contract, and this contract.

## 4. Production Status Investigation

The actual production chain is:

```text
loadCalendar / loadGmail / loadDrive
    ↓
domain status: online | unavailable | refresh_required
    ↓
buildOperationalState()
    ↓
getConnectorStatuses(overrides)
    ↓
ConnectorStatus[]
```

Each loader returns live data with `online` after a successful live call. A local configuration returns local records with `unavailable`. A failed Google call returns local compatibility records with `unavailable` or `refresh_required`.

`buildOperationalState()` passes explicit `connected` overrides derived from `status === "online"`. It passes `source` overrides derived from stored Google-token presence. `getConnectorStatuses()` therefore does not infer production reachability from configured source alone.

The current source type is:

```ts
type ConnectorSource = "local" | "google";

interface ConnectorStatus {
  name: "calendar" | "gmail" | "drive";
  source: ConnectorSource;
  connected: boolean;
}
```

`ConnectorStatus` carries neither observation time nor fallback state. No production path constructs `GovernedConnectorAvailabilityInput`. Existing governed projection fixtures are not production publishers.

## 5. Maturity Finding

> Connector Availability is a genuine narrow publication/wiring gap. Existing production status is mechanically mature, but it lacks governed observation time and explicit fallback publication.

This is not a connector redesign. It is a bounded preservation and publication decision.

# Part I — Scope and Availability

## 6. Target Contract

The exact current target is:

```ts
interface GovernedConnectorAvailabilityInput {
  connectorId: string;
  sourceId: string;
  availability: "available" | "unavailable";
  observedAt: string;
  fallbackStatus: "none" | "unavailable";
}
```

The target has exactly five fields. It has no policy reference, cause code, content, publication ID, third availability state, or governed-fallback state.

## 7. Scope Decision

> Exactly Calendar, Gmail, and Drive are governed.

The closed connector scope is:

```text
calendar
gmail
drive
```

Memory, conversation history, model providers, web search, Slack, GitHub, future APIs, future databases, and future agents are excluded. Admission of another connector requires an explicit upstream type extension and separate governance review.

## 8. Availability Decision

The binding mapping is:

```text
connected === true  → availability = "available"
connected === false → availability = "unavailable"
```

`connected` is Boolean. No third Boolean state is collapsed. The mapping is lossless with respect to the source Boolean.

## 9. Refresh-Required Decision

> `refresh_required` maps to unavailable availability because the target represents availability, not remediation cause.

The exact path is:

```text
refresh_required
    ↓
connected = false
    ↓
availability = "unavailable"
```

The governed fact answers whether the live connector can currently supply evidence. It does not encode why remediation is required. A future requirement to distinguish configuration failure, transient failure, and refresh failure requires a separate target-contract extension.

# Part II — Source Identity

## 10. Connector Identity

**Decision:**

```text
connectorId = ConnectorStatus.name
```

`connectorId` identifies the logical JARVIS capability. It does not identify the backing provider.

## 11. Source Identity

**Decision:**

```text
sourceId = ConnectorStatus.source
```

The closed source scope is:

```text
local
google
```

The publisher shall not translate these values to `google-calendar`, `google-gmail`, or `google-drive`. `connectorId + sourceId` carries the current repository meaning without inventing another provider identity layer.

## 12. Source Is Not Availability

This is a valid state:

```text
connectorId = "gmail"
sourceId = "google"
availability = "unavailable"
```

It means Google is the configured or intended live source and the latest live Gmail acquisition did not succeed. `sourceId = "google"` shall not imply availability. Availability comes from the resolved acquisition result.

# Part III — Fallback Decision

## 13. Existing Fallback Behaviour

All three production loaders use local compatibility data when the live source is absent or fails:

| Connector | Local configuration | Failed Google acquisition |
| --- | --- | --- |
| Calendar | `LocalCalendarConnector.listUpcoming(5)` and `unavailable` | local events and `unavailable` or `refresh_required` |
| Gmail | `LocalGmailConnector.listRecent(5)` and `unavailable` | local messages and `unavailable` or `refresh_required` |
| Drive | `LocalDriveConnector.listRecentActivity(5)` and `unavailable` | local records and `unavailable` or `refresh_required` |

Gmail's separate governed recipient-evidence path fails closed. Local Gmail records do not become governed Google evidence.

## 14. Selected Fallback Semantics

**Selected:** `fallbackStatus = "unavailable"` whenever the live governed source is unavailable and local compatibility data is in use.

**Rejected:** reporting `none` because local records were returned. That would conceal source substitution.

**Rejected:** reporting local data as a successful governed fallback. The target has no governed-fallback state, and local compatibility records have no authority as governed Google evidence.

## 15. Binding Fallback Decision

> Local compatibility data in use requires `fallbackStatus = unavailable`; it shall never be reported as `none`.

The binding rules are:

```text
live acquisition succeeds, no local substitution
    → fallbackStatus = "none"

connector configured local
    → fallbackStatus = "unavailable"

Google acquisition fails and local data is substituted
    → fallbackStatus = "unavailable"
```

Here, `unavailable` means no governed fallback is available. It does not assert that no compatibility data exists.

## 16. Valid State Matrix

| `sourceId` | `availability` | `fallbackStatus` | Meaning |
| --- | --- | --- | --- |
| `google` | `available` | `none` | Live Google acquisition succeeded |
| `google` | `unavailable` | `unavailable` | Google is intended/configured; live acquisition failed; local compatibility data is in use |
| `local` | `unavailable` | `unavailable` | No live Google source supplies governed evidence; local compatibility data is in use |

The following combinations are prohibited under the current architecture:

```text
local + available
unavailable + none
local + unavailable + none
local + available + none
local + available + unavailable
```

# Part IV — Observation Time

## 17. Current Timestamp Finding

`ConnectorStatus` has no timestamp. `getConnectorStatuses()` captures no timestamp. Loader result types carry no connector-status `observedAt`. `OperationalState.updatedAt` is captured after all loads finish and describes the assembled operational picture.

> `ConnectorStatus` has no mechanical timestamp. A connector-specific observation time must be captured when the loader resolves; no downstream timestamp may substitute.

## 18. Observation-Time Decision

**Selected:** capture one explicit observation time when each connector's load attempt resolves into its final status for the current OperationalState build.

Conceptually:

```text
loadCalendar() → events + status + observedAt
loadGmail()    → messages + status + evidence + observedAt
loadDrive()    → files + status + observedAt
```

The governed mapping preserves that exact value:

```text
GovernedConnectorAvailabilityInput.observedAt
    = corresponding loader-result observedAt
```

## 19. Prohibited Timestamp Substitutions

`observedAt` shall not be reconstructed from:

* `OperationalState.updatedAt`;
* projection `createdAt`;
* projection `referenceTime`;
* conversation time;
* source-content timestamps;
* memory-store update time; or
* a clock call inside the downstream publisher.

Missing connector-specific observation time fails closed. No governed availability item is emitted.

# Part V — Five-Field Mapping

## 20. Binding Field Matrix

| Field | Exact binding | Decision |
| --- | --- | --- |
| `connectorId` | `ConnectorStatus.name` | Deterministic |
| `sourceId` | `ConnectorStatus.source` | Deterministic |
| `availability` | `connected ? "available" : "unavailable"` | Deterministic |
| `observedAt` | connector-load resolution observation time | Narrow upstream preservation required |
| `fallbackStatus` | `connected ? "none" : "unavailable"` | Deterministic under current loader architecture |

No field remains unresolved.

## 21. Exact Mapping

For status `S` and its associated resolved loader observation `L`:

```text
connectorId
    = S.name

sourceId
    = S.source

availability
    = S.connected === true
      ? "available"
      : "unavailable"

observedAt
    = L.observedAt

fallbackStatus
    = S.connected === true
      ? "none"
      : "unavailable"
```

The fallback expression is valid because every current production `connected === false` path uses a local connector directly or substitutes that connector after live failure. Any change to that architecture requires governance review.

# Part VI — Policy and Content Boundary

## 22. Policy Decision

> `GovernedConnectorAvailabilityInput` has no `policyReference`; no new disclosure-policy constant is required because the publication contains availability metadata only and no source content.

The publication contains only logical connector identity, configured source class, availability, observation time, and governed-fallback status. Structural symmetry with the Gmail, Calendar, and Memory Priority contracts is not sufficient reason to invent a policy field.

## 23. Disclosure Boundary

Absence of `policyReference` does not authorize disclosure of:

* OAuth or refresh tokens;
* credentials;
* raw provider or HTTP errors;
* stack traces;
* account identifiers;
* scopes;
* mailbox addresses;
* Calendar IDs;
* Drive IDs; or
* internal connector implementation details.

The five-field type is the disclosure boundary. Richer cause or configuration metadata requires separate governance.

# Part VII — Acquisition Non-Reopening

## 24. Gmail

This contract does not reopen Gmail acquisition, recipient normalization, evidence availability, content retrieval, or Sprint 3.96 disclosure policy. Connector availability is adjacent metadata, not Gmail communication evidence.

## 25. Calendar

This contract does not reopen Calendar discovery, OAuth, query horizon, event limit, normalization, coverage, or Sprint 3.97 disclosure policy. Connector availability does not establish event availability or coverage.

## 26. Drive

This contract governs only Drive connector availability. It does not govern Drive file evidence, metadata disclosure, search, content, or provenance.

# Part VIII — Identity Integrity

## 27. One Observation, Multiple Consumers

The architecture is:

```text
one live connector attempt
    ↓
one resolved availability observation
    ├── existing application/dashboard status
    └── governed conversational availability reference
```

`OperationalState.connectorStatuses` and the domain-specific statuses remain application/status consumers. The governed availability input is a bounded downstream representation of the same observation. It is not a second connector, acquisition, provider event, or canonical authority.

No synthetic combined publication ID is required by the target type. This contract shall not invent one.

## 28. Local Compatibility Boundary

```text
local compatibility data exists
    ≠ live connector available

local compatibility data exists
    ≠ governed fallback available
```

Local Calendar, Gmail, and Drive connectors provide application continuity only. Local records shall not receive Google source identity and shall not establish successful live availability.

# Part IX — Publication Responsibility

## 29. Publisher Inputs

The publisher is not a pure function of `ConnectorStatus` alone. The future bounded input requires:

```text
ConnectorStatus
+ connector-specific status observation time
+ resolved loader/fallback outcome
```

It does not require model state, conversation text, mutable policy, source content, claim state, or conflict state.

## 30. Architecture Decision

**Selected:** preserve existing `ConnectorStatus` semantics and add a narrow status-observation publication boundary carrying observation time and fallback truth.

**Rejected:** inventing `observedAt` while mapping `ConnectorStatus` alone.

**Rejected:** expanding `ConnectorStatus` into a comprehensive connector-governance architecture.

**Rejected:** deriving connector observation later from assembled `OperationalState`.

A future internal observation shall be semantically equivalent to:

```text
ConnectorAvailabilityObservation
    connectorStatus
    observedAt
    fallbackUsed
```

The exact future type name is not governed. Its semantics are.

## 31. Fail-Closed Rules

A future publisher shall emit no item unless:

```text
connectorId ∈ calendar | gmail | drive
sourceId ∈ local | google
connected is Boolean
observedAt is present and valid
fallback outcome is known
```

The publisher shall reject `local + available`. It shall reject `unavailable + none`. Missing or malformed observation time fails closed. Unknown fallback state fails closed because the target has no `unknown` state.

# Part X — Evidence Boundary

## 32. Availability Is Not Source Evidence

Connector availability proves no particular message, event, or file was observed. `gmail available` does not prove a message exists, was fetched, or has an observed recipient. Those facts require the governed source-specific publication.

## 33. Source Evidence Is Not Availability

Source-specific evidence retains its own acquisition and provenance semantics. Connector availability is an adjacent bounded fact and shall not overwrite source-evidence ownership.

# Part XI — Publication Responsibility Audit

## 34. Binding Audit

| Question | Binding answer |
| --- | --- |
| Does production already produce `ConnectorStatus[]`? | Yes |
| Is it used in `OperationalState`? | Yes |
| Does production override `connected` from actual live loader result? | Yes |
| Does `source` identify `local` versus `google`? | Yes |
| Does `connected` have a third state? | No |
| Does governed availability have a third state? | No |
| Is `connected=true → available` exact? | Yes |
| Is `connected=false → unavailable` exact for availability? | Yes |
| Does `ConnectorStatus` carry `observedAt`? | No |
| May `OperationalState.updatedAt` substitute? | No |
| Is local fallback real production behaviour? | Yes |
| May local fallback be reported as `fallbackStatus=none`? | No |
| Is local fallback governed source evidence? | No |
| Does this contract govern exactly Calendar/Gmail/Drive? | Yes |
| Does it govern Memory availability? | No |
| Does the target contain `policyReference`? | No |
| Is a new policy constant required? | No |
| Does this reopen Gmail acquisition governance? | No |
| Does this reopen Calendar acquisition governance? | No |
| Does this govern Drive content? | No |
| Does this replace dashboard status logic? | No |
| Does this create a second connector publication authority? | No |
| Is a narrow observation-time/fallback boundary required? | Yes |
| Is model reasoning required? | No |
| Is a mutable policy registry required? | No |
| Is deterministic replay required? | Yes |

**Decision:** Publication Responsibility Audit passes.

# Part XII — Future Implementation and Tests

## 35. Future Publisher Boundary

A subsequent isolated implementation sprint shall create a deterministic publisher whose sole responsibility is:

```text
resolved connector status observations
    ↓
validate
    ↓
map five governed fields
    ↓
GovernedConnectorAvailabilityInput[]
```

It shall not acquire or retry connector data, inspect OAuth credentials, inspect conversation text, infer claims, inspect model output, select source content, adjudicate conflicts, or promote local data to governed source evidence.

## 36. Required Mapping Tests

Tests shall cover every connector for:

1. Google success → `google + available + none`;
2. Google failure with local substitution → `google + unavailable + unavailable`; and
3. local configuration → `local + unavailable + unavailable`.

## 37. Required Observation-Time Tests

Tests shall prove:

1. each connector observation receives explicit `observedAt` at load resolution;
2. the publisher preserves that value exactly;
3. the publisher calls no clock;
4. projection time does not replace it;
5. OperationalState assembly time does not replace it; and
6. identical inputs replay identically.

## 38. Required Fallback Tests

Tests shall prove:

1. Google success maps to `none`;
2. Google failure with local records maps to `unavailable`;
3. a local connector with local records maps to `unavailable`;
4. local records never change availability to `available`;
5. local records never change fallback status to `none`;
6. fallback content is not copied into availability; and
7. local records do not acquire Google identity.

## 39. Required Closed-Scope and Negative Tests

The publisher shall reject Memory, Slack, GitHub, web, model, unknown connector names, and unknown source names. Negative tests shall cover missing or unsupported IDs, missing or malformed observation time, `local + available`, `unavailable + none`, unknown fallback outcome, publisher-generated time, raw errors, raw exceptions, and copied fallback content.

Identity tests shall prove connectors remain distinct, source does not replace connector identity, Google failure remains Google source identity despite local substitution, no source publication ID is invented, dashboard status remains a downstream consumer, and replay is deterministic.

# Part XIII — Explicit Non-Decisions

## 40. Out of Scope

Sprint 3.99 does not decide Drive conversational evidence publication, Gmail or Calendar acquisition, Gmail recipient or content semantics, Calendar scope or coverage, Memory Priority availability, OAuth remediation UX, reconnect actions, provider error taxonomy, health monitoring, retries, latency, stale-status thresholds, claims, conflicts, production `/api/chat` wiring, or promotion.

# Part XIV — No Implementation

## 41. No-Implementation Statement

> Sprint 3.99 authorizes no implementation or production integration.

It authorizes no code or type change, connector or loader modification, `OperationalState` modification, publisher, projection-composer change, dashboard change, fallback-behaviour change, observation-time addition, or `/api/chat` modification. This sprint establishes governance only.

# Part XV — Validation Record

## 42. Validation Results

| Command | Result |
| --- | --- |
| `npm test` | Passed: 145 test files; 710 tests passed and 1 skipped |
| `npm run build` | Passed: production build completed; remote Google Fonts stylesheet optimization was skipped |
| `npm run lint` | Passed: no ESLint warnings or errors |
| `npm run typecheck` | Passed |
| `git diff --check` | Passed |

Repository-wide searches confirmed every production status producer and caller, status consumers, all three fallback paths, all three domain-status constructions, the exact governed target, absence of a production publisher, absence of connector-specific status observation time, absence of `policyReference` from the target, the closed three-name source type, and the unchanged `/api/chat` path.

## 43. Files Changed

```text
docs/SPRINT-3.99-GOVERNED-CONNECTOR-AVAILABILITY-CONVERSATIONAL-EVIDENCE-PUBLICATION-CONTRACT.md
```

No production file is changed.

# Part XVI — Next Step

## 44. Isolated Implementation Sprint

> **Sprint 4.00 — Governed Connector Availability Publication Implementation**

That sprint shall execute this contract without reopening its governance decisions.

# Part XVII — Binding Summary

## 45. Binding Architecture

```text
Calendar / Gmail / Drive connector attempt
    ↓
existing production loader
    ├── live success
    ├── live failure
    └── local compatibility substitution
    ↓
resolved connector status observation
    ├── ConnectorStatus.name
    ├── ConnectorStatus.source
    ├── ConnectorStatus.connected
    ├── observedAt
    └── fallback truth
    ↓
deterministic mapping
    ├── connectorId
    ├── sourceId
    ├── availability
    ├── observedAt
    └── fallbackStatus
    ↓
GovernedConnectorAvailabilityInput
    ↓
GovernedConversationalProjection
```

The exact mapping is:

```text
connectorId = ConnectorStatus.name
sourceId = ConnectorStatus.source
availability = connected ? "available" : "unavailable"
observedAt = connector-load resolution observation time
fallbackStatus = connected ? "none" : "unavailable"
```

The closed connector scope is Calendar, Gmail, and Drive. The closed source scope is local and Google. Observation time shall not be invented. Fallback shall not be hidden. Compatibility data shall not become governed live evidence. Availability shall not become source evidence. No policy field is invented. No implementation is authorized.

**Governed Contract Complete**
