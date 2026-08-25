import { describe, expect, it, vi } from "vitest";
import { resolveProductionCalendarRead } from "./production-calendar-read";

const event = { id: "event-1", title: "Review", start: "2026-08-26T09:00:00Z",
  end: "2026-08-26T10:00:00Z", day: "WED", time: "09:00", source: "google" as const,
  calendarId: "primary", calendarName: "Work" };

function dependencies() {
  const listUpcoming = vi.fn(async () => [event]);
  const createConnector = vi.fn(() => ({ source: "google" as const, listUpcoming }));
  return { value: { createConnector, clock: () => new Date("2026-08-25T00:00:00Z") }, createConnector, listUpcoming };
}

describe("production calendar.read authority ordering", () => {
  it("acquires through the governed seam after an explicit ALLOW", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "Show my calendar" }, deps.value);
    expect(result.decision).toBe("ALLOW");
    expect(result.evidence?.status).toBe("available");
    expect(deps.listUpcoming).toHaveBeenCalledWith(5);
  });

  it("creates pending server state for ASK without constructing or calling a connector", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "Regarding my calendar" }, deps.value);
    expect(result).toMatchObject({ decision: "ASK", evidence: null,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("resolves the exact pending operation before acquiring", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "Regarding my calendar" }, deps.value);
    const confirmed = await resolveProductionCalendarRead({ currentUserUtterance: "Yes, please.",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value);
    expect(confirmed).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(deps.listUpcoming).toHaveBeenCalledOnce();
  });

  it.each([
    ["bare yes", { currentUserUtterance: "yes" }],
    ["invalid reference", { currentUserUtterance: "yes", pendingAuthorizationReference: { pendingAuthorizationId: "invented" } }],
  ])("does zero acquisition for %s", async (_name, input) => {
    const deps = dependencies();
    expect((await resolveProductionCalendarRead(input, deps.value)).decision).toBe("ASK");
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("does zero acquisition after DENY", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "Regarding my calendar" }, deps.value);
    expect((await resolveProductionCalendarRead({ currentUserUtterance: "no",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value)).decision).toBe("DENY");
    expect(deps.createConnector).not.toHaveBeenCalled();
  });
});
