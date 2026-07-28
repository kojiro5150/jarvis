const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

// This development entry point loads the TypeScript sources without adding a
// second runtime path: execution below still goes through the canonical EOS
// runtime class used by the golden replay test.
require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: filename,
  });
  module._compile(compiled.outputText, filename);
};

const {
  DeterministicExecutiveOperatingSystemRuntime,
  ExecutiveOperatingSystemRuntimeError,
} = require("../lib/executive-operating-system/runtime");
const {
  goldenProjectionArtifactSet,
  goldenRuntimeConfiguration,
} = require("../tests/fixtures/eos/golden-projection-artifact-set");

const DEFAULT_OUTPUT_PATH = path.resolve("tmp/eos-demo-result.json");

function proposalStatuses(result) {
  const statuses = result.proposals.proposals.map(
    (proposal) => proposal.proposalStatus,
  );
  return statuses.length === 0 ? "none" : statuses.join(", ");
}

function printSummary(result, outputPath, log) {
  const lines = [
    ["Stage count", result.trace.stages.length],
    ["Situations produced", result.situations.situations.length],
    ["Assessments produced", result.assessment.assessments.length],
    ["Candidate plans produced", result.candidatePlans.candidates.length],
    ["Evaluation findings produced", result.evaluation.summary.totalFindings],
    ["Comparisons produced", result.comparison.pairwiseComparisons.length],
    ["Reasoning records produced", 1],
    ["Governed proposals produced", result.proposals.proposals.length],
    ["Proposal statuses", proposalStatuses(result)],
    ["Execution trace length", result.trace.stages.length],
    ["Output file path", outputPath],
  ];
  log("EOS demonstration complete");
  for (const [label, value] of lines) log(`${label}: ${value}`);
}

function runEosDemo(options = {}) {
  const outputPath = options.outputPath || DEFAULT_OUTPUT_PATH;
  const log = options.log || console.log;
  const runtime = new DeterministicExecutiveOperatingSystemRuntime();
  const result = runtime.run({
    projectionArtifacts: goldenProjectionArtifactSet,
    referenceTime: "2030-01-14T11:00:00Z",
    configuration: goldenRuntimeConfiguration,
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, "utf8");
  printSummary(result, outputPath, log);
  return result;
}

if (require.main === module) {
  try {
    runEosDemo();
  } catch (error) {
    if (error instanceof ExecutiveOperatingSystemRuntimeError) {
      console.error(`EOS demonstration failed at ${error.stage}: ${error.reasonCode}`);
    } else {
      console.error("EOS demonstration failed at harness: unexpected-harness-failure");
    }
    process.exitCode = 1;
  }
}

module.exports = { DEFAULT_OUTPUT_PATH, runEosDemo };
