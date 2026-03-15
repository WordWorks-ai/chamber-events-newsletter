import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { detectPlatform } from "@/lib/scraping/detect-platform";
import { readChamberFixture } from "@/tests/helpers";

describe("detectPlatform", () => {
  it("prefers an explicit platform hint", async () => {
    const html = await readChamberFixture("generic-westerville.html");
    expect(detectPlatform(seededChambers[0], html, seededChambers[0].eventsUrl)).toBe("jsonld-event-adapter");
  });

  it("detects json-ld event pages", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    expect(detectPlatform({ ...seededChambers[0], platformHint: null }, html, seededChambers[0].eventsUrl)).toBe(
      "jsonld-event-adapter"
    );
  });

  it("detects growthzone pages", async () => {
    const html = await readChamberFixture("growthzone-hilliard.html");
    expect(detectPlatform({ ...seededChambers[1], platformHint: null }, html, seededChambers[1].eventsUrl)).toBe(
      "growthzone-family-adapter"
    );
  });

  it("detects wordpress events pages", async () => {
    const html = await readChamberFixture("wordpress-delaware.html");
    expect(detectPlatform({ ...seededChambers[4], platformHint: null }, html, seededChambers[4].eventsUrl)).toBe(
      "wordpress-events-adapter"
    );
  });
});
