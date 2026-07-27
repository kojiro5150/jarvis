import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Intent package conformance", () => { it("depends only on Executive Context and its own canonical contracts and validation", () => { const directory = join(process.cwd(), "lib/executive-operating-system/intent"); const production = readdirSync(directory).filter(file => file.endsWith(".ts") && !file.endsWith(".test.ts")); const forbidden = ["planning", "reasoning", "execution/", "runtime", "notifications", "components", "app/", "specialists", "anthropic", "openai", "llm", "../assessment", "../situations", "../attention"];
  for (const file of production) { const source = readFileSync(join(directory, file), "utf8").toLowerCase(); for (const dependency of forbidden) expect(source, `${file} must not depend on ${dependency}`).not.toContain(dependency); const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(match => match[1]); expect(imports.every(specifier => specifier.startsWith("./") || specifier === "../context")).toBe(true); }
}); });
