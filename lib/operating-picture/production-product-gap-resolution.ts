import {
  advanceProductGapResolutionListReference,
  consumeProductGapResolutionTargetReference,
  createProductGapResolutionListReference,
  createProductGapResolutionTargetReference,
  discardProductGapResolutionTargetReference,
  parseProductGapResolutionSelection,
  parseProductGapResolutionWriteIntent,
  resolveProductGapResolutionListReference,
  type ProductGapResolutionListReference,
  type ProductGapResolutionTargetReference,
} from "./product-gap-resolution-reference";
import {
  persistProductGapResolutionAssertion,
  type ProductGapResolutionPersistenceResult,
} from "./product-gap-resolution-persistence";
import { projectProductGapResolutionStatus } from "./product-gap-resolution-projection";
import { retrieveDurableOperatingPictureForPurpose, type DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import {
  createSupabaseOperatingPicturePersistence,
  loadSupabaseOperatingPictureConfig,
  type SupabaseOperatingPictureAppendResult,
} from "./supabase-persistence";
import type { OperatingPictureRecordVersion } from "./record-version-history";
import type { ProductGapResolutionRecord } from "./product-gap-resolution-persistence";

const PURPOSE = "model_continuity_context";
const PREPARE = /^show me the active jarvis product gaps for resolution[.!?]*$/i;
const NEXT = /^show me the next jarvis product gaps for resolution[.!?]*$/i;
const HISTORY = /^show me the jarvis product gap resolution history[.!?]*$/i;
const NEXT_HISTORY = /^show me the next jarvis product gap resolution history page[.!?]*$/i;

export type ProductionProductGapResolutionDependencies = Readonly<{
  clock: () => Date;
  retrieveProjection: () => Promise<DurablePurposeProjectionResult>;
  appendVersion: (
    version: OperatingPictureRecordVersion<ProductGapResolutionRecord>,
  ) => Promise<SupabaseOperatingPictureAppendResult>;
}>;

export type ProductionProductGapResolutionResult = Readonly<{
  handled: boolean;
  status?: "listed" | "selected" | "persisted" | "history" | "rejected";
  reply?: string;
  listReference?: ProductGapResolutionListReference | null;
  targetReference?: ProductGapResolutionTargetReference | null;
}>;

function normalized(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim();
}

function isResolutionShaped(value: string): boolean {
  return /\b(?:resolution|resolved|resolve)\b/i.test(value)
    && /\bproduct gap\b/i.test(value);
}

async function defaultPersistence() {
  const config = loadSupabaseOperatingPictureConfig();
  if (!config) return null;
  return createSupabaseOperatingPicturePersistence(config);
}

async function defaultProjection(): Promise<DurablePurposeProjectionResult> {
  const persistence = await defaultPersistence();
  if (!persistence) return Object.freeze({ status: "rejected", purpose: PURPOSE, reason: "persistence_unavailable" });
  return retrieveDurableOperatingPictureForPurpose(persistence.durableStore, PURPOSE);
}

async function defaultAppend(version: OperatingPictureRecordVersion<ProductGapResolutionRecord>): Promise<SupabaseOperatingPictureAppendResult> {
  const persistence = await defaultPersistence();
  if (!persistence) return Object.freeze({ status: "rejected", reason: "persistence_unavailable" });
  return persistence.appendVersion(version);
}

const defaults: ProductionProductGapResolutionDependencies = Object.freeze({
  clock: () => new Date(),
  retrieveProjection: defaultProjection,
  appendVersion: defaultAppend,
});

function rejected(reply: string): ProductionProductGapResolutionResult {
  return Object.freeze({ handled: true, status: "rejected", reply, listReference: null, targetReference: null });
}

function persistenceReply(result: ProductGapResolutionPersistenceResult): string {
  if (result.status === "persisted") return "That exact JARVIS product gap is now marked resolved.";
  if (result.reason === "already_resolved") return "That JARVIS product gap is already resolved.";
  if (result.reason === "target_changed" || result.reason === "target_not_found" || result.reason === "target_ineligible") {
    return "That Product Gap target is no longer active. Please prepare the active list again.";
  }
  return "I couldn't safely persist that Product Gap resolution.";
}

export async function resolveProductionProductGapResolution(input: Readonly<{
  utterance: string;
  listReference?: unknown;
  targetReference?: unknown;
  dependencies?: Partial<ProductionProductGapResolutionDependencies>;
}>): Promise<ProductionProductGapResolutionResult> {
  const dependencies: ProductionProductGapResolutionDependencies = Object.freeze({
    clock: input.dependencies?.clock ?? defaults.clock,
    retrieveProjection: input.dependencies?.retrieveProjection ?? defaults.retrieveProjection,
    appendVersion: input.dependencies?.appendVersion ?? defaults.appendVersion,
  });
  const utterance = normalized(input.utterance);

  if (PREPARE.test(utterance)) {
    let projection: DurablePurposeProjectionResult;
    try { projection = await dependencies.retrieveProjection(); }
    catch { return rejected("I couldn't safely prepare the active JARVIS Product Gaps right now."); }
    const status = projectProductGapResolutionStatus(projection);
    if (status.status === "rejected") return rejected("I couldn't safely prepare the active JARVIS Product Gaps right now.");
    if (status.active.length === 0) {
      return Object.freeze({ handled: true, status: "listed", reply: "There are no active conversation-visible JARVIS Product Gaps.", listReference: null, targetReference: null });
    }
    const page = status.active.slice(0, 10);
    const reference = createProductGapResolutionListReference({ candidates: status.active, now: dependencies.clock() });
    if (!reference) return rejected("I couldn't safely prepare the active JARVIS Product Gaps right now.");
    return Object.freeze({
      handled: true,
      status: "listed",
      reply: ["Active JARVIS Product Gaps:", ...page.map((item, index) => `${index + 1}. ${item.statement}`), ...(status.active.length > 10 ? ["Show me the next JARVIS product gaps for resolution."] : [])].join("\n"),
      listReference: reference,
      targetReference: null,
    });
  }

  if (NEXT.test(utterance)) {
    const next = advanceProductGapResolutionListReference({ reference: input.listReference, now: dependencies.clock() });
    if (!next) return rejected("There is no next active Product Gap page available. Prepare the active list again.");
    return Object.freeze({
      handled: true,
      status: "listed",
      reply: ["Active JARVIS Product Gaps:", ...next.candidates.map((item, index) => `${index + 1}. ${item.statement}`), ...(next.hasMore ? ["Show me the next JARVIS product gaps for resolution."] : [])].join("\n"),
      listReference: next.reference,
      targetReference: null,
    });
  }

  if (HISTORY.test(utterance)) {
    let projection: DurablePurposeProjectionResult;
    try { projection = await dependencies.retrieveProjection(); }
    catch { return rejected("I couldn't safely retrieve Product Gap resolution history right now."); }
    const status = projectProductGapResolutionStatus(projection);
    if (status.status === "rejected") return rejected("I couldn't safely retrieve Product Gap resolution history right now.");
    const page = status.history.slice(0, 10);
    const reference = page.length > 0
      ? createProductGapResolutionListReference({ candidates: status.history, now: dependencies.clock(), kind: "history" })
      : null;
    return Object.freeze({
      handled: true,
      status: "history",
      reply: page.length === 0
        ? "There is no conversation-visible JARVIS Product Gap history."
        : ["JARVIS Product Gap resolution history:", ...page.map((item, index) => `${index + 1}. [${item.status}] ${item.statement}${item.resolvedAt ? ` — explicitly resolved ${item.resolvedAt}` : ""}`), ...(status.history.length > 10 ? ["Show me the next JARVIS product gap resolution history page."] : [])].join("\n"),
      listReference: reference,
      targetReference: null,
    });
  }

  if (NEXT_HISTORY.test(utterance)) {
    const next = advanceProductGapResolutionListReference({ reference: input.listReference, now: dependencies.clock(), kind: "history" });
    if (!next) return rejected("There is no next Product Gap resolution history page available. Retrieve the history again.");
    let projection: DurablePurposeProjectionResult;
    try { projection = await dependencies.retrieveProjection(); }
    catch { return rejected("I couldn't safely retrieve Product Gap resolution history right now."); }
    const status = projectProductGapResolutionStatus(projection);
    if (status.status === "rejected") return rejected("I couldn't safely retrieve Product Gap resolution history right now.");
    const byId = new Map(status.history.map(item => [item.recordId, item] as const));
    const page = next.candidates.map(candidate => byId.get(candidate.recordId)).filter((item): item is NonNullable<typeof item> => item !== undefined);
    if (page.length !== next.candidates.length) return rejected("Product Gap history changed while paging. Retrieve the history again.");
    return Object.freeze({
      handled: true,
      status: "history",
      reply: ["JARVIS Product Gap resolution history:", ...page.map((item, index) => `${index + 1}. [${item.status}] ${item.statement}${item.resolvedAt ? ` — explicitly resolved ${item.resolvedAt}` : ""}`), ...(next.hasMore ? ["Show me the next JARVIS product gap resolution history page."] : [])].join("\n"),
      listReference: next.reference,
      targetReference: null,
    });
  }

  const ordinal = parseProductGapResolutionSelection(utterance);
  if (ordinal !== null) {
    const selected = resolveProductGapResolutionListReference({ reference: input.listReference, ordinal, now: dependencies.clock() });
    if (!selected) return rejected("That Product Gap position is not available. Please prepare the active list again.");
    discardProductGapResolutionTargetReference(input.targetReference);
    const reference = createProductGapResolutionTargetReference({
      target: { recordId: selected.recordId, versionId: selected.versionId },
      now: dependencies.clock(),
    });
    if (!reference) return rejected("I couldn't safely select that Product Gap.");
    return Object.freeze({
      handled: true,
      status: "selected",
      reply: `Selected exact Product Gap:\n${selected.statement}\n\nTo author the lifecycle decision, reply exactly: Mark this product gap as resolved.`,
      listReference: null,
      targetReference: reference,
    });
  }

  if (parseProductGapResolutionWriteIntent(utterance)) {
    const target = consumeProductGapResolutionTargetReference({ reference: input.targetReference, now: dependencies.clock() });
    if (!target) return rejected("That Product Gap target is no longer available. Please prepare the active list again.");
    const result = await persistProductGapResolutionAssertion({
      target,
      statedAt: dependencies.clock().toISOString(),
      retrieveProjection: dependencies.retrieveProjection,
      appendVersion: dependencies.appendVersion,
    });
    return Object.freeze({
      handled: true,
      status: result.status === "persisted" ? "persisted" : "rejected",
      reply: persistenceReply(result),
      listReference: null,
      targetReference: null,
    });
  }

  if (isResolutionShaped(utterance)) {
    return rejected("That is not a supported Product Gap resolution command. Prepare the active list and use the exact displayed commands.");
  }
  return Object.freeze({ handled: false });
}
