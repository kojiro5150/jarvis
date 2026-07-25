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

export type {
  AgentDefinition,
  AgentAccent,
  AgentCapability,
  HandoffTrigger,
  ReasoningDepth,
  RoutingIntent,
  RoutingDecision,
  RoutingSource,
  RoutingConfidence,
  AgentHandoff,
  HandoffAuthority,
  ChatMessage,
} from "./types";

/**
 * Ordered list of every agent, JARVIS first — this drives the agent rail.
 *
 * Constitutional ordering:
 *
 * Executive
 * ├─ JARVIS      (Executive Orchestration)
 * └─ DAWNWATCH   (Executive Operations)
 *
 * Specialists
 * ├─ ORACLE      (Research & Insight)
 * ├─ GECKO       (Markets & External Intelligence)
 * ├─ HERALD      (Communications)
 * ├─ STEVE       (Software Engineering)
 * ├─ CO-WORK     (Long-form Collaboration)
 * ├─ MARCUS      (Reflection & Decision Quality)
 * └─ PHDSS       (Governance & Public Health Decision Stewardship)
 *
 * This registry is intentionally declarative. It provides discovery,
 * lookup and ordering only. Routing behaviour is implemented elsewhere.
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

export {
  jarvis,
  dawnwatch,
  oracle,
  gecko,
  herald,
  steve,
  cowork,
  marcus,
  phdss,
};
