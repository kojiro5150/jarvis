import { GmailContentRetrievalAdapter, GMAIL_CONTENT_FIELDS } from "../content-retrieval";
import { deriveConversationExecutiveContext } from "../executive-operating-system/computation/executive-context-capability";
import type { ChatCapabilityDependencies, ChatCapabilityRequest, ChatCapabilityResponse } from "./types";

const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function parseChatCapabilityRequest(value: unknown): ChatCapabilityRequest | null {
  if (!object(value) || (value.operation !== "executive_context" && value.operation !== "governed_gmail_retrieval")) return null;
  if (value.operation === "executive_context") {
    if (!object(value.snapshot) || !object(value.computationWindow)) throw new Error("snapshot and computationWindow are required");
    return value as unknown as ChatCapabilityRequest;
  }
  if (!object(value.request) || !object(value.request.resource)) throw new Error("request.resource is required");
  const request = value.request;
  const resource = request.resource as Record<string, unknown>;
  if (resource.connectorType !== "email" || typeof resource.resourceId !== "string" || !resource.resourceId) {
    throw new Error("one identified email resource is required");
  }
  if (!Array.isArray(request.requestedFields) || request.requestedFields.some((field) => !GMAIL_CONTENT_FIELDS.includes(field as never)) ||
      typeof request.requestingRuntime !== "string" || !request.requestingRuntime) throw new Error("invalid governed Gmail retrieval request");
  return value as unknown as ChatCapabilityRequest;
}

/** Executes only an already explicit, validated operation. It is never consulted by ordinary chat. */
export async function routeChatCapability(request: ChatCapabilityRequest, dependencies: ChatCapabilityDependencies): Promise<ChatCapabilityResponse> {
  if (request.operation === "executive_context") {
    try {
      const context = deriveConversationExecutiveContext(request);
      return Object.freeze({ operation: request.operation, outcome: "success", context });
    } catch (error) {
      return Object.freeze({ operation: request.operation, outcome: "failed", error: error instanceof Error ? error.message : "executive context unavailable" });
    }
  }

  try {
    const adapter = new GmailContentRetrievalAdapter({ connector: dependencies.gmailConnector });
    const result = await adapter.retrieve(request.request, await dependencies.loadPolicy());
    return Object.freeze({ operation: request.operation, outcome: result.outcome, result });
  } catch (error) {
    return Object.freeze({ operation: request.operation, outcome: "failed", error: error instanceof Error ? error.message : "governed retrieval unavailable" });
  }
}
