/**
 * Isolated Sprint 3.65 implementation of the Governed DAWNWATCH Briefing
 * Presentation Contract. It is deliberately not wired to a runtime renderer.
 *
 * Replay configuration is explicit: en-AU, Australia/Melbourne, and a caller-
 * supplied RFC 3339 reference instant. Evidence sufficiency uses the six
 * deterministic rules in Sprint 3.64; there are no inferred or numeric
 * thresholds.
 */

export const DAWNWATCH_PRESENTATION_CONTRACT_VERSION = "dawnwatch-presentation-v1" as const;
export const DAWNWATCH_EVIDENCE_RULE_VERSION = "sprint-3.64-evidence-v1" as const;
export const DAWNWATCH_VOICE_RULE_VERSION = "sprint-3.64-voice-v1" as const;

export type DawnwatchSemanticStatus =
  | "available"
  | "unavailable"
  | "insufficient_coverage"
  | "unsupported"
  | "not_applicable";

/** Availability is separate from evidence status so Deferred and Rejected can never be ambiguous. */
export type DawnwatchGovernedAvailability =
  | "supported"
  | "pending_governance"
  | "rejected_by_governance";

export type DawnwatchSourceAvailability = "available" | "unavailable";

export interface DawnwatchProvenance {
  readonly sourceId: string;
  readonly assertionId: string;
}

export interface DawnwatchCanonicalReference {
  readonly id: string;
  readonly provenance: DawnwatchProvenance;
}

export interface DawnwatchSourceObservation {
  readonly id: string;
  readonly kind: string;
  readonly availability: DawnwatchSourceAvailability;
  readonly observedAt: string;
  readonly snapshotId: string;
  readonly provenance: DawnwatchProvenance;
}

/** Narrow application-facing projection: excluded legacy and heuristic fields cannot enter it. */
export interface DawnwatchPresentationInput {
  readonly priorities: readonly (DawnwatchCanonicalReference & { readonly title: string })[];
  readonly commitments: readonly (DawnwatchCanonicalReference & {
    readonly title: string;
    readonly start?: string;
    readonly end?: string;
    readonly status: "scheduled" | "cancelled";
  })[];
  readonly communications: readonly (DawnwatchCanonicalReference & {
    readonly sender: string;
    readonly recipients: readonly string[];
    readonly sentAt: string;
    readonly receivedAt?: string;
    readonly subject?: string;
    readonly replyToId?: string;
  })[];
  readonly sources: readonly DawnwatchSourceObservation[];
}

export interface DawnwatchPresentationConfiguration {
  readonly viewerTimeZone: "Australia/Melbourne";
  readonly locale: "en-AU";
  /** Explicit injected instant. The implementation never reads a clock. */
  readonly referenceTime: string;
  readonly sourceScope: readonly string[];
  /** Presentation-only stable sequence; it conveys no operational priority or chronology. */
  readonly identityTieBreakRule: "canonical_identity_ascending";
}

export const DEFAULT_DAWNWATCH_PRESENTATION_CONFIGURATION = Object.freeze({
  viewerTimeZone: "Australia/Melbourne",
  locale: "en-AU",
} as const);

export interface DawnwatchSection<T> {
  readonly status: DawnwatchSemanticStatus;
  readonly availability: DawnwatchGovernedAvailability;
  readonly references: readonly DawnwatchCanonicalReference[];
  readonly sources: readonly DawnwatchSourceObservation[];
  readonly observations: readonly T[];
  readonly evidence: readonly string[];
}

export type DawnwatchCapability =
  | "priority_observations"
  | "commitment_observations"
  | "communication_observations"
  | "urgency_summary"
  | "priority_order"
  | "priority_due"
  | "temporal_window"
  | "calendar_display_name"
  | "connector_index_selection"
  | "provider_label_rule"
  | "legacy_temporal_text"
  | "communication_attention_selection"
  | "attention_statement";

export interface DawnwatchCapabilityStatus {
  readonly capability: DawnwatchCapability;
  readonly status: DawnwatchSemanticStatus;
  readonly availability: DawnwatchGovernedAvailability;
}

export interface DawnwatchPresentation {
  readonly contractVersion: typeof DAWNWATCH_PRESENTATION_CONTRACT_VERSION;
  readonly configuration: DawnwatchPresentationConfiguration;
  readonly ruleVersions: {
    readonly evidence: typeof DAWNWATCH_EVIDENCE_RULE_VERSION;
    readonly voice: typeof DAWNWATCH_VOICE_RULE_VERSION;
  };
  readonly overallStatus: DawnwatchSemanticStatus;
  readonly priorities: DawnwatchSection<{ readonly id: string; readonly title: string }>;
  readonly commitments: DawnwatchSection<{
    readonly id: string; readonly title: string; readonly start?: string; readonly end?: string;
    readonly status: "scheduled" | "cancelled";
  }>;
  readonly communications: DawnwatchSection<{
    readonly id: string; readonly sender: string; readonly recipients: readonly string[];
    readonly sentAt: string; readonly receivedAt?: string; readonly subject?: string; readonly replyToId?: string;
  }>;
  readonly urgency: DawnwatchSection<never>;
  readonly capabilities: readonly DawnwatchCapabilityStatus[];
  /** Lossless, application-owned voice rendering of the structured statuses and observations. */
  readonly voice: string;
}

const pending = new Set<DawnwatchCapability>([
  "urgency_summary", "priority_order", "priority_due", "temporal_window", "calendar_display_name",
]);
const rejected = new Set<DawnwatchCapability>([
  "connector_index_selection", "provider_label_rule", "legacy_temporal_text",
  "communication_attention_selection", "attention_statement",
]);
const capabilities: readonly DawnwatchCapability[] = [
  "priority_observations", "commitment_observations", "communication_observations", "urgency_summary",
  "priority_order", "priority_due", "temporal_window", "calendar_display_name", "connector_index_selection",
  "provider_label_rule", "legacy_temporal_text", "communication_attention_selection", "attention_statement",
];

export function getDawnwatchCapabilityStatus(capability: DawnwatchCapability): DawnwatchCapabilityStatus {
  if (pending.has(capability)) return { capability, status: "unsupported", availability: "pending_governance" };
  if (rejected.has(capability)) return { capability, status: "unsupported", availability: "rejected_by_governance" };
  return { capability, status: "available", availability: "supported" };
}

/** No interval arguments are accepted, so the deferred overlap expression cannot be evaluated accidentally. */
export function getTomorrowAfternoonStatus(): DawnwatchCapabilityStatus {
  return getDawnwatchCapabilityStatus("temporal_window");
}

const orderText = (left: string, right: string): number => left < right ? -1 : left > right ? 1 : 0;
const reference = ({ id, provenance }: DawnwatchCanonicalReference): DawnwatchCanonicalReference => ({ id, provenance: { ...provenance } });

function validate(configuration: DawnwatchPresentationConfiguration): void {
  if (!configuration.referenceTime || !Number.isFinite(Date.parse(configuration.referenceTime)))
    throw new Error("referenceTime must be an explicit RFC 3339 instant");
  if (!configuration.sourceScope.length) throw new Error("sourceScope must be explicit and non-empty");
}

function scopedSources(input: DawnwatchPresentationInput, configuration: DawnwatchPresentationConfiguration): readonly DawnwatchSourceObservation[] {
  const scope = new Set(configuration.sourceScope);
  return input.sources.filter(source => scope.has(source.id)).sort((a, b) => orderText(a.id, b.id));
}

function evidenceStatus(
  items: readonly DawnwatchCanonicalReference[],
  sources: readonly DawnwatchSourceObservation[],
  hasSemanticFields: (item: DawnwatchCanonicalReference) => boolean,
): DawnwatchSemanticStatus {
  if (sources.some(source => source.availability === "unavailable")) return "unavailable";
  if (!sources.length || !items.length) return "insufficient_coverage";
  if (sources.some(source => !source.snapshotId || !source.observedAt || !Number.isFinite(Date.parse(source.observedAt))
    || !source.provenance.sourceId || !source.provenance.assertionId)) return "insufficient_coverage";
  const available = new Set(sources.filter(source => source.availability === "available").map(source => source.id));
  return items.every(item => item.id && item.provenance.assertionId && hasSemanticFields(item) && available.has(item.provenance.sourceId))
    ? "available" : "insufficient_coverage";
}

function evidence(status: DawnwatchSemanticStatus): readonly string[] {
  if (status === "available") return ["Canonical identity, provenance, semantic fields, and an available scoped source are present."];
  if (status === "unavailable") return ["At least one required scoped source reports unavailable; fallback data cannot upgrade it."];
  return ["The supplied evidence does not establish sufficient coverage; an empty collection does not prove absence."];
}

function renderVoice(parts: {
  priorities: DawnwatchPresentation["priorities"];
  commitments: DawnwatchPresentation["commitments"];
  communications: DawnwatchPresentation["communications"];
}): string {
  const render = (label: string, section: DawnwatchSection<{ readonly title?: string; readonly subject?: string; readonly id: string }>) => {
    if (section.status !== "available") return `${label}: ${section.status.replace("_", " ")}.`;
    const values = section.observations.map(item => item.title ?? item.subject ?? item.id);
    return `${label}: ${values.join(", ")}.`;
  };
  return [
    "Urgency summary: unsupported pending governance.",
    render("Priority observations", parts.priorities),
    render("Commitment observations", parts.commitments),
    render("Communication observations", parts.communications),
  ].join(" ");
}

/** Pure governed projection-to-presentation adapter. */
export function buildDawnwatchPresentation(
  input: DawnwatchPresentationInput,
  configuration: DawnwatchPresentationConfiguration,
): DawnwatchPresentation {
  validate(configuration);
  const sources = scopedSources(input, configuration);
  const makeSection = <T extends DawnwatchCanonicalReference, O>(
    items: readonly T[],
    hasSemanticFields: (item: T) => boolean,
    map: (item: T) => O,
  ): DawnwatchSection<O> => {
    const ordered = [...items].sort((a, b) => orderText(a.id, b.id));
    const status = evidenceStatus(ordered, sources, item => hasSemanticFields(item as T));
    return { status, availability: "supported", references: ordered.map(reference), sources, observations: ordered.map(map), evidence: evidence(status) };
  };
  const priorities = makeSection(input.priorities, item => Boolean(item.title), item => ({ id: item.id, title: item.title }));
  const commitments = makeSection(input.commitments, item => Boolean(item.title && (item.status === "scheduled" || item.status === "cancelled")), item => ({ id: item.id, title: item.title,
    ...(item.start ? { start: item.start } : {}), ...(item.end ? { end: item.end } : {}), status: item.status }));
  const communications = makeSection(input.communications,
    item => Boolean(item.sender && item.recipients.length && Number.isFinite(Date.parse(item.sentAt))), item => ({ id: item.id, sender: item.sender,
    recipients: [...item.recipients], sentAt: item.sentAt, ...(item.receivedAt ? { receivedAt: item.receivedAt } : {}),
    ...(item.subject ? { subject: item.subject } : {}), ...(item.replyToId ? { replyToId: item.replyToId } : {}) }));
  const urgency: DawnwatchSection<never> = { status: "unsupported", availability: "pending_governance", references: [], sources,
    observations: [], evidence: ["Urgency ownership and predicate remain pending governance."] };
  const statusRank: Record<DawnwatchSemanticStatus, number> = { available: 0, not_applicable: 1, insufficient_coverage: 2, unavailable: 3, unsupported: 4 };
  const overallStatus = [priorities.status, commitments.status, communications.status, urgency.status]
    .reduce((least, status) => statusRank[status] > statusRank[least] ? status : least, "available" as DawnwatchSemanticStatus);
  return Object.freeze({
    contractVersion: DAWNWATCH_PRESENTATION_CONTRACT_VERSION,
    configuration: Object.freeze({ ...configuration, sourceScope: Object.freeze([...configuration.sourceScope]) }),
    ruleVersions: { evidence: DAWNWATCH_EVIDENCE_RULE_VERSION, voice: DAWNWATCH_VOICE_RULE_VERSION }, overallStatus,
    priorities, commitments, communications, urgency, capabilities: capabilities.map(getDawnwatchCapabilityStatus),
    voice: renderVoice({ priorities, commitments, communications }),
  });
}
