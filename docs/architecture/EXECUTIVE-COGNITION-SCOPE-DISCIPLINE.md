# Executive Cognition Scope Discipline

## The principle

> **A pipeline stage earns its place in JARVIS by demonstrated
> necessity for a real, everyday personal question. It is never
> included because it already exists, has a good name, or because a
> more institutional system needed it.**

This exists because the twelve-stage executive cognition pipeline,
Projection, Situational Awareness, Attention, Situation Formation,
Situation Assessment, Executive Context, Intent, Candidate
Construction, Candidate Evaluation, Candidate Comparison, Executive
Reasoning, Governed Action Proposal, was built for a different,
larger context before it was ever asked to answer "what needs my
attention today" for one person. Multi-policy candidate evaluation
and comparison are the kind of thing a governance product needs, not
necessarily what a personal assistant needs. That distinction was not
yet tested against real use when this principle was written.

## The test, before any further EOS wiring work

Do not wire the question through all twelve stages to see what fires,
that still lets existing architecture set the frame, just with an
inspection step attached. Work forward from the question instead:
identify the minimum deterministic information transformations
required to answer it honestly, then check which existing stages
genuinely provide one of those transformations. Everything else stays
unwired, not because it's judged unnecessary in general, but because
this one real question didn't need it.

```text
question
  → identify required information transformations
  → map those transformations to existing stages where they
    genuinely fit
  → leave everything else unwired
```

For "what needs my attention," the minimum path is plausibly much
smaller than the full pipeline, something closer to governed
evidence, canonical state, change detection, deterministic attention
policies, attention records, concise rendering. Candidate
construction, evaluation, comparison, and governed action proposal
belong to a different question shape entirely, "what are my
options," "what should I do first", not this one. Each earns its own
way in when that question actually gets asked, not before.

Classify each existing stage afterward into one of three states:

- **Load-bearing**: genuinely required to produce an honest, correct
  answer to this real personal question. Keep it, and say precisely
  what it contributes.
- **Not required for this capability**: proven unnecessary for this
  one test. Makes no claim about why the stage exists or whether it
  belongs elsewhere; it remains fully available for a different
  capability that later genuinely needs it.
- **Unproven**: not yet exercised by any real question. Neither kept
  nor removed on the basis of this one test; stays unproven until a
  future real question actually needs it.

A result where most stages come back "not required for this
capability" is success, not disappointment. It means JARVIS is
becoming appropriately simpler, not that the earlier work was wasted.

## The rule this creates going forward

No future sprint wires a new EOS stage into JARVIS's everyday
conversational path because the stage already exists and has the
right name. Each stage's inclusion is justified the same way every
other claim tonight was justified: by tracing what a real question
actually requires first, then checking whether an existing stage
happens to provide it, not by routing the question through everything
that already exists and calling whatever fires necessary.

## Why this matters more than it sounds

This is the same discipline as everything verified tonight, prove it
against real behavior, don't trust a well-organized description of
what should be true, applied one level earlier: to the *decision of
what to build*, not just the verification of what already got built.
Overbuilding a personal tool with the shape of an institutional one
is a slower, quieter failure than a security gap, no test catches it
directly, no incident forces the correction. The only defense is
refusing to let existing scope substitute for demonstrated need,
checked deliberately, the same way everything else here has been.
