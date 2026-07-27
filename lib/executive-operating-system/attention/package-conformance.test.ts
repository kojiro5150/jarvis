import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd(); const excluded = new Set([".git", ".next", "node_modules"]);
function files(directory: string): string[] { return readdirSync(directory).flatMap(name => { if (excluded.has(name)) return []; const path = join(directory, name); return statSync(path).isDirectory() ? files(path) : /\.(ts|tsx)$/.test(name) ? [path] : []; }); }

describe("Executive Attention package boundaries", () => {
  it("keeps upstream and runtime packages independent", () => {
    for (const file of files(root)) { const path = relative(root, file); const source = readFileSync(file, "utf8");
      if (!path.endsWith(".test.ts") && /^lib\/(connectors|executive-operating-system\/situational-awareness)\//.test(path)) expect(source, path).not.toMatch(/executive-operating-system\/attention/);
      if (/^lib\/executive-operating-system\/attention\//.test(path) && !path.endsWith(".test.ts")) expect(source, path).not.toMatch(/lib\/(connectors|agents)|app\/|components\//);
    }
  });
});
