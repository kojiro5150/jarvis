import { OperationalValidationReportBrowser } from "../lib/operational-validation/browser.ts";

async function main(): Promise<void> {
  const [operation, runId, ...extra] = process.argv.slice(2);
  if (extra.length > 0 || !operation) throw new Error("usage: validation-reports <list|latest|show|summary> [runId]");
  const browser = new OperationalValidationReportBrowser();

  if (operation === "list" && runId === undefined) {
    for (const report of await browser.list()) console.log(`${report.runId}\t${report.generatedAt}`);
    return;
  }
  if (operation === "latest" && runId === undefined) {
    process.stdout.write((await browser.latest()).contents);
    return;
  }
  if (operation === "show" && runId !== undefined) {
    process.stdout.write((await browser.show(runId)).contents);
    return;
  }
  if (operation === "summary" && runId !== undefined) {
    console.log(JSON.stringify(await browser.summary(runId), null, 2));
    return;
  }
  throw new Error("usage: validation-reports <list|latest|show|summary> [runId]");
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
