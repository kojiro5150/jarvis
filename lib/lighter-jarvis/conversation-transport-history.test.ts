import { describe, expect, it } from "vitest";
import { ConversationTransportHistory } from "./conversation-transport-history";

const ask = "What's on for tomorrow?";
const askReply = "May I read your Calendar for tomorrow?";
const calendarReply = "Based on your calendar for tomorrow, you have two commitments: 10:00 AM – 11:00 AM and 3:00 PM – 4:00 PM.";
const recall = "What times did you just see?";

function acceptedSequence(source: "typed" | "voice") {
  const history = new ConversationTransportHistory();
  const bodies: Array<{ source: string; messages: ReturnType<typeof history.messages> }> = [];
  for (const [user, assistant] of [[ask, askReply], ["Yes.", calendarReply]] as const) {
    bodies.push({ source, messages: history.acceptUser("jarvis", user) });
    history.acceptAssistant("jarvis", assistant);
  }
  bodies.push({ source, messages: history.acceptUser("jarvis", recall) });
  return bodies;
}

describe("ConversationTransportHistory", () => {
  it("commits an async assistant response before an immediately queued voice turn without a React commit", async () => {
    const history = new ConversationTransportHistory();
    history.acceptUser("jarvis", ask);
    await Promise.resolve(); // response latency; deliberately no rendering/state step
    history.acceptAssistant("jarvis", askReply);
    const confirmationRequest = history.acceptUser("jarvis", "Yes.");
    history.acceptAssistant("jarvis", calendarReply);
    const recallRequest = history.acceptUser("jarvis", recall);

    expect(confirmationRequest.at(-2)).toEqual({ role: "assistant", content: askReply });
    expect(recallRequest).toEqual([
      { role: "user", content: ask },
      { role: "assistant", content: askReply },
      { role: "user", content: "Yes." },
      { role: "assistant", content: calendarReply },
      { role: "user", content: recall },
    ]);
    expect(recallRequest.at(-2)).toEqual({ role: "assistant", content: calendarReply });
  });

  it("builds identical request histories for typed and serialized voice acceptance", () => {
    expect(acceptedSequence("typed").map(body => body.messages))
      .toEqual(acceptedSequence("voice").map(body => body.messages));
  });
});
