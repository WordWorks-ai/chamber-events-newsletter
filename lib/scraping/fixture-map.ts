import path from "node:path";
import { readFile } from "node:fs/promises";

const fixtureByUrl = new Map<string, string>([
  ["https://columbus.org/events/", "jsonld-columbus.html"],
  ["https://business.hilliardchamber.org/events/calendar", "growthzone-hilliard.html"],
  ["https://business.dublinchamber.org/events/calendar", "growthzone-dublin.html"],
  ["https://www.westervillechamber.com/events/", "generic-westerville.html"],
  ["https://www.delawareareachamber.com/calendar", "wordpress-delaware.html"]
]);

export async function readFixtureHtmlForUrl(url: string): Promise<string | null> {
  const fixtureName = fixtureByUrl.get(url);
  if (!fixtureName) {
    return null;
  }

  const filePath = path.join(process.cwd(), "tests", "fixtures", "chambers", fixtureName);
  return readFile(filePath, "utf8");
}
