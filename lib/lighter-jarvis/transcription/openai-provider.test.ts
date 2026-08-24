import { describe, expect, it, vi } from "vitest";
import { OpenAITranscriptionProvider, TranscriptionProviderError } from "./openai-provider";

const artifact = {
  blob: new Blob(["audio"], { type: "audio/webm" }),
  mimeType: "audio/webm",
  capturedAt: "2026-08-24T00:00:00.000Z",
  durationMs: 1000,
  source: "microphone" as const,
};

describe("OpenAITranscriptionProvider", () => {
  it("posts the completed file using the settled model", async () => {
    const request = vi.fn(async () => Response.json({ text: "Hello Jarvis", language: "en", duration: 1.2 }));
    const result = await new OpenAITranscriptionProvider("secret", request as typeof fetch).transcribe(artifact);
    expect(result).toEqual({ text: "Hello Jarvis", provider: "openai", model: "gpt-transcribe", language: "en", durationMs: 1200 });
    expect(request).toHaveBeenCalledWith("https://api.openai.com/v1/audio/transcriptions", expect.objectContaining({ method: "POST" }));
    const form = request.mock.calls[0][1]?.body as FormData;
    expect(form.get("model")).toBe("gpt-transcribe");
    expect(form.get("file")).toBeInstanceOf(Blob);
  });

  it("preserves a specific provider failure", async () => {
    const request = vi.fn(async () => Response.json({ error: { message: "Billing required" } }, { status: 429 }));
    await expect(new OpenAITranscriptionProvider("secret", request as typeof fetch).transcribe(artifact))
      .rejects.toEqual(expect.objectContaining<Partial<TranscriptionProviderError>>({ message: "Billing required", status: 429 }));
  });
});
