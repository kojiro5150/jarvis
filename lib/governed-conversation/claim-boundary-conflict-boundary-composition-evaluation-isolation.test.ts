import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../..");
const evaluationNames = ["claim-boundary-conflict-boundary-composition-evaluation", "claim-boundary-conflict-boundary-composition-evaluation-fixtures"];
const protectedHashes: Record<string, string> = {
  "app/api/chat/route.ts": "503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88",
  "lib/governed-conversation/claim-boundary-types.ts": "cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a", "lib/governed-conversation/claim-boundary-ruleset.ts": "afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83", "lib/governed-conversation/claim-boundary-engine.ts": "9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a", "lib/governed-conversation/claim-boundary-publications.ts": "ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95",
  "lib/governed-conversation/conflict-boundary-types.ts": "4d9bfa49fa1469c1d3150fe7fc9c721e64f9d80d05cca983533e2d9f0e53b4c4", "lib/governed-conversation/conflict-boundary-ruleset.ts": "bc89fb06e3c867fc14538cbd0690bef9ac65b88751573883b81ed934809ce91e", "lib/governed-conversation/conflict-boundary-engine.ts": "b1740dd5d2e978314cecea02fa1f7f44ab19f2a2e164c0d5d8df8037d885de74", "lib/governed-conversation/conflict-boundary-publications.ts": "9a370046f0b4c3b5c1caae74cdccfc12b6eb006a08db2287d573b5c21690e100",
  "lib/governed-conversation/projection-composer.ts": "b3fd03097cf8c4ff88fe3a07679566a72cd1e8aaa8bf0bf2cb4ea9948064dc76", "lib/governed-conversation/evidence-status.ts": "c83ada16f09a7f5e04b4c82d937c05115ef432c9e50a860ad0b30250b3a3039e", "lib/governed-conversation/model-invocation.ts": "beebd3cfb14c220c2249879661e225d3b2330cb766515c6bcac5338d2f814f5b",
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
