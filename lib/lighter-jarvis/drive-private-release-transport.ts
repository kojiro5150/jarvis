import type { ChatMessage } from "@/lib/agents/types";
import { OMITTED_DRIVE_PRIVATE_RELEASE } from "./drive-private-release-contract";

/** Creates request-only history. The visible conversation array is never mutated. */
export function projectDrivePrivateReleasesForTransport(
  messages: readonly ChatMessage[],
  hasEligibleReference: boolean,
): ChatMessage[] {
  return messages.map((message) => ({
    role: message.role,
    content: hasEligibleReference
      && message.role === "assistant"
      && message.content.length >= 8_000
      && message.content.startsWith("Drive document:\n")
      ? OMITTED_DRIVE_PRIVATE_RELEASE
      : message.content,
  }));
}
