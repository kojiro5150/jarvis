# JARVIS Authority Migration Status

- **Status:** Living migration record
- **Last updated:** 2 September 2026 (reconciled through bounded Drive ordinal continuity LIVE PASS)
- **Governing architecture:** `docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md`
- **Governing ADR:** `docs/architecture/ADR-0025-operation-level-authority-before-acquisition.md`

## Purpose

This document separates four things that must not be conflated:

1. architecture required by the frozen North Star;
2. deterministic machinery that already exists somewhere in the repository;
3. production integration that is live today; and
4. migration work that remains incomplete.

A checkmark here means the stated capability is implemented at the stated layer. It does **not** imply that adjacent layers are complete.

Legend:

- `✓` implemented and verified on `main`
- `△` partial or isolated machinery exists, but the production path is incomplete
- `○` not yet implemented
- `!` current legacy behaviour conflicts with the target architecture and requires migration

## Operation-level authority

| Capability / mechanism | Adjudication | Acquisition gate | Live production path | Notes |
| --- | --- | --- | --- | --- |
| `calendar.read` | ✓ | ✓ | ✓ — live bounded path | The JARVIS conversational route gates bounded governed Calendar reads. Its deterministic proposal recognizer accepts deliberate high-precision requests rather than Calendar mentions, recall, or discussion. |
| identified-message `gmail.read` | ✓ | ✓ | ✓ — frozen baseline | The exact `/api/lighter/chat` command path gates one exact message and requested-field set before resource-policy evaluation and acquisition. The development/demo runtime is explicitly wired to a subject-only policy; the lighter path returns deterministic presentation with no model or specialist handoff. Legacy `/api/chat` Gmail execution is contained. |
| bounded `gmail.search` discovery | ✓ | ✓ | ✓ — exact baseline frozen; NL proposal live | The unchanged exact `1d`/`7d` command path directly allows at most five message IDs. Sprint 3.137 also deterministically proposes those same bounded operations from high-precision natural language, but proposal recognition confers no execution authority: explicit confirmation of server-owned pending state is required. Broader Gmail discovery remains unimplemented. |
| metadata-only `drive.search` and identified Google Doc `drive.read` | ✓ | ✓ | ✓ — bounded production paths; ordinal continuity frozen | Search remains metadata-only. `drive.read <provider-file-id> [text]` remains an exact raw-utterance authority path. A recent bounded Drive search may also identify one exact file through a server-owned ordinal result reference, but that selection creates a separate one-shot pending `drive.read` operation and never inherits search authority. Both routes retain the 65,536-byte complete-verbatim Google Docs policy. |
| arbitrary `drive.read` beyond identified Google Docs | ○ | ○ | ○ | The bounded identified-Google-Doc paths above are live; arbitrary Drive content acquisition is not implemented. |
| `memory.read` | ○ | ○ | ○ | Memory is still acquired through legacy state-building paths; operation-level authority not yet implemented. |
| `calendar.write` | ○ | ○ | ○ | Future action capability; not part of current read migration. |
| `gmail.send` | ○ | ○ | ○ | Future action capability; must never inherit from Gmail read authority. |

## Authority evidence sources

| Evidence class | Status | Notes |
| --- | --- | --- |
| Explicit current-user utterance | ✓ for `calendar.read`, identified-message `gmail.read`, bounded `gmail.search`, metadata-only `drive.search`, and identified-Google-Doc `drive.read` | Raw current utterance is independently matched; capability/proposal metadata is non-authoritative. |
| Named capability grants | ○ | No general named-grant machinery yet. |
| Standing grants | ○ | No standing-grant store or adjudication yet. |
| `PendingAuthorization` confirmation | ✓ — live | Server-owned, capability-bound, one-shot state is integrated for Calendar reads, identified-message Gmail reads, and natural-language bounded Gmail and Drive search proposals. The client receives only an opaque reference. Bare, stale, fabricated, unknown, consumed, and capability-mismatched references fail closed and resolve before model invocation. The authoritative registry is a module-private process-local `Map`; durable or distributed persistence remains incomplete. |
| Resource policy | △ | Mature Gmail content-retrieval policy follows authority for the identified-message path; it is not positive user authority and is not yet composed into a general Authority Engine. |

## Non-authoritative resource identification

| Mechanism | Status | Notes |
| --- | --- | --- |
| `GovernedResultSetReference` | ✓ — live and frozen for bounded Drive ordinal continuity | The client receives only opaque scope and result-set handles. The server owns exact result order, 15-minute TTL, six-subsequent-user-turn budget and same-class supersession. The reference may identify a resource but is never authority evidence. Expired, exhausted, superseded, out-of-range, fabricated and cross-scope references fail closed before ordinary-model substitution or connector read. Storage remains module-private and process-local; durable or distributed persistence is not implemented. Gmail and Calendar migration is not authorized by this proof. |

Sprint 3.133 wires the closed identified-message operation into the live JARVIS lighter route.
Exact `gmail.read <message-id> [field,field]` utterances now proceed from raw utterance authority to
resource policy, one identified-message retrieval, and deterministic server presentation. Malformed
commands stop with syntax guidance. Neither handled case invokes a conversational model or
specialist routing, and the connector is not constructed before authority `ALLOW`. Search,
discovery, and natural-language Gmail requests remain outside the operation.

Sprint 3.134 supplies the concrete bounded development/demo resource policy and wires the local
live runtime to it with `CONTENT_RETRIEVAL_POLICY_PATH`. The policy permits only `subject` for the
already-authorized identified-message operation. Missing, malformed, unreadable, invalid, or
unmatched policy remains fail-closed, and released content remains the intersection of requested,
policy-admissible, and adapter-supported fields.

## `gmail.search` detail

Sprint 3.135 adds a separate closed `gmail.search [newer_than:1d|7d]` capability. Exact raw current-utterance authority is adjudicated before connector construction. Its deterministic provider request is limited to five `messages.list` results, and only provider message IDs are released. Search neither reads message content nor grants or invokes `gmail.read`; handled and malformed searches make no model call or specialist handoff. Returned IDs remain non-authoritative data.

Sprint 3.136 freezes the proven Gmail vertical as a durable end-to-end regression baseline without
adding capability or changing architecture. Search and read remain two separately authorized
requests: search returns at most five data-only IDs, and only a later exact `gmail.read <id>
[subject]` utterance may proceed through the subject-only development/demo policy to deterministic
subject release. The baseline also locks zero model calls and zero specialist handoffs for both
governed operations while preserving the existing Calendar authority regressions.

Sprint 3.137 leaves that frozen exact search/read baseline unchanged and adds only deterministic,
high-precision natural-language proposal generation for the existing bounded `gmail.search`
operation. Recognition proposes `1d` or `7d`; it does not confer execution authority. The proposal
must pass through server-owned `PendingAuthorization` and a separate explicit confirmation before
the bounded ID-only search may run. Natural-language `gmail.read`, sender/subject/content search,
arbitrary Gmail queries, and all broader Gmail discovery remain unimplemented. Search authority
still cannot authorize or chain into read authority.

Live Sprint 3.137 validation subsequently completed the governed natural-language Gmail sequence:
proposal → `ASK` → explicit confirmation → bounded ID-only search, followed by a separate exact,
policy-gated subject read. An earlier live attempt repeated the confirmation prompt after `Yes`, so
the `PendingAuthorization` continuation has an intermittent reliability observation. Its cause is
unknown; the evidence does not confirm process-local state as the cause. See
`docs/SPRINT-3.137-LIVE-GMAIL-VALIDATION.md` for the verbatim transcripts and evidence boundaries.

Sprint 3.138 adds the deterministic model-history boundary on `/api/lighter/chat`. Current-turn
authority recognition still runs first against the untouched utterance. Before an ordinary model
call, deterministic Gmail search, Gmail read, and Calendar read releases, plus prior exact Gmail
read authority commands containing message IDs, are omitted from the model-only copy of
client-carried history; visible responses remain unchanged. Client metadata is not accepted as
authority or durable provenance, ordinary non-private history is retained, and no Gmail,
Calendar, resource-policy, or `PendingAuthorization` scope is broadened.

Sprint 3.140 contains the independently proven legacy `/api/chat` Gmail bypass before convergence.
That route now rejects `governed_gmail_retrieval` with a neutral path-scoped response before
authorization, `PendingAuthorization`, connector construction, or acquisition routing. The
governed `/api/lighter/chat` Gmail baseline and its separate search/read authority remain unchanged.
See `docs/SPRINT-3.140-LEGACY-GMAIL-CONTAINMENT.md`.

Sprint 3.141 makes authority confirmation UX the exclusive responsibility of deterministic
authority machinery. Ordinary model output cannot impersonate a governed Calendar or Gmail `ASK`,
and governed-history sanitizer placeholders remain model-context-only artifacts that are never
user-visible. Genuine governed Calendar/Gmail `ASK` flows are unchanged, and unsupported weekday
Calendar requests remain unsupported. See `docs/SPRINT-3.141-AUTHORITY-UX-INTEGRITY.md`.

Sprint 3.142 extends that ordinary-model reply boundary with static capability truthfulness.
For Calendar/Gmail-related requests that remain on the unsupported ordinary path, false global
denials are replaced with fixed path-scoped wording that records only the existence of
`calendar.read`, `gmail.search`, and identified-message `gmail.read`. The correction is not
authority evidence, does not inspect or represent connector state, creates no pending authority,
and performs no acquisition. Governed ASK flows and all operation recognizers remain unchanged.
See `docs/SPRINT-3.142-CAPABILITY-TRUTHFULNESS.md`.

Sprint 3.143 serializes capture-identified voice turns through the shared canonical submission
path. A later voice turn cannot begin until the prior response has applied, duplicate delivery is
keyed by capture identity rather than transcript text, and request freshness prevents stale
responses from overwriting the current opaque pending reference. Transcription metadata remains
non-authoritative; typed authority semantics, server ownership, and Calendar/Gmail scope are
unchanged. See `docs/SPRINT-3.143-VOICE-AUTHORITY-TURN-INTEGRITY.md`.

Sprint 3.144 introduces the exact-command, metadata-only `drive.search` production baseline.
Sprint 3.145 leaves that baseline and its Google `drive.metadata.readonly` connector unchanged and
adds exactly three deterministic natural-language proposal forms. Recognition grants no authority:
the exact stored operation executes only after explicit confirmation of server-owned, one-shot,
Drive-capability pending state. Anaphora, all other natural-language forms, content reads, export,
download, summarisation, local fallback, and Calendar/Gmail authority crossover remain excluded.
The private-capability handoff guard also classifies Drive acquisition on both the raw utterance and
model task summary as a deny-only check; model output remains non-authoritative.
See `docs/SPRINT-3.145-NATURAL-LANGUAGE-DRIVE-SEARCH-PROPOSALS.md`.

Sprint 3.146 excludes deterministic Drive metadata releases, including fabricated presentation
lookalikes, from ordinary model history. It also records that the 40-message bound constrains only
ordinary model context: structurally valid long-session confirmations reach the governed
resolvers first, and a valid opaque reference completes without a model call. Bare, stale,
fabricated, unknown, consumed, and capability-mismatched references remain fail-closed under the
existing one-shot `PendingAuthorization` and Sprint 3.143 voice-freshness semantics. No authority
evidence class, capability grammar, connector scope, content-read scope, or acquisition bound is
changed. See
`docs/SPRINT-3.146-DRIVE-HISTORY-AND-LONG-SESSION-PENDING-INTEGRITY.md`.

## `calendar.read` detail

### Implemented

- closed `ProposedOperation` whose only admitted capability in the first slice is `calendar.read`;
- deterministic evaluation against the raw current user utterance;
- `ALLOW | ASK | DENY` decision vocabulary;
- immutable authority evidence on positive explicit reads;
- `ASK` for ambiguity, prior-context-only cases, negated reads and mixed read/write wording;
- no connector invocation inside authority adjudication.

### Authority-gated acquisition implemented

- the PR1 evaluator is composed with the existing `acquireGovernedCalendarEvidence()` seam;
- only `ALLOW` enters governed Calendar acquisition;
- `ASK` and `DENY` return without evidence and without calling `CalendarAcquisitionPort.listUpcoming()`;
- the authority decision remains separate from acquisition availability and evidence.
- live Calendar evidence is rendered deterministically server-side and is not disclosed to a conversational model in this slice;
- operation proposal is distinct from authority, including temporal schedule questions that propose `calendar.read` and still resolve to `ASK`.

### Not yet implemented

- conversational Calendar integration outside the bounded JARVIS route;
- durable or distributed conversation-state persistence of `PendingAuthorization` references;
- standing Calendar-awareness grants.

## Existing governed machinery that is reusable but not equivalent to the Authority Engine

### Deterministic claim-boundary recognition — `✓`

`lib/governed-conversation/claim-boundary-engine.ts` demonstrates bounded deterministic recognition, typed-intent precedence, clarification publication and fail-closed unsupported-language handling.

This is a recognition precedent. It answers questions about governed conversational claims; it is not itself operation authorization.

### Governed Calendar acquisition — `✓`

`lib/governed-conversation/calendar-evidence-acquisition-adapter.ts` exposes:

- `CalendarAcquisitionPort`;
- bounded acquisition configuration;
- refusal to call non-Google sources;
- contained provider failure;
- governed Calendar evidence publication.

This is the acquisition seam to gate in the next Calendar authority sprint.

### Gmail resource policy — `✓`

`lib/content-retrieval-policy` and `lib/content-retrieval/gmail.ts` provide deterministic content policy and policy-before-retrieval behaviour.

This is resource-policy machinery, not proof of user authorization.

### Agent/handoff adjudication precedent — `✓`

The agent coordinator and lighter handoff flows demonstrate bounded deterministic contract and confirmation patterns.

They do not provide the general operation-level authority sources required by v0.1.

## Legacy and retired operational-state machinery

### `OperationalState` and `buildOperationalState()` — `△` legacy/internal code; no callable production conflict

The legacy implementation still physically exists in `lib/operational-state.ts`, where
`buildOperationalState()` executes:

```text
Promise.all([
  readMemory(),
  loadCalendar(),
  loadGmail(),
  loadDrive()
])
```

Calling that builder would acquire multiple private sources before operation-level authority has
been adjudicated for each source. It is therefore legacy/internal code and must not be made a
production authority path. Current quarantine and retirement regressions record zero callable eager
full-state production surfaces; its continued existence is not a current callable authority conflict.

Target correction: authorized acquisition first, state assembly second.

Sprint 3.124 removes one caller from this conflict: connector-status refresh
in `UnifiedOpsConsole` now uses a status-only endpoint derived from
configuration, stored-token metadata and provider selection. It performs no
Calendar, Gmail, Drive or Memory content acquisition. `OperationalState`
itself and its other callers remain unchanged and still require migration.

Sprint 3.125 removes the ordinary non-capability `/api/chat` caller. That path
no longer builds `OperationalState` or injects its implicit Memory, Calendar,
Gmail or Drive-derived prompt context. Agent and BOA instructions, audited
execution and the explicit capability branch remain in place. Other
legacy `OperationalState` callers remain unresolved.

Sprint 3.126 makes the remaining production boundary deterministic without
migrating it. The machine-readable inventory and regression guard quarantine
the Dashboard/API chain, DAWNWATCH, the deprecated operational-picture alias,
and the evidence-only evaluation endpoint. New direct builder callers, API
clients, or Dashboard hook entry points fail the guard. This is containment,
not authorization.

Sprint 3.127 migrates the DAWNWATCH conversational prompt. DAWNWATCH now uses
the ordinary non-private specialist prompt by default and no longer calls
`buildOperationalState()` or `buildProductionDawnwatchInput()` during prompt
construction. DAWNWATCH routing and the JARVIS relay/roster contracts remain
unchanged. The next live migration is the Dashboard's ambient
`useOperationalState()` → `/api/operational-state` acquisition chain. The
deprecated operational-picture alias and evidence-only evaluation endpoint
also remain quarantined direct-builder callers.

Sprint 3.128 removes the Dashboard's automatic operational-state acquisition.
Its compatibility hook now starts from explicitly empty, non-private content
collections and fetches only connector configuration/token metadata from
`/api/connector-status`. The Dashboard shell is unchanged. The legacy
operational-state, operational-picture, and evaluation APIs remain quarantined
direct-builder surfaces with no known in-repository clients.
Dashboard Memory editing is temporarily unavailable: its editor entry point is
isolated so the empty compatibility state cannot overwrite stored Memory. It
must remain unavailable until explicit Memory read/write authority exists. Any
connector `source` synthesized for the legacy Dashboard contract is
compatibility-only and is not observed provider provenance.

Sprint 3.129 closes the final callable eager full-state surfaces. The legacy
`/api/operational-state` and deprecated `/api/operational-picture` routes now
fail closed with HTTP 410 and do not import or invoke `buildOperationalState()`.
The unused `/api/operational-state/evaluation` route is removed. The production
quarantine and machine-readable inventory record zero callable eager full-state
surfaces, so migration Step 5 is complete. This does not add Gmail, Drive, or
Memory authority, and `BRIEF_ME_GRANT` remains unimplemented.

### Local fallback acquisition — `!` for future authority architecture

Legacy Calendar, Gmail and Drive loaders can fall back to local data after source failures. This behaviour is historically intentional for dashboard continuity, but it must not become an authority bypass in the governed production path.

### Briefing authority — `○`

DAWNWATCH conversation is non-private by default and does not acquire Memory,
Calendar, Gmail or Drive while constructing its specialist prompt. No
compliant multi-source private briefing authority is implemented.

A future compliant briefing path requires bounded authority for each private
operation. `BRIEF_ME_GRANT` remains unimplemented, as do broader Gmail discovery
and conversational Gmail use, Drive content/read authority, and Memory authority.
The bounded identified-message `gmail.read` foundation does not authorize a
private briefing.

### Named specialist UX — `△`

Named specialist language remains visible in some current surfaces, including DAWNWATCH briefing behaviour.

Sprint 3.139 adds a deterministic server-side handoff guard: an ordinary fall-through
Calendar/Gmail acquisition request cannot turn a model-generated `propose_handoff` into a
`routeTo` or pending handoff. The untouched utterance and proposed task summary are both
checked on this deny-only boundary, and rejected model handoff claims are replaced with a
neutral server response. DAWNWATCH ordinary runtime has no Calendar/Gmail acquisition;
it may only present governed evidence supplied to its turn. This guard does not change the
existing JARVIS-only Calendar/Gmail authority or recognizer boundaries.

The frozen product direction is one user-facing JARVIS identity. Internal specialist/capability machinery may remain, but should become an implementation detail rather than a user coordination requirement.

## Migration sequence

| Step | Deliverable | Status |
| --- | --- | --- |
| 1 | Isolated deterministic `calendar.read` adjudication | ✓ |
| 2 | Authority-gated governed Calendar acquisition | ✓ |
| 3 | General `PendingAuthorization` for exact operation confirmation | ✓ — live for the bounded production capabilities; authoritative storage remains process-local |
| 4 | Live conversational Calendar integration | ✓ — bounded `calendar.read` path |
| 5 | Separate private acquisition from legacy `OperationalState` assembly | ✓ — COMPLETE since Sprint 3.129; retired/quarantined regressions prove zero callable eager full-state production surfaces |
| 6 | Extend authority to Gmail, Drive and Memory | △ — bounded Gmail plus Drive search and identified Google Doc read paths are live; Drive ordinal result-to-read continuity is LIVE PASS / FROZEN, while arbitrary `drive.read` and `memory.read` remain unimplemented |
| 7 | Named and standing grants, including bounded briefing authority | ○ |
| 8 | Complete one-JARVIS UX migration and remove authority-bypassing legacy paths | ○ |

## Governance rule for future sprints

An architectural sprint is not complete until **code, tests and governing documentation agree**.

A sprint that changes any of the following must update the relevant architecture/spec/status documentation in the same PR or an explicitly paired documentation PR:

- authority boundaries;
- operation vocabulary;
- grant semantics;
- evidence rules;
- private acquisition ordering;
- canonical state ownership;
- capability execution authority;
- user-facing architectural identity;
- supersession of an accepted architectural contract.

Historical documents should not be rewritten merely to make the past resemble the present. Supersession must be explicit.

## Evidence discipline

When updating this file:

- mark implemented behaviour only when verified in the repository;
- label isolated machinery separately from production integration;
- do not present planned behaviour as live;
- distinguish user authority, resource policy, connector availability and execution success;
- record unresolved policy gaps rather than silently inventing policy.
