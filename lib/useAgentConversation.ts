"use client";

import { useCallback, useEffect, useState } from "react";
import type { AgentDefinition, ChatMessage } from "./agents/types";

/**
 * Extracted from the old CommandConsole.tsx (Phase 1 UI) unchanged in
 * behavior — same request shape to /api/chat, same error copy. Pulled
 * into its own hook so the new layout can split "who's talking and what
 * was said" (ConversationDock) from "is JARVIS currently thinking"
 * (OrbCenterpiece) without duplicating state or prop-drilling one
 * component's internals into another.
 *
 * Resets its message history when the active agent changes (matches the
 * old behavior, where CommandConsole was remounted via a `key={agent.id}`
 * on the parent) — a new agent starts a fresh conversation, keyed by the
 * caller passing a fresh `agent`.
 */
export function useAgentConversation(agent: AgentDefinition) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // New agent selected — start clean, same as the old key={agent.id} remount.
  useEffect(() => {
    setMessages([]);
    setError(null);
    setLoading(false);
  }, [agent.id]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const nextMessages: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
      setMessages(nextMessages);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agentId: agent.id, messages: nextMessages }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed.");
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Intelligence link interrupted. Try again.");
      } finally {
        setLoading(false);
      }
    },
    [agent.id, loading, messages]
  );

  // Real, explicit reset — a Clear affordance the console can offer
  // without waiting for an agent switch to clear history.
  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, send, reset };
}
