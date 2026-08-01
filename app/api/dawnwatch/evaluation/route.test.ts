import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/dawnwatch/evaluation", () => {
  it("returns every registered synthetic evaluation without changing production authority", async () => {
    const response = await GET(new Request("http://localhost/api/dawnwatch/evaluation"));
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.evaluationVersion).toBe("sprint-3.71-v1");
    expect(body.productionAuthorityChanged).toBe(false);
    expect(body.evaluations).toHaveLength(8);
  });

  it.each(["recipient-evidence-available", "recipient-evidence-unknown", "recipient-evidence-not-fetched", "recipient-evidence-not-authorised"])(
    "selects %s independently", async scenario => {
      const response = await GET(new Request(`http://localhost/api/dawnwatch/evaluation?scenario=${scenario}`));
      const body = await response.json();
      expect(response.status).toBe(200);
      expect(body.evaluations).toHaveLength(1);
      expect(body.evaluations[0].scenario).toBe(scenario);
    },
  );

  it("rejects an unknown scenario explicitly", async () => {
    const response = await GET(new Request("http://localhost/api/dawnwatch/evaluation?scenario=live"));
    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: "unknown scenario" });
  });
});
