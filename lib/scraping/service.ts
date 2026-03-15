import { fetchHtml, type FetchHtmlOutput } from "@/lib/scraping/fetch-html";
import { getCacheExpiry, normalizeEvents, shouldUseCache } from "@/lib/scraping/normalize";
import { resolveScraperAdapter } from "@/lib/scraping/adapter-registry";
import type { ChamberRepository, ScrapeCacheEntry } from "@/lib/db/repositories";
import { fail, ok, type Result } from "@/lib/utils/result";
import type { BrandingAsset, Chamber, NormalizedEvent } from "@/lib/utils/validation";

export interface ScrapeDependencies {
  repository: ChamberRepository;
  fetchHtml?: typeof fetchHtml;
  now?: () => Date;
}

export interface ScrapeOutcome {
  chamber: Chamber;
  branding: BrandingAsset;
  events: NormalizedEvent[];
  cacheHit: boolean;
  cacheExpiresAt: string | null;
  sourceHash: string | null;
}

const CACHE_KEY = "newsletter-preview-v1";

function buildAllowedBases(chamber: Chamber): string[] {
  return [chamber.websiteUrl, chamber.eventsUrl];
}

function buildCacheEntry(
  chamberId: string,
  events: NormalizedEvent[],
  branding: BrandingAsset,
  fetchedPage: FetchHtmlOutput,
  now: Date
): ScrapeCacheEntry {
  return {
    chamberId,
    cacheKey: CACHE_KEY,
    normalizedEvents: events,
    branding,
    fetchedAt: now.toISOString(),
    expiresAt: getCacheExpiry(now),
    sourceHash: fetchedPage.sourceHash
  };
}

export async function scrapeChamberEvents(
  chamber: Chamber,
  forceRefresh: boolean,
  dependencies: ScrapeDependencies
): Promise<Result<ScrapeOutcome>> {
  const now = dependencies.now?.() ?? new Date();
  const cached = await dependencies.repository.getScrapeCache(chamber.id, CACHE_KEY);

  if (cached && shouldUseCache(cached, now, forceRefresh)) {
    return ok({
      chamber,
      branding: cached.branding,
      events: cached.normalizedEvents,
      cacheHit: true,
      cacheExpiresAt: cached.expiresAt,
      sourceHash: cached.sourceHash
    });
  }

  const fetchPage = dependencies.fetchHtml ?? fetchHtml;
  const pageResult = await fetchPage({
    url: chamber.eventsUrl,
    allowedBases: buildAllowedBases(chamber)
  });

  if (!pageResult.ok) {
    return pageResult;
  }

  const adapter = resolveScraperAdapter({
    chamber,
    html: pageResult.data.html,
    url: pageResult.data.finalUrl
  });

  const rawEvents = adapter.extractEvents({
    chamber,
    html: pageResult.data.html,
    url: pageResult.data.finalUrl
  });
  const branding =
    adapter.extractBranding({
      chamber,
      html: pageResult.data.html,
      url: pageResult.data.finalUrl
    }) ?? {
      logoUrl: null,
      faviconUrl: null,
      themeColor: null,
      siteName: chamber.name,
      sourceWebsiteUrl: chamber.websiteUrl,
      sourceEventsUrl: chamber.eventsUrl,
      extractedFrom: "fallback" as const
    };

  const events = normalizeEvents(chamber, adapter.name, rawEvents, now);
  const cacheEntry = buildCacheEntry(chamber.id, events, branding, pageResult.data, now);
  await dependencies.repository.upsertScrapeCache(cacheEntry);

  return ok({
    chamber,
    branding,
    events,
    cacheHit: false,
    cacheExpiresAt: cacheEntry.expiresAt,
    sourceHash: pageResult.data.sourceHash
  });
}

export async function getChamberOrError(repository: ChamberRepository, chamberId: string): Promise<Result<Chamber>> {
  const chamber = await repository.getChamberById(chamberId);
  if (!chamber) {
    return fail("CHAMBER_NOT_FOUND", "The selected chamber could not be found.", 404, {
      chamberId
    });
  }

  return ok(chamber);
}
