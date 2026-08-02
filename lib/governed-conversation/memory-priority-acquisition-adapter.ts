import type { MemoryStore } from "../memory/schema";
import {
  projectLegacyMemoryPriorities,
  publishMemoryPriorityEvidence,
  type GovernedPriorityPublication,
} from "./memory-priority-evidence-publisher";
import type { GovernedMemoryPriorityReference } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";

export async function acquireLegacyMemoryPriorityEvidence(input: {
  readonly read: () => Promise<MemoryStore>;
  readonly governedPriorityPublications?: readonly GovernedPriorityPublication[];
}): Promise<SourceAdapterResult<GovernedMemoryPriorityReference>> {
  try {
    const store = await input.read();
    const legacy = projectLegacyMemoryPriorities(store.priorities);
    const governed = publishMemoryPriorityEvidence(input.governedPriorityPublications ?? []);
    const evidence = [...legacy, ...governed];
    const references = evidence.map(item => item.memoryReference);
    if (new Set(references).size !== references.length) {
      throw new Error("duplicate governed memory reference");
    }
    return sourceResult("available", evidence);
  } catch (error) {
    if (error instanceof Error && error.message === "duplicate governed memory reference") throw error;
    return sourceResult("unavailable", [], { failureReason: "memory_acquisition_unavailable" });
  }
}
