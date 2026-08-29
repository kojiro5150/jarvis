# Sprint 3.185.7 — Gmail Follow-up Containment

**Status:** Post-live containment milestone  
**Capability level:** Level 1 — Know only  
**Trigger:** Live GS002A follow-up failure

## Live failure

A governed sender search correctly reached an ambiguous result:

> Georgia McDonald  
> Georgia Radford

The next user utterance was a bare sender refinement:

> `Georgia MacDonald.`

That utterance was not a new governed Gmail request and did not carry Gmail authority. Because the ambiguous sender result had no server-owned continuation state, the turn fell through to ordinary model generation.

The model then presented unsupported private-mailbox claims, including message counts, dates, thread interpretation, and later purported message-body content.

The core failure was therefore not sender matching itself. It was loss of the governed continuation boundary after ambiguous private evidence had already been acquired.

## Containment invariant

> **A follow-up to governed private evidence may refine the governed operation only through server-owned typed state. It may never fall through to ordinary model generation as though private evidence had been acquired.**

A second invariant is frozen with it:

> **Subject-list discovery does not confer message-body read authority. A later request for the most recent, latest, newest, first, or otherwise selected email must independently pass a governed Gmail-read boundary.**

## Sender disambiguation reference

When an authorised sender search resolves to more than one real mailbox identity, the server now creates an opaque sender-disambiguation reference.

The client receives only:

```json
{ "gmailSenderDisambiguationReferenceId": "<opaque id>" }
```

The real candidate names and addresses remain server-owned.

A bare next-turn refinement such as:

> `Georgia McDonald.`

is resolved only against those stored real candidates using the existing strict, order-independent, all-tokens-required matcher.

It does not invoke the ordinary model.

If the refinement uniquely matches one candidate, JARVIS continues the already-authorised bounded sender search and returns the existing subject-only result shape.

If the refinement is misspelled or otherwise does not uniquely match, JARVIS asks the user to use the exact displayed name or address. It does not fuzzy-match.

## Read follow-up containment

Governed sender-result releases and governed sender-ambiguity releases are now classified as private Gmail history for the ordinary-model boundary.

Follow-ups such as:

> `Yes, the most recent email.`

are denied before ordinary model invocation.

JARVIS does not identify or read a prior message from model context. A separate governed Gmail-read request and authority are required.

## Scope discipline

This milestone does not add:

- topic search;
- fuzzy sender matching;
- body or snippet exposure;
- automatic newest-message selection;
- drafting;
- sending;
- mailbox mutation;
- Contacts integration;
- standing Gmail authority.

It closes a verified continuation bypass before any further Gmail capability expansion.
