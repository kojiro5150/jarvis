import { describe, expect, it } from "vitest";

import { gecko } from "./gecko";
import { executeAuditedChat } from "./chat-execution";
import type { ExecutionAuditRecord } from "./execution-audit";
import type { ExecutionAuditStore } from "./execution-audit-store";

class MemoryAuditStore implements ExecutionAuditStore {
  records: ExecutionAuditRecord[] = [];

  async append(record: ExecutionAuditRecord): Promise<void> {
    this.records.push(record);
  }

  async list(limit = 50): Promise<ExecutionAuditRecord[]> {
    return this.records.slice(-limit).reverse();
  }
}

const request = {
  agent: gecko,
  messages: [
    { role: "user" as const, content: "Assess the governance software market." },
  ],
  systemPrompt: "GECKO system prompt with operational context",
};

const deterministic = {
  idFactory: () => "11111111-1111-4111-8111-111111111111",
  now: () => new Date("2026-07-26T03:30:00.000Z"),
};

describe("executeAuditedChat", () => {
  it("returns the existing conversational reply and appends a completed audit record", async () => {
    const auditStore = new MemoryAuditStore();

    const reply = await executeAuditedChat(request, {
      ...deterministic,
      auditStore,
      callModel: async (systemPrompt, messages) => {
        expect(systemPrompt).toContain("operational context");
        expect(messages).toHaveLength(1);
        return "Market assessment complete.";
      },
    });

    expect(reply).toBe("Market assessment complete.");
    expect(auditStore.records).toEqual([
      expect.objectContaining({
        id: "11111111-1111-4111-8111-111111111111",
        timestamp: "2026-07-26T03:30:00.000Z",
        selectedAgentId: "gecko",
        requestedAuthority: "advise",
        grantedAuthority: "advise",
        task: "Assess the governance software market.",
        preparationStatus: "prepared",
        executionStatus: "completed",
      }),
    ]);
  });

  it("appends a failed audit record and preserves the model failure", async () => {
    const auditStore = new MemoryAuditStore();
    const providerError = new Error("Provider unavailable");

    await expect(
      executeAuditedChat(request, {
        ...deterministic,
        auditStore,
        callModel: async () => {
          throw providerError;
        },
      })
    ).rejects.toBe(providerError);

    expect(auditStore.records).toEqual([
      expect.objectContaining({
        selectedAgentId: "gecko",
        executionStatus: "failed",
        reason: "Provider unavailable",
      }),
    ]);
  });

  it("rejects agents without advisory authority before calling the model", async () => {
    const auditStore = new MemoryAuditStore();
    let called = false;

    await expect(
      executeAuditedChat(
        {
          ...request,
          agent: {
            ...gecko,
            behaviouralContract: {
              ...gecko.behaviouralContract!,
              authority: ["draft"],
            },
          },
        },
        {
          ...deterministic,
          auditStore,
          callModel: async () => {
            called = true;
            return "Should not execute";
          },
        }
      )
    ).rejects.toThrow("does not declare advisory authority");

    expect(called).toBe(false);
    expect(auditStore.records).toEqual([]);
  });
});
