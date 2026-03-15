import { describe, expect, it } from "vitest";

import { GET as healthGet } from "@/app/api/health/route";
import { clearRuntimeDependenciesForTests, setRuntimeDependenciesForTests } from "@/lib/server/runtime";
import { seededChambers } from "@/lib/db/demo-data";

describe("health route", () => {
  it("reports runtime health and repository kind", async () => {
    setRuntimeDependenciesForTests({
      repository: {
        kind: "memory",
        listActiveChambers: async () => seededChambers,
        getChamberById: async () => seededChambers[0] ?? null,
        getScrapeCache: async () => null,
        upsertScrapeCache: async () => undefined,
        insertNewsletterRun: async () => "911f9242-a4c8-4748-9d7b-b638e3d60f5d"
      },
      now: () => new Date("2026-03-14T12:00:00.000Z")
    });

    const response = healthGet();
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.repository).toBe("memory");

    clearRuntimeDependenciesForTests();
  });
});
