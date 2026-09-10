# Gmail governed drafting capacity measurement

This measurement-only harness establishes an empirical private-content processing bound before governed Gmail drafting is implemented. It does not modify `callClaude`, production routing, authority, or the ordinary 8,000-character message limit.

## Safety and privacy

- The default command is plan-only and makes no provider calls.
- Live execution requires the explicit `--run` flag and `ANTHROPIC_API_KEY`.
- All fixtures and retained histories are deterministic and synthetic.
- Reports contain fixture digests and measurements, never prompt or response content.
- Raw JSON and exactly one complete JSON code fence are accepted; JSON surrounded by prose remains malformed.
- Privacy-safe response diagnostics record only response length, block types, text-block count, response format, stop reason, and usage.
- The report is atomically checkpointed after every completed call. An interrupt preserves completed results and records the remaining count without claiming completion.
- Real Anthropic token usage is recorded on successful responses. Failed calls report usage as unavailable; the harness never estimates it.
- Live reports are written under `data/capacity-measurements/`, which is ignored by Git.

## Matrix

The screening phase contains 20 fixture/size cells across empty, representative 39-message, and maximum-admissible 39-message histories: 60 calls total. Maximum history contains 39 messages of 7,999 characters each (311,961 characters).

Failures remain distinct: client validation, provider rejection, provider context-limit response, 30-second timeout, malformed response, and fidelity failure.

## Run

Inspect the plan without making API calls:

```bash
npm run measure:gmail-drafting
```

Run screening and write a privacy-safe report:

```bash
npm run measure:gmail-drafting:live -- --phase screening --output data/capacity-measurements/gmail-screening.json
```

Repeat the nearest successful and first failing boundary candidates five times:

```bash
npm run measure:gmail-drafting:live -- --phase boundary --screening-report data/capacity-measurements/gmail-screening.json --output data/capacity-measurements/gmail-boundary.json
```

The safe bound is not chosen by this harness automatically. Review the evidence and freeze the largest size that passes all five boundary repetitions, apply the agreed safety margin, and use the smallest safe result across all history conditions.

If maximum-admissible history fails because the complete request envelope exceeds provider capacity, stop Gmail drafting work. Create a separate capability-neutral aggregate model-input budgeting contract and PR; do not patch that transport concern into Gmail drafting.

## Resume provider rejections

If billing, quota, or another provider-wide rejection interrupts a complete screening report, inspect the resume plan without making calls:

```bash
npm run measure:gmail-drafting -- --phase screening --resume-report data/capacity-measurements/gmail-screening.json
```

Then explicitly rerun only the `provider_rejection` cells into a new consolidated report:

```bash
npm run measure:gmail-drafting:live -- --phase screening --resume-report data/capacity-measurements/gmail-screening.json --output data/capacity-measurements/gmail-screening-resumed.json
```

Resume requires the exact 60-cell screening matrix and matching model configuration. It retains passes and fidelity failures, replaces only provider rejections, records the source report digest, and never overwrites the source report.

To retry only fidelity failures after a deterministic validator correction, add:

```bash
--retry-failure fidelity_failure
```

The consolidated report records separate `hasThankSignal`, `hasDeclineSignal`, and `hasForbiddenDetail` booleans for newly measured drafts. It never retains draft text. The bounded decline grammar accepts explicit decline, inability to accept or participate, and clear “have to pass”/“pass on” formulations; it does not delegate semantic classification to another model.

For a completed 16-cell, five-attempt boundary report interrupted by provider credit rejection, inspect the exact retry plan:

```bash
npm run measure:gmail-drafting -- --phase boundary --resume-report data/capacity-measurements/gmail-boundary.json
```

Then rerun only the rejected attempt identities into a new report:

```bash
npm run measure:gmail-drafting:live -- --phase boundary --resume-report data/capacity-measurements/gmail-boundary.json --output data/capacity-measurements/gmail-boundary-resumed.json
```

Boundary resume requires exactly 16 distinct cells with attempts 1 through 5. It preserves successful and fidelity-failure attempts in their original order, replaces only provider rejections at the same attempt number, and rejects incomplete, duplicate, mismatched, or non-boundary evidence.
