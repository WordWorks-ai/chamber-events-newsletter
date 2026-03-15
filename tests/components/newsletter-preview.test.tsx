// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { NewsletterPreview } from "@/components/newsletter-preview";
import { makePreviewResponse } from "@/tests/helpers";

describe("NewsletterPreview", () => {
  it("renders the generated preview with event content", () => {
    render(<NewsletterPreview isDownloading={false} onDownload={vi.fn()} preview={makePreviewResponse()} />);

    expect(screen.getByText(/preview ready/i)).toBeInTheDocument();
    expect(screen.getByText(/small business breakfast briefing/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeEnabled();
  });

  it("renders the empty-state newsletter version", () => {
    const preview = makePreviewResponse({
      events: [],
      viewModel: {
        ...makePreviewResponse().viewModel,
        groupedEvents: [],
        totalEvents: 0
      }
    });

    render(<NewsletterPreview isDownloading={false} onDownload={vi.fn()} preview={preview} />);
    expect(screen.getByText(/no upcoming public events found/i)).toBeInTheDocument();
  });

  it("shows a disabled download button while the PDF is being prepared", async () => {
    const user = userEvent.setup();
    const onDownload = vi.fn();

    render(<NewsletterPreview isDownloading={true} onDownload={onDownload} preview={makePreviewResponse()} />);

    const button = screen.getByRole("button", { name: /preparing pdf/i });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onDownload).not.toHaveBeenCalled();
  });
});
