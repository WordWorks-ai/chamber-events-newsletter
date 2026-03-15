import { getSupabaseServerClient, hasSupabaseConfig } from "@/lib/db/client";
import { seededChambers } from "@/lib/db/demo-data";
import type { Database, Json } from "@/lib/db/database.types";

async function main() {
  if (!hasSupabaseConfig()) {
    throw new Error("Supabase configuration is required to seed chambers.");
  }

  const client = getSupabaseServerClient();
  const payload: Array<Database["public"]["Tables"]["chambers"]["Insert"]> = seededChambers.map((chamber) => ({
    id: chamber.id,
    slug: chamber.slug,
    name: chamber.name,
    website_url: chamber.websiteUrl,
    events_url: chamber.eventsUrl,
    platform_hint: chamber.platformHint,
    active: chamber.active,
    default_timezone: chamber.defaultTimezone,
    logo_url: chamber.logoUrl,
    favicon_url: chamber.faviconUrl,
    theme_color: chamber.themeColor,
    metadata: chamber.metadata as Json
  }));

  const response = await client.from("chambers").upsert(payload, { onConflict: "slug" });

  if (response.error) {
    throw response.error;
  }

  console.log(`Seeded ${payload.length} chambers.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
