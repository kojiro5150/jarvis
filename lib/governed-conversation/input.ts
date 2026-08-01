import { aggregateEvidenceStatus } from "./evidence-status";
import type { CompatibilityContext, GovernedClaimInput, GovernedConversationalInput, GovernedConversationTurn, GovernedQuestion, GovernedSourceInput } from "./types";

export interface EosContextReferences { readonly runId?: string; readonly sessionId?: string; readonly interfaceContractId?: string }
export interface ConversationalProjectionLineage { readonly threadId: string; readonly requestId: string; readonly exchangeId: string; readonly projectionId: string }
export interface EosReferenceVerifier {
  verifyRun(runId: string): boolean;
  verifySession(sessionId: string): boolean;
  verifyInterfaceContract(interfaceContractId: string): boolean;
  verifyCoherence(references: EosContextReferences): boolean;
}
export interface GovernedInputConstruction extends EosContextReferences { inputId: string; threadId: string; requestId: string; exchangeId: string; projectionId: string; projectionLineage: ConversationalProjectionLineage; referenceTime: string; question: GovernedQuestion; claims: readonly GovernedClaimInput[]; sources: readonly GovernedSourceInput[]; compatibilityContext?: readonly CompatibilityContext[]; conversationHistory?: readonly Omit<GovernedConversationTurn, "canonicalEvidence">[]; eosReferenceVerifier?: EosReferenceVerifier }

function verifyEosContext(value: GovernedInputConstruction): void {
  const references = { runId: value.runId, sessionId: value.sessionId, interfaceContractId: value.interfaceContractId };
  if (!Object.values(references).some(Boolean)) return;
  const verifier = value.eosReferenceVerifier;
  if (!verifier) throw new Error("supplied EOS context requires a verifier");
  if (value.runId && !verifier.verifyRun(value.runId)) throw new Error("runId is not a genuine EOS run publication");
  if (value.sessionId && !verifier.verifySession(value.sessionId)) throw new Error("sessionId is not a genuine EOS session publication");
  if (value.interfaceContractId && !verifier.verifyInterfaceContract(value.interfaceContractId)) throw new Error("interfaceContractId is not a genuine EOS interaction contract publication");
  if (!verifier.verifyCoherence(references)) throw new Error("supplied EOS context is not coherent");
}

export function constructGovernedConversationalInput(value: GovernedInputConstruction): GovernedConversationalInput {
  if (!value.threadId || !value.requestId || !value.exchangeId || !value.projectionId || !value.inputId) throw new Error("mandatory conversational lineage is required");
  if (value.threadId !== value.projectionLineage.threadId || value.requestId !== value.projectionLineage.requestId || value.exchangeId !== value.projectionLineage.exchangeId || value.projectionId !== value.projectionLineage.projectionId) throw new Error("conversational projection lineage mismatch");
  if (!value.referenceTime || Number.isNaN(Date.parse(value.referenceTime))) throw new Error("referenceTime must be an explicit ISO instant");
  verifyEosContext(value);
  const { eosReferenceVerifier: _verifier, projectionLineage: _projectionLineage, ...construction } = value;
  const compatibilityContext = (value.compatibilityContext ?? []).map(c => ({ ...c, authority: "none" as const }));
  const conversationHistory = (value.conversationHistory ?? []).map(t => ({ ...t, canonicalEvidence: false as const }));
  const claims = value.claims.map(claim => claim.conflicts.length && claim.status === "available" ? { ...claim, status: "insufficient_coverage" as const } : claim);
  return { ...construction, claims, compatibilityContext, conversationHistory, overallStatus: aggregateEvidenceStatus(claims) };
}
