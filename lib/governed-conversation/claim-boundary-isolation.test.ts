import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
const production = ["app/api/chat/route.ts", "lib/context-builder.ts", "lib/useAgentConversation.ts", "lib/agents/chat-execution.ts"];
const boundaryNames = ["claim-boundary-types", "claim-boundary-ruleset", "claim-boundary-engine", "claim-boundary-publications", "claim-boundary-fixtures"];
const modules = boundaryNames.map(x => `lib/governed-conversation/${x}.ts`);
const forbiddenReverse = ["app/api/chat/", "context-builder", "useAgentConversation", "lib/agents/", "components/", "eos/"];
const startHashes: Readonly<Record<string, string>> = { "app/api/chat/route.ts": "6972a6821c962aeca51a1c37a90a3514e8533d221fa4c9328f3c244715c656c7", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7" };
const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
function files(root: string): string[] { return readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? files(path) : [path]; }); }
describe("pure-Node isolation proof", () => {
  it("has zero forward production imports", () => { for (const path of production) for (const name of boundaryNames) expect(readFileSync(path, "utf8"), `${path} imports ${name}`).not.toContain(name); });
  it("has zero reverse production imports", () => { for (const path of modules) for (const forbidden of forbiddenReverse) expect(readFileSync(path, "utf8"), `${path} imports ${forbidden}`).not.toContain(forbidden); });
  it("keeps protected live files byte-identical to pre-sprint hashes", () => { for (const path of production) expect(hash(path), path).toBe(startHashes[path]); });
  it("finds no hidden production import elsewhere", () => { const candidates = [...files("app"), ...files("lib")].filter(x => /\.(ts|tsx)$/.test(x) && !x.includes("claim-boundary") && !x.includes("conflict-boundary") && !x.includes("claims-conflicts-correction") && !x.includes("governed-publication-test-fixtures") && !x.includes("projection-composer.ts") && !x.includes("conflict-boundary-publications.ts") && !x.includes("claim-integrity.test.ts")); for (const path of candidates) for (const name of boundaryNames) expect(readFileSync(path, "utf8"), path).not.toContain(name); });
});
