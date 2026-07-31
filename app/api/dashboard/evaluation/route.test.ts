import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/dashboard/evaluation", () => {
  it("returns side-by-side results for every fixture", async () => {
    const response = await GET(new Request("http://localhost/api/dashboard/evaluation"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.productionAuthorityChanged).toBe(false);
    expect(body.evaluations).toHaveLength(9);
    expect(body.evaluations.every((item: { legacy?: unknown; governed?: unknown }) => item.legacy && item.governed)).toBe(true);
  });

  it("selects one scenario and rejects unknown fixtures", async () => {
    const selected = await GET(new Request("http://localhost/api/dashboard/evaluation?scenario=empty"));
    expect((await selected.json()).evaluations).toHaveLength(1);
    const invalid = await GET(new Request("http://localhost/api/dashboard/evaluation?scenario=live"));
    expect(invalid.status).toBe(400);
  });
});
