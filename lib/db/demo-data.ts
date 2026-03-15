import type { Chamber } from "@/lib/utils/validation";

const now = new Date("2026-03-14T12:00:00.000Z").toISOString();

export const seededChambers: Chamber[] = [
  {
    id: "56ac9bf4-8d74-48e8-8ff8-9f2948d7d9f2",
    slug: "columbus-chamber",
    name: "Columbus Chamber of Commerce",
    websiteUrl: "https://columbus.org",
    eventsUrl: "https://columbus.org/events/",
    platformHint: "jsonld-event-adapter",
    active: true,
    defaultTimezone: "America/New_York",
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: {
      region: "Columbus",
      state: "OH"
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "17bf5f4c-a8c8-4c62-b639-e2ec4434cbfd",
    slug: "hilliard-area-chamber",
    name: "Hilliard Area Chamber of Commerce",
    websiteUrl: "https://www.hilliardchamber.org",
    eventsUrl: "https://business.hilliardchamber.org/events/calendar",
    platformHint: "growthzone-family-adapter",
    active: true,
    defaultTimezone: "America/New_York",
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: {
      region: "Hilliard",
      state: "OH"
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "8b1e7303-2147-4eca-a2b5-0fc6db793141",
    slug: "dublin-chamber",
    name: "Dublin Chamber of Commerce",
    websiteUrl: "https://www.dublinchamber.org",
    eventsUrl: "https://business.dublinchamber.org/events/calendar",
    platformHint: "growthzone-family-adapter",
    active: true,
    defaultTimezone: "America/New_York",
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: {
      region: "Dublin",
      state: "OH"
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "186e4e30-86fc-42d4-8d66-da0f83773ad4",
    slug: "westerville-area-chamber",
    name: "Westerville Area Chamber of Commerce",
    websiteUrl: "https://www.westervillechamber.com",
    eventsUrl: "https://www.westervillechamber.com/events/",
    platformHint: "generic-calendar-adapter",
    active: true,
    defaultTimezone: "America/New_York",
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: {
      region: "Westerville",
      state: "OH"
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "94a2fb62-e0a3-4895-94d4-a6320cc1b478",
    slug: "delaware-area-chamber",
    name: "Delaware Area Chamber of Commerce",
    websiteUrl: "https://www.delawareareachamber.com",
    eventsUrl: "https://www.delawareareachamber.com/calendar",
    platformHint: "wordpress-events-adapter",
    active: true,
    defaultTimezone: "America/New_York",
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: {
      region: "Delaware",
      state: "OH"
    },
    createdAt: now,
    updatedAt: now
  }
];
