import type { ExecutiveOrientation } from "./types";

function changeLine(item: ExecutiveOrientation["changeSummary"][number]): string | null {
  if (item.totalChanged === 0) return null;
  const parts = [
    item.added ? `${item.added} added` : null,
    item.modified ? `${item.modified} modified` : null,
    item.removed ? `${item.removed} removed` : null,
  ].filter((value): value is string => Boolean(value));
  return `- ${item.domain}: ${parts.join(", ")}`;
}

/**
 * Model-free presentation of the bounded orientation publication.
 *
 * The renderer does not rank records, rewrite reason codes, or promote
 * non-attention changes into the attention section.
 */
export function renderExecutiveOrientation(orientation: ExecutiveOrientation): string {
  const changed = orientation.changeSummary.map(changeLine).filter((line): line is string => Boolean(line));
  const attention = orientation.attentionItems.map(item =>
    `- ${item.reasonMessage} [${item.reasonCode}]`);
  const dependencies = orientation.communicationDependencies.map(item =>
    `- ${item.sourceCommunicationId} ${item.relation === "in_reply_to" ? "replies to" : "references"} ${item.targetProtocolMessageId}`);
  const sources = orientation.sources.map(item =>
    `- ${item.sourceId}: ${item.status}`);

  return [
    "Executive orientation",
    "",
    "What changed",
    ...(changed.length ? changed : ["- No canonical changes observed."]),
    "",
    "What warrants attention",
    ...(attention.length ? attention : ["- No policy-qualified changes require attention."]),
    "",
    "Explicit dependencies",
    ...(dependencies.length ? dependencies : ["- No explicit communication-thread dependencies observed."]),
    "",
    "Source state",
    ...(sources.length ? sources : ["- No governed source state available."]),
  ].join("\n");
}
