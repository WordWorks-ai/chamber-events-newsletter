import { afterEach, describe, expect, it, vi } from "vitest";

import { GET as chambersGet } from "@/app/api/chambers/route";
import { POST as pdfPost } from "@/app/api/newsletter/pdf/route";
import { POST as previewPost } from "@/app/api/newsletter/preview/route";
import { seededChambers } from "@/lib/db/demo-data";
import { clearRuntimeDependenciesForTests, setRuntimeDependenciesForTests } from "@/lib/server/runtime";
import type { ChamberRepository, ScrapeCacheEntry } from "@/lib/db/repositories";
import { ok } from "@/lib/utils/result";
import { makeBranding, makePreviewResponse, readChamberFixture } from "@/tests/helpers";

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

afterEach(() => {
  clearRuntimeDependenciesForTests();
  vi.restoreAllMocks();
});

describe("route handlers", () => {
  it("returns active chambers for the dropdown", async () => {
    setRuntimeDependenciesForTests({
      repository: createRepository()
    });

    const response = await chambersGet();
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveLength(seededChambers.length);
  });

  it("generates a happy-path newsletter preview", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    const repository = createRepository();

    setRuntimeDependenciesForTests({
      repository,
      fetchHtml: vi.fn().mockResolvedValue(
        ok({
          html,
          finalUrl: seededChambers[0].eventsUrl,
          contentType: "text/html",
          sourceHash: "fixture-hash"
        })
      ),
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    const response = await previewPost(
      new Request("http://localhost/api/newsletter/preview", {
        method: "POST",
        body: JSON.stringify({
          chamberId: seededChambers[0].id,
          forceRefresh: false
        })
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.events).toHaveLength(2);
    expect(payload.viewModel.totalEvents).toBe(2);
    expect((repository.upsertScrapeCache as unknown as ReturnType<typeof vi.fn>).mock.calls).toHaveLength(1);
  });

  it("returns a no-events preview when the scraper finds nothing", async () => {
    const html = await readChamberFixture("empty-calendar.html");

    setRuntimeDependenciesForTests({
      repository: createRepository({
        getChamberById: vi.fn().mockResolvedValue({
          ...seededChambers[3],
          platformHint: "generic-calendar-adapter"
        })
      }),
      fetchHtml: vi.fn().mockResolvedValue(
        ok({
          html,
          finalUrl: seededChambers[3].eventsUrl,
          contentType: "text/html",
          sourceHash: "empty-hash"
        })
      ),
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    const response = await previewPost(
      new Request("http://localhost/api/newsletter/preview", {
        method: "POST",
        body: JSON.stringify({
          chamberId: seededChambers[3].id
        })
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.events).toHaveLength(0);
    expect(payload.viewModel.totalEvents).toBe(0);
  });

  it("refreshes when a cached entry is stale", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    const staleCache: ScrapeCacheEntry = {
      chamberId: seededChambers[0].id,
      cacheKey: "newsletter-preview-v1",
      normalizedEvents: [],
      branding: makeBranding(),
      fetchedAt: "2026-03-14T00:00:00.000Z",
      expiresAt: "2026-03-14T01:00:00.000Z",
      sourceHash: "stale"
    };
    const fetchHtmlMock = vi.fn().mockResolvedValue(
      ok({
        html,
        finalUrl: seededChambers[0].eventsUrl,
        contentType: "text/html",
        sourceHash: "fresh"
      })
    );

    setRuntimeDependenciesForTests({
      repository: createRepository({
        getScrapeCache: vi.fn().mockResolvedValue(staleCache)
      }),
      fetchHtml: fetchHtmlMock,
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    const response = await previewPost(
      new Request("http://localhost/api/newsletter/preview", {
        method: "POST",
        body: JSON.stringify({
          chamberId: seededChambers[0].id
        })
      })
    );

    const payload = await response.json();
    expect(response.status).toBe(200);
    expect(payload.cache.hit).toBe(false);
    expect(fetchHtmlMock).toHaveBeenCalledTimes(1);
  });

  it("returns a 400 envelope for invalid preview payloads", async () => {
    setRuntimeDependenciesForTests({
      repository: createRepository()
    });

    const response = await previewPost(
      new Request("http://localhost/api/newsletter/preview", {
        method: "POST",
        body: JSON.stringify({
          chamberId: "not-a-uuid"
        })
      })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("INVALID_REQUEST");
  });

  it("streams a non-empty PDF with the correct content type", async () => {
    const response = await pdfPost(
      new Request("http://localhost/api/newsletter/pdf", {
        method: "POST",
        body: JSON.stringify({
          mode: "viewModel",
          viewModel: makePreviewResponse().viewModel
        })
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("application/pdf");
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);
  });

  it("builds a PDF from request mode as well as prebuilt view models", async () => {
    const html = await readChamberFixture("jsonld-columbus.html");
    setRuntimeDependenciesForTests({
      repository: createRepository(),
      fetchHtml: vi.fn().mockResolvedValue(
        ok({
          html,
          finalUrl: seededChambers[0].eventsUrl,
          contentType: "text/html",
          sourceHash: "fixture-hash"
        })
      ),
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    const response = await pdfPost(
      new Request("http://localhost/api/newsletter/pdf", {
        method: "POST",
        body: JSON.stringify({
          mode: "request",
          request: {
            chamberId: seededChambers[0].id,
            forceRefresh: false
          }
        })
      })
    );

    expect(response.status).toBe(200);
    expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(1_000);
  });
});
