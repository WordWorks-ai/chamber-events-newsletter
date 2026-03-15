import { createHash } from "node:crypto";

export function createStableHash(...parts: Array<string | number | null | undefined>): string {
  const normalized = parts
    .map((part) => (part == null ? "" : String(part).trim().toLowerCase()))
    .join("|");

  return createHash("sha256").update(normalized).digest("hex").slice(0, 20);
}
