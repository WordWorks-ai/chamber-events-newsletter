import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { jsonLdEventAdapter } from "@/lib/scraping/adapters/jsonld-event-adapter";
import { readChamberFixture } from "@/tests/helpers";

describe("jsonLdEventAdapter", () => {
  it("extracts events and branding from schema.org JSON-LD", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    const input = { chamber: seededChambers[0], html, url: seededChambers[0].eventsUrl };

    expect(jsonLdEventAdapter.canHandle(input)).toBe(true);

    const events = jsonLdEventAdapter.extractEvents(input);
    const branding = jsonLdEventAdapter.extractBranding(input);

    expect(events).toHaveLength(2);
    expect(events[0]?.title).toBe("Small Business Breakfast Briefing");
    expect(events[1]?.registrationUrl).toContain("/register");
    expect(branding?.themeColor).toBe("#113456");
    expect(branding?.logoUrl).toContain("data:image/svg+xml");
  });
});
