import type { ChamberRepository } from "@/lib/db/repositories";
import { buildNewsletterViewModel } from "@/lib/newsletter/view-model";
import { getChamberOrError, scrapeChamberEvents, type ScrapeDependencies } from "@/lib/scraping/service";
import { fail, ok, type Result } from "@/lib/utils/result";
import {
  newsletterPreviewResponseSchema,
  newsletterViewModelSchema,
  pdfRequestSchema,
  validateUploadedGraphic,
  type NewsletterPreviewResponse,
  type NewsletterRequest,
  type NewsletterViewModel
} from "@/lib/utils/validation";

export interface NewsletterDependencies extends ScrapeDependencies {
  repository: ChamberRepository;
}

export async function generateNewsletterPreview(
  request: NewsletterRequest,
  dependencies: NewsletterDependencies
): Promise<Result<NewsletterPreviewResponse>> {
  let validatedUpload = null;

  try {
    validatedUpload = validateUploadedGraphic(request.uploadedGraphic ?? null);
  } catch (error) {
    return fail("INVALID_UPLOAD", "The uploaded graphic must be a small PNG, JPEG, WebP, or SVG file.", 400, {
      cause: error instanceof Error ? error.message : String(error)
    });
  }

  const chamberResult = await getChamberOrError(dependencies.repository, request.chamberId);
  if (!chamberResult.ok) {
    return chamberResult;
  }

  const scrapeResult = await scrapeChamberEvents(chamberResult.data, request.forceRefresh ?? false, dependencies);
  if (!scrapeResult.ok) {
    return scrapeResult;
  }

  const viewModel = buildNewsletterViewModel({
    chamber: scrapeResult.data.chamber,
    branding: scrapeResult.data.branding,
    events: scrapeResult.data.events,
    request: {
      ...request,
      uploadedGraphic: validatedUpload
    },
    now: dependencies.now?.()
  });

  const status = scrapeResult.data.events.length > 0 ? "generated" : "empty";
  const runId = await dependencies.repository.insertNewsletterRun({
    chamberId: scrapeResult.data.chamber.id,
    status,
    eventCount: scrapeResult.data.events.length,
    requestPayload: {
      ...request,
      uploadedGraphic: validatedUpload
    },
    outputMeta: {
      cacheHit: scrapeResult.data.cacheHit,
      sourceHash: scrapeResult.data.sourceHash,
      totalEvents: scrapeResult.data.events.length
    }
  });

  return ok(
    newsletterPreviewResponseSchema.parse({
      chamber: scrapeResult.data.chamber,
      branding: scrapeResult.data.branding,
      events: scrapeResult.data.events,
      viewModel,
      cache: {
        hit: scrapeResult.data.cacheHit,
        expiresAt: scrapeResult.data.cacheExpiresAt
      },
      runId
    })
  );
}

export function parsePdfPayload(payload: unknown): Result<{ mode: "request"; request: NewsletterRequest } | { mode: "viewModel"; viewModel: NewsletterViewModel }> {
  const parsed = pdfRequestSchema.safeParse(payload);
  if (!parsed.success) {
    return fail("INVALID_REQUEST", "The PDF request payload is invalid.", 400, parsed.error.flatten());
  }

  if (parsed.data.mode === "viewModel") {
    return ok({
      mode: "viewModel",
      viewModel: newsletterViewModelSchema.parse(parsed.data.viewModel)
    });
  }

  return ok({
    mode: "request",
    request: parsed.data.request
  });
}
