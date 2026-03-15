import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { wordpressEventsAdapter } from "@/lib/scraping/adapters/wordpress-events-adapter";
import { readChamberFixture } from "@/tests/helpers";

describe("wordpressEventsAdapter", () => {
  it("extracts events from The Events Calendar markup", async () => {
    const html = await readChamberFixture("wordpress-delaware.html");
    const input = { chamber: seededChambers[4], html, url: seededChambers[4].eventsUrl };

    expect(wordpressEventsAdapter.canHandle(input)).toBe(true);

    const events = wordpressEventsAdapter.extractEvents(input);
    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("Chamber Lunch & Learn");
    expect(events[1]?.sourceUrl).toContain("leadership-breakfast");
  });
});
