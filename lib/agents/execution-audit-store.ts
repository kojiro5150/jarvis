import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import type { ExecutionAuditRecord } from "./execution-audit";

export interface ExecutionAuditStore {
  append(record: ExecutionAuditRecord): Promise<void>;
  list(limit?: number): Promise<ExecutionAuditRecord[]>;
}

export const DEFAULT_EXECUTION_AUDIT_PATH = process.env.VERCEL
  ? path.join("/tmp", "jarvis-execution-audit.jsonl")
  : path.join(process.cwd(), ".data", "execution-audit.jsonl");

export class JsonlExecutionAuditStore implements ExecutionAuditStore {
  constructor(
    private readonly filePath =
      process.env.JARVIS_EXECUTION_AUDIT_PATH ?? DEFAULT_EXECUTION_AUDIT_PATH
  ) {}

  async append(record: ExecutionAuditRecord): Promise<void> {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    await appendFile(this.filePath, `${JSON.stringify(record)}\n`, "utf8");
  }

  async list(limit = 50): Promise<ExecutionAuditRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 200));

    let content: string;
    try {
      content = await readFile(this.filePath, "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }

    return content
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ExecutionAuditRecord)
      .slice(-safeLimit)
      .reverse();
  }
}
