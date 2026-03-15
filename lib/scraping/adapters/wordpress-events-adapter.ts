import * as cheerio from "cheerio";

import { extractBrandingFromHtml } from "@/lib/scraping/branding";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";
import { normalizeWhitespace } from "@/lib/utils/text";
import { rawScrapeResultSchema } from "@/lib/utils/validation";

export const wordpressEventsAdapter: ChamberScraperAdapter = {
  name: "wordpress-events-adapter",
  canHandle(input: AdapterInput) {
    return input.html.toLowerCase().includes("tribe-events");
  },
  extractEvents(input: AdapterInput) {
    const $ = cheerio.load(input.html);
    const eventBlocks = $(".tribe-events-calendar-list__event-row, article.type-tribe_events").toArray();

    return eventBlocks.flatMap((node) => {
      const element = $(node);
      const titleLink =
        element.find(".tribe-events-calendar-list__event-title a, .tribe-events-list-event-title a, h3 a").first();
      const timeElement = element.find("time").first();
      const venue = element.find(".tribe-events-calendar-list__event-venue, .tribe-events-venue-details").first();

      const parsed = rawScrapeResultSchema.safeParse({
        sourceUrl: new URL(titleLink.attr("href") ?? input.url, input.url).toString(),
        title: normalizeWhitespace(titleLink.text()) || "",
        description: normalizeWhitespace(
          element.find(".tribe-events-calendar-list__event-description, .tribe-events-list-event-description, p").first().text()
        ),
        startDate: timeElement.attr("datetime") ?? normalizeWhitespace(timeElement.text()),
        endDate: null,
        timezone: input.chamber.defaultTimezone,
        locationName: normalizeWhitespace(venue.text()) || null,
        locationAddress: null,
        city: null,
        state: null,
        registrationUrl: new URL(titleLink.attr("href") ?? input.url, input.url).toString(),
        tags: [],
        isAllDay: Boolean(timeElement.attr("datetime")?.length === 10),
        raw: {
          html: $.html(node)
        }
      });

      return parsed.success ? [parsed.data] : [];
    });
  },
  extractBranding(input: AdapterInput) {
    return extractBrandingFromHtml(input.chamber, input.html, input.url);
  }
};
