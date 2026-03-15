import { genericCalendarAdapter } from "@/lib/scraping/adapters/generic-calendar-adapter";
import { growthzoneFamilyAdapter } from "@/lib/scraping/adapters/growthzone-family-adapter";
import { jsonLdEventAdapter } from "@/lib/scraping/adapters/jsonld-event-adapter";
import { wordpressEventsAdapter } from "@/lib/scraping/adapters/wordpress-events-adapter";
import { detectPlatform } from "@/lib/scraping/detect-platform";
import type { AdapterInput, ChamberScraperAdapter } from "@/lib/scraping/types";

const adapters = [
  jsonLdEventAdapter,
  growthzoneFamilyAdapter,
  wordpressEventsAdapter,
  genericCalendarAdapter
] satisfies ChamberScraperAdapter[];

export function listScraperAdapters(): ChamberScraperAdapter[] {
  return adapters;
}

export function getScraperAdapterByName(name: string): ChamberScraperAdapter {
  return adapters.find((adapter) => adapter.name === name) ?? genericCalendarAdapter;
}

export function resolveScraperAdapter(input: AdapterInput): ChamberScraperAdapter {
  const detectedName = detectPlatform(input.chamber, input.html, input.url);
  const detectedAdapter = getScraperAdapterByName(detectedName);

  if (detectedAdapter.canHandle(input)) {
    return detectedAdapter;
  }

  return adapters.find((adapter) => adapter.canHandle(input)) ?? genericCalendarAdapter;
}
