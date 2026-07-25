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

  /** Tailwind text/border/bg colour token, e.g. "cyan", "violet" */
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

  /** Declares the functions this agent is designed to perform. */
  capabilities?: AgentCapability[];

  /** High-level intents that may justify a hand-off to this agent. */
  handoffTriggers?: HandoffTrigger[];

  /** Machine-readable BOA behavioural boundary. */
  behaviouralContract?: BehaviouralContract;
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

export type AgentCapability =
  | "orchestration"
  | "operations"
  | "research"
  | "markets"
  | "communications"
  | "software"
  | "collaboration"
  | "governance"
  | "reflection";

export type HandoffTrigger =
  | "research"
  | "evidence"
  | "literature"
  | "market-analysis"
  | "communications"
  | "coding"
  | "implementation"
  | "governance"
  | "decision-support"
  | "reflection"
  | "planning";

export type ReasoningDepth =
  | "quick"
  | "standard"
  | "deep"
  | "high-stakes"
  | "phdss";

export type RoutingSource =
  | "user-selection"
  | "orchestrator"
  | "fallback";

export type RoutingConfidence = "high" | "medium" | "low";

export interface RoutingIntent {
  requestedAgentId?: string;
  inferredCapabilities: AgentCapability[];
  inferredTriggers: HandoffTrigger[];
  reasoningDepth: ReasoningDepth;
  source: RoutingSource;
  confidence: RoutingConfidence;
}

export interface RoutingDecision {
  selectedAgentId: string;
  reason: string;
  confidence: RoutingConfidence;
  source: RoutingSource;
  reasoningDepth: ReasoningDepth;
}

/**
 * The maximum authority granted to an agent through a hand-off.
 * No value independently authorises an external side effect.
 */
export type HandoffAuthority =
  | "advise"
  | "draft"
  | "propose-action";

export interface BehaviouralContract {
  role: string;
  mandate: string;
  prevents: string[];
  obligations: string[];
  epistemicDiscipline: string[];
  authority: HandoffAuthority[];
  escalationConditions: string[];
  outputContract: string;
}

export interface AgentHandoff {
  fromAgentId: string;
  toAgentId: string;
  userIntent: string;
  task: string;
  contextScope: ContextScope;
  constraints: string[];
  expectedOutput: string;
  authority: HandoffAuthority;
}

/** Input to deterministic BOA contract-aware coordination. */
export interface CoordinationRequest {
  selectedAgentId: string;
  requestedAuthority: HandoffAuthority;
}

/**
 * Deterministic result of checking a requested hand-off against the selected
 * agent's behavioural contract.
 */
export interface CoordinationDecision {
  selectedAgentId: string;
  approved: boolean;
  reason: string;
  grantedAuthority?: HandoffAuthority;
  obligations: string[];
  epistemicDiscipline: string[];
  escalationConditions: string[];
  outputContract?: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
