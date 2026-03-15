import { Buffer } from "node:buffer";
import { renderToStream, Document, Image, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { designTokens } from "@/lib/newsletter/design-tokens";
import { isAllowedSameSiteUrl } from "@/lib/scraping/branding";
import type { NewsletterViewModel } from "@/lib/utils/validation";

async function fetchImageAsDataUrl(url: string | null, allowedBases: string[], fetchImpl: typeof fetch): Promise<string | null> {
  if (!url) {
    return null;
  }

  if (url.startsWith("data:")) {
    if (url.startsWith("data:image/svg+xml,")) {
      const [, payload = ""] = url.split(",", 2);
      return `data:image/svg+xml;base64,${Buffer.from(decodeURIComponent(payload)).toString("base64")}`;
    }
    return url;
  }

  if (!isAllowedSameSiteUrl(url, allowedBases)) {
    return null;
  }

  const IMAGE_FETCH_TIMEOUT_MS = 5_000;
  const IMAGE_MAX_BYTES = 500_000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), IMAGE_FETCH_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      headers: {
        "User-Agent": process.env.SCRAPER_USER_AGENT ?? "ChamberEventsNewsletter/1.0 (+https://example.gov)"
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    if (!contentType.startsWith("image/")) {
      return null;
    }

    const contentLength = Number(response.headers.get("content-length") ?? "0");
    if (contentLength > IMAGE_MAX_BYTES) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > IMAGE_MAX_BYTES) {
      return null;
    }

    return `data:${contentType};base64,${Buffer.from(arrayBuffer).toString("base64")}`;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function hydratePdfImages(viewModel: NewsletterViewModel, fetchImpl: typeof fetch): Promise<NewsletterViewModel> {
  const allowedBases = [viewModel.chamberWebsiteUrl, viewModel.chamberEventsUrl];
  const [logoUrl, faviconUrl] = await Promise.all([
    fetchImageAsDataUrl(viewModel.branding.logoUrl, allowedBases, fetchImpl),
    fetchImageAsDataUrl(viewModel.branding.faviconUrl, allowedBases, fetchImpl)
  ]);

  return {
    ...viewModel,
    branding: {
      ...viewModel.branding,
      logoUrl,
      faviconUrl,
      symbolDataUrl: viewModel.branding.symbolDataUrl ?? faviconUrl
    }
  };
}

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontFamily: "Helvetica",
    backgroundColor: designTokens.colors.surface,
    color: designTokens.colors.ink
  },
  header: {
    border: `1 solid ${designTokens.colors.border}`,
    borderRadius: 12,
    padding: 20,
    backgroundColor: designTokens.colors.mutedSurface,
    marginBottom: 18
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 12
  },
  logo: {
    width: 72,
    height: 48,
    objectFit: "contain"
  },
  logoFallback: {
    width: 48,
    height: 48,
    borderRadius: 8,
    border: `1 solid ${designTokens.colors.border}`,
    alignItems: "center",
    justifyContent: "center"
  },
  eyebrow: {
    fontSize: 9,
    textTransform: "uppercase",
    color: designTokens.colors.slate,
    marginBottom: 6
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 6
  },
  intro: {
    fontSize: 10.5,
    lineHeight: 1.5,
    color: designTokens.colors.slate
  },
  metaCard: {
    border: `1 solid ${designTokens.colors.border}`,
    borderRadius: 12,
    padding: 10,
    backgroundColor: designTokens.colors.surface,
    width: "24%"
  },
  metaText: {
    fontSize: 10,
    color: designTokens.colors.slate
  },
  sectionTitle: {
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: designTokens.colors.slate,
    marginBottom: 8
  },
  eventCard: {
    border: `1 solid ${designTokens.colors.border}`,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4
  },
  eventMeta: {
    fontSize: 10.5,
    color: designTokens.colors.slate,
    marginBottom: 4
  },
  description: {
    fontSize: 10,
    lineHeight: 1.5,
    color: designTokens.colors.slate,
    marginTop: 6
  },
  footer: {
    borderTop: `1 solid ${designTokens.colors.border}`,
    marginTop: 20,
    paddingTop: 12,
    fontSize: 9.5,
    color: designTokens.colors.slate
  },
  link: {
    color: designTokens.colors.accent,
    textDecoration: "none"
  },
  emptyState: {
    border: `1 dashed ${designTokens.colors.border}`,
    borderRadius: 12,
    padding: 24,
    textAlign: "center",
    backgroundColor: designTokens.colors.mutedSurface
  },
  symbol: {
    width: 24,
    height: 24,
    marginBottom: 6
  },
  generatedAt: {
    fontSize: 8,
    color: designTokens.colors.slate,
    marginTop: 4
  }
});

function NewsletterPdfDocument({ viewModel }: { viewModel: NewsletterViewModel }) {
  return (
    <Document title={viewModel.newsletterTitle}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            {viewModel.branding.logoUrl ? (
              <Image src={viewModel.branding.logoUrl} style={styles.logo} />
            ) : (
              <View style={styles.logoFallback}>
                <Text>{viewModel.chamberName.slice(0, 1)}</Text>
              </View>
            )}

            {(viewModel.branding.symbolDataUrl) ? (
              <Image src={viewModel.branding.symbolDataUrl} style={styles.symbol} />
            ) : null}
          </View>

          <Text style={styles.eyebrow}>Chamber Events Newsletter</Text>
          <Text style={styles.title}>{viewModel.newsletterTitle}</Text>
          {viewModel.introLine ? <Text style={styles.intro}>{viewModel.introLine}</Text> : null}
        </View>

        {viewModel.totalEvents === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.title}>No upcoming public events found</Text>
            <Text style={styles.description}>{viewModel.emptyStateMessage}</Text>
          </View>
        ) : (
          viewModel.groupedEvents.map((group) => (
            <View key={group.dateKey} wrap={false}>
              <Text style={styles.sectionTitle}>{group.dateLabel}</Text>
              {group.events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventMeta}>
                    {event.dateLabel} • {event.timeLabel}
                  </Text>
                  {event.locationLabel ? <Text style={styles.eventMeta}>{event.locationLabel}</Text> : null}
                  {event.description ? <Text style={styles.description}>{event.description}</Text> : null}
                  {event.registrationUrl ? (
                    <Link src={event.registrationUrl} style={styles.link}>
                      Register / Learn More
                    </Link>
                  ) : null}
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.footer}>
          <Text>{viewModel.footerAttribution}</Text>
          <Text style={styles.generatedAt}>{viewModel.generatedAtLabel}</Text>
          <Link src={viewModel.chamberWebsiteUrl} style={styles.link}>
            {viewModel.chamberWebsiteUrl}
          </Link>
        </View>
      </Page>
    </Document>
  );
}

export async function renderNewsletterPdfStream(viewModel: NewsletterViewModel, fetchImpl: typeof fetch = fetch) {
  const hydrated = await hydratePdfImages(viewModel, fetchImpl);
  return renderToStream(<NewsletterPdfDocument viewModel={hydrated} />);
}
