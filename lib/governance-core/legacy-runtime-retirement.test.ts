import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

function sourceFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(path));
    else if (/\.(?:ts|tsx|js|jsx)$/.test(entry.name) && !/\.(?:test|spec)\.[^.]+$/.test(entry.name)) out.push(path);
  }
  return out;
}

describe("legacy chat runtime retirement", () => {
  it("removes the parallel /api/chat route and its alternate client chain", () => {
    expect(existsSync("app/api/chat/route.ts")).toBe(false);
    expect(existsSync("components/dashboard/DashboardShell.tsx")).toBe(false);
    expect(existsSync("lib/useAgentConversation.ts")).toBe(false);
    expect(existsSync("lib/console-presentation-selection.ts")).toBe(false);
  });

  it("makes the governed console the sole root conversational surface", () => {
    const root = readFileSync("app/page.tsx", "utf8");
    expect(root).toContain("UnifiedOpsConsole");
    expect(root).not.toContain("DashboardShell");
    expect(root).not.toContain("CONSOLE_PRESENTATION_MODE");
    expect(root).not.toContain("selectConsolePresentationMode");
  });

  it("leaves no live source reference to /api/chat", () => {
    const offenders = ["app", "components", "lib"]
      .flatMap(sourceFiles)
      .filter(path => /["'`]\/api\/chat["'`]/.test(readFileSync(path, "utf8")));

    expect(offenders).toEqual([]);
  });
});
