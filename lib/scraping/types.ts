import type { BrandingAsset, Chamber, RawScrapeResult } from "@/lib/utils/validation";

export interface AdapterInput {
  chamber: Chamber;
  url: string;
  html: string;
}

export interface ChamberScraperAdapter {
  name: string;
  canHandle(input: AdapterInput): boolean;
  extractEvents(input: AdapterInput): RawScrapeResult[];
  extractBranding(input: AdapterInput): BrandingAsset | null;
}
