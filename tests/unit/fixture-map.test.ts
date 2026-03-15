import { describe, expect, it } from "vitest";

import { readFixtureHtmlForUrl } from "@/lib/scraping/fixture-map";

describe("fixture map", () => {
  it("returns deterministic fixture HTML for known seeded URLs", async () => {
    const html = await readFixtureHtmlForUrl("https://columbus.org/events/");
    expect(html).toContain("Small Business Breakfast Briefing");
  });

  it("returns null for unknown URLs", async () => {
    expect(await readFixtureHtmlForUrl("https://example.com/unknown")).toBeNull();
  });
});
