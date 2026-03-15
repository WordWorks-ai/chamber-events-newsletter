import "server-only";

import { addHours } from "date-fns";

import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/db/client";
import { seededChambers } from "@/lib/db/demo-data";
import type { Database, Json } from "@/lib/db/database.types";
import { brandingAssetSchema, chamberSchema, normalizedEventSchema, type BrandingAsset, type Chamber, type NewsletterRequest, type NormalizedEvent } from "@/lib/utils/validation";

export interface ScrapeCacheEntry {
  chamberId: string;
  cacheKey: string;
  normalizedEvents: NormalizedEvent[];
  branding: BrandingAsset;
  fetchedAt: string;
  expiresAt: string;
  sourceHash: string | null;
}

export interface NewsletterRunInput {
  chamberId: string;
  status: string;
  eventCount: number;
  requestPayload: NewsletterRequest;
  outputMeta?: Record<string, Json>;
}

export interface ChamberRepository {
  kind: "supabase" | "memory";
  listActiveChambers(): Promise<Chamber[]>;
  getChamberById(id: string): Promise<Chamber | null>;
  getScrapeCache(chamberId: string, cacheKey: string): Promise<ScrapeCacheEntry | null>;
  upsertScrapeCache(entry: ScrapeCacheEntry): Promise<void>;
  insertNewsletterRun(input: NewsletterRunInput): Promise<string>;
}

function mapChamberRow(row: Database["public"]["Tables"]["chambers"]["Row"]): Chamber {
  return chamberSchema.parse({
    id: row.id,
    slug: row.slug,
    name: row.name,
    websiteUrl: row.website_url,
    eventsUrl: row.events_url,
    platformHint: row.platform_hint,
    active: row.active,
    defaultTimezone: row.default_timezone,
    logoUrl: row.logo_url,
    faviconUrl: row.favicon_url,
    themeColor: row.theme_color,
    metadata: row.metadata,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  });
}

function mapCacheRow(row: Database["public"]["Tables"]["scrape_cache"]["Row"]): ScrapeCacheEntry {
  return {
    chamberId: row.chamber_id,
    cacheKey: row.cache_key,
    normalizedEvents: normalizedEventSchema.array().parse(row.normalized_events),
    branding: brandingAssetSchema.parse(row.branding),
    fetchedAt: row.fetched_at,
    expiresAt: row.expires_at,
    sourceHash: row.source_hash
  };
}

export class SupabaseChamberRepository implements ChamberRepository {
  readonly kind = "supabase" as const;

  async listActiveChambers(): Promise<Chamber[]> {
    const client = getSupabaseServerClient();
    const response = await client
      .from("chambers")
      .select("*")
      .eq("active", true)
      .order("name", { ascending: true });

    if (response.error) {
      throw response.error;
    }

    const rows = response.data as Database["public"]["Tables"]["chambers"]["Row"][];
    return rows.map(mapChamberRow);
  }

  async getChamberById(id: string): Promise<Chamber | null> {
    const client = getSupabaseServerClient();
    const response = await client.from("chambers").select("*").eq("id", id).maybeSingle();

    if (response.error) {
      throw response.error;
    }

    return response.data ? mapChamberRow(response.data as Database["public"]["Tables"]["chambers"]["Row"]) : null;
  }

  async getScrapeCache(chamberId: string, cacheKey: string): Promise<ScrapeCacheEntry | null> {
    const client = getSupabaseServerClient();
    const response = await client
      .from("scrape_cache")
      .select("*")
      .eq("chamber_id", chamberId)
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (response.error) {
      throw response.error;
    }

    return response.data ? mapCacheRow(response.data as Database["public"]["Tables"]["scrape_cache"]["Row"]) : null;
  }

  async upsertScrapeCache(entry: ScrapeCacheEntry): Promise<void> {
    const client = getSupabaseServerClient();
    const payload: Database["public"]["Tables"]["scrape_cache"]["Insert"] = {
      chamber_id: entry.chamberId,
      cache_key: entry.cacheKey,
      normalized_events: entry.normalizedEvents as unknown as Json,
      branding: entry.branding as unknown as Json,
      fetched_at: entry.fetchedAt,
      expires_at: entry.expiresAt,
      source_hash: entry.sourceHash
    };
    const response = await client.from("scrape_cache").upsert(payload);

    if (response.error) {
      throw response.error;
    }
  }

  async insertNewsletterRun(input: NewsletterRunInput): Promise<string> {
    const client = getSupabaseServerClient();
    const payload: Database["public"]["Tables"]["newsletter_runs"]["Insert"] = {
      chamber_id: input.chamberId,
      status: input.status,
      event_count: input.eventCount,
      request_payload: input.requestPayload as unknown as Json,
      output_meta: input.outputMeta ?? {}
    };
    const response = await client
      .from("newsletter_runs")
      .insert(payload)
      .select("id")
      .single();

    if (response.error) {
      throw response.error;
    }

    const inserted = response.data as { id: string };
    return inserted.id;
  }
}

type MemoryStore = {
  cache: Map<string, ScrapeCacheEntry>;
  runs: Array<NewsletterRunInput & { id: string; createdAt: string }>;
};

declare global {
  var __chamberEventsMemoryStore: MemoryStore | undefined;
}

function getMemoryStore(): MemoryStore {
  if (!globalThis.__chamberEventsMemoryStore) {
    globalThis.__chamberEventsMemoryStore = {
      cache: new Map(),
      runs: []
    };
  }

  return globalThis.__chamberEventsMemoryStore;
}

export class MemoryChamberRepository implements ChamberRepository {
  readonly kind = "memory" as const;

  listActiveChambers(): Promise<Chamber[]> {
    return Promise.resolve(
      seededChambers.filter((chamber) => chamber.active).sort((left, right) => left.name.localeCompare(right.name))
    );
  }

  getChamberById(id: string): Promise<Chamber | null> {
    return Promise.resolve(seededChambers.find((chamber) => chamber.id === id) ?? null);
  }

  getScrapeCache(chamberId: string, cacheKey: string): Promise<ScrapeCacheEntry | null> {
    return Promise.resolve(getMemoryStore().cache.get(`${chamberId}:${cacheKey}`) ?? null);
  }

  upsertScrapeCache(entry: ScrapeCacheEntry): Promise<void> {
    getMemoryStore().cache.set(`${entry.chamberId}:${entry.cacheKey}`, entry);
    return Promise.resolve();
  }

  insertNewsletterRun(input: NewsletterRunInput): Promise<string> {
    const id = crypto.randomUUID();
    getMemoryStore().runs.push({
      ...input,
      id,
      createdAt: addHours(new Date(), 0).toISOString()
    });
    return Promise.resolve(id);
  }
}

export function createChamberRepository(): ChamberRepository {
  return hasSupabaseConfig() ? new SupabaseChamberRepository() : new MemoryChamberRepository();
}
