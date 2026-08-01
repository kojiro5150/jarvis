import { readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repositoryRoot = resolve(__dirname, "../..");

const forwardPattern =
  /lineage-types|projection-composer|exchange-lifecycle|retry-policy|lineage-repository|in-memory-lineage-repository|lineage-orchestrator/;
const reversePattern =
  /app\/api\/chat|context-builder|useAgentConversation|lib\/agents|executive-operating-system/;

const forwardTargets = [
  "app/api/chat",
  "lib/context-builder.ts",
  "lib/useAgentConversation.ts",
  "lib/agents",
  "components",
  "lib/executive-operating-system",
] as const;

const reverseTargets = [
  "lib/governed-conversation/lineage-types.ts",
  "lib/governed-conversation/projection-composer.ts",
  "lib/governed-conversation/exchange-lifecycle.ts",
  "lib/governed-conversation/retry-policy.ts",
  "lib/governed-conversation/lineage-repository.ts",
  "lib/governed-conversation/in-memory-lineage-repository.ts",
  "lib/governed-conversation/lineage-orchestrator.ts",
] as const;

function filesWithin(path: string): readonly string[] {
  const absolutePath = resolve(repositoryRoot, path);
  if (!statSync(absolutePath).isDirectory()) return [absolutePath];

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const child = resolve(absolutePath, entry.name);
    if (entry.isDirectory()) return filesWithin(relative(repositoryRoot, child));
    return entry.isFile() ? [child] : [];
  });
}

function matchingLines(content: string, pattern: RegExp): readonly string[] {
  return content
    .split(/\r?\n/u)
    .filter((line) => pattern.test(line));
}

function findViolations(paths: readonly string[], pattern: RegExp): readonly string[] {
  return paths.flatMap((path) =>
    filesWithin(path).flatMap((file) =>
      matchingLines(readFileSync(file, "utf8"), pattern).map(
        (line) => `${relative(repositoryRoot, file)}: ${line.trim()}`,
      ),
    ),
  );
}

describe("Sprint 3.83 isolation", () => {
  it("has no forward production imports", () => {
    expect(findViolations(forwardTargets, forwardPattern)).toEqual([]);
  });

  it("has no reverse protected-runtime imports", () => {
    expect(findViolations(reverseTargets, reversePattern)).toEqual([]);
  });

  it("detects a prohibited import in supplied content", () => {
    const prohibitedImport =
      'import { constructConversationalThread } from "@/lib/governed-conversation/lineage-types";';

    expect(matchingLines(prohibitedImport, forwardPattern)).toEqual([
      prohibitedImport,
    ]);
  });
});
