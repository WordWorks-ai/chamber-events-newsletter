import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { dedupeNormalizedEvents, normalizeEvents } from "@/lib/scraping/normalize";
import type { RawScrapeResult } from "@/lib/utils/validation";

describe("normalizeEvents", () => {
  it("normalizes, deduplicates, and filters stale records", () => {
    const rawEvents: RawScrapeResult[] = [
      {
        sourceUrl: "https://columbus.org/events/1",
        title: "Breakfast Briefing",
        description: "<p>Regional update.</p>",
        startDate: "March 21, 2026 8:00 AM",
        endDate: null,
        timezone: "America/New_York",
        locationName: "Boardroom",
        locationAddress: "150 South Front Street",
        city: "Columbus",
        state: "OH",
        registrationUrl: "https://columbus.org/events/1/register",
        tags: ["Networking"],
        isAllDay: false
      },
      {
        sourceUrl: "https://columbus.org/events/1",
        title: "Breakfast Briefing",
        description: "<p>Regional update.</p>",
        startDate: "March 21, 2026 8:00 AM",
        endDate: null,
        timezone: "America/New_York",
        locationName: "Boardroom",
        locationAddress: "150 South Front Street",
        city: "Columbus",
        state: "OH",
        registrationUrl: "https://columbus.org/events/1/register",
        tags: ["Networking"],
        isAllDay: false
      },
      {
        sourceUrl: "https://columbus.org/events/stale",
        title: "Old Event",
        description: "Should be removed",
        startDate: "February 1, 2026 8:00 AM",
        endDate: null,
        timezone: "America/New_York",
        locationName: "Boardroom",
        locationAddress: null,
        city: "Columbus",
        state: "OH",
        registrationUrl: null,
        tags: [],
        isAllDay: false
      }
    ];

    const normalized = normalizeEvents(seededChambers[0], "jsonld-event-adapter", rawEvents, new Date("2026-03-14T12:00:00.000Z"));
    expect(normalized).toHaveLength(1);
    expect(normalized[0]?.description).toBe("Regional update.");
    expect(dedupeNormalizedEvents(normalized)).toHaveLength(1);
  });
});
