import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { BoundedGoogleCalendarConnector } from "../lib/connectors/google/bounded-calendar";
import { runAuthenticatedOperationalValidation } from "../lib/operational-validation";

async function main(): Promise<void> {
  const terminal = createInterface({ input: stdin, output: stdout });

  try {
    const result = await runAuthenticatedOperationalValidation({
      connector: new BoundedGoogleCalendarConnector(),
      confirmChallenge: async (attestation) => {
        console.log(
          "\nLOCAL EVIDENCE ATTESTATION (never publish this output)\n",
          attestation,
        );

        const operator = await terminal.question("Operator identifier: ");
        const answer = await terminal.question(
          "Evidence challenge response: ",
        );

        return { operator, answer };
      },
    });

    if (result.status === "AUTHENTICATED_VALIDATION_NOT_EXECUTED") {
      console.error(
        "AUTHENTICATED_VALIDATION_NOT_EXECUTED: authentication was unavailable; no report or summary was produced.",
      );
      process.exitCode = 2;
      return;
    }

    console.log(
      JSON.stringify(
        {
          status: result.status,
          reportPath: result.reportPath,
          operatorConfirmation: result.summary.operatorConfirmation,
          migrationRecommendation:
            result.summary.migrationRecommendation,
          scenarioCoverage:
            result.summary.migrationRecommendation.evidence.scenarioCoverage,
          legacyComparisonExecuted:
            result.summary.migrationRecommendation.evidence.legacyComparisonExecuted,
        },
        null,
        2,
      ),
    );

    console.log("Repository summary publication is deliberately manual.");
  } finally {
    terminal.close();
  }
}

void main().catch((error: unknown) => {
  console.error("Operational validation runner failed.", error);
  process.exitCode = 1;
});
