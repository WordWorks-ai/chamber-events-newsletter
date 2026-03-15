import { extractBrandingFromHtml } from "@/lib/scraping/branding";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";
import { normalizeWhitespace } from "@/lib/utils/text";
import { rawScrapeResultSchema } from "@/lib/utils/validation";
import * as cheerio from "cheerio";

export const genericCalendarAdapter: ChamberScraperAdapter = {
  name: "generic-calendar-adapter",
  canHandle() {
    return true;
  },
  extractEvents(input: AdapterInput) {
    const $ = cheerio.load(input.html);
    const eventBlocks = $("article, li, .event-card, .calendar-item, [data-event]").toArray();

    return eventBlocks.flatMap((node) => {
      const element = $(node);
      const dateText = ["time", ".date", ".event-date", "[data-event-date]"].reduce<string>((value, selector) => {
        if (value) {
          return value;
        }

        const found = element.find(selector).first();
        return normalizeWhitespace(found.text()) || found.attr("datetime") || found.attr("data-date") || "";
      }, "");
      const title =
        normalizeWhitespace(
          element.find("h2, h3, h4, .event-title, [data-event-title]").first().text() || element.find("a").first().text()
        ) || "";

      if (!dateText || !title) {
        return [];
      }

      const sourceHref = element.find("a").first().attr("href");
      const parsed = rawScrapeResultSchema.safeParse({
        sourceUrl: new URL(sourceHref ?? input.url, input.url).toString(),
        title,
        description: normalizeWhitespace(
          element.find(".description, .summary, .event-description, p").first().text()
        ),
        startDate: dateText,
        endDate: null,
        timezone: input.chamber.defaultTimezone,
        locationName: normalizeWhitespace(
          element.find(".location, .event-location, [data-location]").first().text()
        ) || null,
        locationAddress: null,
        city: null,
        state: null,
        registrationUrl: sourceHref ? new URL(sourceHref, input.url).toString() : null,
        tags: element
          .find(".tag, .badge, .category")
          .map((_, tag) => normalizeWhitespace($(tag).text()))
          .get(),
        isAllDay: dateText.length <= 10,
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
