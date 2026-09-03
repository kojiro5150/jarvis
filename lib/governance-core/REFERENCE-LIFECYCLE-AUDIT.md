# Governed reference lifecycle audit

**Status:** PR D design evidence; Drive result-set, Gmail message-list and Product Gap resolution references subsequently live-verified
**Purpose:** Determine whether existing opaque-reference mechanisms already share enough lifecycle semantics to justify one generic runtime registry.

## Result

They do **not** yet share one proven lifecycle contract. PR D therefore standardises the trust boundary, not the storage implementation.

| Existing mechanism | Server-owned state | Lifecycle | Semantic purpose | Authority-bearing? | PR D decision |
| --- | --- | --- | --- | --- | --- |
| `governed-result-set-reference.ts` | yes | TTL + conversational-turn budget + same-class supersession + scope close | ordered Gmail/Calendar/Drive result sets | no | production-proven for bounded Drive ordinal continuity; retain as the strongest existing cross-capability referential primitive; no lateral migration without capability-specific parity and live proof |
| `gmail-message-list-reference.ts` | yes | 15-minute TTL; bounded five-item order; current client-carried reference; no claimed same-class server supersession or turn budget | recent Gmail ordinal and strict named-sender continuity | no | production-proven and frozen for the bounded recent-result path; retain capability-specific ownership; no migration without a separate parity need and proof |
| `gmail-sender-disambiguation-reference.ts` | yes | TTL + refinement lifecycle + consumption on match | bounded identity clarification | no | retain; different lifecycle from ordered result sets |
| `calendar-attention-observation-reference.ts` | yes | explicit rotation; no equivalent result-set TTL/turn contract | canonical Calendar observation continuity | no | retain; different payload and lifecycle |
| `product-gap-resolution-reference.ts` | yes | 15-minute TTL + active/history class separation + list consumption + target rotation and one-shot consumption | exact durable Product Gap selection before an explicit append-only lifecycle assertion | no | production-proven and frozen for bounded Product Gap resolution; retain separately from capability and authority references |
| `pending-authorization.ts` | yes | active/consumed + capability match + raw confirmation | exact pending operation authority protocol | the **resolved server state** contributes authority evidence; the client reference itself does not | keep distinct from conversational references |

## Common invariant

All of the mechanisms above already depend on the same important rule:

> A client-carried opaque reference may preserve continuity or identify which server record to consult, but possession or fabrication of that reference is not proof that the server record exists and cannot itself create authority.

PR D gives that common rule an explicit Governance Core type boundary:

- `ConversationReference` and `ConversationState` are low-trust semantic continuity;
- `GovernanceState<T>` is a distinct server-owned category;
- there is deliberately no generic public constructor that promotes arbitrary client/model data into `GovernanceState<T>`.

The later Drive activation proved this trust boundary under real use, including expiry, turn exhaustion, same-class supersession, fabricated handles and cross-scope handles. It did not prove that Gmail, Calendar or any other capability should adopt the same lifecycle.

The later Gmail named-result proof independently verified its different capability-specific contract: strict unique, ambiguous and absent sender resolution; bounded ordinal overflow; separate read authority; 15-minute expiry; current client-held result ownership; and fabricated-handle rejection. It deliberately does not claim the Drive primitive's scope, turn-budget or same-class supersession semantics.

The later Product Gap resolution proof verified another distinct contract: active/history class separation, bounded positional selection, target rotation, 15-minute expiry and one-shot list and target consumption. Its target reference remains non-authoritative; only the closed current-user write utterance authors the separate durable assertion. This proof does not justify convergence with resource-identification or pending-authority registries.

## Why no generic registry is introduced here

The current stores differ in ways that matter:

- expiry by wall clock versus expiry by conversational turns;
- rotation versus consumption versus supersession;
- ordered resource identity versus clarification candidate sets versus full canonical observation sets;
- authority protocol state versus non-authoritative semantic continuity.

Collapsing them now would generalise from surface similarity rather than proven shared obligations.

The later migration criterion is therefore:

> Generalise only the lifecycle and trust semantics that recur unchanged across real capabilities. Preserve capability-specific state machines where they encode real proof obligations.
