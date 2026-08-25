# Sprint 3.139 — Private Capability Handoff Guard

## Scope and invariant

This sprint enforces the following invariant in the ordinary JARVIS conversation runtime:

> specialist handoff ≠ substitute authority path for private Calendar/Gmail acquisition

`calendar.read`, `gmail.search`, and identified-message `gmail.read` remain governed,
JARVIS-only private-source paths. A model-generated `propose_handoff` cannot confer
authority, create pending authorization, or cause DAWNWATCH (or another specialist) to
acquire Calendar or Gmail data.

## Runtime boundary

After all existing deterministic Gmail and Calendar proposal/authorization resolvers have
run, the server checks the untouched current user utterance before accepting a model handoff.
If the utterance asks to acquire Calendar/Gmail data, or recalls those sources as though an
ordinary fall-through turn had acquired them, the proposed route is discarded. The model's
task summary and target are not authority inputs.

The guard does not execute a capability and does not broaden either recognizer. In
particular it adds no weekday Calendar window, natural-language `gmail.read`, Gmail search
policy, standing grant, or persistent authorization state. Existing recognized operations
continue through their existing authority paths before a model can run.

## DAWNWATCH roster correction

DAWNWATCH is described as presenting supplied governed briefing evidence, not as owning an
inbox or Calendar acquisition capability. Its prompt explicitly says ordinary runtime has no
Calendar/Gmail acquisition. This wording is defense in depth; the server guard is the
enforcement boundary.

## Regression boundary

Focused route tests cover Calendar acquisition/recall requests, Gmail/inbox/email acquisition
requests, absence of `routeTo` and pending authorization, connector non-execution, and a
legitimate HERALD drafting handoff. Frozen Gmail/Calendar authorization, Sprint 3.138 history
sanitization, and Sprint 3.138a recognizer behavior remain unchanged.
