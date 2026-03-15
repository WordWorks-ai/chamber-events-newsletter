import { formatDisplayDate, formatGeneratedDateLabel, formatTimeRange, groupKeyForDate, groupLabelForDate } from "@/lib/utils/dates";
import type { BrandingAsset, Chamber, NewsletterRequest, NewsletterViewModel, NormalizedEvent } from "@/lib/utils/validation";
import { newsletterViewModelSchema } from "@/lib/utils/validation";

function buildLocationLabel(event: NormalizedEvent): string {
  return [event.locationName, event.locationAddress, [event.city, event.state].filter(Boolean).join(", ")]
    .filter(Boolean)
    .join(" · ");
}

export function buildNewsletterViewModel(input: {
  chamber: Chamber;
  branding: BrandingAsset;
  events: NormalizedEvent[];
  request: NewsletterRequest;
  now?: Date;
}): NewsletterViewModel {
  const now = input.now ?? new Date();
  const introLine = input.request.introLine ?? "Upcoming public programs, networking sessions, and chamber events.";
  const groupedEvents = Array.from(
    input.events.reduce((groups, event) => {
      const key = groupKeyForDate(event.startAt, event.timezone);
      const existing = groups.get(key) ?? {
        dateKey: key,
        dateLabel: groupLabelForDate(event.startAt, event.timezone),
        events: []
      };

      existing.events.push({
        id: event.id,
        title: event.title,
        description: event.description,
        dateLabel: formatDisplayDate(event.startAt, event.timezone),
        timeLabel: formatTimeRange(event.startAt, event.endAt, event.timezone, event.isAllDay),
        locationLabel: buildLocationLabel(event),
        registrationUrl: event.registrationUrl,
        tags: event.tags
      });
      groups.set(key, existing);
      return groups;
    }, new Map<string, NewsletterViewModel["groupedEvents"][number]>()).values()
  );

  return newsletterViewModelSchema.parse({
    chamberId: input.chamber.id,
    chamberName: input.chamber.name,
    chamberWebsiteUrl: input.chamber.websiteUrl,
    chamberEventsUrl: input.chamber.eventsUrl,
    newsletterTitle: input.request.customTitle ?? `${input.chamber.name} Events Newsletter`,
    introLine,
    generatedAtLabel: formatGeneratedDateLabel(now, input.chamber.defaultTimezone),
    generatedAtIso: now.toISOString(),
    footerAttribution: `Source: ${input.branding.siteName ?? input.chamber.name} public events calendar`,
    emptyStateMessage:
      "No upcoming public events were found on the selected chamber page. Try again later or use force refresh if the chamber recently updated its calendar.",
    branding: {
      logoUrl: input.branding.logoUrl,
      faviconUrl: input.branding.faviconUrl,
      themeColor: input.branding.themeColor,
      symbolDataUrl: input.request.uploadedGraphic?.dataUrl ?? null
    },
    groupedEvents,
    totalEvents: input.events.length
  });
}
