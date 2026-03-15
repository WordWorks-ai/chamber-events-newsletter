import { extractBrandingFromHtml } from "@/lib/scraping/branding";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";
import { normalizeWhitespace } from "@/lib/utils/text";
import { rawScrapeResultSchema } from "@/lib/utils/validation";
import * as cheerio from "cheerio";

export const growthzoneFamilyAdapter: ChamberScraperAdapter = {
  name: "growthzone-family-adapter",
  canHandle(input: AdapterInput) {
    const lowerHtml = input.html.toLowerCase();
    const lowerUrl = input.url.toLowerCase();
    return (
      lowerUrl.includes("/events/calendar") ||
      lowerUrl.includes("growthzone") ||
      lowerHtml.includes("site by growthzone") ||
      lowerHtml.includes("gz-event-card")
    );
  },
  extractEvents(input: AdapterInput) {
    const $ = cheerio.load(input.html);
    const eventBlocks = $(".gz-event-card, .event-card, .card.event, article.event, li.event").toArray();

    return eventBlocks.flatMap((node) => {
      const element = $(node);
      const timeDate = element.find("time").first().attr("datetime");
      const dateText = timeDate
        ? timeDate
        : normalizeWhitespace(
            `${element.find(".gz-date, .event-date, .date").first().text() || element
              .find("[data-event-date]")
              .first()
              .attr("data-event-date") || ""} ${
              element.find(".gz-time, .event-time, .time").first().text() || element
                .find("[data-event-time]")
                .first()
                .attr("data-event-time") || ""
            }`
          );
      const registrationUrl =
        element.find('a[href*="/events/details/"], a[href*="register"]').first().attr("href") ??
        element.find("a").first().attr("href") ??
        input.url;

      const parsed = rawScrapeResultSchema.safeParse({
        sourceUrl: new URL(registrationUrl, input.url).toString(),
        title:
          normalizeWhitespace(
            element.find("h2, h3, h4, .event-title, .gz-title, .card-title").first().text() ||
              element.find("a").first().text()
          ) || "",
        description: normalizeWhitespace(
          element.find(".event-description, .description, .event-summary, p").first().text()
        ),
        startDate: dateText,
        endDate: null,
        timezone: input.chamber.defaultTimezone,
        locationName: normalizeWhitespace(
          element.find(".event-location, .location, [data-location]").first().text()
        ) || null,
        locationAddress: null,
        city: null,
        state: null,
        registrationUrl: new URL(registrationUrl, input.url).toString(),
        tags: element
          .find(".tag, .badge, .category")
          .map((_, tag) => normalizeWhitespace($(tag).text()))
          .get(),
        isAllDay: false,
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
