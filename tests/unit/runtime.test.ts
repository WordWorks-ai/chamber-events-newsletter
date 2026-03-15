import { describe, expect, it } from "vitest";

import { clearRuntimeDependenciesForTests, getRuntimeDependencies, resultToErrorResponse, setRuntimeDependenciesForTests } from "@/lib/server/runtime";
import { fail } from "@/lib/utils/result";
import { seededChambers } from "@/lib/db/demo-data";

describe("runtime helpers", () => {
  it("returns test overrides when configured", async () => {
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

    const runtime = getRuntimeDependencies();
    expect(runtime.repository.kind).toBe("memory");
    expect(runtime.now().toISOString()).toBe("2026-03-14T12:00:00.000Z");

    clearRuntimeDependenciesForTests();
  });

  it("maps result errors into JSON responses", async () => {
    const response = resultToErrorResponse(fail("BROKEN", "Something broke", 500, { trace: "x" }));
    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({
      ok: false,
      error: {
        code: "BROKEN"
      }
    });
  });
});
