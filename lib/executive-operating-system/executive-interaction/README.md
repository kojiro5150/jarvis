# Executive Interaction Contract

`ExecutiveInteractionContract` is the first object in the Executive Interface Layer and the
canonical boundary consumed by every executive interface.

```text
ExecutiveSession
        ↓
ExecutiveInteractionContract
```

Every `ExecutiveSession` produces exactly one deeply immutable, deterministic contract. The
`interactionContractId` commits to the complete canonical contract body, including the session
identity and interaction-contract schema version. Its timestamp is the referenced session creation
time, so deterministic replay uses no clock or hidden input. Consequently, identical contracts
replay with identical identities, while any difference in contract-visible state produces a
different identity.

```text
ExecutiveSession
        ↓
canonical contract body
        ↓
SHA-256
        ↓
interactionContractId
```

The published body is the exact body hashed for identity. Contract identity is consequently a
content commitment rather than merely a lineage identifier. Subject to SHA-256 collision
resistance, two different canonical contract bodies cannot share an `interactionContractId`.
`ExecutiveSession` remains a deterministic lineage identity; this contract rule does not make the
session content-addressed.

The contract exposes interaction mode, channel availability, capability and specialist references,
interaction constraints, authority boundaries, and bounded session, operational-state, and runtime
completion references. It contains identities rather than session, operational, or runtime payloads.
It never contains conversation, prompts, reasoning, execution, routing, planning, UI, browser,
memory, connector, or specialist-execution state.

`activeExecutiveObjectiveReference` remains session context and is not projected into this
contract. It therefore cannot distinguish two interaction contracts, and changing it alone does not
alter contract contents or `interactionContractId`. Every session field that is
projected—mode, executive identity, capability references, specialist references, operational-state
identity, and runtime completion—is included in the canonical body committed by the contract ID.

The initial channel vocabulary is `CHAT`, `VOICE`, `DASHBOARD`, `AUTOMATION`, and `API`.
Availability permits a future interface to consume the contract; it does not implement that channel
or grant execution authority.

Human authority remains final, approval remains explicit, and the Constitutional Runtime,
Operational Layer, and Executive Session Layer retain their existing ownership. Interfaces may not
mutate the session, bypass the foundation chain, infer additional authority, or consume runtime
publications directly.

Every future interface consumes this same contract:

```text
Executive Foundation
══════════════════════════
ExecutiveInteractionContract
══════════════════════════
Future Interfaces

DAWNWATCH  MARCUS  Chat  Voice  Dashboard  Automation  API
```
