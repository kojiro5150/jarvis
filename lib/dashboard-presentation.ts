type OperationalSourceKind = "configuration" | "calendar" | "email" | "github" | "drive" | "vercel" | "phdss" | "other";
type OperationalSourceStatus = "available" | "unavailable" | "stale" | "not_configured";

/** Read-only application port containing only the governed canonical leaves used here. */
export interface DashboardCanonicalSource {
  readonly state: {
    readonly priorities: readonly { readonly id: string; readonly title: string }[];
    readonly projects: readonly { readonly id: string; readonly name: string }[];
    readonly commitments: readonly { readonly id: string; readonly title: string; readonly startsAt?: string; readonly dueAt?: string; readonly status: string }[];
    readonly communications: readonly { readonly id: string; readonly sender: string; readonly subject?: string; readonly sentAt: string; readonly receivedAt?: string }[];
    readonly sources: readonly { readonly id: string; readonly kind: OperationalSourceKind; readonly status: OperationalSourceStatus }[];
  };
  readonly artifacts: readonly { readonly artifact: {
    readonly entities: {
      readonly commitments?: readonly { readonly id: string }[];
      readonly communications?: readonly { readonly id: string }[];
    };
    readonly provenance: { readonly adapterId: string };
  } }[];
}

export const DASHBOARD_PRESENTATION_CONTRACT_VERSION = "dashboard-presentation-v1" as const;
export const DASHBOARD_DERIVATION_RULE_VERSION = "1.0.0" as const;
export const DASHBOARD_FORMATTING_RULE_VERSION = "1.0.0" as const;
export const DASHBOARD_ORDERING_RULE_VERSION = "1.0.0" as const;

/** Every value affecting replay is explicit; Intl and the system clock supply no defaults. */
export interface DashboardPresentationConfiguration {
  readonly locale: "en-AU";
  readonly viewerTimeZone: "Australia/Melbourne";
  readonly referenceTime: string;
  readonly sourceScope: readonly OperationalSourceKind[];
}

export const DEFAULT_DASHBOARD_PRESENTATION_CONFIGURATION = Object.freeze({
  locale: "en-AU",
  viewerTimeZone: "Australia/Melbourne",
  sourceScope: ["calendar", "email", "drive"] as const,
});

export interface DashboardPresentation {
  readonly contractVersion: typeof DASHBOARD_PRESENTATION_CONTRACT_VERSION;
  readonly configuration: DashboardPresentationConfiguration;
  readonly ruleVersions: {
    readonly derivation: typeof DASHBOARD_DERIVATION_RULE_VERSION;
    readonly formatting: typeof DASHBOARD_FORMATTING_RULE_VERSION;
    readonly ordering: typeof DASHBOARD_ORDERING_RULE_VERSION;
  };
  readonly priorities: readonly { readonly id: string; readonly title: string }[];
  readonly projects: readonly { readonly id: string; readonly name: string }[];
  readonly calendar: readonly {
    readonly id: string;
    readonly title: string;
    readonly startsAt?: string;
    readonly dueAt?: string;
    readonly status: "scheduled" | "cancelled";
    readonly day?: string;
    readonly time?: string;
    readonly source: "google" | null;
  }[];
  readonly nextCommitment: DashboardPresentation["calendar"][number] | null;
  readonly followingCommitments: readonly DashboardPresentation["calendar"][number][];
  readonly communications: readonly {
    readonly id: string;
    readonly subject?: string;
    readonly sender: string;
    readonly observedAt?: string;
    readonly relativeObservedAt?: string;
    readonly source: "google" | null;
  }[];
  readonly needsReply: readonly [];
  readonly urgentCommunications: readonly [];
  readonly sources: readonly {
    readonly id: string;
    readonly kind: OperationalSourceKind;
    readonly status: OperationalSourceStatus;
    readonly connected: boolean;
  }[];
  readonly connectorSummary: { readonly live: number; readonly total: number; readonly allLive: boolean };
  readonly systemReading: "ATTENTION REQUIRED" | "NOMINAL" | "LOCAL MODE";
  readonly specialistBadges: Readonly<Record<string, number>>;
}

const textOrder = (left: string, right: string) => left < right ? -1 : left > right ? 1 : 0;
const BARE_DATE = /^\d{4}-\d{2}-\d{2}$/;

function validReferenceTime(value: string): void {
  if (!value || !Number.isFinite(Date.parse(value))) throw new Error("referenceTime must be an RFC 3339 instant");
}

function formatCommitmentTime(value: string, config: DashboardPresentationConfiguration): { day: string; time: string } {
  if (BARE_DATE.test(value)) {
    const date = new Date(`${value}T12:00:00Z`);
    return {
      day: new Intl.DateTimeFormat(config.locale, { weekday: "short", timeZone: "UTC" }).format(date).toUpperCase(),
      time: "All day",
    };
  }
  if (!Number.isFinite(Date.parse(value))) throw new Error(`commitment startsAt is not a supported temporal value: ${value}`);
  const date = new Date(value);
  return {
    day: new Intl.DateTimeFormat(config.locale, { weekday: "short", timeZone: config.viewerTimeZone }).format(date).toUpperCase(),
    time: new Intl.DateTimeFormat(config.locale, {
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone: config.viewerTimeZone,
    }).format(date),
  };
}

/** v1 thresholds: future values are omitted; <60s just now; then floor whole minutes, hours, and days. */
export function formatDashboardRelativeTime(observedAt: string, config: DashboardPresentationConfiguration): string | undefined {
  validReferenceTime(config.referenceTime);
  const elapsed = Date.parse(config.referenceTime) - Date.parse(observedAt);
  if (!Number.isFinite(elapsed) || elapsed < 0) return undefined;
  if (elapsed < 60_000) return "just now";
  if (elapsed < 3_600_000) { const n = Math.floor(elapsed / 60_000); return `${n} min${n === 1 ? "" : "s"} ago`; }
  if (elapsed < 86_400_000) { const n = Math.floor(elapsed / 3_600_000); return `${n} hour${n === 1 ? "" : "s"} ago`; }
  const n = Math.floor(elapsed / 86_400_000); return `${n} day${n === 1 ? "" : "s"} ago`;
}

/** Pure governed COS -> DDP adapter. Conditional derivations remain empty while their inputs are deferred. */
export function buildDashboardPresentation(
  snapshot: DashboardCanonicalSource,
  configuration: DashboardPresentationConfiguration,
): DashboardPresentation {
  validReferenceTime(configuration.referenceTime);
  if (!configuration.sourceScope.length) throw new Error("sourceScope must be explicit and non-empty");
  const sourceKinds = new Set(configuration.sourceScope);
  const scopedSources = snapshot.state.sources.filter(source => sourceKinds.has(source.kind))
    .sort((a, b) => textOrder(a.id, b.id));
  // Provider predicates come from the artifact's governed provenance and
  // explicit entity membership, never from an opaque canonical identifier.
  const googleCalendarIds = new Set(snapshot.artifacts
    .filter(({ artifact }) => artifact.provenance.adapterId === "google-calendar")
    .flatMap(({ artifact }) => artifact.entities.commitments?.map(({ id }) => id) ?? []));
  const googleCommunicationIds = new Set(snapshot.artifacts
    .filter(({ artifact }) => artifact.provenance.adapterId === "google.gmail.operational-communication")
    .flatMap(({ artifact }) => artifact.entities.communications?.map(({ id }) => id) ?? []));

  const calendar = snapshot.state.commitments
    .filter(item => item.status === "scheduled" || item.status === "cancelled")
    .sort((a, b) => textOrder(a.startsAt ?? "\uffff", b.startsAt ?? "\uffff") || textOrder(a.id, b.id))
    .map(item => {
      const formatted = item.startsAt ? formatCommitmentTime(item.startsAt, configuration) : undefined;
      return { id: item.id, title: item.title, ...(item.startsAt ? { startsAt: item.startsAt } : {}),
        ...(item.dueAt ? { dueAt: item.dueAt } : {}), status: item.status as "scheduled" | "cancelled",
        ...(formatted ?? {}), source: googleCalendarIds.has(item.id) ? "google" as const : null };
    });
  const eligible = calendar.filter(item => item.status !== "cancelled" && item.startsAt !== undefined);
  const communications = snapshot.state.communications.map(item => {
    const observedAt = item.receivedAt;
    return { id: item.id, ...(item.subject ? { subject: item.subject } : {}), sender: item.sender,
      ...(observedAt ? { observedAt, relativeObservedAt: formatDashboardRelativeTime(observedAt, configuration) } : {}),
      source: googleCommunicationIds.has(item.id) ? "google" as const : null };
  }).sort((a, b) => textOrder(b.observedAt ?? "", a.observedAt ?? "") || textOrder(a.id, b.id));
  const live = scopedSources.filter(source => source.status === "available").length;

  return Object.freeze({
    contractVersion: DASHBOARD_PRESENTATION_CONTRACT_VERSION,
    configuration: Object.freeze({ ...configuration, sourceScope: Object.freeze([...configuration.sourceScope]) }),
    ruleVersions: { derivation: DASHBOARD_DERIVATION_RULE_VERSION, formatting: DASHBOARD_FORMATTING_RULE_VERSION, ordering: DASHBOARD_ORDERING_RULE_VERSION },
    priorities: snapshot.state.priorities.map(({ id, title }) => ({ id, title })).sort((a, b) => textOrder(a.id, b.id)),
    projects: snapshot.state.projects.map(({ id, name }) => ({ id, name })).sort((a, b) => textOrder(a.id, b.id)),
    calendar, nextCommitment: eligible[0] ?? null, followingCommitments: eligible.slice(1, 3), communications,
    needsReply: [] as const, urgentCommunications: [] as const,
    sources: scopedSources.map(({ id, kind, status }) => ({ id, kind, status, connected: status === "available" })),
    connectorSummary: { live, total: scopedSources.length, allLive: scopedSources.length > 0 && live === scopedSources.length },
    systemReading: scopedSources.some(source => source.status === "stale")
      ? "ATTENTION REQUIRED"
      : live > 0 ? "NOMINAL" : "LOCAL MODE",
    specialistBadges: Object.freeze({ jarvis: 0, dawnwatch: 0, oracle: 0, gecko: 0, herald: 0, steve: 0, cowork: 0, phdss: 0, marcus: 0 }),
  });
}
