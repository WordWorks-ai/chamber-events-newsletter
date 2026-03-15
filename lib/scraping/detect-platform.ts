import type { Chamber } from "@/lib/utils/validation";

export function detectPlatform(chamber: Chamber, html: string, url: string): string {
  if (chamber.platformHint) {
    return chamber.platformHint;
  }

  const lowerHtml = html.toLowerCase();
  const lowerUrl = url.toLowerCase();

  if (lowerHtml.includes('"@type":"event"') || lowerHtml.includes('"@type": "event"') || lowerHtml.includes("application/ld+json")) {
    return "jsonld-event-adapter";
  }

  if (
    lowerUrl.includes("growthzone") ||
    lowerUrl.includes("/events/calendar") ||
    lowerHtml.includes("site by growthzone") ||
    lowerHtml.includes("gz-event-card")
  ) {
    return "growthzone-family-adapter";
  }

  if (lowerHtml.includes("tribe-events") || lowerHtml.includes("the events calendar")) {
    return "wordpress-events-adapter";
  }

  return "generic-calendar-adapter";
}
