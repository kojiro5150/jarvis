import type {
  BehaviouralCapability,
  BehaviouralCapabilityMatrix,
} from "./capability-matrix";
import type { BehaviouralCollaborationGraph } from "./collaboration-graph";
import type { ConstitutionSpecialistId } from "./registry";

export type BehaviouralDiagnosticSeverity = "information" | "attention";

export type BehaviouralDiagnosticCode =
  | "isolated_specialist"
  | "outgoing_only_specialist"
  | "incoming_only_specialist"
  | "one_way_collaboration"
  | "reciprocal_collaboration"
  | "disconnected_component"
  | "empty_responsibilities"
  | "empty_authority_boundaries"
  | "empty_outputs";

export interface BehaviouralDiagnostic {
  readonly code: BehaviouralDiagnosticCode;
  readonly severity: BehaviouralDiagnosticSeverity;
  readonly specialistIds: readonly ConstitutionSpecialistId[];
  readonly message: string;
}

export interface BehaviouralDiagnosticsSummary {
  readonly specialistCount: number;
  readonly collaborationEdgeCount: number;
  readonly reciprocalPairCount: number;
  readonly isolatedSpecialistCount: number;
  readonly disconnectedComponentCount: number;
  readonly diagnosticCount: number;
  readonly attentionCount: number;
  readonly informationCount: number;
}

export interface BehaviouralDiagnosticsReport {
  readonly diagnostics: readonly BehaviouralDiagnostic[];
  readonly summary: BehaviouralDiagnosticsSummary;
}

const CODE_ORDER: Readonly<Record<BehaviouralDiagnosticCode, number>> = {
  isolated_specialist: 0,
  outgoing_only_specialist: 1,
  incoming_only_specialist: 2,
  one_way_collaboration: 3,
  reciprocal_collaboration: 4,
  disconnected_component: 5,
  empty_responsibilities: 6,
  empty_authority_boundaries: 7,
  empty_outputs: 8,
};

function invariant(message: string): never {
  throw new Error(`behavioural architecture diagnostics: ${message}`);
}

function edgeKey(source: string, target: string): string {
  return `${source}\u0000${target}`;
}

function diagnostic(
  code: BehaviouralDiagnosticCode,
  severity: BehaviouralDiagnosticSeverity,
  specialistIds: readonly ConstitutionSpecialistId[],
  message: string
): BehaviouralDiagnostic {
  return Object.freeze({
    code,
    severity,
    specialistIds: Object.freeze([...specialistIds]),
    message,
  });
}

function validateInputs(
  matrix: BehaviouralCapabilityMatrix,
  graph: BehaviouralCollaborationGraph
): Map<ConstitutionSpecialistId, number> {
  if (!matrix || !Array.isArray(matrix.capabilities)) {
    invariant("missing capability collection");
  }
  if (!graph || !Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) {
    invariant("missing graph collections");
  }

  const matrixOrder = new Map<ConstitutionSpecialistId, number>();
  matrix.capabilities.forEach((capability, index) => {
    if (!capability?.specialistId) invariant("missing matrix specialistId");
    if (typeof capability.mission !== "string") {
      invariant(`missing mission for ${capability.specialistId}`);
    }
    if (matrixOrder.has(capability.specialistId)) {
      invariant(`duplicate matrix specialist: ${capability.specialistId}`);
    }
    for (const field of [
      "responsibilities",
      "authorityBoundaries",
      "collaborationPartners",
      "outputs",
    ] as const) {
      if (!Array.isArray(capability[field])) {
        invariant(`missing ${field} for ${capability.specialistId}`);
      }
    }
    matrixOrder.set(capability.specialistId, index);
  });

  const graphIds = new Set<ConstitutionSpecialistId>();
  for (const node of graph.nodes) {
    if (!node?.specialistId) invariant("missing graph node specialistId");
    if (graphIds.has(node.specialistId)) {
      invariant(`duplicate graph node: ${node.specialistId}`);
    }
    if (!matrixOrder.has(node.specialistId)) {
      invariant(`graph specialist absent from matrix: ${node.specialistId}`);
    }
    graphIds.add(node.specialistId);
  }
  for (const specialistId of matrixOrder.keys()) {
    if (!graphIds.has(specialistId)) {
      invariant(`matrix specialist absent from graph: ${specialistId}`);
    }
  }

  const edges = new Set<string>();
  for (const edge of graph.edges) {
    if (!edge?.sourceSpecialistId || !edge?.targetSpecialistId) {
      invariant("edge is missing a specialist reference");
    }
    if (!graphIds.has(edge.sourceSpecialistId)) {
      invariant(`edge references missing source: ${edge.sourceSpecialistId}`);
    }
    if (!graphIds.has(edge.targetSpecialistId)) {
      invariant(`edge references missing target: ${edge.targetSpecialistId}`);
    }
    const key = edgeKey(edge.sourceSpecialistId, edge.targetSpecialistId);
    if (edges.has(key)) invariant(`duplicate graph edge: ${key}`);
    edges.add(key);
  }
  for (const edge of graph.edges) {
    const expectedReciprocal = edges.has(
      edgeKey(edge.targetSpecialistId, edge.sourceSpecialistId)
    );
    if (edge.reciprocal !== expectedReciprocal) {
      invariant(
        `incorrect reciprocal marker: ${edge.sourceSpecialistId} -> ${edge.targetSpecialistId}`
      );
    }
  }
  return matrixOrder;
}

function weakComponents(
  specialistIds: readonly ConstitutionSpecialistId[],
  adjacency: ReadonlyMap<ConstitutionSpecialistId, Set<ConstitutionSpecialistId>>
): ConstitutionSpecialistId[][] {
  const visited = new Set<ConstitutionSpecialistId>();
  const components: ConstitutionSpecialistId[][] = [];
  for (const specialistId of specialistIds) {
    if (visited.has(specialistId)) continue;
    const component: ConstitutionSpecialistId[] = [];
    const pending = [specialistId];
    visited.add(specialistId);
    while (pending.length > 0) {
      const current = pending.shift()!;
      component.push(current);
      for (const candidate of specialistIds) {
        if (!visited.has(candidate) && adjacency.get(current)!.has(candidate)) {
          visited.add(candidate);
          pending.push(candidate);
        }
      }
    }
    const members = new Set(component);
    components.push(specialistIds.filter((id) => members.has(id)));
  }
  return components;
}

/**
 * Diagnose deterministic structural properties without altering, repairing,
 * ranking, optimising, approving, rejecting or enforcing the architecture.
 */
export function diagnoseBehaviouralArchitecture(
  matrix: BehaviouralCapabilityMatrix,
  graph: BehaviouralCollaborationGraph
): BehaviouralDiagnosticsReport {
  const matrixOrder = validateInputs(matrix, graph);
  const specialistIds = matrix.capabilities.map(({ specialistId }) => specialistId);
  const incoming = new Map(specialistIds.map((id) => [id, new Set<ConstitutionSpecialistId>()]));
  const outgoing = new Map(specialistIds.map((id) => [id, new Set<ConstitutionSpecialistId>()]));
  const adjacency = new Map(specialistIds.map((id) => [id, new Set<ConstitutionSpecialistId>()]));
  const edges = new Set<string>();
  for (const edge of graph.edges) {
    outgoing.get(edge.sourceSpecialistId)!.add(edge.targetSpecialistId);
    incoming.get(edge.targetSpecialistId)!.add(edge.sourceSpecialistId);
    adjacency.get(edge.sourceSpecialistId)!.add(edge.targetSpecialistId);
    adjacency.get(edge.targetSpecialistId)!.add(edge.sourceSpecialistId);
    edges.add(edgeKey(edge.sourceSpecialistId, edge.targetSpecialistId));
  }

  const diagnostics: BehaviouralDiagnostic[] = [];
  for (const specialistId of specialistIds) {
    const hasIncoming = incoming.get(specialistId)!.size > 0;
    const hasOutgoing = outgoing.get(specialistId)!.size > 0;
    if (!hasIncoming && !hasOutgoing) {
      diagnostics.push(diagnostic("isolated_specialist", "attention", [specialistId], `Specialist "${specialistId}" has no declared incoming or outgoing collaboration relationships.`));
    } else if (hasOutgoing && !hasIncoming) {
      diagnostics.push(diagnostic("outgoing_only_specialist", "attention", [specialistId], `Specialist "${specialistId}" declares outgoing collaboration relationships but has no declared incoming relationships.`));
    } else if (hasIncoming && !hasOutgoing) {
      diagnostics.push(diagnostic("incoming_only_specialist", "attention", [specialistId], `Specialist "${specialistId}" has declared incoming collaboration relationships but declares no outgoing relationships.`));
    }
  }

  const reciprocalPairs = new Set<string>();
  for (const edge of graph.edges) {
    const inverse = edgeKey(edge.targetSpecialistId, edge.sourceSpecialistId);
    if (!edges.has(inverse)) {
      diagnostics.push(diagnostic("one_way_collaboration", "attention", [edge.sourceSpecialistId, edge.targetSpecialistId], `Specialist "${edge.sourceSpecialistId}" declares collaboration with "${edge.targetSpecialistId}" without a reciprocal declaration.`));
      continue;
    }
    const ordered = [edge.sourceSpecialistId, edge.targetSpecialistId].sort(
      (a, b) => matrixOrder.get(a)! - matrixOrder.get(b)!
    ) as ConstitutionSpecialistId[];
    const pairKey = edgeKey(ordered[0], ordered[1]);
    if (!reciprocalPairs.has(pairKey)) {
      reciprocalPairs.add(pairKey);
      diagnostics.push(diagnostic("reciprocal_collaboration", "information", ordered, `Specialists "${ordered[0]}" and "${ordered[1]}" declare reciprocal collaboration relationships.`));
    }
  }

  const components = weakComponents(specialistIds, adjacency);
  if (components.length > 1) {
    for (const component of components) {
      diagnostics.push(diagnostic("disconnected_component", "information", component, `The collaboration graph contains a disconnected component comprising: ${component.join(", ")}.`));
    }
  }

  const emptyRules: readonly [keyof Pick<BehaviouralCapability, "responsibilities" | "authorityBoundaries" | "outputs">, BehaviouralDiagnosticCode, string][] = [
    ["responsibilities", "empty_responsibilities", "responsibilities"],
    ["authorityBoundaries", "empty_authority_boundaries", "authority boundaries"],
    ["outputs", "empty_outputs", "outputs"],
  ];
  for (const capability of matrix.capabilities) {
    for (const [field, code, label] of emptyRules) {
      if (capability[field].length === 0) {
        diagnostics.push(diagnostic(code, "attention", [capability.specialistId], `Specialist "${capability.specialistId}" has no constitutionally projected ${label}.`));
      }
    }
  }

  diagnostics.sort((left, right) => {
    const codeDifference = CODE_ORDER[left.code] - CODE_ORDER[right.code];
    if (codeDifference) return codeDifference;
    const length = Math.max(left.specialistIds.length, right.specialistIds.length);
    for (let index = 0; index < length; index += 1) {
      const difference = (matrixOrder.get(left.specialistIds[index]) ?? -1) - (matrixOrder.get(right.specialistIds[index]) ?? -1);
      if (difference) return difference;
    }
    return left.message < right.message ? -1 : left.message > right.message ? 1 : 0;
  });

  const frozenDiagnostics = Object.freeze([...diagnostics]);
  const summary = Object.freeze({
    specialistCount: matrix.capabilities.length,
    collaborationEdgeCount: graph.edges.length,
    reciprocalPairCount: diagnostics.filter(({ code }) => code === "reciprocal_collaboration").length,
    isolatedSpecialistCount: diagnostics.filter(({ code }) => code === "isolated_specialist").length,
    disconnectedComponentCount: components.length,
    diagnosticCount: diagnostics.length,
    attentionCount: diagnostics.filter(({ severity }) => severity === "attention").length,
    informationCount: diagnostics.filter(({ severity }) => severity === "information").length,
  });
  return Object.freeze({ diagnostics: frozenDiagnostics, summary });
}
