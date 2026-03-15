import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchHtml } from "@/lib/scraping/fetch-html";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("fetchHtml", () => {
  it("rejects unsafe target URLs", async () => {
    const result = await fetchHtml({
      url: "https://example.net/other-site",
      allowedBases: ["https://columbus.org/events/"]
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("UNSAFE_TARGET_URL");
    }
  });

  it("loads deterministic fixture HTML in fixture mode", async () => {
    vi.stubEnv("SCRAPER_FIXTURE_MODE", "true");

    const result = await fetchHtml({
      url: "https://columbus.org/events/",
      allowedBases: ["https://columbus.org/events/", "https://columbus.org"]
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.html).toContain("Small Business Breakfast Briefing");
      expect(result.data.sourceHash).toHaveLength(64);
    }
  });

  it("returns a structured error for invalid content types", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json"
        }
      })
    );

    const result = await fetchHtml(
      {
        url: "https://columbus.org/events/",
        allowedBases: ["https://columbus.org/events/", "https://columbus.org"]
      },
      mockFetch
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID_CONTENT_TYPE");
    }
  });

  it("returns HTML successfully from a normal same-site fetch", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response("<html><body>Hello</body></html>", {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "31"
        }
      })
    );

    const result = await fetchHtml(
      {
        url: "https://columbus.org/events/",
        allowedBases: ["https://columbus.org/events/", "https://columbus.org"]
      },
      mockFetch
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.html).toContain("Hello");
    }
  });

  it("retries transient failures before succeeding", async () => {
    const mockFetch = vi
      .fn()
      .mockResolvedValueOnce(
        new Response("temporary outage", {
          status: 503,
          headers: {
            "content-type": "text/html"
          }
        })
      )
      .mockResolvedValueOnce(
        new Response("<html><body>Recovered</body></html>", {
          status: 200,
          headers: {
            "content-type": "text/html"
          }
        })
      );

    const result = await fetchHtml(
      {
        url: "https://columbus.org/events/",
        allowedBases: ["https://columbus.org/events/", "https://columbus.org"],
        retries: 1
      },
      mockFetch
    );

    expect(result.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("returns a structured fetch failure after retries are exhausted", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("network down"));

    const result = await fetchHtml(
      {
        url: "https://columbus.org/events/",
        allowedBases: ["https://columbus.org/events/", "https://columbus.org"],
        retries: 0
      },
      mockFetch
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("FETCH_FAILED");
    }
  });
});
