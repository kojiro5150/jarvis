import { describe, expect, it } from "vitest";
import {
  type ModelContinuityAssessment,
  type ModelContinuityContextBuildResult,
} from "./model-continuity-contract";
import {
  projectModelContinuityPresentation,
  resolveModelContinuityAssessment,
} from "./model-continuity-presentation";

function readyBuild(): Extract<ModelContinuityContextBuildResult, { status: "ready" }> {
  return Object.freeze({
    status: "ready",
    context: Object.freeze({
      purpose: "conversation",
      items: Object.freeze([
        Object.freeze({
          continuityId: "continuity:1",
          semanticClass: "preference",
          recoveryDisposition: "recoverable_user_continuity",
          value: Object.freeze({ statement: "I prefer short status updates." }),
        }),
        Object.freeze({
          continuityId: "continuity:2",
          semanticClass: "open_question",
          recoveryDisposition: "recoverable_model_continuity",
          value: "Whether the next step should be tested live.",
        }),
      ]),
    }),
    bindings: Object.freeze([
      Object.freeze({
        continuityId: "continuity:1",
        recordId: "record:user:1",
        versionId: "version:user:1",
      }),
      Object.freeze({
        continuityId: "continuity:2",
        recordId: "record:model:1",
        versionId: "version:model:1",
      }),
    ]),
  });
}

function relevantAssessment(): ModelContinuityAssessment {
  return Object.freeze({
    responseType: "continuity_relevance",
    relevance: "relevant",
    relevantItemIds: Object.freeze(["continuity:1"]),
  });
}

describe("model continuity resolution and presentation", () => {
  it("resolves only model-selected opaque IDs back to exact server-side bindings", () => {
    const result = resolveModelContinuityAssessment({
      contextBuild: readyBuild(),
      assessment: relevantAssessment(),
    });

    expect(result).toEqual({
      status: "resolved",
      items: [
        {
          continuityId: "continuity:1",
          recordId: "record:user:1",
          versionId: "version:user:1",
          semanticClass: "preference",
          recoveryDisposition: "recoverable_user_continuity",
          value: { statement: "I prefer short status updates." },
        },
      ],
    });
  });

  it("projects user continuity with explicit non-fact attribution and strips durable identity", () => {
    const resolution = resolveModelContinuityAssessment({
      contextBuild: readyBuild(),
      assessment: relevantAssessment(),
    });

    const presentation = projectModelContinuityPresentation(resolution);

    expect(presentation).toEqual({
      responseType: "continuity_context",
      relevance: "relevant",
      items: [
        {
          continuityType: "remembered_user_continuity",
          semanticClass: "preference",
          value: { statement: "I prefer short status updates." },
        },
      ],
    });

    const serialized = JSON.stringify(presentation);
    for (const forbidden of [
      "record:user:1",
      "version:user:1",
      "recordId",
      "versionId",
      "GovernedEvidence",
      "AuthorityEvidence",
      '"fact"',
    ]) {
      expect(serialized).not.toContain(forbidden);
    }
  });

  it("labels prior model continuity explicitly rather than presenting it as fact", () => {
    const assessment: ModelContinuityAssessment = Object.freeze({
      responseType: "continuity_relevance",
      relevance: "relevant",
      relevantItemIds: Object.freeze(["continuity:2"]),
    });

    const resolution = resolveModelContinuityAssessment({
      contextBuild: readyBuild(),
      assessment,
    });

    expect(projectModelContinuityPresentation(resolution)).toEqual({
      responseType: "continuity_context",
      relevance: "relevant",
      items: [
        {
          continuityType: "prior_model_continuity",
          semanticClass: "open_question",
          value: "Whether the next step should be tested live.",
        },
      ],
    });
  });

  it("preserves an explicit not-relevant result without selecting or presenting continuity", () => {
    const assessment: ModelContinuityAssessment = Object.freeze({
      responseType: "continuity_relevance",
      relevance: "not_relevant",
      relevantItemIds: Object.freeze([]),
    });

    const resolution = resolveModelContinuityAssessment({
      contextBuild: readyBuild(),
      assessment,
    });

    expect(resolution).toEqual({
      status: "not_relevant",
      items: [],
    });

    expect(projectModelContinuityPresentation(resolution)).toEqual({
      responseType: "continuity_context",
      relevance: "not_relevant",
      items: [],
    });
  });

  it("rejects non-ready context before binding resolution", () => {
    const empty: ModelContinuityContextBuildResult = Object.freeze({
      status: "empty",
      purpose: "conversation",
    });

    expect(resolveModelContinuityAssessment({
      contextBuild: empty,
      assessment: relevantAssessment(),
    })).toEqual({
      status: "rejected",
      reason: "context_not_ready",
    });
  });

  it.each([
    {
      label: "binding count mismatch",
      mutate: (build: ReturnType<typeof readyBuild>) => Object.freeze({
        ...build,
        bindings: Object.freeze(build.bindings.slice(0, 1)),
      }),
    },
    {
      label: "binding ID mismatch",
      mutate: (build: ReturnType<typeof readyBuild>) => Object.freeze({
        ...build,
        bindings: Object.freeze([
          Object.freeze({ ...build.bindings[0], continuityId: "continuity:2" as const }),
          build.bindings[1],
        ]),
      }),
    },
    {
      label: "duplicate durable identity",
      mutate: (build: ReturnType<typeof readyBuild>) => Object.freeze({
        ...build,
        bindings: Object.freeze([
          build.bindings[0],
          Object.freeze({
            ...build.bindings[1],
            recordId: build.bindings[0].recordId,
            versionId: build.bindings[0].versionId,
          }),
        ]),
      }),
    },
  ])("fails closed for $label", ({ mutate }) => {
    expect(resolveModelContinuityAssessment({
      contextBuild: mutate(readyBuild()),
      assessment: relevantAssessment(),
    })).toEqual({
      status: "rejected",
      reason: "binding_integrity_failure",
    });
  });

  it("revalidates a typed-looking assessment and rejects fabricated unknown IDs", () => {
    const fabricated = Object.freeze({
      responseType: "continuity_relevance",
      relevance: "relevant",
      relevantItemIds: Object.freeze(["continuity:99"]),
    }) as ModelContinuityAssessment;

    expect(resolveModelContinuityAssessment({
      contextBuild: readyBuild(),
      assessment: fabricated,
    })).toEqual({
      status: "rejected",
      reason: "assessment_invalid",
    });
  });

  it("never creates a presentation for rejected resolution", () => {
    expect(projectModelContinuityPresentation({
      status: "rejected",
      reason: "assessment_invalid",
    })).toBeNull();
  });

  it("contains no durable retrieval, model invocation, connector or trust-promotion machinery", async () => {
    const source = await import("node:fs").then(({ readFileSync }) =>
      readFileSync("lib/operating-picture/model-continuity-presentation.ts", "utf8"));

    for (const forbidden of [
      "retrieveDurableOperatingPicture",
      "DurableOperatingPictureStore",
      "callModel",
      "Anthropic",
      "messages.create",
      "GovernedEvidence",
      "AuthorityEvidence",
      "CompletionProof",
      "createSupabase",
      "calendar.",
      "gmail.",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });
});
