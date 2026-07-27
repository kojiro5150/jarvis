import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Assessment package conformance", () => { it("depends only on permitted Executive Operating System packages", () => { const directory = join(process.cwd(), "lib/executive-operating-system/assessment"); const production = readdirSync(directory).filter(file => file.endsWith(".ts") && !file.endsWith(".test.ts")); const forbidden = ["planning", "reasoning", "execution", "runtime", "components", "app/", "notifications", "specialists", "anthropic", "openai"];
    for (const file of production) { const source = readFileSync(join(directory, file), "utf8"); for (const dependency of forbidden) expect(source, `${file} must not depend on ${dependency}`).not.toContain(dependency); const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map(match => match[1]); expect(imports.every(specifier => specifier.startsWith("./") || specifier === "../situations" || specifier === "../attention")).toBe(true); }
  }); });
