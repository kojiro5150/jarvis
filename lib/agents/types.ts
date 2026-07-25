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

  /**
   * Declares the functions this agent is designed to perform.
   * Optional during the staged migration of existing agent definitions.
   */
  capabilities?: AgentCapability[];

  /**
   * High-level intents that may justify a hand-off to this agent.
   * Declarative metadata only; it does not execute routing.
   */
  handoffTriggers?: HandoffTrigger[];

  /**
   * Machine-readable BOA behavioural boundary.
   * Optional while existing agents are migrated incrementally.
   */
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

/**
 * Proportional reasoning depth selected before specialist routing.
 *
 * The deterministic router carries this value forward but does not infer,
 * increase, decrease, or otherwise interpret it.
 */
export type ReasoningDepth =
  | "quick"
  | "standard"
  | "deep"
  | "high-stakes"
  | "phdss";

/**
 * How JARVIS arrived at a routing decision.
 */
export type RoutingSource =
  | "user-selection"
  | "orchestrator"
  | "fallback";

/**
 * Confidence expressed by the routing layer.
 *
 * This is routing confidence, not confidence in the specialist's eventual
 * answer or recommendation.
 */
export type RoutingConfidence = "high" | "medium" | "low";

/**
 * Typed output of an intent interpreter and input to deterministic routing.
 *
 * This contract contains interpreted routing facts only. It does not classify
 * raw user text, execute a hand-off, or authorise an external action.
 */
export interface RoutingIntent {
  /** Explicit specialist requested by the user or orchestrator. */
  requestedAgentId?: string;

  /** Ordered capabilities inferred as relevant to the task. */
  inferredCapabilities: AgentCapability[];

  /** Ordered high-level intents inferred as relevant to the task. */
  inferredTriggers: HandoffTrigger[];

  /** Proportional reasoning depth to preserve for downstream orchestration. */
  reasoningDepth: ReasoningDepth;

  /** How the interpreted routing facts were produced. */
  source: RoutingSource;

  /** Confidence in the interpreted routing facts. */
  confidence: RoutingConfidence;
}

/**
 * A machine-readable record of which agent should handle a request and why.
 */
export interface RoutingDecision {
  /** Stable id of the selected agent. */
  selectedAgentId: string;

  /** Human-readable explanation suitable for logs and later inspection. */
  reason: string;

  /** Confidence that the selected agent is appropriate for the request. */
  confidence: RoutingConfidence;

  /** Whether routing was explicit, inferred, or produced by a fallback. */
  source: RoutingSource;

  /** Reasoning depth carried forward without reinterpretation by the router. */
  reasoningDepth: ReasoningDepth;
}

/**
 * The maximum authority granted to an agent through a hand-off.
 *
 * No value in this contract independently authorises an external side effect.
 * Tool execution and other consequential actions require a separate control
 * path and user approval.
 */
export type HandoffAuthority =
  | "advise"
  | "draft"
  | "propose-action";

/**
 * Machine-readable BOA specification for an executive or specialist.
 *
 * This describes the intended behavioural boundary. It does not itself enforce
 * runtime behaviour, authorise tool use, or replace the system prompt.
 */
export interface BehaviouralContract {
  /** Bounded organisational identity of the agent. */
  role: string;

  /** Work the agent exists to perform. */
  mandate: string;

  /** Failure modes the role is specifically designed to prevent. */
  prevents: string[];

  /** Positive behaviours required whenever the role is active. */
  obligations: string[];

  /** Rules for evidence, uncertainty and claims. */
  epistemicDiscipline: string[];

  /** Maximum hand-off authorities this role may receive. */
  authority: HandoffAuthority[];

  /** Conditions requiring escalation or another specialist. */
  escalationConditions: string[];

  /** Human-readable description of the expected output. */
  outputContract: string;
}

/**
 * Structured context passed from one agent to another.
 */
export interface AgentHandoff {
  /** Stable id of the agent initiating the hand-off. */
  fromAgentId: string;

  /** Stable id of the receiving agent. */
  toAgentId: string;

  /** Concise statement of what the user is trying to achieve. */
  userIntent: string;

  /** Specific task assigned to the receiving agent. */
  task: string;

  /** Operational-state view available to the receiving agent. */
  contextScope: ContextScope;

  /** Constraints the receiving agent must preserve. */
  constraints: string[];

  /** Description of the output the receiving agent should return. */
  expectedOutput: string;

  /** Maximum authority granted by this hand-off. */
  authority: HandoffAuthority;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
