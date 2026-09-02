// @vitest-environment jsdom

import { act, renderHook, waitFor, type RenderHookResult } from "@testing-library/react";
import { StrictMode, createElement } from "react";
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
  let sampleValue = 144;

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
      getByteTimeDomainData: (data: Uint8Array) => data.fill(sampleValue),
    }));
  }

  beforeEach(() => {
    stop.mockClear();
    close.mockClear();
    connect.mockClear();
    frames.clear();
    nextFrame = 1;
    sampleValue = 144;
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

  function amplitudeFrame(time: number, value: number) {
    sampleValue = value;
    const frame = [...frames.values()].at(-1);
    if (!frame) throw new Error("Expected an active microphone animation frame.");
    act(() => frame(time));
  }

  async function finishBySilence(result: RenderHookResult<VoiceSession, void>["result"]) {
    amplitudeFrame(100, 144);
    expect(result.current.amplitude).toBe(0.5);
    amplitudeFrame(200, 128);
    await waitFor(() => expect(result.current.state).toBe("standby"), { timeout: 2500 });
  }

  it("auto-submits after real speech followed by sustained silence", async () => {
    const { result } = renderHook(() => useVoiceSession());

    expect(result.current).toMatchObject({ state: "standby", amplitude: 0 });
    await start(result);
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });

    await finishBySilence(result);
    await waitFor(() => expect(result.current.transcript).toBe("Turn on the lights"));

    expect(result.current).toMatchObject({ state: "standby", amplitude: 0, error: null });
    expect(fetchMock).toHaveBeenCalledWith("/api/lighter/transcribe", expect.objectContaining({ method: "POST" }));
    expect(stop).toHaveBeenCalledOnce();
    expect(close).toHaveBeenCalledOnce();
    expect(cancelAnimationFrameMock).toHaveBeenCalledOnce();
  });

  it("does not submit silence before speech has begun", async () => {
    const { result } = renderHook(() => useVoiceSession());
    await start(result);

    amplitudeFrame(100, 128);
    await new Promise(resolve => setTimeout(resolve, 1200));

    expect(result.current.state).toBe("listening");
    expect(fetchMock).not.toHaveBeenCalled();

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state).toBe("standby"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("treats a second Voice press as cancel, not manual submit", async () => {
    const { result } = renderHook(() => useVoiceSession());
    await start(result);
    amplitudeFrame(100, 144);

    act(() => result.current.toggle());
    await waitFor(() => expect(result.current.state).toBe("standby"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.transcript).toBeNull();
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
    amplitudeFrame(100, 144);
    amplitudeFrame(200, 128);
    await waitFor(() => expect(result.current.state).toBe("error"), { timeout: 2500 });
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

  it("still delivers a transcript under StrictMode's dev-only double mount/unmount cycle", async () => {
    // Matches this project's real reactStrictMode: true config. React deliberately
    // mounts, unmounts, and remounts once in development; a mount-tracking ref
    // that only ever gets set false in cleanup, and never reset true on mount,
    // stays permanently false after that first simulated unmount, silently
    // dropping every guarded state update for the rest of the component's life.
    const { result } = renderHook(() => useVoiceSession(), {
      wrapper: ({ children }) => createElement(StrictMode, null, children),
    });

    await start(result);
    await finishBySilence(result);
    await waitFor(() => expect(result.current.transcript).toBe("Turn on the lights"));
    expect(result.current.state).toBe("standby");
  });
});
