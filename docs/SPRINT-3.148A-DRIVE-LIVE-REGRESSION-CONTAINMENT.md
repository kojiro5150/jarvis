# Sprint 3.148a — Drive live-regression containment

## Scope

This sprint contains regressions around the frozen Sprint 3.148 `drive.read` vertical. It does not change that capability's grammar, authority, connector, MIME restriction, byte bound, OAuth scope, release, or history isolation. In particular, it adds no natural-language Drive read, search-to-read inheritance, pending read flow, or positive authority source.

## Confirmation investigation

The reported intermittent valid Drive-search confirmation failure was not reproduced at the deterministic production resolver seam. With the exact active opaque pending reference preserved, `Yes.`, `YES`, `yes!`, `yes please`, and `yes` all resolve to `ALLOW`, execute the exact stored `drive.search` proposal, and never call the ordinary model. The existing confirmation grammar already accepts every listed spelling.

Accordingly, the root cause remains **unresolved / not reproduced**. There is no evidence in this investigation that the module-private, process-local `PendingAuthorization` registry caused the live symptom, so its production behavior was not changed. The added parameterized regression is the strongest relevant seam: each spelling receives a newly created active server-owned reference and must reach the connector with the stored query and bound.

## Deny-only containment

When transcript content shows a prior governed Drive command or deterministic Drive release, the boundary records only a deny/presentation signal. If the current utterance is an anaphoric read request (`read it`, `open it`, `show it`, or `summarize it`) or a bare provider-ID-shaped token, a model-proposed specialist handoff is suppressed. This context signal cannot propose a Drive operation, invoke a connector, create pending authorization, or authorize `drive.read`.

The current user utterance still reaches the ordinary model as ordinary conversation. Prior exact Drive read commands and deterministic Drive releases remain replaced with content-free markers.

## Provenance containment

If governed Drive history was excluded, ordinary-model claims that it is re-showing an earlier result, found the document earlier, knows the document ID, or knows what the user's Drive search returned are replaced with a fixed path-scoped statement. The correction does not restore the governed ID or content to model context.

## Preserved invariants

- `drive.read <id> [text]` is the sole Drive-read authority grammar.
- Only Google Docs are supported.
- Read payloads remain capped at 65,536 bytes.
- OAuth remains `drive.readonly`.
- Release remains deterministic and isolated from ordinary-model history.
- `drive.search` authority is not `drive.read` authority.
- No new positive authority source or capability was introduced.
