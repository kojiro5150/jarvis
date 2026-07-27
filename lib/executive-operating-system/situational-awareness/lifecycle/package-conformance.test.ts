import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
function filesUnder(path: string): string[] {
  const absolute = resolve(root, path);
  return readdirSync(absolute).flatMap((name) => {
    const child = join(absolute, name);
    return statSync(child).isDirectory() ? filesUnder(relative(root, child)) : [child];
  });
}

describe("snapshot lifecycle package boundary", () => {
  it("keeps connectors and projection adapters unaware of lifecycle", () => {
    const consumers = [...filesUnder("lib/connectors"), ...filesUnder("lib/executive-operating-system/situational-awareness/projection/adapters")];
    for (const file of consumers.filter((name) => name.endsWith(".ts"))) {
      expect(readFileSync(file, "utf8"), relative(root, file)).not.toMatch(/situational-awareness\/lifecycle|\/lifecycle/);
    }
  });

  it("keeps lifecycle connector-independent and ProjectionEngine lifecycle-independent", () => {
    for (const file of filesUnder("lib/executive-operating-system/situational-awareness/lifecycle").filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))) {
      expect(readFileSync(file, "utf8"), relative(root, file)).not.toMatch(/connectors\//);
    }
    expect(readFileSync(resolve(root, "lib/executive-operating-system/situational-awareness/projection/engine.ts"), "utf8")).not.toMatch(/lifecycle/);
  });
});
