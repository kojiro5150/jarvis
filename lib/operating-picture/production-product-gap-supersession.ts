import {
  advanceProductGapSupersessionReference,
  consumeProductGapSupersessionPair,
  createProductGapSupersessionReference,
  parseProductGapSupersessionSuccessorSelection,
  parseProductGapSupersessionTargetSelection,
  parseProductGapSupersessionWriteIntent,
  selectProductGapSupersessionSuccessor,
  selectProductGapSupersessionTarget,
  type ProductGapSupersessionReference,
} from "./product-gap-supersession-reference";
import { persistProductGapSupersessionAssertion, type ProductGapSupersessionRecord } from "./product-gap-supersession-persistence";
import { projectProductGapResolutionStatus } from "./product-gap-resolution-projection";
import { retrieveDurableOperatingPictureForPurpose, type DurablePurposeProjectionResult } from "./purpose-projection-retrieval";
import { createSupabaseOperatingPicturePersistence, loadSupabaseOperatingPictureConfig, type SupabaseOperatingPictureAppendResult } from "./supabase-persistence";
import type { OperatingPictureRecordVersion } from "./record-version-history";
import { MODEL_CONTINUITY_PURPOSE } from "./model-continuity-contract";

const PREPARE = /^show me the active jarvis product gaps for supersession[.!?]*$/i;
const NEXT = /^show me the next jarvis product gap supersession (?:page|candidates)[.!?]*$/i;
export type ProductionProductGapSupersessionDependencies = Readonly<{
  clock: () => Date;
  retrieveProjection: () => Promise<DurablePurposeProjectionResult>;
  appendVersion: (version: OperatingPictureRecordVersion<ProductGapSupersessionRecord>) => Promise<SupabaseOperatingPictureAppendResult>;
}>;
export type ProductionProductGapSupersessionResult = Readonly<{
  handled: boolean;
  status?: "listed" | "target_selected" | "successor_selected" | "persisted" | "rejected";
  reply?: string;
  reference?: ProductGapSupersessionReference | null;
}>;

async function persistence() { const config = loadSupabaseOperatingPictureConfig(); return config ? createSupabaseOperatingPicturePersistence(config) : null; }
async function defaultProjection(): Promise<DurablePurposeProjectionResult> {
  const store = await persistence();
  return store ? retrieveDurableOperatingPictureForPurpose(store.durableStore, MODEL_CONTINUITY_PURPOSE)
    : Object.freeze({ status: "rejected", purpose: MODEL_CONTINUITY_PURPOSE, reason: "persistence_unavailable" });
}
async function defaultAppend(version: OperatingPictureRecordVersion<ProductGapSupersessionRecord>) {
  const store = await persistence();
  return store ? store.appendVersion(version) : Object.freeze({ status: "rejected" as const, reason: "persistence_unavailable" as const });
}
const defaults: ProductionProductGapSupersessionDependencies = Object.freeze({ clock: () => new Date(), retrieveProjection: defaultProjection, appendVersion: defaultAppend });
function reject(reply: string): ProductionProductGapSupersessionResult { return Object.freeze({ handled: true, status: "rejected", reply, reference: null }); }
function render(title: string, items: readonly { statement: string }[], hasMore: boolean): string {
  return [title, ...items.map((item, index) => `${index + 1}. ${item.statement}`), ...(hasMore ? ["Show me the next JARVIS product gap supersession candidates."] : [])].join("\n");
}

export async function resolveProductionProductGapSupersession(input: Readonly<{
  utterance: string;
  reference?: unknown;
  dependencies?: Partial<ProductionProductGapSupersessionDependencies>;
}>): Promise<ProductionProductGapSupersessionResult> {
  const dependencies = Object.freeze({ ...defaults, ...input.dependencies });
  const utterance = input.utterance.normalize("NFKC").replace(/\s+/g, " ").trim();
  const status = async () => {
    try { return projectProductGapResolutionStatus(await dependencies.retrieveProjection()); }
    catch { return { status: "rejected" as const, reason: "projection_unavailable" as const }; }
  };

  if (PREPARE.test(utterance)) {
    const projected = await status();
    if (projected.status === "rejected") return reject("I couldn't safely prepare Product Gaps for supersession right now.");
    if (projected.active.length === 0) return Object.freeze({ handled: true, status: "listed", reply: "There are no active conversation-visible JARVIS Product Gaps eligible for supersession.", reference: null });
    const flow = createProductGapSupersessionReference({ candidates: projected.active, now: dependencies.clock() });
    if (!flow) return reject("I couldn't safely prepare Product Gaps for supersession right now.");
    return Object.freeze({ handled: true, status: "listed", reply: render("Active JARVIS Product Gaps eligible for supersession:", flow.page, flow.hasMore), reference: flow.reference });
  }
  if (NEXT.test(utterance)) {
    const next = advanceProductGapSupersessionReference({ reference: input.reference, now: dependencies.clock() });
    if (!next) return reject("There is no next Product Gap supersession page available. Prepare the supersession list again.");
    const title = next.stage === "target" ? "Active JARVIS Product Gaps eligible for supersession:" : "Existing JARVIS Product Gaps eligible as the exact successor:";
    return Object.freeze({ handled: true, status: "listed", reply: render(title, next.page, next.hasMore), reference: next.reference });
  }
  const targetOrdinal = parseProductGapSupersessionTargetSelection(utterance);
  if (targetOrdinal !== null) {
    const projected = await status();
    if (projected.status === "rejected") return reject("I couldn't safely retrieve the exact successor candidates.");
    const selected = selectProductGapSupersessionTarget({ reference: input.reference, ordinal: targetOrdinal, successors: projected.history, now: dependencies.clock() });
    if (!selected) return reject("That Product Gap target is not available. Prepare the supersession list again.");
    return Object.freeze({ handled: true, status: "target_selected", reply: `Selected Product Gap to supersede:\n${selected.target.statement}\n\n${render("Existing JARVIS Product Gaps eligible as the exact successor:", selected.page, selected.hasMore)}\n\nSelect one only with: Select product gap N as successor.`, reference: selected.reference });
  }
  const successorOrdinal = parseProductGapSupersessionSuccessorSelection(utterance);
  if (successorOrdinal !== null) {
    const selected = selectProductGapSupersessionSuccessor({ reference: input.reference, ordinal: successorOrdinal, now: dependencies.clock() });
    if (!selected) return reject("That successor position is not available. Prepare the supersession list again.");
    return Object.freeze({ handled: true, status: "successor_selected", reply: `Selected exact successor Product Gap:\n${selected.successor.statement}\n\nTo author the lifecycle relationship, reply exactly: Mark this product gap as superseded.`, reference: selected.reference });
  }
  if (parseProductGapSupersessionWriteIntent(utterance)) {
    const pair = consumeProductGapSupersessionPair({ reference: input.reference, now: dependencies.clock() });
    if (!pair) return reject("That Product Gap supersession selection is no longer available. Prepare it again.");
    const result = await persistProductGapSupersessionAssertion({ pair, statedAt: dependencies.clock().toISOString(), retrieveProjection: dependencies.retrieveProjection, appendVersion: dependencies.appendVersion });
    const reply = result.status === "persisted" ? "That exact JARVIS Product Gap is now superseded by the selected existing Product Gap."
      : result.reason === "already_closed" ? "That JARVIS Product Gap is already resolved or superseded."
        : "I couldn't safely persist that Product Gap supersession.";
    return Object.freeze({ handled: true, status: result.status === "persisted" ? "persisted" : "rejected", reply, reference: null });
  }
  if (/\b(?:supersede|superseded|supersession)\b/i.test(utterance) && /\bproduct gap\b/i.test(utterance)) {
    return reject("That is not a supported Product Gap supersession command. Prepare the list and use the exact displayed commands.");
  }
  return Object.freeze({ handled: false });
}
