# Sprint 3.59 — Governed Dashboard Presentation Implementation

## Confirmed implementation parameters

- **Viewer timezone:** `Australia/Melbourne`.
- **Locale:** `en-AU`.
- **Reference time:** the Dashboard constructor requires one RFC 3339 instant. The caller captures it once and the constructor propagates it to every derivation. The adapter never reads the system clock.
- **Calendar wording:** weekday-short in `en-AU`, upper-cased; timestamps render as 24-hour hour/minute in the viewer timezone. A canonical bare date renders as `All day`; no timestamp is interpreted as all-day.
- **Relative calendar words:** `today`, `tomorrow`, `yesterday`, and `this week` are not currently rendered and therefore have no active derivation. They must not be inferred. A future rule must version and test viewer-timezone calendar boundaries before use.
- **Relative durations (formatting v1):** future or invalid observations are omitted; `[0,60s)` is `just now`; `[60m)` is floored whole minutes; `[24h)` is floored whole hours; then floored 24-hour durations in days. Exact thresholds enter the later bucket.
- **Source scope:** canonical source kinds `calendar`, `email`, and `drive`. `not_configured`, `unavailable`, and `stale` sources participate in the connector denominator; only `available` is connected. System-reading precedence is `stale` → `ATTENTION REQUIRED`, otherwise any `available` → `NOMINAL`, otherwise `LOCAL MODE`. Authentication refresh/control state is not canonical and is not derived. Google display predicates require explicit entity membership in an artifact carrying the governed Google adapter provenance; source kind or opaque identity alone is insufficient.
- **Ordering v1:** priorities and projects use `id ASC`; eligible commitments use `startsAt ASC, id ASC`; communications use applicable observed timestamp `DESC, id ASC`; sources use `id ASC`. Missing commitment starts sort last and are not next-event eligible.
- **Rule versions:** contract `dashboard-presentation-v1`; derivation, formatting, and ordering `1.0.0`.

## Boundary evidence

The application-facing adapter consumes `ExecutiveStateSnapshot` without changing it. It selects only governed priority/project identity and labels, commitment identity/title/bounds/status, communication identity/metadata, and source identity/availability.

Conditional DDP is deliberately inactive: project progress summaries, signal/blocker summaries, Drive activity summaries, needs-reply/urgent communication selections, and their specialist allocations remain empty because their required inputs are deferred. No local seed, title parsing, opaque-id parsing, iteration order, or legacy `OperationalState` fallback is used.

Dashboard View State remains component-local: colours, wording, disclosure state, animation/reveal state, drafts, and interaction feedback are not emitted by the adapter.

Rejected `updatedAt`, `snippet`, recurrence id, and attendee response fields do not occur in the presentation contract. Deferred rank/detail/due/urgent, project progress/tag, signals, calendar attribution, unread/important/mailbox attribution, and Drive activity facts are likewise absent.
