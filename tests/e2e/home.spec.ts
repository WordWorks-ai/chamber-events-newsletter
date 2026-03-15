import { expect, test } from "@playwright/test";

test("homepage loads, processes a seeded chamber, previews, and downloads a PDF", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /deterministic chamber event newsletters/i })).toBeVisible();

  await page.getByRole("combobox").selectOption({ label: "Columbus Chamber of Commerce" });
  await page.getByRole("button", { name: /^process$/i }).click();

  await expect(page.getByText(/preview ready/i)).toBeVisible();
  await expect(page.getByText(/small business breakfast briefing/i)).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /download pdf/i }).click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toContain("newsletter");
});

test("shows graceful feedback when no events are returned", async ({ page }) => {
  await page.route("**/api/newsletter/preview", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ...{
          chamber: {
            id: "56ac9bf4-8d74-48e8-8ff8-9f2948d7d9f2",
            slug: "columbus-chamber",
            name: "Columbus Chamber of Commerce",
            websiteUrl: "https://columbus.org",
            eventsUrl: "https://columbus.org/events/",
            platformHint: "jsonld-event-adapter",
            active: true,
            defaultTimezone: "America/New_York",
            logoUrl: null,
            faviconUrl: null,
            themeColor: null,
            metadata: {},
            createdAt: "2026-03-14T12:00:00.000Z",
            updatedAt: "2026-03-14T12:00:00.000Z"
          },
          branding: {
            logoUrl: null,
            faviconUrl: null,
            themeColor: "#113456",
            siteName: "Columbus Chamber",
            sourceWebsiteUrl: "https://columbus.org",
            sourceEventsUrl: "https://columbus.org/events/",
            extractedFrom: "meta"
          },
          events: [],
          viewModel: {
            chamberId: "56ac9bf4-8d74-48e8-8ff8-9f2948d7d9f2",
            chamberName: "Columbus Chamber of Commerce",
            chamberWebsiteUrl: "https://columbus.org",
            chamberEventsUrl: "https://columbus.org/events/",
            newsletterTitle: "Columbus Chamber Events Newsletter",
            introLine: "Upcoming public programs and chamber events.",
            generatedAtLabel: "March 14, 2026 at 8:00 AM EDT",
            generatedAtIso: "2026-03-14T12:00:00.000Z",
            footerAttribution: "Source: Columbus Chamber public events calendar",
            emptyStateMessage: "No upcoming public events were found on the selected chamber page.",
            branding: {
              logoUrl: null,
              faviconUrl: null,
              themeColor: "#113456",
              symbolDataUrl: null
            },
            groupedEvents: [],
            totalEvents: 0
          },
          cache: {
            hit: false,
            expiresAt: "2026-03-14T18:00:00.000Z"
          },
          runId: "911f9242-a4c8-4748-9d7b-b638e3d60f5d"
        }
      })
    });
  });

  await page.goto("/");
  await page.getByRole("combobox").selectOption({ label: "Columbus Chamber of Commerce" });
  await page.getByRole("button", { name: /^process$/i }).click();

  await expect(page.getByText(/no upcoming public events found/i)).toBeVisible();
});

test("shows a friendly inline error when preview generation fails", async ({ page }) => {
  await page.route("**/api/newsletter/preview", async (route) => {
    await route.fulfill({
      status: 502,
      contentType: "application/json",
      body: JSON.stringify({
        ok: false,
        error: {
          code: "FETCH_FAILED",
          message: "The chamber events page could not be reached. Please try again shortly."
        }
      })
    });
  });

  await page.goto("/");
  await page.getByRole("combobox").selectOption({ label: "Columbus Chamber of Commerce" });
  await page.getByRole("button", { name: /^process$/i }).click();

  await expect(page.getByText(/something went wrong/i)).toBeVisible();
  await expect(page.getByText(/could not be reached/i)).toBeVisible();
});
