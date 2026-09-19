import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const matrix = readFileSync(
  new URL("../../docs/architecture/AUTHORITY-PATH-MATRIX.md", import.meta.url),
  "utf8",
);

const paths = [
  "calendar.read",
  "gmail.search",
  "gmail.read",
  "drive.search",
  "drive.read",
  "Gmail invitation-decline drafting re-read",
  "calendar.event.move",
  "user continuity capture",
  "Product Gap resolution",
  "Product Gap supersession",
] as const;

describe("ADR-0027 authority-path matrix", () => {
  it("enumerates every live authority path", () => {
    for (const path of paths) {
      expect(matrix, path).toContain(path);
    }
  });

  it("binds the matrix to replay, non-inheritance and D5 voice evidence", () => {
    expect(matrix).toContain("replay after consumption");
    expect(matrix).toContain("does not authorize another matrix path");
    expect(matrix).toContain("non-\`typed\` turn cannot consume write authority");
    expect(matrix).toContain("voice-write-containment.test.ts");
  });
});
