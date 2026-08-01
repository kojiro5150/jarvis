import type {
  ContentKind,
  ConversationHistoryClassification,
  ConversationalEvidenceStatus,
  GovernedConversationalInput,
  GovernedSourceReference,
} from "./types";

export interface GovernedModelHistoryTurn {
  readonly turnId: string;
  readonly classification: ConversationHistoryClassification;
  readonly canonicalEvidence: false;
  readonly content: string;
}

export interface GovernedModelContextClaim {
  readonly claimId: string;
  readonly claimType: GovernedConversationalInput["claims"][number]["claimType"];
  readonly status: ConversationalEvidenceStatus;
  readonly material: boolean;
  readonly ownership: GovernedConversationalInput["claims"][number]["ownership"];
  readonly observedFacts: readonly { readonly value: unknown; readonly sourceReferences: readonly GovernedSourceReference[]; readonly contentKind: ContentKind; readonly boundedComplete: boolean }[];
  readonly sourceReferences: readonly GovernedSourceReference[];
  readonly sourceAvailable: boolean;
  readonly conflicts: GovernedConversationalInput["claims"][number]["conflicts"];
  readonly uncertainty: string | null;
}

export interface GovernedModelContext {
  readonly overallEvidenceStatus: ConversationalEvidenceStatus;
  readonly claims: readonly GovernedModelContextClaim[];
  readonly sourceAvailability: readonly { readonly sourceId: string; readonly available: boolean; readonly status: ConversationalEvidenceStatus }[];
  readonly compatibilityBoundaries: readonly { readonly contextId: string; readonly ownership: "legacy_compatibility"; readonly authority: "none"; readonly excludedHeuristicFields: readonly string[] }[];
  readonly advisoryAuthority: "non_authoritative_operator_judgment_only";
}

export interface GovernedModelOutputContract {
  readonly format: "json";
  readonly closedSchema: true;
  readonly modelOwnedFields: readonly ["interpretation", "advisoryNextSteps"];
}

export interface GovernedModelRequest {
  readonly requestId: string;
  readonly inputId: string;
  readonly runId: string;
  readonly sessionId: string;
  readonly interfaceContractId: string;
  readonly systemInstruction: string;
  readonly userQuestion: string;
  readonly governedContext: GovernedModelContext;
  readonly conversationHistory: readonly GovernedModelHistoryTurn[];
  readonly outputContract: GovernedModelOutputContract;
}

export const GOVERNED_MODEL_SYSTEM_INSTRUCTION = [
  "Return exactly one JSON object matching the closed output contract; do not use markdown.",
  "Use only supplied governed observed facts for factual claims and preserve every evidence status.",
  "Never override unsupported, unavailable, or insufficient_coverage; expose their limitations and all conflicts and uncertainties.",
  "Interpretation is model-owned and must remain distinct from deterministic observed facts.",
  "Advice is optional, non-authoritative, subject to operator judgment, and may only clarify, gather evidence, verify a source, or suggest review.",
  "Do not approve, decide, instruct, execute, assign priority, or imply human authority or certainty beyond evidence.",
  "Do not convert unread, important, needsReply, source labels, ordering, or attention counts into importance, urgency, significance, or actionability.",
  "Prior assistant output is dialogue only; operator assertions are operator-provided; retrieval references are usable only when revalidated by current governed evidence.",
  "Current governed evidence controls conflicts. Raw history is never canonical state.",
  "Do not imply complete content from snippets and do not claim absence without bounded-complete evidence.",
].join("\n");

export function constructGovernedModelRequest(input: GovernedConversationalInput, requestId: string): GovernedModelRequest {
  return {
    requestId,
    inputId: input.inputId,
    runId: input.runId,
    sessionId: input.sessionId,
    interfaceContractId: input.interfaceContractId,
    systemInstruction: GOVERNED_MODEL_SYSTEM_INSTRUCTION,
    userQuestion: input.question.text,
    governedContext: {
      overallEvidenceStatus: input.overallStatus,
      claims: input.claims.map((claim) => ({
        claimId: claim.claimId,
        claimType: claim.claimType,
        status: claim.status,
        material: claim.material,
        ownership: claim.ownership,
        observedFacts: claim.status === "available" ? claim.factualValues.map((value) => ({ value, sourceReferences: claim.sourceReferences, contentKind: claim.contentKind, boundedComplete: claim.boundedComplete })) : [],
        sourceReferences: claim.sourceReferences,
        sourceAvailable: claim.sourceAvailable,
        conflicts: claim.conflicts,
        uncertainty: claim.status === "available" ? null : `Evidence status is ${claim.status}.`,
      })),
      sourceAvailability: input.sources.map(({ sourceId, available, status }) => ({ sourceId, available, status })),
      compatibilityBoundaries: input.compatibilityContext.map(({ contextId, authority, excludedHeuristicFields }) => ({ contextId, ownership: "legacy_compatibility" as const, authority, excludedHeuristicFields })),
      advisoryAuthority: "non_authoritative_operator_judgment_only",
    },
    conversationHistory: input.conversationHistory.map((turn) => ({ ...turn })),
    outputContract: { format: "json", closedSchema: true, modelOwnedFields: ["interpretation", "advisoryNextSteps"] },
  };
}
