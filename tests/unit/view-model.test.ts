import { describe, expect, it } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";
import { buildNewsletterViewModel } from "@/lib/newsletter/view-model";
import { makeBranding, makeNormalizedEvents } from "@/tests/helpers";

describe("buildNewsletterViewModel", () => {
  it("maps normalized events into grouped newsletter sections", () => {
    const viewModel = buildNewsletterViewModel({
      chamber: seededChambers[0],
      branding: makeBranding(),
      events: makeNormalizedEvents(),
      request: {
        chamberId: seededChambers[0].id,
        forceRefresh: false,
        customTitle: "Central Ohio Chamber Digest",
        introLine: "Upcoming events from the public chamber calendar.",
        uploadedGraphic: {
          fileName: "symbol.svg",
          mimeType: "image/svg+xml",
          dataUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E",
          sizeBytes: 64
        }
      },
      now: new Date("2026-03-14T12:00:00.000Z")
    });

    expect(viewModel.newsletterTitle).toBe("Central Ohio Chamber Digest");
    expect(viewModel.groupedEvents).toHaveLength(2);
    expect(viewModel.branding.symbolDataUrl).toContain("data:image/svg+xml");
    expect(viewModel.groupedEvents[0]?.events[0]?.locationLabel).toContain("Boardroom");
  });
});
