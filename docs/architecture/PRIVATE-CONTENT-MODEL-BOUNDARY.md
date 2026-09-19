# Private Content → Model Boundary

**Status:** Frozen architecture contract with one bounded promoted implementation exception
**Frozen:** 30 August 2026
**Implementation reconciliation:** 19 September 2026

This document sharpens `MODEL-CONTENT-01` into an implementation gate.

> **MODEL-CONTENT-01:** Authorised deterministic release of private content to the user does not imply model access to that content. Model exposure is a separate governed capability boundary requiring its own policy, purpose, authority, and proof.

## Current state

JARVIS may deterministically present bounded private content after an exact governed read. That presentation does **not** authorise the LLM to receive the same fields for reasoning.

The default safe boundary is:

- governed acquisition;
- field/policy release;
- deterministic presentation to the user;
- **no automatic path from that presentation into ordinary model context**.

One capability-specific exception has now been promoted: governed Gmail invitation-decline composition. That path does not replay a prior visible release into ordinary model history. It performs a fresh one-shot exact-message re-read under current authority, admits only the bounded evidence required by the frozen drafting contract, uses a distinct governed model channel, keeps sender and subject server-owned, accepts only the proposed body from the model, and omits the derived private draft from later ordinary model history. The production processing bound is 16,000 code units. This exception authorises no other private summarisation, drafting purpose, revision, reuse, persistence or sending.

## Separate purpose classes

Future private evidence visibility must distinguish at least:

- **presentation** — deterministic release to the user;
- **clarification** — minimum evidence needed for bounded disambiguation;
- **reasoning** — interpretation, summarisation, comparison, prioritisation or synthesis;
- **execution** — evidence used to validate or perform an authorised operation;
- **verification** — evidence used to prove a consequential result.

> presentation authority ≠ reasoning authority

> reasoning visibility ≠ execution authority

Authority for one purpose never silently authorises another.

## Required preconditions for model exposure

Before private content is intentionally supplied to an LLM, server-owned governance state must establish:

1. exact capability and source;
2. exact resource identity or governed result set;
3. exact reasoning purpose;
4. minimum admissible fields;
5. field-level policy decision;
6. provenance for every exposed field;
7. freshness / observation time;
8. exposure lifetime;
9. whether cross-source combination is permitted;
10. whether derived interpretation may persist;
11. how later turns lose access;
12. authority effects that remain prohibited.

No item substitutes for another.

## Model-visible projection

If implemented later, model input must be a purpose-built governed projection, not arbitrary connector output or replayed transcript prose.

Examples:

- subject-only reasoning does not imply body exposure;
- body reasoning does not imply attachment exposure;
- one-message reasoning does not imply mailbox-history exposure;
- Gmail reasoning does not imply Calendar or Drive exposure;
- two independently authorised sources do not imply cross-source synthesis.

## No ambient-history rule

> Private evidence exposed for one bounded purpose must not become ambient ordinary-model history.

A later turn must not inherit model visibility merely because the user saw the content previously, the model saw it in a prior bounded reasoning turn, the transcript contains rendered private text, or a prior authority grant existed.

## Derived interpretation

Model reasoning over governed private evidence creates **derived interpretation**, not source fact.

Derived interpretation must retain provenance, timestamp/staleness semantics, declared purpose, and a clear distinction between observed fact and inference. Model confidence cannot upgrade inference into provider truth.

## Identity, authority and exposure remain separate

> identity resolved ≠ read authority ≠ deterministic user release ≠ model exposure ≠ execution authority

A server-owned reference may identify an exact item while still providing no permission to acquire, display, reason over, or act on it.

## Cross-source rule

Two independently authorised private sources do not create authority to combine them. Cross-source reasoning requires an explicit purpose that names the permitted sources and fields.

## Failure semantics

Future private-content reasoning must distinguish at least source unavailable, policy denied, field unavailable, reasoning purpose not authorised, exposure expired, provenance missing, cross-source combination prohibited, and model invocation failed.

Failure must never trigger broader reacquisition, silent field widening, transcript reconstruction, reuse of presentation authority, or invention of missing evidence.

## Default invariant and promoted exception

> **No private deterministic release may be supplied to the ordinary JARVIS model as reasoning context merely because it was previously displayed to the user.**

This remains the default for Gmail body content, sender/subject list content, Drive private document content, governed Calendar private releases and later transcript replay.

The sole promoted exception as of 19 September 2026 is the exact governed Gmail invitation-decline composition class described above. Its authority and evidence are reacquired through its own capability-specific path; it is not an exception to the no-ambient-history rule and it creates no standing model visibility or provider write authority.

## Adversarial acceptance matrix

Any implementation PR that crosses this boundary must prove at least:

1. display authority alone cannot produce model exposure;
2. a request such as “summarise that” after deterministic display does not gain body access from transcript replay;
3. model exposure is limited to exact authorised fields;
4. withheld fields are unavailable, never inferred absent;
5. a later turn does not inherit prior reasoning exposure;
6. cross-source reasoning is denied unless explicitly included in purpose;
7. model output cannot create, widen, or renew exposure authority;
8. provider IDs are not reconstructed from presentation prose;
9. derived interpretation is not source fact;
10. ordinary model history remains private-content-free after the bounded reasoning turn;
11. expired reasoning state cannot be repaired from model memory;
12. failure to reason does not cause silent broader retrieval.

## Exit condition for additional capability classes

This contract does not authorise any implementation beyond the single promoted Gmail invitation-decline class recorded above. Any additional capability crossing this boundary must earn its own bounded purpose, server-owned exposure state, field projection, lifetime, provenance, adversarial review and regression/live proof. A successful implementation in one capability does not transfer model-visibility authority to another.