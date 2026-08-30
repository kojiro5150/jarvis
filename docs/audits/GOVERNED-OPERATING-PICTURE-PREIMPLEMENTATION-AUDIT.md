# Governed Operating Picture — Pre-Implementation Audit

**Date:** 30 August 2026  
**Status:** Historical pre-implementation audit; first implementation and persistence foundations subsequently completed and verified on 30 August 2026. See `docs/architecture/GOVERNED-OPERATING-PICTURE-FOUNDATION-VERIFICATION.md`.  
**Purpose:** Establish what already exists, what must remain separate, and the minimum safe first implementation step for the bridge from “JARVIS can safely access the user's world” to “JARVIS can truthfully hold an operating picture of it.”

## 1. Audit question

> What must JARVIS be able to retain about the user's operating world, with what semantic status and provenance, without turning conversation history, private connectors, model prose, or legacy state into an undifferentiated memory blob?

## 2. Observed current state

### A. Legacy OperationalState is not the answer

`lib/operational-state-quarantine.test.ts` proves the callable eager full-state surface is held at zero. The former `/api/operational-picture` and `/api/operational-state` routes are expected to return `410`, production clients do not call them, and the legacy Memory editor is marked unavailable.

**Conclusion:** Do not revive `OperationalState` or the old Memory editor as the Operating Picture.

### B. GovernedContext is real but current-turn and narrow

`lib/lighter-jarvis/governed-context.ts` currently defines a server-created current-turn `GovernedContext` whose source union is Calendar-only. It exists to release bounded governed evidence into a specific model invocation.

**Conclusion:** GovernedContext is a delivery boundary, not durable memory.

### C. Situational Awareness already owns current operational truth

The active System Architecture defines Situational Awareness as “Current Operational Truth, Not Remembered Conversation.” It is a deterministic projection of bounded operational facts from authoritative sources, with canonical identity, availability and source-level provenance. The projection is explicitly not a transcript, memory store, embedding index, or reconstruction of past conversation.

**Conclusion:** The Operating Picture must consume or reference this canonical state where appropriate, not duplicate it.

### D. Conversation continuity exists but is intentionally low-trust

The Governance Core already states: “Conversation state may preserve meaning, but never manufacture authority.” Model history sanitisation also deliberately removes governed private releases from ordinary model context where required.

**Conclusion:** Conversation history may help identify referents and user-supplied context, but must not become a hidden provenance mechanism.

### E. The trust-bearing type system exists

`ValidatedOperation`, `AuthorityEvidence`, `GovernedEvidence`, `GovernedProvenance`, `PolicyProof`, `VerificationProof`, and `CompletionProof` are real. `MODEL-TRUST-01` prevents model-authored material from inhabiting those trust-bearing categories.

**Conclusion:** Operating Picture types must preserve this asymmetry. A model-authored inference can be stored as an inference, but must never acquire `GovernedEvidence` semantics by persistence alone.

## 3. Architecture to avoid

Do not build:

~~~text
Calendar + Gmail + Drive + chat + model summaries
                 ↓
          vector / JSON memory
                 ↓
              JARVIS
~~~

That destroys distinctions that are currently load-bearing: source fact versus model inference; current observation versus remembered statement; user assertion versus provider evidence; plan versus decision; recommendation versus approved action; stale versus current; visible-to-user versus visible-to-model; prior authority versus current authority.

## 4. Target conceptual boundary

~~~text
AUTHORITATIVE / GOVERNED SOURCES
        │
USER-SUPPLIED CONTEXT
        │
MODEL COGNITION
        │
        ▼
SEMANTICALLY TYPED OPERATING-PICTURE RECORDS
        │
        ├── class
        ├── provenance / authorship
        ├── temporal state
        ├── lifecycle state
        └── allowed-use / visibility boundary
        │
        ▼
PURPOSE-BOUNDED PROJECTION
        │
        ▼
JARVIS REASONING / EXECUTIVE COGNITION
~~~

The Operating Picture is a governed projection and continuity layer, not an evidence source that can originate truth independently.

## 5. Initial semantic vocabulary

| Class | Meaning | May be model-authored? | May be treated as fact without additional proof? |
|---|---|---:|---:|
| `fact` | Proposition established by a trusted source boundary | No | Yes, within provenance/freshness scope |
| `user_assertion` | Proposition explicitly supplied by the user | No | As user-supplied context only |
| `inference` | Derived interpretation or conclusion | Yes | No |
| `plan` | Intended future course | User or governed system | No; intention is not completion |
| `commitment` | Explicit obligation/commitment record | Source/user governed | Only within source semantics |
| `decision` | Explicitly made decision | User/governed decision source | Does not imply execution |
| `preference` | User preference | Prefer explicit user source initially | No factual-world implication |
| `recommendation` | Suggested course of action | Yes | Never authority |
| `open_question` | Known unresolved uncertainty | Yes | No |

## 6. Lifecycle semantics before persistence

At minimum, records need explicit support for observation/statement time, effective validity where relevant, staleness where deterministically defined, supersession, source/authorship identity, and purpose/visibility rules. A generic TTL must not decide truth.

## 7. Authority boundary

The Operating Picture must never contain reusable action authority. It may record that an approval occurred, an operation executed, or a verified postcondition existed at a given time for explanation/audit. Those records cannot authorise a future read or write.

> **Persistence preserves history. It does not preserve authority.**

## 8. Private-content boundary

A durable Operating Picture creates a new risk: private data could become ambient merely because it was stored once. Acquisition remains governed; projection requires an explicit purpose/field contract; retention does not imply model visibility; retrieval into a model turn is purpose-bounded; raw Gmail bodies and raw Drive content are excluded from the first milestone.

## 9. Contradiction and supersession

The system must not implement “last write wins” as truth. When source and entity identity establish supersession, the earlier record becomes historical/superseded and the later record becomes current. The earlier observation is not deleted or rewritten.

## 10. First proving implementation

The first code PR should create only a closed, immutable type boundary for Operating Picture records and lifecycle state.

It should prove structurally that:

- every record has exactly one semantic class;
- model-authored `inference` / `recommendation` cannot be constructed as trusted `fact`;
- fact records require trusted provenance/evidence inputs;
- user assertions retain user authorship rather than being relabelled as provider facts;
- no record type can carry reusable `AuthorityEvidence`;
- stale/superseded state is explicit rather than inferred by ordinary model code;
- records are immutable after construction.

### Explicit exclusions

No database persistence, Supabase tables, embeddings/vector retrieval, automatic chat-memory extraction, connector acquisition, arbitrary private-content model exposure, cross-role inference, priority/urgency scoring, proactive notifications, action execution, or UI completeness claims.

## 11. Proposed first code milestone

> **Governed Operating Picture PR A — semantic record core**

Create a small module under the Governance Core or an adjacent `operating-picture` boundary defining the closed semantic union and trusted constructors required to preserve provenance/authorship distinctions. No runtime consumer should be added in PR A.

The proving question is:

> **Can the type system prevent JARVIS from remembering the wrong kind of thing as truth?**

## 12. Audit verdict

**Ready for a bounded type-first implementation.**

The repo already contains governed acquisition, canonical Situational Awareness, current-turn GovernedContext, trust-bearing types, and deterministic executive cognition, but not a durable governed continuity layer joining them. The next milestone therefore begins with semantic distinctions and lifecycle rules, not storage.
