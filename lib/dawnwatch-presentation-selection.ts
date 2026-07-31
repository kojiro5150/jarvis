import { getOpeningBrief } from "./briefing";
import { adaptDawnwatchPresentation, type DawnwatchOpeningPresentation } from "./dawnwatch-presentation-adapter";
import {
  buildDawnwatchPresentation,
  DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
  type DawnwatchPresentationInput,
} from "./dawnwatch-presentation";
import type { OperationalState } from "./operational-state";

export type DawnwatchPresentationMode = "LEGACY" | "GOVERNED";

/** Server-side runtime selection. An absent value intentionally preserves production behaviour. */
export function selectDawnwatchPresentationMode(value: string | undefined): DawnwatchPresentationMode {
  if (value === undefined || value.trim() === "") return "LEGACY";
  if (value === "LEGACY" || value === "GOVERNED") return value;
  throw new Error("DAWNWATCH_PRESENTATION_MODE must be LEGACY or GOVERNED");
}

/**
 * Presentation-only bridge. Existing identifiers and source labels are retained without creating
 * a canonical publication or reconstructing legacy-only presentation claims.
 */
export function buildProductionDawnwatchInput(state: OperationalState): DawnwatchPresentationInput {
  // Legacy connector data has no assertion identity distinct from its stable entity identity, so
  // reuse each entity id. Revisit this when a canonical ExecutiveStateSnapshot-backed source can
  // supply genuine per-assertion identities.
  return {
    priorities: state.priorities.map((priority, index) => ({
      id: `priority-${index}`,
      title: priority.title,
      provenance: { sourceId: "memory", assertionId: `priority-${index}` },
    })),
    commitments: state.calendar.map(commitment => ({
      id: commitment.id,
      title: commitment.title,
      start: commitment.start,
      end: commitment.end,
      status: commitment.status === "cancelled" ? "cancelled" : "scheduled",
      provenance: { sourceId: "calendar", assertionId: commitment.id },
    })),
    communications: state.gmailThreads.map(communication => ({
      id: communication.id,
      sender: communication.from,
      recipients: [],
      sentAt: communication.receivedAt,
      receivedAt: communication.receivedAt,
      subject: communication.subject,
      provenance: { sourceId: "gmail", assertionId: communication.id },
    })),
    sources: [{
      id: "memory",
      kind: "memory",
      // Memory is local application state and is consistently reported ONLINE; unlike external
      // connectors, OperationalState exposes no disconnected or unavailable memory condition.
      availability: "available",
      observedAt: state.updatedAt,
      snapshotId: `snapshot-memory-${state.updatedAt}`,
      provenance: { sourceId: "memory", assertionId: "memory" },
    }, ...state.connectorStatuses.map(source => {
      // OperationalState has no canonical snapshot identity. Use a deterministic presentation-
      // boundary placeholder until an ExecutiveStateSnapshot-backed source supplies the real one.
      const snapshotId = `snapshot-${source.name}-${state.updatedAt}`;
      return {
        id: source.name,
        kind: source.name,
        availability: source.connected ? "available" as const : "unavailable" as const,
        observedAt: state.updatedAt,
        snapshotId,
        provenance: { sourceId: source.name, assertionId: source.name },
      };
    })],
  };
}

export function buildDawnwatchOpeningPresentation(
  mode: DawnwatchPresentationMode,
  agentId: string,
  state: OperationalState,
): DawnwatchOpeningPresentation | undefined {
  if (agentId !== "dawnwatch") return undefined;
  if (mode === "LEGACY") return { mode, prose: getOpeningBrief(agentId, state) };

  const input = buildProductionDawnwatchInput(state);
  const sourceScope = input.sources.map(source => source.id);
  const governed = buildDawnwatchPresentation(input, {
    ...DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION,
    referenceTime: state.updatedAt,
    sourceScope: sourceScope.length ? sourceScope : ["operational-state-source-unavailable"],
    identityTieBreakRule: "canonical_identity_ascending",
  });
  return { mode, presentation: adaptDawnwatchPresentation(governed) };
}
