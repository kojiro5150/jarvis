import { describe, expect, it, vi } from "vitest";
import {
  executePublicGrounding,
  PUBLIC_GROUNDING_UNAVAILABLE_REPLY,
} from "./public-grounded-know";
import { materializePublicLookupRequest } from "./public-lookup-request";

describe("public grounded Know execution", () => {
  it("fails closed for a forced current-state query when no provider exists", async () => {
    const request = materializePublicLookupRequest("Who is the current CEO of OpenAI?");
    expect(request).toMatchObject({ kind: "web_search" });

    await expect(executePublicGrounding(request!)).resolves.toEqual({
      status: "unavailable",
      request,
      reason: "provider_unavailable",
    });
    expect(PUBLIC_GROUNDING_UNAVAILABLE_REPLY).toMatch(/won't substitute an unsupported answer from model memory/i);
  });

  it("fails closed when the weather provider throws", async () => {
    const request = materializePublicLookupRequest("What's the weather in Geelong tomorrow?");
    const fetchMock = vi.fn(async () => {
      throw new Error("network down");
    });

    const result = await executePublicGrounding(request!, {
      weather: {
        fetch: fetchMock as typeof fetch,
        clock: () => new Date("2026-08-30T06:00:00.000Z"),
      },
    });

    expect(result).toEqual({ status: "unavailable", request, reason: "geocoding_network_error" });
  });
});
