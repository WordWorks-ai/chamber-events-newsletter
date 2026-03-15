import { describe, expect, it, vi } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { getChamberOrError, scrapeChamberEvents } from "@/lib/scraping/service";
import { ok } from "@/lib/utils/result";
import { makeBranding, makeNormalizedEvents, readChamberFixture } from "@/tests/helpers";
import type { ChamberRepository } from "@/lib/db/repositories";

function createRepository(overrides: Partial<ChamberRepository> = {}): ChamberRepository {
  return {
    kind: "memory",
    listActiveChambers: vi.fn().mockResolvedValue(seededChambers),
    getChamberById: vi.fn().mockImplementation(async (id: string) => seededChambers.find((chamber) => chamber.id === id) ?? null),
    getScrapeCache: vi.fn().mockResolvedValue(null),
    upsertScrapeCache: vi.fn().mockResolvedValue(undefined),
    insertNewsletterRun: vi.fn().mockResolvedValue("911f9242-a4c8-4748-9d7b-b638e3d60f5d"),
    ...overrides
  };
}

describe("scrape service", () => {
  it("returns a structured not-found error for unknown chambers", async () => {
    const result = await getChamberOrError(createRepository(), "9e10d823-d3c0-49d7-a8fe-fd36b2fcbef0");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("CHAMBER_NOT_FOUND");
    }
  });

  it("uses a fresh cache entry without re-fetching", async () => {
    const repository = createRepository({
      getScrapeCache: vi.fn().mockResolvedValue({
        chamberId: seededChambers[0].id,
        cacheKey: "newsletter-preview-v1",
        normalizedEvents: makeNormalizedEvents(),
        branding: makeBranding(),
        fetchedAt: "2026-03-14T09:00:00.000Z",
        expiresAt: "2026-03-14T18:00:00.000Z",
        sourceHash: "cached"
      })
    });
    const fetchHtml = vi.fn();

    const result = await scrapeChamberEvents(seededChambers[0], false, {
      repository,
      fetchHtml,
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.cacheHit).toBe(true);
      expect(result.data.events).toHaveLength(2);
    }
    expect(fetchHtml).not.toHaveBeenCalled();
  });

  it("fetches, normalizes, and caches when data is stale or missing", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    const repository = createRepository();
    const fetchHtml = vi.fn().mockResolvedValue(
      ok({
        html,
        finalUrl: seededChambers[0].eventsUrl,
        contentType: "text/html",
        sourceHash: "fresh"
      })
    );

    const result = await scrapeChamberEvents(seededChambers[0], false, {
      repository,
      fetchHtml,
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.cacheHit).toBe(false);
      expect(result.data.events).toHaveLength(2);
      expect(result.data.branding.logoUrl).toContain("data:image/svg+xml");
    }
    expect(repository.upsertScrapeCache).toHaveBeenCalledTimes(1);
  });
});
