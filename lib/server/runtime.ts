import { createChamberRepository, type ChamberRepository } from "@/lib/db/repositories";
import { fetchHtml } from "@/lib/scraping/fetch-html";
import type { Result } from "@/lib/utils/result";

interface RuntimeDependencies {
  repository: ChamberRepository;
  fetchHtml: typeof fetchHtml;
  now: () => Date;
}

let runtimeOverride: Partial<RuntimeDependencies> | null = null;

export function getRuntimeDependencies(): RuntimeDependencies {
  return {
    repository: runtimeOverride?.repository ?? createChamberRepository(),
    fetchHtml: runtimeOverride?.fetchHtml ?? fetchHtml,
    now: runtimeOverride?.now ?? (() => new Date())
  };
}

export function setRuntimeDependenciesForTests(overrides: Partial<RuntimeDependencies>) {
  runtimeOverride = overrides;
}

export function clearRuntimeDependenciesForTests() {
  runtimeOverride = null;
}

export function resultToErrorResponse(result: Result<unknown>) {
  if (result.ok) {
    throw new Error("resultToErrorResponse called with a success result.");
  }

  return Response.json(
    {
      ok: false,
      error: {
        code: result.error.code,
        message: result.error.message,
        details: result.error.details
      }
    },
    {
      status: result.error.status
    }
  );
}
