export { ProjectionEngine, createProjectionArtifact, projectArtifacts } from "./engine";
export { ProjectionRegistry } from "./registry";
export { CalendarProjectionAdapter, CALENDAR_PROJECTION_ADAPTER_ID } from "./adapters/calendar";
export { GmailProjectionAdapter, GMAIL_PROJECTION_ADAPTER_ID, normalizeGmailObservation } from "./adapters/gmail";
export type { GmailMessageObservation, GmailProjectionConnector, GmailProjectionOptions, NormalizedGmailObservation } from "./adapters/gmail";
export { OperationalCommunicationProjectionAdapter, OPERATIONAL_COMMUNICATION_PROJECTION_ADAPTER_ID } from "./adapters/operational-communication";
export type { OperationalCommunicationObservation, OperationalCommunicationProjectionOptions } from "./adapters/operational-communication";
export type { CalendarProjectionConnector, CalendarProjectionEvent, CalendarProjectionOptions } from "./adapters/calendar";
export type {
  ProjectionAdapter, ProjectionArtifact, ProjectionEntities, ProjectionValidationState, Provenance,
  SourceAvailability,
} from "./types";
