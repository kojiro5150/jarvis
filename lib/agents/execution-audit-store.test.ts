import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { JsonlExecutionAuditStore } from "./execution-audit-store";
import type { ExecutionAuditRecord } from "./execution-audit";

const tempDirectories: string[] = [];

function record(id: string, timestamp: string): ExecutionAuditRecord {
  return {
    id,
    timestamp,
    selectedAgentId: "oracle",
    stepNumber: 1,
    requestedAuthority: "advise",
    grantedAuthority: "advise",
    task: `Task ${id}`,
    constraints: [],
    humanApproved: false,
    preparationStatus: "prepared",
    executionStatus: "completed",
  };
}

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("JsonlExecutionAuditStore", () => {
  it("appends immutable JSON lines and returns newest records first", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "jarvis-audit-"));
    tempDirectories.push(directory);
    const filePath = path.join(directory, "audit.jsonl");
    const store = new JsonlExecutionAuditStore(filePath);

    await store.append(record("one", "2026-07-26T00:00:00.000Z"));
    await store.append(record("two", "2026-07-26T00:01:00.000Z"));

    expect((await store.list()).map((item) => item.id)).toEqual(["two", "one"]);
    expect((await readFile(filePath, "utf8")).trim().split("\n")).toHaveLength(2);
  });

  it("returns an empty history when the file does not exist", async () => {
    const directory = await mkdtemp(path.join(os.tmpdir(), "jarvis-audit-"));
    tempDirectories.push(directory);
    const store = new JsonlExecutionAuditStore(path.join(directory, "missing.jsonl"));

    expect(await store.list()).toEqual([]);
  });
});
