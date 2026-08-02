import type { GmailProductionAcquisition } from "../connectors/google/gmail";
import { projectProductionGmailEvidence } from "../executive-context/gmail-production-evidence";
import { publishGmailEvidence } from "./gmail-evidence-publisher";
import type { GovernedCommunicationEvidenceInput } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";

export interface GmailProductionAcquisitionPort {
  acquireRecent(limit?: number): Promise<GmailProductionAcquisition>;
}

export async function acquireGovernedGmailEvidence(input: {
  readonly connector: GmailProductionAcquisitionPort;
  readonly limit?: number;
}): Promise<SourceAdapterResult<GovernedCommunicationEvidenceInput>> {
  try {
    const acquisition = await input.connector.acquireRecent(input.limit);
    return sourceResult("available", publishGmailEvidence(projectProductionGmailEvidence(acquisition)), {
      observedAt: acquisition.observedAt,
    });
  } catch {
    return sourceResult("unavailable", [], { failureReason: "gmail_acquisition_unavailable" });
  }
}
