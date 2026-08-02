import type { ConnectorSource } from "../connectors/types";
import { publishConnectorAvailability, type ConnectorAvailabilityOverrides } from "./connector-availability-publisher";
import type { GovernedConnectorAvailabilityInput } from "./projection-composer";
import { sourceResult, type SourceAdapterResult } from "./source-adapter-result";

export interface ConnectorLiveResult {
  readonly connectorId: "calendar" | "gmail" | "drive";
  readonly source: ConnectorSource;
  readonly connected: boolean;
}

export function acquireGovernedConnectorAvailability(input: {
  readonly observedAt: string;
  readonly results: readonly ConnectorLiveResult[];
}): SourceAdapterResult<GovernedConnectorAvailabilityInput> {
  const byId = new Map(input.results.map(result => [result.connectorId, result]));
  if (input.results.length !== 3 || byId.size !== 3 ||
      !["calendar", "gmail", "drive"].every(id => byId.has(id as ConnectorLiveResult["connectorId"]))) {
    throw new Error("exactly one live result per connector is required");
  }
  if (input.results.some(result => result.source === "local" && result.connected)) {
    throw new Error("a local connector cannot be governed as connected");
  }
  const calendar = byId.get("calendar")!;
  const gmail = byId.get("gmail")!;
  const drive = byId.get("drive")!;
  const overrides: ConnectorAvailabilityOverrides = {
    calendarConnected: calendar.connected, calendarSource: calendar.source,
    gmailConnected: gmail.connected, gmailSource: gmail.source,
    driveConnected: drive.connected, driveSource: drive.source,
  };
  const evidence = publishConnectorAvailability({ observedAt: input.observedAt, overrides });
  if (evidence.length !== 3) throw new Error("connector availability publication rejected acquisition input");
  return sourceResult("available", evidence, { observedAt: input.observedAt });
}
