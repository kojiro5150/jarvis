// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useVoiceSession } from "./useVoiceSession";

type FrameCallback = (time: number) => void;

describe("useVoiceSession", () => {
  const stop = vi.fn();
  const close = vi.fn(() => Promise.resolve());
  const connect = vi.fn();
  const frames = new Map<number, FrameCallback>();
  let nextFrame = 1;
  let getUserMedia: ReturnType<typeof vi.fn>;
  let cancelAnimationFrameMock: ReturnType<typeof vi.fn>;

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

  async function start(result: ReturnType<typeof renderHook>["result"]) {
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
    expect(result.current).toMatchObject({ state: "standby", amplitude: 0 });
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
