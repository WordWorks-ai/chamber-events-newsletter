import { extractBrandingFromHtml } from "@/lib/scraping/branding";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";
import { normalizeWhitespace } from "@/lib/utils/text";
import { rawScrapeResultSchema } from "@/lib/utils/validation";
import * as cheerio from "cheerio";

/**
 * Parse a date from a GrowthZone calendar URL slug.
 * Slugs look like: /events/details/ambassador-club-meeting-03-04-2026-12525
 * We extract the MM-DD-YYYY portion from the end.
 */
function parseDateFromSlug(slug: string): string | null {
  const match = slug.match(/(\d{2})-(\d{2})-(\d{4})-\d+\/?$/);
  if (!match) return null;
  const [, month, day, year] = match;
  return `${year}-${month}-${day}`;
}

export const growthzoneFamilyAdapter: ChamberScraperAdapter = {
  name: "growthzone-family-adapter",
  canHandle(input: AdapterInput) {
    const lowerHtml = input.html.toLowerCase();
    const lowerUrl = input.url.toLowerCase();
    return (
      lowerUrl.includes("/events/calendar") ||
      lowerUrl.includes("growthzone") ||
      lowerHtml.includes("site by growthzone") ||
      lowerHtml.includes("gz-event-card") ||
      lowerHtml.includes("gz-cal-event")
    );
  },
  extractEvents(input: AdapterInput) {
    const $ = cheerio.load(input.html);

    // Try card-based selectors first
    const cardBlocks = $(".gz-event-card, .event-card, .card.event, article.event, li.event").toArray();

    // Also try calendar view selectors (li.gz-cal-event)
    const calendarBlocks = $("li.gz-cal-event").toArray();

    const eventBlocks = cardBlocks.length > 0 ? cardBlocks : calendarBlocks;
    const isCalendarView = cardBlocks.length === 0 && calendarBlocks.length > 0;

    return eventBlocks.flatMap((node) => {
      const element = $(node);

      let dateText: string;
      let title: string;
      let registrationUrl: string;

      if (isCalendarView) {
        // Calendar view: events are li.gz-cal-event with <a> tags
        const link = element.find("a").first();
        title = normalizeWhitespace(link.text()) || "";
        const href = link.attr("href") ?? "";
        registrationUrl = href || input.url;
        // Parse date from the URL slug
        dateText = parseDateFromSlug(href) ?? "";
      } else {
        // Card view: richer markup with time elements and structured fields
        const timeDate = element.find("time").first().attr("datetime");
        dateText = timeDate
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
        title =
          normalizeWhitespace(
            element.find("h2, h3, h4, .event-title, .gz-title, .card-title").first().text() ||
              element.find("a").first().text()
          ) || "";
        registrationUrl =
          element.find('a[href*="/events/details/"], a[href*="register"]').first().attr("href") ??
          element.find("a").first().attr("href") ??
          input.url;
      }

      if (!title || !dateText) return [];

      const parsed = rawScrapeResultSchema.safeParse({
        sourceUrl: new URL(registrationUrl, input.url).toString(),
        title,
        description: isCalendarView
          ? ""
          : normalizeWhitespace(
              element.find(".event-description, .description, .event-summary, p").first().text()
            ),
        startDate: dateText,
        endDate: null,
        timezone: input.chamber.defaultTimezone,
        locationName: isCalendarView
          ? null
          : normalizeWhitespace(
              element.find(".event-location, .location, [data-location]").first().text()
            ) || null,
        locationAddress: null,
        city: null,
        state: null,
        registrationUrl: new URL(registrationUrl, input.url).toString(),
        tags: isCalendarView
          ? []
          : element
              .find(".tag, .badge, .category")
              .map((_, tag) => normalizeWhitespace($(tag).text()))
              .get(),
        isAllDay: isCalendarView,
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
