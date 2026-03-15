import path from "node:path";
import { readFile } from "node:fs/promises";

import { seededChambers } from "@/lib/db/demo-data";
import { buildNewsletterViewModel } from "@/lib/newsletter/view-model";
import type { BrandingAsset, NewsletterPreviewResponse, NewsletterRequest, NormalizedEvent } from "@/lib/utils/validation";

export async function readChamberFixture(name: string): Promise<string> {
  return readFile(path.join(process.cwd(), "tests", "fixtures", "chambers", name), "utf8");
}

export function makeBranding(overrides: Partial<BrandingAsset> = {}): BrandingAsset {
  return {
    logoUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 160 48'%3E%3Crect width='160' height='48' rx='8' fill='%23113456'/%3E%3Ctext x='80' y='30' font-size='18' text-anchor='middle' fill='white'%3ELogo%3C/text%3E%3C/svg%3E",
    faviconUrl:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23113456'/%3E%3Ctext x='16' y='21' font-size='14' text-anchor='middle' fill='white'%3EL%3C/text%3E%3C/svg%3E",
    themeColor: "#113456",
    siteName: "Test Chamber",
    sourceWebsiteUrl: seededChambers[0].websiteUrl,
    sourceEventsUrl: seededChambers[0].eventsUrl,
    extractedFrom: "meta",
    ...overrides
  };
}

export function makeNormalizedEvents(): NormalizedEvent[] {
  return [
    {
      id: "event-0001",
      chamberId: seededChambers[0].id,
      sourceUrl: "https://columbus.org/events/breakfast-briefing",
      title: "Small Business Breakfast Briefing",
      description: "A civic-style breakfast briefing on regional workforce priorities and member updates.",
      startAt: "2026-03-21T12:00:00.000Z",
      endAt: "2026-03-21T13:30:00.000Z",
      timezone: "America/New_York",
      locationName: "Columbus Chamber Boardroom",
      locationAddress: "150 South Front Street",
      city: "Columbus",
      state: "OH",
      registrationUrl: "https://columbus.org/events/breakfast-briefing/register",
      tags: ["networking"],
      isAllDay: false,
      extractedFrom: "jsonld-event-adapter"
    },
    {
      id: "event-0002",
      chamberId: seededChambers[0].id,
      sourceUrl: "https://columbus.org/events/public-policy-luncheon",
      title: "Public Policy Luncheon",
      description: "An update from regional leaders focused on infrastructure and economic development.",
      startAt: "2026-03-27T15:30:00.000Z",
      endAt: "2026-03-27T17:00:00.000Z",
      timezone: "America/New_York",
      locationName: "Downtown Conference Hall",
      locationAddress: "1 Civic Center Plaza",
      city: "Columbus",
      state: "OH",
      registrationUrl: "https://columbus.org/events/public-policy-luncheon/register",
      tags: ["policy"],
      isAllDay: false,
      extractedFrom: "jsonld-event-adapter"
    }
  ];
}

export function makePreviewResponse(overrides: Partial<NewsletterPreviewResponse> = {}): NewsletterPreviewResponse {
  const chamber = overrides.chamber ?? seededChambers[0];
  const branding = overrides.branding ?? makeBranding();
  const events = overrides.events ?? makeNormalizedEvents();
  const request: NewsletterRequest = {
    chamberId: chamber.id,
    forceRefresh: false,
    customTitle: "Columbus Chamber Events Newsletter",
    introLine: "Upcoming events from the public chamber calendar.",
    uploadedGraphic: null
  };
  const viewModel =
    overrides.viewModel ??
    buildNewsletterViewModel({
      chamber,
      branding,
      events,
      request,
      now: new Date("2026-03-14T12:00:00.000Z")
    });

  return {
    chamber,
    branding,
    events,
    viewModel,
    cache: {
      hit: false,
      expiresAt: "2026-03-14T18:00:00.000Z"
    },
    runId: "911f9242-a4c8-4748-9d7b-b638e3d60f5d",
    ...overrides
  };
}
