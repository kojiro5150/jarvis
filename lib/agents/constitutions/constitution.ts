import type { HandoffAuthority } from "../types";

export const CONSTITUTION_STATUSES = ["draft", "active", "retired"] as const;

export type ConstitutionStatus = (typeof CONSTITUTION_STATUSES)[number];

export interface ConstitutionMetadata {
  specialistId: string;
  name: string;
  version: string;
  status: ConstitutionStatus;
}

/**
 * The durable, versioned, specialist-specific behavioural specification.
 *
 * Runtime tasks, conversations, model details and operational context do not
 * belong in this object. Shared obligations are inherited through the
 * constitution registry rather than repeated here.
 */
export interface BehaviouralConstitution {
  metadata: ConstitutionMetadata;
  identity: string;
  mission: string;
  reasoningPosture: string[];
  existsToPrevent: string[];
  behaviouralObligations: string[];
  epistemicDiscipline: string[];
  authorityBoundaries: {
    allowed: HandoffAuthority[];
    rules: string[];
  };
  collaborationRules: string[];
  escalationRules: string[];
  executiveCommunicationStandard: string[];
  failureModes: string[];
  outputContract: string;
}

export const CONSTITUTION_REQUIRED_ARRAY_SECTIONS = [
  "reasoningPosture",
  "existsToPrevent",
  "behaviouralObligations",
  "epistemicDiscipline",
  "collaborationRules",
  "escalationRules",
  "executiveCommunicationStandard",
  "failureModes",
] as const satisfies ReadonlyArray<keyof BehaviouralConstitution>;

const SEMVER = /^\d+\.\d+\.\d+$/;

export function validateBehaviouralConstitution(
  constitution: BehaviouralConstitution
): string[] {
  const errors: string[] = [];
  const { metadata } = constitution;

  if (!metadata.specialistId.trim()) errors.push("metadata.specialistId is required");
  if (!metadata.name.trim()) errors.push("metadata.name is required");
  if (!SEMVER.test(metadata.version)) {
    errors.push("metadata.version must use major.minor.patch format");
  }
  if (!CONSTITUTION_STATUSES.includes(metadata.status)) {
    errors.push("metadata.status is invalid");
  }
  if (!constitution.identity.trim()) errors.push("identity is required");
  if (!constitution.mission.trim()) errors.push("mission is required");
  if (!constitution.outputContract.trim()) errors.push("outputContract is required");

  for (const section of CONSTITUTION_REQUIRED_ARRAY_SECTIONS) {
    const values = constitution[section] as string[];
    if (!Array.isArray(values) || values.length === 0) {
      errors.push(`${section} must contain at least one entry`);
    } else if (values.some((value) => !value.trim())) {
      errors.push(`${section} must not contain blank entries`);
    }
  }

  if (constitution.authorityBoundaries.allowed.length === 0) {
    errors.push("authorityBoundaries.allowed must contain at least one entry");
  }
  if (constitution.authorityBoundaries.rules.length === 0) {
    errors.push("authorityBoundaries.rules must contain at least one entry");
  } else if (constitution.authorityBoundaries.rules.some((rule) => !rule.trim())) {
    errors.push("authorityBoundaries.rules must not contain blank entries");
  }

  return errors;
}
