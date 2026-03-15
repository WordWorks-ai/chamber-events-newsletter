// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ErrorAlert } from "@/components/error-alert";
import { LoadingState } from "@/components/loading-state";

describe("status components", () => {
  it("renders the loading state skeleton", () => {
    render(<LoadingState />);
    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });

  it("renders the error state and retry control", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorAlert message="Preview generation failed." onRetry={onRetry} />);

    expect(screen.getByText(/preview generation failed/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
