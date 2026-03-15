import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { growthzoneFamilyAdapter } from "@/lib/scraping/adapters/growthzone-family-adapter";
import { readChamberFixture } from "@/tests/helpers";

describe("growthzoneFamilyAdapter", () => {
  it("extracts growthzone event cards deterministically", async () => {
    const html = await readChamberFixture("growthzone-hilliard.html");
    const input = { chamber: seededChambers[1], html, url: seededChambers[1].eventsUrl };

    expect(growthzoneFamilyAdapter.canHandle(input)).toBe(true);

    const events = growthzoneFamilyAdapter.extractEvents(input);
    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("Coffee Connections");
    expect(events[1]?.sourceUrl).toContain("/events/details/legislative-breakfast-2026");
  });
});
