import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const protectedHashes: Record<string, string> = {
  "app/api/chat/route.ts": "dee5c1528792f185a99abeee0f8a85e08b4f4ee5",
  "lib/context-builder.ts": "8d22c39fc473e9267f1157f0c55fa2a6c85d578d",
  "lib/useAgentConversation.ts": "ceec0b3690d33bfc456563f1c75083a2e61af80c",
  "lib/agents/chat-execution.ts": "74055b80bd26bc93d7e7d6bc957c1cbe0d6793c3",
};
function files(directory: string): string[] { return readdirSync(directory).flatMap(name => { const path = join(directory, name); return statSync(path).isDirectory() ? files(path) : [path]; }); }

describe("Sprint 3.95 correction isolation", () => {
  it("keeps all protected production blobs byte-identical", () => {
    for (const [path, expected] of Object.entries(protectedHashes)) { const body = readFileSync(join(root, path)); expect(createHash("sha1").update(`blob ${body.length}\0`).update(body).digest("hex"), path).toBe(expected); }
  });
  it("uses pure Node to prove no production or EOS import reaches the correction", () => {
    const production = Object.keys(protectedHashes).map(path => readFileSync(join(root, path), "utf8"));
    expect(production.every(source => !source.includes("claims-conflicts-correction") && !source.includes("conflict-boundary"))).toBe(true);
    const correctionSources = ["lib/governed-conversation/conflict-boundary-engine.ts", "lib/governed-conversation/conflict-boundary-types.ts", "lib/governed-conversation/conflict-boundary-publications.ts", "lib/governed-conversation/projection-composer.ts"].map(path => readFileSync(join(root, path), "utf8"));
    expect(correctionSources.every(source => !source.includes("executive-operating-system") && !source.includes("structural-conflict"))).toBe(true);
    const importedBy = files(join(root, "app")).concat(files(join(root, "components"))).filter(path => /\.(ts|tsx)$/.test(path)).filter(path => readFileSync(path, "utf8").includes("claims-conflicts-correction")).map(path => relative(root, path));
    expect(importedBy).toEqual([]);
  });
});
