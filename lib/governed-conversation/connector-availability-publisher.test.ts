import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import * as connectors from "../connectors";
import { publishConnectorAvailability, type ConnectorAvailabilityPublicationInput } from "./connector-availability-publisher";
vi.mock("../connectors", () => ({ getConnectorStatuses: vi.fn((overrides: ConnectorAvailabilityPublicationInput["overrides"]) => [
  { name: "calendar", source: overrides.calendarSource, connected: overrides.calendarConnected },
  { name: "gmail", source: overrides.gmailSource, connected: overrides.gmailConnected },
  { name: "drive", source: overrides.driveSource, connected: overrides.driveConnected },
]) }));
const input = (connected = true, source: "google" | "local" = "google"): ConnectorAvailabilityPublicationInput => ({ observedAt: "2026-01-02T03:04:05Z", overrides: { calendarConnected: connected, calendarSource: source, gmailConnected: connected, gmailSource: source, driveConnected: connected, driveSource: source } });
describe("Connector availability publisher", () => {
  it("uses explicit overrides and maps three connectors in fixed order", () => {
    const value = input(); const before = structuredClone(value); const result = publishConnectorAvailability(value); expect(connectors.getConnectorStatuses).toHaveBeenCalledWith(value.overrides);
    expect(result).toEqual(["calendar", "gmail", "drive"].map(connectorId => ({ connectorId, sourceId: "google", availability: "available", observedAt: value.observedAt, fallbackStatus: "none" })));
    expect(value).toEqual(before); expect(Object.isFrozen(result) && result.every(Object.isFrozen)).toBe(true); expect(publishConnectorAvailability(structuredClone(value))).toEqual(result); expect(result.every(x => !("policyReference" in x))).toBe(true);
  });
  it("maps Google failure and local compatibility to unavailable without a clock", () => {
    const clock = vi.spyOn(Date, "now"); for (const value of [input(false, "google"), input(false, "local")]) expect(publishConnectorAvailability(value).every(x => x.availability === "unavailable" && x.fallbackStatus === "unavailable")).toBe(true); expect(clock).not.toHaveBeenCalled(); clock.mockRestore();
  });
  it("fails closed for malformed time, local connected, and unsupported runtime status", () => {
    expect(publishConnectorAvailability({ ...input(), observedAt: "bad" })).toEqual([]); expect(publishConnectorAvailability(input(true, "local"))).toEqual([]);
    const spy = vi.spyOn(connectors, "getConnectorStatuses").mockReturnValue([{ name: "other", source: "other", connected: true }] as never); expect(publishConnectorAvailability(input())).toEqual([]); spy.mockRestore();
  });
});

const publisherNames = ["gmail-evidence-publisher", "calendar-evidence-publisher", "memory-priority-evidence-publisher", "connector-availability-publisher"];
const publisherFiles = publisherNames.map(name => `lib/governed-conversation/${name}.ts`);
const protectedHashes: Readonly<Record<string, string>> = {
  "app/api/chat/route.ts": "503840ffa6c17f52a049c1aaaad4e8402c000904dd3b7ce868104a10c6ba08a3",
  "lib/context-builder.ts": "8e689bf0880375ef2539c37cac8f8891669e66f4eb6ca72602fe97137438894d",
  "lib/useAgentConversation.ts": "55274931370b78e0ea6cf0fd144b4fba88400be0f9a14361682428846eea9c97",
  "lib/agents/chat-execution.ts": "da387b401acd4cc87609112e7b110451254af16bb33d8dd5224c4fb9aa210a88",
  "lib/governed-conversation/projection-composer.ts": "a3e2df360828c3756c19283d14b03b33134236e52cee2e37718d1990473ae47e",
};
const files = (root: string): string[] => readdirSync(root).flatMap(name => { const path = join(root, name); return statSync(path).isDirectory() ? files(path) : [path]; });
describe("pure-Node publisher isolation proof", () => {
  it("keeps publishers mutually independent and free of protected runtime dependencies", () => { for (const path of publisherFiles) { const source = readFileSync(path, "utf8"); for (const other of publisherNames.filter(name => !path.includes(name))) expect(source).not.toContain(other); for (const forbidden of ["app/api/chat", "context-builder", "useAgentConversation", "chat-execution", "composeGovernedConversationalProjection"]) expect(source).not.toContain(forbidden); } });
  it("has no hidden production import and retains every protected byte hash", () => {
    const candidates = [...files("app"), ...files("components"), ...files("lib")].filter(path => /\.tsx?$/.test(path) && !path.endsWith(".test.ts") && !publisherNames.some(name => path.includes(name)) && !path.endsWith("projection-composer.ts") && !path.includes("-acquisition-adapter") && !path.endsWith("source-evidence-assembly.ts"));
    for (const path of candidates) for (const name of publisherNames) expect(readFileSync(path, "utf8"), path).not.toContain(name);
    for (const [path, expected] of Object.entries(protectedHashes)) expect(createHash("sha256").update(readFileSync(path)).digest("hex"), path).toBe(expected);
  });
});
