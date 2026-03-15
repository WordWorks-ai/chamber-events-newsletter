import { seededChambers } from "../lib/db/demo-data";

async function main() {
  const results: { slug: string; name: string; status: string; events: number; error?: string }[] = [];

  for (const chamber of seededChambers) {
    process.stdout.write(`Testing ${chamber.slug}...`);
    try {
      const res = await fetch("https://chamber-events-newsletter.vercel.app/api/newsletter/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chamberId: chamber.id })
      });
      if (res.ok) {
        const data = await res.json();
        const count = data.events?.length ?? 0;
        results.push({ slug: chamber.slug, name: chamber.name, status: "ok", events: count });
        console.log(` ✓ ${count} events`);
      } else {
        const body = await res.json().catch(() => ({})) as Record<string, any>;
        const msg = body?.error?.message ?? String(res.status);
        results.push({ slug: chamber.slug, name: chamber.name, status: "error", events: 0, error: msg });
        console.log(` ✗ ${msg}`);
      }
    } catch (e: any) {
      results.push({ slug: chamber.slug, name: chamber.name, status: "error", events: 0, error: e.message });
      console.log(` ✗ ${e.message}`);
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

main();
