import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { extractBrandingFromHtml, isAllowedSameSiteUrl, toAbsoluteUrl } from "@/lib/scraping/branding";
import { readChamberFixture } from "@/tests/helpers";

describe("extractBrandingFromHtml", () => {
  it("prefers explicit chamber record values when present", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    const branding = extractBrandingFromHtml(
      {
        ...seededChambers[0],
        logoUrl: "https://columbus.org/assets/logo.svg",
        faviconUrl: "https://columbus.org/favicon.ico",
        themeColor: "#001122"
      },
      html,
      seededChambers[0].eventsUrl
    );

    expect(branding.logoUrl).toBe("https://columbus.org/assets/logo.svg");
    expect(branding.faviconUrl).toBe("https://columbus.org/favicon.ico");
    expect(branding.themeColor).toBe("#001122");
    expect(branding.extractedFrom).toBe("record");
  });

  it("falls back to metadata and heuristics", async () => {
    const html = await readChamberFixture("growthzone-hilliard.html");
    const branding = extractBrandingFromHtml(seededChambers[1], html, seededChambers[1].eventsUrl);

    expect(branding.logoUrl).toContain("data:image/svg+xml");
    expect(branding.themeColor).toBe("#164269");
    expect(branding.extractedFrom).toBe("meta");
  });

  it("only allows same-site or data URLs for branding assets", () => {
    expect(isAllowedSameSiteUrl("https://cdn.columbus.org/logo.svg", ["https://columbus.org/events/"])).toBe(true);
    expect(isAllowedSameSiteUrl("https://example.net/logo.svg", ["https://columbus.org/events/"])).toBe(false);
    expect(isAllowedSameSiteUrl("data:image/svg+xml;base64,PHN2Zy8+", ["https://columbus.org/events/"])).toBe(true);
    expect(isAllowedSameSiteUrl("mailto:test@example.com", ["https://columbus.org/events/"])).toBe(false);
    expect(isAllowedSameSiteUrl("notaurl", ["https://columbus.org/events/"])).toBe(false);
    expect(
      toAbsoluteUrl("/assets/logo.svg", "https://columbus.org/events/", ["https://columbus.org/events/"])
    ).toBe("https://columbus.org/assets/logo.svg");
    expect(toAbsoluteUrl("https://example.net/logo.svg", "https://columbus.org/events/", ["https://columbus.org/events/"])).toBeNull();
    expect(toAbsoluteUrl("http://[::1", "https://columbus.org/events/", ["https://columbus.org/events/"])).toBeNull();
  });
});
