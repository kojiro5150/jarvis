# Sprint 3.127 — DAWNWATCH Non-Private Specialist Prompt

- **Status:** Implemented
- **Date:** 25 August 2026
- **Migration Step 5:** **Partial**

## Scope

DAWNWATCH now follows the same ordinary non-private prompt construction used
by the other non-JARVIS specialists. The lighter specialist runtime no longer
calls `buildOperationalState()` or converts its result with
`buildProductionDawnwatchInput()` when DAWNWATCH is selected. Consequently a
routine DAWNWATCH conversation no longer triggers the legacy aggregate's eager
Memory, Calendar, Gmail, and Drive acquisition.

This is a removal of the conversational private-context path, not a DAWNWATCH
presentation redesign. DAWNWATCH remains selectable and retains its specialist
identity, purpose, and instructions. JARVIS still receives its generated
specialist roster, and governed specialist replies still use the existing
relay contract.

## Authority boundary preserved

The live Calendar authority path is unchanged. Calendar reads continue to be
proposed, adjudicated, and acquired in the JARVIS chat handler before model
prompt construction. This sprint does not route Calendar evidence through a
DAWNWATCH prompt and does not introduce another source-acquisition path.

## Quarantine update

The Sprint 3.126 machine-readable inventory continues to classify all known
production surfaces, but records DAWNWATCH with `acquisition: "none"` as of
Sprint 3.127. Its regression guard now permits only the three remaining direct
builder entry points:

1. `app/api/operational-picture/route.ts`;
2. `app/api/operational-state/evaluation/route.ts`;
3. `app/api/operational-state/route.ts`.

Migration Step 5 remains **partial** because the Dashboard still consumes the
operational-state API and the deprecated compatibility and evaluation routes
still call the legacy builder.

## Explicit non-scope

- no `BRIEF_ME_GRANT` or replacement grant;
- no Gmail, Drive, or Memory authority;
- no Dashboard migration or redesign;
- no changes to DAWNWATCH routing, JARVIS relay/roster behaviour, or the live
  Calendar authority path;
- no changes to the legacy builder, governed DAWNWATCH presentation adapter,
  connectors, API response shapes, or production defaults.
