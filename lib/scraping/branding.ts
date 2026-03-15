import * as cheerio from "cheerio";

import type { BrandingAsset, Chamber } from "@/lib/utils/validation";

function getRegistrableDomain(hostname: string): string {
  const clean = hostname.replace(/^www\./i, "");
  const parts = clean.split(".").filter(Boolean);
  if (parts.length <= 2) {
    return clean;
  }

  return parts.slice(-2).join(".");
}

export function isAllowedSameSiteUrl(targetUrl: string, baseUrls: string[]): boolean {
  if (targetUrl.startsWith("data:")) {
    return true;
  }

  try {
    const target = new URL(targetUrl);
    if (!["http:", "https:"].includes(target.protocol)) {
      return false;
    }

    return baseUrls.some((baseUrl) => {
      const base = new URL(baseUrl);
      return getRegistrableDomain(target.hostname) === getRegistrableDomain(base.hostname);
    });
  } catch {
    return false;
  }
}

export function toAbsoluteUrl(candidate: string | null | undefined, baseUrl: string, allowedBases: string[]): string | null {
  if (!candidate) {
    return null;
  }

  if (candidate.startsWith("data:")) {
    return candidate;
  }

  try {
    const resolved = new URL(candidate, baseUrl).toString();
    return isAllowedSameSiteUrl(resolved, allowedBases) ? resolved : null;
  } catch {
    return null;
  }
}

export function extractBrandingFromHtml(chamber: Chamber, html: string, pageUrl: string): BrandingAsset {
  const $ = cheerio.load(html);
  const allowedBases = [chamber.websiteUrl, chamber.eventsUrl];
  const siteName =
    $('meta[property="og:site_name"]').attr("content")?.trim() ||
    $("title").first().text().trim() ||
    chamber.name;

  const explicitLogo = toAbsoluteUrl(chamber.logoUrl, pageUrl, allowedBases);
  const explicitFavicon = toAbsoluteUrl(chamber.faviconUrl, pageUrl, allowedBases);
  const metaLogo = toAbsoluteUrl($('meta[property="og:image"]').attr("content"), pageUrl, allowedBases);
  const headerLogo = toAbsoluteUrl(
    $('header img, .site-logo img, img[class*="logo"], img[alt*="logo" i]').first().attr("src"),
    pageUrl,
    allowedBases
  );
  const favicon = toAbsoluteUrl(
    $('link[rel*="icon"]').first().attr("href") ?? $('link[rel="shortcut icon"]').first().attr("href"),
    pageUrl,
    allowedBases
  );
  const themeColor =
    chamber.themeColor ??
    $('meta[name="theme-color"]').attr("content")?.trim() ??
    $('meta[name="msapplication-TileColor"]').attr("content")?.trim() ??
    null;

  const extractedFrom: BrandingAsset["extractedFrom"] = chamber.logoUrl || chamber.faviconUrl || chamber.themeColor ? "record" : metaLogo ? "meta" : headerLogo || favicon ? "heuristic" : "fallback";

  return {
    logoUrl: explicitLogo ?? metaLogo ?? headerLogo ?? null,
    faviconUrl: explicitFavicon ?? favicon ?? null,
    themeColor,
    siteName: siteName || null,
    sourceWebsiteUrl: chamber.websiteUrl,
    sourceEventsUrl: chamber.eventsUrl,
    extractedFrom
  };
}
