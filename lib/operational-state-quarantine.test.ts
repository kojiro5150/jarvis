import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SOURCE_ROOTS = ["app", "components", "lib"] as const;

function productionSources(directory: string): string[] {
  return readdirSync(join(ROOT, directory), { withFileTypes: true })
    .flatMap(entry => {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) return productionSources(path);
      if (!/\.(?:ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) return [];
      if (/\.(?:test|spec)\.[^.]+$/.test(entry.name)) return [];
      return [path];
    });
}

const sources = SOURCE_ROOTS.flatMap(productionSources).sort();

function filesMatching(pattern: RegExp): string[] {
  return sources.filter(path => pattern.test(readFileSync(join(ROOT, path), "utf8")));
}

describe("legacy OperationalState production quarantine", () => {
  it("keeps the callable eager full-state surface at zero", () => {
    expect(filesMatching(/import\s*\{[\s\S]*?\bbuildOperationalState\b[\s\S]*?\}\s*from\s*["'][^"']*operational-state["']/)).toEqual([]);

    expect(sources).not.toContain("app/api/operational-state/evaluation/route.ts");
    for (const route of [
      "app/api/operational-picture/route.ts",
      "app/api/operational-state/route.ts",
    ]) {
      const source = readFileSync(join(ROOT, route), "utf8");
      expect(source).toContain("status: 410");
      expect(source).not.toContain("buildOperationalState");
    }
  });

  it("keeps the operational-state APIs clientless and the compatibility hook status-only", () => {
    expect(filesMatching(/fetch\(\s*["']\/api\/operational-state["']/)).toEqual([]);
    expect(filesMatching(/import\s*\{[\s\S]*?\buseOperationalState\b[\s\S]*?\}\s*from\s*["'][^"']*useOperationalState["']/)).toEqual([]);
    const hook = readFileSync(join(ROOT, "lib/useOperationalState.ts"), "utf8");
    expect(hook).toContain('fetch("/api/connector-status")');
    expect(hook).not.toContain("SEED_MEMORY");
  });

  it("keeps the Memory editor isolated after Dashboard compatibility retirement", () => {
    const rail = readFileSync(join(ROOT, "components/AgentRail.tsx"), "utf8");
    expect(rail).not.toContain("onOpenMemoryEditor");
    expect(rail).toContain('label="Memory"');
    expect(rail).toContain('statusLabel="UNAVAILABLE"');
  });


  it("keeps the machine-readable surface inventory complete and marks Step 5 complete", () => {
    const inventoryPath = join(ROOT, "docs/operational-state-production-inventory.json");
    const inventory = JSON.parse(readFileSync(inventoryPath, "utf8")) as {
      step5Status: string;
      callableEagerFullStateSurfaces: number;
      surfaces: Array<{ entryPoint: string | null; acquisition: string; disposition: string }>;
    };
    const directBuilders = inventory.surfaces
      .filter(surface => surface.acquisition === "direct-builder")
      .map(surface => surface.entryPoint)
      .sort();

    expect(inventory.step5Status).toBe("complete");
    expect(inventory.callableEagerFullStateSurfaces).toBe(0);
    expect(directBuilders).toEqual([]);
    for (const surface of inventory.surfaces) {
      if (surface.entryPoint === null) {
        expect(surface.disposition).toContain("removed");
        continue;
      }
      expect(relative(ROOT, join(ROOT, surface.entryPoint))).toBe(surface.entryPoint);
      expect(sources).toContain(surface.entryPoint);
    }
  });
});
