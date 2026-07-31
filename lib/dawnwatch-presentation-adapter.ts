import type {
  DawnwatchCapabilityStatus,
  DawnwatchGovernedAvailability,
  DawnwatchPresentation,
  DawnwatchSemanticStatus,
  DawnwatchSection,
} from "./dawnwatch-presentation";

export interface AdaptedDawnwatchSectionStatus {
  readonly status: DawnwatchSemanticStatus;
  readonly availability: DawnwatchGovernedAvailability;
  readonly evidence: readonly string[];
}

export interface AdaptedDawnwatchPresentation {
  readonly voice: string;
  readonly overallStatus: DawnwatchSemanticStatus;
  readonly sections: {
    readonly priorities: AdaptedDawnwatchSectionStatus;
    readonly commitments: AdaptedDawnwatchSectionStatus;
    readonly communications: AdaptedDawnwatchSectionStatus;
    readonly urgency: AdaptedDawnwatchSectionStatus;
  };
  readonly capabilities: readonly DawnwatchCapabilityStatus[];
}

export type DawnwatchOpeningPresentation =
  | { readonly mode: "LEGACY"; readonly prose: string }
  | { readonly mode: "GOVERNED"; readonly presentation: AdaptedDawnwatchPresentation };

const sectionStatus = (
  section: DawnwatchSection<unknown>,
): AdaptedDawnwatchSectionStatus => ({
  status: section.status,
  availability: section.availability,
  evidence: [...section.evidence],
});

/** Narrows the governed result for the existing document renderer without adding presentation claims. */
export function adaptDawnwatchPresentation(
  governed: DawnwatchPresentation,
): AdaptedDawnwatchPresentation {
  return {
    voice: governed.voice,
    overallStatus: governed.overallStatus,
    sections: {
      priorities: sectionStatus(governed.priorities),
      commitments: sectionStatus(governed.commitments),
      communications: sectionStatus(governed.communications),
      urgency: sectionStatus(governed.urgency),
    },
    capabilities: governed.capabilities.map(capability => ({ ...capability })),
  };
}
