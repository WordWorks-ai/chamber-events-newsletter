// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { seededChambers } from "@/lib/db/demo-data";

vi.mock("next/font/google", () => ({
  Inter: () => ({
    className: "font-inter"
  })
}));

describe("page shell", () => {
  it("renders the main landing page copy", async () => {
    const { default: HomePage } = await import("@/app/page");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(seededChambers), { status: 200 })));
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /deterministic chamber event newsletters/i
      })
    ).toBeInTheDocument();
  });

  it("wraps children in the root layout", async () => {
    const { default: RootLayout } = await import("@/app/layout");
    render(RootLayout({ children: <div>Child content</div> }));
    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
