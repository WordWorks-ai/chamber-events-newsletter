import { afterEach, describe, expect, it, vi } from "vitest";

import * as clientModule from "@/lib/db/client";
import type { Database } from "@/lib/db/database.types";
import { createChamberRepository, SupabaseChamberRepository } from "@/lib/db/repositories";
import { makeBranding, makeNormalizedEvents } from "@/tests/helpers";

afterEach(() => {
  vi.unstubAllEnvs();
  delete (globalThis as Record<string, unknown>).__chamberEventsMemoryStore;
});

describe("repositories", () => {
  it("uses the in-memory repository when Supabase env vars are absent", async () => {
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    expect(clientModule.hasSupabaseConfig()).toBe(false);

    const repository = createChamberRepository();
    expect(repository.kind).toBe("memory");

    const chambers = await repository.listActiveChambers();
    expect(chambers.length).toBeGreaterThan(3);
  });

  it("stores cache entries and newsletter runs in memory", async () => {
    const repository = createChamberRepository();
    const chamber = (await repository.listActiveChambers())[0];

    await repository.upsertScrapeCache({
      chamberId: chamber!.id,
      cacheKey: "newsletter-preview-v1",
      normalizedEvents: makeNormalizedEvents(),
      branding: makeBranding(),
      fetchedAt: "2026-03-14T12:00:00.000Z",
      expiresAt: "2026-03-14T18:00:00.000Z",
      sourceHash: "hash"
    });

    const cache = await repository.getScrapeCache(chamber!.id, "newsletter-preview-v1");
    const runId = await repository.insertNewsletterRun({
      chamberId: chamber!.id,
      status: "generated",
      eventCount: 2,
      requestPayload: {
        chamberId: chamber!.id,
        forceRefresh: false,
        customTitle: undefined,
        introLine: undefined
      },
      outputMeta: {
        cacheHit: false
      }
    });

    expect(cache?.normalizedEvents).toHaveLength(2);
    expect(runId).toHaveLength(36);
  });

  it("maps Supabase rows through the repository wrapper", async () => {
    const chamberRow: Database["public"]["Tables"]["chambers"]["Row"] = {
      id: "56ac9bf4-8d74-48e8-8ff8-9f2948d7d9f2",
      slug: "columbus-chamber",
      name: "Columbus Chamber of Commerce",
      website_url: "https://columbus.org",
      events_url: "https://columbus.org/events/",
      platform_hint: "jsonld-event-adapter",
      active: true,
      default_timezone: "America/New_York",
      logo_url: null,
      favicon_url: null,
      theme_color: null,
      metadata: {},
      created_at: "2026-03-14T12:00:00.000Z",
      updated_at: "2026-03-14T12:00:00.000Z"
    };
    const cacheRow: Database["public"]["Tables"]["scrape_cache"]["Row"] = {
      chamber_id: chamberRow.id,
      cache_key: "newsletter-preview-v1",
      normalized_events: makeNormalizedEvents() as unknown as Database["public"]["Tables"]["scrape_cache"]["Row"]["normalized_events"],
      branding: makeBranding() as unknown as Database["public"]["Tables"]["scrape_cache"]["Row"]["branding"],
      fetched_at: "2026-03-14T12:00:00.000Z",
      expires_at: "2026-03-14T18:00:00.000Z",
      source_hash: "hash"
    };

    const upsert = vi.fn().mockResolvedValue({ error: null });
    const single = vi.fn().mockResolvedValue({ data: { id: "911f9242-a4c8-4748-9d7b-b638e3d60f5d" }, error: null });
    const fakeClient = {
      from: (table: string) => {
        if (table === "chambers") {
          return {
            select: () => ({
              eq: (_column: string, value: unknown) => ({
                order: async () => ({ data: value === true ? [chamberRow] : [], error: null }),
                maybeSingle: async () => ({ data: value === chamberRow.id ? chamberRow : null, error: null })
              })
            })
          };
        }

        if (table === "scrape_cache") {
          return {
            select: () => ({
              eq: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: cacheRow, error: null })
                })
              })
            }),
            upsert
          };
        }

        return {
          insert: () => ({
            select: () => ({
              single
            })
          })
        };
      }
    };

    vi.spyOn(clientModule, "getSupabaseServerClient").mockReturnValue(
      fakeClient as unknown as ReturnType<typeof clientModule.getSupabaseServerClient>
    );

    const repository = new SupabaseChamberRepository();
    expect((await repository.listActiveChambers())[0]?.name).toBe("Columbus Chamber of Commerce");
    expect((await repository.getChamberById(chamberRow.id))?.slug).toBe("columbus-chamber");
    expect((await repository.getScrapeCache(chamberRow.id, "newsletter-preview-v1"))?.branding.siteName).toBe("Test Chamber");
    await repository.upsertScrapeCache({
      chamberId: chamberRow.id,
      cacheKey: "newsletter-preview-v1",
      normalizedEvents: makeNormalizedEvents(),
      branding: makeBranding(),
      fetchedAt: "2026-03-14T12:00:00.000Z",
      expiresAt: "2026-03-14T18:00:00.000Z",
      sourceHash: "hash"
    });
    expect(await repository.insertNewsletterRun({
      chamberId: chamberRow.id,
      status: "generated",
      eventCount: 2,
      requestPayload: {
        chamberId: chamberRow.id,
        forceRefresh: false,
        customTitle: undefined,
        introLine: undefined
      }
    })).toBe("911f9242-a4c8-4748-9d7b-b638e3d60f5d");
    expect(upsert).toHaveBeenCalledTimes(1);
  });
});
