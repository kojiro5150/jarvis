// @vitest-environment jsdom

import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceSession, type VoiceSession } from "./useVoiceSession";

type FrameCallback = (time: number) => void;

describe("useVoiceSession", () => {
  const stop = vi.fn();
  const close = vi.fn(() => Promise.resolve());
  const connect = vi.fn();
  const frames = new Map<number, FrameCallback>();
  let nextFrame = 1;
  let getUserMedia: ReturnType<typeof vi.fn>;
  let cancelAnimationFrameMock: ReturnType<typeof vi.fn>;
  let fetchMock: ReturnType<typeof vi.fn>;

  class MediaRecorderMock {
    state: RecordingState = "inactive";
    mimeType = "audio/webm";
    ondataavailable: ((event: BlobEvent) => void) | null = null;
    onstop: (() => void) | null = null;
    onerror: (() => void) | null = null;
    constructor(readonly stream: MediaStream) {}
    start() { this.state = "recording"; }
    stop() {
      this.state = "inactive";
      this.ondataavailable?.({ data: new Blob(["voice"], { type: this.mimeType }) } as BlobEvent);
      this.onstop?.();
    }
  }

  const stream = {
    getTracks: () => [{ stop }],
  } as unknown as MediaStream;

  class AudioContextMock {
    close = close;
    createMediaStreamSource = vi.fn(() => ({ connect }));
    createAnalyser = vi.fn(() => ({
      fftSize: 0,
      smoothingTimeConstant: 0,
      frequencyBinCount: 4,
      getByteTimeDomainData: (data: Uint8Array) => data.fill(144),
    }));
  }

  beforeEach(() => {
    stop.mockClear();
    close.mockClear();
    connect.mockClear();
    frames.clear();
    nextFrame = 1;
    getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia },
    });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: AudioContextMock,
    });
    vi.stubGlobal("MediaRecorder", MediaRecorderMock);
    fetchMock = vi.fn().mockResolvedValue(Response.json({ text: "Turn on the lights", provider: "mock", model: "mock" }));
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameCallback) => {
        const id = nextFrame++;
        frames.set(id, callback);
        return id;
      }),
    );
    cancelAnimationFrameMock = vi.fn((id: number) => frames.delete(id));
    vi.stubGlobal("cancelAnimationFrame", cancelAnimationFrameMock);
  });

  afterEach(() => vi.unstubAllGlobals());

  async function start(result: RenderHookResult<VoiceSession, void>["result"]) {
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state).toBe("listening"));
  }

  it("starts real capture, forwards measured amplitude, and fully stops", async () => {
    const { result } = renderHook(() => useVoiceSession());

    expect(result.current).toMatchObject({ state: "standby", amplitude: 0 });
    await start(result);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    const frame = [...frames.values()][0];
    act(() => frame(100));
    expect(result.current.amplitude).toBe(0.5);

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.transcript).toBe("Turn on the lights"));
    expect(result.current).toMatchObject({ state: "standby", amplitude: 0, error: null });
    expect(fetchMock).toHaveBeenCalledWith("/api/lighter/transcribe", expect.objectContaining({ method: "POST" }));
    expect(stop).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(cancelAnimationFrameMock).toHaveBeenCalledOnce();
  });

  it("reports microphone permission or device failure as error", async () => {
    getUserMedia.mockRejectedValueOnce(new Error("Permission denied"));
    const { result } = renderHook(() => useVoiceSession());

    act(() => result.current.toggle());

    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.amplitude).toBe(0);
    expect(result.current.error).toBe("Permission denied");
  });

  it("surfaces transcription failures without fallback", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ error: "Provider unavailable" }, { status: 502 }));
    const { result } = renderHook(() => useVoiceSession());
    await start(result);
    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state).toBe("error"));
    expect(result.current.error).toBe("Provider unavailable");
    expect(result.current.transcript).toBeNull();
  });

  it("releases every active capture resource on unmount", async () => {
    const { result, unmount } = renderHook(() => useVoiceSession());
    await start(result);

    unmount();

    expect(stop).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(cancelAnimationFrameMock).toHaveBeenCalledOnce();
  });
});
