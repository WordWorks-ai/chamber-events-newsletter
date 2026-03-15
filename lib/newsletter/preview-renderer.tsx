import { designTokens } from "@/lib/newsletter/design-tokens";
import type { NewsletterViewModel } from "@/lib/utils/validation";

interface NewsletterPreviewRendererProps {
  viewModel: NewsletterViewModel;
}

export function NewsletterPreviewRenderer({ viewModel }: NewsletterPreviewRendererProps) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-[0_24px_80px_rgba(16,35,61,0.12)]">
      <header className="border-b border-slate-200 bg-slate-50 px-8 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            {viewModel.branding.logoUrl ? (
              <img
                alt={`${viewModel.chamberName} logo`}
                className="h-16 w-auto max-w-40 rounded-sm object-contain"
                src={viewModel.branding.logoUrl}
              />
            ) : (
              <div
                className="flex h-16 w-16 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg font-semibold text-slate-800"
                style={{ color: viewModel.branding.themeColor ?? designTokens.colors.accent }}
              >
                {viewModel.chamberName.charAt(0)}
              </div>
            )}

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Chamber Events Newsletter
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{viewModel.newsletterTitle}</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-600">{viewModel.introLine}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start rounded-full border border-slate-200 bg-white px-4 py-2">
            {viewModel.branding.symbolDataUrl ? (
              <img alt="Custom symbol" className="h-8 w-8 rounded object-contain" src={viewModel.branding.symbolDataUrl} />
            ) : viewModel.branding.faviconUrl ? (
              <img alt={`${viewModel.chamberName} symbol`} className="h-8 w-8 rounded object-contain" src={viewModel.branding.faviconUrl} />
            ) : null}
            <div className="text-sm text-slate-600">
              <p className="font-medium text-slate-800">{viewModel.chamberName}</p>
              <p>{viewModel.generatedAtLabel}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-8 px-8 py-8">
        {viewModel.totalEvents === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <h3 className="text-xl font-semibold text-slate-900">No upcoming public events found</h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">{viewModel.emptyStateMessage}</p>
          </section>
        ) : (
          viewModel.groupedEvents.map((group) => (
            <section key={group.dateKey} className="space-y-4">
              <div className="flex items-center gap-3">
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: viewModel.branding.themeColor ?? designTokens.colors.border }}
                />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-700">{group.dateLabel}</h3>
                <div
                  className="h-px flex-1"
                  style={{ backgroundColor: viewModel.branding.themeColor ?? designTokens.colors.border }}
                />
              </div>

              <div className="space-y-4">
                {group.events.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-3xl border border-slate-200 bg-white px-6 py-5 shadow-[0_12px_36px_rgba(16,35,61,0.06)]"
                  >
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
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <footer className="border-t border-slate-200 bg-slate-50 px-8 py-5 text-sm text-slate-600">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>{viewModel.footerAttribution}</p>
          <a className="font-medium text-slate-800 underline-offset-4 hover:underline" href={viewModel.chamberWebsiteUrl}>
            {viewModel.chamberWebsiteUrl}
          </a>
        </div>
      </footer>
    </article>
  );
}
