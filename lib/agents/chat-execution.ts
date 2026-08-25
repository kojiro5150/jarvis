import { randomUUID } from "node:crypto";

import type { AgentDefinition, ChatMessage } from "./types";
import type { ExecutionAuditRecord } from "./execution-audit";
import type { ExecutionAuditStore } from "./execution-audit-store";

export interface AuditedChatExecutionRequest {
  agent: AgentDefinition;
  messages: ChatMessage[];
  systemPrompt: string;
}

export interface AuditedChatExecutionDependencies {
  callModel(systemPrompt: string, messages: ChatMessage[]): Promise<string>;
  auditStore: ExecutionAuditStore;
  idFactory?: () => string;
  now?: () => Date;
}

function latestUserTask(messages: ChatMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === "user") return messages[index].content.trim();
  }
  throw new Error("Dashboard conversation contains no user task");
}

function buildChatAuditRecord(
  request: AuditedChatExecutionRequest,
  status: "completed" | "failed",
  dependencies: AuditedChatExecutionDependencies,
  reason?: string
): ExecutionAuditRecord {
  return {
    id: dependencies.idFactory?.() ?? randomUUID(),
    timestamp: (dependencies.now?.() ?? new Date()).toISOString(),
    selectedAgentId: request.agent.id,
    stepNumber: 1,
    requestedAuthority: "advise",
    grantedAuthority: "advise",
    task: latestUserTask(request.messages),
    constraints: [
      `Conversational execution with ${request.messages.length} message${request.messages.length === 1 ? "" : "s"}`,
      "Agent and BOA instructions assembled server-side",
    ],
    expectedOutput: request.agent.behaviouralContract?.outputContract,
    humanApproved: false,
    preparationStatus: "prepared",
    executionStatus: status,
    reason,
  };
}

/**
 * Compatibility bridge for the production dashboard conversation surface.
 * It preserves conversational history while enforcing advisory authority and
 * writing through the same durable audit store as controlled execution.
 */
export async function executeAuditedChat(
  request: AuditedChatExecutionRequest,
  dependencies: AuditedChatExecutionDependencies
): Promise<string> {
  const authorities = request.agent.behaviouralContract?.authority ?? [];
  if (!authorities.includes("advise")) {
    throw new Error(`Agent ${request.agent.id} does not declare advisory authority`);
  }

  try {
    const reply = await dependencies.callModel(request.systemPrompt, request.messages);
    await dependencies.auditStore.append(
      buildChatAuditRecord(request, "completed", dependencies)
    );
    return reply;
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Dashboard execution failed";

    try {
      await dependencies.auditStore.append(
        buildChatAuditRecord(request, "failed", dependencies, reason)
      );
    } catch (auditError) {
      throw new Error("Dashboard execution audit record could not be written", {
        cause: auditError,
      });
    }

    throw error;
  }
}
