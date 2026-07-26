import type { ExecutionAuditRecord } from "./execution-audit";
import type { ExecutionAuditStore } from "./execution-audit-store";

export interface SupabaseExecutionAuditConfig {
  url: string;
  secretKey: string;
  table?: string;
}

export type FetchLike = typeof fetch;

interface ExecutionAuditRow {
  id: string;
  created_at: string;
  selected_agent_id: string;
  step_number: number;
  requested_authority: ExecutionAuditRecord["requestedAuthority"];
  granted_authority: ExecutionAuditRecord["grantedAuthority"] | null;
  task: string;
  constraints: string[];
  expected_output: string | null;
  human_approved: boolean;
  preparation_status: ExecutionAuditRecord["preparationStatus"];
  execution_status: ExecutionAuditRecord["executionStatus"];
  model: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  reason: string | null;
}

export function toExecutionAuditRow(record: ExecutionAuditRecord): ExecutionAuditRow {
  return {
    id: record.id,
    created_at: record.timestamp,
    selected_agent_id: record.selectedAgentId,
    step_number: record.stepNumber,
    requested_authority: record.requestedAuthority,
    granted_authority: record.grantedAuthority ?? null,
    task: record.task,
    constraints: [...record.constraints],
    expected_output: record.expectedOutput ?? null,
    human_approved: record.humanApproved,
    preparation_status: record.preparationStatus,
    execution_status: record.executionStatus,
    model: record.model ?? null,
    input_tokens: record.inputTokens ?? null,
    output_tokens: record.outputTokens ?? null,
    reason: record.reason ?? null,
  };
}

export function fromExecutionAuditRow(row: ExecutionAuditRow): ExecutionAuditRecord {
  return {
    id: row.id,
    timestamp: row.created_at,
    selectedAgentId: row.selected_agent_id,
    stepNumber: row.step_number,
    requestedAuthority: row.requested_authority,
    grantedAuthority: row.granted_authority ?? undefined,
    task: row.task,
    constraints: [...row.constraints],
    expectedOutput: row.expected_output ?? undefined,
    humanApproved: row.human_approved,
    preparationStatus: row.preparation_status,
    executionStatus: row.execution_status,
    model: row.model ?? undefined,
    inputTokens: row.input_tokens ?? undefined,
    outputTokens: row.output_tokens ?? undefined,
    reason: row.reason ?? undefined,
  };
}

export class SupabaseExecutionAuditStore implements ExecutionAuditStore {
  private readonly table: string;

  constructor(
    private readonly config: SupabaseExecutionAuditConfig,
    private readonly fetcher: FetchLike = fetch
  ) {
    this.table = config.table ?? "execution_audit";
  }

  private headers(): Record<string, string> {
    return {
      apikey: this.config.secretKey,
      Authorization: `Bearer ${this.config.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async append(record: ExecutionAuditRecord): Promise<void> {
    const response = await this.fetcher(`${this.config.url}/rest/v1/${this.table}`, {
      method: "POST",
      headers: { ...this.headers(), Prefer: "return=minimal" },
      body: JSON.stringify(toExecutionAuditRow(record)),
    });

    if (!response.ok) {
      throw new Error(`Supabase execution audit append failed (${response.status})`);
    }
  }

  async list(limit = 50): Promise<ExecutionAuditRecord[]> {
    const safeLimit = Math.max(1, Math.min(limit, 200));
    const params = new URLSearchParams({
      select: "*",
      order: "created_at.desc",
      limit: String(safeLimit),
    });
    const response = await this.fetcher(
      `${this.config.url}/rest/v1/${this.table}?${params.toString()}`,
      { headers: this.headers() }
    );

    if (!response.ok) {
      throw new Error(`Supabase execution audit read failed (${response.status})`);
    }

    const rows = (await response.json()) as ExecutionAuditRow[];
    return rows.map(fromExecutionAuditRow);
  }
}
