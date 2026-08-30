import type {
  OperatingPictureHistoryRecord,
  OperatingPictureRecordVersion,
} from "./record-version-history";
import {
  serializeOperatingPictureVersion,
  type PersistedOperatingPictureVersion,
} from "./persistence-record";

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
): Readonly<{
  appendVersion: (
    version: OperatingPictureRecordVersion<OperatingPictureHistoryRecord>,
  ) => Promise<SupabaseOperatingPictureAppendResult>;
}> {
  if (!validConfig(config)) {
    throw new Error("Invalid Supabase Operating Picture configuration.");
  }

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
              apikey: config.secretKey,
              authorization: `Bearer ${config.secretKey}`,
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
  });
}
