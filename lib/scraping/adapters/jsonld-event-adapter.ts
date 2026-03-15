import * as cheerio from "cheerio";

import { extractBrandingFromHtml } from "@/lib/scraping/branding";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";
import { rawScrapeResultSchema } from "@/lib/utils/validation";

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function collectEventNodes(node: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(node)) {
    return node.flatMap((entry) => collectEventNodes(entry));
  }

  if (!node || typeof node !== "object") {
    return [];
  }

  const record = node as Record<string, unknown>;
  const typeValue = record["@type"];
  const matchesType = Array.isArray(typeValue)
    ? typeValue.some((value) => value === "Event")
    : typeValue === "Event";

  const nested = Object.values(record).flatMap((value) => collectEventNodes(value));
  return matchesType ? [record, ...nested] : nested;
}

export const jsonLdEventAdapter: ChamberScraperAdapter = {
  name: "jsonld-event-adapter",
  canHandle(input: AdapterInput) {
    return input.html.includes("application/ld+json") && input.html.toLowerCase().includes("event");
  },
  extractEvents(input: AdapterInput) {
    const $ = cheerio.load(input.html);
    const payloads = $('script[type="application/ld+json"]')
      .map((_, element) => $(element).contents().text())
      .get();

    const events = payloads.flatMap((payload) => {
      try {
        return collectEventNodes(JSON.parse(payload));
      } catch {
        return [];
      }
    });

    return events.flatMap((event) => {
      const location = typeof event.location === "object" && event.location ? (event.location as Record<string, unknown>) : null;
      const address =
        location && typeof location.address === "object" && location.address ? (location.address as Record<string, unknown>) : null;
      const offers =
        typeof event.offers === "object" && event.offers ? (event.offers as Record<string, unknown>) : null;

      const parsed = rawScrapeResultSchema.safeParse({
        sourceUrl: asString(event.url) ?? input.url,
        title: asString(event.name) ?? "",
        description: asString(event.description) ?? "",
        startDate: asString(event.startDate) ?? "",
        endDate: asString(event.endDate),
        timezone: asString(event.eventAttendanceMode),
        locationName: asString(location?.name),
        locationAddress: asString(address?.streetAddress),
        city: asString(address?.addressLocality),
        state: asString(address?.addressRegion),
        registrationUrl: asString(offers?.url) ?? asString(event.url),
        tags: asString(event.keywords)?.split(",").map((value) => value.trim()) ?? [],
        isAllDay: Boolean(asString(event.startDate)?.length === 10),
        raw: event
      });

      return parsed.success ? [parsed.data] : [];
    });
  },
  extractBranding(input: AdapterInput) {
    return extractBrandingFromHtml(input.chamber, input.html, input.url);
  }
};
