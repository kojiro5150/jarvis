# JARVIS

JARVIS is a personal **Executive Operating System**: one persistent intelligence that combines natural conversation with governed access to private data, durable continuity, deterministic executive cognition, public research, and narrowly authorised action.

> **JARVIS may propose authority-requiring operations. JARVIS may never manufacture the authority to perform them.**
>
> **JARVIS is unconstrained in cognition and constrained in authority.**

The product boundary is:

~~~text
USER ↔ JARVIS
~~~

Named specialists may still exist as internal reasoning or implementation modules, but they are not the user's coordination model and they do not carry independent authority.

## Current state — 1 September 2026

JARVIS is well beyond the original Phase-1 dashboard prototype. The current repository includes a single governed conversational runtime, live Google connectors, a Governed Operating Picture with durable Supabase-backed continuity, bounded public-web research, deterministic executive cognition, and one narrowly verified Calendar action path.

The current product direction is **everyday executive cognition**: awareness, orientation, attention, dependency recognition, capacity understanding, planning support, role-aware context and progressively stronger voice-first use.

For the current architectural and product state, see:

- [North Star](./docs/architecture/NORTH_STAR.md)
- [Engineering Constitution](./docs/ENGINEERING_CONSTITUTION.md)
- [JARVIS Governance Core](./docs/architecture/JARVIS-GOVERNANCE-CORE.md)
- [Roadmap](./docs/architecture/ROADMAP.md)

## Core trust model

JARVIS deliberately separates cognition from authority.

Model output may interpret, explain, challenge, synthesise, draft and propose. It does **not** become evidence, provenance, authority, verification or completion proof merely because it is fluent or correct.

The governing rule is:

~~~text
model-authored material
        ↓
proposal / interpretation / reasoning
        ↓
deterministic or governed boundary
        ↓
authority / evidence / execution / verification
~~~

Important consequences:

- private acquisition requires an explicit governed path;
- model output cannot manufacture permission;
- persisted memory does not rehydrate authority;
- external actions require independently established authority;
- consequential completion claims require independent verification;
- unsupported or invalid states fail closed rather than being filled with plausible prose.

## Conversational runtime

The sole production conversational runtime is:

~~~text
/api/lighter/chat
~~~

The former compatibility `/api/chat` conversational path has been retired from production use.

Typed and voice turns share the governed conversational path. Deterministic capability and authority handling occurs before ordinary model invocation where the capability permits it.

Ordinary free-form model context remains bounded to 40 conversation messages. Current-turn governed paths that do not require the whole transcript can operate before that ordinary-model cap.

## Governed private capabilities

### Calendar

Calendar is the most mature governed capability.

Verified behaviour includes:

- bounded factual Calendar reads;
- deterministic date/time handling in the Melbourne time zone;
- descriptive weekly allocation and capacity reporting;
- attention/change detection over supported Calendar changes;
- Morning Executive Orientation v1;
- bounded conflict reasoning across **Know → Understand → Advise → Act**;
- one narrow Calendar move path with:
  - explicit authority;
  - fresh pre-write reread;
  - exact operation validation;
  - write execution;
  - independent post-write reread;
  - exact completion verification.

This does **not** mean JARVIS has generic Calendar write authority. Arbitrary appointment creation and unrestricted Calendar mutation are not established capabilities.

### Gmail

Verified Gmail capability is intentionally bounded.

Current supported behaviour includes:

- bounded Gmail search;
- bounded recent-message listing;
- identified-message reads;
- ordinal result-to-read continuity for supported Gmail result sets;
- strict named-sender result-to-read continuity over the current bounded recent-message result;
- governed authority before private acquisition.

Gmail remains **read-only at the governed action layer**. JARVIS does not currently send replies, create labels, move messages, establish filters or create standing routing rules.

Mutation-shaped Gmail requests are recognised and returned as an explicit unsupported governed-action boundary rather than falling through as ordinary conversation.

Bounded Gmail named-result continuity is **LIVE PASS / FROZEN**. Unique sender matches and supported ordinals identify one exact server-owned result but always require separate `gmail.read` confirmation. Ambiguous, absent, expired, out-of-range and fabricated selections fail closed. This proof does not authorize fuzzy matching, general anaphora, Gmail mutation or migration to the generic governed result-set mechanism.

### Drive

Verified Drive capability includes:

- bounded Drive search;
- identified Google Doc reads;
- server-owned ordered continuity for recent Drive search results;
- closed first-through-fifth ordinal selection with separate exact-file read authority;
- fail-closed handling for out-of-range, expired, turn-exhausted, superseded, fabricated and cross-scope references;
- governed authority before private acquisition.

Drive is currently read-only through the governed conversational path.

Creating, editing or saving documents back to Drive is not yet a verified capability. Drive ordinal continuity is **LIVE PASS / FROZEN within its bounded read-only scope**; this does not authorize broader anaphora or migration of Gmail or Calendar reference lifecycles.

## Governed Operating Picture and durable continuity

JARVIS has a persistent Governed Operating Picture designed for **continuity, not transcript storage**.

The Operating Picture preserves semantic class, authorship and lifecycle rather than silently turning remembered material into fact.

Current explicit user-authored continuity flow:

~~~text
"Remember this: ..."
        ↓
deterministic capture intent
        ↓
closed semantic classification
        ↓
append-only user-authored continuity record
        ↓
Supabase persistence
        ↓
later purpose-bounded recall
~~~

Supported low-trust continuity classes include user assertions, preferences, plans, commitments and decisions, plus bounded model-authored inference/recommendation/open-question classes where separately admitted.

Explicit recall uses a purpose-bounded projection and closed relevance assessment. Durable IDs remain server-side; the model receives only opaque chunk-local continuity IDs.

### Recall scalability boundary

The original per-assessment boundary remains:

~~~text
12 continuity items
16,384 bytes
~~~

Larger durable sets are handled through deterministic bounded partitioning, with:

~~~text
maximum 8 chunks
maximum 65,536-byte combined rendered reply
~~~

Each chunk independently passes through the same bounded context construction and deterministic relevance validation. Scaling changes cardinality, not trust strength.

Durable recall reliability/scalability is **LIVE PASS / FROZEN within bounded explicit-recall scope**.

Detailed verification:

- [Model-Facing Continuity Verification](./docs/architecture/GOVERNED-OPERATING-PICTURE-MODEL-CONTINUITY-VERIFICATION.md)
- [Explicit User-Authored Continuity Capture Verification](./docs/architecture/GOVERNED-OPERATING-PICTURE-USER-CONTINUITY-CAPTURE-VERIFICATION.md)

## Public information and research

JARVIS can use public web search for current or externally changing information.

Current public-information safeguards include:

- explicit user-local temporal grounding for relative dates such as today/tomorrow;
- freshness checks for current/latest claims;
- source-period matching;
- exact entity/date/location/attribute checks;
- concise answer-first presentation for simple current facts;
- fail-closed behaviour when required current evidence is not established.

Public research is not treated as hallucination-proof. The architecture progressively narrows when unsupported factual assertions are allowed to reach the user as fact.

Claim-level provenance and evidence-class presentation are still active product-development needs for richer research outputs.

## Executive cognition

JARVIS contains deterministic Executive Operating System machinery for structured operational reasoning, including:

~~~text
Situational Awareness
        ↓
Attention
        ↓
Situation Formation
        ↓
Assessment
        ↓
Executive Context
        ↓
Candidate Construction / Evaluation / Comparison
        ↓
Executive Reasoning
~~~

Not every conversational request runs through every stage. Capabilities must earn the minimum required transformations rather than being routed through the full pipeline for architectural neatness.

The standing capability-level test is:

1. **Know** — truthful factual retrieval and deterministic rendering.
2. **Understand** — semantic interpretation of governed private evidence.
3. **Advise** — relate evidence to goals, constraints, trade-offs or recommended action.
4. **Act** — execute an external operation under independently established authority.

Each higher level re-earns trust independently.

## Morning Executive Orientation

The first bounded Morning Executive Orientation capability is live and frozen.

~~~text
"Give me my morning brief."
        ↓
explicit Calendar authority
        ↓
one governed complete weekly Calendar read
        ↓
closed MorningExecutiveOrientationBrief
        ↓
deterministic model-free rendering
~~~

The current v1 is deliberately **Level 1 — Know**. It reports factual current-day commitments and descriptive weekly allocation. It does not infer priority, urgency, adequacy or recommendation.

See [Sprint 3.186 Morning Executive Orientation — Live Pass](./docs/SPRINT-3.186-MORNING-EXECUTIVE-ORIENTATION-LIVE-PASS.md).

## Development method

JARVIS is developed through small evidence-led increments.

Default loop:

~~~text
small boundary
→ small implementation
→ live conversation
→ observe failure
→ classify
→ next smallest change
~~~

For new private semantic exposure or consequential authority boundaries, the cadence becomes more rigorous:

~~~text
audit
→ contract
→ adversarial paper tests
→ implementation
→ synthetic / fixture tests
→ bounded live acceptance
~~~

Standing principles:

- architecture before implementation;
- deterministic before adaptive for facts and authority;
- typed before dynamic;
- validation before enforcement;
- behaviour before orchestration;
- containment before convergence;
- verify invariants, not PR descriptions;
- capabilities are evidence-led;
- safety boundaries are consequence-led.

## Technology

Current mainline stack:

- **Next.js 16.3.3**
- **React 19.2**
- **TypeScript**
- **Vitest**
- **Anthropic SDK**
- **Supabase** for durable Operating Picture / audit persistence where configured
- **Google Calendar, Gmail and Drive** connectors
- server-side public web search through the model provider

## Local development

Install dependencies and start the development server:

~~~bash
npm install
cp .env.local.example .env.local
npm run dev
~~~

Then open:

~~~text
http://localhost:3000
~~~

The development environment requires an Anthropic API key for model-backed functionality. Google and Supabase capabilities require their corresponding server-side configuration.

Do not commit `.env.local`, Google credentials, access tokens, Supabase secrets or generated local state.

## Verification

Run the normal verification battery:

~~~bash
npm run lint
npm run typecheck
npm test
npm run build
~~~

For live Operating Picture verification when the required local configuration is present:

~~~bash
npm run verify:operating-picture:live -- <command>
~~~

A green build is necessary but not sufficient for consequential runtime claims. Capabilities that depend on live providers are promoted only after bounded observed behaviour is also checked.

## Repository orientation

The repository is intentionally documentation-heavy because trust boundaries are part of the architecture.

Start here:

~~~text
docs/ENGINEERING_CONSTITUTION.md
docs/architecture/NORTH_STAR.md
docs/architecture/JARVIS-GOVERNANCE-CORE.md
docs/architecture/ROADMAP.md
~~~

Then use the relevant ADR, sprint specification or verification record for the capability being changed.

Important implementation areas include:

~~~text
app/api/lighter/chat/         sole governed conversational API
lib/lighter-jarvis/           conversational capability, authority and presentation logic
lib/governance-core/          trust-bearing governance primitives and invariants
lib/operating-picture/        durable semantic/lifecycle continuity architecture
lib/connectors/               Calendar, Gmail, Drive and provider adapters
lib/executive-operating-system/ deterministic EOS runtime and publications
docs/architecture/            governance doctrine, ADRs and verification records
~~~

## Deliberately unearned capabilities

Do not infer capability merely because a connector or model could technically support it.

Not currently established as general JARVIS capabilities:

- Gmail send/reply/write;
- Gmail label/filter/routing creation;
- arbitrary Calendar event creation;
- unrestricted Calendar mutation;
- Drive create/edit/save;
- automatic transcript memory;
- embeddings/vector memory;
- ambient cross-source private synthesis;
- automatic conflict resolution or silent memory supersession;
- standing authority derived from prior approval;
- autonomous consequential action;
- unrestricted proactive behaviour.

These are product and governance questions to be earned from observed need, not a feature queue.

## Current product posture

The memory substrate and Morning Executive Orientation milestones are frozen within their proven scopes.

The next JARVIS milestone should come from **real executive-use burden**, not architectural adjacency. Product gaps discovered during normal use are accumulated explicitly, then prioritised by their practical consequence and cognitive burden.

The goal remains simple:

> **Make JARVIS a trusted executive partner that reduces cognitive burden, improves judgement and turns intention into governed execution without taking authority away from the human.**
