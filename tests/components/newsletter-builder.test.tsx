// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { NewsletterBuilder } from "@/components/newsletter-builder";
import { seededChambers } from "@/lib/db/demo-data";
import { makePreviewResponse } from "@/tests/helpers";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("NewsletterBuilder", () => {
  it("loads chambers and generates a preview", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(seededChambers), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(makePreviewResponse()), { status: 200 }));

    vi.stubGlobal("fetch", fetchMock);

    render(<NewsletterBuilder />);

    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /^process$/i }));

    await waitFor(() => expect(screen.getByText(/preview ready/i)).toBeInTheDocument());
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("shows an inline error when preview generation fails", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(seededChambers), { status: 200 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ok: false,
            error: {
              message: "Unable to generate the newsletter preview."
            }
          }),
          { status: 502 }
        )
      );

    vi.stubGlobal("fetch", fetchMock);

    render(<NewsletterBuilder />);

    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /^process$/i }));

    await waitFor(() => expect(screen.getByText(/something went wrong/i)).toBeInTheDocument());
    expect(screen.getByText(/unable to generate the newsletter preview/i)).toBeInTheDocument();
  });

  it("downloads a PDF after a preview is generated", async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(seededChambers), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify(makePreviewResponse()), { status: 200 }))
      .mockResolvedValueOnce(new Response("%PDF-test", { status: 200, headers: { "content-type": "application/pdf" } }));

    const createObjectURL = vi.fn().mockReturnValue("blob:newsletter");
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL
    });

    const click = vi.fn();
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        Object.assign(element, { click });
      }
      return element;
    }) as typeof document.createElement);

    render(<NewsletterBuilder />);

    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /^process$/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: /download pdf/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
    expect(fetchMock.mock.calls[2]?.[0]).toBe("/api/newsletter/pdf");
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(click).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
  });
});
