// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";

vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "font-inter"
  })
}));

describe("page shell", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the main landing page copy", async () => {
    const { default: HomePage } = await import("@/app/page");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(seededChambers), { status: 200 })
        )
    );
    render(<HomePage />);

    expect(
      await screen.findByRole("heading", {
        name: /^chamber event newsletters/i
      })
    ).toBeInTheDocument();
  });

  it("wraps children in the root layout", async () => {
    const { default: RootLayout } = await import("@/app/layout");
    render(RootLayout({ children: <div>Child content</div> }));
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });

  it("sets metadataBase only when APP_URL is defined", async () => {
    vi.stubEnv("APP_URL", undefined);
    vi.resetModules();
    const withoutAppUrl = await import("@/app/layout");
    expect(withoutAppUrl.metadata.metadataBase).toBeUndefined();

    vi.stubEnv("APP_URL", "https://newsletter.example.com");
    vi.resetModules();
    const withAppUrl = await import("@/app/layout");
    expect(withAppUrl.metadata.metadataBase?.toString()).toBe(
      "https://newsletter.example.com/"
    );
  });
});
