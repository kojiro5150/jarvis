import { AGENTS_BY_ID } from "../index";
import { validateBehaviouralConstitution } from "./constitution";
import {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
} from "./registry";

import type { BehaviouralConstitution } from "./constitution";
import type { ConstitutionSpecialistId } from "./registry";

export interface ConstitutionRegistry {
  readonly specialistIds: readonly ConstitutionSpecialistId[];
  readonly constitutions: Readonly<
    Partial<Record<ConstitutionSpecialistId, BehaviouralConstitution>>
  >;
}

export interface BehaviouralCapability {
  readonly specialistId: ConstitutionSpecialistId;
  readonly mission: string;
  readonly responsibilities: readonly string[];
  readonly authorityBoundaries: readonly string[];
  readonly collaborationPartners: readonly ConstitutionSpecialistId[];
  readonly outputs: readonly string[];
}

export interface BehaviouralCapabilityMatrix {
  readonly capabilities: readonly BehaviouralCapability[];
}

export const BEHAVIOURAL_CONSTITUTION_REGISTRY: ConstitutionRegistry = {
  specialistIds: CONSTITUTION_SPECIALIST_IDS,
  constitutions: BEHAVIOURAL_CONSTITUTIONS,
};

function mentionsIdentity(rule: string, identity: string): boolean {
  const escaped = identity.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[^a-z0-9-])${escaped}(?=$|[^a-z0-9-])`, "i").test(rule);
}

function collaborationPartners(
  constitution: BehaviouralConstitution
): readonly ConstitutionSpecialistId[] {
  return Object.freeze(
    CONSTITUTION_SPECIALIST_IDS.filter((specialistId) => {
      const identities = [
        specialistId,
        BEHAVIOURAL_CONSTITUTIONS[specialistId].metadata.name,
        AGENTS_BY_ID[specialistId]?.name,
      ].filter((identity): identity is string => Boolean(identity));

      return constitution.collaborationRules.some((rule) =>
        identities.some((identity) => mentionsIdentity(rule, identity))
      );
    })
  );
}

function copyAndFreeze(values: readonly string[]): readonly string[] {
  return Object.freeze([...values]);
}

/**
 * Build the descriptive, immutable capability projection of a constitution
 * registry. This function does not create instructions or execution metadata.
 */
export function buildBehaviouralCapabilityMatrix(
  registry: ConstitutionRegistry
): BehaviouralCapabilityMatrix {
  const seen = new Set<ConstitutionSpecialistId>();

  const capabilities = registry.specialistIds.map((specialistId) => {
    if (seen.has(specialistId)) {
      throw new Error(`duplicate constitution registry entry: ${specialistId}`);
    }
    seen.add(specialistId);

    const constitution = registry.constitutions[specialistId];
    if (!constitution) {
      throw new Error(`missing behavioural constitution for ${specialistId}`);
    }
    if (constitution.metadata.specialistId !== specialistId) {
      throw new Error(`${specialistId}: constitution specialistId mismatch`);
    }
    const errors = validateBehaviouralConstitution(constitution);
    if (errors.length > 0) {
      throw new Error(`${specialistId}: ${errors.join("; ")}`);
    }

    return Object.freeze({
      specialistId,
      mission: constitution.mission,
      responsibilities: copyAndFreeze(constitution.behaviouralObligations),
      authorityBoundaries: copyAndFreeze([
        ...constitution.authorityBoundaries.allowed,
        ...constitution.authorityBoundaries.rules,
      ]),
      collaborationPartners: collaborationPartners(constitution),
      outputs: Object.freeze([constitution.outputContract]),
    });
  });

  return Object.freeze({ capabilities: Object.freeze(capabilities) });
}
