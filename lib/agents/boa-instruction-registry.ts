import { AGENTS } from "./index";
import {
  createBoaInstructionFramework,
  validateBoaInstructionFile,
} from "./boa-instructions";

import type { BoaInstructionFile } from "./boa-instructions";

export const BOA_INSTRUCTIONS: Record<string, BoaInstructionFile> = Object.fromEntries(
  AGENTS.map((agent) => [agent.id, createBoaInstructionFramework(agent.id)])
);

export function getBoaInstruction(agentId: string): BoaInstructionFile {
  const instruction = BOA_INSTRUCTIONS[agentId];
  if (!instruction) throw new Error(`No BOA instruction file registered for ${agentId}`);
  return instruction;
}

export function validateBoaInstructionRegistry(): string[] {
  const errors: string[] = [];
  for (const agent of AGENTS) {
    const instruction = BOA_INSTRUCTIONS[agent.id];
    if (!instruction) {
      errors.push(`missing BOA instruction file for ${agent.id}`);
      continue;
    }
    for (const error of validateBoaInstructionFile(instruction)) {
      errors.push(`${agent.id}: ${error}`);
    }
  }
  for (const agentId of Object.keys(BOA_INSTRUCTIONS)) {
    if (!AGENTS.some((agent) => agent.id === agentId)) {
      errors.push(`orphan BOA instruction file for ${agentId}`);
    }
  }
  return errors;
}
