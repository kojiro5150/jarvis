import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { writeMeasurementCheckpoint } from "./measurement-checkpoint";

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map(path => rm(path, { recursive: true, force: true })));
});

describe("measurement checkpoint", () => {
  it("atomically replaces a running report with an interrupted partial report", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-capacity-checkpoint-"));
    temporaryDirectories.push(directory);
    const output = join(directory, "nested", "report.json");
    await writeMeasurementCheckpoint(output, { progress: { status: "running", completed: 0, remaining: 60 } }, true);
    await writeMeasurementCheckpoint(output, { progress: { status: "interrupted", completed: 7, remaining: 53 } });

    expect(JSON.parse(await readFile(output, "utf8"))).toEqual({ progress: { status: "interrupted", completed: 7, remaining: 53 } });
    await expect(readFile(`${output}.tmp`, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  it("does not overwrite an existing report during initial creation", async () => {
    const directory = await mkdtemp(join(tmpdir(), "jarvis-capacity-checkpoint-"));
    temporaryDirectories.push(directory);
    const output = join(directory, "report.json");
    await writeMeasurementCheckpoint(output, { first: true }, true);
    await expect(writeMeasurementCheckpoint(output, { first: false }, true)).rejects.toMatchObject({ code: "EEXIST" });
    expect(JSON.parse(await readFile(output, "utf8"))).toEqual({ first: true });
  });
});
