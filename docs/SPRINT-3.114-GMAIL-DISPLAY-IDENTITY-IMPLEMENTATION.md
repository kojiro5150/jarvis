# Sprint 3.114 — Gmail Display Identity Implementation

Status: Complete  
Sprint Type: Bounded Source-Normalization and Governed Publication Implementation  
Recommendation: Implementation Complete

## Repository precondition result

```text
Repository: /workspace/jarvis
Branch: work
Starting commit: 20a2c89ebb6e92185c4f6f7d785cc38009d59088
Ending commit: the Git commit containing this completion report
Starting working-tree state: clean
Ending working-tree state: clean after commit
Real clone: Yes (.git worktree)
Required documents present: Yes; all seven documents were read completely
Required source present: Yes, except the specified normalizer.test.ts did not pre-exist and was created as the required focused suite
Current policy value before implementation: governed-gmail-conversational-metadata-disclosure.v1
```

The governing Sprint 3.113 decisions matched this specification. Before implementation, `NormalizedGmailObservation` retained `sender: string` without a structured display name; the normalizer obtained the sole required `From` value and retained it; `ParsedAddresses` contained only `values` and `malformed`; recipient address parsing covered To/Cc/Bcc; the governed input lacked the new field; and the publisher did not parse `sender`. No entity-identification module existed.

## Contract extraction

```text
Canonical field: senderDisplayName
Governed evidence field: senderDisplayName
Field type: readonly senderDisplayName?: string
Disclosure policy: governed-gmail-conversational-metadata-disclosure.v2
Compatibility boundary: gmail_metadata_non_authoritative_conversation_context.v1
Publisher parsing authority: None
Entity matching implemented: No
```

## Normalizer implementation

A private `ParsedSenderMailbox` result supplements, but does not modify, `ParsedAddresses`. `senderMailbox` first uses the existing standards-aware address-list state machine as its validity gate, then finds a structural angle mailbox while protecting quotes, escapes, and comments. The complete required `From` header remains the `sender` value without alteration. The explicit phrase is unfolded and trimmed, structural comments are excluded, enclosing quotation marks are removed, quoted-pair escapes are recovered, and the result uses deterministic NFC normalization. A bare mailbox or malformed/ambiguous input yields no field. There is no local-part, casing, byline, contact, or identity inference.

| Source `From` value | `sender` | `senderDisplayName` | Result |
| --- | --- | --- | --- |
| `Cassie Kozyrkov <decision@substack.com>` | exact original value | `Cassie Kozyrkov` | Pass |
| `"Cassie Kozyrkov" <decision@substack.com>` | exact original value | `Cassie Kozyrkov` | Pass |
| `decision@substack.com` | exact original value | `undefined` | Pass |

## Publisher and policy proof

```text
Canonical senderDisplayName: Canonical Structured Value
Published senderDisplayName: Canonical Structured Value
Publisher reparsed sender: No
Adversarial parseable sender with absent canonical field: field absent (Pass)
Old policy emitted: No
New policy emitted: governed-gmail-conversational-metadata-disclosure.v2
Parallel policy field added: No
Compatibility boundary changed: No
```

The publisher conditionally copies only `observation.senderDisplayName`. It neither reads nor transforms `observation.sender` for this purpose. All ten prior Gmail mappings remain unchanged except the required policy version.

## Assembly result

The realistic acquisition fixture passed through `GmailMessageObservation → normalizeGmailObservation → ProductionGmailRecipientEvidence → publishGmailEvidence → assembleGovernedSourceEvidence`.

```text
Normalized senderDisplayName: Cassie Kozyrkov
Published senderDisplayName: Cassie Kozyrkov
Assembled senderDisplayName: Cassie Kozyrkov
Bare mailbox normalized/published structured field: absent
```

No transformation occurs after canonical normalization.

## Recipient regression

All established coverage passed: quoted commas, comments, escaped characters, angle addresses, group syntax, repeated headers, To/Cc/Bcc ordering, duplicate retention, malformed partial input, missing evidence, `not_fetched`, `not_authorised`, `unknown`, retrieval-time provenance, dual-query acquisition, message-ID deduplication, one detail fetch, and local/mock rejection.

**No recipient parsing, ordering, duplicate, absence-state, or provenance rule changed.**

## Isolation and out-of-scope confirmation

```text
Entity Identification modules added: No
governed_first_token_display_name_alias_match implemented: No
Claim Boundary modified: No
Enrichment modified: No
Model dependency added: No
Production route modified: No
```

Pure-Node forward and reverse import checks pass. The modified Gmail and governed-conversation files do not import application routes, context-builder, useAgentConversation, Claim Boundary, Entity Identification, or model invocation. Production sources do not gain a new publisher/assembly path. No `entity-identification-*` file exists.

Protected pre/post SHA-256 hashes are identical:

```text
503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3  app/api/chat/route.ts
8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d  lib/context-builder.ts
55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97  lib/useAgentConversation.ts
da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88  lib/agents/chat-execution.ts
9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a  lib/governed-conversation/claim-boundary-engine.ts
cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a  lib/governed-conversation/claim-boundary-types.ts
5c60fff548a152533fa1634daa1096ca6144eb2c72c70998c544b25010129454  lib/governed-conversation/claim-enrichment-engine.ts
b009a1b62aa58a4c7a079efb9085aa810bdf0f63c9a09829c2577cb2bf71c36f  lib/governed-conversation/claim-enrichment-types.ts
ea0835339911d9a3d40af38333e0f0c39295477d70e1ebc63145375c47ff6064  lib/governed-conversation/conflict-boundary-engine.ts
beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b  lib/governed-conversation/model-invocation.ts
```

## Files changed

- `gmail/types.ts` — added the optional canonical `senderDisplayName` field.
- `gmail/normalizer.ts` — added bounded structural From display-name extraction.
- `gmail/normalizer.test.ts` — added unquoted, quoted, escaped, commented, bare, malformed, recipient, and provenance proofs.
- `projection-composer.ts` — added the optional governed evidence field only.
- `gmail-evidence-publisher.ts` — added exact pass-through and advanced policy v2.
- `gmail-evidence-publisher.test.ts` — added policy, pass-through, canonical-wins, and no-reparse proofs.
- `gmail-evidence-acquisition-adapter.test.ts` — proved real canonical/publisher propagation and bare-mailbox absence; migrated policy expectation.
- `source-evidence-assembly.test.ts` — proved real assembled Cassie evidence and updated hashes for intentionally modified governed boundaries.
- `claim-enrichment-composition.test.ts` — updated the intentional composer boundary hash only.
- `connector-availability-publisher.test.ts` — updated the intentional composer boundary hash only.
- `full-assembly-claim-boundary-conflict-boundary-composition-regression.test.ts` — updated intentional composer/publisher hashes only.
- `full-assembly-enrichment-composition-recheck.test.ts` — updated the intentional composer boundary hash only.
- `integrity-coupling-full-assembly-regression.test.ts` — updated the intentional composer boundary hash only.
- `docs/SPRINT-3.114-GMAIL-DISPLAY-IDENTITY-IMPLEMENTATION.md` — recorded implementation, proofs, isolation, and validation.

## Validation results

- Targeted Gmail normalizer, projection adapter, production evidence, publisher, acquisition, source assembly, projection composer, and DAWNWATCH/recipient integration tests: Pass.
- Recipient Sprint 3.69/3.70 regression coverage: Pass.
- `npm test`: Pass.
- `npm run build`: Pass (Google Fonts optimization download was skipped; build completed).
- `npm run lint`: Pass with no warnings or errors.
- `npm run typecheck`: Pass.
- `git diff --check`: Pass.

## Production effect

Sprint 3.114 adds a structured, source-asserted `senderDisplayName` field to the canonical normalized Gmail observation and projects that field unchanged into governed conversational Gmail evidence under `governed-gmail-conversational-metadata-disclosure.v2`. It does not identify an entity, implement alias matching, modify Claim Boundary recognition or Evidence-to-Claim Enrichment, alter recipient semantics, wire `/api/chat`, change the LEGACY conversational path, or create a durable identity.

## Remaining boundary

Sprint 3.114 proves only that structured sender display identity exists correctly in real assembled governed evidence. It does not prove that an unresolved operator reference such as “Cassie” can be matched to “Cassie Kozyrkov”. That deterministic matching responsibility remains exclusively governed for Sprint 3.115.

## Recommended next step

**Sprint 3.115 — Isolated Entity Identification Implementation**

It should consume real extracted parameters and assembled structured display metadata, implement the already governed deterministic unique/multiple/zero/unavailable outcomes without models, and remain isolated from `/api/chat`.

**Implementation Complete**
