# Sprint 3.62 — Operator Promotion Checklist

This checklist must be executed by the repository owner on the actual JARVIS machine. Codex has not
accessed that runtime. If any check fails, restore or leave the actual runtime in `LEGACY`, record
the evidence, classify the issue, and create a separately governed corrective sprint.

## Preconditions

- [ ] Confirm the Sprint 3.62 repository recommendation is `Ready for Operator Promotion`.
- [ ] Confirm the local checkout is the authoritative promoted commit and record `git rev-parse HEAD`.
- [ ] Record the current branch with `git branch --show-current`.
- [ ] Confirm `git status --short` contains no unintended changes.
- [ ] Record the current presentation-mode configuration without recording unrelated secrets.
- [ ] Record whether JARVIS is running and the promotion start time.

## Select and verify governed mode

- [ ] In the actual local `.env.local`, set exactly:

  ```text
  DASHBOARD_PRESENTATION_MODE=GOVERNED
  ```

- [ ] Do not change the code-level fallback and do not edit source to force the mode.
- [ ] Stop the actual JARVIS process.
- [ ] Restart it with the established local operating command (`npm run dev` or the established
      production-mode local command) so `.env.local` is reloaded.
- [ ] Open the Dashboard used in daily operation and confirm the application loads with no runtime
      error and is visibly using the governed presentation.
- [ ] Confirm commitments use the governed order and a cancelled commitment is not selected as the
      next active commitment.
- [ ] Confirm projects render without reconstructed progress.
- [ ] Confirm communications and their expected metadata render correctly.
- [ ] Confirm relative-time wording is sensible and connector summary behaviour is correct.
- [ ] Confirm layout, disclosure interactions, operational content, and overall visual result are
      acceptable. Record any visual defect before proceeding.

## Verify actual rollback

- [ ] Change the actual `.env.local` to:

  ```text
  DASHBOARD_PRESENTATION_MODE=LEGACY
  ```

- [ ] Restart the actual JARVIS process.
- [ ] Open the real Dashboard and confirm it loads, the legacy presentation renders, expected legacy
      behaviour remains available, and no runtime error occurs.

## Restore governed mode

- [ ] Change the actual `.env.local` back to:

  ```text
  DASHBOARD_PRESENTATION_MODE=GOVERNED
  ```

- [ ] Restart the actual JARVIS process again.
- [ ] Confirm the real Dashboard loads, governed presentation is active, no runtime error appears,
      and the application remains usable.

## Record the operator decision

- [ ] Record date and time, commit SHA, and final local presentation selection.
- [ ] Record governed rendering, legacy rollback, governed restoration, and visual verification
      results, plus every outstanding issue.
- [ ] Complete promotion only if every check above passes.

Do not complete promotion if the real runtime exhibits startup failure, an exception, a blank or
incomplete Dashboard, missing expected content, unacceptable visual regression, broken layout or
interaction, rollback failure, restoration failure, or disagreement between configured and observed
mode. Actual operator runtime evidence takes precedence over isolated repository assurance.
