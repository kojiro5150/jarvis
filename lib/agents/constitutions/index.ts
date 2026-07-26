export {
  BEHAVIOURAL_CONSTITUTIONS,
  CONSTITUTION_SPECIALIST_IDS,
  getBehaviouralConstitution,
  getEffectiveBehaviouralConstitution,
  hasBehaviouralConstitution,
  validateBehaviouralConstitutionRegistry,
  validateConstitutionRegistryCompliance,
} from "./registry";
export { SHARED_CONSTITUTION } from "./shared";
export { validateBehaviouralConstitution } from "./constitution";
export {
  BEHAVIOURAL_CONSTITUTION_REGISTRY,
  buildBehaviouralCapabilityMatrix,
} from "./capability-matrix";
export {
  compareConstitutionComplianceIssues,
  validateConstitutionCompliance,
  validateConstitutionComplianceRegistry,
} from "./compliance";

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
export type {
  ConstitutionComplianceCategory,
  ConstitutionComplianceContext,
  ConstitutionComplianceIssue,
  ConstitutionComplianceRegistryEntry,
  SharedPrincipleComplianceInput,
} from "./compliance";
export type { ConstitutionComplianceRegistryInput } from "./registry";
export type {
  BehaviouralCapability,
  BehaviouralCapabilityMatrix,
  ConstitutionRegistry,
} from "./capability-matrix";
