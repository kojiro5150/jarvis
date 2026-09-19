import type { ChatMessage } from "@/lib/agents/types";
import { OMITTED_DURABLE_CONTINUITY_RELEASE } from "./durable-continuity-release-contract";

const DURABLE_CONTINUITY_RELEASE_PREFIX =
  /^(?:Relevant remembered context:|Stored JARVIS product gaps \(\d+\):)/;

/** Creates request-only history. The visible conversation array is never mutated. */
export function projectDurableContinuityReleasesForTransport(
  messages: readonly ChatMessage[],
  hasEligibleReference: boolean,
): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: hasEligibleReference
      && message.role === "assistant"
      && message.content.length >= 8_000
      && DURABLE_CONTINUITY_RELEASE_PREFIX.test(message.content)
      ? OMITTED_DURABLE_CONTINUITY_RELEASE
      : message.content,
  }));
}
