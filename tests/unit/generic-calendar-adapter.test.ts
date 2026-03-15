import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { genericCalendarAdapter } from "@/lib/scraping/adapters/generic-calendar-adapter";
import { readChamberFixture } from "@/tests/helpers";

describe("genericCalendarAdapter", () => {
  it("extracts generic event cards with dates, locations, and links", async () => {
    const html = await readChamberFixture("generic-westerville.html");
    const input = { chamber: seededChambers[3], html, url: seededChambers[3].eventsUrl };

    const events = genericCalendarAdapter.extractEvents(input);
    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("Business After Hours");
    expect(events[1]?.locationName).toBe("Westerville Community Center");
  });
});
