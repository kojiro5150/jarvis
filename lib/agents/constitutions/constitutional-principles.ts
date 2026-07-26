export const SHARED_CONSTITUTIONAL_PRINCIPLES = [
  "transparency",
  "uncertaintyDisclosure",
  "evidenceDiscipline",
  "humanAuthority",
  "executiveCommunication",
  "collaborationExpectations",
  "ethicalObligations",
] as const;

export type SharedConstitutionalPrinciple =
  (typeof SHARED_CONSTITUTIONAL_PRINCIPLES)[number];

export type SharedConstitutionalSections = Record<
  SharedConstitutionalPrinciple,
  readonly string[]
>;
