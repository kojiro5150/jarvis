export const GOVERNANCE_EPHEMERAL_STATE_TTL_MS = 15 * 60 * 1000;

export type GovernanceEphemeralStateKind =
  | "pending_authorization"
  | "calendar_move_authorization";

export type GovernanceEphemeralStateConfig = Readonly<{
  url: string;
  secretKey: string;
}>;

export type GovernanceEphemeralStateRow = Readonly<{
  id: string;
  kind: GovernanceEphemeralStateKind;
  capability: string;
  payload: unknown;
  status: "active" | "consumed" | "revoked";
  createdAt: string;
  expiresAt: string;
}>;

export type GovernanceEphemeralStateReadResult =
  | Readonly<{ status: "active"; row: GovernanceEphemeralStateRow }>
  | Readonly<{ status: "expired" | "consumed" | "revoked" | "not_found" | "mismatch" | "unavailable"; row: null }>;

export type GovernanceEphemeralStateConsumeResult =
  | Readonly<{ status: "consumed"; payload: unknown; expiresAt: string }>
  | Readonly<{ status: "expired" | "already_consumed" | "revoked" | "not_found" | "mismatch" | "unavailable"; payload: null; expiresAt: string | null }>;

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function validConfig(config: GovernanceEphemeralStateConfig): boolean {
  try {
    return new URL(config.url).protocol === "https:" && config.secretKey.trim().length > 0;
  } catch {
    return false;
  }
}

export function loadGovernanceEphemeralStateConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): GovernanceEphemeralStateConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) return null;
  const config = Object.freeze({ url: url.replace(/\/$/, ""), secretKey });
  return validConfig(config) ? config : null;
}

function headers(config: GovernanceEphemeralStateConfig): Record<string, string> {
  return {
    apikey: config.secretKey,
    authorization: `Bearer ${config.secretKey}`,
    "content-type": "application/json",
  };
}

function parseRow(value: unknown): GovernanceEphemeralStateRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string"
    || (row.kind !== "pending_authorization" && row.kind !== "calendar_move_authorization")
    || typeof row.capability !== "string"
    || (row.status !== "active" && row.status !== "consumed" && row.status !== "revoked")
    || typeof row.created_at !== "string"
    || typeof row.expires_at !== "string"
    || !Number.isFinite(Date.parse(row.created_at))
    || !Number.isFinite(Date.parse(row.expires_at))
  ) return null;
  return Object.freeze({
    id: row.id,
    kind: row.kind,
    capability: row.capability,
    payload: row.payload,
    status: row.status,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
  });
}

export function createGovernanceEphemeralStateStore(
  config: GovernanceEphemeralStateConfig,
  fetchImpl: FetchLike = fetch,
) {
  if (!validConfig(config)) throw new Error("Invalid governance ephemeral-state configuration.");

  return Object.freeze({
    async create(input: Readonly<{
      id: string;
      kind: GovernanceEphemeralStateKind;
      capability: string;
      payload: unknown;
      createdAt: string;
      expiresAt: string;
    }>): Promise<boolean> {
      try {
        const response = await fetchImpl(
          `${config.url}/rest/v1/governance_ephemeral_state`,
          {
            method: "POST",
            headers: {
              ...headers(config),
              prefer: "return=minimal",
            },
            body: JSON.stringify({
              id: input.id,
              kind: input.kind,
              capability: input.capability,
              payload: input.payload,
              status: "active",
              created_at: input.createdAt,
              expires_at: input.expiresAt,
            }),
            cache: "no-store",
          },
        );
        return response.ok;
      } catch {
        return false;
      }
    },

    async read(input: Readonly<{
      id: string;
      kind: GovernanceEphemeralStateKind;
      capability?: string;
      now: Date;
    }>): Promise<GovernanceEphemeralStateReadResult> {
      if (!Number.isFinite(input.now.getTime())) {
        return Object.freeze({ status: "unavailable", row: null });
      }
      const encoded = encodeURIComponent(input.id);
      let response: Response;
      try {
        response = await fetchImpl(
          `${config.url}/rest/v1/governance_ephemeral_state?id=eq.${encoded}&select=id,kind,capability,payload,status,created_at,expires_at&limit=2`,
          {
            method: "GET",
            headers: headers(config),
            cache: "no-store",
          },
        );
      } catch {
        return Object.freeze({ status: "unavailable", row: null });
      }
      if (!response.ok) return Object.freeze({ status: "unavailable", row: null });

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return Object.freeze({ status: "unavailable", row: null });
      }
      if (!Array.isArray(body) || body.length > 1) {
        return Object.freeze({ status: "unavailable", row: null });
      }
      if (body.length === 0) return Object.freeze({ status: "not_found", row: null });

      const row = parseRow(body[0]);
      if (!row) return Object.freeze({ status: "unavailable", row: null });
      if (row.kind !== input.kind || (input.capability !== undefined && row.capability !== input.capability)) {
        return Object.freeze({ status: "mismatch", row: null });
      }
      if (row.status === "consumed") return Object.freeze({ status: "consumed", row: null });
      if (row.status === "revoked") return Object.freeze({ status: "revoked", row: null });
      if (input.now.getTime() >= Date.parse(row.expiresAt)) {
        return Object.freeze({ status: "expired", row: null });
      }
      return Object.freeze({ status: "active", row });
    },

    async consume(input: Readonly<{
      id: string;
      kind: GovernanceEphemeralStateKind;
      capability: string;
      now: Date;
    }>): Promise<GovernanceEphemeralStateConsumeResult> {
      if (!Number.isFinite(input.now.getTime())) {
        return Object.freeze({ status: "unavailable", payload: null, expiresAt: null });
      }
      let response: Response;
      try {
        response = await fetchImpl(
          `${config.url}/rest/v1/rpc/consume_governance_ephemeral_state`,
          {
            method: "POST",
            headers: headers(config),
            body: JSON.stringify({
              p_id: input.id,
              p_kind: input.kind,
              p_capability: input.capability,
              p_now: input.now.toISOString(),
            }),
            cache: "no-store",
          },
        );
      } catch {
        return Object.freeze({ status: "unavailable", payload: null, expiresAt: null });
      }
      if (!response.ok) return Object.freeze({ status: "unavailable", payload: null, expiresAt: null });

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return Object.freeze({ status: "unavailable", payload: null, expiresAt: null });
      }
      if (!Array.isArray(body) || body.length !== 1 || !body[0] || typeof body[0] !== "object") {
        return Object.freeze({ status: "unavailable", payload: null, expiresAt: null });
      }
      const row = body[0] as Record<string, unknown>;
      const status = row.status;
      const expiresAt = typeof row.expires_at === "string" ? row.expires_at : null;
      if (status === "consumed") {
        return Object.freeze({ status, payload: row.payload, expiresAt: expiresAt ?? "" });
      }
      if (
        status === "expired"
        || status === "already_consumed"
        || status === "revoked"
        || status === "not_found"
        || status === "mismatch"
      ) {
        return Object.freeze({ status, payload: null, expiresAt });
      }
      return Object.freeze({ status: "unavailable", payload: null, expiresAt });
    },
  });
}

export type GovernanceEphemeralStateStore = ReturnType<typeof createGovernanceEphemeralStateStore>;

type TestStoredRow = GovernanceEphemeralStateRow;
const testGlobal = globalThis as typeof globalThis & {
  __jarvisGovernanceEphemeralStateRows?: Map<string, TestStoredRow>;
};
const testRows = testGlobal.__jarvisGovernanceEphemeralStateRows
  ?? new Map<string, TestStoredRow>();
testGlobal.__jarvisGovernanceEphemeralStateRows = testRows;

const testStore: GovernanceEphemeralStateStore = Object.freeze({
  async create(input) {
    if (testRows.has(input.id)) return false;
    testRows.set(input.id, Object.freeze({
      id: input.id,
      kind: input.kind,
      capability: input.capability,
      payload: input.payload,
      status: "active",
      createdAt: input.createdAt,
      expiresAt: input.expiresAt,
    }));
    return true;
  },
  async read(input) {
    const row = testRows.get(input.id);
    if (!row) return Object.freeze({ status: "not_found", row: null });
    if (row.kind !== input.kind || (input.capability !== undefined && row.capability !== input.capability)) {
      return Object.freeze({ status: "mismatch", row: null });
    }
    if (row.status === "consumed") return Object.freeze({ status: "consumed", row: null });
    if (row.status === "revoked") return Object.freeze({ status: "revoked", row: null });
    if (input.now.getTime() >= Date.parse(row.expiresAt)) {
      return Object.freeze({ status: "expired", row: null });
    }
    return Object.freeze({ status: "active", row });
  },
  async consume(input) {
    const row = testRows.get(input.id);
    if (!row) return Object.freeze({ status: "not_found", payload: null, expiresAt: null });
    if (row.kind !== input.kind || row.capability !== input.capability) {
      return Object.freeze({ status: "mismatch", payload: null, expiresAt: row.expiresAt });
    }
    if (row.status === "consumed") {
      return Object.freeze({ status: "already_consumed", payload: null, expiresAt: row.expiresAt });
    }
    if (row.status === "revoked") {
      return Object.freeze({ status: "revoked", payload: null, expiresAt: row.expiresAt });
    }
    if (input.now.getTime() >= Date.parse(row.expiresAt)) {
      return Object.freeze({ status: "expired", payload: null, expiresAt: row.expiresAt });
    }
    testRows.set(input.id, Object.freeze({ ...row, status: "consumed" }));
    return Object.freeze({ status: "consumed", payload: row.payload, expiresAt: row.expiresAt });
  },
});

export function resetGovernanceEphemeralStateForTests(): void {
  testRows.clear();
}

export function createProductionGovernanceEphemeralStateStore(): GovernanceEphemeralStateStore | null {
  const config = loadGovernanceEphemeralStateConfig();
  if (config) return createGovernanceEphemeralStateStore(config);
  return process.env.NODE_ENV === "test" ? testStore : null;
}
