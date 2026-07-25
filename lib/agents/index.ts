import type { AgentDefinition } from "./types";
import { jarvis } from "./jarvis";
import { dawnwatch } from "./dawnwatch";
import { oracle } from "./oracle";
import { gecko } from "./gecko";
import { herald } from "./herald";
import { steve } from "./steve";
import { cowork } from "./cowork";
import { phdss } from "./phdss";
import { marcus } from "./marcus";

export type { AgentDefinition, AgentAccent, ChatMessage } from "./types";

/**
 * Ordered list of every agent, JARVIS first — this drives the agent rail.
 * Nine constitutional specialists as of the v2 UI architecture pass:
 * Executive Orchestration (JARVIS) → Executive Operations (DAWNWATCH) →
 * Specialist Intelligence (ORACLE, GECKO, HERALD, STEVE, CO-WORK, MARCUS,
 * PHDSS) — orchestration → operations → intelligence → execution →
 * reflection → governance, per Sam's explicit ordering. GECKO (external
 * market/ecosystem intelligence) and CO-WORK (long-form collaboration/
 * execution) are deliberately distinct and coexist — GECKO answers "what's
 * happening outside," CO-WORK answers "how do we build this together."
 */
export const AGENTS: AgentDefinition[] = [
  jarvis,
  dawnwatch,
  oracle,
  gecko,
  herald,
  steve,
  cowork,
  marcus,
  phdss,
];

export const AGENTS_BY_ID: Record<string, AgentDefinition> = Object.fromEntries(
  AGENTS.map((agent) => [agent.id, agent])
);

export function getAgent(id: string): AgentDefinition {
  return AGENTS_BY_ID[id] ?? jarvis;
}

export { jarvis, dawnwatch, oracle, gecko, herald, steve, cowork, marcus, phdss };
