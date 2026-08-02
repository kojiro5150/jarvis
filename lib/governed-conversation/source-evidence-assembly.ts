import { acquireGovernedCalendarEvidence, type CalendarAcquisitionPort } from "./calendar-evidence-acquisition-adapter";
import { acquireGovernedConnectorAvailability, type ConnectorLiveResult } from "./connector-availability-acquisition-adapter";
import { acquireGovernedGmailEvidence, type GmailProductionAcquisitionPort } from "./gmail-evidence-acquisition-adapter";
import { acquireLegacyMemoryPriorityEvidence } from "./memory-priority-acquisition-adapter";
import type { GovernedPriorityPublication } from "./memory-priority-evidence-publisher";
import type { MemoryStore } from "../memory/schema";
import type { GovernedCalendarEvidenceInput, GovernedCommunicationEvidenceInput, GovernedConnectorAvailabilityInput, GovernedMemoryPriorityReference } from "./projection-composer";

export interface GovernedSourceEvidenceAssemblyInput {
  readonly gmail: { readonly connector: GmailProductionAcquisitionPort; readonly limit?: number };
  readonly calendar: { readonly connector: CalendarAcquisitionPort; readonly clock: () => Date; readonly requestedLimit: number; readonly horizonDays: number };
  readonly memory: { readonly read: () => Promise<MemoryStore>; readonly governedPriorityPublications?: readonly GovernedPriorityPublication[] };
  readonly connectorAvailability: { readonly observedAt: string; readonly results: readonly ConnectorLiveResult[] };
}
export type AssemblySourceStatus = "available" | "unavailable" | "failed";
export interface GovernedSourceEvidenceAssemblyResult {
  readonly communicationEvidence: readonly GovernedCommunicationEvidenceInput[];
  readonly calendarEvidence: readonly GovernedCalendarEvidenceInput[];
  readonly memoryPriorityReferences: readonly GovernedMemoryPriorityReference[];
  readonly connectorAvailability: readonly GovernedConnectorAvailabilityInput[];
  readonly sourceResults: Readonly<Record<"gmail" | "calendar" | "memoryPriority" | "connectorAvailability", Readonly<{ status: AssemblySourceStatus; failureReason?: string }>>>;
}

const freezeEvidence = <T>(items: readonly T[]): readonly T[] => Object.freeze(items.map(item => Object.freeze({ ...item })));
const diagnostic = (result: PromiseSettledResult<{ readonly status: "available" | "unavailable"; readonly failureReason?: string }>) =>
  Object.freeze(result.status === "rejected"
    ? { status: "failed" as const, failureReason: "adapter_contract_failed" }
    : { status: result.value.status, ...(result.value.failureReason ? { failureReason: result.value.failureReason } : {}) });

export async function assembleGovernedSourceEvidence(input: GovernedSourceEvidenceAssemblyInput): Promise<GovernedSourceEvidenceAssemblyResult> {
  const [gmail, calendar, memory, connectors] = await Promise.allSettled([
    acquireGovernedGmailEvidence(input.gmail),
    acquireGovernedCalendarEvidence(input.calendar),
    acquireLegacyMemoryPriorityEvidence(input.memory),
    Promise.resolve().then(() => acquireGovernedConnectorAvailability(input.connectorAvailability)),
  ]);
  const result = {
    communicationEvidence: freezeEvidence(gmail.status === "fulfilled" ? gmail.value.evidence : []),
    calendarEvidence: freezeEvidence(calendar.status === "fulfilled" ? calendar.value.evidence : []),
    memoryPriorityReferences: freezeEvidence(memory.status === "fulfilled" ? memory.value.evidence : []),
    connectorAvailability: freezeEvidence(connectors.status === "fulfilled" ? connectors.value.evidence : []),
    sourceResults: Object.freeze({ gmail: diagnostic(gmail), calendar: diagnostic(calendar), memoryPriority: diagnostic(memory), connectorAvailability: diagnostic(connectors) }),
  };
  return Object.freeze(result);
}
