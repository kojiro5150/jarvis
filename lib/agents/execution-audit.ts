import { randomUUID } from "node:crypto";

import type { SpecialistExecutionApiRequest, SpecialistExecutionApiResponse } from "./execution-api";
import type { HandoffAuthority } from "./types";

export type ExecutionAuditStatus = "completed" | "rejected" | "failed";

export interface ExecutionAuditRecord {
  id: string;
  timestamp: string;
  selectedAgentId: string;
  stepNumber: number;
  requestedAuthority: HandoffAuthority;
  grantedAuthority?: HandoffAuthority;
  task: string;
  constraints: string[];
  expectedOutput?: string;
  humanApproved: boolean;
  preparationStatus: "prepared" | "rejected";
  executionStatus: ExecutionAuditStatus;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  reason?: string;
}

export interface ExecutionAuditRecordOptions {
  id?: string;
  timestamp?: string;
}

/** Build one immutable audit record from the public execution request and result. */
export function buildExecutionAuditRecord(
  request: SpecialistExecutionApiRequest,
  response: SpecialistExecutionApiResponse,
  options: ExecutionAuditRecordOptions = {}
): ExecutionAuditRecord {
  const completed = response.body.status === "completed";
  const result = completed ? response.body.result : undefined;
  const preparationRejected =
    response.status === 422 &&
    response.body.status === "rejected" &&
    response.body.reason.startsWith("Collaboration step");

  return {
    id: options.id ?? randomUUID(),
    timestamp: options.timestamp ?? new Date().toISOString(),
    selectedAgentId: request.step.selectedAgentId,
    stepNumber: request.step.stepNumber,
    requestedAuthority: request.step.requestedAuthority,
    grantedAuthority: request.step.grantedAuthority,
    task: request.task,
    constraints: [...request.constraints],
    expectedOutput: request.expectedOutput,
    humanApproved: request.humanApproved === true,
    preparationStatus: preparationRejected ? "rejected" : "prepared",
    executionStatus: completed ? "completed" : response.body.status,
    model: completed ? result.model : undefined,
    inputTokens: completed ? result.inputTokens : undefined,
    outputTokens: completed ? result.outputTokens : undefined,
    reason: completed ? undefined : response.body.reason,
  };
}
