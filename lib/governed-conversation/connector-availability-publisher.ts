import { getConnectorStatuses } from "../connectors";
import type { ConnectorSource } from "../connectors/types";
import type { GovernedConnectorAvailabilityInput } from "./projection-composer";

export interface ConnectorAvailabilityOverrides { readonly calendarConnected: boolean; readonly calendarSource: ConnectorSource; readonly gmailConnected: boolean; readonly gmailSource: ConnectorSource; readonly driveConnected: boolean; readonly driveSource: ConnectorSource }
export interface ConnectorAvailabilityPublicationInput { readonly observedAt: string; readonly overrides: ConnectorAvailabilityOverrides }
const validTimestamp = (value: string): boolean => typeof value === "string" && value.trim().length > 0 && Number.isFinite(Date.parse(value));
export function publishConnectorAvailability(input: ConnectorAvailabilityPublicationInput): readonly GovernedConnectorAvailabilityInput[] {
  if (!validTimestamp(input.observedAt)) return Object.freeze([]);
  const statuses = getConnectorStatuses(input.overrides);
  if (statuses.length !== 3 || statuses.some(status => !["calendar", "gmail", "drive"].includes(status.name) || !["google", "local"].includes(status.source) || status.source === "local" && status.connected)) return Object.freeze([]);
  return Object.freeze(statuses.map(status => Object.freeze({ connectorId: status.name, sourceId: status.source, availability: status.connected ? "available" as const : "unavailable" as const, observedAt: input.observedAt, fallbackStatus: status.connected ? "none" as const : "unavailable" as const })));
}
