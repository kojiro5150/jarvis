import { CONSTITUTION_STATUSES } from "./constitution";
import { SHARED_CONSTITUTIONAL_PRINCIPLES } from "./constitutional-principles";

import type { HandoffAuthority } from "../types";
import type { BehaviouralConstitution } from "./constitution";
import type { SharedConstitutionalPrinciple } from "./constitutional-principles";

export const CONSTITUTION_COMPLIANCE_CATEGORIES = [
  "metadata",
  "mission-responsibility",
  "authority",
  "collaboration",
  "output-contract",
  "shared-principles",
] as const;

export type ConstitutionComplianceCategory =
  (typeof CONSTITUTION_COMPLIANCE_CATEGORIES)[number];

export interface ConstitutionComplianceIssue {
  readonly specialistId: string;
  readonly category: ConstitutionComplianceCategory;
  readonly field: string;
  readonly code: string;
  readonly message: string;
}

export type SharedPrincipleComplianceInput = Readonly<
  Partial<Record<SharedConstitutionalPrinciple, readonly string[]>> &
    Record<string, readonly string[] | undefined>
>;

export interface ConstitutionComplianceContext {
  readonly registryKey: string;
  readonly coreSpecialistIdentities: readonly string[];
  readonly registeredSpecialistIdentities: readonly string[];
  readonly existingAuthorityCeiling: readonly HandoffAuthority[];
  readonly sharedPrinciples: SharedPrincipleComplianceInput;
}

export interface ConstitutionComplianceRegistryEntry {
  readonly specialistId: string;
  readonly constitution?: BehaviouralConstitution;
  readonly context: ConstitutionComplianceContext;
}

const SEMVER = /^\d+\.\d+\.\d+$/;
const NORMALISE = (value: string) => value.trim().toLocaleLowerCase("en-US");
const EXPLICIT_SPECIALIST_REFERENCE = /\[\[specialist:([a-z][a-z0-9-]*)\]\]/gi;
const CATEGORY_ORDER = new Map(
  CONSTITUTION_COMPLIANCE_CATEGORIES.map((category, index) => [category, index])
);

function issue(
  specialistId: string,
  category: ConstitutionComplianceCategory,
  field: string,
  code: string,
  detail: string
): ConstitutionComplianceIssue {
  return {
    specialistId,
    category,
    field,
    code,
    message: `${specialistId}: ${field} ${detail}`,
  };
}

function validateRequiredList(
  specialistId: string,
  category: ConstitutionComplianceCategory,
  field: string,
  values: readonly string[]
): ConstitutionComplianceIssue[] {
  const issues: ConstitutionComplianceIssue[] = [];
  if (values.length === 0) {
    issues.push(issue(specialistId, category, field, "required", "must contain at least one entry"));
    return issues;
  }

  const seen = new Set<string>();
  values.forEach((value, index) => {
    const normalised = NORMALISE(value);
    if (!normalised) {
      issues.push(issue(specialistId, category, `${field}[${index}]`, "blank", "must not be blank"));
    } else if (seen.has(normalised)) {
      issues.push(issue(specialistId, category, `${field}[${index}]`, "duplicate", "duplicates an earlier entry"));
    } else {
      seen.add(normalised);
    }
  });
  return issues;
}

function compareText(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function compareConstitutionComplianceIssues(
  left: ConstitutionComplianceIssue,
  right: ConstitutionComplianceIssue
): number {
  return (
    compareText(left.specialistId, right.specialistId) ||
    (CATEGORY_ORDER.get(left.category) ?? 0) - (CATEGORY_ORDER.get(right.category) ?? 0) ||
    compareText(left.field, right.field) ||
    compareText(left.code, right.code) ||
    compareText(left.message, right.message)
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findSpecialistReferences(
  rule: string,
  registeredIdentities: readonly string[]
): string[] {
  const references = new Set<string>();
  for (const match of rule.matchAll(EXPLICIT_SPECIALIST_REFERENCE)) {
    const identifier = match[1];
    if (identifier) references.add(NORMALISE(identifier));
  }

  for (const identity of registeredIdentities) {
    const boundedIdentity = new RegExp(
      `(^|[^a-z0-9-])${escapeRegExp(identity)}(?=$|[^a-z0-9-])`,
      "i"
    );
    if (boundedIdentity.test(rule)) references.add(NORMALISE(identity));
  }
  return [...references];
}

/** Accumulate every issue for an immutable registry description. */
export function validateConstitutionComplianceRegistry(
  entries: readonly ConstitutionComplianceRegistryEntry[]
): ConstitutionComplianceIssue[] {
  const issues: ConstitutionComplianceIssue[] = [];
  for (const entry of entries) {
    if (!entry.constitution) {
      issues.push(
        issue(entry.specialistId, "metadata", "constitution", "missing", "is required")
      );
    } else {
      issues.push(...validateConstitutionCompliance(entry.constitution, entry.context));
    }
  }
  return issues.sort(compareConstitutionComplianceIssues);
}

/** Validate a constitution as an auditable artefact without changing runtime behaviour. */
export function validateConstitutionCompliance(
  constitution: BehaviouralConstitution,
  context: ConstitutionComplianceContext
): ConstitutionComplianceIssue[] {
  const specialistId = context.registryKey;
  const issues: ConstitutionComplianceIssue[] = [];
  const { metadata } = constitution;

  if (!metadata.specialistId.trim()) {
    issues.push(issue(specialistId, "metadata", "metadata.specialistId", "blank", "must not be blank"));
  } else if (metadata.specialistId !== context.registryKey) {
    issues.push(issue(specialistId, "metadata", "metadata.specialistId", "registry-mismatch", `must match registry key ${context.registryKey}`));
  }
  if (!metadata.name.trim()) {
    issues.push(issue(specialistId, "metadata", "metadata.name", "blank", "must not be blank"));
  }
  if (!SEMVER.test(metadata.version)) {
    issues.push(issue(specialistId, "metadata", "metadata.version", "invalid-format", "must use major.minor.patch format"));
  }
  if (!CONSTITUTION_STATUSES.includes(metadata.status)) {
    issues.push(issue(specialistId, "metadata", "metadata.status", "unsupported", "is not a declared status"));
  }

  if (!constitution.mission.trim()) {
    issues.push(issue(specialistId, "mission-responsibility", "mission", "blank", "must not be blank"));
  }
  issues.push(...validateRequiredList(specialistId, "mission-responsibility", "behaviouralObligations", constitution.behaviouralObligations));

  issues.push(...validateRequiredList(specialistId, "authority", "authorityBoundaries.rules", constitution.authorityBoundaries.rules));
  if (constitution.authorityBoundaries.allowed.length === 0) {
    issues.push(issue(specialistId, "authority", "authorityBoundaries.allowed", "required", "must contain at least one entry"));
  }
  const allowedSeen = new Set<HandoffAuthority>();
  for (const authority of constitution.authorityBoundaries.allowed) {
    if (!context.existingAuthorityCeiling.includes(authority)) {
      issues.push(issue(specialistId, "authority", "authorityBoundaries.allowed", "authority-expansion", `contains unsupported authority ${authority}`));
    } else if (allowedSeen.has(authority)) {
      issues.push(issue(specialistId, "authority", "authorityBoundaries.allowed", "duplicate", `contains duplicate authority ${authority}`));
    } else {
      allowedSeen.add(authority);
    }
  }

  issues.push(...validateRequiredList(specialistId, "collaboration", "collaborationRules", constitution.collaborationRules));
  const coreIdentities = new Set(context.coreSpecialistIdentities.map(NORMALISE));
  constitution.collaborationRules.forEach((rule, index) => {
    for (const reference of findSpecialistReferences(
      rule,
      context.registeredSpecialistIdentities
    )) {
      if (!coreIdentities.has(reference)) {
        issues.push(issue(specialistId, "collaboration", `collaborationRules[${index}]`, "unresolved-specialist", `references unregistered core specialist ${reference}`));
      }
    }
  });

  if (!constitution.outputContract.trim()) {
    issues.push(issue(specialistId, "output-contract", "outputContract", "blank", "must not be blank"));
  }

  const knownPrinciples = new Set<string>(SHARED_CONSTITUTIONAL_PRINCIPLES);
  for (const key of Object.keys(context.sharedPrinciples)) {
    if (!knownPrinciples.has(key)) {
      issues.push(issue(specialistId, "shared-principles", `shared.principles.${key}`, "unknown", "is not a declared shared principle"));
    }
  }
  for (const principle of SHARED_CONSTITUTIONAL_PRINCIPLES) {
    const rules = context.sharedPrinciples[principle];
    if (!rules) {
      issues.push(issue(specialistId, "shared-principles", `shared.principles.${principle}`, "missing", "is required"));
    } else if (rules.length === 0 || rules.every((rule) => !rule.trim())) {
      issues.push(issue(specialistId, "shared-principles", `shared.principles.${principle}`, "empty", "must resolve to a non-empty rule set"));
    } else if (rules.some((rule) => !rule.trim())) {
      issues.push(issue(specialistId, "shared-principles", `shared.principles.${principle}`, "blank", "must not contain blank rules"));
    }
  }

  return issues.sort(compareConstitutionComplianceIssues);
}
