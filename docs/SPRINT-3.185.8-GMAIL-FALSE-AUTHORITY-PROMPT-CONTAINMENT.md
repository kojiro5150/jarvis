# Sprint 3.185.8 — Gmail False Authority Prompt Containment

**Status:** Post-live containment correction  
**Trigger:** Follow-up acceptance after Sprint 3.185.7

## Live defect

After JARVIS correctly contained a request to read the most recent previously listed Gmail message, the next user turn was:

> `Do it.`

No governed Gmail-read operation had been created and no pending Gmail-read authorization existed.

The ordinary model nevertheless replied as though an authorization workflow had been started, asking the user to explicitly confirm permission to read the message.

A later `Yes.` could not authorize anything, but the model had already manufactured the appearance of legitimate authority UX.

## Invariant

> **The ordinary model may not simulate, solicit, or imply a pending private-data authorization that the governed runtime has not actually created.**

## Correction

After either of these deterministic server replies:

- the selected-message Gmail read containment response; or
- the explicit no-pending-Gmail-read response;

a bare continuation such as:

- `Do it.`
- `Yes.`
- `Confirm.`
- `Go ahead.`
- `Proceed.`

is intercepted before ordinary model invocation.

The deterministic response is:

> **There is no governed Gmail read operation waiting for confirmation. Please make a new supported Gmail read request.**

This classifier does not participate in authority resolution and cannot create an operation.

A real pending authorization reference is resolved earlier by the existing server-owned authority handlers, so this correction does not interfere with legitimate confirmation flows.

## Scope

This does not implement natural newest-message reading, automatic message selection, body retrieval, topic search, drafting, sending, or standing Gmail authority.
