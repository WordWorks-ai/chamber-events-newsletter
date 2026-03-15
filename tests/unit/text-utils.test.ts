import { describe, expect, it } from "vitest";

import { createStableHash } from "@/lib/utils/hashing";
import { stripHtml, toSnippet } from "@/lib/utils/text";

describe("text and hashing utilities", () => {
  it("strips HTML safely", () => {
    expect(stripHtml("<p>Hello <strong>world</strong></p>")).toBe("Hello world");
    expect(toSnippet("<p>Hello world</p>", 20)).toBe("Hello world");
  });

  it("creates deterministic stable hashes", () => {
    expect(createStableHash("Event", "2026-03-21")).toBe(createStableHash("Event", "2026-03-21"));
  });
});
