# Sprint 3.152b — Calendar truthfulness and presentation closure

## Baseline and scope

**OBSERVED:** Work began at `ec8a7b1dac1ec96b447d05109facd6cb09801eee`, the expected merged Sprint 3.152a commit. The checkout had not advanced. This sprint changes presentation containment only. It does not change Calendar authority evaluation, proposal grammar, pending authorization, operation/window selection, connector acquisition, provider projection, or deterministic exact binding.

## Live acceptance evidence

**OBSERVED:** The six post-3.152a live runs comprised voice and typed variants of pure recall, a 10 AM exactly bound user detail, and an unrelated 9 AM detail. Pure recall passed. Exact 10 AM binding, user provenance, 3 PM unknown handling, and 9 AM isolation passed. Remaining failures were intermittent fake-authority refusal or false capability language on the ordinary fact turn, current-possession language during recall, source-absence claims from omitted projected fields, and the internal `9:0:AM` comparison clock in presentation.

**OBSERVED:** 3.152a therefore established exact start-clock binding and rejected fuzzy or nearest-time association. Those semantics remain unchanged.

## Root causes

* **False authority — OBSERVED:** `presentsPrivateAuthorityConfirmation` inspected only model output. Its unconditional late guard returned `NEUTRALIZED_ORDINARY_AUTHORITY_REPLY` without testing whether the current user utterance requested private acquisition. Thus a hallucinated confirmation prompt corrupted a plain timed user assertion.
* **Read capability — OBSERVED:** false-global-capability correction required `calendar` in the user utterance. “My 10 a.m. meeting…” did not satisfy that trigger, so a model-wide Calendar access denial survived.
* **Write offers — OBSERVED:** no deterministic Calendar write-offer guard existed outside the narrower metadata-reread containment family.
* **Recall provenance — OBSERVED:** rewrite families were primarily leading, exact phrase grammars and omitted “calendar information I have access to,” “based on what I can see,” “projection I saw,” and “projection I have access to,” including phrases later in a response.
* **Projection epistemics — OBSERVED:** no output guard distinguished a field omitted by the governed projection from a field proven absent at the provider source.
* **Clock leak — OBSERVED:** unbound mismatch presentation interpolated `detail.clock` directly. That field intentionally carries `hour:minute:meridiem` comparison normalization, including unpadded zero minutes.

## Bounded corrections

**OBSERVED:** The reply guard now recognizes only the existing narrow timed Calendar fact grammar as deny-side presentation state. On such a turn it replaces hallucinated authority UX with a neutral acknowledgement, false global Calendar denial with conditional governed-read language, and bounded Calendar write offers with a truthful unsupported-write statement. This classification is not passed to authority resolution and cannot authorize, acquire, propose, bind, or create pending authorization.

**OBSERVED:** Actual Calendar/Gmail/Drive acquisition utterances retain fake-authority neutralization. Non-Calendar update prose and generic sight language remain unchanged.

**OBSERVED:** Server-established Calendar recollection enables bounded, whole-response provenance replacements. Server-established current or recalled Calendar state enables bounded projection-absence correction. Neither mechanism runs globally.

**OBSERVED:** `displayCalendarClock` is now the single presentation conversion for normalized comparison clocks at the mismatch seam. Equality normalization remains unchanged.

## Authority and privacy implications

**OBSERVED:** No authority evaluator, connector, operation, pending-authorization, provider, projection allow-list, or transport-history code changed. Ordinary facts remain neither authority nor evidence that an event exists. Corrections do not trigger a Calendar read.

**INFERRED:** The narrower false-authority boundary improves privacy UX without weakening private-source controls because genuine acquisition language remains subject to the existing deterministic authority path and ordinary model confirmations remain non-authoritative.

## Remaining unknowns

**UNKNOWN:** Model providers can emit additional wording families not observed in the six live runs. New families should be admitted only through exact regressions and bounded Calendar state, not broad lexical rewriting.

**UNKNOWN:** No live provider rerun is represented by unit fixtures; production acceptance should repeat the same voice and typed suite against the exact committed head.
