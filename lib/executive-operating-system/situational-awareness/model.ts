/** JSON-compatible date or instant, expressed as an ISO 8601 / RFC 3339 string. */
export type OperationalTimestamp = string;

export type OperationalRoleId = string;
export type OperationalProjectId = string;
export type OperationalCommitmentId = string;
export type OperationalWaitingItemId = string;
export type OperationalPriorityId = string;
export type OperationalWorkItemId = string;
export type OperationalSourceId = string;

export interface OperationalIdentity {
  readonly userId: string;
  readonly displayName: string;
  readonly preferredName?: string;
  readonly timezone?: string;
}

export type OperationalRoleStatus = "active" | "inactive";
export interface OperationalRole {
  readonly id: OperationalRoleId;
  readonly name: string;
  readonly status: OperationalRoleStatus;
  readonly organisation?: string;
}

export type OperationalProjectStatus =
  | "planned" | "active" | "blocked" | "paused" | "completed" | "cancelled";
export interface OperationalProject {
  readonly id: OperationalProjectId;
  readonly name: string;
  readonly status: OperationalProjectStatus;
  readonly roleIds: readonly OperationalRoleId[];
  readonly targetDate?: OperationalTimestamp;
}

export type OperationalCommitmentKind =
  | "meeting" | "deadline" | "deliverable" | "review" | "follow_up" | "other";
export type OperationalCommitmentStatus =
  | "scheduled" | "in_progress" | "completed" | "cancelled";
export interface OperationalCommitment {
  readonly id: OperationalCommitmentId;
  readonly title: string;
  readonly kind: OperationalCommitmentKind;
  readonly status: OperationalCommitmentStatus;
  readonly roleIds: readonly OperationalRoleId[];
  readonly projectIds: readonly OperationalProjectId[];
  readonly startsAt?: OperationalTimestamp;
  readonly dueAt?: OperationalTimestamp;
}

export type OperationalWaitingItemStatus = "waiting" | "resolved" | "cancelled";
export interface OperationalWaitingItem {
  readonly id: OperationalWaitingItemId;
  readonly title: string;
  readonly status: OperationalWaitingItemStatus;
  readonly roleIds: readonly OperationalRoleId[];
  readonly projectIds: readonly OperationalProjectId[];
  readonly waitingOn: string;
  readonly since?: OperationalTimestamp;
  readonly expectedBy?: OperationalTimestamp;
}

export type OperationalPriorityLevel = "high" | "medium" | "low";
export type OperationalPrioritySource = "user" | "authoritative_source";
export interface OperationalPriority {
  readonly id: OperationalPriorityId;
  readonly title: string;
  readonly level: OperationalPriorityLevel;
  readonly roleIds: readonly OperationalRoleId[];
  readonly projectIds: readonly OperationalProjectId[];
  readonly source: OperationalPrioritySource;
}

export type OperationalWorkStatus = "active" | "paused" | "blocked";
export interface OperationalWorkItem {
  readonly id: OperationalWorkItemId;
  readonly title: string;
  readonly status: OperationalWorkStatus;
  readonly roleIds: readonly OperationalRoleId[];
  readonly projectIds: readonly OperationalProjectId[];
  readonly startedAt?: OperationalTimestamp;
  readonly lastUpdatedAt?: OperationalTimestamp;
}

export type OperationalWorkMode =
  | "meeting" | "research" | "engineering" | "writing" | "personal" | "unknown";
export type OperationalLocationKind = "home" | "work" | "commuting" | "other" | "unknown";
export interface OperationalContext {
  readonly activeRoleId?: OperationalRoleId;
  readonly activeProjectId?: OperationalProjectId;
  readonly workMode: OperationalWorkMode;
  readonly locationKind: OperationalLocationKind;
}

export type OperationalSourceKind =
  | "configuration" | "calendar" | "email" | "github" | "drive" | "vercel" | "phdss" | "other";
export type OperationalSourceStatus = "available" | "unavailable" | "stale" | "not_configured";
export interface OperationalSourceState {
  readonly id: OperationalSourceId;
  readonly kind: OperationalSourceKind;
  readonly status: OperationalSourceStatus;
  readonly observedAt?: OperationalTimestamp;
}

export interface SituationalAwareness {
  readonly identity: OperationalIdentity;
  readonly roles: readonly OperationalRole[];
  readonly projects: readonly OperationalProject[];
  readonly commitments: readonly OperationalCommitment[];
  readonly waitingItems: readonly OperationalWaitingItem[];
  readonly priorities: readonly OperationalPriority[];
  readonly activeWork: readonly OperationalWorkItem[];
  readonly context: OperationalContext;
  readonly sources: readonly OperationalSourceState[];
}

export interface SituationalAwarenessInput {
  readonly identity: OperationalIdentity;
  readonly roles?: readonly OperationalRole[];
  readonly projects?: readonly OperationalProject[];
  readonly commitments?: readonly OperationalCommitment[];
  readonly waitingItems?: readonly OperationalWaitingItem[];
  readonly priorities?: readonly OperationalPriority[];
  readonly activeWork?: readonly OperationalWorkItem[];
  readonly context?: OperationalContext;
  readonly sources?: readonly OperationalSourceState[];
}

function required(value: unknown, path: string): asserts value is string {
  if (typeof value !== "string" || value.trim().length === 0) throw new Error(`${path} must be a non-empty string`);
}

function collection<T>(value: readonly T[] | undefined, path: string): readonly T[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`${path} must be an array`);
  return value;
}

function unique<T extends { readonly id: string }>(values: readonly T[], label: string): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (!value || typeof value !== "object") throw new Error(`${label}[${index}] must be an object`);
    required(value.id, `${label}[${index}].id`);
    if (seen.has(value.id)) throw new Error(`duplicate ${label} identifier: ${value.id}`);
    seen.add(value.id);
  }
}

function refs(ids: readonly string[], known: ReadonlySet<string>, path: string, kind: string): void {
  if (!Array.isArray(ids)) throw new Error(`${path} must be an array`);
  for (const id of ids) {
    required(id, `${path} reference`);
    if (!known.has(id)) throw new Error(`${path} references unknown ${kind}: ${id}`);
  }
}

function freezeRefs(ids: readonly string[]): readonly string[] { return Object.freeze([...ids]); }
function freezeEntity<T extends object>(value: T): Readonly<T> { return Object.freeze({ ...value }); }

/**
 * Validates, defensively copies and freezes already-supplied operational facts.
 * It does not gather source data, infer meaning or perform deliberation.
 */
export function createSituationalAwareness(input: SituationalAwarenessInput): SituationalAwareness {
  if (!input || typeof input !== "object" || !input.identity) throw new Error("identity is required");
  required(input.identity.userId, "identity.userId");
  required(input.identity.displayName, "identity.displayName");

  const roles = collection(input.roles, "roles");
  const projects = collection(input.projects, "projects");
  const commitments = collection(input.commitments, "commitments");
  const waitingItems = collection(input.waitingItems, "waitingItems");
  const priorities = collection(input.priorities, "priorities");
  const activeWork = collection(input.activeWork, "activeWork");
  const sources = collection(input.sources, "sources");
  unique(roles, "roles"); unique(projects, "projects"); unique(commitments, "commitments");
  unique(waitingItems, "waitingItems"); unique(priorities, "priorities"); unique(activeWork, "activeWork"); unique(sources, "sources");

  const roleIds = new Set(roles.map(({ id }) => id));
  const projectIds = new Set(projects.map(({ id }) => id));
  roles.forEach((role, i) => required(role.name, `roles[${i}].name`));
  projects.forEach((project, i) => { required(project.name, `projects[${i}].name`); refs(project.roleIds, roleIds, `projects[${i}].roleIds`, "role"); });
  const linked = [commitments, waitingItems, priorities, activeWork] as const;
  linked.forEach((items, group) => items.forEach((item, i) => {
    required(item.title, `${["commitments", "waitingItems", "priorities", "activeWork"][group]}[${i}].title`);
    refs(item.roleIds, roleIds, `${["commitments", "waitingItems", "priorities", "activeWork"][group]}[${i}].roleIds`, "role");
    refs(item.projectIds, projectIds, `${["commitments", "waitingItems", "priorities", "activeWork"][group]}[${i}].projectIds`, "project");
  }));
  waitingItems.forEach((item, i) => required(item.waitingOn, `waitingItems[${i}].waitingOn`));

  const context = input.context ?? { workMode: "unknown", locationKind: "unknown" };
  if (context.activeRoleId !== undefined && !roleIds.has(context.activeRoleId)) throw new Error(`context.activeRoleId references unknown role: ${context.activeRoleId}`);
  if (context.activeProjectId !== undefined && !projectIds.has(context.activeProjectId)) throw new Error(`context.activeProjectId references unknown project: ${context.activeProjectId}`);

  const freezeLinked = <T extends { readonly roleIds: readonly string[]; readonly projectIds: readonly string[] }>(item: T) =>
    Object.freeze({ ...item, roleIds: freezeRefs(item.roleIds), projectIds: freezeRefs(item.projectIds) });
  return Object.freeze({
    identity: freezeEntity(input.identity),
    roles: Object.freeze(roles.map(freezeEntity)),
    projects: Object.freeze(projects.map((item) => Object.freeze({ ...item, roleIds: freezeRefs(item.roleIds) }))),
    commitments: Object.freeze(commitments.map(freezeLinked)),
    waitingItems: Object.freeze(waitingItems.map(freezeLinked)),
    priorities: Object.freeze(priorities.map(freezeLinked)),
    activeWork: Object.freeze(activeWork.map(freezeLinked)),
    context: freezeEntity(context),
    sources: Object.freeze(sources.map(freezeEntity)),
  });
}
