# Sprint 3.113 — Governed Gmail Display Identity and Entity Alias Contract

**Status:** Specification  
**Sprint Type:** Governance Decision / Source Metadata Extension and Entity Alias Contract  
**Implementation Authority:** None  
**Production Integration:** Prohibited  
**Governing Trigger:** Sprint 3.113 attempted Isolated Entity Identification Implementation — `Implementation Incomplete`  
**Direct Structural Precedents:** Sprints 3.69, 3.70, 3.96, and 3.112

## 1. Recommendation

**Decision:** Approve this Governed Gmail Display Identity and Entity Alias Contract.

The attempted isolated Entity Identification implementation correctly stopped rather than inventing missing source metadata or matching semantics. The current canonical Gmail normalizer retains the complete source-asserted `From` header in `sender: string`, but neither `NormalizedGmailObservation` nor `GovernedCommunicationEvidenceInput` exposes its display-name component as structured metadata. The gap therefore reaches upstream of the governed conversational publisher and cannot truthfully be solved in that publisher alone.

This contract authorizes a future narrow, additive normalizer and publication extension. It does not reopen Gmail acquisition, recipient extraction or flattening, `To`/`Cc`/`Bcc` semantics, recipient evidence state, source provenance, Sprint 3.96's established mappings, or Sprint 3.112's cardinality governance and Identity Integrity. **This contract authorizes no implementation.**

# Part I — Repository Precondition and Governing Authority

## 2. Repository finding

Repository inspection established all of the following:

* this is the real JARVIS Git working tree on branch `work`, starting at commit `23c886381ab137fe53504e451e2105dfe983339a`, and it was clean before this document was added;
* Sprint 3.112 exists, is complete, and identifies isolated Entity Identification as the next implementation step;
* the attempted implementation stopped with **Implementation Incomplete** rather than adding an unsupported identity resolver;
* `NormalizedGmailObservation` contains `sender: string`, but no `senderDisplayName` and no structured sender mailbox/display-name object;
* `normalizeGmailObservation()` obtains `sender` from exactly one required `From` header and returns the source-asserted string unchanged;
* the internal `ParsedAddresses` path is separately used for the `To`, `Cc`, and `Bcc` recipient lists;
* `GovernedCommunicationEvidenceInput` has no sender display-name field;
* `publishGmailEvidence()` neither projects identity-bearing sender metadata nor independently parses `sender`; and
* Sprint 3.112's Cassie example requires matching semantics beyond its binding case, surrounding-whitespace, and Unicode normalization rules.

The following governing artefacts and source files were reviewed completely:

* Sprint 3.69 — Governed Gmail Recipient Contract;
* Sprint 3.70 — Gmail Recipient Production Integration;
* Sprint 3.96 — Governed Gmail Conversational Evidence Publication Contract;
* Sprint 3.112 — Governed Conversational Entity Identification and Claim Parameter Contract;
* Constitutional Publication Principles;
* the current canonical Gmail normalizer and Gmail types;
* production Gmail evidence;
* the governed Gmail evidence publisher;
* the governed projection composer and `GovernedCommunicationEvidenceInput`; and
* claim-boundary types and all relevant tests and fixtures located by the governed search terms.

## 3. Governing hierarchy

Apply, in order: the JARVIS Engineering Constitution; JARVIS North Star; JARVIS Engineering Specification Standard; Constitutional Publication Principles; Roadmap; Sprints 3.69, 3.70, 3.96, and 3.112; current repository source; and this contract. This contract narrowly extends, and does not repeal or redesign, those responsibilities.

# Part II — Exact Repository Finding

## 4. Current Gmail normalizer reality

The canonical normalized Gmail observation includes:

```ts
readonly sender: string;
```

The normalizer obtains it conceptually as:

```ts
const sender = exactlyOne(message, "From", true);
```

and publishes `sender` unchanged. Thus `From: Cassie Kozyrkov <decision@substack.com>` can retain the complete string `Cassie Kozyrkov <decision@substack.com>`. What is absent is an independently addressable structured field equivalent to `senderDisplayName?: string`.

> **The gap is structured display-identity retention, not complete loss of the raw sender observation.**

## 5. `ParsedAddresses` finding

The internal shape:

```ts
interface ParsedAddresses {
  readonly values: readonly string[];
  readonly malformed: boolean;
}
```

belongs to address-list parsing for `To`, `Cc`, and `Bcc`. It does not currently parse `From` into structured sender components. Its values are not an existing sender identity structure, and recipient values do not gain display-name identity semantics under this contract.

# Part III — Sprint 3.69 / 3.70 Non-Reopening

## 6. Recipient governance remains binding

This contract does not reopen returned `To`, `Cc`, or `Bcc`; repeated header handling; recipient ordering or duplicate retention; group preservation or expansion; malformed handling; absence semantics; recipient evidence states; retrieval provenance; recipient flattening or roles; aliases, delegation, routing, mailbox ownership, or hidden recipients.

The closed evidence vocabulary remains `available`, `not_fetched`, `not_authorised`, and `unknown`; `none` remains reserved.

## 7. Additive normalizer extension

A future implementation may add structured sender display-name extraction beside the existing `sender: string`. It shall not replace `sender`, reinterpret recipients, change recipient ordering or equality, or introduce identity resolution. The change is one additional structured observation from the existing `From` header, not a new Gmail parsing architecture.

# Part IV — Sender Display Identity Contract

## 8. Canonical field decision

`NormalizedGmailObservation` shall gain exactly:

```ts
readonly senderDisplayName?: string;
```

The field is optional because a valid mailbox need not include a display name:

```text
Cassie Kozyrkov <decision@substack.com>
  sender: "Cassie Kozyrkov <decision@substack.com>"
  senderDisplayName: "Cassie Kozyrkov"

decision@substack.com
  sender: "decision@substack.com"
  senderDisplayName: undefined
```

No display name may be inferred from the mailbox or its local part.

## 9. Meaning and limits

`senderDisplayName` means only the display-name component explicitly asserted by the source `From` mailbox observation after standards-aware structural parsing and representation-neutral normalization. It is not a verified legal name, canonical person identity, contact identity, mailbox owner, authenticated author, byline author, account owner, durable JARVIS person, or cross-message/source identity equivalence.

For `Cassie Kozyrkov <decision@substack.com>`, it can establish that the source-asserted sender display name was `Cassie Kozyrkov`. It cannot establish that `decision@substack.com` is Cassie Kozyrkov's personal email address.

## 10. Sender parsing contract

The future implementation shall structurally parse the single `From` mailbox observation with relevant RFC 5322 safety principles: quoted display names, escaped characters, comments, angle-address syntax, unfolding, and insignificant outer whitespace. Existing utilities may be reused or extracted only where doing so preserves one deterministic parsing authority.

Permitted normalization is limited to RFC-safe unfolding, removal of structural quoting, recovery of structurally escaped characters, insignificant surrounding-whitespace normalization, and Unicode normalization under the repository convention. The implementation shall not infer from mailbox, body, byline, local part, initials, nicknames, spelling corrections, translations, or entity linking.

A malformed sender shall not yield a display name through heuristic recovery. Existing Gmail validity governance remains controlling; Sprint 3.114 must decide whether existing validation is sufficient or a bounded structural parse failure must fail normalization.

# Part V — Governed Conversational Publication and Disclosure

## 11. Governed field and single parsing authority

`GovernedCommunicationEvidenceInput` shall gain exactly:

```ts
readonly senderDisplayName?: string;
```

It shall be copied only from `NormalizedGmailObservation.senderDisplayName`:

```text
Gmail source observation
  → canonical Gmail normalizer
  → NormalizedGmailObservation.senderDisplayName
  → governed Gmail evidence publisher
  → GovernedCommunicationEvidenceInput.senderDisplayName
```

`gmail-evidence-publisher.ts` shall not reconstruct or reparse the field from `sender`; doing so would create a prohibited second parsing authority.

## 12. Versioned disclosure policy

The existing `policyReference: string` field is retained. No `displayIdentityPolicyReference`, `identityPolicyReference`, `senderPolicyReference`, or other policy-reference-equivalent field shall be added.

Because identity-bearing structured metadata is a real disclosure-contract extension, Sprint 3.96's v1 identifier shall not silently acquire new semantics. The future implementation shall define:

```ts
export const GMAIL_CONVERSATIONAL_DISCLOSURE_POLICY =
  "governed-gmail-conversational-metadata-disclosure.v2";
```

Policy v2 inherits Sprint 3.96's metadata-only restrictions and authorizes `senderDisplayName` only when it was explicitly present in the source `From`, structurally derived by the canonical normalizer without semantic inference, admitted by the governed pipeline, and used downstream under its own contract. It does not authorize message bodies, MIME content, contact enrichment, identity search, personal-address or mailbox-ownership inference, sender/byline equivalence, or durable identity.

The compatibility boundary remains exactly:

```text
gmail_metadata_non_authoritative_conversation_context.v1
```

It already admits the canonical sender observation while withholding identity-resolution authority. The structured field does not make Gmail an identity authority.

## 13. Sprint 3.96 extension and Identity Integrity

Sprint 3.96's ten bindings remain unchanged: `communicationReference`, `recipientEvidenceReference`, `sourceReference`, `provenanceReference`, `retrievalTime`, `available`, `contentDigest`, `contentKind`, `compatibilityBoundary`, and `policyReference`. Only `policyReference` advances to v2 for the extended schema, and `senderDisplayName` is additive.

`senderDisplayName` is metadata, not identity. It shall not become a communication, recipient-evidence, source, provenance, Gmail message, claim, entity-evaluation, resolved-entity, or claim-set identity. The Gmail publisher may not convert `Cassie Kozyrkov` directly into `person:cassie-kozyrkov`.

# Part VI — Entity Alias Decision

## 14. Sprint 3.112 inconsistency

Sprint 3.112 permits representation-neutral case, surrounding-whitespace, and Unicode normalization. Those operations make `Cassie`, `cassie`, and ` CASSIE ` representation-equivalent, but cannot make `Cassie` equal `Cassie Kozyrkov`. Its worked example therefore cannot truthfully use `exact_governed_display_name_match` without additional governed semantics.

## 15. Selected mechanism

Introduce the separately named **Governed First-Token Display-Name Alias Match**, with exact machine vocabulary:

```text
governed_first_token_display_name_alias_match
```

Given unresolved reference `R` and structured governed display name `D`, define:

```text
NR = normalize(R)
ND = normalize(D)
T1 = first lexical token of ND
```

A source-qualified candidate qualifies under the new basis if and only if `NR === T1` and all other Sprint 3.112 candidate and provenance requirements are satisfied.

For `R = "Cassie"` and `D = "Cassie Kozyrkov"`, `NR` and `T1` are both `cassie`, so the predicate is true.

## 16. Matching precedence and boundaries

Matching-basis attribution precedence is:

1. `exact_governed_display_name_match` when the complete normalized strings are equal;
2. `governed_first_token_display_name_alias_match` otherwise when the complete normalized unresolved reference equals the complete first lexical token.

This precedence never ranks one entity candidate above another.

The rule allows `Cassie` against `Cassie Kozyrkov`, but not `Cassandra Kozyrkov`, `Cass Kozyrkov`, or `C. Kozyrkov`. It authorizes no partial string (`Cass`, `assi`, `Kozy`), substring, surname/last-token, nickname, edit-distance, phonetic, embedding, semantic, popularity, contact-frequency, recency, or topic-relevance match.

## 17. Ambiguity is the safety boundary

If governed evidence contains both `Cassie Kozyrkov` and `Cassie Chen`, each independently qualifies for `Cassie`. The candidate count is two and Sprint 3.112 requires exactly:

```text
ambiguous_multiple_matches
```

Neither candidate may be selected. The rule does not assert that Cassie always means Cassie Kozyrkov; it asserts only a source-qualified exact first-token relationship. Final resolution still requires `qualifyingCandidateCount === 1`.

# Part VII — Sprint 3.112 Reconciliation

## 18. Binding reconciliation

Sprint 3.112's Cassie → Cassie Kozyrkov worked example was illustrative but exceeded the semantics of its binding representation-neutral normalization rules. Sprint 3.113 resolves that inconsistency by introducing the separately named deterministic `governed_first_token_display_name_alias_match`. The worked example is implementable only under this newly governed rule, subject to Sprint 3.112's unchanged unique-candidate cardinality requirement.

This does not reopen Option A, per-exchange scope, no durable identity, evidence-bound candidate construction, no-ranking/no-model rules, evidence citations, candidate equality, cardinality, zero/multiple/source-unavailable handling, or Identity Integrity.

The four principal outcomes remain:

```text
resolved
ambiguous_multiple_matches
unresolved_no_match
entity_source_unavailable
```

No fifth cardinality/source-availability outcome is added. Sprint 3.112's separately governed insufficient-identity-evidence fail-closed parameter condition remains distinct.

# Part VIII — Candidate and Newsletter Boundaries

## 19. Source-qualified use

A future engine may use `GovernedCommunicationEvidenceInput.senderDisplayName` only when the source is admitted and available, the field is present and came from canonical normalization, the policy authorizes disclosure, evidence and provenance references exist, and the matching rule qualifies. A raw occurrence elsewhere is not equivalent.

The architecture may establish that governed Gmail evidence contains the source-qualified sender display-name candidate `Cassie Kozyrkov`. A sole qualifying candidate may resolve the exchange-scoped target entity. It still does not establish that a newsletter/service sender such as `decision@substack.com` is that person's personal address; that remains an Evidence-to-Claim Enrichment question.

# Part IX — Publication Responsibility, Identity, and Determinism

## 20. Publication Responsibility Audit

The canonical Gmail normalizer gains only retention of a structured component explicitly present in `From`; it gains no entity resolution, claim recognition, enrichment, person identity, or mailbox ownership. The Gmail conversational publisher gains only projection of that canonical field under policy v2; it gains no sender parsing, matching, or claim construction. The Entity Identification ruleset gains only the deterministic first-token predicate; it gains no fuzzy/model matching or durable identity.

```text
Gmail source
  → canonical normalization
  → structured source-asserted sender display name
  → governed conversational evidence
  → deterministic entity candidate qualification
```

No stage reconstructs an upstream publication, downstream publisher becomes a parser, normalizer becomes an identity resolver, or entity resolver becomes a Gmail authority.

**Publication Responsibility Audit: Pass.**

## 21. Identity Integrity

Gmail provider message identity, canonical observation, communication/source/provenance references, `senderDisplayName`, candidate identity, ruleset/evaluation identities, resolved entity, claim-boundary evaluation, claim, and governed claim-set identities remain constitutionally distinct. `senderDisplayName` is a value, not a publication identity.

Candidate cardinality remains identity-bearing. Adding `Cassie Chen` to a one-candidate `Cassie Kozyrkov` evaluation changes the canonical candidate set, evaluation identity, outcome, and clarification state.

## 22. Determinism and no model participation

Identical source input and normalization rules shall yield identical `sender` and `senderDisplayName`. Identical unresolved reference, structured display name, normalization rules, and candidate set shall yield identical qualification. No clock, search, contact database, conversation state, LLM, embedding, classifier, model-generated alias/tokenization, confidence, or ranking may affect extraction or matching.

# Part X — Governance-Only Boundary and Future Sequence

## 23. No implementation

> **Sprint 3.113 authorizes no code change.**

Only this document may change. In particular, this sprint shall not modify the Gmail normalizer or types, Gmail evidence publisher, projection composer, claim or enrichment engines, `/api/chat`, `context-builder.ts`, or `useAgentConversation.ts`.

## 24. Sprint 3.114 — Gmail Display Identity Implementation

Sprint 3.114 may implement only the source/publication prerequisite: `NormalizedGmailObservation.senderDisplayName?: string`, `GovernedCommunicationEvidenceInput.senderDisplayName?: string`, and policy `governed-gmail-conversational-metadata-disclosure.v2`, through the real chain from Gmail observation to governed conversational evidence. It shall not change recipient semantics or implement Entity Identification.

Required proofs include an unmodified full sender plus structured display name for quoted and unquoted `Cassie Kozyrkov <decision@substack.com>`; `undefined` for bare `decision@substack.com` without local-part inference; all Sprint 3.69/3.70 recipient regressions; exact publisher projection without reparsing; policy v2; and no parallel policy field.

## 25. Sprint 3.115 — Isolated Entity Identification Implementation

Only after Sprint 3.114 proves the structured field in real assembled evidence may Sprint 3.115 implement Sprint 3.112 plus `governed_first_token_display_name_alias_match`. It must prove exact full-name attribution, unique first-token resolution, no Cassandra or substring false positive, two-Cassie ambiguity with no winner, and no model dependency.

The binding sequence is:

```text
Sprint 3.113 governance contract
  → Sprint 3.114 display identity implementation
  → canonical and governed senderDisplayName become real
  → Sprint 3.115 isolated Entity Identification implementation
  → unique/multiple/zero/source-unavailable proofs
```

# Part XI — Completion Record

## 26. Repository record

```text
Repository: /workspace/jarvis
Branch: work
Starting commit: 23c886381ab137fe53504e451e2105dfe983339a
Working-tree state: Clean before Sprint 3.113 documentation was added
Real clone: Yes
```

## 27. Gap confirmation

```text
Raw sender retained by normalizer: Yes
Structured sender display name currently present: No
GovernedCommunicationEvidenceInput display name currently present: No
Publisher independently parses sender: No
```

## 28. Contract decisions

```text
Canonical normalized field: senderDisplayName
Governed conversational field: senderDisplayName
Field type: readonly string | undefined
Disclosure policy: governed-gmail-conversational-metadata-disclosure.v2
Compatibility boundary: gmail_metadata_non_authoritative_conversation_context.v1
New policyReference-equivalent field: No
Alias mechanism: Governed First-Token Display-Name Alias Match
Alias matching basis: governed_first_token_display_name_alias_match
```

## 29. Non-reopening record

```text
Sprint 3.69 recipient governance reopened: No
Sprint 3.70 production recipient parsing redesigned: No
Sprint 3.96 existing field mappings replaced: No
Sprint 3.112 Option A reopened: No
Sprint 3.112 cardinality governance reopened: No
Sprint 3.112 Identity Integrity reopened: No
Model entity matching authorised: No
Durable person identity authorised: No
```

## 30. Validation record

```text
npm test: Passed
npm run build: Passed
npm run lint: Passed
npm run typecheck: Passed
git diff --check: Passed
```

## 31. Files changed

```text
docs/SPRINT-3.113-GOVERNED-GMAIL-DISPLAY-IDENTITY-AND-ENTITY-ALIAS-CONTRACT.md
```

No code file changed. Repository searches confirmed no implemented `senderDisplayName`, no normalizer or publisher change, no resumed Entity Identification implementation, no `/api/chat` change, and no new identity resolver.

# Part XII — Binding Summary

```text
Current source reality: raw From sender retained; structured sender display name absent
Normalizer extension: senderDisplayName?: string
Governed communication extension: senderDisplayName?: string
Parsing authority: canonical Gmail normalizer only
Publisher parsing: prohibited
Recipient parsing and semantics: unchanged
Disclosure policy: governed-gmail-conversational-metadata-disclosure.v2
Policy-reference field: existing policyReference retained; no parallel field
Compatibility boundary: gmail_metadata_non_authoritative_conversation_context.v1
Exact full-name matching: exact_governed_display_name_match
Bare first-name matching: governed_first_token_display_name_alias_match
Cassie → Cassie Kozyrkov: permitted by first-token alias rule
Cassie → Cassandra Kozyrkov: prohibited
Cassie Kozyrkov + Cassie Chen: ambiguous_multiple_matches
Fuzzy, substring, and model matching: prohibited
Durable identity: prohibited
Sprint 3.112 Option A and Identity Integrity: preserved
Code changes in Sprint 3.113: prohibited
```

Upon completion, proceed exactly to **Sprint 3.114 — Gmail Display Identity Implementation**, followed only after its successful implementation and validation by **Sprint 3.115 — Isolated Entity Identification Implementation**.

**Governed Contract Complete**
