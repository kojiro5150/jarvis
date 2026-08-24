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
    const request = vi.fn(async (..._args: Parameters<typeof fetch>) =>
      Response.json({ text: "Hello Jarvis", language: "en", duration: 1.2 }));
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

  it("fails closed with a clear message when the request hangs past the timeout", async () => {
    vi.useFakeTimers();
    try {
      const request = vi.fn((..._args: Parameters<typeof fetch>) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = _args[1]?.signal;
          signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")));
        }));
      const pending = new OpenAITranscriptionProvider("secret", request as typeof fetch).transcribe(artifact);
      const assertion = expect(pending).rejects.toEqual(
        expect.objectContaining<Partial<TranscriptionProviderError>>({
          message: "OpenAI transcription request timed out.",
        }),
      );
      await vi.advanceTimersByTimeAsync(15_000);
      await assertion;
    } finally {
      vi.useRealTimers();
    }
  });
});
