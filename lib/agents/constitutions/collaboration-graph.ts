import type { BehaviouralCapabilityMatrix } from "./capability-matrix";
import type { ConstitutionSpecialistId } from "./registry";

export interface BehaviouralCollaborationNode {
  readonly specialistId: ConstitutionSpecialistId;
}

export interface BehaviouralCollaborationEdge {
  readonly sourceSpecialistId: ConstitutionSpecialistId;
  readonly targetSpecialistId: ConstitutionSpecialistId;
  readonly reciprocal: boolean;
}

export interface BehaviouralCollaborationGraph {
  readonly nodes: readonly BehaviouralCollaborationNode[];
  readonly edges: readonly BehaviouralCollaborationEdge[];
}

function edgeKey(
  sourceSpecialistId: ConstitutionSpecialistId,
  targetSpecialistId: ConstitutionSpecialistId
): string {
  return `${sourceSpecialistId}\u0000${targetSpecialistId}`;
}

/**
 * Project constitutionally declared collaboration topology from a capability
 * matrix. Array order is canonical representation order, never execution order.
 */
export function buildBehaviouralCollaborationGraph(
  matrix: BehaviouralCapabilityMatrix
): BehaviouralCollaborationGraph {
  const nodeOrder = new Map<ConstitutionSpecialistId, number>();
  const nodes = matrix.capabilities.map(({ specialistId }, index) => {
    if (!specialistId) {
      throw new Error("behavioural collaboration graph: missing specialistId");
    }
    if (nodeOrder.has(specialistId)) {
      throw new Error(
        `behavioural collaboration graph: duplicate specialist node: ${specialistId}`
      );
    }
    nodeOrder.set(specialistId, index);
    return Object.freeze({ specialistId });
  });

  const declaredEdges = new Map<
    string,
    readonly [ConstitutionSpecialistId, ConstitutionSpecialistId]
  >();

  for (const capability of matrix.capabilities) {
    for (const targetSpecialistId of capability.collaborationPartners) {
      if (!nodeOrder.has(targetSpecialistId)) {
        throw new Error(
          `behavioural collaboration graph: unknown collaboration target: ${targetSpecialistId}`
        );
      }
      const key = edgeKey(capability.specialistId, targetSpecialistId);
      if (!declaredEdges.has(key)) {
        declaredEdges.set(key, [capability.specialistId, targetSpecialistId]);
      }
    }
  }

  const orderedEdges = [...declaredEdges.values()].sort((left, right) => {
    const sourceDifference =
      nodeOrder.get(left[0])! - nodeOrder.get(right[0])!;
    return sourceDifference || nodeOrder.get(left[1])! - nodeOrder.get(right[1])!;
  });
  const edges = orderedEdges.map(([sourceSpecialistId, targetSpecialistId]) =>
    Object.freeze({
      sourceSpecialistId,
      targetSpecialistId,
      reciprocal: declaredEdges.has(
        edgeKey(targetSpecialistId, sourceSpecialistId)
      ),
    })
  );

  return Object.freeze({
    nodes: Object.freeze(nodes),
    edges: Object.freeze(edges),
  });
}
