import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../..");
const evaluationNames = ["claim-boundary-conflict-boundary-composition-evaluation", "claim-boundary-conflict-boundary-composition-evaluation-fixtures"];
const protectedHashes: Record<string, string> = {
  "app/api/chat/route.ts": "6972a6821c962aeca51a1c37a90a3514e8533d221fa4c9328f3c244715c656c7", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7",
  "lib/governed-conversation/claim-boundary-types.ts": "cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a", "lib/governed-conversation/claim-boundary-ruleset.ts": "afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83", "lib/governed-conversation/claim-boundary-engine.ts": "9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a", "lib/governed-conversation/claim-boundary-publications.ts": "ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95",
"lib/governed-conversation/evidence-status.ts": "c83ada16f09a7f5e04b4c82d937c05115ef432c9e50a860ad0b30250b3a3039e", "lib/governed-conversation/model-invocation.ts": "beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b",
};
const walk = (dir: string): string[] => readdirSync(dir).flatMap(name => { const path = join(dir, name); return name === "node_modules" || name === ".git" || name === ".next" ? [] : statSync(path).isDirectory() ? walk(path) : [path]; });

describe("Sprint 3.93 pure-Node isolation", () => {
  it("has no production forward import and no prohibited reverse import", () => {
    const files = walk(root).filter(path => /\.(ts|tsx|js|jsx)$/.test(path));
    const forward = files.filter(path => !path.includes("claim-boundary-conflict-boundary-composition-evaluation") && evaluationNames.some(name => readFileSync(path, "utf8").includes(name)));
    expect(forward).toEqual([]);
    const evaluation = files.filter(path => path.includes("claim-boundary-conflict-boundary-composition-evaluation") && !path.endsWith("-isolation.test.ts")).map(path => readFileSync(path, "utf8")).join("\n");
    for (const prohibited of ["app/api/chat", "context-builder", "useAgentConversation", "agents/chat-execution", "components/"]) expect(evaluation).not.toContain(prohibited);
  });
  it("keeps protected and evaluated core blobs byte-identical", () => {
    for (const [file, expected] of Object.entries(protectedHashes)) expect(createHash("sha256").update(readFileSync(join(root, file))).digest("hex"), relative(root, join(root, file))).toBe(expected);
  });
});
