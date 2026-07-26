import type { AgentDefinition } from "./types";

export const BOA_INSTRUCTION_SECTIONS = [
  "identityAndFunction",
  "mission",
  "nonGoals",
  "behaviouralObligations",
  "failureModes",
  "epistemicRules",
  "evidenceHandling",
  "authorityLimits",
  "escalationTriggers",
  "handoffRules",
  "collaborationRules",
  "outputStructure",
  "stopConditions",
] as const;

export type BoaInstructionSection = (typeof BOA_INSTRUCTION_SECTIONS)[number];
export type BoaInstructionStatus = "framework" | "draft" | "active" | "retired";

export interface BoaInstructionFile {
  agentId: string;
  version: string;
  status: BoaInstructionStatus;
  sections: Record<BoaInstructionSection, string[]>;
}

export const SHARED_BOA_INSTRUCTIONS = {
  epistemicDiscipline: [
    "Distinguish evidence, inference, assumption and recommendation.",
    "Surface material uncertainty rather than concealing it with fluent language.",
  ],
  authorityBoundary: [
    "Do not claim that an external action occurred unless the runtime confirms it.",
    "Do not exceed the authority granted by the deterministic execution gate.",
  ],
  escalationProtocol: [
    "Surface applicable escalation conditions for human assessment; do not decide them independently.",
  ],
  outputConventions: [
    "Return the requested specialist artefact without impersonating another specialist or JARVIS synthesis.",
  ],
} as const;

const emptySections = (): Record<BoaInstructionSection, string[]> =>
  Object.fromEntries(BOA_INSTRUCTION_SECTIONS.map((section) => [section, []])) as Record<
    BoaInstructionSection,
    string[]
  >;

export function createBoaInstructionFramework(agentId: string): BoaInstructionFile {
  const sections = emptySections();
  sections.epistemicRules = [...SHARED_BOA_INSTRUCTIONS.epistemicDiscipline];
  sections.authorityLimits = [...SHARED_BOA_INSTRUCTIONS.authorityBoundary];
  sections.escalationTriggers = [...SHARED_BOA_INSTRUCTIONS.escalationProtocol];
  sections.outputStructure = [...SHARED_BOA_INSTRUCTIONS.outputConventions];

  return {
    agentId,
    version: "0.1.0",
    status: "framework",
    sections,
  };
}

export function validateBoaInstructionFile(file: BoaInstructionFile): string[] {
  const errors: string[] = [];
  if (!file.agentId.trim()) errors.push("agentId is required");
  if (!/^\d+\.\d+\.\d+$/.test(file.version)) errors.push("version must use semver");
  for (const section of BOA_INSTRUCTION_SECTIONS) {
    if (!Array.isArray(file.sections[section])) errors.push(`missing section: ${section}`);
  }
  return errors;
}

const title = (value: string) =>
  value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());

export function assembleBoaInstructionPrompt(file: BoaInstructionFile): string {
  const errors = validateBoaInstructionFile(file);
  if (errors.length > 0) throw new Error(`Invalid BOA instruction file: ${errors.join(", ")}`);

  const sections = BOA_INSTRUCTION_SECTIONS
    .map((section) => {
      const values = file.sections[section];
      return values.length > 0
        ? `${title(section).toUpperCase()}:\n${values.map((value) => `- ${value}`).join("\n")}`
        : null;
    })
    .filter((value): value is string => Boolean(value));

  return [
    `BOA INSTRUCTION FILE · ${file.agentId} · v${file.version} · ${file.status}`,
    ...sections,
  ].join("\n\n");
}

export function assembleAgentSystemPrompt(
  agent: AgentDefinition,
  instruction: BoaInstructionFile,
  contextBlock?: string
): string {
  if (instruction.agentId !== agent.id) {
    throw new Error(`BOA instruction agent mismatch: expected ${agent.id}, received ${instruction.agentId}`);
  }
  return [agent.systemPrompt, assembleBoaInstructionPrompt(instruction), contextBlock]
    .filter((value): value is string => Boolean(value?.trim()))
    .join("\n\n");
}
