import { expect, it } from "vitest";
import { cassieFixture } from "./fixtures";
import type { GovernedConversationModelAdapter } from "./model-invocation";
import { constructGovernedModelRequest } from "./model-request";

it("adapts the provider-neutral request to the production call signature without production imports", async () => {
  const calls: unknown[][] = [];
  const callModel = async (systemPrompt: string, messages: { role: "user"; content: string }[]) => { calls.push([systemPrompt, messages]); return "{}"; };
  const localAdapter: GovernedConversationModelAdapter = { invoke: (request) => callModel(request.systemInstruction, [{ role: "user", content: JSON.stringify({ question: request.userQuestion, governedContext: request.governedContext, conversationHistory: request.conversationHistory, outputContract: request.outputContract }) }]) };
  await localAdapter.invoke(constructGovernedModelRequest(cassieFixture.input, "request:provider-contract"));
  expect(calls).toHaveLength(1);
  expect(calls[0][0]).toEqual(expect.stringContaining("closed output contract"));
});
