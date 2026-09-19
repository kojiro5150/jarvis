# ADR-0027: Authority Sources, Named Grants Without Standing Grants

- **Status:** Proposed (becomes Accepted on merge of the PR that also lands voice write containment)
- **Date:** 2026-09-19
- **Amends:** `JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md` sections 2 and 3; `ADR-0025` section "Named and standing grants" and follow-up item 7
- **Related:** ADR-0025 (operation-level authority before acquisition); `JARVIS-UNTRUSTED-CONTENT-ADVERSARIAL-CORPUS-v0.1.md` (separate PR)

## Context

The North Star authority architecture lists five authority evidence sources, including named capability grants (section 2) and standing grants (section 3). ADR-0025 records both as future positive authority sources. Production implements neither. Every live path relies on current-turn explicit authority or a server-owned `PendingAuthorization` consumed once, and `gmail-standing-authority.ts` already refuses conversational requests for standing Gmail authority.

Governing doctrine, migration status, roadmap language and code therefore express different answers to the same question. Under the rule established by Sprint 3.119, an architectural position is not settled until code, tests and governing documentation agree.

Two requirements pull against each other:

1. JARVIS must never manufacture, infer, extend or silently preserve authority.
2. Repeated approval of a predictable, bounded, deliberately configured operation creates friction and approval fatigue without adding meaningful control. The Morning Executive Orientation asking for Calendar consent every morning is the observed case.

A standing grant answers requirement 2 by weakening requirement 1: authority that persists across turns and contexts cannot be bounded as precisely as one-shot authority. A named grant can answer requirement 2 while remaining structurally bounded, provided its definition is hard enough that it cannot become a standing grant under another name.

Separately, Sprint 3.143 routes transcribed voice into the same canonical path as typed input, and the server has no modality signal. A spoken "yes" therefore currently resolves Calendar move authority. Voice offers no visual separation between governed operation fields and other content. This ADR contains that exposure in the same change that adopts it, so adoption does not knowingly place production out of compliance.

## Decision

JARVIS adopts **Option C: named grants remain an admissible future authority source; standing grants are removed.**

### D1. Standing grants are not an authority source

No capability may treat any of the following as authority: prior approval, repeated historical approval, routine behaviour, familiarity, absence of objection, remembered preference, previous successful execution, conversational persistence, or time elapsed.

The North Star authority evidence sources become four: explicit utterance evidence, named capability grants, pending authorization confirmation, and resource policy.

### D2. Named grants: hard definition

A named grant is a server-owned authority object that permits a fixed operation footprint only when its fixed trigger occurs in a current-turn user utterance.

A named grant MUST have:

1. a finite maximum lifetime, set at creation and never extended implicitly;
2. explicit renewal as the only way to continue past that lifetime, through the surface defined in D3;
3. a trigger that is a deterministic match against the raw current-turn user utterance, and nothing else;
4. a fixed footprint of operations, targets or target classes, and scope, defined at creation;
5. identity, contract version, creation provenance, revocation state and last-use metadata held server-side.

A named grant MUST NOT be triggered by a timer, schedule, external event, provider notification, remembered preference, prior conversation, model inference or semantic similarity. A trigger that fires without a current-turn user utterance is standing authority and is prohibited by D1.

A named grant never widens its own footprint, changes its trigger, adds operations, or outlives its lifetime. It never authorizes writes unless its footprint names the write operation explicitly.

Proactive or scheduled authority, for example DAWNWATCH-style morning or evening briefs that acquire without a current-turn request, is outside this ADR. It requires its own architectural decision and is not reachable through the named-grant category.

### D3. Grant lifecycle invariant

A named grant may be created, widened, renewed or revoked only through a dedicated deterministic grant-management surface that the user initiates directly.

Models and untrusted source content may neither create nor **propose** the creation, widening or renewal of a grant. No conversational flow may present a grant change for confirmation. Revocation is the one lifecycle action a conversational flow may point the user toward, and even then it executes only through the grant-management surface.

### D4. Activation gate

This ADR makes named grants admissible. It does not activate them. No named-grant implementation reaches production until:

1. an observed product need is recorded and a separate implementation proposal is reviewed;
2. both grant invocation and the grant-management surface pass the applicable cases of the Untrusted Content Adversarial Corpus, including the grant-induction category, with mutation proof.

### D5. Temporary voice write containment

Until a capability-specific voice approval contract exists and passes the corpus, a turn whose input modality is not `typed` MUST NOT resolve write authority.

- Every chat request from the production client carries `inputModality` with one of `typed`, `voice` or `action`.
- A missing or unrecognized `inputModality` is treated as not `typed`.
- Write authority resolution points in scope are those live on `b30c756`: Calendar move execution, user continuity capture persistence, Product Gap resolution commit and Product Gap supersession commit.
- On a non-`typed` turn, those points perform no provider write, no durable persist and no consumption of any pending write authorization. They return a fixed deterministic reply directing the user to confirm by typing. A pending write authorization that was valid before the voice turn remains valid for a later typed confirmation within its existing lifetime.
- Read authority, including `calendar.read` ASK and confirmation, is unaffected by D5.
- Voice may still discuss and prepare write proposals.

The modality field is first-party client metadata and is not an adversarial security boundary. The production client MUST report the actual input source. Missing or unrecognised modality fails closed for write authority. This containment prevents voice-originated write confirmation through supported JARVIS clients; protection against a compromised or deliberately modified client is outside this ADR.

## Authority invariants

These hold for explicit one-shot authority and for any future named grant.

1. **Server-owned.** Authority-defining fields are created and interpreted only by deterministic server code.
2. **Structurally bounded.** Operation, target, scope, timing and trigger are explicit data, never semantic interpretation.
3. **Non-inheriting.** Authority for one operation never implies authority for another operation, target, capability or later context.
4. **Not from content.** Untrusted source content may inform model-authored text but never creates or alters authority state.
5. **Not from the model.** A model may propose an operation but never issues, widens, renews, reinterprets or proposes grant changes.
6. **Atomic consumption.** One-shot authority is consumed atomically on use and cannot be reused.
7. **Fail closed.** Missing, expired, malformed, ambiguous, revoked, consumed or unavailable authority yields no execution.
8. **Restart-safe.** Any durable implementation preserves consumption and expiry across restart. Consumed stays consumed; expired stays expired.

## Rejected alternatives

**Option A (remove both).** Smallest surface, but leaves observed repeated-consent friction with no bounded remedy. Rejected because a named grant under D2 and D3 can be bounded in ways a standing grant cannot.

**Option B (retain both).** Maximum flexibility, but admits authority that persists across turns without a current-turn trigger. Rejected because it weakens non-inheritance and cannot be constrained under hostile or changing context.

## Consequences

- Doctrine aligns with implemented non-inheritance.
- Morning Brief and similar routines keep a route to lower friction without standing authority.
- Named grants need a new object type, lifecycle and grant-management surface before any use.
- Voice loses the ability to confirm the four in-scope write paths until a voice approval contract exists. Voice continuity capture ("remember that...") now asks the user to type it.
- Historical sprint documents that mention standing grants are preserved unchanged as records; this ADR governs from its acceptance forward.

## Reconciliation targets

Normative/current-state documents amended in the same PR:

| File | Post-#593 target | Change |
|---|---|---|
| `docs/architecture/JARVIS-NORTH-STAR-AUTHORITY-ARCHITECTURE-v0.1.md` | sections 2 and 3 | Section 2 aligned to D2 and D3; section 3 marked removed by ADR-0027 with original text retained as struck history; source list reduced to four |
| `docs/architecture/ADR-0025-operation-level-authority-before-acquisition.md` | "Named and standing grants"; migration item 7 | Add "Amended by ADR-0027" notes; do not rewrite accepted historical text |
| `docs/AUTHORITY-MIGRATION-STATUS.md` | current reconciliation paragraph; authority-source rows; migration sequence | Flip planned reconciliation to current doctrine; standing grants removed; named grants note D4 gate; migration item renamed |
| `docs/architecture/ROADMAP.md` | Morning Executive Orientation exclusion and Step A | Replace obsolete standing-authority wording and mark Step A landed only on merge |
| `docs/architecture/DOCUMENTATION-STATUS.md` | current reconciliation boundary | Replace the pre-ADR deferral with the accepted ADR-0027 authority-source decision |
| `lib/lighter-jarvis/gmail-standing-authority.ts` and its test | reply constant | Wording no longer implies standing authority is obtainable by another route |

## Acceptance

ADR-0027 is complete when all of the following hold on `main`:

1. Every normative target above is reconciled; no normative document describes standing grants as a permitted source.
2. The **authority-path matrix** (`docs/architecture/AUTHORITY-PATH-MATRIX.md` and `lib/lighter-jarvis/authority-path-matrix.test.ts`) covers every live authority path: `calendar.read`, `gmail.search`, `gmail.read`, `drive.search`, `drive.read`, Gmail invitation-decline drafting re-read, `calendar.event.move`, user continuity capture, Product Gap resolution and Product Gap supersession. For each path it identifies the replay and non-inheritance proof or an executable finding.
3. Voice write containment (D5) is implemented, with tests proving for each in-scope write point that a `voice`, `action` or missing-modality turn causes no provider write, no persist and no consumption, and that a subsequent `typed` confirmation still succeeds within the original lifetime.
4. Full battery passes: tests, typecheck, lint, build.
