import { AGENTS_BY_ID } from "../index";
import { dawnwatchConstitution } from "./dawnwatch";
import { geckoConstitution } from "./gecko";
import { heraldConstitution } from "./herald";
import { jarvisConstitution } from "./jarvis";
import { marcusConstitution } from "./marcus";
import { oracleConstitution } from "./oracle";
import { SHARED_CONSTITUTION } from "./shared";
import { steveConstitution } from "./steve";
import { validateBehaviouralConstitution } from "./constitution";

import type { BehaviouralConstitution } from "./constitution";
import type { SharedConstitutionalLayer } from "./shared";

export const CONSTITUTION_SPECIALIST_IDS = [
  "jarvis",
  "gecko",
  "marcus",
  "oracle",
  "steve",
  "herald",
  "dawnwatch",
] as const;

export type ConstitutionSpecialistId =
  (typeof CONSTITUTION_SPECIALIST_IDS)[number];

export const BEHAVIOURAL_CONSTITUTIONS: Record<
  ConstitutionSpecialistId,
  BehaviouralConstitution
> = {
  jarvis: jarvisConstitution,
  gecko: geckoConstitution,
  marcus: marcusConstitution,
  oracle: oracleConstitution,
  steve: steveConstitution,
  herald: heraldConstitution,
  dawnwatch: dawnwatchConstitution,
};

export interface EffectiveBehaviouralConstitution {
  readonly shared: SharedConstitutionalLayer;
  readonly specialist: BehaviouralConstitution;
}

export function hasBehaviouralConstitution(
  specialistId: string
): specialistId is ConstitutionSpecialistId {
  return Object.prototype.hasOwnProperty.call(BEHAVIOURAL_CONSTITUTIONS, specialistId);
}

export function getBehaviouralConstitution(
  specialistId: ConstitutionSpecialistId
): BehaviouralConstitution {
  return BEHAVIOURAL_CONSTITUTIONS[specialistId];
}

/** Resolve the shared inheritance layer without changing runtime prompt assembly. */
export function getEffectiveBehaviouralConstitution(
  specialistId: ConstitutionSpecialistId
): EffectiveBehaviouralConstitution {
  return {
    shared: SHARED_CONSTITUTION,
    specialist: getBehaviouralConstitution(specialistId),
  };
}

export function validateBehaviouralConstitutionRegistry(): string[] {
  const errors: string[] = [];

  for (const specialistId of CONSTITUTION_SPECIALIST_IDS) {
    const constitution = BEHAVIOURAL_CONSTITUTIONS[specialistId];
    const agent = AGENTS_BY_ID[specialistId];

    if (!constitution) {
      errors.push(`missing behavioural constitution for ${specialistId}`);
      continue;
    }
    for (const error of validateBehaviouralConstitution(constitution)) {
      errors.push(`${specialistId}: ${error}`);
    }
    if (constitution.metadata.specialistId !== specialistId) {
      errors.push(`${specialistId}: constitution specialistId mismatch`);
    }
    if (!agent) {
      errors.push(`${specialistId}: no registered specialist`);
      continue;
    }
    if (!agent.behaviouralContract) {
      errors.push(`${specialistId}: registered specialist has no behavioural contract`);
      continue;
    }

    const declaredAuthority = constitution.authorityBoundaries.allowed;
    const uniqueAuthority = new Set(declaredAuthority);
    if (uniqueAuthority.size !== declaredAuthority.length) {
      errors.push(`${specialistId}: constitution contains duplicate authority entries`);
    }

    const legacyAuthority = new Set(agent.behaviouralContract.authority);
    for (const authority of uniqueAuthority) {
      if (!legacyAuthority.has(authority)) {
        errors.push(`${specialistId}: constitution expands authority to ${authority}`);
      }
    }
  }

  // Defensive runtime check against unsafe mutation or untyped construction.
  for (const specialistId of Object.keys(BEHAVIOURAL_CONSTITUTIONS)) {
    if (!CONSTITUTION_SPECIALIST_IDS.includes(specialistId as ConstitutionSpecialistId)) {
      errors.push(`orphan behavioural constitution for ${specialistId}`);
    }
  }

  return errors;
}
