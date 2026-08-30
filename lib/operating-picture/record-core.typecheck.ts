import {
  createFactRecord,
  createInferenceRecord,
  createRecommendationRecord,
  createUserAssertionRecord,
  type FactRecord,
  type ReusableAuthorityMustNotAppearInOperatingPicture,
} from "./record-core";
import { markModelText, type GovernedEvidence, type GovernedProvenance } from "../governance-core/trust-types";

declare const evidence: GovernedEvidence<{ rate: number }>;
declare const provenance: GovernedProvenance;

const fact = createFactRecord({
  id: "fact:1",
  evidence,
  provenance,
  visibility: ["executive_reasoning"],
});
const _factType: FactRecord<{ rate: number }> = fact;

const inference = createInferenceRecord({
  id: "inference:1",
  value: markModelText("Victoria's rate may be elevated."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});
void inference;

createRecommendationRecord({
  id: "recommendation:1",
  value: markModelText("Consider reviewing the trend."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createUserAssertionRecord({
  id: "user:1",
  value: "I prefer mornings.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

createFactRecord({
  id: "bad:fact",
  // @ts-expect-error model-authored text is not governed evidence and cannot construct a fact
  evidence: markModelText("5.1%"),
  provenance,
  visibility: ["conversation"],
});

// @ts-expect-error a model-authored inference is not a FactRecord
const _promotedInference: FactRecord<string> = inference;

// @ts-expect-error user assertions retain their semantic class
const _userAssertionAsFact: FactRecord<string> = createUserAssertionRecord({
  id: "user:2",
  value: "Rachel owns this.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

const _noReusableAuthority: ReusableAuthorityMustNotAppearInOperatingPicture = true;
void _factType;
void _promotedInference;
void _userAssertionAsFact;
void _noReusableAuthority;
