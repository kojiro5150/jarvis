import type {
  AudioCaptureArtifact,
  TranscriptionProvider,
  TranscriptionResult,
} from "./types";

const ENDPOINT = "https://api.openai.com/v1/audio/transcriptions";
const MODEL = "gpt-transcribe";

export class TranscriptionProviderError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "TranscriptionProviderError";
  }
}

export class OpenAITranscriptionProvider implements TranscriptionProvider {
  constructor(
    private readonly apiKey: string,
    private readonly request: typeof fetch = fetch,
  ) {}

  async transcribe(audio: AudioCaptureArtifact): Promise<TranscriptionResult> {
    if (!this.apiKey) throw new TranscriptionProviderError("OpenAI API credential is missing.");
    const form = new FormData();
    form.append("model", MODEL);
    form.append("file", audio.blob, `recording.${extensionFor(audio.mimeType)}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    let response: Response;
    try {
      response = await this.request(ENDPOINT, {
        method: "POST",
        headers: { authorization: `Bearer ${this.apiKey}` },
        body: form,
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new TranscriptionProviderError("OpenAI transcription request timed out.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    const data = await response.json().catch(() => null) as {
      text?: unknown;
      language?: unknown;
      duration?: unknown;
      error?: { message?: unknown };
    } | null;
    if (!response.ok) {
      const detail = typeof data?.error?.message === "string"
        ? data.error.message
        : `OpenAI transcription failed (${response.status}).`;
      throw new TranscriptionProviderError(detail, response.status);
    }
    if (typeof data?.text !== "string" || !data.text.trim()) {
      throw new TranscriptionProviderError("OpenAI returned an empty transcription.");
    }
    return {
      text: data.text.trim(),
      provider: "openai",
      model: MODEL,
      ...(typeof data.language === "string" ? { language: data.language } : {}),
      ...(typeof data.duration === "number" ? { durationMs: data.duration * 1000 } : {}),
    };
  }
}

function extensionFor(mimeType: string): string {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("mpeg")) return "mp3";
  return "webm";
}
