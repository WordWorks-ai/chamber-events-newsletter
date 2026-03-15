import { createHash } from "node:crypto";

import { readFixtureHtmlForUrl } from "@/lib/scraping/fixture-map";
import { isAllowedSameSiteUrl } from "@/lib/scraping/branding";
import { fail, ok, type Result } from "@/lib/utils/result";

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_BYTES = 1_000_000;
const DEFAULT_RETRIES = 2;
const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

export interface FetchHtmlInput {
  url: string;
  allowedBases: string[];
  timeoutMs?: number;
  maxBytes?: number;
  retries?: number;
}

export interface FetchHtmlOutput {
  html: string;
  finalUrl: string;
  contentType: string;
  sourceHash: string;
}

async function readBodyWithLimit(response: Response, maxBytes: number): Promise<string> {
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentLength > maxBytes) {
    throw new Error(`Response exceeded ${maxBytes} bytes.`);
  }

  if (!response.body) {
    return response.text();
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  while (true) {
    const chunk = await reader.read();
    if (chunk.done) {
      break;
    }

    total += chunk.value.byteLength;
    if (total > maxBytes) {
      throw new Error(`Response exceeded ${maxBytes} bytes.`);
    }

    chunks.push(chunk.value);
  }

  const body = Buffer.concat(chunks);
  return body.toString("utf8");
}

export async function fetchHtml(input: FetchHtmlInput, fetchImpl: typeof fetch = fetch): Promise<Result<FetchHtmlOutput>> {
  if (!isAllowedSameSiteUrl(input.url, input.allowedBases)) {
    return fail("UNSAFE_TARGET_URL", "The requested events page is not allowed for this chamber.", 400, {
      url: input.url
    });
  }

  if (process.env.SCRAPER_FIXTURE_MODE === "true") {
    const fixtureHtml = await readFixtureHtmlForUrl(input.url);
    if (fixtureHtml) {
      return ok({
        html: fixtureHtml,
        finalUrl: input.url,
        contentType: "text/html",
        sourceHash: createHash("sha256").update(fixtureHtml).digest("hex")
      });
    }
  }

  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const maxBytes = input.maxBytes ?? DEFAULT_MAX_BYTES;
  const retries = input.retries ?? DEFAULT_RETRIES;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImpl(input.url, {
        headers: {
          "User-Agent": process.env.SCRAPER_USER_AGENT ?? "ChamberEventsNewsletter/1.0 (+https://example.gov)",
          Accept: "text/html,application/xhtml+xml"
        },
        redirect: "follow",
        signal: controller.signal
      });

      if (!response.ok) {
        if (attempt < retries && RETRYABLE_STATUS.has(response.status)) {
          continue;
        }

        return fail("FETCH_FAILED", `Unable to reach the chamber events page (HTTP ${response.status}).`, response.status, {
          url: input.url
        });
      }

      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
        return fail("INVALID_CONTENT_TYPE", "The chamber events page did not return HTML.", 502, {
          contentType
        });
      }

      const html = await readBodyWithLimit(response, maxBytes);
      const finalUrl = response.url || input.url;

      if (!isAllowedSameSiteUrl(finalUrl, input.allowedBases)) {
        return fail("UNSAFE_REDIRECT", "The chamber events page redirected to an unsupported domain.", 400, {
          finalUrl
        });
      }

      return ok({
        html,
        finalUrl,
        contentType,
        sourceHash: createHash("sha256").update(html).digest("hex")
      });
    } catch (error) {
      if (attempt < retries) {
        continue;
      }

      return fail("FETCH_FAILED", "The chamber events page could not be reached. Please try again shortly.", 502, {
        cause: error instanceof Error ? error.message : String(error),
        url: input.url
      });
    } finally {
      clearTimeout(timeout);
    }
  }

  return fail("FETCH_FAILED", "The chamber events page could not be reached.", 502, { url: input.url });
}
