import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const evaluationFiles = ["lib/governed-conversation/lineage-projection-evaluation.ts", "lib/governed-conversation/lineage-projection-evaluation-fixtures.ts"];
function files(directory: string): string[] { return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)]); }
describe("Sprint 3.84 pure-Node isolation", () => {
  it("has no forward production imports", () => {
    const targets = ["lib/context-builder.ts", ...["lib/agents", "components", "lib/executive-operating-system"].flatMap((path) => files(join(root, path)).map((file) => relative(root, file)))];
    for (const target of targets) { const source = readFileSync(join(root, target), "utf8"); expect(source, target).not.toMatch(/lineage-projection-evaluation/); }
  });
  it("has no reverse production imports or shell traversal", () => {
    for (const target of evaluationFiles) { const source = readFileSync(join(root, target), "utf8"); expect(source, target).not.toMatch(/(?:app\/api\/chat|context-builder|useAgentConversation|lib\/agents|executive-operating-system)/); }
    expect(readFileSync(__filename, "utf8")).toContain('from "node:fs"');
  });
});
