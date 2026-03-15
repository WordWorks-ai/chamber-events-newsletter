import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { getScraperAdapterByName, listScraperAdapters, resolveScraperAdapter } from "@/lib/scraping/adapter-registry";
import { readChamberFixture } from "@/tests/helpers";

describe("adapter registry", () => {
  it("returns a named adapter when available", () => {
    expect(getScraperAdapterByName("jsonld-event-adapter").name).toBe("jsonld-event-adapter");
    expect(listScraperAdapters()).toHaveLength(4);
  });

  it("falls back to a detected adapter for fixture content", async () => {
    const html = await readChamberFixture("wordpress-delaware.html");
    const adapter = resolveScraperAdapter({
      chamber: { ...seededChambers[4], platformHint: null },
      html,
      url: seededChambers[4].eventsUrl
    });

    expect(adapter.name).toBe("wordpress-events-adapter");
  });

  it("falls back to the generic adapter for unknown names", async () => {
    const html = await readChamberFixture("generic-westerville.html");
    const adapter = resolveScraperAdapter({
      chamber: { ...seededChambers[3], platformHint: "missing-adapter" },
      html,
      url: seededChambers[3].eventsUrl
    });

    expect(adapter.name).toBe("generic-calendar-adapter");
  });

  it("falls back when a hinted adapter cannot actually handle the page", async () => {
    const html = await readChamberFixture("generic-westerville.html");
    const adapter = resolveScraperAdapter({
      chamber: { ...seededChambers[3], platformHint: "jsonld-event-adapter" },
      html,
      url: seededChambers[3].eventsUrl
    });

    expect(adapter.name).toBe("generic-calendar-adapter");
  });
});
