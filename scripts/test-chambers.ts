import { seededChambers } from "../lib/db/demo-data";
import {
  newsletterPreviewResponseSchema,
  routeErrorEnvelopeSchema
} from "../lib/utils/validation";

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main() {
  const results: {
    slug: string;
    name: string;
    status: string;
    events: number;
    error?: string;
  }[] = [];

  for (const chamber of seededChambers) {
    process.stdout.write(`Testing ${chamber.slug}...`);
    try {
      const res = await fetch(
        "https://chamber-events-newsletter.vercel.app/api/newsletter/preview",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chamberId: chamber.id })
        }
      );
      if (res.ok) {
        const data = newsletterPreviewResponseSchema.parse(await res.json());
        const count = data.events.length;
        results.push({
          slug: chamber.slug,
          name: chamber.name,
          status: "ok",
          events: count
        });
        console.log(` ✓ ${count} events`);
      } else {
        const body: unknown = await res.json().catch(() => null);
        const parsed = routeErrorEnvelopeSchema.safeParse(body);
        const msg = parsed.success
          ? parsed.data.error.message
          : String(res.status);
        results.push({
          slug: chamber.slug,
          name: chamber.name,
          status: "error",
          events: 0,
          error: msg
        });
        console.log(` ✗ ${msg}`);
      }
    } catch (error: unknown) {
      const message = errorMessage(error);
      results.push({
        slug: chamber.slug,
        name: chamber.name,
        status: "error",
        events: 0,
        error: message
      });
      console.log(` ✗ ${message}`);
    }
    await new Promise((r) => setTimeout(r, 800));
  }

  const working = results.filter((r) => r.status === "ok");
  const broken = results.filter((r) => r.status === "error");
  const empty = working.filter((r) => r.events === 0);
  const withEvents = working.filter((r) => r.events > 0);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${results.length}`);
  console.log(`Working with events: ${withEvents.length}`);
  console.log(`Working but empty: ${empty.length}`);
  console.log(`Broken: ${broken.length}`);

  if (broken.length > 0) {
    console.log(`\nBROKEN CHAMBERS:`);
    for (const r of broken) console.log(`  ${r.slug}: ${r.error}`);
  }
  if (empty.length > 0) {
    console.log(`\nEMPTY CHAMBERS:`);
    for (const r of empty) console.log(`  ${r.slug}`);
  }
}

void main();
