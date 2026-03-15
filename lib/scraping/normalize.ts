import { addHours } from "date-fns";

import { createStableHash } from "@/lib/utils/hashing";
import { isStaleEvent, parseInputDate, toIsoString } from "@/lib/utils/dates";
import { normalizeWhitespace, toSnippet } from "@/lib/utils/text";
import { normalizedEventSchema, type Chamber, type NormalizedEvent, type RawScrapeResult } from "@/lib/utils/validation";

function resolveUrl(candidate: string | null | undefined, baseUrl: string): string | null {
  if (!candidate) {
    return null;
  }

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return null;
  }
}

function canonicalLocation(raw: RawScrapeResult): string {
  return normalizeWhitespace(
    [raw.locationName, raw.locationAddress, raw.city, raw.state].filter(Boolean).join(" ")
  );
}

export function dedupeNormalizedEvents(events: NormalizedEvent[]): NormalizedEvent[] {
  const seen = new Set<string>();

  return events.filter((event) => {
    const dedupeKey = createStableHash(
      event.title,
      event.startAt,
      event.locationName ?? event.locationAddress ?? event.registrationUrl ?? ""
    );

    if (seen.has(dedupeKey)) {
      return false;
    }

    seen.add(dedupeKey);
    return true;
  });
}

export function normalizeEvents(
  chamber: Chamber,
  extractedFrom: string,
  rawEvents: RawScrapeResult[],
  now = new Date(),
  includeRaw = process.env.NODE_ENV !== "production"
): NormalizedEvent[] {
  const normalized = rawEvents.flatMap((raw) => {
    const startDate = parseInputDate(raw.startDate, raw.timezone ?? chamber.defaultTimezone);
    if (!startDate) {
      return [];
    }

    const endDate = raw.endDate ? parseInputDate(raw.endDate, raw.timezone ?? chamber.defaultTimezone) : null;
    const startAt = toIsoString(startDate);
    const endAt = endDate ? toIsoString(endDate) : null;

    if (isStaleEvent(startAt, endAt, now)) {
      return [];
    }

    const normalizedEvent = normalizedEventSchema.parse({
      id: createStableHash(chamber.id, raw.title, startAt, canonicalLocation(raw), raw.registrationUrl ?? raw.sourceUrl),
      chamberId: chamber.id,
      sourceUrl: resolveUrl(raw.sourceUrl, chamber.eventsUrl) ?? chamber.eventsUrl,
      title: normalizeWhitespace(raw.title),
      description: toSnippet(raw.description, 240),
      startAt,
      endAt,
      timezone: raw.timezone ?? chamber.defaultTimezone,
      locationName: raw.locationName ? normalizeWhitespace(raw.locationName) : null,
      locationAddress: raw.locationAddress ? normalizeWhitespace(raw.locationAddress) : null,
      city: raw.city ? normalizeWhitespace(raw.city) : null,
      state: raw.state ? normalizeWhitespace(raw.state) : null,
      registrationUrl: resolveUrl(raw.registrationUrl, chamber.eventsUrl),
      tags: Array.from(new Set(raw.tags.map((tag) => normalizeWhitespace(tag)).filter(Boolean))),
      isAllDay: raw.isAllDay || raw.startDate.length <= 10,
      extractedFrom,
      raw: includeRaw ? raw.raw : undefined
    });

    return [normalizedEvent];
  });

  return dedupeNormalizedEvents(normalized).sort((left, right) => {
    return new Date(left.startAt).getTime() - new Date(right.startAt).getTime();
  });
}

export function getCacheExpiry(now: Date, ttlHours = Number(process.env.SCRAPE_CACHE_TTL_HOURS ?? 6)): string {
  return addHours(now, ttlHours).toISOString();
}

export function shouldUseCache(
  cache: { expiresAt: string } | null,
  now: Date,
  forceRefresh: boolean
): boolean {
  if (forceRefresh || !cache) {
    return false;
  }

  return new Date(cache.expiresAt).getTime() > now.getTime();
}
