import type {
  OperatingPictureHistoryRecord,
  OperatingPictureRecordVersion,
} from "./record-version-history";
import {
  parsePersistedOperatingPictureVersionRow,
  serializeOperatingPictureVersion,
  type PersistedOperatingPictureVersion,
} from "./persistence-record";
import type {
  DurableOperatingPictureHead,
  DurableOperatingPictureHeadListResult,
  DurableOperatingPictureHistoryReadResult,
  DurableOperatingPictureStore,
  DurableOperatingPictureVersionReadResult,
} from "./durable-store-contract";

export type SupabaseOperatingPictureAppendReason =
  | "invalid_payload"
  | "record_already_exists"
  | "previous_version_not_found"
  | "previous_version_not_current_head"
  | "version_already_exists"
  | "transition_invalid"
  | "persistence_unavailable"
  | "unexpected_persistence_response";

export type SupabaseOperatingPictureAppendResult =
  | Readonly<{
      status: "appended";
      version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>;
    }>
  | Readonly<{
      status: "rejected";
      reason: SupabaseOperatingPictureAppendReason;
    }>;

export type SupabaseOperatingPictureConfig = Readonly<{
  url: string;
  secretKey: string;
}>;

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

const KNOWN_REJECTION_REASONS = new Set<SupabaseOperatingPictureAppendReason>([
  "record_already_exists",
  "previous_version_not_found",
  "previous_version_not_current_head",
  "version_already_exists",
  "transition_invalid",
]);


const VERSION_SELECT = [
  "version_id",
  "record_id",
  "previous_version_id",
  "recorded_at",
  "semantic_class",
  "lifecycle",
  "subject_namespace",
  "subject_entity",
  "subject_attribute",
  "revision_semantics",
  "visibility_purposes",
  "valid_from",
  "valid_until",
  "stale_after",
  "superseded_by",
  "payload",
  "authorship_source",
  "authorship_at",
  "provenance_source",
  "provenance_observed_at",
].join(",");

function serverHeaders(config: SupabaseOperatingPictureConfig): Readonly<Record<string, string>> {
  return Object.freeze({
    apikey: config.secretKey,
    authorization: `Bearer ${config.secretKey}`,
  });
}

async function readRows(
  fetchImpl: FetchLike,
  url: string,
  config: SupabaseOperatingPictureConfig,
): Promise<
  | Readonly<{ status: "ok"; rows: readonly unknown[] }>
  | Readonly<{ status: "rejected"; reason: "persistence_unavailable" | "unexpected_persistence_response" }>
> {
  let response: Response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      headers: serverHeaders(config),
      cache: "no-store",
    });
  } catch {
    return Object.freeze({ status: "rejected", reason: "persistence_unavailable" });
  }

  if (!response.ok) {
    return Object.freeze({ status: "rejected", reason: "persistence_unavailable" });
  }

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    return Object.freeze({ status: "rejected", reason: "unexpected_persistence_response" });
  }

  if (!Array.isArray(body)) {
    return Object.freeze({ status: "rejected", reason: "unexpected_persistence_response" });
  }

  return Object.freeze({ status: "ok", rows: Object.freeze([...body]) });
}

function orderPersistedHistory(
  rows: readonly PersistedOperatingPictureVersion[],
  recordId: string,
  headVersionId: string,
): readonly PersistedOperatingPictureVersion[] | null {
  const byId = new Map<string, PersistedOperatingPictureVersion>();
  for (const row of rows) {
    if (row.recordId !== recordId || byId.has(row.versionId)) return null;
    byId.set(row.versionId, row);
  }

  const head = byId.get(headVersionId);
  if (!head) return null;

  const chain: PersistedOperatingPictureVersion[] = [];
  const seen = new Set<string>();
  let cursor: PersistedOperatingPictureVersion | undefined = head;

  while (cursor) {
    if (seen.has(cursor.versionId)) return null;
    seen.add(cursor.versionId);
    chain.push(cursor);

    if (cursor.previousVersionId === null) break;
    const previous = byId.get(cursor.previousVersionId);
    if (!previous) return null;
    cursor = previous;
  }

  if (chain.length !== rows.length) return null;
  const ordered = chain.reverse();

  if (ordered[0]?.previousVersionId !== null) return null;
  for (let index = 1; index < ordered.length; index += 1) {
    if (ordered[index].previousVersionId !== ordered[index - 1].versionId) return null;
  }

  return Object.freeze(ordered);
}


const HEAD_DISCOVERY_PAGE_SIZE = 250;
const HEAD_DISCOVERY_MAX_RECORDS = 10_000;

export type SupabaseHeadDiscoveryLimits = Readonly<{
  pageSize: number;
  maxRecords: number;
}>;

const DEFAULT_HEAD_DISCOVERY_LIMITS: SupabaseHeadDiscoveryLimits = Object.freeze({
  pageSize: HEAD_DISCOVERY_PAGE_SIZE,
  maxRecords: HEAD_DISCOVERY_MAX_RECORDS,
});

function validHeadDiscoveryLimits(
  limits: SupabaseHeadDiscoveryLimits,
): boolean {
  return Number.isInteger(limits.pageSize)
    && Number.isInteger(limits.maxRecords)
    && limits.pageSize > 0
    && limits.maxRecords > 0;
}

function parseHeadRow(row: unknown): DurableOperatingPictureHead | null {
  if (typeof row !== "object" || row === null || Array.isArray(row)) return null;
  const value = row as Record<string, unknown>;
  if (typeof value.record_id !== "string" || typeof value.version_id !== "string") {
    return null;
  }
  if (value.record_id.length === 0 || value.version_id.length === 0) return null;
  return Object.freeze({
    recordId: value.record_id,
    versionId: value.version_id,
  });
}

async function listAllHeads(
  fetchImpl: FetchLike,
  config: SupabaseOperatingPictureConfig,
  limits: SupabaseHeadDiscoveryLimits,
): Promise<DurableOperatingPictureHeadListResult> {
  const heads: DurableOperatingPictureHead[] = [];
  const seenRecordIds = new Set<string>();
  let offset = 0;

  while (offset <= limits.maxRecords) {
    const result = await readRows(
      fetchImpl,
      `${config.url}/rest/v1/operating_picture_heads?select=record_id,version_id&order=record_id.asc&limit=${limits.pageSize}&offset=${offset}`,
      config,
    );
    if (result.status === "rejected") return result;

    if (result.rows.length > limits.pageSize) {
      return Object.freeze({
        status: "rejected",
        reason: "persistence_integrity_failure",
      });
    }

    for (const row of result.rows) {
      const head = parseHeadRow(row);
      if (!head || seenRecordIds.has(head.recordId)) {
        return Object.freeze({
          status: "rejected",
          reason: "persistence_integrity_failure",
        });
      }
      seenRecordIds.add(head.recordId);
      heads.push(head);
      if (heads.length > limits.maxRecords) {
        return Object.freeze({
          status: "rejected",
          reason: "recovery_scope_exceeded",
        });
      }
    }

    if (result.rows.length < limits.pageSize) {
      return heads.length === 0
        ? Object.freeze({ status: "empty" })
        : Object.freeze({
            status: "found",
            heads: Object.freeze([...heads]),
          });
    }

    offset += limits.pageSize;
  }

  return Object.freeze({
    status: "rejected",
    reason: "recovery_scope_exceeded",
  });
}

function rpcPayload(version: PersistedOperatingPictureVersion): Readonly<Record<string, unknown>> {
  return Object.freeze({
    p_version_id: version.versionId,
    p_record_id: version.recordId,
    p_previous_version_id: version.previousVersionId,
    p_recorded_at: version.recordedAt,
    p_semantic_class: version.semanticClass,
    p_lifecycle: version.lifecycle,
    p_subject_namespace: version.subjectNamespace,
    p_subject_entity: version.subjectEntity,
    p_subject_attribute: version.subjectAttribute,
    p_revision_semantics: version.revisionSemantics,
    p_visibility_purposes: version.visibilityPurposes,
    p_valid_from: version.validFrom,
    p_valid_until: version.validUntil,
    p_stale_after: version.staleAfter,
    p_superseded_by: version.supersededBy,
    p_payload: version.payload,
    p_authorship_source: version.authorshipSource,
    p_authorship_at: version.authorshipAt,
    p_provenance_source: version.provenanceSource,
    p_provenance_observed_at: version.provenanceObservedAt,
  });
}

function validConfig(config: SupabaseOperatingPictureConfig): boolean {
  try {
    const url = new URL(config.url);
    return url.protocol === "https:" && config.secretKey.trim().length > 0;
  } catch {
    return false;
  }
}

export function loadSupabaseOperatingPictureConfig(
  env: Readonly<Record<string, string | undefined>> = process.env,
): SupabaseOperatingPictureConfig | null {
  const url = env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const secretKey = env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) return null;

  const config = Object.freeze({ url: url.replace(/\/$/, ""), secretKey });
  return validConfig(config) ? config : null;
}

export function createSupabaseOperatingPicturePersistence(
  config: SupabaseOperatingPictureConfig,
  fetchImpl: FetchLike = fetch,
  headDiscoveryLimits: SupabaseHeadDiscoveryLimits = DEFAULT_HEAD_DISCOVERY_LIMITS,
): Readonly<{
  appendVersion: (
    version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>,
  ) => Promise<SupabaseOperatingPictureAppendResult>;
  durableStore: DurableOperatingPictureStore;
}> {
  if (!validConfig(config)) {
    throw new Error("Invalid Supabase Operating Picture configuration.");
  }
  if (!validHeadDiscoveryLimits(headDiscoveryLimits)) {
    throw new Error("Invalid Supabase head discovery limits.");
  }

  const limits = Object.freeze({ ...headDiscoveryLimits });

  return Object.freeze({
    async appendVersion(version) {
      const persisted = serializeOperatingPictureVersion(version);
      if (!persisted) {
        return Object.freeze({ status: "rejected", reason: "invalid_payload" });
      }

      let response: Response;
      try {
        response = await fetchImpl(
          `${config.url}/rest/v1/rpc/append_operating_picture_version`,
          {
            method: "POST",
            headers: {
              ...serverHeaders(config),
              "content-type": "application/json",
            },
            body: JSON.stringify(rpcPayload(persisted)),
            cache: "no-store",
          },
        );
      } catch {
        return Object.freeze({
          status: "rejected",
          reason: "persistence_unavailable",
        });
      }

      if (!response.ok) {
        return Object.freeze({
          status: "rejected",
          reason: "persistence_unavailable",
        });
      }

      let body: unknown;
      try {
        body = await response.json();
      } catch {
        return Object.freeze({
          status: "rejected",
          reason: "unexpected_persistence_response",
        });
      }

      if (!Array.isArray(body) || body.length !== 1) {
        return Object.freeze({
          status: "rejected",
          reason: "unexpected_persistence_response",
        });
      }

      const row = body[0];
      if (typeof row !== "object" || row === null) {
        return Object.freeze({
          status: "rejected",
          reason: "unexpected_persistence_response",
        });
      }

      const status = (row as Record<string, unknown>).status;
      const reason = (row as Record<string, unknown>).reason;

      if (status === "appended" && reason === null) {
        return Object.freeze({ status: "appended", version });
      }

      if (status === "rejected"
        && typeof reason === "string"
        && KNOWN_REJECTION_REASONS.has(reason as SupabaseOperatingPictureAppendReason)) {
        return Object.freeze({
          status: "rejected",
          reason: reason as SupabaseOperatingPictureAppendReason,
        });
      }

      return Object.freeze({
        status: "rejected",
        reason: "unexpected_persistence_response",
      });
    },

    durableStore: Object.freeze({
      async listRecordHeads(): Promise<DurableOperatingPictureHeadListResult> {
        return listAllHeads(fetchImpl, config, limits);
      },

      async getVersion(versionId: string): Promise<DurableOperatingPictureVersionReadResult> {
        const encodedVersionId = encodeURIComponent(versionId);
        const result = await readRows(
          fetchImpl,
          `${config.url}/rest/v1/operating_picture_versions?version_id=eq.${encodedVersionId}&select=${VERSION_SELECT}&limit=2`,
          config,
        );
        if (result.status === "rejected") return result;
        if (result.rows.length === 0) return Object.freeze({ status: "not_found" });
        if (result.rows.length !== 1) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }

        const version = parsePersistedOperatingPictureVersionRow(result.rows[0]);
        if (!version || version.versionId !== versionId) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }
        return Object.freeze({ status: "found", version });
      },

      async getHeadVersion(recordId: string): Promise<DurableOperatingPictureVersionReadResult> {
        const history = await this.listRecordVersions(recordId);
        if (history.status !== "found") return history;
        const version = history.versions[history.versions.length - 1];
        if (!version || version.versionId !== history.headVersionId) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }
        return Object.freeze({ status: "found", version });
      },

      async listRecordVersions(recordId: string): Promise<DurableOperatingPictureHistoryReadResult> {
        const encodedRecordId = encodeURIComponent(recordId);
        const [headResult, versionsResult] = await Promise.all([
          readRows(
            fetchImpl,
            `${config.url}/rest/v1/operating_picture_heads?record_id=eq.${encodedRecordId}&select=record_id,version_id&limit=2`,
            config,
          ),
          readRows(
            fetchImpl,
            `${config.url}/rest/v1/operating_picture_versions?record_id=eq.${encodedRecordId}&select=${VERSION_SELECT}`,
            config,
          ),
        ]);

        if (headResult.status === "rejected") return headResult;
        if (versionsResult.status === "rejected") return versionsResult;

        if (headResult.rows.length === 0 && versionsResult.rows.length === 0) {
          return Object.freeze({ status: "not_found" });
        }
        if (headResult.rows.length !== 1 || versionsResult.rows.length === 0) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }

        const head = headResult.rows[0];
        if (typeof head !== "object" || head === null || Array.isArray(head)) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }
        const headRecord = head as Record<string, unknown>;
        if (headRecord.record_id !== recordId || typeof headRecord.version_id !== "string") {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }

        const parsed: PersistedOperatingPictureVersion[] = [];
        for (const row of versionsResult.rows) {
          const version = parsePersistedOperatingPictureVersionRow(row);
          if (!version) {
            return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
          }
          parsed.push(version);
        }

        const ordered = orderPersistedHistory(parsed, recordId, headRecord.version_id);
        if (!ordered) {
          return Object.freeze({ status: "rejected", reason: "persistence_integrity_failure" });
        }

        return Object.freeze({
          status: "found",
          headVersionId: headRecord.version_id,
          versions: ordered,
        });
      },
    }),
  });
}
