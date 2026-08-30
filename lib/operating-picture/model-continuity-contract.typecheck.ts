import type {
  AuthorityEvidence,
  GovernedEvidence,
} from "../governance-core/trust-types";
import type { DurableOperatingPictureProjectionItem } from "./durable-projection";
import {
  type ModelContinuityAssessment,
  type ModelContinuityContext,
} from "./model-continuity-contract";

declare const context: ModelContinuityContext;
declare const assessment: ModelContinuityAssessment;
declare const projectionItem: DurableOperatingPictureProjectionItem;

// Model-facing continuity does not expose durable identity or trust-bearing proof.
// @ts-expect-error durable record identity is deliberately kept outside model context
context.items[0].recordId;
// @ts-expect-error durable version identity is deliberately kept outside model context
context.items[0].versionId;

// A closed model assessment is not a durable projection item.
// @ts-expect-error closed model output cannot become a durable projection item
const _projection: DurableOperatingPictureProjectionItem = assessment;

// Model-facing continuity and its output cannot inhabit trust-bearing evidence types.
// @ts-expect-error model context is not governed evidence
const _contextEvidence: GovernedEvidence<unknown> = context;
// @ts-expect-error model assessment is not governed evidence
const _assessmentEvidence: GovernedEvidence<unknown> = assessment;
// @ts-expect-error model assessment is not authority evidence
const _assessmentAuthority: AuthorityEvidence<unknown> = assessment;

// The input durable projection item itself is not model context.
// @ts-expect-error no structural shortcut around the deterministic context adapter
const _directModelContext: ModelContinuityContext = projectionItem;

void [
  _projection,
  _contextEvidence,
  _assessmentEvidence,
  _assessmentAuthority,
  _directModelContext,
];
