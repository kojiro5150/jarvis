# Gmail Governed Invitation-Decline Drafting — Frozen Contract

**Status:** Doctrine **FROZEN** on 10 September 2026. No implementation or production proof is claimed.

## Purpose

This milestone resolves one historical failure shape: after an authorised Gmail read established a LinkedIn connection invitation from Raman Bhola, an ordinary model drafted a reply about a fabricated lunch invitation on Thursday.

V1 permits JARVIS to re-read one exact current Gmail message under fresh authority and prepare a bounded **thank-and-decline invitation draft** grounded in that evidence. It does not implement general Gmail drafting, summarisation, editing, sending or mailbox mutation.

## Constitutional boundary

JARVIS may recognize a supported drafting request and propose the exact private re-read required to fulfil it. Neither the model, prior release, conversation history nor possession of an opaque reference may manufacture authority.

The operation sequence is fixed:

```text
closed current-user drafting request
→ one valid current Gmail release reference
→ exact server-owned resource resolution
→ purpose-bound one-shot re-read proposal
→ explicit confirmation
→ exact provider re-read under current policy
→ 16,000-code-unit admission gate
→ dedicated Gmail drafting model channel
→ deterministic output validation
→ visible draft-only release
→ fixed omission from later ordinary model history
```

## V1 supported intent

The only supported semantic intent is:

```text
thank the sender for an invitation and politely decline it
```

Recognition uses a closed deterministic grammar over the current user turn. It must include all of:

- an explicit draft/reply request;
- the current email, its sender, or an explicitly named addressee;
- a thank/appreciation instruction; and
- an explicit decline/pass/cannot-accept instruction.

The exact historical acceptance phrase is mandatory:

```text
Draft a reply to Raman, saying thank you for the invite but politely decline.
```

Equivalent bounded forms may vary punctuation, `invite`/`invitation`, `draft`/`write`, and `decline`/the already-frozen deterministic decline grammar. Free-form semantic classification by a model is prohibited.

Requests such as `Draft a reply to that email` without the closed thank-and-decline intent remain contained as unsupported. A later grammar miss may add the exact observed phrase plus a permanent regression test; it must not justify broad model intent classification.

## Current release binding

The current transport carries at most one `gmailPrivateReleaseReference`, and the console stores one mutable current slot. A successful later Gmail read overwrites that client-held slot.

- Drafting may bind only to the single current conversation-carried Gmail release reference.
- It must never enumerate the server map or select the newest, closest or semantically similar record.
- Older server records may survive until expiry but cannot be recovered through descriptive language after their client handle is replaced.
- Separate tabs may retain different current handles; neither globally supersedes the other.
- The reference must resolve to one eligible Gmail record with the required resource and field scope.
- Missing, expired, fabricated or capability-mismatched release state fails closed.

If a future transport permits multiple concurrent Gmail release handles in one request, that is a new contract. Deterministic clarification becomes mandatory and model selection remains prohibited.

## Named addressee

The closed grammar may capture a user-supplied display name such as `Raman`. That name is an instruction constraint, not a resource selector and not evidence.

After authorised re-acquisition, the server deterministically compares the normalized captured name with the acquired sender display identity. If it does not match unambiguously, no model call occurs and JARVIS asks the user to restate the request against the current email. The model never resolves person identity.

## Purpose-bound authority

Drafting requires a new server-owned pending operation dedicated to:

```text
gmail.read_for_invitation_decline_draft
```

The pending record contains only the exact provider resource identity, required field set, constant draft intent, optional normalized named-addressee constraint, originating Gmail release-reference identity, creation/expiry state and one-shot status.

It does not contain the Gmail body, credentials or standing authority. The client receives only an opaque pending-authorization reference.

The authority prompt is fixed in substance:

```text
I can re-read the previously released Gmail message to prepare a thank-and-decline draft. Please explicitly confirm that I may read that exact message again.
```

The existing closed confirmation grammar applies unchanged. Bare confirmation without the exact pending reference creates no operation. Confirmation is one-shot and authorises only the exact re-read for this drafting purpose; it does not authorise sending.

## Re-acquisition

After confirmation, JARVIS must:

1. resolve and consume the exact pending authorization;
2. re-resolve the originating current Gmail release reference;
3. recheck Gmail capability, exact resource identity, required fields, TTL and eligibility;
4. load the current content-retrieval policy;
5. re-read exactly that provider message;
6. request only `sender`, `subject` and `plain_text_body`;
7. fail closed on provider, authentication, policy or identity mismatch; and
8. use the existing specific Google connection-recovery messages where applicable.

No content is taken from the visible historical release or omission marker. Re-acquisition must not fall back to fixtures, local data, another Gmail result or a different message.

## Processing admission

The frozen capacity record is:

- `GMAIL-GOVERNED-DRAFTING-PROCESSING-BOUND-FREEZE.md`

The server constructs the exact model-bound Gmail evidence presentation from the policy-released sender, subject and plain-text body, then measures its JavaScript string length.

- At or below **16,000 code units:** eligible for the dedicated drafting model channel.
- Above **16,000 code units:** fail closed with an honest processing-limit response.
- Silent truncation, partial-draft claims and excerpt substitution are prohibited.

The 16,000 limit does not alter deterministic display, ordinary 8,000-character message validation or 39-message history compaction.

## Governed model channel

The existing `GovernedContextSource` is Calendar-only, and the existing `callClaude` governed-context instruction is explicitly Calendar-specific. Neither may be widened by spreading Gmail fields into the Calendar path.

Implementation requires a distinct `GmailInvitationDeclineDraftContextSource` and a source-specific provider serializer. The model receives only:

- a fixed drafting system instruction;
- the current user’s bounded thank-and-decline instruction;
- acquired sender display identity;
- acquired subject;
- acquired plain-text body; and
- a fixed structured-output contract.

Prior conversational history, prior private releases, provider IDs, opaque references, credentials, authority records, connector objects and hidden Gmail metadata are excluded. No tools, web search, web fetch, memory retrieval or specialist handoff is available in this call.

The measured configuration remains `claude-sonnet-4-5-20250929`, 1,024 maximum output tokens and 30-second timeout. A material change triggers remeasurement under the processing-bound freeze.

## Output contract

The provider must return exactly:

```json
{
  "draft": "<thank-and-decline draft>"
}
```

Raw JSON or one complete JSON code fence may be accepted. Prose around the structure, additional keys, missing keys or a non-string value fail closed. Sender and subject remain server-owned evidence: they are never requested from, accepted from, or rewritten by the model. The visible envelope is constructed deterministically from the freshly acquired Gmail fields.

Deterministic validation requires:

- a non-empty draft within the ordinary visible-message bound;
- one bounded thank/appreciation signal;
- one bounded decline/inability/pass signal;
- no weekday, month, calendar date, clock time, meeting, appointment, call, lunch, URL, email address, phone number or monetary amount absent from both the acquired evidence and current user instruction; and
- no claim that the message was sent, queued, saved to Gmail or otherwise acted upon.

The model cannot attest its own grounding. Any deterministic validator uncertainty fails closed with no draft presented. Grammar evolution follows exact observed evidence plus permanent regression tests; it never delegates validation to another model.

## Draft presentation and replay

The validated draft is shown as a proposed draft, never as a sent reply. Its provenance is stated compactly: drafted from the freshly authorised exact Gmail message on the current turn.

The generated draft is derived private content. The visible client transcript retains it, but subsequent ordinary model history replaces the entire draft release with a fixed deterministic projection:

```text
[Prior governed Gmail draft omitted; editing or reuse requires a separately governed path.]
```

No excerpt or model-authored summary is retained during replay projection. V1 does not create an editing reference, and requests to revise, expand, shorten, send or otherwise reuse the omitted draft are contained before ordinary model invocation.

## Failure behaviour

- No current release reference: ask the user to read the intended message again.
- Expired or missing release: state that the prior message is no longer eligible and require a fresh search/read.
- Fabricated or mismatched reference: fail closed without disclosing provider identity.
- Named-addressee mismatch: ask the user to restate against the current message.
- Re-acquisition auth failure: use the existing connect/reconnect guidance.
- Policy denial or provider failure: report the specific bounded failure without drafting.
- Model-bound presentation above 16,000 code units: state that the complete message cannot safely be processed; do not truncate.
- Model timeout, malformed structure or validation failure: state that no safe draft was produced.
- Repeated confirmation after one-shot consumption: create no read and no draft.

## Explicit exclusions

V1 does not provide:

- general email drafting;
- summarisation or analysis;
- draft revision or conversational editing;
- Gmail Draft creation;
- sending, replying, forwarding, labelling, filtering, moving or deleting;
- attachments or attachment-content reasoning;
- multiple-message synthesis;
- multiple concurrent release selection;
- standing or delegated Gmail authority;
- ambient private context; or
- model-decided intent, identity, authority or evidence selection.

## Acceptance tests

1. The exact Raman phrase binds to the single current valid Gmail release and creates no model call before authority.
2. The authority prompt names the bounded exact-message re-read and thank-and-decline drafting purpose.
3. Closed confirmation re-acquires exactly the referenced provider message once.
4. The acquired field set is exactly sender, subject and plain-text body.
5. The provider ID and opaque references never enter model context or visible output.
6. The dedicated Gmail context type cannot be constructed as Calendar context.
7. The source-specific serializer contains no Calendar-only instruction.
8. Prior conversation and prior private releases are absent from the drafting request.
9. Evidence presentation at exactly 16,000 code units is admitted.
10. Evidence presentation above 16,000 code units fails before model invocation.
11. No truncation or excerpt substitution occurs.
12. Exact sender and subject are preserved from acquired server evidence; a model attempt to return either field, including a `Re:` subject mutation, fails closed.
13. A valid thank-and-decline draft passes deterministic validation.
14. The exact historical fabricated `lunch` and `Thursday` details are rejected.
15. Unsupported concrete arrangements absent from evidence/instruction are rejected.
16. Missing, expired, fabricated and cross-capability release references fail closed; consumed pending authority cannot be reused.
17. Named-addressee mismatch produces no model call.
18. A second Gmail read replaces the client’s current handle; drafting binds only to that handle.
19. An older server record is not rediscovered through language after client replacement.
20. Two tabs may independently use their own current handles without global newest-record selection.
21. Provider/authentication and policy failures produce no draft and preserve specific recovery guidance.
22. Repeated confirmation cannot re-read or redraft.
23. The visible draft is labelled proposed and never sent.
24. Later ordinary model history contains only the fixed draft-omission projection and no excerpt.
25. Edit, shorten, expand and send follow-ups are contained before model invocation.
26. The original synthetic Raman-shaped regression produces a grounded thank-and-decline draft with no lunch, Thursday or fabricated subject.
27. The complete repository test suite, typecheck, lint and production build pass.

## Promotion sequence

Doctrine approval does not authorise implementation. Promotion requires separate milestones:

1. frozen contract merged and verified on fresh `main`;
2. dedicated type, proposal, authority, acquisition, model-channel, validator and replay-boundary implementation;
3. adversarial automated proof of every applicable acceptance condition;
4. local production build;
5. live exact Raman-shaped test through the real console and provider path; and
6. only then, an explicit capability promotion record.
