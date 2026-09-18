import { describe, expect, it, vi } from "vitest";
import { resolveGeelongTomorrowWeather, resolveVictorianTomorrowWeather } from "@/lib/lighter-jarvis/geelong-tomorrow-weather";

const NOW = new Date("2026-09-18T03:00:00Z");

function period(fields = "", attributes = 'start-time-local="2026-09-19T00:00:00+10:00" end-time-local="2026-09-20T00:00:00+10:00"') {
  return `<forecast-period index="91" ${attributes}>${fields || `
    <element type="air_temperature_minimum" units="Celsius">13</element>
    <element type="air_temperature_maximum" units="Celsius">24</element>
    <text type="precis">Sunny.</text>
    <text type="probability_of_precipitation">10%</text>`}
  </forecast-period>`;
}

function product(options: { areas?: string; issue?: string; expiry?: string; identifier?: string; declaration?: string } = {}) {
  return `<?xml version="1.0"?>${options.declaration ?? ""}<product><amoc>
    <identifier>${options.identifier ?? "IDV10753"}</identifier>
    <issue-time-utc>${options.issue ?? "2026-09-17T23:45:37Z"}</issue-time-utc>
    <expiry-time>${options.expiry ?? "2026-09-18T23:45:37Z"}</expiry-time>
  </amoc><forecast>${options.areas ?? `<area aac="VIC_PT025" description="Geelong" type="location">${period()}</area>`}</forecast></product>`;
}

function dependencies(xml: string, now = NOW) {
  return { fetchProduct: vi.fn(async () => xml), clock: () => now };
}

describe("Geelong tomorrow weather", () => {
  it("renders a date-bound forecast from the exact Geelong full-day period without trusting index", async () => {
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(product()));
    expect(result).toEqual(expect.objectContaining({ handled: true, status: "resolved" }));
    expect(result.reply).toBe("Tomorrow, Saturday 19 September, Geelong: Sunny. Minimum 13°C. Maximum 24°C. Chance of rain: 10%. Bureau of Meteorology forecast issued Friday 18 September at 9:45 am.");
  });

  it("renders the temperature-only form deterministically", async () => {
    const result = await resolveGeelongTomorrowWeather("What is the temperature in Geelong tomorrow?", dependencies(product()));
    expect(result.reply).toContain("minimum of 13°C and a maximum of 24°C");
    expect(result.reply).not.toContain("Sunny");
  });

  it("does not claim unproven utterance shapes", async () => {
    const fetchProduct = vi.fn(async () => product());
    expect(await resolveGeelongTomorrowWeather("What's the weather in Sydney tomorrow?", { fetchProduct, clock: () => NOW }))
      .toEqual({ handled: false });
    expect(fetchProduct).not.toHaveBeenCalled();
  });

  it("handles a 23-hour daylight-saving day by local boundaries", async () => {
    const areas = `<area aac="VIC_PT025" type="location">${period("", 'start-time-local="2026-10-04T00:00:00+10:00" end-time-local="2026-10-05T00:00:00+11:00"')}</area>`;
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(product({
      areas, issue: "2026-10-02T22:00:00Z", expiry: "2026-10-04T12:00:00Z",
    }), new Date("2026-10-03T02:00:00Z")));
    expect(result.status).toBe("resolved");
    expect(result.reply).toContain("Sunday 4 October");
  });

  it.each([
    ["future", { issue: "2026-09-18T04:00:00Z" }],
    ["expired", { expiry: "2026-09-18T03:00:00Z" }],
    ["wrong product", { identifier: "OTHER" }],
  ])("fails closed for a %s product", async (_label, options) => {
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(product(options)));
    expect(result.status).toBe("unavailable");
    expect(result.reply).toContain("couldn't retrieve a current date-bound");
  });

  it.each([
    ["zero locations", `<area aac="VIC_PT043" type="location">${period()}</area>`],
    ["multiple locations", `<area aac="VIC_PT025" type="location">${period()}</area><area aac="VIC_PT025" type="location">${period()}</area>`],
    ["zero full days", `<area aac="VIC_PT025" type="location">${period("", 'start-time-local="2026-09-19T10:00:00+10:00" end-time-local="2026-09-20T00:00:00+10:00"')}</area>`],
    ["multiple full days", `<area aac="VIC_PT025" type="location">${period()}${period()}</area>`],
  ])("fails closed for %s", async (_label, areas) => {
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(product({ areas })));
    expect(result.status).toBe("unavailable");
  });

  it("reports each unavailable field without borrowing adjacent data", async () => {
    const fields = `<element type="air_temperature_maximum" units="Celsius">24</element><text type="precis">Sunny.</text>`;
    const adjacent = period(undefined, 'start-time-local="2026-09-20T00:00:00+10:00" end-time-local="2026-09-21T00:00:00+10:00"');
    const areas = `<area aac="VIC_PT025" type="location">${period(fields)}${adjacent}</area>`;
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(product({ areas })));
    expect(result.reply).toContain("Minimum temperature unavailable.");
    expect(result.reply).toContain("Maximum 24°C.");
    expect(result.reply).toContain("Chance of rain unavailable.");
    expect(result.reply).not.toContain("13°C");
  });

  it("rejects malformed XML and entity declarations", async () => {
    for (const xml of ["<product>", product({ declaration: '<!DOCTYPE product [<!ENTITY x SYSTEM "file:///etc/passwd">]>' })]) {
      const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", dependencies(xml));
      expect(result.status).toBe("unavailable");
    }
  });

  it("fails closed on transport errors", async () => {
    const result = await resolveGeelongTomorrowWeather("What's the weather in Geelong tomorrow?", {
      fetchProduct: vi.fn(async () => { throw new Error("ftp unavailable"); }), clock: () => NOW,
    });
    expect(result).toEqual(expect.objectContaining({ handled: true, status: "unavailable", diagnostic: "ftp unavailable" }));
  });
});

describe("Melbourne tomorrow weather", () => {
  const melbournePeriod = period(`
    <element type="air_temperature_minimum" units="Celsius">13</element>
    <element type="air_temperature_maximum" units="Celsius">25</element>
    <text type="precis">Sunny.</text>
    <text type="probability_of_precipitation">10%</text>`);

  it("binds Melbourne to VIC_PT042 and renders its independently admitted fields", async () => {
    const partialCurrentDay = period(`
      <element type="air_temperature_maximum" units="Celsius">99</element>
      <text type="precis">Misleading current period.</text>
      <text type="probability_of_precipitation">99%</text>`,
    'start-time-local="2026-09-18T10:00:00+10:00" end-time-local="2026-09-19T00:00:00+10:00"');
    const areas = `<area aac="VIC_PT025" description="Geelong" type="location">${period()}</area>
      <area aac="VIC_PT042" description="Melbourne" type="location">${partialCurrentDay}${melbournePeriod}</area>`;
    const result = await resolveVictorianTomorrowWeather("What's the weather in Melbourne tomorrow?", dependencies(product({ areas })));
    expect(result).toEqual(expect.objectContaining({ handled: true, status: "resolved", locationKey: "melbourne" }));
    expect(result.reply).toBe("Tomorrow, Saturday 19 September, Melbourne: Sunny. Minimum 13°C. Maximum 25°C. Chance of rain: 10%. Bureau of Meteorology forecast issued Friday 18 September at 9:45 am.");
    expect(result.reply).not.toContain("24°C");
    expect(result.reply).not.toContain("99");
  });

  it("renders the Melbourne temperature-only form without model-written conditions", async () => {
    const areas = `<area aac="VIC_PT042" type="location">${melbournePeriod}</area>`;
    const result = await resolveVictorianTomorrowWeather("What is the temperature in Melbourne tomorrow?", dependencies(product({ areas })));
    expect(result.reply).toBe("Tomorrow, Saturday 19 September, Melbourne has a minimum of 13°C and a maximum of 25°C. Bureau of Meteorology forecast issued Friday 18 September at 9:45 am.");
  });

  it.each([
    ["metropolitan aggregate", `<area aac="VIC_ME001" description="Melbourne" type="metropolitan">${melbournePeriod}</area>`],
    ["display-name-only location", `<area aac="VIC_PT999" description="Melbourne" type="location">${melbournePeriod}</area>`],
    ["wrong type with the right identifier", `<area aac="VIC_PT042" description="Melbourne" type="metropolitan">${melbournePeriod}</area>`],
    ["duplicate exact location", `<area aac="VIC_PT042" type="location">${melbournePeriod}</area><area aac="VIC_PT042" type="location">${melbournePeriod}</area>`],
  ])("rejects a %s", async (_label, areas) => {
    const result = await resolveVictorianTomorrowWeather("What's the weather in Melbourne tomorrow?", dependencies(product({ areas })));
    expect(result).toEqual(expect.objectContaining({ handled: true, status: "unavailable", locationKey: "melbourne" }));
  });

  it("does not widen the deterministic route to Sydney", async () => {
    const fetchProduct = vi.fn(async () => product());
    expect(await resolveVictorianTomorrowWeather("What's the weather in Sydney tomorrow?", { fetchProduct, clock: () => NOW }))
      .toEqual({ handled: false });
    expect(fetchProduct).not.toHaveBeenCalled();
  });

  it("selects Melbourne tomorrow across a 23-hour daylight-saving boundary", async () => {
    const dstPeriod = period(`
      <element type="air_temperature_minimum" units="Celsius">9</element>
      <element type="air_temperature_maximum" units="Celsius">20</element>
      <text type="precis">Partly cloudy.</text>
      <text type="probability_of_precipitation">20%</text>`,
    'start-time-local="2026-10-04T00:00:00+10:00" end-time-local="2026-10-05T00:00:00+11:00"');
    const areas = `<area aac="VIC_PT042" type="location">${dstPeriod}</area>`;
    const result = await resolveVictorianTomorrowWeather("What's the weather in Melbourne tomorrow?", dependencies(product({
      areas, issue: "2026-10-02T22:00:00Z", expiry: "2026-10-04T12:00:00Z",
    }), new Date("2026-10-03T02:00:00Z")));
    expect(result.status).toBe("resolved");
    expect(result.reply).toContain("Sunday 4 October, Melbourne");
  });

  it("does not borrow a missing Melbourne field from an adjacent period", async () => {
    const selected = period(`<element type="air_temperature_maximum" units="Celsius">25</element>
      <text type="precis">Sunny.</text><text type="probability_of_precipitation">10%</text>`);
    const adjacent = period(`
      <element type="air_temperature_minimum" units="Celsius">88</element>
      <element type="air_temperature_maximum" units="Celsius">30</element>
      <text type="precis">Cloudy.</text><text type="probability_of_precipitation">90%</text>`,
    'start-time-local="2026-09-20T00:00:00+10:00" end-time-local="2026-09-21T00:00:00+10:00"');
    const areas = `<area aac="VIC_PT042" type="location">${selected}${adjacent}</area>`;
    const result = await resolveVictorianTomorrowWeather("What's the weather in Melbourne tomorrow?", dependencies(product({ areas })));
    expect(result.reply).toContain("Minimum temperature unavailable.");
    expect(result.reply).not.toContain("88°C");
  });
});
