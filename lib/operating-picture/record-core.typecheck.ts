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
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate" },
  evidence,
  provenance,
  visibility: ["executive_reasoning"],
});
const _factType: FactRecord<{ rate: number }> = fact;

const inference = createInferenceRecord({
  id: "inference:1",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate" },
  value: markModelText("Victoria's rate may be elevated."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});
void inference;

createRecommendationRecord({
  id: "recommendation:1",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate" },
  value: markModelText("Consider reviewing the trend."),
  generatedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});

createUserAssertionRecord({
  id: "user:1",
  subject: { namespace: "user", entity: "preferences", attribute: "time_of_day" },
  value: "I prefer mornings.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["planning"],
});

createFactRecord({
  id: "bad:fact",
  subject: { namespace: "abs", entity: "victoria", attribute: "unemployment_rate" },
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
  subject: { namespace: "user", entity: "work", attribute: "owner" },
  value: "Rachel owns this.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
});


createUserAssertionRecord({
  id: "user:lifecycle-at-construction",
  subject: { namespace: "user", entity: "lifecycle", attribute: "state" },
  value: "Lifecycle is transition-owned.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
  // @ts-expect-error lifecycle state cannot be supplied at record construction
  lifecycle: "superseded",
});

createUserAssertionRecord({
  id: "user:supersession-at-construction",
  subject: { namespace: "user", entity: "lifecycle", attribute: "supersession" },
  value: "Supersession is transition-owned.",
  statedAt: "2026-08-30T04:30:00Z",
  visibility: ["conversation"],
  // @ts-expect-error supersededBy cannot be supplied at record construction
  supersededBy: "user:newer",
});

const _noReusableAuthority: ReusableAuthorityMustNotAppearInOperatingPicture = true;
void _factType;
void _promotedInference;
void _userAssertionAsFact;
void _noReusableAuthority;
