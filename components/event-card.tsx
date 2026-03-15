import type { NewsletterViewModel } from "@/lib/utils/validation";

interface EventCardProps {
  event: NewsletterViewModel["groupedEvents"][number]["events"][number];
}

export function EventCard({ event }: EventCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_36px_rgba(16,35,61,0.06)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <h4 className="text-xl font-semibold text-slate-900">{event.title}</h4>
          <p className="text-sm font-medium text-slate-700">
            {event.dateLabel} · {event.timeLabel}
          </p>
          {event.locationLabel ? <p className="text-sm text-slate-600">{event.locationLabel}</p> : null}
        </div>

        {event.registrationUrl ? (
          <a
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            href={event.registrationUrl}
            rel="noreferrer"
            target="_blank"
          >
            Register / Learn More
          </a>
        ) : null}
      </div>

      {event.description ? <p className="mt-4 text-sm leading-6 text-slate-600">{event.description}</p> : null}
    </div>
  );
}
