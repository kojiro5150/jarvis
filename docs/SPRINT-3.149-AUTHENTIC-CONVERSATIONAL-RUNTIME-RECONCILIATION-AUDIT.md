# Sprint 3.149 — Authentic Conversational Runtime Reconciliation Audit

## 1. Audited baseline

- **Exact audited main SHA:** `2348d2bc90575633cbadf90900e1f43a31f48c80`.
- **Audit start:** `2026-08-27T02:12:45Z` (UTC).
- At audit start, the checkout was branch `work`, its `HEAD` was exactly the requested baseline, the working tree was clean, and the baseline was therefore fixed without substitution.
- **Production code changed during audit:** no. This sprint changes this document only; no tests or production files are changed.
- **Production behavior is unchanged.** Every code citation below names the immutable audited commit, not the documentation commit.

Evidence notation in this document is `Commit; File; Symbol; Lines`. All entries use commit `2348d2bc90575633cbadf90900e1f43a31f48c80` (abbreviated **B** only in tables after this declaration).

## 2. Executive runtime summary

### OBSERVED

- The root page selects between two genuinely different clients: `UnifiedOpsConsole` in governed console mode and `DashboardShell` otherwise (B; `app/page.tsx`; `Home`; lines 10–17).
- The governed console submits both typed text and voice transcripts through `submitMessage` to `/api/lighter/chat`; voice is serialized by `VoiceTurnQueue` (B; `components/console/UnifiedOpsConsole.tsx`; `submitMessage`, `send`, `voiceTurnHandlerRef`; lines 313–457).
- `/api/lighter/chat` delegates to one handler that runs deterministic JARVIS private-capability resolvers in the order Drive read, Drive search, Gmail search, Gmail read, Calendar read before any ordinary model call (B; `app/api/lighter/chat/route.ts`; `POST`; lines 1–6; B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; lines 191–285).
- An intercepted private result is formatted and returned directly. It is not supplied to the ordinary model in that turn (B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; lines 213–281).
- If no deterministic branch handles the turn, the handler sanitizes model history, invokes the selected model/specialist, validates handoff output, applies private-handoff and ordinary-reply guards, and returns text (B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; lines 307–373).
- The alternate dashboard client submits to `/api/chat`, whose ordinary path assembles BOA/agent instructions and calls the audited Claude execution path (B; `lib/useAgentConversation.ts`; `useAgentConversation.send`; lines 31–56; B; `app/api/chat/route.ts`; `POST`; lines 87–119).

### INFERRED (bounded by cited reachability)

- `/api/lighter/chat` is the canonical governed conversational contract **only when** `CONSOLE_PRESENTATION_MODE` selects `GOVERNED`; `/api/chat` remains production-reachable through the alternate root rendering branch (B; `app/page.tsx`; `Home`; lines 10–17; B; `components/dashboard/DashboardShell.tsx`; `DashboardShell`; lines 65–77).
- There is no single runtime object that assembles authorized Calendar/Gmail/Drive evidence into ordinary JARVIS reasoning. Private branches return before `sanitizeModelHistory` and `callModel`; specialist relay is a separate model-visible contract (B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; lines 213–281, 292–329).

### UNKNOWN

- Repository code does not establish the deployed value of `CONSOLE_PRESENTATION_MODE`; therefore which client contract a particular deployment exposes is unresolved (B; `app/page.tsx`; `Home`; lines 10–17).
- The admitted lower non-Gmail `/api/chat` capability is statically known to be exactly `executive_context`; what repository code cannot establish is whether an external/deployed caller invokes it (B; `lib/chat-capabilities/router.ts`; `parseChatCapabilityRequest`; lines 7–13; B; `app/api/chat/route.ts`; `POST`; lines 47–81).
- The module-private in-memory pending registry has no persistence or cross-instance coordination in the cited implementation; repository unit tests prove process-local behavior, not deployment topology/restart reliability (B; `lib/lighter-jarvis/pending-authorization.ts`; `pendingAuthorizations`; lines 48–60).

## 3. End-to-end runtime map

`D` = deterministic, `M` = model-controlled, `C` = client-controlled. Authority values use the required vocabulary. Each test citation is also at B.

| # / Stage | Commit / file / symbol / exact lines | Caller → callee / next | Control | Private evidence | Authority role | Status | Relevant tests | Finding IDs |
|---|---|---|---|---|---|---|---|---|
| 1 Root runtime selection | B; `app/page.tsx`; `Home`; 10–17 | Next page render → governed console or dashboard | C (environment-selected presentation) | no | absent | unresolved | No direct root-selection test located; selector behavior is tested indirectly by `lib/dashboard-presentation-selection.test.ts`, 1–50 | F-06, F-19 |
| 2 Governed typed submit | B; `components/console/UnifiedOpsConsole.tsx`; `send`; 389–419 | form 838–862 → `submitMessage` | C | conditional history | represented only | canonical | `components/console/UnifiedOpsConsole.test.ts`, 76–84 | F-01, F-13 |
| 3 Governed voice submit | B; same file; `voiceTurnHandlerRef`/queue; 421–457 | voice session turn → `submitMessage` | C | conditional history | represented only | canonical | `lib/lighter-jarvis/voice-authority-turn-integrity.test.ts`, 23–78 | F-14 |
| 4 Pending transport | B; same file; `submitMessage`; 313–373 | client state → `/api/lighter/chat` | C | conditional history | represented only | canonical | `lib/lighter-jarvis/voice-authority-turn-integrity.test.ts`, 49–78 | F-03 |
| 5 Route export | B; `app/api/lighter/chat/route.ts`; `POST`; 1–6 | HTTP POST → created handler | D | conditional | consumed | canonical | `app/api/lighter/chat/route.test.ts`, 81–213 | F-01 |
| 6 Parse/validate/current utterance | B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; 194–212 | route → resolvers | D | conditional transcript | represented only | canonical | `app/api/lighter/chat/route.test.ts`, 109–213 | F-02 |
| 7 Drive read | B; same; returned `POST`; 213–216 | current utterance → `resolveProductionDriveRead` → response | D | conditional/full text | decided | canonical | `lib/lighter-jarvis/drive-read-route-regression.test.ts`, 20–118 | F-04, F-09 |
| 8 Drive search | B; same; returned `POST`; 217–230 | current utterance/reference → resolver → response | D | conditional metadata/IDs | decided | canonical | `lib/lighter-jarvis/drive-search-regression.test.ts`, 37–165 | F-04, F-08 |
| 9 Gmail search | B; same; returned `POST`; 231–244 | current utterance/reference → resolver → response | D | conditional IDs | decided | canonical | `app/api/lighter/chat/route.test.ts`, 234–343 | F-04, F-08 |
| 10 Gmail read | B; same; returned `POST`; 245–258 | current utterance/reference → resolver → response | D | conditional requested content | decided | canonical | `app/api/lighter/chat/route.test.ts`, 446–527 | F-04, F-09 |
| 11 Calendar read | B; same; returned `POST`; 259–281 | current utterance/reference → resolver → deterministic formatter/response | D | conditional event times | decided | canonical | `app/api/lighter/chat/route.test.ts`, 530–608 | F-04, F-08 |
| 12 Ordinary history boundary | B; same; returned `POST`; 316–322 | unhandled turn → sanitization → model | D | excluded/replaced | absent | canonical | `app/api/lighter/chat/route.test.ts`, 318–393 | F-10 |
| 13 Prompt/tools assembly | B; same; returned `POST`; 307–315 | specialist + relay → prompt/tools | D | relay conditional | absent | canonical | `lib/lighter-jarvis/runtime.test.ts`, 6–49 | F-11 |
| 14 Ordinary model invocation | B; same; returned `POST`; 318–324 | sanitized messages → `callModel` | M | no deterministic private release; relay conditional | absent | canonical | `app/api/lighter/chat/route.test.ts`, 350–393 | F-11, F-16 |
| 15 Specialist proposal parsing | B; same; returned `POST`; 335–370 | model tool block → validated route/task summary | M then D validation | no | absent | canonical | `app/api/lighter/chat/route.test.ts`, 879–959 | F-05, F-12 |
| 16 Private handoff suppression | B; same; returned `POST`; 345–357 | utterance/taskSummary/history deny signal → blocked response | D (model can trigger deny-side input) | no | absent | canonical | `app/api/lighter/chat/route.test.ts`, 968–1098 | F-05 |
| 17 Final ordinary reply guard | B; same; returned `POST`; 372–373 | model reply → response | D | no | absent | canonical | `lib/lighter-jarvis/ordinary-model-reply-guard.test.ts`, 11–107 | F-12 |
| 18 Specialist execution/relay | B; `components/console/UnifiedOpsConsole.tsx`; `confirmHandoff`; 459–540 | user confirmation → specialist call → JARVIS relay call | C then M | specialist reply conditional | absent | canonical | `components/console/UnifiedOpsConsole.test.ts`, 23–29 | F-13, F-16 |
| 19 Governed rendering | B; same; message render/composer; 746–862 | conversation state → paragraph/UI | C/presentation | yes, when deterministic reply retained | represented only | canonical | `components/console/UnifiedOpsConsole.test.ts`, 76–84 | F-13 |
| 20 Legacy dashboard submit | B; `lib/useAgentConversation.ts`; `send`; 31–56 | dock → `/api/chat` | C | no governed acquisition | absent | legacy/parallel | `app/api/chat/route.test.ts`, 54–77 | F-06 |
| 21 Legacy route parse/Gmail gate | B; `app/api/chat/route.ts`; `POST`; 39–52 | raw JSON → hard containment response | D | no | consumed | legacy/parallel | `app/api/chat/route.test.ts`, 79–137 | F-07 |
| 22 Lower capability router | B; `lib/chat-capabilities/router.ts`; `parseChatCapabilityRequest`; 7–13; B; `app/api/chat/route.ts`; `POST`; 47–81 | Gmail gate → parser admitting `executive_context` or gated Gmail only → `routeChatCapability` | D | no for `executive_context`; Gmail contained | absent for `executive_context` | legacy/parallel | `lib/chat-capabilities/router.test.ts`, 22–52; `app/api/chat/route.test.ts`, 79–137 | F-07, F-15, F-25 |
| 23 Legacy ordinary model | B; same; `POST`; 87–119 | messages → audited Claude execution → JSON | M | no implicit OperationalState | absent | legacy/parallel | `app/api/chat/route.test.ts`, 54–77 | F-06, F-18 |
| 24 Dashboard final rendering | B; `components/dashboard/ConversationDock.tsx`; `handleSubmit`/message rendering; 183–188, 233–256 | input → `onSend`; messages → `AgentDocument` | C/presentation | no governed acquisition | absent | legacy/parallel | `app/api/chat/route.test.ts`, 54–77 | F-06, F-18 |

**Map count: 24 entries.** Each definition above was followed to its production caller/consumer; tests listed are evidence checks, not callers.

## 4. Authority map

| Capability | Proposal → authorization/confirmation → policy/acquisition/release (all B) | Proven boundary |
|---|---|---|
| `calendar.read` | `lib/lighter-jarvis/production-calendar-read.ts`; `resolveProductionCalendarRead`; 40–94. Exact/implicit proposal is formed at 71–75; raw utterance is evaluated at 77–80; ALLOW constructs acquisition dependencies at 81–89; ASK creates pending state at 91–93. A carried reference instead resolves and only constructs the connector inside the authorized acquisition callback at 44–68. | The current raw utterance and server-stored operation decide authority; connector construction follows ALLOW. Tests: `production-calendar-read.test.ts`, 15–90. |
| `gmail.search` | `lib/lighter-jarvis/production-gmail-search.ts`; `resolveProductionGmailSearch`/`execute`; 15–50. A pending reference resolves with expected capability at 16–26; natural language creates ASK/pending without execution at 28–32; exact grammar evaluates at 34–39; connector search occurs only in `execute`, 42–49. | Search returns IDs only and does not chain to read. Capability mismatch returns unhandled. Tests: `production-gmail-search.test.ts`, 7–94. |
| `gmail.read` | `lib/lighter-jarvis/production-gmail-read.ts`; `resolveProductionGmailRead`/`retrieveAuthorized`; 45–111. Only exact identified-message grammar or a carried pending reference is intercepted at 49–73; fields are closed at 74–84; raw utterance authority is evaluated at 85–93; policy and connector are created only after ALLOW at 96–110. | A bare ID does not match the command prefix/exact grammar. Search authority is not read authority because pending mismatch returns unhandled at 54–69. Tests: `production-gmail-read.test.ts`, 13–105. |
| `drive.search` | `lib/lighter-jarvis/production-drive-search.ts`; `resolveProductionDriveSearch`/`execute`; 15–48. Exact command evaluates before execution at 16–22; reference resolves for expected capability at 24–32; natural language produces ASK/pending at 34–37; metadata connector runs at 40–47. | Search is metadata-only and gives no read grant. Tests: `production-drive-search.test.ts`, 7–90. |
| `drive.read` | `lib/lighter-jarvis/production-drive-read.ts`; `resolveProductionDriveRead`/`acquire`; 14–34. Only `drive.read <provider-file-id> [text]` matches; exact raw text authority precedes immutable content policy, OAuth check, connector creation, ID/MIME verification, and deterministic complete release. | Bare IDs, confirmations, anaphora, and search results do not enter this resolver; no pending flow exists. Tests: `drive-read-route-regression.test.ts`, 20–118. |

### Shared PendingAuthorization proof

- `createPendingAuthorization` stores the exact proposed operation in a module-private map and releases only an opaque UUID reference (B; `lib/lighter-jarvis/pending-authorization.ts`; `createPendingAuthorization`; lines 48–62).
- `resolvePendingAuthorization` validates that reference, retrieves server state, checks expected capability, enforces one-shot status, and accepts only the closed confirmation/decline grammar from the current raw utterance (B; same file; `resolvePendingAuthorization`; lines 68–117).
- The client transports only the opaque reference and rejects stale response ordering; it never reconstructs the operation (B; `lib/lighter-jarvis/client-authority-turn-state.ts`; `ClientAuthorityTurnState`; lines 1–20; B; `components/console/UnifiedOpsConsole.tsx`; `submitMessage`; lines 318–365).
- `taskSummary` is read only after all private resolvers and can produce a specialist route or deny-side suppression, not a positive private grant (B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; lines 213–281, 335–368).

## 5. Evidence/context map

| Evidence | Entry, isolation, and model visibility proof (B) |
|---|---|
| Calendar | Connector evidence enters `resolveProductionCalendarRead` after ALLOW (`lib/lighter-jarvis/production-calendar-read.ts`; 40–89), is deterministically formatted and returned (`lib/lighter-jarvis/chat-handler.ts`; `formatCalendarReadResponse`/returned `POST`; 143–177, 275–281), so that turn never reaches ordinary model invocation at 318–322. |
| Gmail search | Provider IDs enter in `execute` and are deterministically listed (`lib/lighter-jarvis/production-gmail-search.ts`; 42–49); the route immediately returns them (`lib/lighter-jarvis/chat-handler.ts`; 231–244). |
| Gmail read | Requested content enters through the policy adapter and is deterministically field-presented (`lib/lighter-jarvis/production-gmail-read.ts`; `present`/`retrieveAuthorized`; 32–41, 96–110); the route immediately returns it at `chat-handler.ts`, 245–258. |
| Drive search | Metadata and original provider IDs enter and are deterministically listed (`lib/lighter-jarvis/production-drive-search.ts`; `execute`; 40–47); route return is `chat-handler.ts`, 217–230. |
| Drive read | Full Google Doc text enters only after policy/OAuth and exact file/MIME checks and is returned verbatim with ID (`lib/lighter-jarvis/production-drive-read.ts`; `acquire`; 22–33); route return is `chat-handler.ts`, 213–216. |
| Prior history | Deterministic private assistant releases are replaced; prior exact Gmail/Drive read requests are replaced; after governed Drive history prior provider-ID-like follow-ups are replaced; every other message—including the current user turn—is copied (`lib/lighter-jarvis/model-history-boundary.ts`; `sanitizeModelHistory`; 41–65). |
| Ordinary model context | It contains the built specialist system prompt and sanitized transcript, plus tools where applicable (`lib/lighter-jarvis/chat-handler.ts`; returned `POST`; 307–324). It does **not** receive the intercepted current-turn private results because those branches return at 213–281. |
| Specialist relay | A confirmed specialist reply becomes JSON embedded in JARVIS's system prompt (`lib/lighter-jarvis/runtime.ts`; `buildSpecialistPrompt`; 14–40) and therefore is model-visible; this is not Calendar/Gmail/Drive governed evidence assembly. |

**Observed disposition:** there is no canonical unified “governed context assembly” object on this production path. Evidence is either deterministic-release-only or specialist-relay context; this statement is limited to the complete pre-model returns and sole model call cited above.

## 6. Model-control map

| Model output/input | Positive authority | Deny-side | Connector/policy/evidence/provenance | Routing/presentation proof (B) |
|---|---|---|---|
| Proposal/intent for private capabilities | No: deterministic resolvers consume raw utterance before model (`chat-handler.ts`; 206–281). | Ordinary generated confirmation language can be neutralized (`ordinary-model-reply-guard.ts`; `guardOrdinaryModelReply`; 64–74). | Cannot reach connector selection on an intercepted private turn. | Unsupported private prose may reach ordinary presentation. |
| `taskSummary` | No. | Yes: private classifier examines it (`chat-handler.ts`; 340–357). | No acquisition/policy/evidence selection; it may carry model-written prose to a specialist after user confirmation. | Selects proposed specialist task at 359–368 and client consumes it at `UnifiedOpsConsole.tsx`, 408–417. |
| Specialist selection/market scopes | No private authority. | Invalid target/summary/scopes suppress routing (`chat-handler.ts`; 337–369). | GECKO scopes deterministically constrain web domains, not Google private connectors (`chat-handler.ts`; 286–315). | Model tool output proposes `routeTo`; client confirmation controls execution (`UnifiedOpsConsole.tsx`; 459–509). |
| Ordinary reply | No. | Capability/authority/provenance guard can replace text (`ordinary-model-reply-guard.ts`; 70–103). | Cannot alter already-returned private releases; may make claims only subject to regex guard. | Controls reply presentation after guard (`chat-handler.ts`; 372–373). |
| ORACLE/GECKO tool results | No private authority. | “Sourced” is downgraded when evidence verification fails (`chat-handler.ts`; 331–334). | Model tools select public web evidence; domain allow-list constrains GECKO. | Controls specialist response content. |
| Relay synthesis | No. | Relay schema validation is deterministic (`chat-handler.ts`; 292–305). | Specialist reply is model context; fallback guarantees its literal inclusion if model omits it (`chat-handler.ts`; 326–329). | Model controls synthesis wording, not source acquisition. |

## 7. Legacy/parallel runtime map

- **`/api/chat`, actively user-reachable conditionally:** root non-governed presentation renders `DashboardShell`, which calls `useAgentConversation`, which fetches `/api/chat` (B; `app/page.tsx`; `Home`; 10–17; B; `components/dashboard/DashboardShell.tsx`; `DashboardShell`; 65–77; B; `lib/useAgentConversation.ts`; `send`; 31–56).
- **Legacy Gmail capability, contained beneath a fail-closed gate:** raw JSON is parsed at `app/api/chat/route.ts`, `POST`, 39–45; an object whose operation is `governed_gmail_retrieval` returns at 47–52. The Gmail-capable parser/authorization/connector code remains physically and syntactically below at 54–81, but for that operation it is not semantically or production reachable because the earlier predicate returns. Tests exercise raw gate, fabricated pending, and model non-reentry at `app/api/chat/route.test.ts`, 79–137.
- **Lower legacy capability router, statically bounded:** the parser admits exactly `executive_context` and `governed_gmail_retrieval` and rejects every other operation (B; `lib/chat-capabilities/router.ts`; `parseChatCapabilityRequest`; 7–13). The earlier raw-body gate returns for `governed_gmail_retrieval` (B; `app/api/chat/route.ts`; `POST`; 47–52), leaving `executive_context` as the one admitted non-Gmail operation reaching the lower generic router at 54–81. A baseline production-source search (`rg -n 'executive_context|parseChatCapabilityRequest|routeChatCapability' --glob '!docs/**' --glob '!**/*.test.ts' --glob '!**/*.test.tsx' .`) found the route import/calls at `app/api/chat/route.ts`, 9 and 56–80, the parser/router definitions at `lib/chat-capabilities/router.ts`, 7–50, and type declarations at `lib/chat-capabilities/types.ts`, 7–20; it found no in-repository production request constructor or client caller for `capability.operation = "executive_context"`. External/deployed invocation remains unresolved because repository search cannot observe traffic.
- **`/api/lighter/chat`, governed runtime:** its only route export creates `createLighterChatHandler` (B; `app/api/lighter/chat/route.ts`; 1–6), consumed by governed console fetches (B; `components/console/UnifiedOpsConsole.tsx`; `submitMessage`; 313–373).
- **Older agent/coordinator path:** `/api/chat` calls `executeAuditedChat` with the BOA/agent prompt (B; `app/api/chat/route.ts`; `POST`; 103–119); it is parallel to lighter specialist routing, not part of the latter.
- **OperationalState consumers:** dashboard mounts `useOperationalState` and uses it for dashboard/opening presentation (B; `components/dashboard/DashboardShell.tsx`; `DashboardShell`; 65–77; B; `components/dashboard/ConversationDock.tsx`; `openingBriefContent`; 107–181). `/api/chat` ordinary execution receives only agent/messages/systemPrompt and has no OperationalState argument (B; `app/api/chat/route.ts`; `POST`; 103–117). Thus OperationalState influences parallel client presentation, not cited conversational model context.
- **Voice parallelism:** governed console voice transcription enters the same `submitMessage` path (B; `UnifiedOpsConsole.tsx`; 421–457). The dashboard mic hook only captures stream/amplitude and exposes no transcription or chat send (B; `lib/useMicCapture.ts`; `useMicCapture`; 36–125), so it is presentation/listening state rather than a voice conversational runtime.

## 8. Finding register

### F-01
Finding ID: F-01  
Category: Canonical governed runtime behavior  
Observed fact: Governed console turns enter the single lighter handler.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `components/console/UnifiedOpsConsole.tsx`
- Symbol/function: `submitMessage`
- Lines: 313–373
Runtime consequence: Governed typed/voice transcript submission shares one HTTP contract.  
Authority consequence: The client carries, but does not decide, pending authority.  
Evidence/privacy consequence: Full presentation history crosses the route boundary.  
What is NOT proven: That every deployment selects this client.  
Follow-up disposition: none

### F-02
Finding ID: F-02  
Category: Authority / control boundary  
Observed fact: The server derives authority input from the last raw user message before any model call.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: returned `POST`
- Lines: 206–214
Runtime consequence: Model summaries are not the positive-authority input.  
Authority consequence: Current utterance is authoritative input only to deterministic evaluators.  
Evidence/privacy consequence: none observed  
What is NOT proven: Semantic completeness of proposal grammars.  
Follow-up disposition: none

### F-03
Finding ID: F-03  
Category: Authority / control boundary  
Observed fact: Pending operations are server-owned, opaque, capability-bound, and one-shot.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/pending-authorization.ts`
- Symbol/function: `createPendingAuthorization`, `resolvePendingAuthorization`
- Lines: 48–117
Runtime consequence: A client-crafted operation or bare confirmation cannot reconstruct a grant.  
Authority consequence: Explicit current-turn confirmation consumes the exact stored proposal.  
Evidence/privacy consequence: none observed  
What is NOT proven: Cross-process durability.  
Follow-up disposition: unresolved ambiguity

### F-04
Finding ID: F-04  
Category: Canonical governed runtime behavior  
Observed fact: Five private capability resolvers precede ordinary model invocation and return handled results directly.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: returned `POST`
- Lines: 213–285
Runtime consequence: Deterministic private releases bypass ordinary reasoning.  
Authority consequence: Authority is decided before private connector use.  
Evidence/privacy consequence: Current private evidence is not placed in ordinary model context.  
What is NOT proven: A unified evidence-reasoning path.  
Follow-up disposition: none

### F-05
Finding ID: F-05  
Category: Authority / control boundary  
Observed fact: Model handoff output can propose routing and activate deny-side private suppression, but cannot grant private acquisition.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: handoff handling in returned `POST`
- Lines: 335–369
Runtime consequence: Valid non-private recommendations reach client confirmation; private recommendations are blocked.  
Authority consequence: Positive private authority remains outside model output.  
Evidence/privacy consequence: Model-written taskSummary cannot route around private isolation.  
What is NOT proven: Completeness of lexical private-request detection.  
Follow-up disposition: none

### F-06
Finding ID: F-06  
Category: Legacy or parallel runtime behavior  
Observed fact: The root can render a dashboard client that calls `/api/chat` instead of `/api/lighter/chat`.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `app/page.tsx`
- Symbol/function: `Home`
- Lines: 10–17
Runtime consequence: Two live conversation contracts coexist behind presentation selection.  
Authority consequence: The dashboard ordinary path does not expose the five lighter resolvers.  
Evidence/privacy consequence: none observed  
What is NOT proven: Which mode is deployed.  
Follow-up disposition: unresolved ambiguity

### F-07
Finding ID: F-07  
Category: Legacy or parallel runtime behavior  
Observed fact: `/api/chat` parses raw JSON then hard-returns legacy Gmail unavailable before physically present Gmail authorization/acquisition code.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `app/api/chat/route.ts`
- Symbol/function: `POST`
- Lines: 39–81
Runtime consequence: The lower Gmail branch is syntactically present but semantically unreachable for the gated operation.  
Authority consequence: Legacy Gmail cannot create or resume authority.  
Evidence/privacy consequence: Legacy Gmail connector construction is contained.  
What is NOT proven: Whether an external or deployed caller invokes the one admitted non-Gmail operation, `executive_context`.
Follow-up disposition: none

### F-08
Finding ID: F-08  
Category: Evidence / acquisition boundary  
Observed fact: Calendar, Gmail search, and Drive search releases are deterministic and return without ordinary model synthesis.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: returned `POST`
- Lines: 217–244, 259–281
Runtime consequence: Search IDs/metadata and Calendar times are endpoint-produced final answers.  
Authority consequence: none observed  
Evidence/privacy consequence: Evidence does not enter the ordinary model on that turn.  
What is NOT proven: Later client replay cannot contain the presentation text; sanitization addresses recognized shapes only.  
Follow-up disposition: none

### F-09
Finding ID: F-09  
Category: Evidence / acquisition boundary  
Observed fact: Gmail read and Drive read apply resource/content policy after authority and release selected/full content deterministically.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/production-gmail-read.ts`
- Symbol/function: `retrieveAuthorized`
- Lines: 96–110
Runtime consequence: Gmail policy denial prevents release; Drive uses its separately cited immutable policy (`production-drive-read.ts`, 22–33).  
Authority consequence: Policy does not manufacture authority.  
Evidence/privacy consequence: Released content is client-visible but bypasses model.  
What is NOT proven: A common policy abstraction across providers.  
Follow-up disposition: none

### F-10
Finding ID: F-10  
Category: Context / model boundary  
Observed fact: Prior deterministic private results and selected prior governed request/ID shapes are replaced while ordinary history and the current user turn remain.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/model-history-boundary.ts`
- Symbol/function: `sanitizeModelHistory`
- Lines: 41–65
Runtime consequence: The ordinary model sees placeholders, not recognized released values.  
Authority consequence: Sanitized history is downstream of authority.  
Evidence/privacy consequence: Isolation is content-derived rather than attested metadata.  
What is NOT proven: Recognition of every possible provider output mutation.  
Follow-up disposition: none

### F-11
Finding ID: F-11  
Category: Context / model boundary  
Observed fact: Ordinary model context consists of a specialist prompt, sanitized transcript, and optional tools; no unified governed evidence object is passed.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: returned `POST`
- Lines: 307–324
Runtime consequence: Ordinary JARVIS cannot reason over current deterministic private evidence.  
Authority consequence: none observed  
Evidence/privacy consequence: Private evidence is isolated by branch return rather than context-level field governance.  
What is NOT proven: That no future/dynamic prompt provider adds other text; only cited builder inputs are proven.  
Follow-up disposition: none

### F-12
Finding ID: F-12  
Category: Context / model boundary  
Observed fact: A deterministic post-model guard replaces private confirmation language, Drive provenance claims, false global capability denials, and leaked markers in matched cases.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/ordinary-model-reply-guard.ts`
- Symbol/function: `guardOrdinaryModelReply`
- Lines: 64–103
Runtime consequence: Model text is not returned wholly unchecked.  
Authority consequence: Model confirmation prose is not authority.  
Evidence/privacy consequence: Recognized fabricated Drive provenance is contained.  
What is NOT proven: Semantic truthfulness beyond enumerated patterns.  
Follow-up disposition: none

### F-13
Finding ID: F-13  
Category: Client / presentation boundary  
Observed fact: The governed client stores server reply text in per-specialist conversation state and renders it directly as a paragraph.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `components/console/UnifiedOpsConsole.tsx`
- Symbol/function: `submitMessage` and message rendering
- Lines: 359–373, 746–790
Runtime consequence: Final wording is server-owned; client adds speaker/error/handoff chrome.  
Authority consequence: Client-rendered authority metadata is not used to grant.  
Evidence/privacy consequence: Deterministic private replies remain in client presentation history.  
What is NOT proven: Persistence beyond component lifetime.  
Follow-up disposition: none

### F-14
Finding ID: F-14  
Category: Client / presentation boundary  
Observed fact: Voice transcript and typed input converge on `submitMessage`; voice turns are queued by capture identity.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `components/console/UnifiedOpsConsole.tsx`
- Symbol/function: `send`, `voiceTurnHandlerRef`, voice queue effect
- Lines: 389–457
Runtime consequence: There is no voice-specific server authority evaluator.  
Authority consequence: Equivalent transcript text reaches the same raw-utterance boundary.  
Evidence/privacy consequence: none observed  
What is NOT proven: Transcription accuracy.  
Follow-up disposition: none

### F-15
Finding ID: F-15
Category: Legacy or parallel runtime behavior
Observed fact: The lower `/api/chat` parser statically admits exactly `executive_context` and `governed_gmail_retrieval`; the route's earlier raw-body Gmail gate leaves `executive_context` as the only admitted non-Gmail operation that can reach generic capability routing.
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/chat-capabilities/router.ts`; `app/api/chat/route.ts`
- Symbol/function: `parseChatCapabilityRequest`; `POST`
- Lines: 7–13; 47–52 and 54–81
Runtime consequence: The parallel lower capability surface is statically bounded to `executive_context`; all other non-Gmail operation values return unknown-operation, while governed Gmail is contained by the earlier gate.
Authority consequence: `executive_context` does not enter the Gmail authority subbranch; none observed beyond its validated snapshot/computation-window input.
Evidence/privacy consequence: The admitted operation derives executive context; the gated Gmail operation cannot construct its connector through this route.
What is NOT proven: Whether an external or deployed caller invokes the admitted `executive_context` operation.
Follow-up disposition: none

### F-16
Finding ID: F-16  
Category: Client / presentation boundary  
Observed fact: User confirmation of a handoff causes a specialist model call followed by a JARVIS synthesis model call containing the specialist reply.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `components/console/UnifiedOpsConsole.tsx`
- Symbol/function: `confirmHandoff`
- Lines: 459–526
Runtime consequence: “One response” is client-orchestrated across two server invocations.  
Authority consequence: Confirmation authorizes handoff UX, not private connector authority.  
Evidence/privacy consequence: Specialist reply becomes JARVIS model context.  
What is NOT proven: Durable lineage between the two calls.  
Follow-up disposition: none

### F-17
Finding ID: F-17  
Category: Evidence / acquisition boundary  
Observed fact: Drive read verifies exact returned file ID and MIME and refuses size/MIME failures rather than truncating.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/production-drive-read.ts`
- Symbol/function: `acquire`
- Lines: 22–33
Runtime consequence: Provider provenance is bound at deterministic acquisition/release.  
Authority consequence: none observed  
Evidence/privacy consequence: Complete content is released only within the fixed byte policy.  
What is NOT proven: Provenance after arbitrary client alteration.  
Follow-up disposition: none

### F-18
Finding ID: F-18  
Category: Legacy or parallel runtime behavior  
Observed fact: OperationalState supplies dashboard/opening presentation but is absent from `/api/chat` model invocation arguments.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `components/dashboard/ConversationDock.tsx`
- Symbol/function: `openingBriefContent`
- Lines: 107–181
Runtime consequence: Residual OperationalState influence is presentation-parallel, not implicit chat model context.  
Authority consequence: none observed  
Evidence/privacy consequence: Dashboard opening prose may display state outside conversational acquisition.  
What is NOT proven: Whether users interpret opening prose as conversation history.  
Follow-up disposition: none

### F-19
Finding ID: F-19  
Category: Unresolved ambiguity  
Observed fact: Runtime client selection depends on an environment value not fixed in repository code.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `app/page.tsx`
- Symbol/function: `Home`
- Lines: 10–17
Runtime consequence: Static audit cannot identify the user-facing runtime of an unspecified deployment.  
Authority consequence: Deployment may expose a client without lighter private authority paths.  
Evidence/privacy consequence: Deployment may expose different context/presentation behavior.  
What is NOT proven: Actual deployed environment value.  
Follow-up disposition: unresolved ambiguity

### F-20
Finding ID: F-20  
Category: Unresolved ambiguity  
Observed fact: Pending authorization storage is a module-private in-memory map.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/pending-authorization.ts`
- Symbol/function: `pendingAuthorizations`
- Lines: 48–60
Runtime consequence: Code/tests do not establish behavior across process restart or multiple instances.  
Authority consequence: Fail-closed lookup is proven; availability/reliability is not.  
Evidence/privacy consequence: none observed  
What is NOT proven: Production topology and sticky-session behavior.  
Follow-up disposition: unresolved ambiguity

### F-21
Finding ID: F-21  
Category: Candidate follow-up work  
Observed fact: Authorized private evidence is returned before the only ordinary JARVIS model invocation and no unified evidence context is passed.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/chat-handler.ts`
- Symbol/function: returned `POST`
- Lines: 213–281, 307–324
Runtime consequence: The authentic one-reasoner path is structurally partial.  
Authority consequence: Existing authority boundaries must remain upstream.  
Evidence/privacy consequence: Any future model-visible evidence seam would require explicit release isolation.  
What is NOT proven: That all five evidence types should become model-visible.  
Follow-up disposition: candidate follow-up work reference C-01

### F-22
Finding ID: F-22  
Category: Candidate follow-up work  
Observed fact: Two user-reachable runtime contracts coexist behind root selection.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `app/page.tsx`
- Symbol/function: `Home`
- Lines: 10–17
Runtime consequence: Runtime convergence cannot be claimed.  
Authority consequence: Authority capabilities differ by selected client.  
Evidence/privacy consequence: Context treatment differs by route.  
What is NOT proven: Retirement safety or deployment usage.  
Follow-up disposition: candidate follow-up work reference C-02

### F-23
Finding ID: F-23  
Category: Candidate follow-up work  
Observed fact: Pending confirmation state has no persistence boundary in the implementation.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/pending-authorization.ts`
- Symbol/function: `pendingAuthorizations`
- Lines: 48–60
Runtime consequence: Reliability work is a separable candidate after deployment evidence resolves F-20.  
Authority consequence: Any work must preserve opaque, server-owned, one-shot semantics.  
Evidence/privacy consequence: none observed  
What is NOT proven: That current deployment experiences failures.  
Follow-up disposition: candidate follow-up work reference C-03

### F-24
Finding ID: F-24  
Category: Canonical governed runtime behavior  
Observed fact: Capability truthfulness and Drive provenance containment are post-model, deny/presentation-side controls.  
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `lib/lighter-jarvis/ordinary-model-reply-guard.ts`
- Symbol/function: `guardOrdinaryModelReply`
- Lines: 70–103
Runtime consequence: Matched unsafe/false wording is replaced before response construction.  
Authority consequence: The guard grants no operation.  
Evidence/privacy consequence: Excluded Drive history can suppress provenance claims without restoring IDs/content.  
What is NOT proven: General semantic validation.  
Follow-up disposition: none

### F-25
Finding ID: F-25
Category: Unresolved ambiguity
Observed fact: Baseline repository production-source search finds the `/api/chat` parser/router consumer and type/definition references, but no in-repository production request constructor or client caller setting `capability.operation` to `executive_context`; repository evidence cannot observe external/deployed traffic.
Evidence:
- Commit SHA: `2348d2bc90575633cbadf90900e1f43a31f48c80`
- File: `app/api/chat/route.ts`; `lib/chat-capabilities/router.ts`; `lib/chat-capabilities/types.ts`
- Symbol/function: `POST`; `parseChatCapabilityRequest`, `routeChatCapability`; `ExecutiveContextCapabilityRequest`
- Lines: 9, 54–81; 7–50; 6–10, 17–20
Runtime consequence: The endpoint surface is statically reachable for a valid request, but actual deployed use cannot be classified active or inactive from repository code alone.
Authority consequence: none observed
Evidence/privacy consequence: none observed beyond the statically admitted executive-context computation input/output
What is NOT proven: Whether any deployed or external production caller sends `/api/chat` a capability whose operation is `executive_context`; deployment telemetry or equivalent runtime evidence is required.
Follow-up disposition: unresolved ambiguity

### Finding totals

1. Canonical governed runtime behavior: **3** (F-01, F-04, F-24)
2. Legacy or parallel runtime behavior: **4** (F-06, F-07, F-15, F-18)
3. Authority / control boundary: **3** (F-02, F-03, F-05)
4. Evidence / acquisition boundary: **3** (F-08, F-09, F-17)
5. Context / model boundary: **3** (F-10, F-11, F-12)
6. Client / presentation boundary: **3** (F-13, F-14, F-16)
7. Unresolved ambiguity: **3** (F-19, F-20, F-25)
8. Candidate follow-up work: **3** (F-21, F-22, F-23)

## 9. Unresolved ambiguity register

### A-01 — deployed/external `executive_context` callers (F-25)
- **Known facts:** `parseChatCapabilityRequest` admits only `executive_context` and gated `governed_gmail_retrieval`, so `executive_context` is the sole admitted lower non-Gmail operation (B; `lib/chat-capabilities/router.ts`; `parseChatCapabilityRequest`; 7–13; B; `app/api/chat/route.ts`; `POST`; 47–81). The baseline production-source search command recorded in Section 7 found route/parser/type references but no in-repository request constructor or client caller.
- **Unknown fact:** whether any deployed or external production caller invokes `/api/chat` with `capability.operation = "executive_context"`.
- **Why code/tests cannot resolve it:** static repository search cannot observe external requests or deployed traffic.
- **Evidence needed:** exact-baseline deployment telemetry or equivalent ingress/request evidence identifying the operation without exposing request content.
- **Blocks next migration step:** no; blocks active/inactive classification and legacy-retirement claims for this surface.

### A-02 — selected deployed runtime (F-19)
- **Known facts:** environment selection chooses one of two clients (B; `app/page.tsx`; `Home`; 10–17).
- **Unknown fact:** exact deployed environment value(s).
- **Why code/tests cannot resolve it:** environment is external to the audited commit.
- **Evidence needed:** immutable deployment configuration and exact release SHA for each environment.
- **Blocks next migration step:** no for isolated governed-context work; yes for convergence/retirement.

### A-03 — pending reliability topology (F-20)
- **Known facts:** registry is process memory and lookup fails closed (B; `lib/lighter-jarvis/pending-authorization.ts`; 48–89).
- **Unknown fact:** whether restarts/multi-instance routing break real confirmations.
- **Why code/tests cannot resolve it:** unit process topology is not deployment topology.
- **Evidence needed:** deployment instance/session topology and restart/cross-instance exact-head integration evidence.
- **Blocks next migration step:** no; it blocks claiming durable pending reliability.

## 10. Candidate follow-up register

### C-01 — governed context assembly (F-21)
Proven seam: private authority/acquisition returns at B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; 213–281, while ordinary context/model begins at 307–324. Candidate scope is a typed, release-governed assembly boundary between those seams; no implementation is made here.

### C-02 — runtime convergence evidence (F-22)
Proven seam: root selection at B; `app/page.tsx`; `Home`; 10–17. Candidate is inventory/telemetry-backed convergence planning; deletion or route change is not justified by this audit.

### C-03 — pending reliability evidence/work (F-23)
Proven seam: process-local registry at B; `lib/lighter-jarvis/pending-authorization.ts`; `pendingAuthorizations`; 48–60. Candidate implementation is contingent on resolving A-03; no defect is asserted or repaired.

## 11. Authentic JARVIS gap map

| Aspirational seam | Reality / gap | State | Findings and code proof (B) |
|---|---|---|---|
| YOU → conversational reasoning | Governed typed and voice turns converge, but private capability recognition precedes rather than follows model reasoning. | partial | F-01, F-02, F-14; `UnifiedOpsConsole.tsx`, 313–457; `chat-handler.ts`, 206–281 |
| reasoning → intent/information need | Deterministic proposal grammars coexist with model-produced specialist `taskSummary`; neither is one unified intent object. | parallel | F-02, F-05; `chat-handler.ts`, 206–281, 335–369 |
| intent → AUTHORITY ENGINE | Five resolvers and shared pending state enforce positive authority, but Drive read has a distinct exact-command/no-pending shape. | partial | F-03, F-04; `pending-authorization.ts`, 48–117; `production-drive-read.ts`, 14–34 |
| authority → evidence acquisition | Connector/policy ordering is explicit per capability. | present but dispersed | F-08, F-09, F-17; `production-gmail-read.ts`, 96–110; `production-drive-read.ts`, 22–33 |
| acquisition → GOVERNED CONTEXT ASSEMBLY | Private evidence returns directly; no unified model-visible governed context object exists. | missing | F-11, F-21; `chat-handler.ts`, 213–281, 307–324 |
| governed context → JARVIS reasoning | Ordinary reasoning receives sanitized history, not current private releases; specialist relay is a separate context path. | partial/parallel | F-10, F-16, F-21; `model-history-boundary.ts`, 41–65; `runtime.ts`, 14–29 |
| reasoning → one coherent response | Deterministic private response is coherent but non-reasoned; specialist response is two calls orchestrated by client; ordinary response is guarded. | partial/parallel | F-12, F-16, F-24; `UnifiedOpsConsole.tsx`, 459–526; `ordinary-model-reply-guard.ts`, 70–103 |
| One production runtime | Root can expose lighter or legacy contract; the legacy route statically admits `executive_context`, while external/deployed use is unresolved. | parallel/unresolved | F-06, F-15, F-19, F-22, F-25; `app/page.tsx`, 10–17; `lib/chat-capabilities/router.ts`, 7–13; `app/api/chat/route.ts`, 47–81 |

Architecturally, the authority and deterministic acquisition spine is substantial, while the central aspirational seam—one governed context assembled for JARVIS reasoning—is missing. Runtime and presentation remain parallel. This conclusion is only the composition of the cited gaps; it is not a product-quality score.

## 12. Proposed next-sprint boundary

**Objective:** define and implement the smallest typed governed-context assembly seam for **one already-authorized, already-acquired capability**, preserving deterministic release as the fallback and proving that only explicitly released fields reach JARVIS reasoning.

**Exact boundary:** begin after an existing resolver's ALLOW + policy/acquisition result and end immediately before the existing ordinary model invocation (B; `lib/lighter-jarvis/chat-handler.ts`; returned `POST`; 213–281, 307–324). Start with one capability selected by evidence minimization; selection itself must be specified before implementation rather than assumed by this audit.

**Why this seam is next:** F-21 proves the missing join between a mature authority/acquisition spine and the sole ordinary model context. It is smaller and better evidenced than route retirement, pending persistence, BRIEF_ME, memory authority, or wholesale orchestration redesign.

**Frozen:** all proposal grammars, PendingAuthorization semantics, authority evaluators, connector implementations, OAuth, provider policies, model-history sanitization, handoff guards, ordinary reply guard, legacy routes, client rendering, and deterministic release behavior.

**Explicitly excluded:** runtime convergence/retirement (C-02), pending persistence (C-03), additional capabilities, natural-language `drive.read`, BRIEF_ME grants, memory authority, OperationalState restoration, specialist UX redesign, and North Star redesign.

**Acceptance condition:** an exact-head test proves (1) no connector construction before existing ALLOW, (2) only a named allow-listed evidence projection enters a typed context object, (3) provider IDs/content outside that projection never enter model inputs, (4) denial/failure and all other capabilities retain byte-equivalent current responses, (5) the existing final guard remains downstream, and (6) legacy and client contracts are unchanged.

This document implements no part of that next sprint.
