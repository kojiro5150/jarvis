# Executive Cognition Integration Under Deterministic Significance

**Status:** Step D implementation boundary  
**Baseline:** `main` at `65fad836f39f0178f415a071fb8d32321d33baa7`

## Product question

What observed behaviour does this enable that the current architecture cannot?

> JARVIS can publish a deterministic executive orientation from already-governed Calendar, Gmail and Drive evidence that distinguishes **what changed**, **what warrants attention**, and **what explicit dependencies exist**, without allowing source text or a model to manufacture significance.

This is an **Understand / orientation** capability. It is not Act.

## Canonical path

```text
already-governed source evidence
        ↓
ProjectionArtifact boundary
        ↓
canonical Situational Awareness snapshots
        ↓
deterministic lifecycle comparison
        ↓
existing ADR-0009 Attention Policies
        ↓
Situation Formation
        ↓
Situation Assessment
        ↓
Executive Context
        ↓
Executive Orientation publication
        ↓
model-free deterministic renderer
```

No model participates in this path.

## Significance rule

A change appears in **What warrants attention** only when an existing registered Attention Policy matches a canonical lifecycle change.

Source assertions are never sufficient.

The following strings have no independent significance power:

- `URGENT`
- `CEO REQUEST`
- `BOARD PRIORITY`
- threats
- hierarchy claims
- source-authored instructions
- model judgement

They may exist as governed source evidence where the relevant source contract permits them. They do not create an Attention Record.

## Source boundaries

### Calendar

Calendar commitments already have deterministic Attention Policies for:

- transition to cancelled;
- start-time change;
- bounded removal;
- source availability becoming unavailable.

Those policies may place a Calendar change in **What warrants attention**.

### Gmail

Gmail operational communications already project into canonical Situational Awareness.

Step D deliberately does **not** add `communications` to the Attention domain vocabulary. A new message, sender name, subject, `URGENT`, executive-name claim or thread content therefore cannot independently create significance.

Gmail contributes to:

- **What changed** through canonical communication lifecycle changes;
- **Explicit dependencies** through protocol-level `In-Reply-To` and `References` relationships.

These dependency relationships are descriptive, not ranked and not treated as attention.

### Drive

No semantic Drive projection is earned yet.

The new Drive source projection publishes only:

- source identity;
- source availability;
- observation time;
- bounded governed-evidence count as artifact metadata.

Drive filenames, paths, document content and source-authored labels are not projected into canonical executive entities.

Drive may enter **What warrants attention** only through the already-existing deterministic source-availability policy if its governed source state changes from available to unavailable.

## Orientation publication

The deterministic publication includes:

- canonical lifecycle change set;
- per-domain added/modified/removed counts;
- policy-qualified Attention Records;
- Executive Situations;
- Situation Assessments;
- interpretive Executive Context;
- explicit Gmail protocol-thread dependencies;
- current governed source states;
- replay-stable summary counts.

It contains no:

- priority score;
- urgency score;
- model confidence;
- model-selected ranking;
- inferred executive importance;
- action authority;
- action proposal.

## Acquisition / authority boundary

This PR does **not** add a conversational `orient me` command.

The current governed runtime does not yet have one authority operation that lawfully acquires Calendar, Gmail and Drive private evidence together from a single user utterance. Step D must not smuggle multi-source acquisition or standing authority into a cognition feature.

The orientation engine therefore accepts **already-governed canonical snapshots**. A future conversational activation must reuse capability-specific governed acquisition or introduce a separately reviewed bounded multi-source read contract.

## Adversarial regression boundary

The Step B corpus remains authoritative.

Step D adds a three-source integration test in which a newly observed Gmail message contains source-asserted `URGENT`, `CEO REQUEST` and `BOARD PRIORITY`. The message is visible as a canonical communication change and explicit thread dependency, while the Attention publication contains only the independent deterministic Calendar schedule-change record.

This is the required asymmetry:

> evidence may change without significance changing.

## Explicit exclusions

Step D does not:

- add Gmail or Drive writes;
- create standing or named grants;
- introduce voice write approval;
- add proactive/scheduled acquisition;
- rank messages or files;
- infer priorities;
- call a model;
- activate a new private-data acquisition route;
- expand the Attention domain vocabulary to communications.

Any future policy that elevates communication or Drive semantic content must be separately defined, deterministic, adversarially tested and justified by an observed product need.
