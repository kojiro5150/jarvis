import type { GovernedAdvisoryNextStep, GovernedConversationalInput } from "./types";

export interface GovernedModelOutput {
  readonly interpretation?: { readonly claimIds: readonly string[]; readonly text: string; readonly evidenceReferences: readonly string[]; readonly uncertaintyReferences: readonly string[]; readonly ownership: "model_interpretation" };
  readonly advisoryNextSteps?: readonly { readonly claimIds: readonly string[]; readonly text: string; readonly evidenceReferences: readonly string[]; readonly nonAuthoritative: true; readonly ownership: "model_advisory"; readonly kind: GovernedAdvisoryNextStep["kind"] }[];
}
export interface GovernedModelOutputParseFailure { readonly code: string; readonly path: string; readonly reason: string }
export type GovernedModelOutputParseResult = { readonly ok: true; readonly output: GovernedModelOutput } | { readonly ok: false; readonly failures: readonly GovernedModelOutputParseFailure[] };
export type GovernedModelRawResponse = string | { readonly text: string; readonly metadataReference?: string };

const rootKeys = new Set(["interpretation", "advisoryNextSteps"]);
const interpretationKeys = new Set(["claimIds", "text", "evidenceReferences", "uncertaintyReferences", "ownership"]);
const advisoryKeys = new Set(["claimIds", "text", "evidenceReferences", "nonAuthoritative", "ownership", "kind"]);
const advisoryKinds = new Set(["clarification", "evidence_gathering", "source_verification", "review_consideration"]);
const authorityPattern = /\b(must|approve[ds]?|decide[ds]?|execute[ds]?|priority|prioritize[ds]?|you need to|requires? action)\b/i;
const heuristicPattern = /\b(important|urgent|significant|requires? attention|needs? reply)\b/i;

function strings(value: unknown): value is string[] { return Array.isArray(value) && value.every((item) => typeof item === "string" && item.length > 0); }
function object(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }

export function parseGovernedModelOutput(raw: GovernedModelRawResponse, input: GovernedConversationalInput): GovernedModelOutputParseResult {
  const failures: GovernedModelOutputParseFailure[] = [];
  const fail = (code: string, path: string, reason: string) => failures.push({ code, path, reason });
  const text = typeof raw === "string" ? raw : raw.text;
  if (!text.trim()) return { ok: false, failures: [{ code: "EMPTY_OUTPUT", path: "$", reason: "Model output is empty." }] };
  let value: unknown;
  try { value = JSON.parse(text); } catch { return { ok: false, failures: [{ code: "INVALID_JSON", path: "$", reason: "Exactly one JSON payload is required." }] }; }
  if (!object(value)) return { ok: false, failures: [{ code: "INVALID_SCHEMA", path: "$", reason: "Output must be an object." }] };
  for (const key of Object.keys(value)) if (!rootKeys.has(key)) fail("UNKNOWN_FIELD", `$.${key}`, "System-owned or unknown field is prohibited.");
  const knownClaims = new Map(input.claims.map((claim) => [claim.claimId, claim]));
  const knownSources = new Set(input.claims.flatMap((claim) => claim.sourceReferences.map((ref) => `${ref.sourceId}:${ref.resourceId}:${ref.field}`)));
  const assistantTurns = new Set(input.conversationHistory.filter((turn) => turn.classification === "assistant_prior_output").map((turn) => turn.turnId));
  const validateRefs = (record: Record<string, unknown>, path: string, advisory = false) => {
    if (!strings(record.claimIds)) fail("INVALID_SCHEMA", `${path}.claimIds`, "claimIds must be a non-empty-string array.");
    if (!strings(record.evidenceReferences)) fail("INVALID_SCHEMA", `${path}.evidenceReferences`, "evidenceReferences must be a non-empty-string array.");
    for (const id of strings(record.claimIds) ? record.claimIds : []) if (!knownClaims.has(id)) fail("UNKNOWN_CLAIM", `${path}.claimIds`, `Unknown claim ${id}.`);
    for (const ref of strings(record.evidenceReferences) ? record.evidenceReferences : []) {
      if (assistantTurns.has(ref)) fail("PRIOR_ASSISTANT_EVIDENCE", `${path}.evidenceReferences`, "Prior assistant output is not evidence.");
      else if (!knownSources.has(ref)) fail("UNKNOWN_SOURCE", `${path}.evidenceReferences`, `Unknown governed source ${ref}.`);
    }
    if (typeof record.text !== "string" || !record.text.trim()) fail("INVALID_SCHEMA", `${path}.text`, "text is required.");
    if (typeof record.text === "string" && authorityPattern.test(record.text)) fail("AUTHORITY_VIOLATION", `${path}.text`, "Model language exceeds advisory authority.");
    if (typeof record.text === "string" && heuristicPattern.test(record.text)) fail("HEURISTIC_LAUNDERING", `${path}.text`, "Excluded heuristics cannot establish significance or actionability.");
    if (!advisory && strings(record.claimIds)) for (const id of record.claimIds) {
      const claim = knownClaims.get(id);
      if (claim && claim.status !== "available" && (!strings(record.uncertaintyReferences) || !record.uncertaintyReferences.includes(id) || !/\b(unsupported|unavailable|insufficient|cannot|not established)\b/i.test(String(record.text)))) fail("STATUS_OVERRIDDEN", path, `Interpretation does not preserve ${claim.status} for ${id}.`);
      if (claim?.contentKind === "partial_excerpt" && /\b(full|complete|entire) (message|content|email)\b/i.test(String(record.text))) fail("CONTENT_SCOPE_VIOLATION", `${path}.text`, "Snippet evidence cannot establish full content.");
    }
    const factualStrings = input.claims.flatMap((claim) => claim.factualValues).filter((item): item is string => typeof item === "string");
    for (const candidate of String(record.text ?? "").match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g) ?? []) if (!factualStrings.includes(candidate)) fail("INVENTED_FACT", `${path}.text`, `Address ${candidate} is not a governed fact.`);
  };
  if (value.interpretation !== undefined) {
    if (!object(value.interpretation)) fail("INVALID_SCHEMA", "$.interpretation", "interpretation must be an object.");
    else {
      for (const key of Object.keys(value.interpretation)) if (!interpretationKeys.has(key)) fail("UNKNOWN_FIELD", `$.interpretation.${key}`, "Unknown interpretation field.");
      if (value.interpretation.ownership !== "model_interpretation") fail("INVALID_OWNERSHIP", "$.interpretation.ownership", "Explicit model_interpretation ownership is required.");
      if (!strings(value.interpretation.uncertaintyReferences)) fail("INVALID_SCHEMA", "$.interpretation.uncertaintyReferences", "uncertaintyReferences must be an array.");
      validateRefs(value.interpretation, "$.interpretation");
    }
  }
  if (value.advisoryNextSteps !== undefined) {
    if (!Array.isArray(value.advisoryNextSteps)) fail("INVALID_SCHEMA", "$.advisoryNextSteps", "advisoryNextSteps must be an array.");
    else value.advisoryNextSteps.forEach((step, index) => {
      const path = `$.advisoryNextSteps[${index}]`;
      if (!object(step)) return fail("INVALID_SCHEMA", path, "Advisory step must be an object.");
      for (const key of Object.keys(step)) if (!advisoryKeys.has(key)) fail("UNKNOWN_FIELD", `${path}.${key}`, "Unknown advisory field.");
      if (step.ownership !== "model_advisory" || step.nonAuthoritative !== true) fail("INVALID_ADVISORY_AUTHORITY", path, "Explicit model ownership and nonAuthoritative true are required.");
      if (typeof step.kind !== "string" || !advisoryKinds.has(step.kind)) fail("INVALID_SCHEMA", `${path}.kind`, "Unknown advisory kind.");
      validateRefs(step, path, true);
    });
  }
  if (failures.length) return { ok: false, failures };
  return { ok: true, output: value as unknown as GovernedModelOutput };
}
