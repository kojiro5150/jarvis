import { describe, expect, it, vi } from "vitest";
import { createLighterChatHandler } from "@/lib/lighter-jarvis/chat-handler";
import { sanitizeModelHistory } from "@/lib/lighter-jarvis/model-history-boundary";

const request = (body: unknown) => new Request("http://localhost/api/lighter/chat", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify(body),
});

describe("MODEL-CONTENT-01 current non-exposure boundary", () => {
  it("removes deterministic private Gmail body presentation from later ordinary model history", () => {
    const privateBody = "Private body that must not become ambient model context.";
    const history = [
      { role: "user" as const, content: "Read the first one." },
      { role: "assistant" as const, content: "Please explicitly confirm that I may read that exact Gmail message." },
      { role: "user" as const, content: "Yes." },
      { role: "assistant" as const, content: `From: Georgia <georgia@example.com>\nSubject: Project update\nPlain text body: ${privateBody}` },
      { role: "user" as const, content: "What do you think?" },
    ];

    const sanitized = sanitizeModelHistory(history);
    expect(sanitized[3]).toEqual({ role: "assistant", content: "[Governed private result omitted from ordinary model context.]" });
    expect(JSON.stringify(sanitized)).not.toContain(privateBody);
    expect(sanitized.at(-1)).toEqual(history.at(-1));
  });

  it("does not treat deterministic user release as permission for ordinary model exposure", async () => {
    const privateBody = "PRIVATE-CONTENT-MUST-NOT-REACH-MODEL";
    const model = vi.fn(async (_systemPrompt, messages) => {
      expect(JSON.stringify(messages)).not.toContain(privateBody);
      expect(messages).toContainEqual({ role: "assistant", content: "[Governed private result omitted from ordinary model context.]" });
      expect(messages.at(-1)).toEqual({ role: "user", content: "What do you think?" });
      return "I can answer generally, but I do not have that private content in ordinary model context.";
    });

    const handler = createLighterChatHandler(model);
    const response = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "Read the first one." },
        { role: "assistant", content: "Please explicitly confirm that I may read that exact Gmail message." },
        { role: "user", content: "Yes." },
        { role: "assistant", content: `From: Georgia <georgia@example.com>\nSubject: Project update\nPlain text body: ${privateBody}` },
        { role: "user", content: "What do you think?" },
      ],
    }));

    expect(response.status).toBe(200);
    expect(model).toHaveBeenCalledOnce();
    const json = await response.json();
    expect(json.reply).toContain("do not have that private content");
    expect(JSON.stringify(json)).not.toContain(privateBody);
  });

  it("prevents a completed governed weather exchange from being reconstructed by a later ordinary model turn", async () => {
    const fabricatedWind = "Winds north to northwesterly 25 to 35 km/h increasing to 35 to 55 km/h in the morning then turning westerly 25 to 35 km/h in the late afternoon. Damaging winds possible on the surf coast, easing later in the day.";
    const model = vi.fn(async (_systemPrompt, messages) => {
      const visible = JSON.stringify(messages);
      const leaked = /windy tomorrow|verified wind detail|Please specify the location for the weather forecast/i.test(visible);
      if (leaked) return `Yes, tomorrow will be windy in Geelong. ${fabricatedWind}`;

      expect(messages).toEqual([
        { role: "user", content: "[Prior governed weather request omitted from ordinary model context.]" },
        { role: "assistant", content: "[Prior governed weather result omitted from ordinary model context.]" },
        { role: "user", content: "[Prior governed weather request omitted from ordinary model context.]" },
        { role: "assistant", content: "[Prior governed weather result omitted from ordinary model context.]" },
        { role: "user", content: "Geelong" },
      ]);
      expect(visible).not.toContain("is it windy tomorrow?");
      expect(visible).not.toContain("verified wind detail");
      return "What would you like to know about Geelong?";
    });

    const handler = createLighterChatHandler(model);
    const response = await handler(request({
      specialistId: "jarvis",
      messages: [
        { role: "user", content: "is it windy tomorrow?" },
        { role: "assistant", content: "Please specify the location for the weather forecast." },
        { role: "user", content: "geelong" },
        { role: "assistant", content: "I have a deterministic Bureau of Meteorology forecast path for Geelong tomorrow, but verified wind detail is not yet available on that governed path." },
        { role: "user", content: "Geelong" },
      ],
    }));

    expect(response.status).toBe(200);
    expect(model).toHaveBeenCalledOnce();
    const json = await response.json();
    expect(json.reply).toBe("What would you like to know about Geelong?");
    expect(json.reply).not.toContain("25 to 35 km/h");
    expect(JSON.stringify(json)).not.toContain(fabricatedWind);
  });

  it("does not convert withheld model-visible evidence into evidence of absence", () => {
    const sanitized = sanitizeModelHistory([
      { role: "assistant" as const, content: "Subject: A private subject" },
      { role: "user" as const, content: "Continue." },
    ]);
    expect(sanitized[0]).toEqual({ role: "assistant", content: "[Governed private result omitted from ordinary model context.]" });
    expect(sanitized[0].content).not.toMatch(/none|absent|empty|no subject/i);
  });
});