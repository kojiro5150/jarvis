# JARVIS — Phase 1

Personal AI dashboard shell. Next.js (App Router, TypeScript, Tailwind), deployable free on Vercel. Single-user, not commercial.

## Design Philosophy

**[DESIGN_CONSTITUTION.md](./DESIGN_CONSTITUTION.md) is the canonical source of truth for how JARVIS behaves and how the system is architected.** Read it before adding features or editing agent prompts. If code and constitution ever disagree, fix the code.

Short version, for orientation:

- JARVIS is an operating system, not a chatbot — its job is orchestration, not expertise (Principle 1).
- It demonstrates capability rather than announcing it, never opens with a limitation, and always leaves Sam better positioned than before the response (Principles 2, 4, 7).
- It speaks in executive language — operational picture, priority, recommendation, signal, risk, decision — with calm, unflattering confidence (Principles 5, 6).
- The system has two layers (Principle 8): **Executive Operations** — JARVIS and DAWNWATCH, who maintain situational awareness and orchestrate but aren't subject-matter experts — and **Specialist Intelligence** — ORACLE, HERALD, CO-WORK, STEVE, PHDSS, and MARCUS, each with a bounded function. This is encoded as `tier: "executive" | "specialist"` on `AgentDefinition` (`lib/agents/types.ts`) and drives the grouped sections in `components/AgentRail.tsx`.
- Facts, inferences, recommendations, and unknowns stay distinguishable — never fabricated certainty (Principle 16).

Implementation:

- `lib/agents/persona.ts` — `CHARACTER_RULES` / `withCharacter()`, the shared behavioral rules appended to every agent's system prompt. Tune tone once here rather than per agent.
- `lib/agents/*.ts` — one file per agent, each carrying its role, tier, and system prompt.
- `lib/briefing.ts` — computes each agent's opening state from an `OperationalPicture` (local memory + connectors, see below), no model call, renders instantly. JARVIS's opening brief follows a fixed executive-briefing template (see the comment above `jarvisBrief()`).

One deliberate exception, noted in the constitution: **STEVE** (Engineering and software) is allowed to discuss the actual stack (Next.js, Vercel, Supabase, etc.) because that's literally the job when Sam is in an engineering conversation with him — Principle 3 only restricts *unprompted* architecture talk from the other agents.

## What's in Phase 1

- **v2 UI**: a persistent left agent rail, a top bar, a dashboard column that is always JARVIS's overall operational view (an enlarged central orb with quick actions, then a responsive card grid — DAWNWATCH Briefing, Calendar Snapshot, Communications Snapshot, Projects Overview, Agent Status, Live Intelligence Feed, Voice Interface, JARVIS Memory, Quick Commands), and a fixed-height conversation dock docked across the bottom of the screen (~30–35vh, independent scroll, persistent input, full markdown rendering with collapsible sections for long replies). Selecting a different agent in the rail changes who the dock is talking to — it never changes what the dashboard above it shows; that dashboard is always JARVIS's operational view. See `components/dashboard/DashboardShell.tsx`.
- 8 agents — JARVIS, DAWNWATCH, ORACLE, HERALD, STEVE, CO-WORK, PHDSS, MARCUS — each defined in its own file under `lib/agents/`, with its own system prompt, tier, and accent color.
- `/api/chat` — a server-only route that calls the Claude API. Your Anthropic key never reaches the browser.
- A local, file-backed **project memory** layer (`lib/memory/`) and **Calendar / Gmail / Drive connector interfaces** (`lib/connectors/`) — see "Memory & Connectors" below. Calendar and Gmail both now have real Google connectors (OAuth, read-only); Drive is still local-only — that's future work.
- Voice (ElevenLabs) is stubbed in the UI but not wired up — that's a later phase.

## v2 UI architecture

The redesign is a presentation-layer swap only — **zero backend files changed**. `lib/operational-state.ts`, every file under `lib/connectors/` and `lib/memory/`, `lib/briefing.ts`, `lib/context-builder.ts`, every `lib/agents/*.ts` prompt, the OAuth routes, and every `app/api/*` route are byte-for-byte what Sprint 2.7 (v11) shipped. What changed is how that same data is arranged on screen:

- `components/dashboard/DashboardShell.tsx` — the new top-level layout. Lifts one `useAgentConversation(agent)` instance so both the orb and the conversation dock share the same `loading`/`messages`/`send` without duplicating fetch logic. Owns which agent the rail has selected, and passes the *same* `operationalState` to the dashboard cards, the orb, and the dock — there's still exactly one `OperationalState` per render, per Sprint 2.4.
- `components/dashboard/OrbCenterpiece.tsx` — the enlarged orb (reuses the existing `Orb.tsx` unchanged, just at a bigger size) plus Voice / Search / Brief Me / Focus / Ask JARVIS quick actions. Voice and Search are honest inert placeholders, matching the existing "Voice channel standing by" language rather than pretending those features exist.
- `components/dashboard/ConversationDock.tsx` — fixed-height dock (`clamp(280px, 32vh, 420px)`, i.e. 30–35% of viewport height as requested) across the bottom of the screen, independent scroll region, persistent input bar. The dashboard column above it is a separate scroll container — nothing in the dock can move it.
- `lib/useAgentConversation.ts` — the conversation state/fetch logic extracted from the old `CommandConsole.tsx`, unchanged in behavior (same request shape to `/api/chat`, same error copy), just reusable outside one component.
- `components/markdown/MarkdownMessage.tsx` + `components/ui/CollapsibleSection.tsx` — full Markdown/GFM/syntax-highlighted rendering for every message; responses with two or more `##` headings automatically split into collapsible sections (first one open) instead of one long wall of text.
- New cards replacing the old right-hand `RightPanel.tsx`: `components/cards/VoiceInterfaceCard.tsx`, `QuickCommandsCard.tsx`, and `MemoryGaugeCard.tsx` (same copy/behavior as before, including the exact Calendar/Gmail 3-phrase status language, just relocated into the card grid), plus a new `LiveSystemFeedCard.tsx` that re-presents the same `OperationalState` (latest email, next commitment, leading signal, any non-"online" connector status) as a feed — no new polling, no invented sources.
- `PrioritiesCard.tsx`, `CalendarCard.tsx`, `ProjectsCard.tsx`, `AgentStatusCard.tsx` — visual restyle only, identical props. `CommunicationsCard.tsx` additionally buckets messages into Needs Reply / Waiting / Automated / Information — a client-side reclassification of the existing `EmailMessage` fields (`needsReply`, `important`, `sourceLabel`, sender-address pattern), not a new backend signal. `AgentStatusCard.tsx` now shows real status (thinking / online / standing by) derived from which agent the dock is currently talking to and whether that request is in flight, rather than a static "All Ready" dot for every agent.
- Retired: `CommandConsole.tsx`, `RightPanel.tsx`, `components/cards/SignalsRow.tsx`. Their responsibilities moved into the components above; they're excluded from this package rather than kept as dead code.
- New dependencies, all MIT-licensed, no paid services: `react-markdown`, `remark-gfm`, `rehype-highlight` (plus its transitive `highlight.js`, whose `atom-one-dark` theme is imported in `app/globals.css`).

## Memory & Connectors

Two related but distinct pieces of architecture, both added ahead of any real backing service so the rest of the app is already coded against the right shape:

**Local project memory** (`lib/memory/`) — `schema.ts` defines `MemoryStore` (priorities, projects, signals, plus the sections the local connectors read from). `seed.ts` is the default content. `store.ts` is a server-only, file-backed store (`data/memory.json`, created on first run): `readMemory()`, `writeMemory()`, `updateMemory(patch)`. Reads and writes genuinely persist across requests and `npm run dev` restarts on your machine. They will **not** persist on Vercel — its production filesystem is read-only outside `/tmp`, which doesn't survive between invocations — so writes there fail silently (logged, not thrown) and reads fall back to the seed baked into the deployment. That's intentional graceful degradation, not a bug; real persistence is still the Supabase phase. `app/api/memory` exposes this over HTTP (`GET` / `PATCH`).

**Calendar / Gmail / Drive connectors** (`lib/connectors/`) — one interface per domain (`CalendarConnector`, `GmailConnector`, `DriveConnector`). Drive has only a `LocalDriveConnector`, reading its slice of the local memory store. Calendar and Gmail each have both: a `Local*Connector` and a real `Google*Connector` (`lib/connectors/google/calendar.ts`, `lib/connectors/google/gmail.ts`), selected by each domain's `getXConnector()` factory — nothing above the connector layer (cards, briefing, agent prompts) knows or cares which one is active. The two Google connectors share one token store and one token-refresh helper (`lib/connectors/google/access-token.ts`), since one OAuth grant covers both. `app/api/operational-state` combines memory + all three connectors into the one payload the dashboard and every agent read from.

Each connector is intentionally mapped to the specialist whose domain it is, not treated as generic plumbing: Calendar feeds DAWNWATCH/JARVIS, Gmail feeds HERALD, Drive feeds CO-WORK (`lib/briefing.ts`).

### Connecting Google Calendar + Gmail (real)

Calendar and Gmail share one Google OAuth grant — connecting either one requests both scopes in the same consent screen. Setup:

1. In Google Cloud Console, use (or create) an OAuth 2.0 **Web application** client with the Calendar API **and** the Gmail API both enabled.
2. Add `http://localhost:3000/api/auth/google/callback` as an Authorized redirect URI (and your production URL's equivalent, if deployed).
3. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `.env.local` (see `.env.local.example`).
4. Click **Connect Calendar** or **Connect Gmail** in the dashboard's CONNECTORS panel (both hit the same `/api/auth/google/start`). You'll get Google's consent screen, requesting **only** `calendar.readonly` and `gmail.readonly` — no write, send, or modify access, no other scopes.
5. Tokens are stored server-side in `data/google-tokens.json` (git-ignored, same pattern as `data/memory.json`) — never sent to the browser, never returned by any API response. One token pair backs both connectors (`lib/connectors/google/access-token.ts`).

**Calendar** reads **every calendar the account can see** (via `calendarList.list`, skipping ones hidden or deleted from your own list) — not just `primary` — fetches the next 7 days from each in parallel, and merges the results into one chronological list. Each event keeps its source calendar (`calendarId`, `calendarName`, and `calendarColor` if set), so a "Governance Engineering" event and a personal calendar event both show up, labeled and color-dotted with the calendar they came from.

**Gmail** reads the authenticated account's inbox, excluding promotions/social/spam/trash, and — per Sam's own setup, where `info@governanceengineering.com.au` is a separate address already routed into this same Gmail account — separately queries anything addressed to that mailbox. The two result sets are merged and de-duplicated (an overlap is labeled "Governance Engineering," the more specific and useful attribution), then sorted with unread mail, board/governance keyword matches, Governance Engineering messages, and Gmail's own IMPORTANT marker weighted higher, ties broken by recency. This is genuinely one Google account, not multi-account OAuth — the two labels ("Main Gmail" / "Governance Engineering") describe attribution within a single inbox, detected by recipient address (reliable regardless of how Sam's own Gmail filters are named).

Both merged lists flow into `OperationalState` (`calendar` / `gmailThreads`), which the Calendar card, the Communications Snapshot card, JARVIS's briefing, DAWNWATCH's briefing, and HERALD's drafting context all read from identically. JARVIS/DAWNWATCH mention a calendar or mailbox by name when it's a real Google event/message and that name is actually informative (local mock data doesn't get this treatment — there's only one source there, naming it would just be noise). Still read-only, still no calendar-source or mailbox-source filter (deferred — default is "everything accessible").

The dashboard only ever shows one of three phrases per connector — never a raw OAuth or API error: **"Calendar intelligence online / unavailable / refresh required"** and **"Gmail intelligence online / unavailable / refresh required"**. "Unavailable" covers both "never connected" and "token exists but is missing the Gmail scope" (e.g. reconnecting after upgrading from a Calendar-only grant) — either way the fix is the same Connect button. A single calendar or a single Gmail query failing doesn't trigger any of these on its own — it's just skipped and logged server-side, since the rest of the merged view is still fine.

## Project structure

```
jarvis/
  DESIGN_CONSTITUTION.md    # canonical behavior/architecture doc — read first
  data/
    memory.json               # created at runtime, git-ignored — local project memory
    google-tokens.json         # created on first Google connect, git-ignored — OAuth tokens
  app/
    api/
      chat/route.ts             # server-side Claude call, reads ANTHROPIC_API_KEY
      memory/route.ts           # GET/PATCH raw local memory (priorities/projects/signals)
      operational-state/route.ts    # GET memory + all 3 connectors, consolidated
      auth/google/start/route.ts     # redirects to Google's OAuth consent screen
      auth/google/callback/route.ts  # exchanges code for tokens, stores them, redirects home
    layout.tsx
    page.tsx                # renders <DashboardShell />
    globals.css
  components/
    AgentRail.tsx            # left-hand agent list, grouped by tier; JARVIS doubles as "Dashboard"
    TopBar.tsx                # greeting + clock + status glyphs
    Orb.tsx                    # animated orb, colored per active agent (unchanged, just used larger)
    MemoryEditor.tsx          # operational memory editor modal (unchanged)
    dashboard/
      DashboardShell.tsx        # top-level v2 layout — rail + dashboard column + conversation dock
      OrbCenterpiece.tsx           # enlarged orb + quick actions
      ConversationDock.tsx           # fixed-height bottom dock, independent scroll, persistent input
    markdown/
      MarkdownMessage.tsx        # ReactMarkdown + remark-gfm + rehype-highlight, collapsible sections
    ui/
      CollapsibleSection.tsx      # generic collapsible panel used by MarkdownMessage
    cards/
      PrioritiesCard.tsx
      CalendarCard.tsx
      CommunicationsCard.tsx      # now buckets into Needs Reply / Waiting / Automated / Information
      ProjectsCard.tsx
      AgentStatusCard.tsx            # real thinking/online/standing-by status, not static
      LiveSystemFeedCard.tsx          # new — feed view over existing OperationalState
      VoiceInterfaceCard.tsx            # extracted from the old RightPanel
      QuickCommandsCard.tsx               # extracted from the old RightPanel
      MemoryGaugeCard.tsx                   # extracted + expanded from the old RightPanel
  lib/
    agents/
      types.ts                  # AgentDefinition shape, incl. tier: "executive" | "specialist"
      accent.ts                 # static Tailwind class map per accent color
      persona.ts                 # shared character rules, applied to every agent prompt
      jarvis.ts, dawnwatch.ts, oracle.ts, herald.ts,
      steve.ts, cowork.ts, phdss.ts, marcus.ts   # one file per agent
      index.ts                   # AGENTS list + getAgent(id)
    memory/
      schema.ts                  # MemoryStore shape
      seed.ts                     # default content
      store.ts                     # server-only fs-backed read/write/update
    connectors/
      types.ts                    # record types, ConnectorStatus, CalendarIntelligenceStatus, GmailIntelligenceStatus
      calendar-event.ts             # canonical CalendarEvent shape + normalizers (calendar)
      email-message.ts               # canonical EmailMessage shape + normalizers + priority sort (gmail)
      calendar.ts, gmail.ts, drive.ts   # interface + Local*Connector + factory, one per domain
      index.ts                     # barrel + getConnectorStatuses()
      google/
        tokens.ts                  # server-only fs-backed OAuth token store (data/google-tokens.json)
        oauth.ts                    # auth URL builder, code exchange, token refresh (plain fetch)
        access-token.ts              # shared token-validity/refresh logic (both connectors)
        auth-error.ts                 # shared GoogleServiceAuthError (not_connected | refresh_failed)
        calendar.ts                  # GoogleCalendarConnector — every visible calendar, merged
        gmail.ts                       # GoogleGmailConnector — Main Gmail + Governance Engineering, merged
    operational-state.ts     # canonical OperationalState service — buildOperationalState()
    useOperationalState.ts    # client hook: fetch on mount, seed as instant fallback, refresh()
    useAgentConversation.ts    # conversation state/fetch, lifted out of the old CommandConsole
    claude.ts                    # server-only Anthropic SDK wrapper
    briefing.ts                    # computes each agent's opening brief from an OperationalState
    greeting.ts                    # shared time-of-day greeting (TopBar + briefing.ts)
    placeholder-data.ts     # deprecated re-export shim — see lib/memory/ instead
  .env.local.example
  tailwind.config.ts
  next.config.mjs
```

## Run it locally

```bash
cd jarvis
npm install                      # already run for you if you got this via the assistant
cp .env.local.example .env.local
# edit .env.local and set ANTHROPIC_API_KEY=sk-ant-...
npm run dev
```

Open http://localhost:3000. Click an agent in the left rail, then type into the console — it calls `/api/chat`, which calls Claude server-side with that agent's system prompt.

If the console shows "Intelligence link not established," `.env.local` isn't set (or the dev server needs a restart after editing it).

## Tests

```bash
npm test
```

Runs the Vitest suite under `lib/connectors/__tests__/` — normalization regression coverage for both Google connectors (a Google-shaped event/message fixture, local-record fallback shapes, multi-source merge/priority ordering, and the exact empty-list crash scenarios briefing.ts must never repeat). No network calls; nothing here talks to a real Google API.

## Deploy to Vercel (Free tier)

1. Push this `jarvis/` folder to a GitHub repo (or `vercel` CLI can deploy directly without git).
2. On [vercel.com](https://vercel.com), "Add New Project" → import the repo.
3. In Project Settings → Environment Variables, add `ANTHROPIC_API_KEY` (and leave `ELEVENLABS_API_KEY` blank for now — it's unused in Phase 1). If you want Google Calendar working in production too, also add `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a `GOOGLE_REDIRECT_URI` pointing at your deployed domain's `/api/auth/google/callback` — and add that same URL as an Authorized redirect URI on the OAuth client.
4. Deploy. Vercel's Free (Hobby) tier covers this comfortably — one Next.js app, serverless API route, no database yet.
5. Because Phase 1 has no server session/auth, don't put anything sensitive in placeholder data before you add real auth. It's fine for now since it's static and public only to you via the URL, but Vercel Hobby URLs are reachable by anyone with the link — consider Vercel's password-protection (Pro feature) or wait until real auth exists in a later phase if that matters to you.
6. Note: Vercel's production filesystem is read-only outside `/tmp`, so `data/google-tokens.json` (like `data/memory.json`) won't persist between deployments there — Google Calendar in production would need to reconnect after each redeploy until token storage moves to a real database. Fine for local development, an honest limitation in production.

## Security notes

- `ANTHROPIC_API_KEY` is read only inside `lib/claude.ts` and `app/api/chat/route.ts` — both server-only. It is never sent to the client bundle and is not prefixed with `NEXT_PUBLIC_`.
- The chat route validates input shape/length before calling Claude, and never echoes internal error details (stack traces, key hints) back to the browser.
- `GOOGLE_CLIENT_SECRET` and the stored Google access/refresh tokens (`data/google-tokens.json`) are read only by server-only modules under `lib/connectors/google/` and the `/api/auth/google/*` routes — never sent to the client, never returned in any API response body. The OAuth callback verifies a state cookie before exchanging any code, and never renders a raw OAuth error — every failure path redirects home the same as success, with the real outcome reflected only via `calendarStatus`'s three permitted phrases.
- `.env.local` is git-ignored via `.gitignore`; so is `data/*.json`, which now includes the token file alongside project memory.

## What's deliberately deferred to later phases

- **Supabase Free** for persistent memory/state that actually survives a Vercel deployment (conversation history per agent, and a real replacement for the local `data/memory.json` and `data/google-tokens.json` files, which — see "Memory & Connectors" above — don't persist in production).
- **ElevenLabs** voice input/output — the mic buttons in `VoiceInterfaceCard.tsx` and the conversation dock's input bar are visual placeholders only.
- **Real Drive account** — Calendar and Gmail now both have real Google-backed connectors (see "Connecting Google Calendar + Gmail" above); Drive still only has a local implementation. The same interface + factory pattern applies when that's built.
- **Auth** — Phase 1 assumes single-user, no login. Add this before putting anything sensitive behind the URL.

## Next steps (Phase 2/3 preview)

- Add `@supabase/supabase-js`; swap `lib/memory/store.ts`'s and `lib/connectors/google/tokens.ts`'s fs reads/writes for Supabase queries, keeping the same call sites so nothing upstream changes.
- Add `lib/connectors/google/drive.ts` implementing the existing connector interface against the real Drive API, following the same pattern `calendar.ts` and `gmail.ts` already establish (shared token/refresh helpers, server-only token use, graceful fallback to local on failure). Point `DRIVE_CONNECTOR=google` at it once built.
- Add a calendar-source / mailbox-source filter (deliberately deferred in both Sprint 2.6 and 2.7) — a simple allow-list UI over `calendarList`/label results, since both connectors already fetch per-source before merging.
- Add ElevenLabs TTS: a server route `app/api/speak/route.ts` that takes agent reply text and returns audio, called from `ConversationDock.tsx` after a reply arrives.
- Add simple auth (e.g. a single shared passphrase via middleware) before deploying anywhere public.
