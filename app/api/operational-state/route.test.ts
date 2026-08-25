import { describe, expect, it } from "vitest";
import { GET as getOperationalPicture } from "../operational-picture/route";
import { GET as getOperationalState } from "./route";

describe("retired aggregate operational-state APIs", () => {
  it.each([
    ["operational state", getOperationalState, "operational_state_retired"],
    ["operational picture", getOperationalPicture, "operational_picture_retired"],
  ])("fails closed for %s", async (_name, handler, error) => {
    const response = await handler();

    expect(response.status).toBe(410);
    await expect(response.json()).resolves.toMatchObject({ error });
  });
});
