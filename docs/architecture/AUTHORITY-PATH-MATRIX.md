# JARVIS Authority Path Matrix

**Status:** Active proving index under ADR-0027  
**Date:** 2026-09-19  
**Purpose:** Enumerate every live authority-bearing path and bind each to replay and non-inheritance evidence.

| Path | Authority mechanism | Consumption / commit point | Replay outcome | Non-inheritance outcome | Voice outcome | Proving tests |
|---|---|---|---|---|---|---|
| `calendar.read` | explicit utterance or one-shot `PendingAuthorization` | pending confirmation resolver before governed acquisition | consumed/fabricated confirmation fails closed or requires fresh ASK | Calendar authority does not authorize Gmail/Drive/write paths | read confirmation remains allowed from voice | `app/api/lighter/chat/route.test.ts`: “resolves pending Calendar authority before any model call”; “still requires fresh authority after a Calendar recollection”; long-session capability-isolation cases |
| `gmail.search` | exact utterance or one-shot `PendingAuthorization` | pending confirmation before bounded search | same pending reference cannot authorize a second search | carried Gmail pending reference cannot authorize Drive; search does not authorize read | read-only path unaffected by ADR-0027 D5 | `app/api/lighter/chat/route.test.ts`: “asks, then restores and executes…”; “lets a fresh Drive request supersede a carried Gmail pending reference without transferring authority”; frozen search/read vertical |
| `gmail.read` | exact identified-message authority or separate one-shot pending read | exact-message read resolver | consumed/fabricated reference fails closed; fresh authority required | search/result identification does not itself authorize read | read-only path unaffected | `app/api/lighter/chat/gmail-read-usability.test.ts`: list → bind → exact confirmation; `app/api/lighter/chat/route.test.ts`: separate search/read authority |
| `drive.search` | exact utterance or one-shot `PendingAuthorization` | pending confirmation before metadata search | consumed/invalid pending state fails closed | Gmail/Calendar pending state does not transfer | read-only path unaffected | `app/api/lighter/chat/drive-ordinal-continuity.test.ts`; `app/api/lighter/chat/route.test.ts` capability-isolation cases |
| `drive.read` | exact identified-doc utterance or separate pending read after ordinal binding | identified-doc read resolver | result-set or read reference cannot be reused outside its lifecycle | search identifies only; it does not authorize read | read-only path unaffected | `app/api/lighter/chat/drive-ordinal-continuity.test.ts`: search → ordinal → separate confirmation → read; `lib/lighter-jarvis/drive-read-route-regression.test.ts` |
| Gmail invitation-decline drafting re-read | fresh one-shot exact-message `gmail.read` authority inside one frozen drafting class | exact re-read before governed drafting model call | draft/release reuse is contained; fresh re-read required | drafting authority creates no send, persistence or broader drafting authority | no provider write; D5 not applicable | `lib/lighter-jarvis/gmail-invitation-decline-draft-chat-integration.test.ts`: exact two-turn authority and re-read flow |
| `calendar.event.move` | opaque one-shot Calendar move authorization bound to exact proposal | `resolveCalendarMoveAuthorization` immediately before pre-write verification | consumed authorization cannot be reused | read/advice/proposal state does not itself authorize execution | non-typed turns are contained before authorization consumption | `lib/lighter-jarvis/calendar-move-execution.test.ts`; `lib/lighter-jarvis/voice-write-containment.test.ts` |
| user continuity capture | explicit closed current-turn remember/retain instruction; clarification ref where needed | durable Operating Picture persist | repeated operation is a new explicit capture; clarification ref is one-shot | capture intent does not authorize Product Gap or connector writes | non-typed write-shaped turns do not persist or consume clarification state | `lib/operating-picture/production-user-continuity-capture.test.ts`; `lib/lighter-jarvis/voice-write-containment.test.ts` |
| Product Gap resolution | closed list/select flow then one-shot exact target reference plus exact write grammar | target-reference consumption immediately before append-only assertion | consumed target reference rejects replay | Product Gap resolution reference cannot authorize supersession or other writes | non-typed commit utterance is contained before target consumption | `lib/lighter-jarvis/product-gap-resolution-chat-integration.test.ts`; `lib/lighter-jarvis/voice-write-containment.test.ts` |
| Product Gap supersession | closed target/successor selection flow then one-shot exact pair plus exact write grammar | supersession-pair consumption immediately before append-only assertion | consumed pair rejects replay | supersession flow authorizes only the selected lifecycle relation | non-typed commit utterance is contained before pair consumption | `lib/lighter-jarvis/product-gap-supersession-chat-integration.test.ts`; `lib/lighter-jarvis/voice-write-containment.test.ts` |

## Matrix rule

A new live authority path must be added here in the same PR that activates it.

For each row, the proving suite must establish:

1. replay after consumption, expiry or loss of authority does not execute;
2. authority for the row does not authorize another matrix path;
3. where the path is a D5 write point, a non-`typed` turn cannot consume write authority or persist the write.

Where a proving gap is discovered, record it as an executable `it.fails` finding rather than weakening the matrix claim.
