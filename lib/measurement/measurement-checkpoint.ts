import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** Creates the first report exclusively, then atomically replaces later checkpoints. */
export async function writeMeasurementCheckpoint(output: string, report: unknown, initial = false): Promise<void> {
  await mkdir(dirname(output), { recursive: true });
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (initial) {
    await writeFile(output, serialized, { flag: "wx" });
    return;
  }
  const temporary = `${output}.tmp`;
  await writeFile(temporary, serialized);
  await rename(temporary, output);
}
