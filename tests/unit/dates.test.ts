import { describe, expect, it } from "vitest";

import { formatTimeRange, parseInputDate } from "@/lib/utils/dates";

describe("date utilities", () => {
  it("parses common human-readable event dates", () => {
    const parsed = parseInputDate("March 24, 2026 7:30 AM", "America/New_York");
    expect(parsed?.toISOString()).toBe("2026-03-24T11:30:00.000Z");
  });

  it("formats time ranges with timezone labels", () => {
    expect(
      formatTimeRange("2026-03-24T11:30:00.000Z", "2026-03-24T13:00:00.000Z", "America/New_York", false)
    ).toBe("7:30 AM - 9:00 AM EDT");
  });

  it("formats all-day events clearly", () => {
    expect(formatTimeRange("2026-03-24T04:00:00.000Z", null, "America/New_York", true)).toBe("All day");
  });
});
