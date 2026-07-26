export {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
  getBehaviouralConstitution,
  getEffectiveBehaviouralConstitution,
  hasBehaviouralConstitution,
  validateBehaviouralConstitutionRegistry,
} from "./registry";
export { SHARED_CONSTITUTION } from "./shared";
export { validateBehaviouralConstitution } from "./constitution";

export type {
  BehaviouralConstitution,
  ConstitutionMetadata,
  ConstitutionStatus,
} from "./constitution";
export type {
  ConstitutionSpecialistId,
  EffectiveBehaviouralConstitution,
} from "./registry";
export type { SharedConstitutionalLayer } from "./shared";
