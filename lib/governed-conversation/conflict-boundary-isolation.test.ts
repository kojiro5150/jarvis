import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const production = ["app/api/chat/route.ts", "lib/context-builder.ts", "lib/useAgentConversation.ts", "lib/agents/chat-execution.ts"];
const boundaryNames = ["conflict-boundary-types", "conflict-boundary-ruleset", "conflict-boundary-engine", "conflict-boundary-publications", "conflict-boundary-fixtures"];
const runtimeModules = boundaryNames.map(x => `lib/governed-conversation/${x}.ts`);
const forbiddenReverse = ["app/api/chat/", "context-builder", "useAgentConversation", "lib/agents/", "components/", "executive-operating-system", "structural_conflict", "ExecutiveConflict", "EOS conflict"];
const claimsCore = (name: string) => `lib/governed-conversation/claim-${"boundary"}-${name}.ts`;
const startHashes: Readonly<Record<string, string>> = {
  "app/api/chat/route.ts": "6972a6821c962aeca51a1c37a90a3514e8533d221fa4c9328f3c244715c656c7", "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d", "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97", "lib/agents/chat-execution.ts": "a8fc170c4273b0dc9e90ec1d85dfaf98c2b4aeddbae3e38380fbe4aad3533dc7", [claimsCore("types")]: "cd5446f7f6bedb567be4b1bc7195c96f94b6b23bec82864102a090db49d6436a", [claimsCore("ruleset")]: "afe7fce7814b2d02da8e6ebecfbff2c721abf418bdfd426cf689340d898a8e83", [claimsCore("engine")]: "9ab35f47190e803468003a9accd34e0cc613e9438c8077a882d0b108d22f827a", [claimsCore("publications")]: "ccd7caa39316eb2fce1c7c8c8eda3741d0182eb12a123de9f7860e8225aa7c95", "lib/executive-operating-system/situational-awareness/assembly/engine.ts": "b5407703ee42b8fe348341709d1db7e56d11b24128feb6f9619ea1164b6fcc37", "lib/executive-operating-system/situational-awareness/assembly/types.ts": "61495a5f45672ac1290e38a354416f5e1942be6181637b119e9b10fb46f9c948",
};
const hash = (path: string) => createHash("sha256").update(readFileSync(path)).digest("hex");
function files(root: string): string[] { return readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? files(path) : [path]; }); }

describe("Sprint 3.92 pure-Node isolation and Option C proof", () => {
  it("has zero forward production imports", () => { for (const path of production) for (const name of boundaryNames) expect(readFileSync(path, "utf8"), `${path} imports ${name}`).not.toContain(name); });
  it("has zero reverse production or EOS semantic imports/references", () => { for (const path of runtimeModules) for (const forbidden of forbiddenReverse) expect(readFileSync(path, "utf8"), `${path} references ${forbidden}`).not.toContain(forbidden); });
  it("keeps production, composer, claims core, and inspected EOS files byte-identical", () => { for (const [path, expected] of Object.entries(startHashes)) expect(hash(path), path).toBe(expected); });
  it("finds no hidden production import", () => { const candidates = [...files("app"), ...files("lib")].filter(x => /\.(ts|tsx)$/.test(x) && !x.includes("conflict-boundary") && !x.includes("isolation.test") && !x.includes("claims-conflicts-correction") && !x.includes("governed-publication-test-fixtures") && !x.includes("projection-composer.ts") && !x.includes("full-assembly-enrichment-composition-recheck.ts") && !x.includes("integrity-coupling-full-assembly-regression") && !x.includes("claim-integrity.test.ts")); for (const path of candidates) for (const name of boundaryNames) expect(readFileSync(path, "utf8"), path).not.toContain(name); });
});
