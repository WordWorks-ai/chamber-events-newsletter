import { describe, expect, it } from "vitest";

import { getCacheExpiry, shouldUseCache } from "@/lib/scraping/normalize";

describe("cache policy", () => {
  it("uses fresh cache entries when force refresh is disabled", () => {
    const now = new Date("2026-03-14T12:00:00.000Z");
    expect(
      shouldUseCache(
        {
          expiresAt: "2026-03-14T18:00:00.000Z"
        },
        now,
        false
      )
    ).toBe(true);
  });

  it("bypasses cache on force refresh or expiry", () => {
    const now = new Date("2026-03-14T12:00:00.000Z");
    expect(shouldUseCache({ expiresAt: "2026-03-14T11:00:00.000Z" }, now, false)).toBe(false);
    expect(shouldUseCache({ expiresAt: "2026-03-14T18:00:00.000Z" }, now, true)).toBe(false);
    expect(getCacheExpiry(now)).toBe("2026-03-14T18:00:00.000Z");
  });
});
