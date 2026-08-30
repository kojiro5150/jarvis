import type {
  PersistedOperatingPictureProjectionMetadata,
  PersistedOperatingPictureVersion,
} from "./persistence-record";

export type OperatingPictureRecoveryDisposition =
  | "recoverable_user_continuity"
  | "recoverable_model_continuity"
  | "requires_source_revalidation";

export type OperatingPictureRecoveryReason =
  | "user_authorship_persists_as_historical_continuity"
  | "model_authorship_persists_as_low_trust_continuity"
  | "governed_fact_requires_source_revalidation"
  | "governed_plan_requires_source_revalidation"
  | "governed_commitment_requires_source_revalidation"
  | "governed_decision_requires_source_revalidation";

export type OperatingPictureRecoveryClassification = Readonly<{
  disposition: OperatingPictureRecoveryDisposition;
  reason: OperatingPictureRecoveryReason;
}>;

type RecoveryClassifiable = Pick<
  PersistedOperatingPictureVersion,
  "semanticClass" | "authorshipSource" | "provenanceSource"
> | Pick<
  PersistedOperatingPictureProjectionMetadata,
  "semanticClass" | "authorshipSource" | "provenanceSource"
>;

export function classifyOperatingPictureRecovery(
  value: RecoveryClassifiable,
): OperatingPictureRecoveryClassification | null {
  switch (value.semanticClass) {
    case "fact":
      if (value.authorshipSource !== null || value.provenanceSource === null) return null;
      return Object.freeze({
        disposition: "requires_source_revalidation",
        reason: "governed_fact_requires_source_revalidation",
      });

    case "user_assertion":
    case "preference":
      if (value.authorshipSource !== "user" || value.provenanceSource !== null) return null;
      return Object.freeze({
        disposition: "recoverable_user_continuity",
        reason: "user_authorship_persists_as_historical_continuity",
      });

    case "inference":
    case "recommendation":
    case "open_question":
      if (value.authorshipSource !== "model" || value.provenanceSource !== null) return null;
      return Object.freeze({
        disposition: "recoverable_model_continuity",
        reason: "model_authorship_persists_as_low_trust_continuity",
      });

    case "plan":
      if (value.authorshipSource === "user" && value.provenanceSource === null) {
        return Object.freeze({
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (value.authorshipSource === "governed_system" && value.provenanceSource !== null) {
        return Object.freeze({
          disposition: "requires_source_revalidation",
          reason: "governed_plan_requires_source_revalidation",
        });
      }
      return null;

    case "commitment":
      if (value.authorshipSource === "user" && value.provenanceSource === null) {
        return Object.freeze({
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (value.authorshipSource === "governed_source" && value.provenanceSource !== null) {
        return Object.freeze({
          disposition: "requires_source_revalidation",
          reason: "governed_commitment_requires_source_revalidation",
        });
      }
      return null;

    case "decision":
      if (value.authorshipSource === "user" && value.provenanceSource === null) {
        return Object.freeze({
          disposition: "recoverable_user_continuity",
          reason: "user_authorship_persists_as_historical_continuity",
        });
      }
      if (
        value.authorshipSource === "governed_decision_source"
        && value.provenanceSource !== null
      ) {
        return Object.freeze({
          disposition: "requires_source_revalidation",
          reason: "governed_decision_requires_source_revalidation",
        });
      }
      return null;
  }

  return null;
}
