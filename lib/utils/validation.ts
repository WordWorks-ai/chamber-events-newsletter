import { z } from "zod";

const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(jsonValueSchema), z.record(z.string(), jsonValueSchema)])
);

export const uploadedGraphicMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml"
] as const;

export const uploadedGraphicSchema = z.object({
  fileName: z.string().min(1).max(120),
  mimeType: z.enum(uploadedGraphicMimeTypes),
  dataUrl: z.string().startsWith("data:"),
  sizeBytes: z.number().int().positive().max(Number(process.env.MAX_UPLOAD_BYTES ?? 204800))
});

export const chamberSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  websiteUrl: z.string().url(),
  eventsUrl: z.string().url(),
  platformHint: z.string().nullable(),
  active: z.boolean(),
  defaultTimezone: z.string().min(1),
  logoUrl: z.string().url().nullable(),
  faviconUrl: z.string().url().nullable(),
  themeColor: z.string().nullable(),
  metadata: z.record(z.string(), jsonValueSchema),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true })
});

export const rawScrapeResultSchema = z.object({
  sourceUrl: z.string().url(),
  title: z.string().min(1),
  description: z.string().default(""),
  startDate: z.string().min(1),
  endDate: z.string().nullable().default(null),
  timezone: z.string().nullable().default(null),
  locationName: z.string().nullable().default(null),
  locationAddress: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  registrationUrl: z.string().url().nullable().default(null),
  tags: z.array(z.string()).default([]),
  isAllDay: z.boolean().default(false),
  raw: jsonValueSchema.optional()
});

export const brandingAssetSchema = z.object({
  logoUrl: z.string().nullable(),
  faviconUrl: z.string().nullable(),
  themeColor: z.string().nullable(),
  siteName: z.string().nullable(),
  sourceWebsiteUrl: z.string().url(),
  sourceEventsUrl: z.string().url(),
  extractedFrom: z.enum(["record", "meta", "heuristic", "fallback"])
});

export const normalizedEventSchema = z.object({
  id: z.string().min(8),
  chamberId: z.string().uuid(),
  sourceUrl: z.string().url(),
  title: z.string().min(1),
  description: z.string(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().nullable(),
  timezone: z.string().min(1),
  locationName: z.string().nullable(),
  locationAddress: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  registrationUrl: z.string().url().nullable(),
  tags: z.array(z.string()),
  isAllDay: z.boolean(),
  extractedFrom: z.string().min(1),
  raw: jsonValueSchema.optional()
});

export const newsletterEventViewSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  dateLabel: z.string(),
  timeLabel: z.string(),
  locationLabel: z.string(),
  registrationUrl: z.string().url().nullable(),
  tags: z.array(z.string())
});

export const newsletterEventGroupSchema = z.object({
  dateKey: z.string(),
  dateLabel: z.string(),
  events: z.array(newsletterEventViewSchema)
});

export const newsletterViewModelSchema = z.object({
  chamberId: z.string().uuid(),
  chamberName: z.string(),
  chamberWebsiteUrl: z.string().url(),
  chamberEventsUrl: z.string().url(),
  newsletterTitle: z.string(),
  introLine: z.string().nullable(),
  generatedAtLabel: z.string(),
  generatedAtIso: z.string().datetime(),
  footerAttribution: z.string(),
  emptyStateMessage: z.string(),
  branding: z.object({
    logoUrl: z.string().nullable(),
    faviconUrl: z.string().nullable(),
    themeColor: z.string().nullable(),
    symbolDataUrl: z.string().nullable()
  }),
  groupedEvents: z.array(newsletterEventGroupSchema),
  totalEvents: z.number().int().nonnegative()
});

export const newsletterRequestSchema = z.object({
  chamberId: z.string().uuid(),
  forceRefresh: z.boolean().optional().default(false),
  customTitle: z.string().trim().max(120).optional().transform((value) => value || undefined),
  introLine: z.string().trim().max(220).optional().transform((value) => value || undefined),
  uploadedGraphic: uploadedGraphicSchema.nullish()
});

export const newsletterPreviewResponseSchema = z.object({
  chamber: chamberSchema,
  branding: brandingAssetSchema,
  events: z.array(normalizedEventSchema),
  viewModel: newsletterViewModelSchema,
  cache: z.object({
    hit: z.boolean(),
    expiresAt: z.string().datetime().nullable()
  }),
  runId: z.string().uuid()
});

export const pdfRequestSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("request"),
    request: newsletterRequestSchema
  }),
  z.object({
    mode: z.literal("viewModel"),
    viewModel: newsletterViewModelSchema
  })
]);

export const routeErrorEnvelopeSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: jsonValueSchema.optional()
  })
});

export type Chamber = z.infer<typeof chamberSchema>;
export type RawScrapeResult = z.infer<typeof rawScrapeResultSchema>;
export type BrandingAsset = z.infer<typeof brandingAssetSchema>;
export type NormalizedEvent = z.infer<typeof normalizedEventSchema>;
export type UploadedGraphic = z.infer<typeof uploadedGraphicSchema>;
export type NewsletterRequest = z.infer<typeof newsletterRequestSchema>;
export type NewsletterPreviewResponse = z.infer<typeof newsletterPreviewResponseSchema>;
export type NewsletterViewModel = z.infer<typeof newsletterViewModelSchema>;
export type RouteErrorEnvelope = z.infer<typeof routeErrorEnvelopeSchema>;

export function inferUploadedGraphicSize(dataUrl: string): number {
  const [, encoded = ""] = dataUrl.split(",", 2);
  const padding = encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0;
  return Math.ceil((encoded.length * 3) / 4) - padding;
}

export function validateUploadedGraphic(input: UploadedGraphic | null | undefined): UploadedGraphic | null {
  if (!input) {
    return null;
  }

  const sizeBytes = inferUploadedGraphicSize(input.dataUrl);
  const parsed = uploadedGraphicSchema.safeParse({
    ...input,
    sizeBytes
  });

  if (!parsed.success) {
    throw parsed.error;
  }

  if (!parsed.data.dataUrl.startsWith(`data:${parsed.data.mimeType};base64,`) && parsed.data.mimeType !== "image/svg+xml") {
    throw new Error("Uploaded graphic MIME type does not match the provided data URL.");
  }

  return parsed.data;
}
