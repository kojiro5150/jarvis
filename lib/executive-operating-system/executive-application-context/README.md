# Executive Application Context

`ExecutiveApplicationContextProjector` consumes exactly one immutable
`ExecutiveInteractionResult` and publishes exactly one deeply immutable
`ExecutiveApplicationContext`. This is the canonical application boundary: future Chat,
DAWNWATCH, MARCUS, Voice, Dashboard, Automation and API projections derive their transient state
from this publication rather than extending or bypassing the Executive Foundation.

The context contains only its source identity, readiness and availability summaries, authority and
capability summaries, publication status, and deterministic ownership metadata. It contains no
conversation, prompts, memory, reasoning, orchestration, execution state, rendering behaviour or
application state. It never consults or reconstructs the interaction contract, session,
operational state, run record, or runtime.

The projector verifies the source schema, successful processing, empty validation findings,
ownership metadata and SHA-256 content identity. An invalid source deterministically produces a
safe `SOURCE_INVALID` context with unavailable summaries. SHA-256 over the complete canonical
context body produces `applicationContextId`; identical input therefore yields identical output.
