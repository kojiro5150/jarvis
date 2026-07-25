import type { LucideIcon } from "lucide-react";
import type { ContextScope } from "@/lib/context-builder";

/**
 * Core shape of an agent definition.
 * Each agent lives in its own file under lib/agents/ so prompts,
 * personas, and metadata can be tuned independently.
 */
export interface AgentDefinition {
  /** Stable machine id, e.g. "oracle" */
  id: string;
  /** Display name, e.g. "ORACLE" */
  name: string;
  /** Short subtitle shown under the name in the rail, e.g. "Research & Insight" */
  subtitle: string;
  /** One-line description used in tooltips / headers */
  description: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Tailwind text/border/bg color token, e.g. "cyan", "violet" */
  accent: AgentAccent;
  /** The system prompt sent to Claude when this agent is active */
  systemPrompt: string;
  /** Whether this agent is the default/orchestrator (JARVIS) */
  isPrimary?: boolean;
  /**
   * Which layer this agent belongs to, per DESIGN_CONSTITUTION.md Principle 8:
   * "executive" — JARVIS and DAWNWATCH. Continuous situational awareness;
   *   orchestrate expertise rather than being subject-matter experts.
   * "specialist" — bounded-function agents (ORACLE, HERALD, CO-WORK, STEVE,
   *   PHDSS, MARCUS) that JARVIS routes to.
   */
  tier: "executive" | "specialist";
  /**
   * Which slice of OperationalState this agent's conversational context is
   * built from (see lib/context-builder.ts). Set per Sprint 2.4: there is
   * one OperationalState; every agent reasons from a defined view onto it
   * rather than being handed nothing (the DAWNWATCH "no active projects"
   * bug) or inferring/guessing what the state might be.
   */
  contextScope: ContextScope;
}

export type AgentAccent =
  | "cyan"
  | "violet"
  | "amber"
  | "emerald"
  | "rose"
  | "blue"
  | "fuchsia"
  | "slate"
  | "teal"
  | "gold"
  | "red"
  | "white";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
