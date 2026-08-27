# Sprint 3.151b — Calendar recall epistemic truthfulness

## Defect

Hard-reset voice testing exposed a presentation defect after a governed Calendar read. On a later recall-only turn, the model could say “I saw” before listing the previously reported time blocks. A later sentence tied that claim to Calendar, even though the turn had no current Calendar `GovernedContext` and performed no acquisition. Because the provenance cue could occur later in the reply, sentence-local matching was insufficient.

Typed testing also exposed a capability defect: the model could offer to check Calendar again for meeting titles or similar details. The governed Calendar projection exposes timing only, so reauthorization through the same path cannot reveal titles, descriptions, locations, attendees, organizers, or provider identifiers.

## Structural invariant

When there is no current Calendar `GovernedContext`, the turn is a recognized Calendar recollection follow-up, and a prior visible Calendar report exists, JARVIS may discuss that remembered result but must attribute it historically. It must not represent Calendar as currently seen, visible, checked, accessed, open, available, showing data, or held as present evidence.

A valid prior governed result is not current source access.

The presentation guard therefore inspects the whole model response in Calendar recollection mode. It rewrites false present-source language while preserving useful schedule content. On schedule-only detail follow-ups, it replaces false reread offers or invented metadata with the truthful limitation that the governed Calendar path provides timing, not titles or descriptions.

Schedule-only hidden-metadata containment and false reread-offer containment are separate checks. The former may replace an invented schedule-only answer wholesale. The latter applies to Calendar detail recollection even when a valid user-supplied detail is bound to one interval: it preserves that conversational detail and an honest statement that another detail is unknown, while replacing only the offer to reread Calendar for omitted metadata. Neither check creates authority, pending authorization, or connector acquisition.

## Current turn versus recall-only

Current-source wording remains valid during the actual authorized read when the current turn has Calendar `GovernedContext`. Later recall-only wording must refer to the earlier result or previous response. These corrections are presentation-only: they do not create pending authorization, invoke a connector, or change Calendar authority decisions.

Typed and voice transports inherit the same behavior because both use the shared server-side ordinary-model presentation path; no voice-specific authority path is added.

## Preserved behavior

- Fresh Calendar reads still produce `ASK`, and confirmed reads still use governed acquisition.
- A later fresh read still asks again.
- User-supplied details remain ordinary conversational evidence. A user’s “10 AM meeting is the project review” can bind to the latest 10:00–11:00 AM interval and is attributed to the conversation, never Calendar.
- An unrelated 9 AM detail, untimed generic detail, or detail tied only to an older schedule does not bind; schedule-only containment remains fail-closed.
- Hidden metadata containment, client-spoofing resistance, and no-connector recall behavior remain unchanged.

## Non-goals

This sprint does not change authority evaluation, proposal grammar, pending authorization, operation/window semantics, the governed projection, connectors, OAuth, Gmail, Drive, Memory, voice transport architecture, client contracts, specialist routing, operational state, legacy containment, or root presentation. It does not introduce a semantic fact checker or provenance database.
