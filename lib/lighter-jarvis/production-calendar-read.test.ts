import { describe, expect, it, vi } from "vitest";
import { resolveProductionCalendarRead } from "./production-calendar-read";

const event = { id: "event-1", title: "Review", start: "2026-08-26T09:00:00Z",
  end: "2026-08-26T10:00:00Z", day: "WED", time: "09:00", source: "google" as const,
  calendarId: "primary", calendarName: "Work" };

function dependencies() {
  const listUpcoming = vi.fn(async () => [event]);
  const listBetween = vi.fn(async () => [event]);
  const createConnector = vi.fn(() => ({ source: "google" as const, listUpcoming, listBetween }));
  return { value: { createConnector, clock: () => new Date("2026-08-25T00:00:00Z") }, createConnector, listUpcoming, listBetween };
}

describe("production calendar.read authority ordering", () => {
  it("acquires through the governed seam after an explicit ALLOW", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "Show my calendar" }, deps.value);
    expect(result.decision).toBe("ALLOW");
    expect(result.evidence?.status).toBe("available");
    expect(deps.listBetween).toHaveBeenCalledWith("2026-08-25T00:00:00.000Z", "2026-09-01T00:00:00.000Z", 5);
  });

  it("creates pending server state for ASK without constructing or calling a connector", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect(result).toMatchObject({ decision: "ASK", evidence: null,
      pendingAuthorizationReference: { pendingAuthorizationId: expect.any(String) } });
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("resolves the exact pending operation before acquiring", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    const confirmed = await resolveProductionCalendarRead({ currentUserUtterance: "Yes, please.",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value);
    expect(confirmed).toMatchObject({ decision: "ALLOW", reason: "pending_authorization_confirmed" });
    expect(confirmed.authorityEvidence).toEqual([expect.objectContaining({
      source: "pending_authorization_confirmation",
      pendingAuthorizationId: pending.pendingAuthorizationReference!.pendingAuthorizationId,
      utterance: "Yes, please.",
    })]);
    expect(deps.listBetween).toHaveBeenCalledOnce();
  });

  it("proposes an implicit temporal read but asks rather than acquiring", async () => {
    const deps = dependencies();
    const result = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect(result).toMatchObject({ decision: "ASK", authorityEvidence: [] });
    expect(deps.createConnector).not.toHaveBeenCalled();
  });

  it("retains and consumes the exact resolved temporal bounds after confirmation", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "What's on tomorrow?" }, deps.value);
    expect(pending.window).toMatchObject({
      start: "2026-08-25T14:00:00.000Z", end: "2026-08-26T14:00:00.000Z", period: "tomorrow",
    });
    await resolveProductionCalendarRead({ currentUserUtterance: "yes",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value);
    expect(deps.listBetween).toHaveBeenCalledWith(
      "2026-08-25T14:00:00.000Z", "2026-08-26T14:00:00.000Z", 5,
    );
  });

  it("leaves bare confirmation outside the Calendar authority flow", async () => {
    const deps = dependencies();
    expect(await resolveProductionCalendarRead({ currentUserUtterance: "yes" }, deps.value))
      .toMatchObject({ handled: false, decision: null });
    expect(deps.createConnector).not.toHaveBeenCalled();
  });

  it("does zero acquisition for an invalid reference", async () => {
    const deps = dependencies();
    expect((await resolveProductionCalendarRead({ currentUserUtterance: "yes",
      pendingAuthorizationReference: { pendingAuthorizationId: "invented" } }, deps.value)).decision).toBe("ASK");
    expect(deps.createConnector).not.toHaveBeenCalled();
    expect(deps.listUpcoming).not.toHaveBeenCalled();
  });

  it("does zero acquisition after DENY", async () => {
    const deps = dependencies();
    const pending = await resolveProductionCalendarRead({ currentUserUtterance: "How does tomorrow look?" }, deps.value);
    expect((await resolveProductionCalendarRead({ currentUserUtterance: "no",
      pendingAuthorizationReference: pending.pendingAuthorizationReference }, deps.value)).decision).toBe("DENY");
    expect(deps.createConnector).not.toHaveBeenCalled();
  });
});
